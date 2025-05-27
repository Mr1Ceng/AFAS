<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionS1Model } from '@/models/question/QuestionS1Model';
import QuestionEdit from './QuestionEdit.vue';

const props = defineProps<{
  questionId?: string,
  questionCode: string
}>()
const question = ref<QuestionS1Model>(new QuestionS1Model())
const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器

watch(() => props.questionId, async (newValue, oldValue) => {

})

//#endregion

//#region 获取信息

const GetQuestionnaireInfo = async () => {
  if (!props.questionId || props.questionId == "") {
    return;
  }
  try {
    const response = await apiClient.post(`/Questionnaire/GetQuestion${props.questionCode}/` + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      question.value = response.data;
      console.log(question.value)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const formRef = ref();
const SaveQuestionnaire = async () => {
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
    const response = await apiClient.post('/Questionnaire/SaveQuestionS1', question.value)
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
  GetQuestionnaireInfo();
})

//#endregion
const loading = ref<boolean>(false);
</script>

<template>
  <div class="w-full h-full p-4 flex flex-row">
    <div class="w-1/3 h-full">
      <QuestionEdit :_question-info="question.questionInfo" @changed="(data) => { question.questionInfo = data; }">
      </QuestionEdit>
    </div>
    <div class="w-2/3 h-full">
      {{ question.questionInfo }}
    </div>
  </div>
</template>

<style scoped></style>
