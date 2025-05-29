<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionT2Model } from '@/models/question/QuestionT2Model';
import QuestionEdit from './QuestionEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
import { useGlobalStore } from "@/stores/globalStore";
import { UploadOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadFile } from 'ant-design-vue';
import { C_BQuestionT2Q } from '@/entitys/question/BQuestionT2Q';
import { C_BQuestionT2A } from '@/entitys/question/BQuestionT2A';
import { C_BQuestionT2 } from '@/entitys/question/BQuestionT2';
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const baseURL = import.meta.env.VITE_API_BASE_URL;
const globalStore = useGlobalStore();
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionT2Model>(new QuestionT2Model())
const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器
watch(() => props.questionId, async (newValue, oldValue) => {

})

//#region 获取信息

const GetQuestionInfo = async () => {
  if (!props.questionId || props.questionId == "") {
    question.value.questionInfo.questionCode = props.questionCode;
    question.value.questionInfo.questionnaireId = props.questionnaireId;
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.T2);
    question.value.answerInfo = new C_BQuestionT2({
      number1: 5,
      number2: 3,
    })
    _.times(8, (row) => {
      question.value.bQuestionT2QList.push(new C_BQuestionT2Q({ questionSort: row + 1 }))
    })
    _.times(8, (row) => {
      _.times(4, (column) => {
        question.value.bQuestionT2AList.push(new C_BQuestionT2A({ questionSort: row + 1, answerSort: String.fromCharCode(64 + column + 1) }))
      })
    })
    return;
  }
  try {
    const response = await apiClient.post(`/Questionnaire/GetQuestion${props.questionCode}/` + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      question.value = response.data;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const formRef = ref();
const loading = ref<boolean>(false);
const SaveQuestion = async () => {
  console.log(question.value)
  loading.value = true;
  try {
    if (formRef.value) {
      await formRef.value.validate();
    }
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const data: any = {};
    fileList.value.flat().forEach((file, index) => {
      data[file.fileName ?? "file"] = file.originFileObj;
    });
    const response = await apiClient.post('/Questionnaire/SaveQuestionT2', question.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      const response1 = await apiClient.postForm('/Questionnaire/SaveQuestionAudio/' + response.data, data)
      console.log('响应:', response)
      if (response1.status == 1) {
        emit("saveSuccess", response.data)
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
  loading.value = false;
}

onMounted(() => {
  GetQuestionInfo().then(() => {
    _.times(8, (row) => {
      checkAudioUrlExists(row + 1 + '.mp3').then((exists) => {
        hasAudio.value[row] = exists;
      })
    })
  });
})

//#endregion

//#region 音频文件
const fileList = ref<UploadFile[][]>([[], [], [], [], [], [], [], []]);

const handleRemove = (file: any, questionIndex: number) => {
  if (!fileList.value[questionIndex]) return;
  const index = fileList.value[questionIndex].indexOf(file);
  const newFileList = fileList.value[questionIndex].slice();
  newFileList.splice(index, 1);
  fileList.value[questionIndex] = newFileList;
  if (audioList.value) {
    audioList.value[questionIndex].src = GetAudioUrl(questionIndex + 1 + '.mp3');
    audioList.value[questionIndex].load(); // 重新加载新的音频
    isUploadAudio.value[questionIndex] = false;
  }
};

// 文件验证
const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isAudio = file.type === 'audio/mpeg';
  if (!isAudio) {
    message.error('请选择音频文件上传!');
    return;
  }
  return false;
};

// 处理文件上传
const handleChange = async (file: any, questionIndex: number) => {
  if (audioList.value) {
    let fileURL = URL.createObjectURL(file.fileList[0].originFileObj);
    audioList.value[questionIndex].src = fileURL;
    audioList.value[questionIndex].load(); // 重新加载新的音频
    isUploadAudio.value[questionIndex] = true;
  }
  file.fileList[0].fileName = questionIndex + 1 + '.mp3';
  fileList.value[questionIndex] = [...fileList.value[questionIndex], ...file.fileList]; // 更新文件列表
};
const GetAudioUrl = (fileName: string) => {
  return `${baseURL}/Static/Audios/${props.questionId}/${fileName}`
}
const checkAudioUrlExists = async (fileName: string): Promise<boolean> => {
  const url = GetAudioUrl(fileName);
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};
const audioList = ref<any>(null);
const hasAudio = ref<Boolean[]>([])
const isUploadAudio = ref<Boolean[]>([])
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-1/3 h-full">
      <QuestionEdit :_question-info="question.questionInfo" @changed="(data) => { question.questionInfo = data; }">
      </QuestionEdit>
    </div>
    <div class="w-2/3 h-full flex flex-col">
      <div class="w-full flex-auto overflow-y-scroll">
        <div ref="tableContainer" class="w-full h-full flex flex-col pl-8 pr-4">
          <a-form ref="formRef" :model="question" :layout="'horizontal'"
            :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
            <template v-for="(qusetionItem, questionIndex) in question.bQuestionT2QList">
              <a-row v-if="qusetionItem.questionSort == 1 || qusetionItem.questionSort == 6">
                <span class="pb-4 text-2xl">{{ qusetionItem.questionSort == 1 ? '找不同' : qusetionItem.questionSort == 6 ?
                  '找相同' :
                  '' }}</span>
              </a-row>
              <a-row>
                <a-col :span="13">
                  <a-form-item :label="`题目 ${qusetionItem.questionSort}`">
                    <a-input v-model:value="qusetionItem.questionQ1" size="large" />
                    <a-input v-model:value="qusetionItem.questionQ2" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :span="11">
                  <a-form-item :label="`音频文件`">
                    <a-space :size="20">
                      <a-upload :file-list="fileList[questionIndex]" :maxCount="1" :before-upload="beforeUpload"
                        @remove="(file: any) => { handleRemove(file, questionIndex) }"
                        @change="(file: any) => { handleChange(file, questionIndex) }">
                        <a-button v-if="fileList[questionIndex].length < 1" size="large"
                          style="display: flex; align-items: center;">
                          <upload-outlined></upload-outlined>
                          点击上传
                        </a-button>
                      </a-upload>
                      <audio v-show="isUploadAudio[questionIndex] || hasAudio[questionIndex]" class="w-66"
                        ref="audioList" :src="GetAudioUrl(qusetionItem.questionSort + '.mp3')" controls
                        controlsList="nodownload noplaybackrate"></audio>
                    </a-space>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col
                  v-for="answerItem in question.bQuestionT2AList.filter(x => x.questionSort == qusetionItem.questionSort)"
                  :span="6">
                  <a-form-item :colon="false" :label="`选项 ${answerItem.answerSort}`">
                    <div class="flex flex-row items-end">
                      <a-space>
                        <a-input v-model:value="answerItem.answer" size="large" />
                        <a-switch v-model:checked="answerItem.isTrue" checked-children="是" un-checked-children="否" />
                      </a-space>
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
          </a-form>
        </div>
      </div>
      <div class="w-full h-20 flex felx-row items-center justify-end">
        <a-space>
          <a-button type="primary" size="large" @click="SaveQuestion">保存</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
