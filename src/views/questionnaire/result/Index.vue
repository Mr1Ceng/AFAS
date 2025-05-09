<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">测试结果查询</span>
    </div>
    <div class="w-full h-12 flex flex-row pb-4">
      <a-input-search class="pr-4" v-model:value="queryText" placeholder="学生/老师/试卷名" style="width: 200px"
        @search="onSearch" />
      <a-range-picker class="pr-4" v-model:value="dateRange" />
    </div>
    <div ref="tableContainer" class="w-full h-[calc(100%-112px)] bg-white flex">
      <a-table class="h-full" :columns="columns" :data-source="testResults?.data" :pagination="pagination"
        :scroll="{ y: tableHeight }">
        <!-- <template #headerCell="{ column }">
          <template
            v-if="column.dataIndex === 'radarImage' || column.dataIndex === 'sImage' || column.dataIndex === 'tImage'">
            <span>
              qqq
            </span>
          </template>
</template> -->
        <template #bodyCell="{ column, record }">
          <template
            v-if="column.dataIndex === 'radarImage' || column.dataIndex === 'sImage' || column.dataIndex === 'tImage'">
            <img class="w-4 h-4" :src="record">
          </template>
          <template v-else-if="column.key === 'tags'">
            <span>
              <a-tag v-for="tag in record.tags" :key="tag"
                :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'">
                {{ tag.toUpperCase() }}
              </a-tag>
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <span>
              ACTION
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed } from 'vue';
import apiClient from '@/utils/ApiClientHelper'
import dayjs from "dayjs";
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import type { DataList } from "@/models/common/DataList";
import { TestResultColumns, type TestResultQueryRow } from "@/models/testResult/TestResultQueryRow";

const tableContainer = ref<any>();
const tableHeight = computed(() => {
  console.log(tableContainer.value)
  console.log(tableContainer.value?.clientHeight)
  return tableContainer.value?.clientHeight - 150;
});
console.log(11111, TestResultColumns)
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
  sorter: { key: "QuestionnaireDate", value: Sorter.DESC },
  data: {},
});
const testResults = ref<DataList<TestResultQueryRow>>();
const TestResultGridQuery = async () => {
  console.log(tableQueryModel.value)
  try {
    const response = await apiClient.post('/Questionnaire/TestResultGridQuery', tableQueryModel.value)
    console.log('响应:', response)
    if (response.status == 1) {
      testResults.value = response.data
      console.log(11111, testResults.value)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
TestResultGridQuery();
const onSearch = () => {
  TestResultGridQuery();
}

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'questionnaireName',
    'versionName',
    'userName',
    'questionnaireDate',
    'teacherName',
    'radarImage',
    'sImage',
    'tImage',
    'weak',
    'advantage',
    'remark',
    'suggestedCourseName',
    'levelName',
  ];
  return TestResultColumns.filter(x => columnsList.includes(x.dataIndex));
});
const queryText = computed({
  get: () => tableQueryModel.value.data?.queryText ?? "",
  set: (value) => {
    if (!tableQueryModel.value.data) {
      tableQueryModel.value.data = { queryText: "" };
    }
    tableQueryModel.value.data.queryText = value;
  },
});
const dateRange = computed({
  get: () => [tableQueryModel.value.data?.startDate ? dayjs(tableQueryModel.value.data?.startDate) : null, tableQueryModel.value.data?.endDate ? dayjs(tableQueryModel.value.data?.endDate) : null],
  set: (value) => {
    console.log(value)
    tableQueryModel.value.data && (tableQueryModel.value.data.startDate = value[0] ? value[0].format('YYYY-MM-DD') : null);
    tableQueryModel.value.data && (tableQueryModel.value.data.endDate = value[1] ? value[1].format('YYYY-MM-DD') : null);
  },
});
const pagination = computed(() => {
  return {
    current: tableQueryModel.value.index + 1, // AntD 的分页索引从 1 开始
    pageSize: tableQueryModel.value.size,
    total: testResults.value?.count,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    onChange: (page: number, pageSize: number) => {
      tableQueryModel.value.size = pageSize;
      tableQueryModel.value.index = page - 1;
      TestResultGridQuery();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion
</script>