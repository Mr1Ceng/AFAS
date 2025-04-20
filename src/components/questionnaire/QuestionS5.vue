<script setup lang="ts">

import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { formattedText } from '@/utils/CommonHelper'
import _ from "lodash";
import { useAnswerStore } from '@/stores/answerStore';
const props = defineProps<{
  questionId: string
}>()
const answerStore = useAnswerStore();
console.log(answerStore)
// #region 接口

const questionInfo = ref<any>({});
const questionList = ref<any>([]);
import apiClient from '@/utils/ApiClientHelper'
console.log(props.questionId)
const GetQuestionS5 = async () => {
  try {
    const response = await apiClient.post('/Questionnaire/GetQuestionS5/' + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      questionInfo.value = response.data.questionInfo
      questionList.value = response.data.questionList
      if (questionList.value.length > 0) {
        questionImage.value = questionList.value[Math.floor(Math.random() * questionList.value.length)].image;
      }
    } else {
      message.error(`获取题目信息失败，请联系工作人员！`);
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
GetQuestionS5();

const SaveAnswerS5 = async () => {
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
    const response = await apiClient.post('/Questionnaire/SaveAnswerS5/' + "User_Mr1Ceng", data)
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
  return timeConsume.value == 0?0:_.floor(10*shapeCount.value -10*errorCount.value+10*180/timeConsume.value);
})

// #endregion

// #region 计时器
const maxMin: number = 2;
const seconds = ref<number>(60);
let timer: number | null = null; // 计时器类型为 number 或 null

const startTimer = (): void => {
  if (!timer) {
    timer = window.setInterval(() => {
      seconds.value--;
      if (seconds.value == 0) {
        if (stepIndex.value == 1) {
          resetTimer()
          setModalVisible(true);
        } else {
          stopTimer();
          message.error("时间到");
          setModalVisible(true);
        }
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

const StartDraw = () => {
  if(stepIndex.value != 1){
    return;
  }
  stopTimer();
  seconds.value += maxMin * 60;
  setModalVisible(true);
}

const Completed = () => {
  if (canvasRef.value) {
    answerImage.value = canvasRef.value.toDataURL('image/png');
  }
  timeConsume.value = maxMin * 60 + 60 - seconds.value;
  console.log(timeConsume.value)
  stopTimer();
  setModalVisible(true);
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
  if (stepIndex.value <= 1) {
    startTimer();
  }
  stepIndex.value++;
  setModalVisible(false);
  resizeCanvas();
}

// #endregion

// #region 画图
const containerRef = ref<HTMLCanvasElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let isDrawing = false;
let mousePath: { x: number; y: number }[] = [];

const resizeCanvas = () => {
  if (containerRef.value && canvasRef.value) {
    canvasRef.value.width = containerRef.value.clientWidth -50;
    canvasRef.value.height = containerRef.value.clientHeight-50;
  }
};

function onMouseDown(event: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  isDrawing = true;
  mousePath = [{ x: mouseX, y: mouseY }];

}
function onMouseMove(event: MouseEvent) {
  if (!isDrawing) return;
  const rect = canvasRef.value!.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  mousePath.push({ x: mouseX, y: mouseY });

  const ctx = canvasRef.value!.getContext("2d")!;
  ctx.beginPath();
  for (const point of mousePath) ctx.lineTo(point.x, point.y);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
}

function onMouseUp(event: MouseEvent) {
  isDrawing = false;
}
onMounted(() => {
  resizeCanvas();
  canvasRef.value!.addEventListener("mousedown", onMouseDown);
  canvasRef.value!.addEventListener("mousemove", onMouseMove);
  canvasRef.value!.addEventListener("mouseup", onMouseUp);
  window.addEventListener("resize", resizeCanvas);
});

// 清除监听
onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
});

// #endregion
</script>

<template>
  <a-flex class="h-full" :justify="'space-between'" :align="'flex-start'">
    <a-flex class="h-full w-[calc(100%-400px)] pl-4 pr-4" :vertical="true" :justify="'space-between'"
      :align="'flex-start'">
      <div ref="containerRef" class="w-full flex flex-auto justify-around items-center">
        <img v-show="stepIndex == 1" :src="questionImage" class="w-full" height="auto"/>
        <canvas v-show="stepIndex == 2" ref="canvasRef"></canvas>
        <!-- :width="1000" :height="600"  -->
        <img v-show="stepIndex > 2" :src="questionImage" class="w-1/2" height="auto"/>
        <img v-show="stepIndex > 2" :src="answerImage" class="w-1/2" height="auto"/>
      </div>
      <div class="w-full flex flex-row justify-center items-center" style="height: 40px;">
        <a-button type="primary" @click="StartDraw()">
          开始绘图
        </a-button>
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
        <a-input-number class="inputWidth" v-model:value="shapeCount"  addon-after="个" size="large"
          :min="0" />
      </div>
      <div class="w-full flex flex-row justify-start items-center pt-4">
        <span class="text-lg w-16">位置的错误数</span>
        <a-input-number class="inputWidth" v-model:value="errorCount"  addon-after="个" size="large"
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
        <a-button @click="SaveAnswerS5()">
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
