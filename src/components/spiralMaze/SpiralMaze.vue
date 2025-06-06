<template>
  <div class="w-full flex flex-col items-center justify-center" :class="props.isDarkTheme ? 'bg-black' : 'bg-white'">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
    <div class="text-2xl" :class="showCount ? '' : 'hidden'">触碰次数: {{ crossCount }}</div>
    <div class="w-full" :class="showControl ? '' : 'hidden'">
      <a-row :justify="'center'">
        <a-col :span="4">
          <label for="layer">漩涡层数:</label>
        </a-col>
        <a-col :span="12">
          <a-slider :value="layer" :min="3" :max="10" @change="$emit('update:layer', $event)" :step="1" />
        </a-col>
        <a-col :span="4">
          <a-input-number :value="layer" :min="3" :max="10" @change="$emit('update:layer', $event)"
            style="margin-left: 16px" disabled />
        </a-col>
      </a-row>
      <a-row :justify="'center'">
        <a-col :span="4">
          <label for="spacing">漩涡间距:</label>
        </a-col>
        <a-col :span="12">
          <a-slider :value="spacing" :min="20"
            :max="props.height == 0 ? 50 : Math.floor(props.height * (23 - props.layer) / (2 * props.layer * 14))"
            @change="$emit('update:spacing', $event)" :step="1" />
        </a-col>
        <a-col :span="4">
          <a-input-number :value="spacing" :min="20"
            :max="props.height == 0 ? 50 : Math.floor(props.height * (23 - props.layer) / (2 * props.layer * 14))"
            @change="$emit('update:spacing', $event)" style="margin-left: 16px" disabled />
        </a-col>
      </a-row>
      <a-row :justify="'center'">
        <a-col :span="4">
          <label for="perturbation">波动基准程度:</label>
        </a-col>
        <a-col :span="12">
          <a-slider :value="perturbation" @change="$emit('update:perturbation', $event)" :min="0" :max="30" :step="1" />
        </a-col>
        <a-col :span="4">
          <a-input-number :value="perturbation" @change="$emit('update:perturbation', $event)" :min="0" :max="30"
            style="margin-left: 16px" disabled />
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import _ from "lodash";
import { ref, onMounted, watch } from "vue";
const props = defineProps({
  spacing: { type: Number, default: 0 },
  perturbation: { type: Number, default: 10 },
  layer: { type: Number, default: 10 },
  showControl: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
  width: { type: Number, default: 800 },
  height: { type: Number, default: 600 },
  isDarkTheme: { type: Boolean, default: false },
});

const emit = defineEmits([
  "updateCrossCount",
  "updateErrorCount",
  "started",
  "finished",
  "getQuestionImage",
  "getAnswerImage",
  "update:spacing",
  "update:perturbation",
  "update:layer"
]);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const questionImage = ref<string>("");
const answerImage = ref<string>("");
const crossCount = ref(0);
const errorCount = ref(0);
let isDrawing = false;
let mousePath: { x: number; y: number }[] = [];
let hasTouched = false; // 用于防止重复计数
const spiral = ref({ a: 1, b: props.spacing * 0.1 + 2 }); // 螺旋间距参数
const startCircle = { x: props.width / 2, y: props.height / 2, r: 15 }; // 起始位置圆
const endCircle = { x: 0, y: 0, r: 15 }; // 结束位置圆（动态生成）
let spiralPath: { x: number; y: number }[] = []; // 用于存储生成的光滑漩涡路径
const updateEndCircle = () => {
  const theta = Math.PI * props.layer * 2;
  const r = spiral.value.a + spiral.value.b * theta;
  endCircle.x = props.width / 2 + r * Math.cos(theta);
  endCircle.y = props.height / 2 + r * Math.sin(theta);
  startCircle.x = props.width / 2;
  startCircle.y = props.height / 2;
  startCircle.r = 15;
}
//初始化动态波动的不规则漩涡路径
const generateSmoothSpiralPath = () => {
  spiralPath = [];
  for (let theta = 0; theta < Math.PI * props.layer * 2; theta += 0.1) {
    // 增强波动范围，且随着距离增大而增强
    const distanceFactor = theta / (props.layer * 2 * Math.PI); // 距离增大因子
    const randomPerturbation = (Math.random() * props.perturbation - props.perturbation / 2) * distanceFactor * 1.5; // 调节波动范围
    const r = spiral.value.a + spiral.value.b * theta + randomPerturbation;
    const x = props.width / 2 + r * Math.cos(theta);
    const y = props.height / 2 + r * Math.sin(theta);
    spiralPath.push({ x, y });
  }
  updateEndCircle(); // 更新结束圆位置
}

