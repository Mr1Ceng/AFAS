<script setup lang="ts">
import { computed, onMounted, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionS1Model } from '@/models/question/QuestionS1Model';
import QuestionEdit from './QuestionEdit.vue';
import { C_BQuestionS1 } from '@/entitys/question/BQuestionS1';
import { S1GridTypeDescription } from "@/enums/S1GridTypeEnum"
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionS1Model>(new QuestionS1Model())
const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器
watch(() => props.questionId, async (newValue, oldValue) => {

})

//#endregion

//#region 获取信息

const GetQuestionInfo = async () => {
  if (!props.questionId || props.questionId == "") {
    question.value.questionInfo.questionCode = props.questionCode;
    question.value.questionInfo.questionnaireId = props.questionnaireId;
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.S1);
    _.forEach(gridTypes, gridType => {
      _.times(25, gridSort => {
        question.value.questionList.push(new C_BQuestionS1({
          gridType: gridType.value,
          gridSort: gridSort + 1,
          gridValue: isDev.value ? gridSort + 1 : 0,
        }))
      })
    })
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
    await Promise.all(formRef.value.map(async (x: { validate: () => any }) => x.validate()));
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
  GetQuestionInfo();
})

//#endregion
const gridTypes = EnumHelper.getEnumDescriptions(S1GridTypeDescription);
const filteredQuestions = (gridType: string) => question.value.questionList.filter(x => x.gridType === gridType);

const getGrid = (colIndex: number, rowIndex: number, gridType: string) => {
  let gridSort = (colIndex - 1) * 5 + rowIndex;
  let currGrid = question.value.questionList.find(x => x.gridSort == gridSort && x.gridType == gridType);
  if (!currGrid) {
    currGrid = new C_BQuestionS1({ questionId: props.questionId, gridSort: gridSort, gridType: gridType })
    question.value.questionList.push(currGrid)
  }
  return currGrid
};
const getGridIndex = (colIndex: number, rowIndex: number, gridType: string) => {
  let gridSort = (colIndex - 1) * 5 + rowIndex;
  return question.value.questionList.filter(x => x.gridType === gridType).findIndex(x => x.gridSort == gridSort && x.gridType == gridType);
};
const setGrid = (colIndex: number, rowIndex: number, gridType: string, value: number) => {
  let gridSort = (colIndex - 1) * 5 + rowIndex;
  let currGrid = question.value.questionList.find(x => x.gridSort == gridSort && x.gridType == gridType);
  if (currGrid) {
    currGrid.gridValue = value;
  }
};
const checkValueSame = (gridType: string, gridSort: number, value: number) => {
  return question.value.questionList.find(x => x.gridType === gridType && x.gridValue == value && x.gridSort != gridSort);
}
const validateEmpty = (fieldName: string, gridType: string, gridSort: number) => {
  return async (_rule: any, value: any) => {
    if (!value && value !== 0) {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    if (typeof value == "number" && value === 0) {
      return Promise.reject(new Error(`${fieldName} 不能为零`));
    }
    else if (typeof value == "string" && value.trim() === "") {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    var sameGrid = checkValueSame(gridType, gridSort, value);
    if (sameGrid) {
      return Promise.reject(new Error(`${fieldName} 与格子${sameGrid.gridSort}值重复`));
    }
    return Promise.resolve();
  };
};
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-1/3 h-full">
      <QuestionEdit :_question-info="question.questionInfo" @changed="(data) => { question.questionInfo = data; }">
      </QuestionEdit>
    </div>
    <div class="w-2/3 h-full flex flex-col">
      <div class="w-full flex-auto flex felx-row items-start flex-wrap pl-8">
        <div class="w-1/2 flex flex-col items-center justify-start pb-" v-for="gridType in gridTypes">
          <a-card :title="gridType.description" style="width: 98%" :bodyStyle="{ paddingBottom: 0 }">
            <a-form ref="formRef" :model="{ questionList: filteredQuestions(gridType.value) }" :layout="'horizontal'"
              :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
              <a-row :gutter="0" v-for="colIndex in 5" :key="colIndex">
                <template v-for="rowIndex in 5" :key="rowIndex">
                  <a-col :flex="1" class="flex justify-center items-center">
                    <a-form-item v-if="getGridIndex(colIndex, rowIndex, gridType.value) >= 0" label=""
                      :name="['questionList', getGridIndex(colIndex, rowIndex, gridType.value), 'gridValue']"
                      :rules="[{ required: true, type: 'number', validator: validateEmpty(`${gridType.description}格子${getGrid(colIndex, rowIndex, gridType.value)?.gridSort}`, gridType.value, getGrid(colIndex, rowIndex, gridType.value)?.gridSort) }]">
                      <a-input-number :value="getGrid(colIndex, rowIndex, gridType.value)?.gridValue"
                        @change="(value: number) => (setGrid(colIndex, rowIndex, gridType.value, value))" size="large"
                        :style="{ width: '60px' }" />
                    </a-form-item>
                  </a-col>
                </template>
              </a-row>
            </a-form>
          </a-card>
        </div>
      </div>
      <div class="w-full h-20 flex felx-row items-center justify-end">

        <a-space>
          <a-button type="primary" @click="SaveQuestion">保存</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
