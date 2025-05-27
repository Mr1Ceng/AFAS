<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">漩涡迷宫配置管理</span>
    </div>
    <div class="w-full h-[calc(100%-64px)] flex">
      <div ref="tableContainer" class="w-1/2 h-full pr-4">
        <a-table class="h-full ant-table-striped" :columns="columns" :data-source="SpiralMazes" :pagination="pagination"
          :row-class-name="(_record: SpiralMazeRow, index: number) => (_record.age == currentSpiralMaze.age ? 'table-striped' : null)"
          :scroll="{ y: tableHeight }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button size="small" danger type="text" @click="() => { showDeleteConfirm(record); }">
                删除
              </a-button>
              <a-button size="small" type="link" @click="ShowDetail(record)">
                编辑
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
      <div class="w-1/2 h-full">
        <div class="w-full h-16 p-4">
          <a-form layout="inline" :model="currentSpiralMaze">
            <a-form-item label="年龄">
              <a-input-number v-model:value="currentSpiralMaze.age" :min="1" style="margin-left: 16px" />
            </a-form-item>
            <a-form-item label="间距">
              <a-input-number v-model:value="currentSpiralMaze.spacing" :min="20" :max="50" style="margin-left: 16px" />
            </a-form-item>
            <a-form-item label="波动程度">
              <a-input-number v-model:value="currentSpiralMaze.perturbation" :min="0" :max="30"
                style="margin-left: 16px" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="SaveSpiralMaze">
                保存
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <SpiralMaze ref="spiralMaze" v-model:spacing="currentSpiralMaze.spacing"
          v-model:perturbation="currentSpiralMaze.perturbation" :width="spiralMazeWidth" :height="spiralMazeHeight"
          :show-control="true" :is-dark-theme="globalStore.isDarkTheme" />
      </div>
    </div>

  </div>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel"
import { SpiralMazeColumns, type SpiralMazeRow } from "@/models/spiralMaze/SpiralMazeRow";
import SpiralMaze from '@/components/spiralMaze/SpiralMaze.vue'
import _ from "lodash";
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useGlobalStore } from "@/stores/globalStore";
import { C_BSpiralMaze, type I_BSpiralMaze } from '@/entitys/question/BSpiralMaze';

const globalStore = useGlobalStore();
const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
})
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
});
const SpiralMazes = ref<SpiralMazeRow[]>();
const GetSpiralMazeList = async () => {
  try {
    const response = await apiClient.post('/SpiralMaze/GetSpiralMazeList')
    console.log('响应:', response)
    if (response.status == 1) {
      SpiralMazes.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const SaveSpiralMaze = async () => {
  if (!currentSpiralMaze.value || !currentSpiralMaze.value.age) {
    return;
  }
  try {
    const response = await apiClient.post('/SpiralMaze/SaveSpiralMaze', currentSpiralMaze.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！")
      GetSpiralMazeList()
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const ShowDetail = (data: SpiralMazeRow) => {
  currentSpiralMaze.value = _.cloneDeep(data);
  if (spiralMaze.value) {
    spiralMaze.value.reDraw();
  }
}


const RemoveSpiralMaze = async (age: number) => {
  try {
    const response = await apiClient.post(`/SpiralMaze/RemoveSpiralMaze/${age}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("删除成功！");
      GetSpiralMazeList();
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const showDeleteConfirm = (data: any) => {
  Modal.confirm({
    title: `确认删除漩涡迷宫配置【${data.age}岁】?`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      RemoveSpiralMaze(data.age)
    }
  });
};
onMounted(() => {
  GetSpiralMazeList();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'age',
    'spacing',
    'perturbation',
    'ringNumber',
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      SpiralMazeColumns.find(x => x.dataIndex == item)
    )
  });
  columns.forEach((item) => {

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
const pagination = computed(() => {
  return {
    current: tableQueryModel.value.index + 1, // AntD 的分页索引从 1 开始
    pageSize: tableQueryModel.value.size,
    total: SpiralMazes.value?.length,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    onChange: (page: number, pageSize: number) => {
      tableQueryModel.value.size = pageSize;
      tableQueryModel.value.index = page - 1;
      GetSpiralMazeList();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion

onMounted(() => {
  setTimeout(() => {
    spiralMazeHeight.value = tableContainer.value?.clientHeight - 132;
    spiralMazeWidth.value = tableContainer.value?.clientWidth;
  }, 50);
})
// #region 漩涡
const spiralMaze = ref<any>();
const spiralMazeHeight = ref(0);
const spiralMazeWidth = ref(0);
const currentSpiralMaze = ref<I_BSpiralMaze>(new C_BSpiralMaze({
  spacing: 30,
  perturbation: 20
}))
// #endregion
</script>

<style scoped>
[data-doc-theme='light'] .ant-table-striped :deep(.table-striped) td {
  background-color: #eeeeee;
}

[data-doc-theme='dark'] .ant-table-striped :deep(.table-striped) td {
  background-color: rgb(29, 29, 29);
}
</style>