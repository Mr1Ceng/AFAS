<template>
  <div class="h-full w-full">
    <a-tabs :activeKey="selectedQuestion" @tabClick="handleTabClick">
      <a-tab-pane v-for="(question, index) in questionList" :key="question.questionId" :tab="question.questionName">
        <!-- 动态加载组件 -->
        <component :is="GetComponent(question.questionCode)" :questionId="question.questionId"
          :isCurrent="selectedQuestion == question.questionId" />
      </a-tab-pane>
      <a-tab-pane key="result" tab="查看结果">
        <!-- 结果组件 -->
        <QuestionResult :isCurrent="selectedQuestion == 'result'"></QuestionResult>
      </a-tab-pane>
      <template #leftExtra>
        <a-select class="tabs-extra-button" ref="select" v-model:value="selectedQuestionnaire"
          @change="() => { GetQuestionList(); }">
          <a-select-option v-for="(questionnaire, index) in questionnaireList" :value="questionnaire.questionnaireId">{{
            questionnaire.questionnaireName + "——" +
            questionnaire.versionName }}</a-select-option>
        </a-select>
      </template>
    </a-tabs>
  </div>
  <a-modal v-model:open="modalVisible" title="评估版本选择" centered @ok="() => { GetQuestionList(); modalVisible = false; }"
    ok-text="确认" :maskClosable="false" :closable="false" :cancel-button-props="{ style: { display: 'none' } }">
    <a-radio-group v-model:value="selectedQuestionnaire">
      <a-radio v-for="(questionnaire, index) in questionnaireList" :style="radioStyle"
        :value="questionnaire.questionnaireId">{{ questionnaire.questionnaireName + "——" +
          questionnaire.versionName }}</a-radio>
    </a-radio-group>
  </a-modal>
</template>

<script lang="ts" setup>
import { watch, reactive, h,onMounted, ref, provide,onActivated,onDeactivated } from 'vue';
import { useAnswerStore } from '@/stores/answerStore';
import QuestionS1 from '@/components/questionnaire/QuestionS1.vue'
import QuestionS2 from '@/components/questionnaire/QuestionS2.vue'
import QuestionS3 from '@/components/questionnaire/QuestionS3.vue'
import QuestionS4 from '@/components/questionnaire/QuestionS4.vue'
import QuestionS5 from '@/components/questionnaire/QuestionS5.vue'
import QuestionT1 from '@/components/questionnaire/QuestionT1.vue'
import QuestionT2 from '@/components/questionnaire/QuestionT2.vue'
import QuestionT3 from '@/components/questionnaire/QuestionT3.vue'
import QuestionResult from '@/components/questionnaire/QuestionResult.vue'
defineOptions({
  name: 'Q_Test'
});
const GetComponent = (questionCode: string) => {
  switch (questionCode) {
    case 'S1': return QuestionS1
    case 'S2': return QuestionS2
    case 'S3': return QuestionS3
    case 'S4': return QuestionS4
    case 'S5': return QuestionS5
    case 'T1': return QuestionT1
    case 'T2': return QuestionT2
    case 'T3': return QuestionT3
    default:
      return null
  }
}
const handleTabClick = (key: string) => {
  if (!canChanges.value) {
    message.info("请先完成本题并提交，再切换至下一题！");
    return;
  }
  selectedQuestion.value = key;
};
//菜单数据
const questionnaireList = ref<any[]>([]);
const questionList = ref<any[]>([]);
const selectedQuestionnaire = ref<string>("");
const selectedQuestion = ref<string>("");

const answerStore = useAnswerStore();
answerStore.setAnswerId("");

//#region 弹框
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};
const radioStyle = reactive({
  display: 'flex',
  height: '50px',
  lineHeight: '50px',
});

onMounted(() => {
  console.log("onMounted");
  setModalVisible(true);
});
//#endregion


//#region接口
import apiClient from '@/utils/ApiClientHelper'
import { message } from 'ant-design-vue';

const GetQuestionnaireList = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionnaireList')
    console.log('响应:', response)
    questionnaireList.value = response.data
    if (questionnaireList.value.length > 0) {
      selectedQuestionnaire.value = questionnaireList.value[0].questionnaireId
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const GetQuestionList = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionList/' + selectedQuestionnaire.value)
    console.log('响应:', response)
    questionList.value = response.data;
    if (questionList.value.length > 0) {
      selectedQuestion.value = questionList.value[0].questionId;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

GetQuestionnaireList()
//#endregion


const canChanges = ref(true);
provide("canChanges", canChanges);

</script>

<style scoped>
.tabs-extra-button {
  margin-right: 16px;
}
</style>