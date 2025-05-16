<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleDescription } from '@/enums/RoleEnum';
import _ from "lodash";



const props = defineProps<{
  levelCode: string
}>()
const evaluationStandard = ref<any>({})

const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器

watch(() => props.levelCode, async (newValue, oldValue) => {

})

//#endregion

//#region 获取信息

const GetEvaluationStandardInfo = async () => {
  if (props.levelCode == "") {
    return;
  }
  try {
    const response = await apiClient.post('/EvaluationStandard/GetEvaluationStandard/' + props.levelCode)
    console.log('响应:', response)
    if (response.status == 1) {
      evaluationStandard.value = response.data;

    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const formRef = ref();
const SaveEvaluationStandard = async () => {
  try {
    await formRef.value.validate();
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const response = await apiClient.post('/EvaluationStandard/SaveEvaluationStandard', evaluationStandard.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      emit("saveSuccess", response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

onMounted(() => {
  GetEvaluationStandardInfo();
})

//#endregion

const validateEmpty = (fieldName: string) => {
  return async (_rule: any, value: string) => {
    console.log(value)
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
</script>

<template>
  <div class="w-full h-full p-4">
    <a-form ref="formRef" :model="evaluationStandard" :layout="'horizontal'"
      :label-col="{ style: { width: '130px', paddingRight: '10px' } }">
      <a-form-item v-if="evaluationStandard.levelCode" label="等级编码">
        <a-input v-model:value="evaluationStandard.levelCode" size="large" disabled />
      </a-form-item>
      <a-form-item label="等级名称" name="levelName" :rules="[{ required: true, validator: validateEmpty('等级名称') }]">
        <a-input :style="{ width: '100%' }" v-model:value="evaluationStandard.levelName" size="large" />
      </a-form-item>
      <a-form-item label="视觉广度" name="s1" :rules="[{ required: true, validator: validateEmpty('视觉广度') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.s1" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="视觉稳定性" name="s2" :rules="[{ required: true, validator: validateEmpty('视觉稳定性') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.s2" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="视觉转移" name="s3" :rules="[{ required: true, validator: validateEmpty('视觉转移') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.s3" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="手眼协调" name="s4" :rules="[{ required: true, validator: validateEmpty('手眼协调') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.s4" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="视觉工作记忆" name="s5" :rules="[{ required: true, validator: validateEmpty('视觉工作记忆') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.s5" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="听觉集中" name="t1" :rules="[{ required: true, validator: validateEmpty('听觉集中') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.t1" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="听觉分辨" name="t2" :rules="[{ required: true, validator: validateEmpty('听觉分辨') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.t2" size="large" :min="0" />
      </a-form-item>
      <a-form-item label="听觉记忆" name="t3" :rules="[{ required: true, validator: validateEmpty('听觉记忆') }]">
        <a-input-number :style="{ width: '100%' }" v-model:value="evaluationStandard.t3" size="large" :min="0" />
      </a-form-item>
      <a-form-item :span="24" style="text-align: right">
        <a-button type="primary" @click='SaveEvaluationStandard'>保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
