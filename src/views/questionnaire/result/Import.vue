<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">测试结果导入</span>
    </div>
    <div class="w-full h-12 flex flex-row pb-4">
      <a-space :size="20">
        <a-input-search v-model:value="queryText" placeholder="学生/老师/测评编号/试卷名" style="width: 300px"
          @search="TestResultImportGridQuery" />
        <a-range-picker v-model:value="dateRange" />
        <a-select style="width: 120px" v-model:value="status">
          <a-select-option v-for="item in dataStatusList" :value="item.value">{{ item.description
          }}</a-select-option>
        </a-select>
        <a-button @click="setModalVisible(true)">添加导入</a-button>
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
          <template v-else-if="column.dataIndex === 'isSuccess'">
            <a-tooltip placement="top">
              <template #title>
                <span>
                  {{ record[column.dataIndex] ? '成功' : '失败' }}
                </span>
              </template>
              <span>
                {{ record[column.dataIndex] ? '成功' : '失败' }}
              </span>
            </a-tooltip>
          </template>
          <template v-else-if="column.dataIndex === 'ImportStamp'">
            <a-tooltip placement="top">
              <template #title>
                <span>
                  {{ record[column.dataIndex].format('YYYY-MM-DD HH:mm:ss') }}
                </span>
              </template>
              <span>
                {{ record[column.dataIndex].format('YYYY-MM-DD HH:mm:ss') }}
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
  <a-modal v-model:open="modalVisible" width="500px" title="导入测评结果" centered @ok="() => { TestResultImport() }"
    ok-text="导入" @cancel="() => { setModalVisible(false) }" cancel-text="取消" :maskClosable="false" :closable="false">
    <a-form ref="formRef" :model="uploadFile" :layout="'horizontal'"
      :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
      <a-form-item>
        <a-upload-dragger :file-list="fileList" :maxCount="1" :before-upload="beforeUpload" @remove="handleRemove"
          @change="handleChange" listType="text">
          <div>
            <p class="ant-upload-drag-icon">
              <inbox-outlined></inbox-outlined>
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此区域</p>
            <p class="ant-upload-hint">
              支持单个excel文件
            </p>
          </div>
        </a-upload-dragger>
      </a-form-item>
      <a-form-item>
        <input type="file" ref="excelFile" @change="updateExcelFile" name="fname">
      </a-form-item>
    </a-form>
  </a-modal>
  <a-drawer title="测试结果" placement="right" :open="drawerVisible" :destroyOnClose="true"
    @close="() => { setDrawerVisible(false); TestResultImportGridQuery(); }" :width="tableWidth">
    <QuestionResult :is-current="true" :answer-id="currentAnswerId"></QuestionResult>
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import dayjs from "dayjs";
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import type { DataList } from "@/models/common/DataList";
import { TestResultImportColumns, type TestResultImportQueryRow } from "@/models/testResult/TestResultImportQueryRow";
import QuestionResult from '@/components/questionnaire/QuestionResult.vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useAccountStore } from "@/stores/accountStore";
import { DataStatusEnum } from '@/enums/common/DataStatus';
import { GerderDescription } from '@/enums/GerderEnum'
import { EnumHelper } from '@/utils/EnumHelper'
import { InboxOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadFile } from 'ant-design-vue';
import _ from 'lodash';
import axios from 'axios';


const dataStatusList = [
  {
    value: -1,
    description: "全部"
  }, {
    value: 0,
    description: "失败"
  },
  {
    value: 1,
    description: "成功"
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
  sorter: { key: "ImportStamp", value: Sorter.DESC },
  data: {
    status: -1
  },
});
const testResults = ref<DataList<TestResultImportQueryRow>>();
const TestResultImportGridQuery = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/TestResultImportGridQuery', tableQueryModel.value)
    console.log('响应:', response)
    if (response.status == 1) {
      testResults.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const TestResultImport = async () => {
  console.log(uploadFile.value)
  try {
    const response = await apiClient.postForm('/Questionnaire/TestResultImport', {
      file: uploadFile.value,
    })
    console.log('响应:', response)
    if (response.status == 1) {
      setModalVisible(false)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

onMounted(() => {
  TestResultImportGridQuery();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'importId',
    'importStamp',
    'isSuccess',
    'importResult',
    'importCount',
    'userName',
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      TestResultImportColumns.find(x => x.dataIndex == item)
    )
  });
  columns.forEach((item) => {
    if (item.dataIndex == 'importId' || item.dataIndex == 'importResult') {
      item.width = '400px';
    }
    else if (item.dataIndex == 'isSuccess' || item.dataIndex == 'importCount') {
      item.width = '100px';
    }
    else if (item.dataIndex == 'importStamp' || item.dataIndex == 'userName') {
      item.width = '120px';
    }
    else {
      item.width = '150px';
    }
    // if (item.dataIndex == 'answerId' || item.dataIndex == 'userName' || item.dataIndex == 'teacherName' || item.dataIndex == 'questionnaireDate') {
    //   item.fixed = 'left';
    // }
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
    TestResultImportGridQuery();
  },
});
const dateRange = computed({
  get: () => [tableQueryModel.value.data?.startDay ? dayjs(tableQueryModel.value.data?.startDay) : null, tableQueryModel.value.data?.endDay ? dayjs(tableQueryModel.value.data?.endDay) : null],
  set: (value) => {
    console.log(value)
    tableQueryModel.value.data && (tableQueryModel.value.data.startDay = value[0] ? value[0].format('YYYY-MM-DD') : null);
    tableQueryModel.value.data && (tableQueryModel.value.data.endDay = value[1] ? value[1].format('YYYY-MM-DD') : null);
    TestResultImportGridQuery();
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
      TestResultImportGridQuery();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion

//#region Excel文件
const fileList = ref<UploadFile[]>([]);
const uploadFile = ref<UploadFile>()
const updateExcelFile = (file: any) => {
  console.log(file)
}

const handleRemove: UploadProps['onRemove'] = file => {
  if (!fileList.value) return;
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};

// 文件验证
const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (!isExcel) {
    message.error('请选择Excel文件上传!');
    return;
  }
  uploadFile.value = file;
  return false;
};

// 处理文件上传
const handleChange = async (info: any) => {
  fileList.value = [...fileList.value, ...info.fileList]; // 更新文件列表
};
//#endregion
//弹框
const modelImage = ref<string>("")
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
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
    }
  });
};
</script>