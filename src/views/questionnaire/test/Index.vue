<template>
  <div class="h-full w-full">
    <div v-if="!selectedQuestion" class="w-full h-full flex flex-col justify-center items-center">
      <a-card class="w-161" title="信息确认">
        <a-form ref="formRef" :layout="'horizontal'" :label-col="{ style: { width: '100px', paddingRight: '20px' } }">
          <a-form-item label="姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名">
            <div class="w-full flex justify-between">
              <a-select :style="{ width: '70%' }" show-search v-model:value="currStudentId" size="large"
                :filter-option="filterOption" placeholder="请选择测试对象" :disabled="!accountStore.user.isStaff">
                <a-select-option v-for="item in studentList" :value="item.userId" :label="item.userName">{{
                  item.userName }}</a-select-option>
              </a-select>
              <a-button :style="{ width: '28%' }" class="" size="large" type="primary"
                :disabled="!accountStore.user.isStaff" @click="() => { setDrawerVisible(true); }">新增测评对象</a-button>
            </div>
          </a-form-item>
          <a-form-item label="性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别">
            <a-radio-group :style="{ width: '100%' }" size="large" v-model:value="student.gender" disabled>
              <a-radio-button :style="{ width: '50%' }" v-for="item in sexList" :value="item.value">{{
                item.description }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;龄">
            <a-input-number :style="{ width: '100%' }" v-model:value="student.age" size="large" addon-after="岁" :min="0"
              disabled />
          </a-form-item>
          <a-form-item label="评估版本">
            <a-radio-group :style="{ width: '100%' }" size="large" v-model:value="selectedQuestionnaire">
              <a-radio-button :style="{ width: '50%' }" v-for="(questionnaire, index) in questionnaireList"
                :value="questionnaire.questionnaireId">{{ questionnaire.questionnaireName + "-" +
                  questionnaire.versionName }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="">
            <a-alert message="请确认当前登录匹配的信息是否正确，若信息不正确将影响测试结果，请联系测试老师修改信息！" type="error" />
          </a-form-item>
          <a-form-item :span="24" style="text-align: right">
            <a-button size="large" type="primary" @click="startTest">
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
        <a-space :size="20">
          <span class="text-xl">
            {{ `测评编码：${answerStore._answerId}` }}
          </span>
          <a-select :style="{ marginLeft: '16px' }" v-model:value="student.userId" size="large" disabled>
            <a-select-option v-for="item in studentList" :value="item.userId">{{
              item.userName }}</a-select-option>
          </a-select>
          <a-button size="large" type="primary" @click="() => { showResetConfirm(); }">
            重新测评
          </a-button>
        </a-space>
      </template>
    </a-tabs>
  </div>
  <a-drawer title="用户编辑" placement="right" :open="drawerVisible" :destroyOnClose="true"
    @close="() => { setDrawerVisible(false); }" :width="600">
    <UserEdit :role="RoleEnum.STUDENT" @save-success="(userId) => { setDrawerVisible(false); currStudentId = userId }">
    </UserEdit>
  </a-drawer>
</template>

<script lang="ts" setup>
import { watch, reactive, computed, h, onMounted, ref, provide, createVNode } from 'vue';
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
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import { filterOption } from '@/utils/AntdHelper'
import UserEdit from '@/components/user/UserEdit.vue';
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

watch(selectedQuestionnaire, (newvalue, oldValue) => {
  canChanges.value = true;
})
import { useAccountStore } from "@/stores/accountStore";
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleEnum } from '@/enums/RoleEnum';
const accountStore = useAccountStore();

const sexList = EnumHelper.getEnumDescriptions(GerderDescription);
const studentList = ref<any>([]);
const GetStudentList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetUserListByRole/STUDENT')
    console.log('响应:', response)
    studentList.value = response.data
    if (!accountStore.user.isStaff) {
      currStudentId.value = accountStore.user.userId
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const currStudentId = ref<string>("");
watch(currStudentId, (newValuw, oldValue) => {
  console.log(newValuw)
  answerStore.setUser(student);
})
const student = computed(() => {
  return studentList.value.find((x: { userId: string; }) => x.userId == currStudentId.value) ?? {}
})

const startTest = () => {
  if (currStudentId.value == "") {
    message.warn("请先选择测试对象，再进入测试");
    return;
  }
  GetQuestionList();
}

onMounted(() => {
  GetStudentList();
  console.log("onMounted");
});
//#endregion


//#region接口

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


const showResetConfirm = () => {
  Modal.confirm({
    title: `确认重新开启测评?`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      answerStore.setAnswerId("");
      selectedQuestion.value = "";
      canChanges.value = true;
    }
  });
};


const drawerVisible = ref<boolean>(false);
const setDrawerVisible = (open: boolean) => {
  drawerVisible.value = open;
  if (!open) {
    GetStudentList();
  }
};
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