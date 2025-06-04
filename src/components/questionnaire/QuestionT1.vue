<script setup lang="ts">

import { computed, ref, watch, inject, type Ref, onMounted } from 'vue';
import { message, notification } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import _ from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
import { useGlobalStore } from "@/stores/globalStore";
import { useAccountStore } from "@/stores/accountStore";
import { CaretRightOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue';
const props = defineProps<{
  questionId: string,
  isCurrent: boolean,
}>()

const canChanges = inject<Ref<boolean>>("canChanges", ref(false));
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const isComplete = ref(false);
const loading = ref<boolean>(false);

const answerStore = useAnswerStore();
const globalStore = useGlobalStore();
const accountStore = useAccountStore();
const baseURL = globalStore.config.baseURL;
onMounted(() => {
  GetQuestionT1();
})
// #region 接口

const questionInfo = ref<any>({});
const answerInfo = ref<any>({});
const bQuestionT1QList = ref<any[]>([]);
const bQuestionT1AList = ref<any[]>([]);

const number1Question = ref<any>({});
const number2Question = ref<any>({});
const number3Question = ref<any>({});
const storyQuestion = ref<any>([]);
import { apiClient } from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionT1 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionT1/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      questionInfo.value = response.data.questionInfo
      answerInfo.value = response.data.answerInfo
      bQuestionT1QList.value = response.data.bQuestionT1QList
      bQuestionT1AList.value = response.data.bQuestionT1AList
      if (bQuestionT1QList.value.length > 0) {
        number1Question.value = _.find(bQuestionT1QList.value, (x: { questionType: string; }) => x.questionType == 'Number1')
        number2Question.value = _.find(bQuestionT1QList.value, (x: { questionType: string; }) => x.questionType == 'Number2')
        number3Question.value = _.find(bQuestionT1QList.value, (x: { questionType: string; }) => x.questionType == 'Number3')
        storyQuestion.value = _.filter(bQuestionT1QList.value, (x: { questionType: string; }) => x.questionType == 'Story')
      }
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const GetAudioUrl = (fileName: string) => {
  return `${baseURL}/Static/Audios/${props.questionId}/${fileName}`
}

const SaveAnswerT1 = async () => {
  if (!isComplete.value) {
    loading.value = true;
    message.info("请先完成题目，再提交！")
    return;
  }
  try {
    var list = _.map(storyQuestion.value, item => {
      return {
        questionSort: item.questionSort,
        answerSort: item.questionA
      }
    })
    const data = {
      answerId: answerStore._answerId,
      questionId: questionInfo.value.questionId,
      number1: number1Question.value.questionA,
      number2: number2Question.value.questionA,
      number3: number3Question.value.questionA,
      errorNumber: storyErrorCount.value,
      standardScore: result.value,
      remark: remark.value,
      answerList: list
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerT1/' + answerStore._user.userId, data)
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
  loading.value = false;
}
// #endregion

// #region 计算属性

const storyErrorCount = computed(() => {
  var count = 0;
  storyQuestion.value.forEach((question: { questionSort: number; questionA: any; }) => {
    var answer = getAnswerList(question.questionSort).find(x => x.isTrue)
    if (question.questionA != answer.answerSort) {
      count++;
    }
  });
  return count;
})

// #endregion

// #region 监听器

watch(() => number1Question.value?.questionA, async (newValue, oldValue) => {
  number1Question.value.errorCount = Math.abs(newValue - answerInfo.value.number1)
})

watch(() => number2Question.value?.questionA, async (newValue, oldValue) => {
  number2Question.value.errorCount = Math.abs(newValue - answerInfo.value.number2)
})

watch(() => number3Question.value?.questionA, async (newValue, oldValue) => {
  number3Question.value.errorCount = Math.abs(newValue - answerInfo.value.number3)
})

watch(() => props.isCurrent, async (newValue, oldValue) => {
  if (newValue && stepIndex.value == 0) {
    setModalVisible(true);
  }
})

//#endregion

// #region 答题结果

const remark = ref<string>("");
const result = computed(() => {
  return 70 - 5 * (number1Question.value.errorCount + number2Question.value.errorCount + number3Question.value.errorCount + storyErrorCount.value);
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

const stopTimer = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const resetTimer = (): void => {
  stopTimer();
  seconds.value = 0;
};

// #endregion

// #region 答题方法

const canPlay = ref(true)
const playStatus = ref<string[]>(['', '', ''])
const playCount = ref<number[]>([0, 0, 0])
const number1Audio = ref<HTMLAudioElement | null>(null);
const number2Audio = ref<HTMLAudioElement | null>(null);
const storyAudio = ref<HTMLAudioElement | null>(null);

const playAudio = (type: string) => {
  switch (type) {
    case "Number1":
      if (number1Audio.value) {
        number1Audio.value.play();
        canPlay.value = false;
        if (playCount.value[0] == 0) {
          startTimer();
        }
      }
      break;
    case "Number2":
      if (number2Audio.value) {
        number2Audio.value.play();
        canPlay.value = false;
        if (playCount.value[1] == 0) {
          startTimer();
        }
      }
      break;
    case "Story":
      if (storyAudio.value) {
        storyAudio.value.play();
        canPlay.value = false;
        if (playCount.value[2] == 0) {
          startTimer();
        }
      }
      break;
    default:
      break;
  }
}

const pauseAudio = (type: string) => {
  switch (type) {
    case "Number1":
      if (number1Audio.value) {
        number1Audio.value.pause();
      }
      break;
    case "Number2":
      if (number2Audio.value) {
        number2Audio.value.pause();
      }
      break;
    case "Story":
      if (storyAudio.value) {
        storyAudio.value.pause();
      }
      break;
    default:
      break;
  }
}

const onAudioEnd = (type: string) => {
  switch (type) {
    case "Number1":
      openNotification("播放完毕，请开始答题！");
      playCount.value[0]++;
      playStatus.value[0] = 'Ended';
      canPlay.value = true;
      break;
    case "Number2":
      openNotification("播放完毕，请开始答题！");
      playCount.value[1]++;
      playStatus.value[1] = 'Ended';
      canPlay.value = true;
      break;
    case "Story":
      openNotification("播放完毕，请开始答题！");
      playCount.value[2]++;
      playStatus.value[2] = 'Ended';
      break;
    default:
      break;
  }
}

const onAudioPlay = (type: string) => {
  switch (type) {
    case "Number1":
      if (playCount.value[0] != 0 && playStatus.value[0] == 'Ended') {
        message.info(`第${playCount.value[0] + 1}次播放`);
      }
      playStatus.value[0] = "Playing";
      canChanges.value = false;
      break;
    case "Number2":
      if (playCount.value[1] != 0 && playStatus.value[1] == 'Ended') {
        message.info(`第${playCount.value[1] + 1}次播放`);
      }
      playStatus.value[1] = "Playing";
      break;
    case "Story":
      if (playCount.value[2] != 0 && playStatus.value[2] == 'Ended') {
        message.info(`第${playCount.value[2] + 1}次播放`);
      }
      playStatus.value[2] = "Playing";
      break;
    default:
      break;
  }
}

const onAudioPause = (type: string) => {
  switch (type) {
    case "Number1":
      playStatus.value[0] = "Paused";
      break;
    case "Number2":
      playStatus.value[1] = "Paused";
      break;
    case "Story":
      playStatus.value[2] = "Paused";
      break;
    default:
      break;
  }
}

const getAnswerList = (questionSort: number) => {
  return _.filter(bQuestionT1AList.value, (x: { questionSort: number; }) => x.questionSort == questionSort);
}

const nextClick = () => {
  switch (stepIndex.value) {
    case 1:
      if ((!canPlay.value || !number1Question.value.questionA || playCount.value[0] == 0) && !isDev.value) {
        message.info("请先完成第一小题答题！")
        return;
      }
      number1Question.value.timeConsume = seconds.value;
      break;
    case 2:
      if ((!canPlay.value || !number2Question.value.questionA || playCount.value[1] == 0) && !isDev.value) {
        message.info("请先完成第二小题答题！")
        return;
      }
      number2Question.value.timeConsume = seconds.value;
      break;
    default:
      break;
  }
  setModalVisible(true);
  resetTimer();
}

const Completed = () => {
  if ((!number3Question.value?.questionA || (storyQuestion.value.some((item: any) => !("questionA" in item))) || playCount.value[2] == 0) && !isDev.value) {
    message.info("请先完成第三小题答题！");
    return;
  }
  console.log(bQuestionT1QList)
  isComplete.value = true;
  stepIndex.value++;
}

// #endregion

// #region 指导语弹框

const stepIndex = ref<number>(0);
const getModalInfo = computed(() => {
  const column: string = (stepIndex.value <= 0 ? 'instruction' : 'instruction' + (stepIndex.value + 1)).toString();
  return formattedText(questionInfo.value[column])
})
const getTipInfo = computed(() => {
  const column: string = ((stepIndex.value - 1) <= 0 ? 'instruction' : 'instruction' + (stepIndex.value)).toString();
  return formattedText(questionInfo.value[column])
})

const activeKey = ref(['1']);
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean) => {
  modalVisible.value = open;
};
setModalVisible(true);

const modalOkClick = () => {
  stepIndex.value++;
  setModalVisible(false);
}

const openNotification = (message: string) => {
  notification.open({
    message: `提示`,
    description: message,
    placement: 'top'
  });
};
// #endregion

</script>

<template>
  <a-flex v-show="!modalVisible && stepIndex == 0" class="h-full flex-col" :justify="'center'" :align="'center'">
    <a-flex class="w-[calc(100%-400px)] pl-4 pr-4" :vertical="true" :justify="'space-between'" :align="'center'">
      <div class="w-full flex felx-row items-center pl-4 pr-4 pt-2 pb-2 mb-10 border-b-1 border-gray-300 rounded-xl"
        :class="stepIndex == 1 ? 'row-striped' : ''">
        <div class="h-10 w-80 text-xl flex items-center">
          1: 数字“X”出现的次数？
        </div>
        <div class="h-10 w-30">
          <a-input-number addon-after="次" size="large" :min="0" />
        </div>
        <div class="h-14 w-70 pl-4">
          <audio class="w-66" :src="GetAudioUrl('听觉集中-数字题.mp3')" controls
            controlsList="nodownload noplaybackrate"></audio>
        </div>
        <div class="h-10 w-40 pl-4">
          <a-button size="large">
            下一题
          </a-button>
        </div>
      </div>
      <div class="w-full flex felx-row items-center pl-4 pr-4 pt-2 pb-2 mb-30 border-b-1 border-gray-300 rounded-xl"
        :class="stepIndex == 1 ? 'row-striped' : ''">
        <div class="h-10 w-80 text-xl flex items-center">
          2: 数字“Y”出现的次数？
        </div>
        <div class="h-10 w-30">
          <a-input-number addon-after="次" size="large" :min="0" />
        </div>
        <div class="h-14 w-70 pl-4">
          <audio class="w-66" :src="GetAudioUrl('听觉集中-数字题.mp3')" controls
            controlsList="nodownload noplaybackrate"></audio>
        </div>
        <div class="h-10 w-40 pl-4">
          <a-button size="large">
            下一题
          </a-button>
        </div>
      </div>
    </a-flex>
    <div class="w-1/2 pb-4" v-html="getModalInfo"></div>
    <a-button type="primary" @click="modalOkClick">
      确认
    </a-button>
  </a-flex>
  <a-flex v-show="stepIndex != 0" class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-400px)] pl-4 pr-4 overflow-y-scroll" :vertical="true" :justify="'space-between'">
      <a-collapse class="w-full" v-model:activeKey="activeKey" :bordered="false" style="">
        <template #expandIcon="{ isActive }">
          <caret-right-outlined :rotate="isActive ? 90 : 0" />
        </template>
        <a-collapse-panel key="1" :style="'padding-top:0px;border-radius: 4px;border: 0;overflow: hidden'">
          <template #header>
            <a-space :size="10">
              <span>
                指导语
              </span>
              <span>
                ——
              </span>
              <span class="text-2xl text-blue-500">
                {{ stepIndex <= 1 ? "数字题1" : (stepIndex == 2 ? "数字题2" : (stepIndex == 3 ? "故事题（本题有四小题）" : "")) }} </span>
            </a-space>
          </template>
          <span class="text-base">
            <div v-html="getTipInfo"></div>
          </span>
        </a-collapse-panel>
      </a-collapse>
      <div class="w-full flex flex-auto flex-col justify-start items-center">
        <div class="w-full flex felx-row items-center pl-4 pr-4 pt-2 pb-2 border-b-1 border-gray-300 rounded-xl"
          :class="stepIndex == 1 ? 'row-striped' : ''">
          <div class="h-10 w-80 text-xl flex items-center">
            {{ number1Question.questionSort + ": " + number1Question?.questionQ }}
          </div>
          <div class="h-10 w-30">
            <a-input-number :disabled="stepIndex != 1" v-model:value="number1Question.questionA" addon-after="次"
              size="large" :min="0" />
          </div>
          <div class="h-14 w-70 pl-4">
            <audio class="w-66" ref="number1Audio" :src="GetAudioUrl('听觉集中-数字题.mp3')" @ended="onAudioEnd('Number1')"
              @play="onAudioPlay('Number1')" @pause="onAudioPause('Number1')" controls></audio>
          </div>
          <div class="h-10 w-20 pl-4 pr-4 flex items-center justify-center">
            <PlayCircleOutlined class="text-3xl" v-show="stepIndex == 1 && playStatus[0] != 'Playing'"
              @click="playAudio('Number1')" />
            <PauseCircleOutlined class="text-3xl" v-show="stepIndex == 1 && playStatus[0] == 'Playing'"
              @click="pauseAudio('Number1')" />
          </div>
          <div class="h-10 w-40 pl-4">
            <a-button :disabled="stepIndex != 1" size="large" @click="() => { nextClick() }">
              下一题
            </a-button>
          </div>
        </div>
        <div class="w-full flex felx-row items-center pl-4 pr-4 pt-2 pb-2 border-b-1 border-gray-300 rounded-xl"
          :class="stepIndex == 2 ? 'row-striped' : ''">
          <div class="h-10 w-80 text-xl flex items-center">
            {{ number2Question.questionSort + ": " + number2Question?.questionQ }}
          </div>
          <div class="h-10 w-30">
            <a-input-number :disabled="stepIndex != 2" v-model:value="number2Question.questionA" addon-after="次"
              size="large" :min="0" />
          </div>
          <div class="h-14 w-70 pl-4">
            <audio class="w-66" ref="number2Audio" :src="GetAudioUrl('听觉集中-数字题.mp3')" @ended="onAudioEnd('Number2')"
              @play="onAudioPlay('Number2')" @pause="onAudioPause('Number2')" controls></audio>
          </div>
          <div class="h-10 w-20 pl-4 pr-4 flex items-center justify-center">
            <PlayCircleOutlined class="text-3xl" v-show="stepIndex == 2 && playStatus[1] != 'Playing'"
              @click="playAudio('Number2')" />
            <PauseCircleOutlined class="text-3xl" v-show="stepIndex == 2 && playStatus[1] == 'Playing'"
              @click="pauseAudio('Number2')" />
          </div>
          <div class="h-10 w-40 pl-4">
            <a-button :disabled="stepIndex != 2" size="large" @click="() => { nextClick() }">
              下一题
            </a-button>
          </div>
        </div>
        <div class="w-full flex felx-row items-center p-4 rounded-t-xl" :class="stepIndex == 3 ? 'row-striped' : ''">
          <div class="h-10 w-80 text-xl flex items-center">
            {{ number3Question.questionSort + ": " + number3Question?.questionQ }}
          </div>
          <div class="h-10 w-30">
            <a-input-number :disabled="stepIndex != 3" v-model:value="number3Question.questionA" addon-after="次"
              size="large" :min="0" />
          </div>
          <div class="h-14 w-70 pl-4">
            <audio class="w-66" ref="storyAudio" :src="GetAudioUrl('听觉集中-文字题.mp3')" @ended="onAudioEnd('Story')"
              @play="onAudioPlay('Story')" @pause="onAudioPause('Story')" controls></audio>
          </div>
          <div class="h-10 w-20 pl-4 pr-4 flex items-center justify-center">
            <PlayCircleOutlined class="text-3xl" v-show="stepIndex == 3 && playStatus[2] != 'Playing'"
              @click="playAudio('Story')" />
            <PauseCircleOutlined class="text-3xl" v-show="stepIndex == 3 && playStatus[2] == 'Playing'"
              @click="pauseAudio('Story')" />
          </div>
        </div>
        <div class="w-full flex felx-row items-start p-4 border-b-1 border-gray-300 rounded-b-xl"
          :class="stepIndex == 3 ? 'row-striped' : ''">
          <div class="w-[calc(100%-160px)] flex flex-col justify-between">
            <div class="w-full text-xl flex items-start pb-2" v-for="question in storyQuestion">
              <div class="h-10 w-80 text-xl flex items-center">
                {{ `${question.questionSort}: ${question.questionQ}` }}
              </div>
              <div class="h-30 w-100 flex flex-col justify-between">
                <div class="h-10 w-full text-xl flex items-start"
                  v-for="answer in getAnswerList(question.questionSort)">
                  <div class="h-10 w-full text-xl flex items-center rounded-lg cursor-pointer pl-2"
                    :class="isComplete ? (answer.isTrue ? 'bg-green-500' : '') : ''">
                    <!-- (answer.answerSort == question.questionA ? 'bg-red-500' : '') -->
                    {{ `${answer.answerSort}: ${answer.answer}` }}
                  </div>
                </div>
              </div>
              <div class="h-10 w-40 pl-4">
                <a-radio-group v-model:value="question.questionA" button-style="solid">
                  <a-radio-button :disabled="stepIndex != 3" v-for="answer in getAnswerList(question.questionSort)"
                    :value="answer.answerSort">
                    {{ `${answer.answerSort}` }}</a-radio-button>
                </a-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full flex flex-row justify-around items-center" style="height: 50px;">
        <a-button type="primary" @click="Completed(); number3Question.timeConsume = seconds; resetTimer();">
          完成
        </a-button>
      </div>
      <div class="w-full border-t-2 border-gray-300" style="height: 100px;">
        <div class="text-base">注意事项：</div>
        <span class="text-base">
          {{ questionInfo?.precautions }}
        </span>
      </div>
    </a-flex>
    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 400px;">
      <div class="w-full h-40 pt-4 flex justify-center items-center flex-col">
        <span class="text-8xl">{{
          `${seconds ?? 0}`
          }}</span>
      </div>
      <div class="w-full flex flex-row justify-center items-center pt-4">
        <span class="text-lg w-20">答题耗时</span>
        <a-input disabled class="inputWidth"
          :value="`${number1Question.timeConsume ?? 0}—${number2Question.timeConsume ?? 0}—${number3Question.timeConsume ?? 0}`" />
      </div>
      <div class="w-full flex flex-row justify-center items-center pt-4">
        <span class="text-lg w-20">播放次数</span>
        <a-input disabled class="inputWidth" :value="`${playCount[0]}—${playCount[1]}—${playCount[2]}`" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-20">数字题一</span>
        <a-input-number disabled class="inputWidth1" v-model:value="number1Question.questionA" addon-after="个"
          size="large" :min="0" />
        <span v-show="isComplete" class="text-lg w-16 pl-3">偏差</span>
        <a-input-number v-show="isComplete" disabled class="inputWidth1" v-model:value="number1Question.errorCount"
          addon-after="个" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-20">数字题二</span>
        <a-input-number disabled class="inputWidth1" v-model:value="number2Question.questionA" addon-after="个"
          size="large" :min="0" />
        <span v-show="isComplete" class="text-lg w-16 pl-3">偏差</span>
        <a-input-number v-show="isComplete" disabled class="inputWidth1" v-model:value="number2Question.errorCount"
          addon-after="个" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-20">故事题</span>
        <a-input-number disabled class="inputWidth1" v-model:value="number3Question.questionA" addon-after="个"
          size="large" :min="0" />
        <span v-show="isComplete" class="text-lg w-16 pl-3">偏差</span>
        <a-input-number v-show="isComplete" disabled class="inputWidth1" v-model:value="number3Question.errorCount"
          addon-after="个" size="large" :min="0" />
      </div>
      <div v-show="isComplete" class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-20">语义理解错误题数</span>
        <a-input-number disabled class="inputWidth" :value="storyErrorCount" addon-after="个" size="large" :min="0" />
      </div>
      <div v-show="isComplete" class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">得分</span>
        <a-input-number class="inputWidth" v-model:value="result" size="large" :disabled="true" addon-after="分"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">备注</span>
        <a-textarea class="inputWidth" v-model:value="remark" :rows="4" />
      </div>
      <div class="w-full flex flex-row justify-end items-center pt-8">
        <a-button :loading="loading" @click="SaveAnswerT1()" type="primary">
          提交
        </a-button>
      </div>
    </div>
  </a-flex>
  <a-modal v-model:open="modalVisible" centered @ok="modalOkClick" ok-text="确认" @cancel="setModalVisible(false)"
    cancel-text="取消" :maskClosable="false" :closable="false"
    :cancel-button-props="stepIndex == 0 ? {} : { style: { display: 'none' } }">
    <template #title>
      <div class="flex flex-row items-center">
        <a-space :size="10">
          <span>
            指导语
          </span>
          <span>
            ——
          </span>
          <span class="text-2xl text-blue-500">
            {{ stepIndex == 0 ? "数字题1" : (stepIndex == 1 ? "数字题2" : (stepIndex == 2 ? "故事题（本题有四小题）" : "")) }}
          </span>
        </a-space>
      </div>
    </template>
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

.inputWidth1 {
  width: calc(var(--spacing) * 30);
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

audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-volume-slider,
audio::-webkit-media-controls-mute-button {
  display: none;
}

audio::-webkit-media-controls-seek-back-button,
audio::-webkit-media-controls-seek-forward-button,
audio::-webkit-media-controls-timeline {
  pointer-events: none;
}

[data-doc-theme='light'] .row-striped {
  background-color: #e6f4ff;
}

[data-doc-theme='dark'] .row-striped {
  background-color: #111a2c;
}
</style>
