<template>
  <div ref="tableContainer" class="w-full h-full">
    <a-table class="h-full ant-table-striped" :columns="columns" :data-source="Questions" :pagination="pagination"
      :row-class-name="(_record: QuestionRow, index: number) => (_record.questionnaireId == currentQuestion.questionnaireId ? 'table-striped' : null)"
      :scroll="{ y: tableHeight }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button size="small" danger type="text" @click="() => { showDeleteConfirm(record); }">
            删除
          </a-button>
          <a-button size="small" type="link" @click="setDrawerVisible(true, record)">
            详情
          </a-button>
        </template>
      </template>
    </a-table>
  </div>
  <a-drawer :title="`测评试卷详情${currentQuestion.questionCode}编辑`" placement="right" :open="drawerVisible"
    :destroyOnClose="true" @close="() => { setDrawerVisible(false); }" width="100%">
    <component :is="GetComponent(currentQuestion.questionCode)" :question-id="currentQuestion.questionId"
      :question-code="currentQuestion.questionCode" @save-success="() => { setDrawerVisible(false); }" />
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel"
import { QuestionColumns, type QuestionRow } from "@/models/questionnaire/QuestionRow";
import _ from "lodash";
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useGlobalStore } from "@/stores/globalStore";
import QuestionEdit from './QuestionS1Edit.vue';

import QuestionS1Edit from '@/components/questionnaireSetting/QuestionS1Edit.vue'
import QuestionS2Edit from '@/components/questionnaireSetting/QuestionS2Edit.vue'
import QuestionS3Edit from '@/components/questionnaireSetting/QuestionS3Edit.vue'
import QuestionS4Edit from '@/components/questionnaireSetting/QuestionS4Edit.vue'
import QuestionS5Edit from '@/components/questionnaireSetting/QuestionS5Edit.vue'
import QuestionT1Edit from '@/components/questionnaireSetting/QuestionT1Edit.vue'
import QuestionT2Edit from '@/components/questionnaireSetting/QuestionT2Edit.vue'
import QuestionT3Edit from '@/components/questionnaireSetting/QuestionT3Edit.vue'
const GetComponent = (questionCode: string) => {
  switch (questionCode) {
    case 'S1': return QuestionS1Edit
    case 'S2': return QuestionS2Edit
    case 'S3': return QuestionS3Edit
    case 'S4': return QuestionS4Edit
    case 'S5': return QuestionS5Edit
    case 'T1': return QuestionT1Edit
    case 'T2': return QuestionT2Edit
    case 'T3': return QuestionT3Edit
    default:
      return null
  }
}
const props = defineProps<{
  questionnaireId: string,
}>()
watch(() => props.questionnaireId, () => {
  GetQuestionList();
})
const globalStore = useGlobalStore();
const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
})
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
});
const Questions = ref<QuestionRow[]>();
const currentQuestion = ref<any>({})
//#region 获取
const GetQuestionList = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionList/' + props.questionnaireId)
    console.log('响应:', response)
    if (response.status == 1) {
      Questions.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
//#endregion

//#region 删除
const RemoveQuestion = async (questionnaireId: number) => {
  try {
    const response = await apiClient.post(`/Question/RemoveQuestion/${questionnaireId}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("删除成功！");
      GetQuestionList();
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
      RemoveQuestion(data.questionnaireId)
    }
  });
};
//#endregion

onMounted(() => {
  GetQuestionList();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    "questionId",
    "questionCode",
    "questionName",
    "questionnaireId",
    "precautions",
    "instruction",
    "instruction2",
    "instruction3",
    "instruction4"
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      QuestionColumns.find(x => x.dataIndex == item)
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
    width: "150px",
  })
  return columns;
});
const pagination = computed(() => {
  return {
    current: tableQueryModel.value.index + 1, // AntD 的分页索引从 1 开始
    pageSize: tableQueryModel.value.size,
    total: Questions.value?.length,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    onChange: (page: number, pageSize: number) => {
      tableQueryModel.value.size = pageSize;
      tableQueryModel.value.index = page - 1;
      GetQuestionList();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion

//编辑抽屉
const drawerVisible = ref<boolean>(false);
const setDrawerVisible = (open: boolean, data: any = {}) => {
  drawerVisible.value = open;
  if (open) {
    currentQuestion.value = data;
  } else {
    GetQuestionList();
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