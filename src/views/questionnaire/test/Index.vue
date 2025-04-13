<template>
  <div class="QuestionnaireTest">
    <a-tabs v-model:activeKey="selectedQuestion">
      <a-tab-pane v-for="(question, index) in questionList" :key="question.questionId" :tab="question.questionName">
        <!-- 动态加载组件 -->
      <component :is="GetComponent(question.questionCode)" :questionId="question.questionId" />
      </a-tab-pane>
      <template #leftExtra>
        <a-button class="tabs-extra-demo-button">{{questionnaireList.find(x => x.questionnaireId ==
          selectedQuestionnaire)?.questionnaireName }}</a-button>
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
import { watch, reactive, h, ref } from 'vue';
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { type MenuProps, message } from 'ant-design-vue';
import QuestionS1 from '@/components/QuestionS1.vue'
import QuestionS2 from '@/components/QuestionS2.vue'
import QuestionS3 from '@/components/QuestionS3.vue'
import QuestionS4 from '@/components/QuestionS4.vue'
import QuestionS5 from '@/components/QuestionS5.vue'
import QuestionT1 from '@/components/QuestionT1.vue'
import QuestionT2 from '@/components/QuestionT2.vue'
import QuestionT3 from '@/components/QuestionT3.vue'

//弹框
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};
const radioStyle = reactive({
  display: 'flex',
  height: '50px',
  lineHeight: '50px',
});
setModalVisible(true);

//菜单数据
const questionnaireList = ref<any[]>([]);
const questionList = ref<any[]>([]);
const selectedQuestionnaire = ref<string>("");
const selectedQuestion = ref<string>("");

//接口
import apiClient from '@/utils/ApiClientHelper'

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


// const GetQuestionModel = async () => {
//   try {
//     const response = await apiClient.post('/Questionnaire/GetQuestionModel/' + selectedQuestion.value)
//     console.log('响应:', response)

//   } catch (error) {
//     console.error('请求失败:', error)
//   }
// }

GetQuestionnaireList()

const GetComponent = (questionCode:string) => {
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
</script>

<style scoped>
  .tabs-extra-demo-button {
    margin-right: 16px;
  }
</style>