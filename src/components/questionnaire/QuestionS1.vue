<script setup lang="ts">

import { computed, watch, reactive, h, ref } from 'vue';
import { message } from 'ant-design-vue';
const props = defineProps<{
  questionId: string
}>()
const questionList = ref<any>([]);
//接口
import apiClient from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionS1 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionS1/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1 && response.data.length > 0) {
      questionList.value = response.data
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetQuestionS1();
const smallGridList = computed(() => {
  return questionList.value.length > 0 ? questionList.value.filter(x => x.gridType == "SMALL") : []
})
const middleGridList = computed(() => {
  return questionList.value.length > 0 ? questionList.value.filter(x => x.gridType == "MIDDLE") : []
})
const largeGridList = computed(() => {
  return questionList.value.length > 0 ? questionList.value.filter(x => x.gridType == "LARGE") : []
})

const smallGridTimeConsume = ref<number>(0);
const middleGridTimeConsume = ref<number>(0);
const largeGridTimeConsume = ref<number>(0);
const remark = ref<string>("");
const middleTimeConsume = computed(() => {
  return [smallGridTimeConsume.value, middleGridTimeConsume.value, largeGridTimeConsume.value].sort((a: number, b: number) => a - b)[1];
})
const result = computed(() => {
  return middleTimeConsume.value > 50 ? 60 - (middleTimeConsume.value - 50) / 2 : 60 + (50 - middleTimeConsume.value) * 2
})
</script>

<template>
  <a-flex class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full flex-auto" :justify="'space-between'" :align="'flex-start'">
      <a-flex class="h-full flex-auto" :justify="'space-between'" :align="'flex-start'">
        <a-flex class="h-full w-3/12" :vertical="true" :align="'center'">
          <span class="text-2xl text-neutral-600">小图</span>
          <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
            <div class="w-full h-full border-1 border-black place-items-center grid text-xl"
              v-for="(grid, index) in smallGridList">{{ grid.gridValue }}
            </div>
          </div>
        </a-flex>
        <a-flex class="h-full w-4/12" :vertical="true" :align="'center'">
          <span class="text-2xl text-neutral-600">中图</span>
          <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
            <div class="w-full h-full border-1 border-black place-items-center grid text-3xl"
              v-for="(grid, index) in middleGridList">{{ grid.gridValue }}</div>
          </div>
        </a-flex>
        <a-flex class="h-full w-5/12" :vertical="true" :align="'center'">
          <span class="text-2xl text-neutral-600">大图</span>
          <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
            <div class="w-full h-full border-1 border-black place-items-center grid text-5xl"
              v-for="(grid, index) in largeGridList">{{ grid.gridValue }}</div>
          </div>
        </a-flex>
      </a-flex>
    </a-flex>
    <div class="h-full border-2 border-sky-600 p-4 flex flex-col  " style="width: 300px;">
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="w-12">小图</span>
        <a-input-number class="inputWidth" v-model:value="smallGridTimeConsume" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="w-12">中图</span>
        <a-input-number class="inputWidth" v-model:value="middleGridTimeConsume" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="w-12">大图</span>
        <a-input-number class="inputWidth" v-model:value="largeGridTimeConsume" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="w-12">备注</span>
        <a-textarea class="inputWidth" v-model:value="remark" :rows="4" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="w-12">中间值</span>
        <a-input-number class="inputWidth" v-model:value="middleTimeConsume" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="w-12">得分</span>
        <a-input-number class="inputWidth" v-model:value="result" size="large" :min="0" />
      </div>
    </div>
  </a-flex>
</template>

<style scoped>
.inputWidth {
  width: calc(100% - var(--spacing) * 12)
}
</style>
