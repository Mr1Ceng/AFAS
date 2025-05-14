<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';
import type { VuePdfPropsType } from 'vue3-pdfjs/components/vue-pdf/vue-pdf-props';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
const props = defineProps<{
  src: string
}>()
const pdfSrc = ref<VuePdfPropsType['src']>(props.src);
const numOfPages = ref(0);

onMounted(() => {
  const loadingTask = createLoadingTask(pdfSrc.value);
  loadingTask.promise.then((pdf: PDFDocumentProxy) => {
    numOfPages.value = pdf.numPages;
  });
});
</script>

<template>
  <VuePdf v-for="page in numOfPages" :key="page" :src="pdfSrc" :page="page" />
</template>
