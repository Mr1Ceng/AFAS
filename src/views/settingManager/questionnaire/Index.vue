<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">测评试卷管理</span>
    </div>
    <div class="w-full h-12 pb-4">
      <a-row>
        <a-col flex="auto">
          <a-input-search class="pr-4" v-model:value="queryText" placeholder="试卷编码/试卷名称/试卷版本" style="width: 300px"
            @search="GetQuestionnaireList" /></a-col>
        <a-col flex="100px" class="flex pr-4 justify-end">
          <a-button type="primary" @click="setDrawerVisible(true, '')">新增</a-button>
        </a-col>
      </a-row>
    </div>
    <div class="w-full h-[calc(100%-64px)] flex">
      <div ref="tableContainer" class="w-full h-full pr-4">
        <a-table class="h-full ant-table-striped" :columns="columns" :data-source="filterQuestionnaires"
          :pagination="pagination"
          :row-class-name="(_record: QuestionnaireRow, index: number) => (_record.questionnaireId == currentQuestionnaire.questionnaireId ? 'table-striped' : null)"
          :scroll="{ y: tableHeight }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button size="small" danger type="text" @click="() => { showDeleteConfirm(record); }">
                删除
              </a-button>
              <a-button size="small" type="link" @click="setDrawerVisible(true, record)">
                编辑
              </a-button>
              <a-button size="small" type="link" @click="setDrawerVisible1(true, record)">
                详情
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
  <a-drawer title="测评试卷编辑" placement="right" :open="drawerVisible" :destroyOnClose="true"
    @close="() => { setDrawerVisible(false); }" :width="600">
    <QuestionnaireEdit :questionnaire-id="currentQuestionnaire.questionnaireId"
      @save-success="() => { setDrawerVisible(false); }">
    </QuestionnaireEdit>
  </a-drawer>
  <a-drawer title="测评试卷详情" placement="right" :open="drawerVisible1" :destroyOnClose="true"
    @close="() => { setDrawerVisible1(false); }" width="100%">
    <QuestionQuery :questionnaire-id="currentQuestionnaire.questionnaireId">
    </QuestionQuery>
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel"
import { QuestionnaireColumns, type QuestionnaireRow } from "@/models/questionnaire/QuestionnaireRow";
import _ from "lodash";
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useGlobalStore } from "@/stores/globalStore";
import QuestionQuery from '@/components/questionnaireSetting/QuestionQuery.vue';
import QuestionnaireEdit from '@/components/questionnaireSetting/QuestionnaireEdit.vue';

const globalStore = useGlobalStore();
const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
})
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
});
const Questionnaires = ref<QuestionnaireRow[]>();
const currentQuestionnaire = ref<any>({})
const filterQuestionnaires = computed(() => {
  return Questionnaires.value?.filter(x => x.questionnaireName.includes(queryText.value) || x.versionName.includes(queryText.value) || x.questionnaireId.includes(queryText.value)
  )
})
//#region 获取
const GetQuestionnaireList = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionnaireList')
    console.log('响应:', response)
    if (response.status == 1) {
      Questionnaires.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
//#endregion

//#region 保存
const SaveQuestionnaire = async () => {
  if (!currentQuestionnaire.value || !currentQuestionnaire.value.questionnaireId) {
    return;
  }
  try {
    const response = await apiClient.post('/Questionnaire/SaveQuestionnaire', currentQuestionnaire.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！")
      GetQuestionnaireList()
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

//#endregion

//#region 删除
const RemoveQuestionnaire = async (questionnaireId: number) => {
  try {
    const response = await apiClient.post(`/Questionnaire/RemoveQuestionnaire/${questionnaireId}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("删除成功！");
      GetQuestionnaireList();
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const showDeleteConfirm = (data: any) => {
  Modal.confirm({
    title: `确认删除测评试卷配置【${data.questionnaireId}】AFAS注意力评估	小学版(A)?`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      RemoveQuestionnaire(data.questionnaireId)
    }
  });
};
//#endregion

onMounted(() => {
  GetQuestionnaireList();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'questionnaireId',
    'questionnaireName',
    'versionName',
    'remark',
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      QuestionnaireColumns.find(x => x.dataIndex == item)
    )
  });
  columns.forEach((item) => {
    if (item.dataIndex == 'questionnaireId' || item.dataIndex == 'questionnaireName' || item.dataIndex == 'versionName') {
      item.width = '100px'
    } else {
      item.width = '400px'
    }
    if (item.dataIndex == 'account' || item.dataIndex == 'userName' || item.dataIndex == 'mobile') {
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
    total: Questionnaires.value?.length,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    onChange: (page: number, pageSize: number) => {
      tableQueryModel.value.size = pageSize;
      tableQueryModel.value.index = page - 1;
      GetQuestionnaireList();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion

//详情抽屉
const drawerVisible = ref<boolean>(false);
const setDrawerVisible = (open: boolean, data: any = {}) => {
  drawerVisible.value = open;
  if (open) {
    currentQuestionnaire.value = data;
  } else {
    GetQuestionnaireList();
  }
};

//编辑抽屉
const drawerVisible1 = ref<boolean>(false);
const setDrawerVisible1 = (open: boolean, data: any = {}) => {
  drawerVisible1.value = open;
  if (open) {
    currentQuestionnaire.value = data;
  } else {
    GetQuestionnaireList();
  }
};
</script>

<style scoped>
[data-doc-theme='light'] .ant-table-striped :deep(.table-striped) td {
  background-color: #eeeeee;
}

[data-doc-theme='dark'] .ant-table-striped :deep(.table-striped) td {
  background-color: rgb(29, 29, 29);
}
</style>