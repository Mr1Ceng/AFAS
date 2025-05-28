<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionS4Model } from '@/models/question/QuestionS4Model';
import QuestionEdit from './QuestionEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
import { useGlobalStore } from "@/stores/globalStore";
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const globalStore = useGlobalStore();
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionS4Model>(new QuestionS4Model())
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
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.S4);
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
    const response = await apiClient.post('/Questionnaire/SaveQuestionS4', question.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      emit("saveSuccess", response.data)
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
