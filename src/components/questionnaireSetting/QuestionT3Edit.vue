<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionT3Model } from '@/models/question/QuestionT3Model';
import QuestionEdit from './QuestionEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
import { useGlobalStore } from "@/stores/globalStore";
import { UploadOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadFile } from 'ant-design-vue';
import { C_BQuestionT3 } from '@/entitys/question/BQuestionT3';
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const globalStore = useGlobalStore();
const baseURL = globalStore.config.baseURL;
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionT3Model>(new QuestionT3Model())
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
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.T3);

    _.times(10, (row) => {
      question.value.questionList.push(new C_BQuestionT3({ questionType: true, questionSort: 1, level: row + 1 }))
      question.value.questionList.push(new C_BQuestionT3({ questionType: true, questionSort: 2, level: row + 1 }))
    })
    _.times(7, (row) => {
      question.value.questionList.push(new C_BQuestionT3({ questionType: false, questionSort: 1, level: row + 1 }))
      question.value.questionList.push(new C_BQuestionT3({ questionType: false, questionSort: 2, level: row + 1 }))
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
    const response = await apiClient.post('/Questionnaire/SaveQuestionT3', question.value)
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
    _.times(10, (row) => {
      checkAudioUrlExists(`顺背数测试1（${row + 1}级）.mp3`).then((exists) => {
        hasAudio.value[row * 2] = exists;
      })
      checkAudioUrlExists(`顺背数测试2（${row + 1}级）.mp3`).then((exists) => {
        hasAudio.value[row * 2 + 1] = exists;
      })
    })
    _.times(7, (row) => {
      checkAudioUrlExists(`倒背数测试1（${row + 1}级）.mp3`).then((exists) => {
        hasAudio.value[20 + row * 2] = exists;
      })
      checkAudioUrlExists(`倒背数测试2（${row + 1}级）.mp3`).then((exists) => {
        hasAudio.value[20 + row * 2 + 1] = exists;
      })
    })
  });
})

//#endregion

//#region 音频文件
const fileList = ref<UploadFile[][]>([]);
_.times(34, () => {
  fileList.value.push([]);
})

const handleRemove = (file: any, questionIndex: number, qusetionItem: C_BQuestionT3) => {
  if (!fileList.value[questionIndex]) return;
  const index = fileList.value[questionIndex].indexOf(file);
  const newFileList = fileList.value[questionIndex].slice();
  newFileList.splice(index, 1);
  fileList.value[questionIndex] = newFileList;
  if (audioList.value) {
    audioList.value[questionIndex].src = GetAudioUrl(`${qusetionItem.questionType ? '顺背数测试' : '倒背数测试'}${qusetionItem.questionSort}（${qusetionItem.level}级）.mp3`);
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
const handleChange = async (file: any, questionIndex: number, qusetionItem: C_BQuestionT3) => {
  if (audioList.value) {
    let fileURL = URL.createObjectURL(file.fileList[0].originFileObj);
    audioList.value[questionIndex].src = fileURL;
    audioList.value[questionIndex].load(); // 重新加载新的音频
    isUploadAudio.value[questionIndex] = true;
  }
  file.fileList[0].fileName = `${qusetionItem.questionType ? '顺背数测试' : '倒背数测试'}${qusetionItem.questionSort}（${qusetionItem.level}级）.mp3`;
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
            :label-col="{ style: { width: '120px', paddingRight: '10px' } }">
            <template v-for="(qusetionItem, questionIndex) in question.questionList">
              <a-row v-if="(qusetionItem.level == 1) && qusetionItem.questionSort == 1">
                <span class="pb-4 text-2xl">{{ qusetionItem.questionType ? '顺背' : '逆背' }}</span>
              </a-row>
              <a-row>
                <a-col :span="12">
                  <a-form-item :label="`级别 ${qusetionItem.level}题目 ${qusetionItem.questionSort}`">
                    <a-input v-model:value="qusetionItem.questionQ" size="large" :placeholder="`0-9数字，以'-'分割`" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label="`音频文件`">
                    <a-space :size="20">
                      <a-upload :file-list="fileList[questionIndex]" :maxCount="1" :before-upload="beforeUpload"
                        @remove="(file: any) => { handleRemove(file, questionIndex, qusetionItem) }"
                        @change="(file: any) => { handleChange(file, questionIndex, qusetionItem) }">
                        <a-button v-if="fileList[questionIndex].length < 1" size="large"
                          style="display: flex; align-items: center;">
                          <upload-outlined></upload-outlined>
                          点击上传
                        </a-button>
                      </a-upload>
                      <audio v-show="isUploadAudio[questionIndex] || hasAudio[questionIndex]" class="w-66"
                        ref="audioList"
                        :src="GetAudioUrl(`${qusetionItem.questionType ? '顺背数测试' : '倒背数测试'}${qusetionItem.questionSort}（${qusetionItem.level}级）.mp3`)"
                        controls controlsList="nodownload noplaybackrate"></audio>
                    </a-space>
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
