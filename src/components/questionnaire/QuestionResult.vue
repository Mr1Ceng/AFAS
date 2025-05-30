<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { QuestionCodeDescription } from '@/enums/QuestionCodeEnum';
import { useAccountStore } from "@/stores/accountStore";
import { useAnswerStore } from '@/stores/answerStore';
import EChart from "@/components/echart/EChart.vue";
import _ from "lodash";

const props = defineProps<{
  isCurrent: boolean,
  answerId?: string
}>()
const answerStore = useAnswerStore();
const accountStore = useAccountStore();
const sexList = EnumHelper.getEnumDescriptions(GerderDescription);
const questionCodeList = EnumHelper.getEnumDescriptions(QuestionCodeDescription);
const testResult = ref<any>({});

const answerId = computed(() => {
  return (props.answerId && props.answerId != "") ?
    props.answerId : answerStore._answerId
})
// #region 监听器

watch(() => props.isCurrent, async (newValue, oldValue) => {
  if (newValue) {
    GetAnswerList().then(
      () => {
        computedResult();
      }
    );
  }
})

//#endregion

//#region 基础数据
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
    if (accountStore.user.isStaff && !testResult.value.teacherId) {
      testResult.value.teacherId = accountStore.user.userId;
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
    if (!accountStore.user.isStaff && !testResult.value.userId) {
      testResult.value.userId = accountStore.user.userId;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetEvaluationStandardList();
GetSuggestedCourseList();

//#endregion

//#region 获取答案
const GetAnswerList = async () => {
  if (!answerId || answerId.value == "") {
    return;
  }
  try {
    const response = await apiClient.post('/Questionnaire/GetAnswerList/' + answerId.value)//1JT06RR4KRXGCCA7Z56RBE5ZA
    console.log('响应:', response)
    if (response.status == 1) {
      if (testResult.value.userId) {
        response.data.userId = testResult.value.userId;
      }
      if (testResult.value.suggestedCourse) {
        response.data.suggestedCourse = testResult.value.suggestedCourse;
      }
      if (testResult.value.levelCode) {
        response.data.levelCode = testResult.value.levelCode;
      }
      if (testResult.value.teacherId) {
        response.data.teacherId = testResult.value.teacherId;
      }
      testResult.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetAnswerList().then(() => {
  GetTeacherList();
  GetStudentList();
});
//#endregion
const student = computed(() => {
  return studentList.value.find(x => x.userId == testResult.value.userId) ?? {}
})
const currentEvaluationStandard = computed(() => {
  return evaluationStandardList.value.find(x => x.levelCode == testResult.value.levelCode);
});

watch(() => currentEvaluationStandard.value, (newValue, oldValue) => {
  computedResult();
})

const computedResult = () => {
  if (!testResult.value.answerList || !currentEvaluationStandard.value) return;
  //#region 计算答案是否达标
  if (testResult.value.answerList.length > 0) {
    _.forEach(testResult.value.answerList, item => {
      var evaluationStandard = currentEvaluationStandard.value[_.toLower(item.questionCode)];
      item.evaluationStandard = evaluationStandard;
      item.isPass = item.standardScore >= evaluationStandard;
    })
  }
  //#endregion
  //#region 视知觉测试结果
  var sResultPass = _.map(testResult.value.answerList.filter((x: {
    isPass: boolean; questionCode: string;
  }) => _.startsWith(x.questionCode, 'S') && x.isPass), x => {
    return EnumHelper.getDescriptionByValue(QuestionCodeDescription, x.questionCode)
  })
  var sResultFail = _.map(testResult.value.answerList.filter((x: {
    isPass: boolean; questionCode: string;
  }) => _.startsWith(x.questionCode, 'S') && !x.isPass), x => {
    return EnumHelper.getDescriptionByValue(QuestionCodeDescription, x.questionCode)
  })

  switch (sResultFail.length) {
    case 0:
      testResult.value.sResult = `视知觉测试结果显示，在${_.join(sResultPass, '、')}${sResultPass.length}个模块均已达标。 `
      break;
    case 1:
      testResult.value.sResult = `视知觉测试结果显示，在${_.join(sResultFail, '、')}${sResultFail.length}个模块未达标。 `
      break;
    default:
      testResult.value.sResult = `视知觉测试结果显示，在${_.join(sResultFail, '、')}${sResultFail.length}个模块均未达标。 `
      break;
  }
  //#endregion
  //#region 听知觉测试结果
  var tResultPass = _.map(testResult.value.answerList.filter((x: {
    isPass: boolean; questionCode: string;
  }) => _.startsWith(x.questionCode, 'T') && x.isPass), x => {
    return EnumHelper.getDescriptionByValue(QuestionCodeDescription, x.questionCode)
  })
  var tResultFail = _.map(testResult.value.answerList.filter((x: {
    isPass: boolean; questionCode: string;
  }) => _.startsWith(x.questionCode, 'T') && !x.isPass), x => {
    return EnumHelper.getDescriptionByValue(QuestionCodeDescription, x.questionCode)
  })

  switch (tResultFail.length) {
    case 0:
      testResult.value.tResult = `听知觉测试结果显示，在${_.join(tResultPass, '、')}${tResultPass.length}个模块均已达标。 `
      break;
    case 1:
      testResult.value.tResult = `听知觉测试结果显示，在${_.join(tResultFail, '、')}${tResultFail.length}个模块未达标。 `
      break;
    default:
      testResult.value.tResult = `听知觉测试结果显示，在${_.join(tResultFail, '、')}${tResultFail.length}个模块均未达标。 `
      break;
  }
  //#endregion
  //#region 总结
  testResult.value.remark = _.join(_.map(testResult.value.answerList, item => { return item.questionCode + ':' + item.remark }), '\n')
  testResult.value.advantage = `${_.join([...sResultPass, ...tResultPass], '、')}`
  testResult.value.weak = `${_.join([...sResultFail, ...tResultFail], '、')}`
  //#endregion
  CreateRadarMap();
}

//#region 图标
const radarMax = computed(() => {
  return 100
  // Math.max(
  //   currentEvaluationStandard.value.s1
  //   , currentEvaluationStandard.value.s2
  //   , currentEvaluationStandard.value.s3
  //   , currentEvaluationStandard.value.s4
  //   , currentEvaluationStandard.value.s5
  //   , currentEvaluationStandard.value.t1
  //   , currentEvaluationStandard.value.t2
  //   , currentEvaluationStandard.value.t3
  // ) + 10;
});
const chartOptions = ref<echarts.EChartsOption>({});
const sChartOptions = ref<echarts.EChartsOption>({});
const tChartOptions = ref<echarts.EChartsOption>({});
const GetImageUrl = (image: string, type: string) => {
  testResult.value[type] = image;
}
//#endregion

const CreateRadarMap = () => {
  if (!currentEvaluationStandard.value) {
    message.error("请先选择评测等级");
    return;
  }
  chartOptions.value = {
    title: {
      text: 'ELA 专注学习能力测试'
    },
    legend: {
      data: [currentEvaluationStandard.value.levelName, '得分']
    },
    radar: {
      // shape: 'circle',
      indicator: _.map(questionCodeList, item => { return { name: item.description, max: radarMax.value } }),

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
            value: _.map(testResult.value.answerList, x => { return x.evaluationStandard }),
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
      data: _.map(questionCodeList.filter(x => _.startsWith(x.value, 'S')), item => { return item.description })
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
          return !x.isPass ? {
            value: x.standardScore > radarMax.value ? radarMax.value : x.standardScore,
            itemStyle: {
              color: '#ff0000'
            }
          } : {
            value: x.standardScore > radarMax.value ? radarMax.value : x.standardScore,
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
          (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S1').isPass
            ? 0 : currentEvaluationStandard.value.s1 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S1').standardScore)
          , (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S2').isPass
            ? 0 : currentEvaluationStandard.value.s2 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S2').standardScore)
          , (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S3').isPass
            ? 0 : currentEvaluationStandard.value.s3 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S3').standardScore)
          , (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S4').isPass
            ? 0 : currentEvaluationStandard.value.s4 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S4').standardScore)
          , (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'S5').isPass
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
      data: _.map(questionCodeList.filter(x => _.startsWith(x.value, 'T')), item => { return item.description })
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
          return !x.isPass ? {
            value: x.standardScore > radarMax.value ? radarMax.value : x.standardScore,
            itemStyle: {
              color: '#ff0000'
            }
          } : {
            value: x.standardScore > radarMax.value ? radarMax.value : x.standardScore,
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
          (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T1').isPass
            ? 0 : currentEvaluationStandard.value.t1 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T1').standardScore)
          , (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T2').isPass
            ? 0 : currentEvaluationStandard.value.t2 - testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T2').standardScore)
          , (testResult.value.answerList.find((x: { questionCode: string; }) => x.questionCode == 'T3').isPass
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
const SaveTestResult = async () => {
  loading.value = true;
  console.log(testResult.value)
  console.log(student.value)
  if (!currentEvaluationStandard.value) {
    message.error("请先选择评测等级");
    return;
  }
  try {
    const data = testResult.value
    const response = await apiClient.post('/Questionnaire/SaveTestResult', data)
    console.log('响应:', response)
    if (response.status == 1 && response.data != "") {
      message.success(`保存成功`);
    } else {
      message.error(`保存题目信息失败，请联系测评老师！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
  loading.value = false;
}
const loading = ref<boolean>(false);
</script>

<template>

  <div class="w-full h-full flex flex-row">
    <div class="h-full w-[calc(100%-400px)] pl-4 pr-4 overflow-y-scroll flex">
      <div class="w-3/5 h-full">
        <EChart :options="chartOptions" @get-image-url="(image: string) => { GetImageUrl(image, 'radarImage') }" />
      </div>
      <div class="w-2/5 h-full flex flex-col">
        <div class="w-full h-1/2">
          <EChart :options="sChartOptions" @get-image-url="(image: string) => { GetImageUrl(image, 'sImage') }" />
        </div>
        <div class="w-full h-1/2">
          <EChart :options="tChartOptions" @get-image-url="(image: string) => { GetImageUrl(image, 'tImage') }" />
        </div>
      </div>
    </div>

    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 400px;">
      <a-form ref="formRef" :model="testResult" :layout="'horizontal'"
        :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
        <a-form-item label="测评编码">
          <a-input style="width: 100%;" size="large" v-model:value="testResult.answerId" disabled />
        </a-form-item>
        <a-form-item label="日期">
          <a-date-picker style="width: 100%;" v-model:value="testResult.questionnaireDate" size="large" />
        </a-form-item>
        <a-form-item label="学生">
          <a-select v-model:value="testResult.userId" size="large">
            <a-select-option v-for="student in studentList" :value="student.userId">{{
              student.userName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="性别">
          <a-radio-group style="width: 100%;" size="large" v-model:value="student.gender" disabled>
            <a-radio-button style="width: 50%;" v-for="item in sexList" :value="item.value">{{ item.description
              }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="年龄">
          <a-input-number style="width: 100%;" v-model:value="student.age" size="large" addon-after="岁" :min="0"
            disabled />
        </a-form-item>
        <a-form-item label="评测等级">
          <a-select v-model:value="testResult.levelCode" size="large">
            <a-select-option v-for="evaluationStandard in evaluationStandardList"
              :value="evaluationStandard.levelCode">{{
                evaluationStandard.levelName }}</a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="建议课程">
          <a-select v-model:value="testResult.suggestedCourse" size="large">
            <a-select-option v-for="suggestedCourse in suggestedCourseList" :value="suggestedCourse.itemId">{{
              suggestedCourse.itemName }}</a-select-option>
          </a-select>
        </a-form-item> -->
        <a-form-item label="评测老师">
          <a-select v-model:value="testResult.teacherId" size="large">
            <a-select-option v-for="teacher in teacherList" :value="teacher.userId">{{
              teacher.userName }}</a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="视知觉结果">
                    <a-textarea style="width: 100%;" v-model:value="testResult.sResult" :rows="4" />
                  </a-form-item>
                  <a-form-item label="听知觉结果">
                    <a-textarea style="width: 100%;" v-model:value="testResult.tResult" :rows="4" />
                  </a-form-item> -->
        <a-form-item label="弱势">
          <a-textarea style="width: 100%;" v-model:value="testResult.weak" :rows="2" />
        </a-form-item>
        <a-form-item label="优势">
          <a-textarea style="width: 100%;" v-model:value="testResult.advantage" :rows="2" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea style="width: 100%;" v-model:value="testResult.remark" :rows="2" />
        </a-form-item>
        <a-form-item :span="24" style="text-align: right">
          <a-button type="primary" @click="SaveTestResult()" :loading="loading">
            生成测试报告
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped></style>
