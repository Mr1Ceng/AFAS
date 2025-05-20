<script setup lang="ts">

import { computed, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import Nzh from "nzh";
import _, { forEach } from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
import { useAccountStore } from "@/stores/accountStore";
import { CaretRightOutlined } from '@ant-design/icons-vue';
const props = defineProps<{
  questionId: string,
  isCurrent: boolean,
}>()

const canChanges = inject<Ref<boolean>>("canChanges", ref(false));
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const isComplete = ref(false);

const nzhcn = Nzh.cn;
const answerStore = useAnswerStore();
const accountStore = useAccountStore();
console.log(answerStore)
// #region 接口

const questionInfo = ref<any>({});
const questionList = ref<any>([]);
const rowList = ref<any>([]);
import { apiClient } from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionS2 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionS2/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1 && response.data.questionList.length > 0) {
      questionInfo.value = response.data.questionInfo
      questionList.value = response.data.questionList
      if (questionList.value.length > 0) {
        rowList.value = _.map(_.groupBy(questionList.value, "gridRow"), (items, gridRow) => {
          return {
            rowId: gridRow, rowName: nzhcn.encodeS(gridRow),
            succussCount: 0,
            markCount: 0,
            columns:
              _.map(items, items => {
                return {
                  columnId: items.gridColumn,
                  value: items.gridValue,
                  selected: false,
                  isTrue: items.isTrue
                }
              })
          };
        });
      }
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetQuestionS2();

const SaveAnswerS2 = async () => {
  if (!isComplete.value) {
    message.info("请先完成题目，再提交！")
    return;
  }
  if (accountStore.user.userId == "") {
    message.error("用户登录错误，请重新登录");
    return;
  }
  if (accountStore.user.isStaff) {
    message.error("请用学生账号登录");
    return;
  }
  try {
    var list: any = []
    forEach(rowList.value, (row) => {
      forEach(row.columns, (column) => {
        list.push({
          GridRow: row.rowId,
          GridColumn: column.columnId,
          selected: column.selected
        })
      })
    })
    const data = {
      answerId: answerStore.getAnswerId(),
      questionId: questionInfo.value.questionId,
      timeConsume: timeConsume.value,
      markNumber: successCount.value,
      errorNumber: errorCount.value,
      errorRate: errorRate.value,
      standardScore: result.value,
      remark: remark.value,
      answerList: list
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerS2/' + accountStore.user.userId, data)
    console.log('响应:', response)
    if (response.status == 1 && response.data != "") {
      answerStore.setAnswerId(response.data);
      message.success(`保存成功`);
      canChanges.value = true;
    } else {
      message.error(`保存题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// #endregion

// #region 计算属性

const missingCount = computed(() => {
  var count = 0;
  forEach(rowList.value, (row) => {
    forEach(row.columns, (column) => {
      if (!column.selected && column.isTrue)
        count++;
    })
  })
  return count;
})

const successCount = computed(() => {
  var count = 0;
  forEach(rowList.value, (row) => {
    forEach(row.columns, (column) => {
      if (column.selected && column.isTrue)
        count++;
    })
  })
  return count;
})

const errorRate = computed(() => {
  var count = 0;
  forEach(rowList.value, (row) => {
    forEach(row.columns, (column) => {
      if (column.selected)
        count++;
    })
  })

  return count == 0 ? 0 : _.ceil(errorCount.value / count, 2);
})

// #endregion

// #region 监听器

watch(() => props.isCurrent, async (newValue, oldValue) => {
  if (newValue && stepIndex.value == 0) {
    setModalVisible(true);
  }
})

//#endregion

// #region 答题结果

const errorCount = ref<number>(0);
const crossCount = ref<number>(0);
const remark = ref<string>("");
const timeConsume = ref<number>(0);
const result = computed(() => {
  return timeConsume.value == 0 ? 0 : _.floor(160 / (160 + (160 - successCount.value)) / timeConsume.value * 360);
})

// #endregion

// #region 计时器
const maxMin: number = 5;
const seconds = ref<number>(maxMin * 60);
let timer: number | null = null; // 计时器类型为 number 或 null

const startTimer = (): void => {
  if (!timer) {
    timer = window.setInterval(() => {
      seconds.value--;
      if (seconds.value == 0) {
        stopTimer();
        console.log("时间到");
        message.error("时间到");
      }
    }, 1000);
  }
};

const stopTimer = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const resetTimer = (): void => {
  stopTimer();
  seconds.value = maxMin * 60;
};

// #endregion

// #region 答题方法
let currentRow: number = 0;
let currentColumn: number = 0;
const ClickGrid = (rowId: number, column: any) => {
  var rowIndex = rowList.value.findIndex((x: { rowId: number }) => x.rowId == rowId);
  if (rowIndex == -1) {
    console.log("未找到对应行数据")
    return;
  }
  var columnIndex = rowList.value[rowIndex].columns.findIndex((x: { columnId: number }) => x.columnId == column.columnId);
  if (columnIndex >= 0) {
    if (rowList.value[rowIndex].columns[columnIndex].selected) {
      console.log("格子已选择")
    }
    else {
      if (!rowList.value[rowIndex].columns[columnIndex].isTrue) {
        console.log("数字错误")
        errorCount.value++;
      }
      if (rowList.value[currentRow].columns.findIndex((x: { selected: any; isTrue: any; }) => !x.selected && x.isTrue) != -1 && (currentRow != rowIndex || (currentRow == rowIndex && currentColumn > columnIndex))) {
        console.log("跨行或回头")
        crossCount.value++;
      }
      rowList.value[rowIndex].columns[columnIndex].selected = true;
      rowList.value[rowIndex].succussCount = rowList.value[rowIndex].columns.filter((x: { selected: boolean; isTrue: boolean; }) => x.selected && x.isTrue).length
      rowList.value[rowIndex].markCount = rowList.value[rowIndex].columns.filter((x: { selected: boolean; }) => x.selected).length
      currentRow = rowIndex;
      currentColumn = _.findLastIndex(rowList.value[rowIndex].columns, (item: any) => item.selected);
    }
  }
}

const Completed = () => {
  timeConsume.value = _.ceil(maxMin - seconds.value / 60);
  console.log(timeConsume.value)
  remark.value = "跨行数：" + crossCount.value + "；遗漏数：" + missingCount.value;
  stopTimer();
  isComplete.value = true;
  setModalVisible(true);
}

// #endregion

// #region 指导语弹框

const stepIndex = ref<number>(0);
const getModalInfo = computed(() => {
  const column: string = (stepIndex.value == 0 ? 'instruction' : 'instruction' + (stepIndex.value + 1)).toString();
  return formattedText(questionInfo.value[column])
})
const getTipInfo = computed(() => {
  const column: string = ((stepIndex.value - 1) == 0 ? 'instruction' : 'instruction' + (stepIndex.value)).toString();
  return formattedText(questionInfo.value[column])
})

const activeKey = ref(['1']);
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};
setModalVisible(true);

const modalOkClick = () => {
  if (stepIndex.value == 0) {
    startTimer();
    canChanges.value = false;
  }
  stepIndex.value++;
  setModalVisible(false);
}

// #endregion
</script>

<template>
  <a-flex v-show="!modalVisible && stepIndex == 0" class="h-full flex-col" :justify="'center'" :align="'center'">
    <a-flex class="w-[calc(100%-400px)] pl-4 pr-4 pb-4" :vertical="true" :justify="'space-between'"
      :align="'flex-start'">
      <a-flex class="w-full flex-auto" :vertical="true" :justify="'center'" :align="'flex-start'">
        <a-flex class="w-full" :justify="'center'" :align="'flex-start'">
          <a-flex class="h-7 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">行</span>
          </a-flex>
          <a-flex class="h-7 flex-auto border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">题目</span>
          </a-flex>
          <a-flex class="h-7 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">个数</span>
          </a-flex>
        </a-flex>
        <a-flex class="w-full h-7" v-for="row in 12" :key="row" :justify="'center'" :align="'flex-start'">
          <a-flex class="h-7 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">{{ nzhcn.encodeS(row) }}</span>
          </a-flex>
          <a-flex class="h-7 flex-auto border-1" :justify="'space-around'" :align="'center'">
            <div class="flex justify-center text-xl hover:bg-sky-500 cursor-pointer" v-for="column in 25"
              :class="'w-1/25'">
              *</div>
          </a-flex>
          <a-flex class="h-7 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">*</span>
          </a-flex>
        </a-flex>
      </a-flex>
    </a-flex>
    <div class="w-1/2 pb-4" v-html="getModalInfo"></div>
    <a-button type="primary" @click="modalOkClick">
      确认
    </a-button>
  </a-flex>
  <a-flex v-show="stepIndex != 0" class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-200px)] pl-4 pr-4 overflow-y-scroll" :vertical="true" :justify="'space-between'"
      :align="'flex-start'">
      <a-collapse class="w-full" v-model:activeKey="activeKey" :bordered="false" style="">
        <template #expandIcon="{ isActive }">
          <caret-right-outlined :rotate="isActive ? 90 : 0" />
        </template>
        <a-collapse-panel key="1" header="指导语" :style="'padding-top:0px;border-radius: 4px;border: 0;overflow: hidden'">
          <span class="text-base">
            <div v-html="getTipInfo"></div>
          </span>
        </a-collapse-panel>
      </a-collapse>
      <a-flex class="w-full" :vertical="true" :justify="'center'" :align="'flex-start'">
        <a-flex class="w-full" :justify="'center'" :align="'flex-start'">
          <a-flex class="h-7 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">行</span>
          </a-flex>
          <a-flex class="h-7 flex-auto border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">题目</span>
          </a-flex>
          <a-flex class="h-7 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">个数</span>
          </a-flex>
        </a-flex>
        <a-flex class="w-full h-9" v-for="row in rowList" :key="row.rowId" :justify="'center'" :align="'flex-start'">
          <a-flex class="h-9 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-xl">{{ row.rowName }}</span>
          </a-flex>
          <a-flex class="h-9 flex-auto border-1" :justify="'space-around'" :align="'center'">
            <div class="flex justify-center text-3xl hover:bg-sky-500 cursor-pointer" v-for="column in row.columns"
              @click="ClickGrid(row.rowId, column)"
              :class="`w-1/39` + (column.selected ? (column.isTrue ? ' bg-green-500' : ' bg-red-500') : '')">
              <span>
                {{ stepIndex == 0 ? '' : column.value }}
              </span>
            </div>
          </a-flex>
          <a-flex class="h-9 w-20 border-1" :justify="'center'" :align="'center'">
            <span class="text-2xl">{{ row.succussCount ?? 0 }}</span>
          </a-flex>
        </a-flex>
      </a-flex>
      <div class="w-full flex flex-row justify-center items-center" style="height: 50px;">
        <a-button type="primary" @click="Completed()">
          完成
        </a-button>
      </div>
      <div class="w-full border-t-2 border-gray-300" style="height: 100px;">
        <div class="text-base">注意事项：</div>
        <span class="">
          <!-- <div v-html="formattedText(questionInfo?.precautions)"></div> -->
          {{ questionInfo?.precautions }}
        </span>
      </div>
    </a-flex>
    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 200px;">
      <div class="w-full h-40 pt-4 flex justify-center items-center flex-col">
        <span class="text-9xl">{{ seconds }}</span>
      </div>
      <div class="w-full h-60 pt-4 flex flex-col justify-around items-center">
        <span class="text-xl">错误数
          <span class="text-3xl">{{ errorCount }}</span>
        </span>
        <span class="text-xl">跨行数
          <span class="text-3xl">{{ crossCount }}</span>
        </span>
        <span class="text-xl">遗漏数
          <span class="text-3xl">{{ missingCount }}</span>
        </span>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">耗时</span>
        <a-input-number class="inputWidth" v-model:value="timeConsume" :disabled="true" addon-after="分" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">划消数</span>
        <a-input-number class="inputWidth" v-model:value="successCount" :disabled="true" addon-after="个" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">错误数</span>
        <a-input-number class="inputWidth" v-model:value="errorCount" :disabled="true" addon-after="个" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">错误率</span>
        <a-input-number class="inputWidth" v-model:value="errorRate" :disabled="true" addon-after="%" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">得分</span>
        <a-input-number class="inputWidth" v-model:value="result" size="large" :disabled="true" addon-after="分"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">备注</span>
        <a-textarea class="inputWidth" v-model:value="remark" :rows="4" />
      </div>
      <div class="w-full flex flex-row justify-end items-center pt-8">
        <a-button @click="SaveAnswerS2()" type="primary">
          提交
        </a-button>
      </div>
    </div>
  </a-flex>
  <a-modal v-model:open="modalVisible" title="指导语" centered @ok="modalOkClick" ok-text="确认"
    @cancel="setModalVisible(false)" cancel-text="取消" :maskClosable="false" :closable="false"
    :cancel-button-props="stepIndex == 0 ? {} : { style: { display: 'none' } }">
    <div v-html="getModalInfo"></div>
  </a-modal>
</template>

<style scoped>
.inputWidth {
  width: calc(100% - var(--spacing) * 16);
  font-size: var(--text-lg)
    /* 1.125rem = 18px */
  ;
  line-height: var(--tw-leading, var(--text-lg--line-height)
      /* calc(1.75 / 1.125) ≈ 1.5556 */
    );
}
</style>
