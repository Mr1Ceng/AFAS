<script setup lang="ts">
import { computed, onMounted, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionS2Model } from '@/models/question/QuestionS2Model';
import QuestionEdit from './QuestionEdit.vue';
import { C_BQuestionS2 } from '@/entitys/question/BQuestionS2';
import { QuestionS2Form } from '@/models/question/QuestionS2Form';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionS2Model>(new QuestionS2Model())
const questionForm = ref<QuestionS2Form>(new QuestionS2Form())
const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器
watch(() => props.questionId, async (newValue, oldValue) => {

})
watch(questionForm, async (newValue, oldValue) => {
  _.forEach(questionForm.value.questionRowList, (row, rowIndex) => {
    _.forEach(row, (column, columnIndex) => {
      question.value.questionList[rowIndex * 39 + columnIndex] = new C_BQuestionS2({
        questionId: props.questionId,
        gridRow: rowIndex + 1,
        gridColumn: columnIndex + 1,
        gridValue: Number(column),
        isTrue: Number(column) === questionForm.value.answer
      })
    })
  });
}, { deep: true })
//#endregion

//#region 获取信息

const GetQuestionInfo = async () => {
  if (!props.questionId || props.questionId == "") {
    question.value.questionInfo.questionCode = props.questionCode;
    question.value.questionInfo.questionnaireId = props.questionnaireId;
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.S2);
    questionForm.value.answer = 0;
    _.times(21, row => {
      questionForm.value.questionRowList[row] = "000000000000000000000000000000000000000"
    })
    return;
  }
  try {
    const response = await apiClient.post(`/Questionnaire/GetQuestion${props.questionCode}/` + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      question.value = response.data;
      questionForm.value.answer = question.value.questionList.find(x => x.isTrue)?.gridValue ?? 0
      questionForm.value.questionRowList = _.map(_.groupBy(_.orderBy(question.value.questionList, 'gridRow'), "gridRow"), (items) => {
        return _.map(_.orderBy(items, 'gridColumn'), (x) => x.gridValue).join("");
      });
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
    await formRef.value.validate();
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const response = await apiClient.post('/Questionnaire/SaveQuestionS2', question.value)
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

const validateEmpty = (fieldName: string, field: string = "") => {
  return async (_rule: any, value: any) => {
    if (field == 'answer') {
      if (!value && value !== 0) {
        return Promise.reject(new Error(`${fieldName} 不能为空`));
      }
      if (typeof value == "number" && (value < 0 || value > 9)) {
        return Promise.reject(new Error(`${fieldName}请输入0-9的整数`));
      }
    } else {
      _.forEach(value, (column) => {
        if (isNaN(Number(column))) {
          return Promise.reject(new Error(`${fieldName}请39个输入0-9的整数`));
        }
      })
      if (value.length != 39) {
        return Promise.reject(new Error(`${fieldName}请39个输入0-9的整数`));
      }
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
      <div class="w-full flex-auto">
        <div class="w-full h-full flex items-start justify-center pl-8">
          <a-form ref="formRef" :model="questionForm" :layout="'horizontal'"
            :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="答案" :name="['answer']"
                  :rules="[{ required: true, type: 'number', validator: validateEmpty(`答案`, 'answer') }]">
                  <a-input-number v-model:value="questionForm.answer" size="large" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <template v-for="(row, rowIndex) in questionForm.questionRowList" :key="rowIndex">
                <a-col :span="12">
                  <a-form-item :label="`第${rowIndex + 1}行`" :name="['questionRowList', rowIndex]"
                    :rules="[{ required: true, type: 'number', validator: validateEmpty(`第${rowIndex + 1}行`, `${rowIndex}`) }]">
                    <a-input :value="row"
                      @change="(event: any) => { questionForm.questionRowList[rowIndex] = event.target.value }"
                      size="large" />
                  </a-form-item>
                </a-col>
              </template>
            </a-row>

          </a-form>
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
