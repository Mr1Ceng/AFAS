<script setup lang="ts">

import { computed, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { formattedText, getProperty } from '@/utils/CommonHelper'

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

const answerStore = useAnswerStore();
const accountStore = useAccountStore();
console.log(answerStore)
// #region 接口

const questionInfo = ref<any>({});
const questionList = ref<any>([]);

import apiClient from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionS1 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionS1/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1 && response.data.questionList.length > 0) {
      questionInfo.value = response.data.questionInfo
      questionList.value = response.data.questionList
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetQuestionS1();

const SaveAnswerS1 = async () => {
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
    const data = {
      answerId: answerStore.getAnswerId(),
      questionId: questionInfo.value.questionId,
      originScore: middleTimeConsume.value,
      standardScore: result.value,
      remark: remark.value,
      answerList: [
        {
          gridType: "SMALL",
          timeConsume: smallGridTimeConsume.value,
        },
        {
          gridType: "MIDDLE",
          timeConsume: middleGridTimeConsume.value,
        },
        {
          gridType: "LARGE",
          timeConsume: largeGridTimeConsume.value,
        }
      ]
    }
    const response = await apiClient.post('/Questionnaire/SaveAnswerS1/' + accountStore.user.userId, data)
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

const smallGridList = computed(() => {
  return questionList.value.length > 0 ? questionList.value.filter((x: { gridType: string; }) => x.gridType == "SMALL") : []
})
const middleGridList = computed(() => {
  return questionList.value.length > 0 ? questionList.value.filter((x: { gridType: string; }) => x.gridType == "MIDDLE") : []
})
const largeGridList = computed(() => {
  return questionList.value.length > 0 ? questionList.value.filter((x: { gridType: string; }) => x.gridType == "LARGE") : []
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

const smallGridTimeConsume = ref<number>(0);
const middleGridTimeConsume = ref<number>(0);
const largeGridTimeConsume = ref<number>(0);
const remark = ref<string>("");
const middleTimeConsume = computed(() => {
  return [smallGridTimeConsume.value, middleGridTimeConsume.value, largeGridTimeConsume.value].sort((a: number, b: number) => a - b)[1];
})
const result = computed(() => {
  return middleTimeConsume.value > 50 ? 60 - (middleTimeConsume.value - 50) / 2 : 60 + (50 - middleTimeConsume.value) * 2
})

// #endregion

// #region 计时器

const seconds = ref<number>(0);
let timer: number | null = null; // 计时器类型为 number 或 null

const startTimer = (): void => {
  if (!timer) {
    timer = window.setInterval(() => {
      seconds.value++;
    }, 1000);
  }
};

const resetTimer = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  seconds.value = 0;
};

// #endregion

// #region 答题方法

let answer = ref<number[]>([]);
const ClickGrid = (grid: any) => {
  var index = questionList.value.findIndex((x: { gridType: any; gridSort: any; }) => x.gridType == grid.gridType && x.gridSort == grid.gridSort);
  if (index >= 0) {
    if (questionList.value[index].selected || showGridTypes.value.at(-1) != grid.gridType) {
      console.log("格子已选择或者不是当前格子类型")
    } else {
      if (answer.value.length == 0) {
        if (grid.gridValue == 1) {
          questionList.value[index].selected = true;
          answer.value.push(grid.gridValue);
        }
      } else {
        var lastNumber: number = answer.value.at(-1) ?? 0;
        if (grid.gridValue == lastNumber + 1) {
          questionList.value[index].selected = true;
          answer.value.push(grid.gridValue);
          if (answer.value.length == (isDev.value ? 3 : 25)) {
            switch (showGridTypes.value.at(-1)) {
              case "LARGE":
                largeGridTimeConsume.value = seconds.value;
                break;
              case "MIDDLE":
                middleGridTimeConsume.value = seconds.value;
                break;
              case "SMALL":
                smallGridTimeConsume.value = seconds.value;
                isComplete.value = true;
                break;
              default:
                break;
            }
            resetTimer();
            answer.value = [];
            setModalVisible(true);
          }
        }
      }
    }
  }
}

// #endregion

// #region 指导语弹框

const showGridTypes = ref<string[]>([]);
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
  switch (stepIndex.value) {
    case 0:
      showGridTypes.value.push("LARGE");
      startTimer();
      canChanges.value = false;
      break;
    case 1:
      showGridTypes.value.push("MIDDLE");
      startTimer();
      break;
    case 2:
      showGridTypes.value.push("SMALL");
      startTimer();
      break;
    default:
      break;
  }
  stepIndex.value++;
  setModalVisible(false);
}

// #endregion

</script>

<template>
  <a-flex v-show="!modalVisible && stepIndex == 0" class="h-full flex-col" :justify="'center'" :align="'center'">
    <a-flex class="w-3/12 pb-4" :vertical="true" :align="'center'">
      <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
        <div class="w-full h-full border-1 place-items-center grid text-xl cursor-pointer"
          v-for="(grid, index) in smallGridList">
          *
        </div>
      </div>
    </a-flex>
    <div class="w-1/2 pb-4" v-html="getModalInfo"></div>
    <a-button type="primary" @click="modalOkClick">
      确认
    </a-button>
  </a-flex>
  <a-flex v-show="stepIndex != 0" class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-400px)] pl-4 pr-4 overflow-y-scroll" :vertical="true" :justify="'space-between'"
      :align="'flex-start'">
      <a-collapse v-model:activeKey="activeKey" :bordered="false" style="">
        <template #expandIcon="{ isActive }">
          <caret-right-outlined :rotate="isActive ? 90 : 0" />
        </template>
        <a-collapse-panel key="1" header="指导语" :style="'padding-top:0px;border-radius: 4px;border: 0;overflow: hidden'">
          <span class="text-base">
            <div v-html="getTipInfo"></div>
          </span>
        </a-collapse-panel>
      </a-collapse>
      <a-flex class="w-full flex-auto" :justify="'space-between'" :align="'flex-start'">
        <a-flex class="h-full w-5/12" :vertical="true" :align="'center'">
          <span class="text-2xl text-neutral-600">大图</span>
          <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
            <div class="w-full h-full border-1  place-items-center grid text-5xl cursor-pointer"
              v-for="(grid, index) in largeGridList" @click="ClickGrid(grid)"
              :class="grid.selected ? 'bg-green-500' : ''">{{
                (showGridTypes.includes("LARGE") ? grid.gridValue : '*')
              }}
            </div>
          </div>
        </a-flex>
        <a-flex class="h-full w-4/12" :vertical="true" :align="'center'">
          <span class="text-2xl text-neutral-600">中图</span>
          <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
            <div class="w-full h-full border-1  place-items-center grid text-3xl cursor-pointer"
              v-for="(grid, index) in middleGridList" @click="ClickGrid(grid)"
              :class="grid.selected ? 'bg-green-500' : ''">{{
                (showGridTypes.includes("MIDDLE") ?
                  grid.gridValue : '*')
              }}
            </div>
          </div>
        </a-flex>
        <a-flex class="h-full w-3/12" :vertical="true" :align="'center'">
          <span class="text-2xl text-neutral-600">小图</span>
          <div class="w-full aspect-square place-items-center grid grid-cols-5 p-4">
            <div class="w-full h-full border-1  place-items-center grid text-xl cursor-pointer"
              v-for="(grid, index) in smallGridList" @click="ClickGrid(grid)"
              :class="grid.selected ? 'bg-green-500' : ''">
              {{ (showGridTypes.includes("SMALL") ? grid.gridValue : '*') }}
            </div>
          </div>
        </a-flex>
      </a-flex>
      <div class="w-full border-t-2 border-gray-300" style="height: 100px;">
        <div class="text-base">注意事项：</div>
        <span class="text-base">
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
        <span class="text-lg w-16">小图</span>
        <a-input-number class="inputWidth" v-model:value="smallGridTimeConsume" :disabled="true" addon-after="秒"
          size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">中图</span>
        <a-input-number class="inputWidth" v-model:value="middleGridTimeConsume" :disabled="true" addon-after="秒"
          size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">大图</span>
        <a-input-number class="inputWidth" v-model:value="largeGridTimeConsume" :disabled="true" addon-after="秒"
          size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">中间值</span>
        <a-input-number class="inputWidth" v-model:value="middleTimeConsume" :disabled="true" addon-after="秒"
          size="large" :min="0" />
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
        <a-button @click="SaveAnswerS1()">
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
