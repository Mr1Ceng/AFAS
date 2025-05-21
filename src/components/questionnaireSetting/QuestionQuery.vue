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
          <a-button size="small" type="link" @click="ShowDetail(record)">
            详情
          </a-button>
        </template>
      </template>
    </a-table>
  </div>
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

//#region 保存
const SaveQuestion = async () => {
  if (!currentQuestion.value || !currentQuestion.value.questionnaireId) {
    return;
  }
  try {
    const response = await apiClient.post('/Question/SaveQuestion', currentQuestion.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！")
      GetQuestionList()
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

const ShowDetail = (data: QuestionRow) => {

}
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

</script>

<style scoped>
[data-doc-theme='light'] .ant-table-striped :deep(.table-striped) td {
  background-color: #eeeeee;
}

[data-doc-theme='dark'] .ant-table-striped :deep(.table-striped) td {
  background-color: rgb(29, 29, 29);
}
</style>