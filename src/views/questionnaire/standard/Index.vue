<template>
  <div class="h-full w-full">
    <a-table class="ant-table-striped" :dataSource="evaluationStandardList" :columns="columns" :pagination="false"
      :row-class-name="(_record: any, index: number) => (index % 2 === 1 ? 'table-striped' : null)" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

//接口
import apiClient from '@/utils/ApiClientHelper'

//评估标准数据
const evaluationStandardList = ref<any[]>([]);

const GetEvaluationStandardList = async () => {
  try {
    const response = await apiClient.post('/Basic/GetEvaluationStandardList')
    console.log('响应:', response)
    evaluationStandardList.value = response.data
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetEvaluationStandardList();
const columns = [
  { title: '等级编码', dataIndex: 'levelCode', key: 'levelCode', },
  { title: '等级名称', dataIndex: 'levelName', key: 'levelName', },
  { title: '视觉广度', dataIndex: 's1', key: 's1', },
  { title: '视觉稳定性', dataIndex: 's2', key: 's2', },
  { title: '视觉转移', dataIndex: 's3', key: 's3', },
  { title: '手眼协调', dataIndex: 's4', key: 's4', },
  { title: '视觉工作记忆', dataIndex: 's5', key: 's5', },
  { title: '听觉集中', dataIndex: 't1', key: 't1', },
  { title: '听觉分辨', dataIndex: 't2', key: 't2', },
  { title: '听觉记忆', dataIndex: 't3', key: 't3', },
]

</script>

<style scoped>
[data-doc-theme='light'] .ant-table-striped :deep(.table-striped) td {
  background-color: #eeeeee;
}

[data-doc-theme='dark'] .ant-table-striped :deep(.table-striped) td {
  background-color: rgb(29, 29, 29);
}
</style>