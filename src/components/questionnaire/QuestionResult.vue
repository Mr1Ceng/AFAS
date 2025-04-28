<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import apiClient from '@/utils/ApiClientHelper'
import { EnumHelper } from '@/utils/EnumHelper';
import { SexDescription } from '@/enums/SexEnum';
import { useAccountStore } from "@/stores/accountStore";
import _ from "lodash";

const accountStore = useAccountStore();
const questionnaire = ref<any>({})
const sexList = EnumHelper.getEnumDescriptions(SexDescription);

const student = computed(() => {
  return studentList.value.find(x => x.userId == questionnaire.value.student) ?? {}
})
//评估标准数据
const evaluationStandardList = ref<any[]>([]);
const suggestedCourseList = ref<any[]>([]);
const teacherList = ref<any[]>([]);
const studentList = ref<any[]>([]);
const GetEvaluationStandardList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetEvaluationStandardList')
    console.log('响应:', response)
    evaluationStandardList.value = response.data
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const GetSuggestedCourseList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetDictionaryItemList/SuggestedCourse')
    console.log('响应:', response)
    suggestedCourseList.value = response.data
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const GetTeacherList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetUserListByRole/TEACHER')
    console.log('响应:', response)
    teacherList.value = response.data
    if (_.find(teacherList.value, (x: { userId: string; }) => x.userId == accountStore.user.userId) != null) {
      questionnaire.value.teacher = accountStore.user.userId;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const GetStudentList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetUserListByRole/STUDENT')
    console.log('响应:', response)
    studentList.value = response.data
    if (_.find(studentList.value, (x: { userId: string; }) => x.userId == accountStore.user.userId) != null) {
      questionnaire.value.student = accountStore.user.userId;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetEvaluationStandardList();
GetSuggestedCourseList();
GetTeacherList();
GetStudentList();


const CreateRadarMap = () => {

}
const CreateTestReport = () => {
  console.log(questionnaire.value)
  console.log(student.value)
}
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="h-full w-[calc(100%-400px)] pl-4 pr-4">
      leidatu
    </div>
    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 400px;">
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">日期</span>
        <a-date-picker class="inputWidth" v-model:value="questionnaire.questionnaireDate" size="large" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">学生</span>
        <a-select class="inputWidth" v-model:value="questionnaire.student" size="large">
          <a-select-option v-for="student in studentList" :value="student.userId">{{
            student.userName }}</a-select-option>
        </a-select>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">性别</span>
        <a-radio-group class="inputWidth" v-model:value="student.sex" disabled>
          <a-radio-button v-for="item in sexList" :value="item.value">{{ item.description }}</a-radio-button>
        </a-radio-group>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">年龄</span>
        <a-input-number class="inputWidth" v-model:value="student.age" size="large" addon-after="岁" :min="0" disabled />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">评测等级</span>
        <a-select class="inputWidth" v-model:value="questionnaire.evaluationStandard" size="large">
          <a-select-option v-for="evaluationStandard in evaluationStandardList" :value="evaluationStandard.levelCode">{{
            evaluationStandard.levelName }}</a-select-option>
        </a-select>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">建议课程</span>
        <a-select class="inputWidth" v-model:value="questionnaire.suggestedCourse" size="large">
          <a-select-option v-for="suggestedCourse in suggestedCourseList" :value="suggestedCourse.itemId">{{
            suggestedCourse.itemName }}</a-select-option>
        </a-select>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">评测老师</span>
        <a-select class="inputWidth" v-model:value="questionnaire.teacher" size="large">
          <a-select-option v-for="teacher in teacherList" :value="teacher.userId">{{
            teacher.userName }}</a-select-option>
        </a-select>
      </div>
      <div class="w-full flex flex-row justify-end items-center pt-8">
        <a-button @click="CreateRadarMap()">
          生成雷达图
        </a-button>
        <a-button @click="CreateTestReport()">
          生成测试报告
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inputSpan {
  width: calc(var(--spacing) * 20);
  font-size: var(--text-lg)
    /* 1.125rem = 18px */
  ;
  line-height: var(--tw-leading, var(--text-lg--line-height)
      /* calc(1.75 / 1.125) ≈ 1.5556 */
    );
}

.inputWidth {
  width: calc(100% - var(--spacing) * 20);
  font-size: var(--text-lg)
    /* 1.125rem = 18px */
  ;
  line-height: var(--tw-leading, var(--text-lg--line-height)
      /* calc(1.75 / 1.125) ≈ 1.5556 */
    );
}
</style>
