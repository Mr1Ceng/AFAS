<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import apiClient from '@/utils/ApiClientHelper'
import { EnumHelper } from '@/utils/EnumHelper';
import { SexDescription } from '@/enums/SexEnum';
import { useAccountStore } from "@/stores/accountStore";
import { useAnswerStore } from '@/stores/answerStore';
import EChart from "@/components/echart/EChart.vue";
import _, { max } from "lodash";

const answerStore = useAnswerStore();
const accountStore = useAccountStore();
const sexList = EnumHelper.getEnumDescriptions(SexDescription);
const testResult = ref<any>({});
const GetAnswerList = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetAnswerList/' + (answerStore._answerId == '' ? '1JT06RR4KRXGCCA7Z56RBE5ZA' : answerStore._answerId))
    console.log('响应:', response)
    if (response.status == 1) {
      testResult.value = response.data

    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetAnswerList();

const student = computed(() => {
  return studentList.value.find(x => x.userId == testResult.value.userId) ?? {}
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
      testResult.value.teacher = accountStore.user.userId;
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
      testResult.value.student = accountStore.user.userId;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetEvaluationStandardList();
GetSuggestedCourseList();
GetTeacherList();
GetStudentList();
const currentEvaluationStandard = computed(() => {
  return evaluationStandardList.value.find(x => x.levelCode == testResult.value.levelCode);
});
const radarMax = computed(() => {
  return Math.max(
    currentEvaluationStandard.value.s1
    , currentEvaluationStandard.value.s2
    , currentEvaluationStandard.value.s3
    , currentEvaluationStandard.value.s4
    , currentEvaluationStandard.value.s5
    , currentEvaluationStandard.value.t1
    , currentEvaluationStandard.value.t2
    , currentEvaluationStandard.value.t3
  ) + 10;
});

const CreateRadarMap = () => {
  chartOptions.value = {
    title: {
      text: 'ELA 专注学习能力测试'
    },
    legend: {
      data: [currentEvaluationStandard.value.levelName, '得分']
    },
    radar: {
      // shape: 'circle',
      indicator: [
        { name: '视觉广度', max: radarMax.value },
        { name: '视觉稳定性', max: radarMax.value },
        { name: '视觉转移', max: radarMax.value },
        { name: '手眼协调', max: radarMax.value },
        { name: '视觉工作记忆', max: radarMax.value },
        { name: '听觉集中', max: radarMax.value },
        { name: '听觉分辨', max: radarMax.value },
        { name: '听觉记忆', max: radarMax.value }
      ],

    },
    series: [
      {
        name: 'ELA 专注学习能力测试标准对比',
        type: 'radar',
        data: [
          {
            value: _.map(testResult.value.answerList, x => { return x.standardScore > radarMax.value ? radarMax.value : x.standardScore }),
            name: '得分'
          },
          {
            value: [
              currentEvaluationStandard.value.s1
              , currentEvaluationStandard.value.s2
              , currentEvaluationStandard.value.s3
              , currentEvaluationStandard.value.s4
              , currentEvaluationStandard.value.s5
              , currentEvaluationStandard.value.t1
              , currentEvaluationStandard.value.t2
              , currentEvaluationStandard.value.t3
            ],
            name: currentEvaluationStandard.value.levelName
          },
        ],
        label: {
          show: true
        }
      }
    ]
  };
  sChartOptions.value = {
    title: {
      text: '视知觉'
    },
    xAxis: {
      type: 'category',
      data: ['视觉广度', '视觉稳定性', '视觉转移', '手眼协调', '视觉工作记忆']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '得分',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        data: _.map(testResult.value.answerList.filter((x: { questionCode: string; }) => _.startsWith(x.questionCode, 'S')), x => {
          return {
            value: x.standardScore > radarMax.value ? radarMax.value : x.standardScore,
            itemStyle: {
              color: currentEvaluationStandard.value[_.toLower(x.questionCode)] - x.standardScore <= 0 ? null : '#ff0000'
            }
          }
        }),
        label: {
          show: true
        }
      },
      {
        name: '标准',
        type: 'bar',
        stack: 'Ad',
        data: [
          (currentEvaluationStandard.value.s1 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S1').standardScore < 0
            ? 0 : currentEvaluationStandard.value.s1 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S1').standardScore)
          , (currentEvaluationStandard.value.s2 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S2').standardScore < 0
            ? 0 : currentEvaluationStandard.value.s2 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S2').standardScore)
          , (currentEvaluationStandard.value.s3 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S3').standardScore < 0
            ? 0 : currentEvaluationStandard.value.s3 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S3').standardScore)
          , (currentEvaluationStandard.value.s4 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S4').standardScore < 0
            ? 0 : currentEvaluationStandard.value.s4 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S4').standardScore)
          , (currentEvaluationStandard.value.s5 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S5').standardScore < 0
            ? 0 : currentEvaluationStandard.value.s5 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S5').standardScore)
        ],
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true
        }
      },
    ]
  };
  tChartOptions.value = {
    title: {
      text: '听知觉'
    },
    xAxis: {
      type: 'category',
      data: ['听觉集中', '听觉分辨', '听觉记忆']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '得分',
        type: 'bar',
        stack: 'Ad',
        emphasis: {
          focus: 'series'
        },
        data: _.map(testResult.value.answerList.filter((x: { questionCode: string; }) => _.startsWith(x.questionCode, 'T')), x => {
          return {
            value: x.standardScore > radarMax.value ? radarMax.value : x.standardScore,
            itemStyle: {
              color: currentEvaluationStandard.value[_.toLower(x.questionCode)] - x.standardScore <= 0 ? null : '#ff0000'
            }
          }
        }),
        label: {
          show: true
        }
      },
      {
        name: '标准',
        type: 'bar',
        stack: 'Ad',
        data: [
          (currentEvaluationStandard.value.t1 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T1').standardScore < 0
            ? 0 : currentEvaluationStandard.value.t1 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T1').standardScore)
          , (currentEvaluationStandard.value.t2 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T2').standardScore < 0
            ? 0 : currentEvaluationStandard.value.t2 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T2').standardScore)
          , (currentEvaluationStandard.value.t3 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T3').standardScore < 0
            ? 0 : currentEvaluationStandard.value.t3 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T3').standardScore)
        ],
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true
        }
      },
    ]
  };
}
const CreateTestReport = () => {
  console.log(testResult.value)
  console.log(student.value)
  
}

const chartOptions = ref<echarts.EChartsOption>({});
const sChartOptions = ref<echarts.EChartsOption>({});
const tChartOptions = ref<echarts.EChartsOption>({});
const GetImageUrl = (image: string, type:string)=>{
  console.log(type,image)
}
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="h-full w-[calc(100%-400px)] pl-4 pr-4 flex">
      <div class="w-3/5 h-full">
        <EChart :options="chartOptions" @get-image-url=" (image: string)=>{GetImageUrl(image,'RadarImage')}"/>
      </div>
      <div class="w-2/5 h-full flex flex-col">
        <div class="w-full h-1/2">
          <EChart :options="sChartOptions" @get-image-url=" (image: string)=>{GetImageUrl(image,'SImage')}"/>
        </div>
        <div class="w-full h-1/2">
          <EChart :options="tChartOptions" @get-image-url=" (image: string)=>{GetImageUrl(image,'TImage')}"/>
        </div>
      </div>
    </div>
    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 400px;">
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">日期</span>
        <a-date-picker class="inputWidth" v-model:value="testResult.questionnaireDate" size="large" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">学生</span>
        <a-select class="inputWidth" v-model:value="testResult.userId" size="large">
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
        <a-select class="inputWidth" v-model:value="testResult.levelCode" size="large">
          <a-select-option v-for="evaluationStandard in evaluationStandardList" :value="evaluationStandard.levelCode">{{
            evaluationStandard.levelName }}</a-select-option>
        </a-select>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">建议课程</span>
        <a-select class="inputWidth" v-model:value="testResult.suggestedCourse" size="large">
          <a-select-option v-for="suggestedCourse in suggestedCourseList" :value="suggestedCourse.itemId">{{
            suggestedCourse.itemName }}</a-select-option>
        </a-select>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="inputSpan">评测老师</span>
        <a-select class="inputWidth" v-model:value="testResult.teacherId" size="large">
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
