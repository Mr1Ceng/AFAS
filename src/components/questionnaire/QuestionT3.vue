<script setup lang="ts">

import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { message, notification } from 'ant-design-vue';
import { PlayCircleOutlined } from '@ant-design/icons-vue';
import { formattedText } from '@/utils/CommonHelper'
import _, { forEach } from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
import { useGlobalStore } from "@/stores/globalStore";
const props = defineProps<{
  questionId: string
}>()
const isComplete = ref(false);
const answerStore = useAnswerStore();
const globalStore = useGlobalStore();
const baseURL = globalStore.baseURL;
console.log(answerStore)
// #region 接口

const questionInfo = ref<any>({});
const questionList = ref<any>({});

const questionForwardList = ref<any[]>([]);
const questionBackwardList = ref<any[]>([]);
import apiClient from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionT3 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionT3/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      questionInfo.value = response.data.questionInfo
      questionList.value = response.data.questionList
      if (questionList.value.length > 0) {
        questionForwardList.value = _.map(_.groupBy(_.filter(questionList.value, x => x.questionType), "level"),
          (items, key) => {
            return {
              key, items
            }
          });
        questionBackwardList.value = _.map(_.groupBy(_.filter(questionList.value, x => !x.questionType), "level"),
          (items, key) => {
            return {
              key, items
            }
          });
        console.log(questionForwardList.value)
        console.log(questionBackwardList.value)
      }
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const GetAudioUrl = (fileName: string) => {
  console.log(fileName)
  return `${baseURL}/Static/Audios/${props.questionId}/${fileName}`
}
GetQuestionT3();

