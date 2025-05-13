<template>
  <div class="h-full w-full">
    <div v-if="!selectedQuestion" class="w-full h-full flex flex-col justify-center items-center">
      <a-card class="w-161" title="信息确认">
        <a-form ref="formRef" :layout="'horizontal'" :label-col="{ style: { width: '100px', paddingRight: '20px' } }">
          <a-form-item label="姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名">
            <a-select :style="{ width: '300px' }" v-model:value="student.userId" size="large" disabled>
              <a-select-option v-for="student in studentList" :value="student.userId">{{
                student.userName }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别">
            <a-radio-group size="large" v-model:value="student.sex" disabled>
              <a-radio-button :style="{ width: '150px' }" v-for="item in sexList" :value="item.value">{{
                item.description }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;龄">
            <a-input-number :style="{ width: '300px' }" v-model:value="student.age" size="large" addon-after="岁"
              :min="0" disabled />
          </a-form-item>
          <a-form-item label="评估版本">
            <a-radio-group size="large" v-model:value="selectedQuestionnaire">
              <a-radio-button v-for="(questionnaire, index) in questionnaireList"
                :value="questionnaire.questionnaireId">{{ questionnaire.questionnaireName + "-" +
                  questionnaire.versionName }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="">
            <a-alert message="请确认当前登录匹配的信息是否正确，若信息不正确将影响测试结果，请联系测试老师修改信息！" type="error" />
          </a-form-item>
          <a-form-item :span="24" style="text-align: right">
            <a-button size="large" type="primary" @click="GetQuestionList()">
              进入测试
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <a-tabs v-else class="h-full w-full" :activeKey="selectedQuestion" @tabClick="handleTabClick">
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
        <a-select :style="{ marginRight: '16px' }" size="large" ref="select" v-model:value="selectedQuestionnaire"
          @change="() => { GetQuestionList(); }">
          <a-select-option v-for="(questionnaire, index) in questionnaireList" :value="questionnaire.questionnaireId">{{
            questionnaire.questionnaireName + "—" +
            questionnaire.versionName }}</a-select-option>
        </a-select>
      </template>
      <template #rightExtra>
        <a-select :style="{ marginLeft: '16px' }" v-model:value="student.userId" size="large" disabled>
          <a-select-option v-for="student in studentList" :value="student.userId">{{
            student.userName }}</a-select-option>
        </a-select>
      </template>
    </a-tabs>
  </div>
  <!-- <a-modal v-model:open="modalVisible" title="评估版本选择" centered @ok="() => { GetQuestionList(); modalVisible = false; }"
    ok-text="确认" :maskClosable="false" :closable="false" :cancel-button-props="{ style: { display: 'none' } }">
    <a-radio-group v-model:value="selectedQuestionnaire">
      <a-radio v-for="(questionnaire, index) in questionnaireList" :style="radioStyle"
        :value="questionnaire.questionnaireId">{{ questionnaire.questionnaireName + "——" +
          questionnaire.versionName }}</a-radio>
    </a-radio-group>
  </a-modal> -->
</template>

<script lang="ts" setup>
import { watch, reactive, computed, h, onMounted, ref, provide, onActivated, onDeactivated } from 'vue';
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


import { useAccountStore } from "@/stores/accountStore";
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
const accountStore = useAccountStore();

const sexList = EnumHelper.getEnumDescriptions(GerderDescription);
const studentList = ref<any[]>([]);
const GetStudentList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetUserListByRole/STUDENT')
    console.log('响应:', response)
    studentList.value = response.data
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetStudentList();
const student = computed(() => {
  return studentList.value.find(x => x.userId == accountStore.user.userId) ?? {}
})
//#region 弹框
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};


onMounted(() => {
  console.log("onMounted");
  //setModalVisible(true);
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

.ant-radio-button-wrapper {
  display: inline-flex;
  justify-content: center;
}
</style>