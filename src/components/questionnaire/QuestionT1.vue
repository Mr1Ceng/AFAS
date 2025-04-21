<script setup lang="ts">

import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { message, notification } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import _ from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
import { useGlobalStore } from "@/stores/globalStore";
const props = defineProps<{
  questionId: string
}>()
const answerStore = useAnswerStore();
const globalStore = useGlobalStore();
const baseURL = globalStore.baseURL;
console.log(answerStore)
// #region 接口

const questionInfo = ref<any>({});
const answerInfo = ref<any>({});
const bQuestionT1QList = ref<any[]>([]);
const bQuestionT1AList = ref<any[]>([]);

const number1Question = ref<any>({});
const number2Question = ref<any>({});
const storyQuestion = ref<any>({});
import apiClient from '@/utils/ApiClientHelper'
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
GetQuestionT1();

const SaveAnswerT1 = async () => {
  try {
    const data = {
      answerId: answerStore.getAnswerId(),
      questionId: questionInfo.value.questionId,
      timeConsume: timeConsume.value,
      questionImage: questionImage.value,
      answerImage: answerImage.value,
      shapeNumber: shapeCount.value,
      errorNumber: errorCount.value,
      standardScore: result.value,
      remark: remark.value
    }
    console.log(data)
    const response = await apiClient.post('/Questionnaire/SaveAnswerT1/' + "User_Mr1Ceng", data)
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

// #endregion

// #region 答题结果

const questionImage = ref<string>("");
const answerImage = ref<string>("");
const errorCount = ref<number>(0);
const shapeCount = ref<number>(0);
const remark = ref<string>("");
const timeConsume = ref<number>(0);
const result = computed(() => {
  return timeConsume.value == 0 ? 0 : _.floor(10 * shapeCount.value - 10 * errorCount.value + 10 * 180 / timeConsume.value);
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

const canPlay = ref(true)
const number1Audio = ref<HTMLAudioElement | null>(null);
const number2Audio = ref<HTMLAudioElement | null>(null);
const storyAudio = ref<HTMLAudioElement | null>(null);

const playAudio = (type: string) => {
  switch (type) {
    case "Number1":
      if (number1Audio.value) {
        number1Audio.value.play();
        canPlay.value = false;
      }
      break;
    case "Number2":
      if (number2Audio.value) {
        number2Audio.value.play();
        canPlay.value = false;
      }
      break;
    case "Story":
      if (storyAudio.value) {
        storyAudio.value.play();
        canPlay.value = false;
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
      canPlay.value = true;
      break;
    case "Number2":
      openNotification("播放完毕，请开始答题！");
      canPlay.value = true;
      break;
    case "Story":
      openNotification("播放完毕，请开始答题！");
      break;
    default:
      break;
  }
}

const getAnswerList = (questionSort: number) => {
  return _.filter(bQuestionT1AList.value, (x: { questionSort: number; }) => x.questionSort == questionSort);
}

const Completed = () => {
  console.log(bQuestionT1QList)
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
      playAudio("Number1");
      break;
    case 1:
      playAudio("Number2");
      break;
    case 2:
      playAudio("Story");
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
      <div class="w-full flex flex-auto flex-col justify-start items-center">
        <div class="w-full flex felx-row items-center p-4">
          <audio ref="number1Audio" :src="GetAudioUrl('听觉集中-数字题.mp3')" @ended="onAudioEnd('Number1')"
            class="hidden"></audio>
          <div class="h-10 w-80 text-xl flex items-center">
            {{ "1: " + number1Question?.questionQ }}
          </div>
          <div class="h-10 w-100">
            <a-input-number v-model:value="number1Question.questionA" addon-after="次" size="large" :min="0" />
          </div>
          <div class="h-10 w-40">
            <a-button size="large" @click="() => { if (!canPlay || stepIndex != 1) return; setModalVisible(true); }">
              下一题
            </a-button>
          </div>
        </div>
        <div class="w-full flex felx-row items-center p-4">
          <audio ref="number2Audio" :src="GetAudioUrl('听觉集中-数字题.mp3')" @ended="onAudioEnd('Number2')"
            class="hidden"></audio>

          <div class="h-10 w-80 text-xl flex items-center">
            {{ "2: " + number2Question?.questionQ }}
          </div>
          <div class="h-10 w-100">
            <a-input-number v-model:value="number2Question.questionA" addon-after="次" size="large" :min="0" />
          </div>
          <div class="h-10 w-40 ">
            <a-button size="large" @click="() => { if (!canPlay || stepIndex != 2) return; setModalVisible(true); }">
              下一题
            </a-button>
          </div>
        </div>
        <div class="w-full flex felx-row items-start p-4">
          <audio ref="storyAudio" :src="GetAudioUrl('听觉集中-文字题.mp3')" @ended="onAudioEnd('Story')"
            class="hidden"></audio>
          <div class="w-[calc(100%-160px)] flex flex-col justify-between">
            <div class="w-full text-xl flex items-start  pb-4" v-for="question in storyQuestion">
              <div class="h-10 w-80 text-xl flex items-center">
                {{ `${question.questionSort}: ${question.questionQ}` }}
              </div>
              <div class="h-30 w-100 flex flex-col justify-between">
                <div class="h-10 w-full text-xl flex items-start"
                  v-for="answer in getAnswerList(question.questionSort)">
                  <div class="h-10 w-full text-xl flex items-center cursor-pointer">
                    {{ `${answer.answerSort}: ${answer.answer}` }}
                  </div>
                </div>
              </div>

              <div class="h-10 w-40">
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
      <div class="w-1/2 flex flex-row justify-around items-center" style="height: 40px;">
        <a-button type="primary" @click="Completed()">
          完成
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
        <span class="text-lg w-16">画出的图形数</span>
        <a-input-number class="inputWidth" v-model:value="shapeCount" addon-after="个" size="large" :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">位置的错误数</span>
        <a-input-number class="inputWidth" v-model:value="errorCount" addon-after="个" size="large" :min="0" />
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
        <a-button @click="SaveAnswerT1()">
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

canvas {
  border: 1px solid black;
  margin-top: 10px;
}
</style>
