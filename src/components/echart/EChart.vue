<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGlobalStore } from "@/stores/globalStore";
import * as echarts from 'echarts';
const emit = defineEmits<{
  (event: 'GetImageUrl', value: string): void;
}>();
const globalStore = useGlobalStore();

// 定义 props 类型
interface ChartProps {
  options: any;
}

// 获取 props
const props = defineProps<ChartProps>();

// 创建 DOM 的 ref
const chartRef = ref<HTMLDivElement | null>(null);

// 保存 ECharts 实例
let chartInstance: echarts.ECharts | null = null;

// 初始化图表方法
const initChart = (theme: string = 'default') => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value, theme); // 初始化 ECharts 实例
    chartInstance.setOption(props.options); // 设置图表选项

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      chartInstance?.resize();
    });
  }
};

watch(() => globalStore.isDarkTheme, async (newValue, oldValue) => {
  // 销毁当前实例
  if (chartInstance) {
    chartInstance.dispose();
  }
  initChart(newValue ? 'dark' : 'default')
},
  { immediate: true })

// 监听 props.options 变化并更新图表
watch(
  () => props.options,
  (newOptions) => {
    if (chartInstance) {
      console.log(newOptions)
      chartInstance.resize();
      chartInstance.setOption(newOptions); // 更新图表选项
      setTimeout(() => {
        if (chartInstance) {
          // 获取图片数据并传递给父组件
          const imageData = chartInstance.getDataURL();
          emit('GetImageUrl', imageData);
        }
      }, 1000);
    }
  },
  { deep: true }
);

// 在组件挂载时初始化图表
onMounted(() => {
  initChart(globalStore.isDarkTheme ? 'dark' : 'default');
});
</script>

<style scoped>
/* 可选样式 */
</style>
