<script setup lang="ts">

import { computed, ref, watch, inject, type Ref } from 'vue';
import { message, notification } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import _, { forEach } from "lodash";
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
console.log(answerStore)
// #region 接口

const questionInfo = ref<any>({});
const answerInfo = ref<any>({});
const bQuestionT2QList = ref<any[]>([]);
const bQuestionT2AList = ref<any[]>([]);

const questionDiffList = ref<any[]>([]);
const questionSameList = ref<any[]>([]);
import { apiClient } from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionT2 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionT2/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      questionInfo.value = response.data.questionInfo
      answerInfo.value = response.data.answerInfo
      bQuestionT2QList.value = response.data.bQuestionT2QList
      bQuestionT2AList.value = response.data.bQuestionT2AList
      if (bQuestionT2QList.value.length > 0) {
        questionDiffList.value = _.slice(bQuestionT2QList.value, 0, answerInfo.value.number1)
        questionSameList.value = _.slice(bQuestionT2QList.value, answerInfo.value.number1)
        console.log(questionDiffList.value)
        console.log(questionSameList.value)
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
GetQuestionT2();

const SaveAnswerT2 = async () => {
  if (!isComplete.value) {
    loading.value = true;
    message.info("请先完成题目，再提交！")
    return;
  }
  try {
    var list = _.flatten(_.map(bQuestionT2QList.value, item => {
      return _.map(item.questionA, x => {
        return {
          questionSort: item.questionSort,
          answerSort: x
        }
      })
    }))
    const data = {
      answerId: answerStore._answerId,
      questionId: questionInfo.value.questionId,
      number1: diffRightCount.value,
      number2: sameRightCount.value,
      standardScore: result.value,
      remark: remark.value,
      answerList: list
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerT2/' + answerStore._user.userId, data)
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

const diffRightCount = computed(() => {
  return _.sumBy(questionDiffList.value, 'rightCount');
})

const sameRightCount = computed(() => {
  return _.sumBy(questionSameList.value, 'rightCount');
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
const result = computed(() => {
  return diffRightCount.value * 5 + sameRightCount.value * 10;
})
const changeAnswer = (questionSort: number) => {
  var answer = _.find(bQuestionT2QList.value, (x: { questionSort: number; }) => x.questionSort == questionSort);
  var answers = answer.questionA
  var res = 0;
  _.forEach(getAnswerList(questionSort), x => {
    if (_.includes(answers, x.answerSort) && x.isTrue) {
      res++;
    }
  })
  answer.rightCount = res;
  console.log(bQuestionT2QList.value)
}

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

const CurrQuestionSort = ref(1)
const canPlay = ref(true);
const playDiffStatus = ref<string[]>([])
const playSameStatus = ref<string[]>([])
const playDiffCount = ref<number[]>([0, 0, 0, 0, 0])
const playSameCount = ref<number[]>([0, 0, 0])
const AudioDiffRefs = ref<HTMLAudioElement[]>([]);
const AudioSameRefs = ref<HTMLAudioElement[]>([]);

const playAudio = (index: number, type: string) => {
  if (!canPlay.value) return;
  if (type == "Diff") {
    if (AudioDiffRefs.value[index]) {
      AudioDiffRefs.value[index].play();
      canPlay.value = false;
    }
    if (playDiffCount.value[index] == 0) {
      startTimer();
    }
  } else {
    if (AudioSameRefs.value[index]) {
      AudioSameRefs.value[index].play();
      canPlay.value = false;
    }
    if (playSameCount.value[index] == 0) {
      startTimer();
    }
  }
}

const pauseAudio = (index: number, type: string) => {
  if (type == "Diff") {
    if (AudioDiffRefs.value[index]) {
      AudioDiffRefs.value[index].pause();
    }
  } else {
    if (AudioSameRefs.value[index]) {
      AudioSameRefs.value[index].pause();
    }
  }
}

const onAudioEnd = (index: number, type: string) => {
  if (type == "Diff") {
    playDiffCount.value[index]++;
    playDiffStatus.value[index] = 'Ended';
  } else {
    playSameCount.value[index]++;
    playSameStatus.value[index] = 'Ended';
  }
  openNotification("播放完毕，请开始答题！");
  canPlay.value = true;
}

const onAudioPlay = (index: number, type: string) => {
  if (type == "Diff") {
    if (playDiffCount.value[index] != 0 && playDiffStatus.value[index] == 'Ended') {
      message.info(`第${playDiffCount.value[index] + 1}次播放`);
    }
    playDiffStatus.value[index] = "Playing";
    if (index == 0 && playDiffCount.value[index] == 0)
      canChanges.value = false;
  } else {
    if (playSameCount.value[index] != 0 && playSameStatus.value[index] == 'Ended') {
      message.info(`第${playSameCount.value[index] + 1}次播放`);
    }
    playSameStatus.value[index] = "Playing";
  }
}

const onAudioPause = (index: number, type: string) => {
  if (type == "Diff") {
    playDiffStatus.value[index] = "Paused";
  } else {
    playSameStatus.value[index] = "Paused";
  }
}


const getAnswerList = (questionSort: number) => {
  return _.filter(bQuestionT2AList.value, (x: { questionSort: number; }) => x.questionSort == questionSort);
}

const nextClick = (index: number, type: string) => {
  if (type == "Diff") {
    if ((!canPlay.value || !questionDiffList.value[index].questionA || playDiffCount.value[index] == 0)) {
      message.info('请先完成答题！');
      return;
    }
    if (index == questionDiffList.value.length - 1) {
      setModalVisible(true);
    }
  } else {
    if ((!canPlay.value || !questionSameList.value[index].questionA || playSameCount.value[index] == 0)) {
      message.info('请先完成答题！');
      return;
    }
    if (index == questionSameList.value.length - 1) {
      setModalVisible(true);
    }
  }
  CurrQuestionSort.value++;
  resetTimer();
}

const Completed = () => {
  console.log(bQuestionT2QList)
  isComplete.value = true;
  CurrQuestionSort.value++;
}

// #endregion

// #region 指导语弹框

const stepIndex = ref<number>(0);
const getModalInfo = computed(() => {
  const column: string = (stepIndex.value == 0 ? 'instruction' : 'instruction' + (stepIndex.value + 1)).toString();
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
  switch (stepIndex.value) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      Completed();
      break;
    default:
      break;
  }
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
    <div class="w-full flex flex-col justify-start items-center pb-4">
      <div class="w-3/4 flex flex-col justify-between p-4">
        <div class="w-full text-xl flex items-start pb-2 border-b-1 border-gray-300">
          找不同
        </div>
        <div class="w-full text-xl flex items-start pb-2 pt-2 border-b-1 border-gray-300  rounded-xl"
          v-for="(question, questionIndex) in 2">
          <div class="h-14 w-80 text-xl flex items-center">
            <span class="pr-4">{{ `${question}:` }}</span>
            <audio class="w-66" :src="GetAudioUrl(question + 1 + '.mp3')" controls
              controlsList="nodownload noplaybackrate"></audio>
          </div>
          <div class="h-14 w-160 flex justify-between">
            <a-checkbox-group button-style="solid">
              <div class="h-full w-36 text-xl flex items-start" v-for="answer in 4">
                <div class="h-full w-36 text-xl flex items-center rounded-lg cursor-pointer pl-2">
                  <a-checkbox class="text-xl" :value="answer">
                    {{ `${answer}: XXXXXXX` }}</a-checkbox>
                </div>
              </div>
            </a-checkbox-group>
          </div>
          <div class="h-14 w-40 pl-4 flex items-center">
            <a-button size="large">
              下一题
            </a-button>
          </div>
        </div>
        <div class="w-full text-xl flex items-start pb-2 pt-2 border-b-1 border-gray-300">
          找相同
        </div>
        <div class="w-full text-xl flex items-start pb-2 pt-2 border-b-1 border-gray-300  rounded-xl"
          v-for="(question, questionIndex) in 2">
          <div class="h-14 w-80 text-xl flex items-center">
            <span class="pr-4">{{ `${question}:` }}</span>
            <audio class="w-66" :src="GetAudioUrl(question + 1 + '.mp3')" controls
              controlsList="nodownload noplaybackrate"></audio>
          </div>
          <div class="h-14 w-160 flex justify-between">
            <a-checkbox-group button-style="solid">
              <div class="h-full w-36 text-xl flex items-start" v-for="answer in 4">
                <div class="h-full w-36 text-xl flex items-center rounded-lg cursor-pointer pl-2">
                  <a-checkbox class="text-xl" :value="answer">
                    {{ `${answer}: XXXXXXX` }}</a-checkbox>
                </div>
              </div>
            </a-checkbox-group>
          </div>
          <div class="h-14 w-40 pl-4 flex items-center">
            <a-button size="large">
              下一题
            </a-button>
          </div>
        </div>
      </div>
    </div>
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
          <span class="text-base">
            <div v-html="getTipInfo"></div>
          </span>
          <template #header>
            <a-space :size="10">
              <span>
                指导语
              </span>
              <span v-show="stepIndex < 2">
                ——
              </span>
              <span class="text-2xl text-blue-500">
                {{ stepIndex <= 1 ? "找不同" : (stepIndex == 2 ? "找相同" : "") }} </span>
            </a-space>
          </template>
        </a-collapse-panel>
      </a-collapse>
      <div class="w-full flex flex-auto flex-col justify-start items-center">
        <div class="w-full flex flex-col justify-between p-4">
          <div class="w-full text-xl flex items-start pb-2 border-b-1 border-gray-300">
            找不同
          </div>
          <div class="w-full text-xl flex items-start pb-2 pt-2 border-b-1 border-gray-300  rounded-xl"
            :class="CurrQuestionSort == question.questionSort ? 'row-striped' : ''"
            v-for="(question, questionIndex) in questionDiffList">
            <div class="h-14 w-80 text-xl flex items-center">
              <span class="pr-4">{{ `${question.questionSort}:` }}</span>
              <audio class="w-66" ref="AudioDiffRefs" :src="GetAudioUrl(question.questionSort + '.mp3')"
                @ended="onAudioEnd(questionIndex, 'Diff')" @play="onAudioPlay(questionIndex, 'Diff')"
                @pause="onAudioPause(questionIndex, 'Diff')" controls controlsList="nodownload noplaybackrate"></audio>
              <div class="h-10 w-20 pl-4 pr-4 flex items-center justify-center">
                <PlayCircleOutlined class="text-3xl"
                  v-show="CurrQuestionSort == question.questionSort && playDiffStatus[questionIndex] != 'Playing'"
                  @click="playAudio(questionIndex, 'Diff')" />
                <PauseCircleOutlined class="text-3xl"
                  v-show="CurrQuestionSort == question.questionSort && playDiffStatus[questionIndex] == 'Playing'"
                  @click="pauseAudio(questionIndex, 'Diff')" />
              </div>
            </div>
            <div class="h-14 w-160 flex justify-between">
              <a-checkbox-group v-model:value="question.questionA" button-style="solid"
                @change="changeAnswer(question.questionSort)">
                <div class="h-full w-36 text-xl flex items-start"
                  v-for="answer in getAnswerList(question.questionSort)">
                  <div class="h-full w-36 text-xl flex items-center rounded-lg cursor-pointer pl-2"
                    :class="isComplete ? (answer.isTrue ? 'answer-true' : '') : ''">
                    <a-checkbox class="text-xl" :disabled="CurrQuestionSort != question.questionSort"
                      :value="answer.answerSort">
                      {{ `${answer.answerSort}: ${answer.answer}` }}</a-checkbox>
                  </div>
                </div>
              </a-checkbox-group>
            </div>
            <div class="h-14 w-40 pl-4 flex items-center">
              <a-button :disabled="CurrQuestionSort != question.questionSort" size="large"
                @click="nextClick(questionIndex, 'Diff')">
                {{ questionIndex + 1 == answerInfo.number1 ? '完成' : '下一题' }}
              </a-button>
            </div>
          </div>
          <div class="w-full text-xl flex items-start pb-2 pt-2 border-b-1 border-gray-300">
            找相同
          </div>
          <div class="w-full text-xl flex items-start pb-2 pt-2 border-b-1 border-gray-300 rounded-xl"
            :class="CurrQuestionSort == question.questionSort ? 'row-striped' : ''"
            v-for="(question, questionIndex) in questionSameList">
            <div class="h-14 w-80 text-xl flex items-center">
              <span class="pr-4">{{ `${question.questionSort}:` }}</span>
              <audio class="w-66" ref="AudioSameRefs" :src="GetAudioUrl(question.questionSort + '.mp3')"
                @ended="onAudioEnd(questionIndex, 'Same')" @play="onAudioPlay(questionIndex, 'Same')"
                @pause="onAudioPause(questionIndex, 'Same')" controls controlsList="nodownload noplaybackrate"></audio>
              <div class="h-10 w-20 pl-4 pr-4 flex items-center justify-center">
                <PlayCircleOutlined class="text-3xl"
                  v-show="CurrQuestionSort == question.questionSort && playSameStatus[questionIndex] != 'Playing'"
                  @click="playAudio(questionIndex, 'Same')" />
                <PauseCircleOutlined class="text-3xl"
                  v-show="CurrQuestionSort == question.questionSort && playSameStatus[questionIndex] == 'Playing'"
                  @click="pauseAudio(questionIndex, 'Same')" />
              </div>
            </div>
            <div class="h-14 w-160 flex justify-between">
              <a-checkbox-group v-model:value="question.questionA" button-style="solid"
                @change="changeAnswer(question.questionSort)">
                <div class="h-full w-36 text-xl flex items-start"
                  v-for="answer in getAnswerList(question.questionSort)">
                  <div class="h-full w-36 text-xl flex items-center rounded-lg cursor-pointer pl-2"
                    :class="isComplete ? (answer.isTrue ? 'answer-true' : '') : ''">
                    <a-checkbox :disabled="CurrQuestionSort != question.questionSort" :value="answer.answerSort">
                      {{ `${answer.answerSort}: ${answer.answer}` }}</a-checkbox>
                  </div>
                </div>
              </a-checkbox-group>
            </div>
            <div class="h-14 w-40 pl-4 flex items-center">
              <a-button :disabled="CurrQuestionSort != question.questionSort" size="large"
                @click="nextClick(questionIndex, 'Same')">
                {{ questionIndex + 1 == answerInfo.number2 ? '完成' : '下一题' }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full border-t-2 border-gray-300" style="height: 100px;">
        <div class="text-base">注意事项：</div>
        <span class="text-base">
          {{ questionInfo?.precautions }}
        </span>
      </div>
    </a-flex>
    <div class="h-full border-l-2 border-gray-300 p-4 flex flex-col" style="width: 400px;">
      <div v-show="isComplete" class="w-full flex flex-row justify-start items-center pt-4"
        v-for="(question, questionIndex) in questionDiffList">
        <span class="text-lg w-16">题目{{ question.questionSort }}</span>
        <a-input-number disabled class="inputWidth1" v-model:value="question.rightCount" addon-after="个" size="large"
          :min="0" />
        <span v-show="isComplete" class="text-lg w-16 pl-3">得分</span>
        <a-input-number v-show="isComplete" disabled class="inputWidth1" :value="question.rightCount * 5"
          addon-after="分" size="large" :min="0" />
      </div>
      <div v-show="isComplete" class="w-full flex flex-row justify-start items-center pt-4"
        v-for="(question, questionIndex) in questionSameList">
        <span class="text-lg w-16">题目{{ question.questionSort }}</span>
        <a-input-number disabled class="inputWidth1" v-model:value="question.rightCount" addon-after="个" size="large"
          :min="0" />
        <span v-show="isComplete" class="text-lg w-16 pl-3">得分</span>
        <a-input-number v-show="isComplete" disabled class="inputWidth1" :value="question.rightCount * 10"
          addon-after="分" size="large" :min="0" />
      </div>
      <div v-show="isComplete" class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">总得分</span>
        <a-input-number class="inputWidth" v-model:value="result" size="large" :disabled="true" addon-after="分"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">备注</span>
        <a-textarea class="inputWidth" v-model:value="remark" :rows="4" />
      </div>
      <div class="w-full flex flex-row justify-end items-center pt-8">
        <a-button :loading="loading" @click="SaveAnswerT2()" type="primary">
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
          <span v-show="stepIndex < 2">
            ——
          </span>
          <span class="text-2xl text-blue-500">
            {{ stepIndex == 0 ? "找不同" : (stepIndex == 1 ? "找相同" : "") }}
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

.ant-checkbox-wrapper {
  font-size: 20px;
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

[data-doc-theme='light'] .answer-true {
  background-color: var(--color-green-500)
}

[data-doc-theme='dark'] .answer-true {
  background-color: var(--color-green-950)
}
</style>
