<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionT1Model } from '@/models/question/QuestionT1Model';
import QuestionEdit from './QuestionEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
import { useGlobalStore } from "@/stores/globalStore";
import { UploadOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadFile } from 'ant-design-vue';
import { C_BQuestionT1Q } from '@/entitys/question/BQuestionT1Q';
import { C_BQuestionT1A } from '@/entitys/question/BQuestionT1A';
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const globalStore = useGlobalStore();
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionT1Model>(new QuestionT1Model())
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
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.T1);
    question.value.bQuestionT1QList = [
      new C_BQuestionT1Q({ questionSort: 1, questionType: "Number1" }),
      new C_BQuestionT1Q({ questionSort: 2, questionType: "Number2" }),
      new C_BQuestionT1Q({ questionSort: 3, questionType: "Number3" }),
      new C_BQuestionT1Q({ questionSort: 4, questionType: "Story" }),
      new C_BQuestionT1Q({ questionSort: 5, questionType: "Story" }),
      new C_BQuestionT1Q({ questionSort: 6, questionType: "Story" }),
    ];
    question.value.bQuestionT1AList = [
      new C_BQuestionT1A({ questionSort: 4, answerSort: "A" }),
      new C_BQuestionT1A({ questionSort: 4, answerSort: "B" }),
      new C_BQuestionT1A({ questionSort: 4, answerSort: "C" }),
      new C_BQuestionT1A({ questionSort: 5, answerSort: "A" }),
      new C_BQuestionT1A({ questionSort: 5, answerSort: "B" }),
      new C_BQuestionT1A({ questionSort: 5, answerSort: "C" }),
      new C_BQuestionT1A({ questionSort: 6, answerSort: "A" }),
      new C_BQuestionT1A({ questionSort: 6, answerSort: "B" }),
      new C_BQuestionT1A({ questionSort: 6, answerSort: "C" }),
    ]
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
    const response = await apiClient.post('/Questionnaire/SaveQuestionT1', question.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      const response1 = await apiClient.postForm('/Questionnaire/SaveQuestionT1Audio/' + response.data, {
        files: fileList.value.flat(),
      })
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
  GetQuestionInfo();
})

//#endregion

//#region 音频文件
const fileList = ref<UploadFile[][]>([[], [], []]);

const handleRemove = (file: any, questionIndex: number) => {
  if (!fileList.value[questionIndex]) return;
  const index = fileList.value[questionIndex].indexOf(file);
  const newFileList = fileList.value[questionIndex].slice();
  newFileList.splice(index, 1);
  fileList.value[questionIndex] = newFileList;
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
  fileList.value[questionIndex] = [...fileList.value[questionIndex], ...file.fileList]; // 更新文件列表
};
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-1/3 h-full">
      <QuestionEdit :_question-info="question.questionInfo" @changed="(data) => { question.questionInfo = data; }">
      </QuestionEdit>
    </div>
    <div class="w-2/3 h-full flex flex-col">
      <div class="w-full flex-auto">
        <div ref="tableContainer" class="w-full h-full flex flex-col pl-8">
          <a-form ref="formRef" :model="question" :layout="'horizontal'"
            :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
            <template v-for="(qusetionItem, questionIndex) in question.bQuestionT1QList">
              <a-row v-if="qusetionItem.questionType !== 'Story'">
                <a-col :span="12">
                  <a-form-item :label="`题目 ${qusetionItem.questionSort}`">
                    <a-input v-model:value="qusetionItem.questionQ" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :span="4">
                  <a-form-item :label="`答案`">
                    <a-input-number v-model:value="question.answerInfo[qusetionItem.questionType.toLowerCase()]"
                      size="large" />
                  </a-form-item>
                </a-col>
                <a-col v-if="qusetionItem.questionSort == 1 || qusetionItem.questionSort == 3" :span="8">
                  <a-form-item :label="`音频文件`">
                    <a-upload :file-list="fileList[questionIndex]" :maxCount="1" :before-upload="beforeUpload"
                      @remove="(file: any) => { handleRemove(file, questionIndex) }"
                      @change="(file: any) => { handleChange(file, questionIndex) }">
                      <a-button size="large" style="display: flex; align-items: center;">
                        <upload-outlined></upload-outlined>
                        点击上传
                      </a-button>
                    </a-upload>
                  </a-form-item>
                </a-col>
              </a-row>
              <template v-else>
                <a-row>
                  <a-col :flex="2">
                    <a-form-item :label="`题目 ${qusetionItem.questionSort}`">
                      <a-input v-model:value="qusetionItem.questionQ" size="large" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col
                    v-for="answerItem in question.bQuestionT1AList.filter(x => x.questionSort == qusetionItem.questionSort)"
                    :flex="1">
                    <a-form-item :colon="false">
                      <template #label>
                        <div class="w-full h-full flex flex-col justify-around">
                          <span class="pb-4">{{ `选项 ${answerItem.answerSort}` }}</span>
                          <a-switch v-model:checked="answerItem.isTrue" checked-children="是" un-checked-children="否" />
                        </div>
                      </template>
                      <div class="flex flex-row items-end">
                        <a-textarea v-model:value="answerItem.answer" size="large" :rows="2" />
                      </div>
                    </a-form-item>
                  </a-col>
                </a-row>
              </template>
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
