<script setup lang="ts">

import { computed, ref, watch, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import _ from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
import { useAccountStore } from "@/stores/accountStore";
import SpiralMaze from '../spiralMaze/SpiralMaze.vue'
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
const GetQuestionS4 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionS4/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      questionInfo.value = response.data.questionInfo
      questionList.value = response.data.questionList
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetQuestionS4();
const spiralMazeSetting = ref<any>({});
const GetSpiralMazeSetting = async () => {
  try {
    console.log(accountStore.user)
    const response = await apiClient.post('/SpiralMaze/GetSpiralMaze/' + accountStore.user.age)
    console.log('响应:', response)
    if (response.status == 1) {
      spiralMazeSetting.value = response.data
      if (spiralMazeSetting.value.age != 0) {
        spacing.value = spiralMazeSetting.value.spacing;
        perturbation.value = spiralMazeSetting.value.perturbation;
      }
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetSpiralMazeSetting();

const SaveAnswerS4 = async () => {
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
      timeConsume: timeConsume.value,
      questionImage: questionImage.value,
      answerImage: answerImage.value,
      CrossNumber: crossCount.value,
      standardScore: result.value,
      remark: remark.value
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerS4/' + accountStore.user.userId, data)
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



// #endregion

// #region 监听器

watch(() => props.isCurrent, async (newValue, oldValue) => {
  if (newValue && stepIndex.value == 0) {
    setModalVisible(true);
  }
})

//#endregion

// #region 答题结果

const questionImage = ref<string>("");
const answerImage = ref<string>("");
const errorCount = ref<number>(0);
const crossCount = ref<number>(0);
const remark = ref<string>("");
const timeConsume = ref<number>(0);
const result = computed(() => {
  return 80 - 5 * crossCount.value;
})

// #endregion

// #region 计时器
const maxMin: number = 3;
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

const Completed = () => {
  timeConsume.value = maxMin * 60 - seconds.value;
  console.log(timeConsume.value)
  remark.value = "断线数：" + errorCount.value;
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
    if (spiralMaze.value) {
      spiralMaze.value.reDraw();
    }
  }
  stepIndex.value++;
  setModalVisible(false);
}

// #endregion

// #region 漩涡
const spacing = ref(25);
const perturbation = ref(15);
const spiralMazeContainer = ref<any>();
const spiralMaze = ref<any>();
const spiralMazeHeight = computed(() => {
  return spiralMazeContainer.value?.clientHeight - 150;
});
const spiralMazeWidth = computed(() => {
  return spiralMazeContainer.value?.clientWidth - 150;
});
const handleCrossUpdate = (newCount: number) => {
  crossCount.value = newCount;
}
const handleErrorUpdate = (newCount: number) => {
  errorCount.value = newCount;
  message.error("测试失败，请重试");
}
const getQuestionImage = (image: string) => {
  questionImage.value = image;
}
const getAnswerImage = (image: string) => {
  answerImage.value = image;
}
const started = () => {
  console.log("开始");
}
const finished = (count: number) => {
  crossCount.value = count;
  console.log("结束" + count);
  Completed();
}
// #endregion
</script>

<template>
  <a-flex v-show="!modalVisible && stepIndex == 0" class="h-full flex-col" :justify="'center'" :align="'center'">
    <img class="h-100 pb-4" src="/images/S4-Demo.png">
    <div class="w-1/2 pb-4" v-html="getModalInfo"></div>
    <a-button type="primary" @click="modalOkClick">
      确认
    </a-button>
  </a-flex>
  <a-flex v-show="modalVisible && stepIndex == 0" class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-400px)] pl-4 pr-4 overflow-y-scroll" :vertical="true" :justify="'space-between'"
      :align="'flex-start'">
      <div ref="spiralMazeContainer" class="w-full flex-auto">

      </div>
      <div class="w-full" style="height: 100px;">

      </div>
    </a-flex>
    <div class="h-full " style="width: 400px;">
    </div>
  </a-flex>
  <a-flex v-show="stepIndex >= 1" class="h-full" :justify="'space-between'" :align="'flex-start'">
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
      <div v-show="stepIndex == 1" class="w-full flex-auto flex flex-col justify-center items-center bg-white">
        <SpiralMaze ref="spiralMaze" :initialSpacing="spacing" :initialPerturbation="perturbation"
          :width="spiralMazeWidth" :height="spiralMazeHeight" @update-cross-count="handleCrossUpdate"
          @update-error-count="handleErrorUpdate" @started="started" @finished="finished"
          @get-question-image="getQuestionImage" @get-answer-image="getAnswerImage" />
      </div>
      <div class="w-full flex-auto flex justify-center items-center bg-white">
        <img v-show="stepIndex > 1" :width="spiralMazeWidth" :height="spiralMazeHeight" :src="answerImage">
      </div>
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
        <span class="text-lg w-16">耗时</span>
        <a-input-number class="inputWidth" v-model:value="timeConsume" :disabled="true" addon-after="秒" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">交叉数</span>
        <a-input-number class="inputWidth" v-model:value="crossCount" :disabled="true" addon-after="个" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">断线数</span>
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
        <a-button @click="SaveAnswerS4()">
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

canvas {
  border: 1px solid black;
  margin-top: 10px;
}
</style>
