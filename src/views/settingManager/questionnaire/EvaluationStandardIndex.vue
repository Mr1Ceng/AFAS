<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">测评标准查询</span>
    </div>
    <div class="w-full h-12 pb-4">
      <a-row>
        <a-col flex="auto">
          <a-input class="pr-4" v-model:value="queryText" allow-clear placeholder="等级编码/等级名称"
            style="width: 200px" /></a-col>
        <a-col flex="100px" class="flex pr-4 justify-end">
          <a-button type="primary" @click="setDrawerVisible(true, '')">新增</a-button>
        </a-col>
      </a-row>
    </div>
    <div ref="tableContainer" class="w-full h-[calc(100%-112px)] flex">
      <a-table class="h-full" :columns="columns" :data-source="filterevaluationStandards" :pagination="pagination"
        :scroll="{ y: tableHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'avatarUrl'">
            <a-popover placement="left">
              <template #content>
                <img class="w-100" :src="record[column.dataIndex]">
              </template>
              <a-button size="small" type="link">
                {{ record[column.dataIndex] ? '查看' : '' }}
              </a-button>
            </a-popover>
          </template>
          <template v-if="column.dataIndex === 'gender'">
            {{ EnumHelper.getDescriptionByValue(GerderDescription, record[column.dataIndex]) }}
          </template>
          <template v-if="column.dataIndex === 'isDeveloper'">
            {{ record[column.dataIndex] ? '是' : '否' }}
          </template>
          <template v-if="column.dataIndex === 'role'">
            {{ EnumHelper.getDescriptionByValue(RoleDescription, record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button size="small" danger type="text" @click="() => { showDeleteConfirm(record); }">
              删除
            </a-button>
            <a-button size="small" type="link" @click="() => { setDrawerVisible(true, record['levelCode']); }">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-drawer title="用户编辑" placement="right" :open="drawerVisible" :destroyOnClose="true"
    @close="() => { setDrawerVisible(false); }" :width="600">
    <EvaluationStandardEdit :levelCode="currentLevelCode" @save-success="saveSuccess"></EvaluationStandardEdit>
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import { EvaluationStandardColumns, type EvaluationStandardRow } from "@/models/evaluationStandard/EvaluationStandardRow";
import EvaluationStandardEdit from '@/components/evaluationStandard/EvaluationStandardEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleDescription, RoleEnum } from '@/enums/RoleEnum';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';

const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
});
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
  sorter: { key: "EvaluationStandardId", value: Sorter.ASC },
  data: {},
});
const evaluationStandards = ref<EvaluationStandardRow[]>([]);
const filterevaluationStandards = computed(() => {
  if (tableQueryModel.value.data?.queryText) {
    return evaluationStandards.value.filter(x => x.levelCode.includes(tableQueryModel.value.data?.queryText) || x.levelName.includes(tableQueryModel.value.data?.queryText));
  }
  return evaluationStandards.value;
});
const GetEvaluationStandardList = async () => {
  try {
    const response = await apiClient.post('/EvaluationStandard/GetEvaluationStandardList', tableQueryModel.value)
    console.log('响应:', response)
    if (response.status == 1) {
      evaluationStandards.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const RemoveEvaluationStandard = async (levelCode: string) => {
  try {
    const response = await apiClient.post(`/EvaluationStandard/RemoveEvaluationStandard/${levelCode}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("删除成功！");
      GetEvaluationStandardList();
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

onMounted(() => {
  GetEvaluationStandardList();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'levelCode',
    'levelName',
    's1',
    's2',
    's3',
    's4',
    's5',
    't1',
    't2',
    't3',
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      EvaluationStandardColumns.find(x => x.dataIndex == item)
    )
  });
  columns.forEach((item) => {
    if (item.dataIndex == 'levelCode' || item.dataIndex == 'levelName') {
      item.fixed = 'left';
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
const pagination = computed(() => {
  return {
    current: tableQueryModel.value.index + 1, // AntD 的分页索引从 1 开始
    pageSize: tableQueryModel.value.size,
    total: evaluationStandards.value?.length,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    onChange: (page: number, pageSize: number) => {
      tableQueryModel.value.size = pageSize;
      tableQueryModel.value.index = page - 1;
      GetEvaluationStandardList();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion

//抽屉
const drawerVisible = ref<boolean>(false);
const setDrawerVisible = (open: boolean, userId: string = '') => {
  drawerVisible.value = open;
  if (open) {
    currentLevelCode.value = userId
  } else {
    GetEvaluationStandardList();
  }
};
const currentLevelCode = ref<string>("")

const saveSuccess = () => {
  setDrawerVisible(false);
}

const showDeleteConfirm = (data: any) => {
  Modal.confirm({
    title: `确认删除测评标准【${data.levelName}】?`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      RemoveEvaluationStandard(data.levelCode)
    }
  });
};
</script>