<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { theme } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();
const currentAlgorithm = ref(theme.defaultAlgorithm);

watch(() => globalStore.isDarktheme, async (newValue, oldValue) => {
  currentAlgorithm.value = newValue ? theme.darkAlgorithm : theme.defaultAlgorithm;
})

</script>

<template>
  <a-config-provider :theme="{ token: { fontSize: 16 }, algorithm: currentAlgorithm }">
    <RouterView :data-doc-theme="globalStore.isDarktheme ? 'dark' : 'light'" />
  </a-config-provider>
</template>

<style scoped></style>
