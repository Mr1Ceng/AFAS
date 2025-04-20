<template>
  <div class="w-full flex flex-col items-center justify-center">
    <canvas ref="canvasRef" width="800" height="800"></canvas>
    <div class="text-2xl" :class="showCount?'':'hidden'">触碰次数: {{ crossCount }}</div>
    <div class="w-full" :class="showControl?'':'hidden'">
      <a-row :justify="'center'"> 
        <a-col :span="4" >
          <label for="spacing">漩涡间距:</label>
        </a-col>
        <a-col :span="12">
          <a-slider v-model:value="spacing" :min="1" :max="10" :step="1" />
        </a-col>
        <a-col :span="4">
          <a-input-number v-model:value="spacing" :min="1" :max="10" style="margin-left: 16px" />
        </a-col>
      </a-row>
      <a-row :justify="'center'"> 
        <a-col :span="4">
          <label for="spacing">波动基准程度:</label>
        </a-col>
        <a-col :span="12">
          <a-slider v-model:value="perturbation" :min="0" :max="30" :step="1" />
        </a-col>
        <a-col :span="4">
          <a-input-number v-model:value="perturbation" :min="0" :max="30" style="margin-left: 16px" />
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from "vue";

export default {
  props: {
    initialSpacing: { type: Number, default: 5 },
    initialPerturbation: { type: Number, default: 10 },
    showControl: { type: Boolean, default: false },
    showCount: { type: Boolean, default: false }
  },
  emits: ["update-cross-count","update-error-count","started","finished","getQuestionImage","getAnswerImage"],
  setup(props, { emit }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const questionImage = ref<string>("");
    const answerImage = ref<string>("");
    const spacing = ref(props.initialSpacing);
    const perturbation = ref(props.initialPerturbation);
    const crossCount = ref(0);
    const errorCount = ref(0);
    let isDrawing = false;
    let mousePath: { x: number; y: number }[] = [];
    let hasTouched = false; // 用于防止重复计数
    const layers = 10; // 固定漩涡层数为10层
    const spiral = ref({ a: 1, b: spacing.value }); // 螺旋间距参数
    const startCircle = { x: 400, y: 400, r: 15 }; // 起始位置圆
    const endCircle = { x: 0, y: 0, r: 15 }; // 结束位置圆（动态生成）
    let spiralPath: { x: number; y: number }[] = []; // 用于存储生成的光滑漩涡路径

    function updateEndCircle() {
      const theta = Math.PI * layers * 2;
      const r = spiral.value.a + spiral.value.b * theta;
      endCircle.x = 400 + r * Math.cos(theta);
      endCircle.y = 400 + r * Math.sin(theta);
    }

    // 初始化动态波动的不规则漩涡路径
    function generateSmoothSpiralPath() {
      spiralPath = [];
      for (let theta = 0; theta < Math.PI * layers * 2; theta += 0.1) {
        // 增强波动范围，且随着距离增大而增强
        const distanceFactor = theta / (layers * 2 * Math.PI); // 距离增大因子
        const randomPerturbation = (Math.random() * perturbation.value - perturbation.value / 2) * distanceFactor * 1.5; // 调节波动范围
        const r = spiral.value.a + spiral.value.b * theta + randomPerturbation;
        const x = 400 + r * Math.cos(theta);
        const y = 400 + r * Math.sin(theta);
        spiralPath.push({ x, y });
      }
      updateEndCircle(); // 更新结束圆位置
    }

    // 使用贝塞尔曲线绘制光滑路径
    function drawMaze(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, 800, 800);
      ctx.beginPath();
      for (let i = 0; i < spiralPath.length - 2; i++) {
        const xc = (spiralPath[i].x + spiralPath[i + 1].x) / 2;
        const yc = (spiralPath[i].y + spiralPath[i + 1].y) / 2;
        ctx.quadraticCurveTo(spiralPath[i].x, spiralPath[i].y, xc, yc);
      }
      ctx.strokeStyle = "black";
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

    function onMouseDown(event: MouseEvent) { 
      const rect = canvasRef.value!.getBoundingClientRect(); 
      const mouseX = event.clientX - rect.left; 
      const mouseY = event.clientY - rect.top; 
      if (Math.sqrt((mouseX - startCircle.x) ** 2 + (mouseY - startCircle.y) ** 2) <= startCircle.r) { 
        emit("started");
        isDrawing = true; 
        mousePath = [{ x: mouseX, y: mouseY }]; 
      } 
    }

    function onMouseMove(event: MouseEvent) {
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
        emit("update-cross-count", crossCount.value);
      } else if (!isTouching) hasTouched = false;
    }

    function onMouseUp(event: MouseEvent) { 
      const rect = canvasRef.value!.getBoundingClientRect(); 
      const mouseX = event.clientX - rect.left; 
      const mouseY = event.clientY - rect.top; 
      if (Math.sqrt((mouseX - endCircle.x) ** 2 + (mouseY - endCircle.y) ** 2) <= endCircle.r) 
      { 
        isDrawing = false; 
        emit("finished", crossCount.value);
        if(canvasRef.value){
          answerImage.value = canvasRef.value.toDataURL('image/png');
          emit("getAnswerImage",answerImage.value)
        }
      } 
      else 
      { 
        isDrawing = false; 
        crossCount.value = 0; 
        hasTouched = false;
        mousePath = []; 
        const ctx = canvasRef.value!.getContext("2d")!; 
        drawMaze(ctx);
        
        errorCount.value++;
        emit("update-cross-count", crossCount.value);
        emit("update-error-count", errorCount.value);
      } 
    }

    onMounted(() => {
      generateSmoothSpiralPath();
      const ctx = canvasRef.value!.getContext("2d")!;
      drawMaze(ctx);
      canvasRef.value!.addEventListener("mousedown", onMouseDown);
      canvasRef.value!.addEventListener("mousemove", onMouseMove);
      canvasRef.value!.addEventListener("mouseup", onMouseUp);
      if(canvasRef.value){
        questionImage.value = canvasRef.value.toDataURL('image/png');
        emit("getQuestionImage",questionImage.value)
      }
    });

    watch([spacing, perturbation], () => {
      spiral.value.b = spacing.value;
      generateSmoothSpiralPath();
      const ctx = canvasRef.value!.getContext("2d")!;
      drawMaze(ctx);
    });

    return {
      canvasRef,
      spacing,
      perturbation,
      crossCount
    };
  }
};
</script>
