<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { VuePdf, createLoadingTask } from 'vue3-pdfjs/esm';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { message } from 'ant-design-vue';
const props = defineProps<{
  src: string,
  visible: boolean
}>()
const emit = defineEmits<{
  (event: 'closed'): void;
  (event: 'downloaded'): void;
}>();
const pdfSrc = ref<string>(props.src);
const pdfVisible = ref<boolean>(props.visible);
const numOfPages = ref<number>(0);
const currentPage = ref<number>(1);

//#region 监听器
watch(() => props.src, (newValue, oldValue) => {
  console.log('PDFViewer src：', newValue)
  pdfSrc.value = newValue;
})
watch(() => props.visible, (newValue, oldValue) => {
  console.log('PDFViewer visible：', newValue)
  pdfVisible.value = newValue;
})
watch(pdfVisible, (newValue, oldValue) => {
  //关闭
  if (!newValue) {
    emit("closed");
  } else {
    load()
  }
})
//#endregion

onMounted(() => {

});
/**
 * 加载PDF
 */
const load = () => {
  const loadingTask = createLoadingTask(pdfSrc.value);
  loadingTask.promise.then((pdf: PDFDocumentProxy) => {
    console.log(pdf)
    numOfPages.value = pdf.numPages;
  });
}
/**
 * 下载PDF
 */
const download = async (): Promise<void> => {
  if (!pdfSrc.value) {
    message.warn('PDF源不可用');
    return;
  }

  try {
    const response: Response = await fetch(pdfSrc.value);
    const blob: Blob = await response.blob();
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = pdfSrc.value.split('/').pop() || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('下载PDF完成');
    emit("downloaded");
  } catch (error) {
    console.error('下载PDF失败', error);
    message.error('下载PDF失败');
  }
};
</script>

<template>
  <a-modal v-model:open="pdfVisible" width="100%" wrap-class-name="full-modal" @ok="" ok-text="关闭" :maskClosable="false"
    :closable="false" :cancel-button-props="{ style: { display: 'none' } }">
    <div class="w-full h-full overflow-y-scroll">
      <VuePdf :key="currentPage" :src="pdfSrc" :page="currentPage" />
    </div>
    <template #footer>
      <div class="w-full h-12 flex items-center justify-between">
        <a-pagination v-model:current="currentPage" :pageSize="1" :total="numOfPages" show-quick-jumper
          :show-total="(total: any, range: any[]) => `第 ${range[0]} 页/总共 ${total} 页`" />
        <a-space :size="20">
          <a-button key="download" type="primary" @click="download">下载</a-button>
          <a-button key="close" @click="() => { pdfVisible = false }">关闭</a-button>
        </a-space>
      </div>
    </template>
  </a-modal>
</template>

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .ant-modal-body {
    height: calc(100% - 60px);
  }
}
</style>
