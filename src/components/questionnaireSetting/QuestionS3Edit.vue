<script setup lang="ts">
import { computed, onMounted, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionS3Model } from '@/models/question/QuestionS3Model';
import QuestionEdit from './QuestionEdit.vue';
import { C_BQuestionS3 } from '@/entitys/question/BQuestionS3';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
import "@/assets/iconfont/iconfont.css";
import { C_BQuestionS3A } from '@/entitys/question/BQuestionS3A';
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionS3Model>(new QuestionS3Model())
const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器
watch(() => props.questionId, async (newValue, oldValue) => {

})

//#region 获取信息
const CreateRandom = () => {
  let icons = _.shuffle(_.range(1, 17)); // 生成 1-16 并打乱顺序
  _.times(9, row => {
    question.value.bQuestionS3AList[row] = new C_BQuestionS3A({
      gridValue: row + 1,
      gridIcon: icons[row].toString()
    })
  })
  let previousValue = 1;
  _.times(4, row => {
    _.times(25, column => {
      let newValue;
      do {
        newValue = Math.floor(Math.random() * 9) + 1;
      } while (newValue === previousValue); // 确保不与上一个值重复
      previousValue = newValue; // 更新上一个值
      question.value.questionList[row * 25 + column] = new C_BQuestionS3({
        gridRow: row + 1,
        gridColumn: column + 1,
        gridValue: newValue
      });
    })
  })
}
const GetQuestionInfo = async () => {
  if (!props.questionId || props.questionId == "") {
    question.value.questionInfo.questionCode = props.questionCode;
    question.value.questionInfo.questionnaireId = props.questionnaireId;
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.S3);
    CreateRandom()
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
    await formRef.value.validate();
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const response = await apiClient.post('/Questionnaire/SaveQuestionS3', question.value)
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
const checkValueSame = (gridValue: number, value: string) => {
  return question.value.bQuestionS3AList.find(x => x.gridIcon == value && x.gridValue != gridValue);
}
const validateEmpty = (fieldName: string, gridValue: number = 0, field: string = "") => {
  return async (_rule: any, value: any) => {
    if (!value && value !== 0) {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    if (field == 'icon') {
      var sameGrid = checkValueSame(gridValue, value);
      if (sameGrid) {
        return Promise.reject(new Error(`${fieldName}与第${sameGrid.gridValue}图标重复`));
      }
    } else {
      if (typeof value == "number" && (value < 0 || value > 9)) {
        return Promise.reject(new Error(`${fieldName}请输入0-9的整数`));
      }
    }
    return Promise.resolve();
  };
};
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-1/4 h-full">
      <QuestionEdit :_question-info="question.questionInfo" @changed="(data) => { question.questionInfo = data; }">
      </QuestionEdit>
    </div>
    <div class="w-3/4 h-full flex flex-col">
      <div class="w-full flex-auto">
        <div class="w-full h-full flex flex-col pl-8">
          <a-form class="w-full" ref="formRef" :model="question">
            <a-row :gutter="10">
              <a-col class="w-2/13">
                <a-form-item>
                  <a-input :value="`标准图标`" size="large" disabled />
                </a-form-item>
              </a-col>
              <a-col class="w-1/13" v-for="(item, index) in question.bQuestionS3AList">
                <a-form-item :name="['bQuestionS3AList', index, 'gridIcon']"
                  :rules="[{ required: true, type: 'number', validator: validateEmpty(`第${index + 1}个图标`, item.gridValue, 'icon') }]">
                  <a-select size="large" v-model:value="item.gridIcon" option-label-prop="children">
                    <a-select-option v-for="(icon) in 16" :key="icon" :value="icon.toString()">
                      <span class="iconfont text-4xl" :class="`icon-S3_${icon}`"></span>
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col class="w-2/13">
                <a-form-item>
                  <a-button type="primary" size="large" @click="CreateRandom">题目自动随机生成</a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <a-form class="w-full" ref="formRef" :model="question">
            <a-row :gutter="10">
              <a-col class="w-2/13">
                <a-form-item>
                  <a-input :value="`标准图标值`" size="large" disabled />
                </a-form-item>
              </a-col>
              <a-col class="w-1/13" v-for="(item, index) in question.bQuestionS3AList">
                <a-form-item class="flex justify-center items-center">
                  <span class="text-3xl">{{ item.gridValue }}</span>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <a-form ref="formRef" :model="question" :layout="'horizontal'"
            :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
            <template v-for="(row, rowIndex) in 4" :key="rowIndex">
              <a-row :gutter="10">
                <a-col class="w-1/13">
                  <a-form-item>
                    <a-input :value="`第${row}行`" size="large" disabled />
                  </a-form-item>
                </a-col>
                <template v-for="(column, columnIndex) in question.questionList.filter(x => x.gridRow == row)"
                  :key="rowIndex">
                  <a-col class="w-1/13">
                    <a-form-item :name="['questionList', rowIndex, 'gridValue']"
                      :rules="[{ required: true, type: 'number', validator: validateEmpty(`${column.gridRow}-${column.gridColumn}图标`) }]">
                      <a-select size="large" v-model:value="column.gridValue" option-label-prop="children">
                        <a-select-option v-for="(icon) in question.bQuestionS3AList" :key="icon.gridValue"
                          :value="icon.gridValue">
                          <span class="iconfont text-4xl" :class="`icon-S3_${icon.gridIcon}`"></span>
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </template>
              </a-row>
            </template>
          </a-form>
        </div>
      </div>
      <div class="w-full h-20 flex felx-row items-center justify-end">
        <a-space>
          <a-button type="primary" size="large" @click="SaveQuestion">保存</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