const SaveAnswerT3 = async () => {
  try {
    // var list = _.flatten(_.map(bQuestionT3QList.value, item => {
    //   return _.map(item.questionA, x => {
    //     return {
    //       questionSort: item.questionSort,
    //       answerSort: x
    //     }
    //   })
    // }))
    const data = {
      answerId: answerStore.getAnswerId(),
      questionId: questionInfo.value.questionId,
      // number1: diffRightCount.value,
      // number2: sameRightCount.value,
      standardScore: result.value,
      remark: remark.value,
      // answerList: list
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerT3/' + "User_Mr1Ceng", data)
    console.log('响应:', response)
    if (response.status == 1 && response.data != "") {
      answerStore.setAnswerId(response.data);
      message.success(`保存成功`);
    } else {
      message.error(`保存题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
// #endregion

// #region 计算属性

// const diffRightCount = computed(() => {
//   return _.sumBy(questionDiffList.value, 'rightCount');
// })

// const sameRightCount = computed(() => {
//   return _.sumBy(questionSameList.value, 'rightCount');
// })

// #endregion

// #region 监听器

//#endregion

// #region 答题结果

const remark = ref<string>("");
const result = computed(() => {
  return 10;
})
// const changeAnswer = (questionSort: number) => {
//   var answer = _.find(bQuestionT3QList.value, (x: { questionSort: number; }) => x.questionSort == questionSort);
//   var answers = answer.questionA
//   var res = 0;
//   _.forEach(getAnswerList(questionSort), x => {
//     if (_.includes(answers, x.answerSort) && x.isTrue) {
//       res++;
//     }
//   })
//   answer.rightCount = res;
//   console.log(bQuestionT3QList.value)
// }

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

const currQuestionType = ref<boolean>(true)
const currQuestionLevel = ref<number>(1)
const currQuestionSort = ref<number>(1)
const canPlay = ref(true)
const canAnswer = ref(false)
const AudioForwardRefs = ref<HTMLAudioElement[]>([]);
const AudioBackwardRefs = ref<HTMLAudioElement[]>([]);

const playAudio = (index: number, type: boolean) => {
  if (!canPlay.value) return;
  if (type) {
    if (AudioForwardRefs.value[index]) {
      AudioForwardRefs.value[index].play();
      canPlay.value = false;
    }
  } else {
    if (AudioBackwardRefs.value[index]) {
      AudioBackwardRefs.value[index].play();
      canPlay.value = false;
    }
  }

}

const onAudioEnd = (index: number) => {
  openNotification("播放完毕，请开始答题！");
  canPlay.value = true;
  canAnswer.value = true;
  startTimer();
}

const answerClick = (value: any) => {
  if (!canAnswer.value) return;
  var questionLevel = null;
  var question = null;
  if (currQuestionType.value) {
    questionLevel = questionForwardList.value.find(x => x.key == currQuestionLevel.value)
    if (questionLevel != null && questionLevel.items.length > 0) {
      question = questionForwardList.value.find(x => x.key == currQuestionLevel.value).items.find((x: { questionSort: number; }) => x.questionSort == currQuestionSort.value);
    }
  } else {
    questionLevel = questionBackwardList.value.find(x => x.key == currQuestionLevel.value)
    if (questionLevel != null && questionLevel.items.length > 0) {
      question = questionBackwardList.value.find(x => x.key == currQuestionLevel.value).items.find((x: { questionSort: number; }) => x.questionSort == currQuestionSort.value);
    }
  }
  var answer = (question.answer ? question.answer + '-' : '') + value.toString()

  console.log(1, question.questionA)
  console.log(2, answer)
  question.answer = answer;
  if (_.startsWith(question.questionA, answer)) {
    console.log("正确")
    if (question.answer == question.questionA) {
      questionLevel.isPass = true;
      console.log(`级别${currQuestionLevel},成功`)
      var nextQuestionLevel = (currQuestionType.value ? questionForwardList : questionBackwardList).value.find(x => x.key == currQuestionLevel.value + 1);
      if (nextQuestionLevel == null) {
        console.log("答题结束，进入逆背")
        if (!currQuestionType.value) {
          currQuestionLevel.value = 0;
          currQuestionSort.value = 0;
        } else {
          currQuestionType.value = false;
          currQuestionLevel.value = 1;
          currQuestionSort.value = 1;
        }
        setModalVisible(true);
        canAnswer.value = false;
      } else {
        console.log("进入下一级别")
        currQuestionLevel.value++;
        currQuestionSort.value = 1;
        canAnswer.value = false;
      }
    }
  }
  else {
    console.log(12, "报错")
    if (question.questionSort == 1) {
      console.log("该级别题2")
      currQuestionSort.value++;
      canAnswer.value = false;
    }
    else {
      questionLevel.isPass = false;
      console.log("答题结束，进入逆背")
      if (!currQuestionType.value) {
        currQuestionLevel.value = 0;
        currQuestionSort.value = 0;
      } else {
        currQuestionType.value = false;
        currQuestionLevel.value = 1;
        currQuestionSort.value = 1;
      }
      setModalVisible(true);
      canAnswer.value = false;
    }
  }
}

const Completed = () => {
  isComplete.value = true;
}

// #endregion

// #region 指导语弹框

const stepIndex = ref<number>(0);
const getModalInfo = computed(() => {
  const column: string = (stepIndex.value == 0 ? 'instruction' : 'instruction' + (stepIndex.value + 1)).toString();
  return formattedText(questionInfo.value[column])
})
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
      Completed()
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
  <a-flex class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-400px)] pl-4 pr-4" :vertical="true" :justify="'space-between'" :align="'center'">
      <div class="w-full flex flex-auto flex-row justify-start items-center">
        <div class="w-1/2 h-full flex flex-col p-4">
          <div class="w-full h-14 text-xl flex items-center pb-2 pt-2 border-b-1 border-gray-300">
            <div class="w-20 text-xl flex items-center">
              <span class="">级别</span>
            </div>
            <div class="w-[calc(100%-80px)] flex justify-around">
              <span class="">顺背数测试1</span>
              <span class="">顺背数测试2</span>
            </div>
          </div>
          <div class="w-full h-14 text-xl flex items-center pb-1 pt-1 border-b-1 border-gray-300"
            v-for="(questionLevel, questionLevelIndex) in questionForwardList">
            <div class="w-20 text-xl flex items-center">
              <span class="pl-4">{{ `${questionLevel.key}` }}</span>
            </div>
            <div class="w-[calc(100%-80px)] flex pb-1 pt-1 rounded-xl"
              :class="(currQuestionType && currQuestionLevel == questionLevel.key ? 'bg-blue-100' : '')">
              <div class="w-1/2 h-full pl-2 pr-2" v-for="(question, questionIndex) in questionLevel.items">
                <div class="w-full h-full flex justify-center items-center rounded-2xl"
                  v-show="!isComplete && !questionLevel.isPass && !question.answer">
                  <div class="w-full h-full flex justify-center items-center"
                    v-show="(currQuestionType && currQuestionLevel == questionLevel.key && currQuestionSort == question.questionSort)">
                    <audio class="w-full h-10" ref="AudioForwardRefs"
                      :src="GetAudioUrl(`${question.questionType ? 'True' : 'False'}_${question.questionSort}_${questionLevel.key}.aac`)"
                      @ended="onAudioEnd(question.questionSort)" controls
                      controlsList="nodownload noplaybackrate"></audio>
                    <div v-show="!question.played" style="margin-left: -40px!important;z-index: 999;">
                      <PlayCircleOutlined :style="{ fontSize: '20px' }" class="cursor-pointer"
                        @click="playAudio(questionLevelIndex * 2 + questionIndex, currQuestionType); question.played = true;" />
                    </div>
                  </div>
                </div>
                <div class="w-full h-full flex justify-center items-center rounded-2xl"
                  v-show="!isComplete && question.answer"
                  :class="(question.answer == question.questionA ? 'bg-green-500' : (currQuestionType && currQuestionLevel == questionLevel.key && currQuestionSort == question.questionSort ? 'bg-blue-400 ' : 'bg-red-500'))">
                  {{
                    `${question.answer}` }}</div>
                <div class="w-full h-full flex justify-center items-center rounded-2xl" v-show="isComplete"
                  :class="(question.answer ? (question.answer == question.questionA ? 'bg-green-500' : 'bg-red-500') : '')">
                  {{
                    `${question.answer ?? ''}` }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-1/2 h-full flex flex-col p-4">
          <div class="w-full h-14 text-xl flex items-center pb-2 pt-2 border-b-1 border-gray-300">
            <div class="w-20 text-xl flex items-center">
              <span class="">级别</span>
            </div>
            <div class="w-[calc(100%-80px)] flex justify-around">
              <span class="">逆背数测试1</span>
              <span class="">逆背数测试2</span>
            </div>
          </div>
          <div class="w-full h-14 text-xl flex items-center pb-1 pt-1 border-b-1 border-gray-300"
            v-for="(questionLevel, questionLevelIndex) in questionBackwardList">
            <div class="w-20 text-xl flex items-center">
              <span class="pl-4">{{ `${questionLevel.key}` }}</span>
            </div>
            <div class="w-[calc(100%-80px)] flex pb-1 pt-1 rounded-xl"
              :class="(!currQuestionType && currQuestionLevel == questionLevel.key ? 'bg-blue-100' : '')">
              <div class="w-1/2 h-full pl-2 pr-2" v-for="(question, questionIndex) in questionLevel.items">
                <div class="w-full h-full flex justify-center items-center rounded-2xl"
                  v-show="!isComplete && !questionLevel.isPass && !question.answer">
                  <div class="w-full h-full flex justify-center items-center"
                    v-show="(!currQuestionType && currQuestionLevel == questionLevel.key && currQuestionSort == question.questionSort)">
                    <audio class="w-full h-10" ref="AudioBackwardRefs"
                      :src="GetAudioUrl(`${question.questionType ? 'True' : 'False'}_${question.questionSort}_${questionLevel.key}.aac`)"
                      @ended="onAudioEnd(question.questionSort)" controls
                      controlsList="nodownload noplaybackrate"></audio>
                    <div style="margin-left: -40px!important;z-index: 999;">
                      <PlayCircleOutlined :style="{ fontSize: '20px' }" class="cursor-pointer"
                        @click="playAudio(questionLevelIndex * 2 + questionIndex, currQuestionType); question.played = true;" />
                    </div>
                  </div>
                </div>
                <div class="w-full h-full flex justify-center items-center rounded-2xl"
                  v-show="!isComplete && question.answer"
                  :class="(question.answer == question.questionA ? 'bg-green-500' : (!currQuestionType && currQuestionLevel == questionLevel.key && currQuestionSort == question.questionSort ? 'bg-blue-400 ' : 'bg-red-500'))">
                  {{
                    `${question.answer}` }}</div>
                <div class="w-full h-full flex justify-center items-center rounded-2xl" v-show="isComplete"
                  :class="(question.answer ? (question.answer == question.questionA ? 'bg-green-500' : 'bg-red-500') : '')">
                  {{
                    `${question.answer ?? ''}` }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full flex flex-row justify-around items-center" style="height: 50px;">
        <a-button class="w-16" v-for="item in 9" type="primary" size="large" @click="answerClick(item)">
          {{ item }}
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
      <!-- <div v-show="isComplete" class="w-full flex flex-row justify-start items-center pt-4"
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
      </div> -->
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
        <a-button @click="SaveAnswerT3()">
          提交
        </a-button>
      </div>
    </div>
  </a-flex>
  <a-modal v-model:open="modalVisible" title="指导语" centered @ok="modalOkClick" ok-text="确认" :maskClosable="false"
    :closable="false" :cancel-button-props="{ style: { display: 'none' } }">
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
audio::-webkit-media-controls-pause-button,
audio::-webkit-media-controls-volume-slider,
audio::-webkit-media-controls-mute-button,
audio::-webkit-media-controls-fullscreen-button {
  display: none;
}

audio::-webkit-media-controls-seek-back-button,
audio::-webkit-media-controls-seek-forward-button,
audio::-webkit-media-controls-timeline {
  pointer-events: none;
}
</style>
