<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";

const props = defineProps<{
  questionnaireId?: string
}>()
const questionnaire = ref<any>({})

const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器

watch(() => props.questionnaireId, async (newValue, oldValue) => {

})

//#endregion

//#region 获取信息

const GetQuestionnaireInfo = async () => {
  if (!props.questionnaireId || props.questionnaireId == "") {
    return;
  }
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionnaire/' + props.questionnaireId)
    console.log('响应:', response)
    if (response.status == 1) {
      questionnaire.value = response.data;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const formRef = ref();
const SaveQuestionnaire = async () => {
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
    const response = await apiClient.post('/Questionnaire/SaveQuestionnaire', questionnaire.value)
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
  GetQuestionnaireInfo();
})

//#endregion
const validateEmpty = (fieldName: string) => {
  return async (_rule: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    if (typeof value == "number" && value === 0) {
      return Promise.reject(new Error(`${fieldName} 不能为零`));
    }
    else if (typeof value == "string" && value.trim() === "") {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    return Promise.resolve();
  };
};
const loading = ref<boolean>(false);
</script>

<template>
  <div class="w-full h-full p-4">
    <a-form ref="formRef" :model="questionnaire" :layout="'horizontal'"
      :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
      <a-form-item v-if="questionnaire.questionnaireId" label="试卷编码">
        <a-input v-model:value="questionnaire.questionnaireId" size="large" disabled />
      </a-form-item>
      <a-form-item label="试卷名称" name="questionnaireName"
        :rules="[{ required: true, validator: validateEmpty('试卷名称') }]">
        <a-input v-model:value="questionnaire.questionnaireName" size="large" />
      </a-form-item>
      <a-form-item label="试卷版本" name="versionName" :rules="[{ required: true, validator: validateEmpty('试卷版本') }]">
        <a-input v-model:value="questionnaire.versionName" size="large" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-input v-model:value="questionnaire.remark" size="large" />
      </a-form-item>
      <a-form-item :span="24" style="text-align: right">
        <a-button type="primary" @click='SaveQuestionnaire' :loading="loading">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
