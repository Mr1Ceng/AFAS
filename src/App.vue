<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { theme } from 'ant-design-vue';
import { ref, watch, provide } from 'vue';
import { useGlobalStore } from "@/stores/globalStore";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
const globalStore = useGlobalStore();
const currentAlgorithm = ref(globalStore.isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm);
const setCssVariable = (variable: string, value: string | null) => {
  document.documentElement.style.setProperty(variable, value);
};
watch(() => globalStore.isDarkTheme, async (newValue, oldValue) => {
  currentAlgorithm.value = newValue ? theme.darkAlgorithm : theme.defaultAlgorithm;
  if (newValue) {
    setCssVariable('--body-bg-color', '#1f1f1f'); // 深色主题
  } else {
    setCssVariable('--body-bg-color', '#ffffff'); // 浅色主题
  }
},
  { immediate: true })

const isDev = ref<boolean>(import.meta.env.MODE === "development");
console.log("isDev", isDev.value)
provide("isDev", isDev);

</script>

<template>
  <a-config-provider :theme="{ token: { fontSize: 16 }, algorithm: currentAlgorithm }" :locale="zhCN">
    <div class="w-full h-full" :data-doc-theme="globalStore.isDarkTheme ? 'dark' : 'light'">
      <RouterView />
    </div>
  </a-config-provider>
</template>

<style scoped></style>
