<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">测试结果查询</span>
    </div>
    <div class="w-full h-12 flex flex-row pb-4">
      <a-space :size="20">
        <a-input-search v-model:value="queryText" placeholder="学生/老师/测评编号/试卷名" style="width: 300px"
          @search="TestResultGridQuery" />
        <a-range-picker v-model:value="dateRange" />
        <a-select style="width: 120px" v-model:value="status">
          <a-select-option v-for="item in dataStatusList" :value="item.value">{{ item.description
            }}</a-select-option>
        </a-select>
      </a-space>
    </div>
    <div ref="tableContainer" class="w-full h-[calc(100%-112px)] flex">
      <a-table class="h-full" :columns="columns" :data-source="testResults?.data" :pagination="pagination"
        :scroll="{ y: tableHeight }">
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
          <template v-else-if="column.dataIndex === 'userName'">
            <a-tooltip placement="top">
              <template #title>
                <span>
                  {{ record[column.dataIndex] }}
                </span>
                <br />
                <span>
                  {{ `（${record["userId"]}）` }}
                </span>
              </template>
              <span>
                {{ record[column.dataIndex] }}
              </span>
            </a-tooltip>
          </template>
          <template v-else-if="column.dataIndex === 'gender'">
            <a-tooltip placement="top">
              <template #title>
                <span>
                  {{ EnumHelper.getDescriptionByValue(GerderDescription, record[column.dataIndex]) }}
                </span>
              </template>
              <span>
                {{ EnumHelper.getDescriptionByValue(GerderDescription, record[column.dataIndex]) }}
              </span>
            </a-tooltip>
          </template>
          <template v-else-if="column.dataIndex === 'questionnaireDate'">
            <a-tooltip placement="top">
              <template #title>
                <span>
                  {{ record[column.dataIndex].format('YYYY-MM-DD') }}
                </span>
              </template>
              <span>
                {{ record[column.dataIndex].format('YYYY-MM-DD') }}
              </span>
            </a-tooltip>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button v-show="accountStore.user.isStaff || accountStore.user.isDeveloper" size="small" danger
              type="text" @click="() => { showDeleteConfirm(record); }">
              删除
            </a-button>
            <a-button size="small" type="link"
              @click="() => { currentAnswerId = record['answerId']; setDrawerVisible(true); console.log(currentAnswerId) }">
              详情
            </a-button>
            <a-button size="small" type="link"
              @click="() => { currentAnswerId = record['answerId']; setPDFModalVisible(true) }">
              下载报告
            </a-button>
          </template>

          <template v-else>
            <a-tooltip placement="top">
              <template #title>
                <span>
                  {{ record[column.dataIndex] }}
                </span>
              </template>
              <span>
                {{ record[column.dataIndex] }}
              </span>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-modal v-model:open="modalVisible" width="1000px" title="" centered @ok="() => { setModalVisible(false) }"
    ok-text="关闭" :maskClosable="false" :closable="false" :cancel-button-props="{ style: { display: 'none' } }">
    <img class="w-300" :src="modelImage">
  </a-modal>
  <a-drawer title="测试结果" placement="right" :open="drawerVisible" :destroyOnClose="true"
    @close="() => { setDrawerVisible(false); TestResultGridQuery(); }" :width="tableWidth">
    <QuestionResult :is-current="true" :answer-id="currentAnswerId"></QuestionResult>
  </a-drawer>
  <PdfViewer :src="pdfUrl" :visible="pdfModalVisible" @closed="() => { pdfModalVisible = false }"
    @downloaded="() => { pdfModalVisible = false }" />
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import dayjs from "dayjs";
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import type { DataList } from "@/models/common/DataList";
import { TestResultColumns, type TestResultQueryRow } from "@/models/testResult/TestResultQueryRow";
import QuestionResult from '@/components/questionnaire/QuestionResult.vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useAccountStore } from "@/stores/accountStore";
import { DataStatusEnum } from '@/enums/common/DataStatus';
import { GerderDescription } from '@/enums/GerderEnum'
import { EnumHelper } from '@/utils/EnumHelper'
import PdfViewer from '@/components/pdf/PDFViewer.vue'



const dataStatusList = [
  {
    value: DataStatusEnum.Active,
    description: "已完成"
  },
  {
    value: DataStatusEnum.Draft,
    description: "未完成"
  }
];
const baseURL = import.meta.env.VITE_API_BASE_URL;
const accountStore = useAccountStore();
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

const RemoveTestResult = async (levelCode: string) => {
  try {
    const response = await apiClient.post(`/Questionnaire/RemoveTestResult/${levelCode}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("删除成功！");
      TestResultGridQuery();
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
onMounted(() => {
  TestResultGridQuery();
})
const pdfUrl = computed(() => {
  return `${baseURL}/Static/Pdfs/${currentAnswerId.value}/ELA学习能力测评报告.pdf`
})
//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'answerId',
    'userName',
    'questionnaireDate',
    'teacherName',
    'gender',
    'age',
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
    else if (item.dataIndex == 'gender' || item.dataIndex == 'age') {
      item.width = '80px';
    }
    else {
      item.width = '150px';
    }
    if (item.dataIndex == 'answerId' || item.dataIndex == 'userName' || item.dataIndex == 'teacherName' || item.dataIndex == 'questionnaireDate') {
      item.fixed = 'left';
    }
  })
  columns.push({
    title: '操作',
    dataIndex: 'action',
    ellipsis: true,
    align: "center",
    fixed: 'right',
    width: "220px",
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
const status = computed({
  get: () => tableQueryModel.value.data?.status ?? "",
  set: (value) => {
    if (!tableQueryModel.value.data) {
      tableQueryModel.value.data = { status: "" };
    }
    tableQueryModel.value.data.status = value;
    TestResultGridQuery();
  },
});
const dateRange = computed({
  get: () => [tableQueryModel.value.data?.startDay ? dayjs(tableQueryModel.value.data?.startDay) : null, tableQueryModel.value.data?.endDay ? dayjs(tableQueryModel.value.data?.endDay) : null],
  set: (value) => {
    console.log(value)
    tableQueryModel.value.data && (tableQueryModel.value.data.startDay = value[0] ? value[0].format('YYYY-MM-DD') : null);
    tableQueryModel.value.data && (tableQueryModel.value.data.endDay = value[1] ? value[1].format('YYYY-MM-DD') : null);
    TestResultGridQuery();
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
//Pdf弹框
const pdfModalVisible = ref<boolean>(false);
const setPDFModalVisible = (open: boolean) => {
  pdfModalVisible.value = open;
};
//抽屉
const drawerVisible = ref<boolean>(false);
const setDrawerVisible = (open: boolean) => {
  drawerVisible.value = open;
};
const currentAnswerId = ref<string>("")

const showDeleteConfirm = (data: any) => {
  Modal.confirm({
    title: `确认删除【${data.userName}】的测评结果【${data.answerId}】?`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      RemoveTestResult(data.answerId)
    }
  });
};
</script>