// 使用贝塞尔曲线绘制光滑路径
const drawMaze = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, props.width, props.height);
  ctx.beginPath();
  for (let i = 0; i < spiralPath.length - 2; i++) {
    const xc = (spiralPath[i].x + spiralPath[i + 1].x) / 2;
    const yc = (spiralPath[i].y + spiralPath[i + 1].y) / 2;
    ctx.quadraticCurveTo(spiralPath[i].x, spiralPath[i].y, xc, yc);
  }
  ctx.strokeStyle = props.isDarkTheme ? "white" : "black";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(startCircle.x, startCircle.y, startCircle.r, 0, 2 * Math.PI);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(endCircle.x, endCircle.y, endCircle.r, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.stroke();
}

const onMouseDown = (event: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  if (Math.sqrt((mouseX - startCircle.x) ** 2 + (mouseY - startCircle.y) ** 2) <= startCircle.r) {
    emit("started");
    isDrawing = true;
    mousePath = [{ x: mouseX, y: mouseY }];
  }
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDrawing) return;
  const rect = canvasRef.value!.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  mousePath.push({ x: mouseX, y: mouseY });

  const ctx = canvasRef.value!.getContext("2d")!;
  drawMaze(ctx);
  ctx.beginPath();
  for (const point of mousePath) ctx.lineTo(point.x, point.y);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  for (const point of spiralPath) ctx.lineTo(point.x, point.y);
  const isTouching = ctx.isPointInStroke(mouseX, mouseY);

  if (isTouching && !hasTouched) {
    crossCount.value++;
    hasTouched = true;
    emit("updateCrossCount", crossCount.value);
  } else if (!isTouching) hasTouched = false;
}

const onMouseUp = (event: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  if (Math.sqrt((mouseX - endCircle.x) ** 2 + (mouseY - endCircle.y) ** 2) <= endCircle.r) {
    isDrawing = false;
    emit("finished", crossCount.value);
    if (canvasRef.value) {
      answerImage.value = canvasRef.value.toDataURL('image/png');
      emit("getAnswerImage", answerImage.value)
    }
  }
  else {
    isDrawing = false;
    crossCount.value = 0;
    hasTouched = false;
    mousePath = [];
    const ctx = canvasRef.value!.getContext("2d")!;
    drawMaze(ctx);

    errorCount.value++;
    emit("updateCrossCount", crossCount.value);
    emit("updateErrorCount", errorCount.value);
  }
}

const reDraw = () => {
  generateSmoothSpiralPath();
  const ctx = canvasRef.value!.getContext("2d")!;
  if (!ctx) {
    console.error("Canvas context 获取失败");
    return;
  }
  drawMaze(ctx);
}

onMounted(async () => {
  canvasRef.value!.addEventListener("mousedown", onMouseDown);
  canvasRef.value!.addEventListener("mousemove", onMouseMove);
  canvasRef.value!.addEventListener("mouseup", onMouseUp);
  if (canvasRef.value) {
    questionImage.value = canvasRef.value.toDataURL('image/png');
    emit("getQuestionImage", questionImage.value)
  }
  reDraw();
});

watch(() => [props.spacing, props.perturbation, props.layer], (newValue) => {
  spiral.value.b = props.spacing * 0.1 + 2;
  if (newValue[0] != 0 && props.height != 0) {
    reDraw();
  }
});

watch(() => props.height, (newValue) => {
  if (newValue != 0 && props.spacing != 0) {
    setTimeout(() => {
      reDraw();
    }, 50);
  }
});

watch(() => props.isDarkTheme, (newValue) => {
  console.log("isDarkTheme", newValue)
}, { immediate: true });

defineExpose({
  reDraw
});
</script>
