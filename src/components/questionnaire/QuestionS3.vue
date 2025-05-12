<script setup lang="ts">

import { computed, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import _, { forEach } from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
import { useAccountStore } from "@/stores/accountStore";
import "@/assets/iconfont/iconfont.css";

const props = defineProps<{
  questionId: string,
  isCurrent: boolean,
}>()

const canChanges = inject<Ref<boolean>>("canChanges", ref(false));
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const isComplete = ref(false);

const answerStore = useAnswerStore();
const accountStore = useAccountStore();
const randomNumber = ref(Math.floor(Math.random() * 100));
console.log(answerStore)

// #region 接口

const questionInfo = ref<any>({});
const questionList = ref<any>([]);
const rowList = ref<any>([]);
import apiClient from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionS3 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionS3/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1 && response.data.questionList.length > 0) {
      questionInfo.value = response.data.questionInfo
      questionList.value = response.data.questionList
      if (questionList.value.length > 0) {
        rowList.value = _.map(_.groupBy(questionList.value, "gridRow"), (items, gridRow) => {
          return {
            rowId: gridRow,
            columns:
              _.map(items, items => {
                return {
                  columnId: items.gridColumn,
                  value: items.gridValue,
                  answerValue: 0,
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
GetQuestionS3();

const SaveAnswerS3 = async () => {
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
          Value: column.answerValue
        })
      })
    })
    const data = {
      answerId: answerStore.getAnswerId(),
      questionId: questionInfo.value.questionId,
      timeConsume: timeConsume.value,
      rightNumber: rightCount.value,
      errorNumber: errorCount.value,
      standardScore: result.value,
      remark: remark.value,
      answerList: list
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerS3/' + accountStore.user.userId, data)
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

const rightCount = computed(() => {
  var count = 0;
  forEach(rowList.value, (row) => {
    forEach(row.columns, (column) => {
      if (!(row.reowId == 0 && column.columnId < 10) && column.answerValue == column.value)
        count++;
    })
  })
  return count;
})

const errorCount = computed(() => {
  var count = 0;
  forEach(rowList.value, (row) => {
    forEach(row.columns, (column) => {
      if (!(row.reowId == 0 && column.columnId < 10) && column.answerValue != column.value && column.answerValue != 0)
        count++;
    })
  })
  return count;
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

const remark = ref<string>("");
const timeConsume = ref<number>(0);
const result = computed(() => {
  return rightCount.value + 20;
})

// #endregion

// #region 计时器

const maxMin: number = 2.5;
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
const ClickGrid = (id: number) => {
  if (currentColumn >= 25 || currentRow >= 4)
    return;
  rowList.value[currentRow].columns[currentColumn].answerValue = id;
  if (currentRow == 0 && currentColumn == 9) {
    startTimer();
  }
  currentColumn++;
  if (currentColumn == 25) {
    currentRow++;
    currentColumn = 0;
    if (currentRow == (isDev ? 1 : 4)) {
      timeConsume.value = maxMin * 60 - seconds.value;
      console.log(timeConsume.value)
      stopTimer();
      isComplete.value = true;
      setModalVisible(true);
    }
  }
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
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};
setModalVisible(true);

const modalOkClick = () => {
  if (stepIndex.value == 0) {
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
          <a-flex class="h-24 w-2/25 border-1 pl-4 pr-4" :justify="'center'" :align="'center'">
            <span class="text-xl">限时150秒</span>
          </a-flex>
          <a-flex class="h-24 w-18/25 border-1" :vertical="true" :justify="'center'" :align="'center'">
            <div class="w-full h-16 flex flex-row justify-around items-center border-b-1">
              <div class="w-1/9 flex justify-center items-center" v-for="icon in 9">
                <span class="iconfont text-4xl"
                  :class="`icon-${props.questionId}_${(icon + randomNumber) % 9 + 1}`"></span>
              </div>
            </div>
            <div class="w-full h-8 flex flex-row justify-around items-center">
              <div class="text-xl" v-for="icon in 9">
                {{ icon }}
              </div>
            </div>
          </a-flex>
          <a-flex class="h-24 w-5/25 border-1 pl-6 pr-6" :justify="'center'" :align="'center'">
            <span class="text-xl">前10题为练习部分，不计分</span>
          </a-flex>
        </a-flex>
        <a-flex class="w-full h-32" v-for="row in 2" :key="row" :vertical="true" :justify="'center'"
          :align="'flex-start'">
          <a-flex class="w-full h-16" :justify="'space-around'" :align="'center'">
            <div class="h-full w-1/25 flex justify-center items-center text-3xl border-1" v-for="column in 25">
              <span class="iconfont text-4xl"
                :class="`icon-${props.questionId}_${Math.floor(Math.random() * 10 % 8) + 1}`"></span>
            </div>
          </a-flex>
          <a-flex class="w-full h-16" :justify="'space-around'" :align="'center'">
            <div class="h-full w-1/25 flex justify-center items-center text-3xl border-1" v-for="column in 25">
            </div>
          </a-flex>
        </a-flex>
      </a-flex>
      <div class="w-full flex flex-row justify-around items-center" style="height: 60px;">
        <a-button class="w-20" v-for="icon in 9" type="primary" size="large" @click="ClickGrid(icon)">
          {{ icon }}
        </a-button>
      </div>
    </a-flex>
    <div class="w-1/2 pb-4" v-html="getModalInfo"></div>
    <a-button type="primary" @click="modalOkClick">
      确认
    </a-button>
  </a-flex>
  <a-flex v-show="stepIndex != 0" class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-400px)] pl-4 pr-4" :vertical="true" :justify="'space-between'"
      :align="'flex-start'">
      <div class="w-full border-b-2 border-gray-300 pb-2">
        <span class="text-lg">
          <div v-html="getTipInfo"></div>
        </span>
      </div>
      <a-flex class="w-full flex-auto" :vertical="true" :justify="'center'" :align="'flex-start'">
        <a-flex class="w-full" :justify="'center'" :align="'flex-start'">
          <a-flex class="h-24 w-2/25 border-1 pl-4 pr-4" :justify="'center'" :align="'center'">
            <span class="text-xl">限时150秒</span>
          </a-flex>
          <a-flex class="h-24 w-18/25 border-1" :vertical="true" :justify="'center'" :align="'center'">
            <div class="w-full h-16 flex flex-row justify-around items-center border-b-1">
              <div class="w-1/9 flex justify-center items-center" v-for="icon in 9">
                <span class="iconfont text-4xl" :class="`icon-${props.questionId}_${icon}`"></span>
              </div>
            </div>
            <div class="w-full h-8 flex flex-row justify-around items-center">
              <div class="text-xl" v-for="icon in 9">
                {{ icon }}
              </div>
            </div>
          </a-flex>
          <a-flex class="h-24 w-5/25 border-1 pl-6 pr-6" :justify="'center'" :align="'center'">
            <span class="text-xl">前10题为练习部分，不计分</span>
          </a-flex>
        </a-flex>
        <a-flex class="w-full h-32" v-for="(row, rowIndex) in rowList" :key="row.rowId" :vertical="true"
          :justify="'center'" :align="'flex-start'">
          <a-flex class="w-full h-16" :justify="'space-around'" :align="'center'">
            <div class="h-full w-1/25 flex justify-center items-center text-3xl border-1"
              v-for="(column, columnIndex) in row.columns" :class="((rowIndex == 0 && columnIndex < 10) || stepIndex != 0 ? `iconfont icon-${props.questionId}_${column.value}` : '')
                + (column.answerValue > 0 && !(rowIndex == 0 && columnIndex < 10) ? (column.answerValue == column.value ? ' bg-green-500' : ' bg-red-500') : '')
                + (rowIndex == 0 && columnIndex < 10 ? ' bg-gray-400' : '')"></div>
          </a-flex>
          <a-flex class="w-full h-16" :justify="'space-around'" :align="'center'">
            <div class="h-full w-1/25 flex justify-center items-center text-3xl border-1"
              v-for="(column, columnIndex) in row.columns" :class="(column.answerValue > 0 ? (column.answerValue == column.value ? ' bg-green-500' : ' bg-red-500') : '') +
                (rowIndex == 0 && columnIndex < 10 ? ' bg-gray-400' : '')">{{ column.answerValue == 0 ? '' :
                  column.answerValue }}
            </div>
          </a-flex>
        </a-flex>
      </a-flex>
      <div class="w-full flex flex-row justify-around items-center" style="height: 80px;">
        <a-button class="w-1/12 answerBtn" v-for="icon in 9" type="primary" size="large" @click="ClickGrid(icon)">
          {{ icon }}
        </a-button>
      </div>
      <div class="w-full border-t-2 border-gray-300" style="height: 100px;">
        <div class="text-lg">注意事项：</div>
        <span class="text-lg">
          <!-- <div v-html="formattedText(questionInfo?.precautions)"></div> -->
          {{ questionInfo?.precautions }}
        </span>
      </div>
    </a-flex>
    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 400px;">
      <div class="w-full h-40 pt-4 flex justify-center items-center flex-col">
        <span class="text-9xl">{{ seconds }}</span>
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">耗时</span>
        <a-input-number class="inputWidth" v-model:value="timeConsume" :disabled="true" addon-after="秒" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">正确数</span>
        <a-input-number class="inputWidth" v-model:value="rightCount" :disabled="true" addon-after="个" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">错误数</span>
        <a-input-number class="inputWidth" v-model:value="errorCount" :disabled="true" addon-after="个" size="large"
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
        <a-button @click="SaveAnswerS3()">
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

.answerBtn {
  height: 60px !important;
  font-size: 30px !important;
}
</style>
