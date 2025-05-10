<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">测试结果查询</span>
    </div>
    <div class="w-full h-12 flex flex-row pb-4">
      <a-input-search class="pr-4" v-model:value="queryText" placeholder="学生/老师/试卷名" style="width: 200px"
        @search="TestResultGridQuery" />
      <a-range-picker class="pr-4" v-model:value="dateRange" />
    </div>
    <div ref="tableContainer" class="w-full h-[calc(100%-112px)] flex">
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
            <a-popover placement="left">
              <template #content>
                <img class="w-150" :src="record[column.dataIndex]">
              </template>
              <a-button size="small" type="link"
                @click="() => { modelImage = record[column.dataIndex]; setModalVisible(true); }">
                {{ record[column.dataIndex] ? '查看' : '' }}
              </a-button>
            </a-popover>
          </template>
          <template v-else-if="column.dataIndex === 'questionnaireDate'">
            <span>
              {{ record[column.dataIndex].format('YYYY-MM-DD') }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button size="small" type="link" @click="() => {currentAnswerId = record['answerId'];setDrawerVisible(true);console.log(currentAnswerId) }">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-modal v-model:open="modalVisible" width="1000px" title="" centered @ok="() => { setModalVisible(false) }"
    ok-text="关闭" :maskClosable="false" :closable="false" :cancel-button-props="{ style: { display: 'none' } }">
    <img class="w-300" :src="modelImage">
  </a-modal>
  <a-drawer
    title="测试结果"
    placement="right"
    :open="drawerVisible"
    :destroyOnClose="true"
    @close="()=>{setDrawerVisible(false);TestResultGridQuery();}"
    :width="tableWidth"
  >
    <QuestionResult :is-current="true" :answer-id="currentAnswerId"></QuestionResult>
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted } from 'vue';
import apiClient from '@/utils/ApiClientHelper'
import dayjs from "dayjs";
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import type { DataList } from "@/models/common/DataList";
import { TestResultColumns, type TestResultQueryRow } from "@/models/testResult/TestResultQueryRow";
import QuestionResult from '@/components/questionnaire/QuestionResult.vue'

const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
});
const tableWidth = computed(() => {
  return tableContainer.value?.clientWidth;
});
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
  sorter: { key: "QuestionnaireDate", value: Sorter.DESC },
  data: {},
});
const testResults = ref<DataList<TestResultQueryRow>>();
const TestResultGridQuery = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/TestResultGridQuery', tableQueryModel.value)
    console.log('响应:', response)
    if (response.status == 1) {
      testResults.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

onMounted(()=>{
  TestResultGridQuery();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'userName',
    'questionnaireDate',
    'teacherName',
    'versionName',
    'levelName',
    'suggestedCourseName',
    'radarImage',
    'sImage',
    'tImage',
    'weak',
    'advantage',
    'remark',
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      TestResultColumns.find(x => x.dataIndex == item)
    )
  });
  columns.forEach((item) => {
    if (item.dataIndex == 'advantage' || item.dataIndex == 'weak' || item.dataIndex == 'remark') {
      item.width = '400px';
    }
    else if (item.dataIndex == 'radarImage' || item.dataIndex == 'sImage' || item.dataIndex == 'tImage') {
      item.width = '100px';
    }
    else if (item.dataIndex == 'userName' || item.dataIndex == 'teacherName' || item.dataIndex == 'questionnaireDate' || item.dataIndex == 'versionName' || item.dataIndex == 'suggestedCourseName' || item.dataIndex == 'levelName') {
      item.width = '120px';
    }
    else {
      item.width = '150px';
    }
    if (item.dataIndex == 'userName' || item.dataIndex == 'teacherName' || item.dataIndex == 'questionnaireDate'){
      item.fixed ='left';
    }
  })
  columns.push({
    title: '操作',
    dataIndex: 'action',
    ellipsis: true,
    align: "center",
    fixed: 'right',
    width: "100px",
  })
  return columns;
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
  get: () => [tableQueryModel.value.data?.startDay ? dayjs(tableQueryModel.value.data?.startDay) : null, tableQueryModel.value.data?.endDay ? dayjs(tableQueryModel.value.data?.endDay) : null],
  set: (value) => {
    console.log(value)
    tableQueryModel.value.data && (tableQueryModel.value.data.startDay = value[0] ? value[0].format('YYYY-MM-DD') : null);
    tableQueryModel.value.data && (tableQueryModel.value.data.endDay = value[1] ? value[1].format('YYYY-MM-DD') : null);
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

//弹框
const modelImage = ref<string>("")
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};
//
const drawerVisible = ref<boolean>(false);
  const setDrawerVisible = (open: boolean) => {
    drawerVisible.value = open;
};
const currentAnswerId = ref<string>("")
</script>