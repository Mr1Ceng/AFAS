<script setup lang="ts">
import type { C_BQuestion } from "@/entitys/question/BQuestion";
import _ from "lodash";
import { validateEmpty } from "@/utils/AntdHelper"
import { ref, watch } from "vue";
const props = defineProps<{
  _questionInfo: C_BQuestion,
}>()
watch(() => props._questionInfo, () => {
  questionInfo.value = props._questionInfo;
})
const emit = defineEmits<{
  (event: 'changed', value: C_BQuestion): void;
}>();
const questionInfo = ref<C_BQuestion>(props._questionInfo)
watch(questionInfo, (newValue) => {
  emit('changed', newValue)
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <a-form ref="formRef" :model="questionInfo" :layout="'horizontal'"
      :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
      <a-form-item v-if="questionInfo.questionId" label="题目编码" name="questionId">
        <a-input v-model:value="questionInfo.questionId" size="large" disabled />
      </a-form-item>
      <a-form-item label="试卷编码" name="questionnaireId">
        <a-input v-model:value="questionInfo.questionnaireId" size="large" disabled />
      </a-form-item>
      <a-form-item label="题目名称" name="questionName" :rules="[{ required: true, validator: validateEmpty('题目名称') }]">
        <a-input v-model:value="questionInfo.questionName" size="large" />
      </a-form-item>
      <a-form-item label="题目类型" name="questionCode" :rules="[{ required: true, validator: validateEmpty('题目类型') }]">
        <a-input v-model:value="questionInfo.questionCode" size="large" disabled />
      </a-form-item>
      <a-form-item label="注意事项" name="precautions" :rules="[{ required: true, validator: validateEmpty('注意事项') }]">
        <a-textarea v-model:value="questionInfo.precautions" size="large" :rows="3" />
      </a-form-item>
      <a-form-item label="指导语1" name="instruction" :rules="[{ required: true, validator: validateEmpty('指导语1') }]">
        <a-textarea v-model:value="questionInfo.instruction" size="large" :rows="3" />
      </a-form-item>
      <a-form-item label="指导语2" name="instruction2" :rules="[{ required: true, validator: validateEmpty('指导语2') }]">
        <a-textarea v-model:value="questionInfo.instruction2" size="large" :rows="3" />
      </a-form-item>
      <a-form-item label="指导语3" name="instruction3" :rules="[{ required: true, validator: validateEmpty('指导语3') }]">
        <a-textarea v-model:value="questionInfo.instruction3" size="large" :rows="3" />
      </a-form-item>
      <a-form-item label="指导语4" name="instruction4" :rules="[{ required: true, validator: validateEmpty('指导语4') }]">
        <a-textarea v-model:value="questionInfo.instruction4" size="large" :rows="3" />
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
