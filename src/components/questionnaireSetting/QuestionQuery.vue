<template>
  <div ref="tableContainer" class="w-full h-full">
    <div class="w-full h-12 pb-4">
      <a-row>
        <a-col flex="auto">
        </a-col>
        <a-col flex="100px" class="flex pr-4 justify-end">
          <a-button v-show="questionCodeList.length > 0" type="primary" @click="setModalVisible(true)">新增</a-button>
        </a-col>
      </a-row>
    </div>
    <a-table class="h-full ant-table-striped" :columns="columns" :data-source="questions" :pagination="pagination"
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
  <a-modal v-model:open="modalVisible" width="600px" title="新增题目" centered :maskClosable="false" :closable="false"
    @ok="modalOkClick" ok-text="确认" @cancel="setModalVisible(false)" cancel-text="取消"
    :bodyStyle="{ paddingTop: '20px' }">
    <a-form ref="formRef" :model="addQuestion" :layout="'horizontal'"
      :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
      <a-form-item label="试卷编码" name="questionnaireId">
        <a-input v-model:value="addQuestion.questionnaireId" size="large" disabled />
      </a-form-item>
      <a-form-item label="题目类型" name="questionCode" :rules="[{ required: true, validator: validateEmpty('题目类型') }]">
        <a-select :style="{ marginRight: '16px' }" size="large" ref="select" v-model:value="addQuestion.questionCode">
          <a-select-option v-for="(questionCode, index) in questionCodeList" :value="questionCode.value">
            {{ questionCode.value + " " + questionCode.description }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
  <a-drawer
    :title="currentQuestion.questionId ? `【${currentQuestion.questionId}】${currentQuestion.questionCode} ${currentQuestion.questionName}——编辑` : `题目${currentQuestion.questionCode}新增`"
    placement="right" :open="drawerVisible" :destroyOnClose="true" @close="() => { setDrawerVisible(false); }"
    width="100%">
    <component :is="GetComponent(currentQuestion.questionCode)" :question-id="currentQuestion.questionId"
      :questionnaire-id="currentQuestion.questionnaireId" :question-code="currentQuestion.questionCode"
      @save-success="() => { setDrawerVisible(false); }" />
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
import { QuestionCodeEnum, QuestionCodeDescription } from '@/enums/QuestionCodeEnum';
import { validateEmpty } from '@/utils/AntdHelper';

import QuestionS1Edit from '@/components/questionnaireSetting/QuestionS1Edit.vue'
import QuestionS2Edit from '@/components/questionnaireSetting/QuestionS2Edit.vue'
import QuestionS3Edit from '@/components/questionnaireSetting/QuestionS3Edit.vue'
import QuestionS4Edit from '@/components/questionnaireSetting/QuestionS4Edit.vue'
import QuestionS5Edit from '@/components/questionnaireSetting/QuestionS5Edit.vue'
import QuestionT1Edit from '@/components/questionnaireSetting/QuestionT1Edit.vue'
import QuestionT2Edit from '@/components/questionnaireSetting/QuestionT2Edit.vue'
import QuestionT3Edit from '@/components/questionnaireSetting/QuestionT3Edit.vue'
import { C_BQuestion, type I_BQuestion } from '@/entitys/question/BQuestion';
import { EnumHelper } from '@/utils/EnumHelper';
const questionCodeList = computed(() => {
  let dictionarys = EnumHelper.getEnumDescriptions(QuestionCodeDescription);
  return dictionarys.filter(x => _.every(questions.value, item => item.questionCode !== x.value))
})
const GetComponent = (questionCode: string) => {
  switch (questionCode) {
    case QuestionCodeEnum.S1: return QuestionS1Edit
    case QuestionCodeEnum.S2: return QuestionS2Edit
    case QuestionCodeEnum.S3: return QuestionS3Edit
    case QuestionCodeEnum.S4: return QuestionS4Edit
    case QuestionCodeEnum.S5: return QuestionS5Edit
    case QuestionCodeEnum.T1: return QuestionT1Edit
    case QuestionCodeEnum.T2: return QuestionT2Edit
    case QuestionCodeEnum.T3: return QuestionT3Edit
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
const questions = ref<QuestionRow[]>();
const currentQuestion = ref<any>({})
//#region 获取
const GetQuestionList = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionList/' + props.questionnaireId)
    console.log('响应:', response)
    if (response.status == 1) {
      questions.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
//#endregion

//#region 删除
const RemoveQuestion = async (questionId: number) => {
  try {
    const response = await apiClient.post(`/Questionnaire/RemoveQuestion/${questionId}`)
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
    title: `删除测评题目配置`,
    icon: createVNode(ExclamationCircleOutlined),
    content: `请确认删除【${data.questionId}】${data.questionCode} ${data.questionName}?`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      RemoveQuestion(data.questionId)
    }
  });
};
//#endregion

//#region 新增题目

const addQuestion = ref<I_BQuestion>(new C_BQuestion());

//#endregion
const modalOkClick = () => {
  if (!addQuestion.value.questionCode || addQuestion.value.questionCode == "") {
    message.warn("请选择题目类型");
    return;
  }
  setModalVisible(false);
  setDrawerVisible(true, addQuestion.value as QuestionRow);
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
    total: questions.value?.length,
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
//弹框
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  if (open) {
    if (questionCodeList.value.length == 0) {
      message.warn("该试卷题目类型已饱和");
      return;
    }
    addQuestion.value = new C_BQuestion();
    addQuestion.value.questionCode = questionCodeList.value[0].value
    addQuestion.value.questionnaireId = props.questionnaireId;
  }
  modalVisible.value = open;
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