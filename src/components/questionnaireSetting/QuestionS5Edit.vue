<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, inject, type Ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";
import { QuestionS5Model } from '@/models/question/QuestionS5Model';
import QuestionEdit from './QuestionEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { QuestionCodeDescription, QuestionCodeEnum } from '@/enums/QuestionCodeEnum';
import Nzh from "nzh";
import { useGlobalStore } from "@/stores/globalStore";
import { PlusOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadFile } from 'ant-design-vue';
import { C_BQuestionS5 } from '@/entitys/question/BQuestionS5';
import { Ul25Key } from "@/utils/NewCodeHelper";
const nzhcn = Nzh.cn;

const props = defineProps<{
  questionId?: string,
  questionnaireId: string,
  questionCode: string
}>()
const globalStore = useGlobalStore();
const isDev = inject<Ref<boolean>>("isDev", ref(false));
const question = ref<QuestionS5Model>(new QuestionS5Model())
const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器
watch(() => props.questionId, async (newValue, oldValue) => {

})
//#region 获取信息
const GetQuestionInfo = async () => {
  if (!props.questionId || props.questionId == "") {
    question.value.questionInfo.questionCode = props.questionCode;
    question.value.questionInfo.questionnaireId = props.questionnaireId;
    question.value.questionInfo.questionName = EnumHelper.getDescriptionByValue(QuestionCodeDescription, QuestionCodeEnum.S5);
    return;
  }
  try {
    const response = await apiClient.post(`/Questionnaire/GetQuestion${props.questionCode}/` + props.questionId)
    console.log('响应:', response)
    if (response.status == 1) {
      question.value = response.data;
      if (question.value.questionList && question.value.questionList.length > 0) {
        fileList.value = _.map(question.value.questionList, (item, index) => {
          return {
            uid: item.imageId,
            name: '测评图片' + index,
            status: "done",
            url: item.image,
          }
        })
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const formRef = ref();
const loading = ref<boolean>(false);
const SaveQuestion = async () => {
  console.log(question.value)
  console.log(fileList.value)
  question.value.questionList = _.map(fileList.value, (item) => {
    return new C_BQuestionS5({
      questionId: question.value.questionInfo.questionId,
      imageId: item.uid,
      image: item.url
    })
  })
  loading.value = true;
  try {
    if (formRef.value) {
      await formRef.value.validate();
    }
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const response = await apiClient.post('/Questionnaire/SaveQuestionS5', question.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      emit("saveSuccess", response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
  loading.value = false;
}

onMounted(() => {
  GetQuestionInfo();
})

//#endregion

//#region 头像上传
const fileList = ref<UploadFile[]>([]);

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const handleRemove: UploadProps['onRemove'] = file => {
  if (!fileList.value) return;
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};

// 文件验证
const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('请选择图片上传!');
    return;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('请选择小于2MB的图片!');
    return;
  }
  return false;
};

// 处理文件上传，转换为 Base64 并显示在预览列表
const handleChange = async (info: any) => {
  const newFile = info.file;
  if (newFile.status === "done" || newFile.status === "success") {
    return;
  }
  const base64 = await getBase64(newFile);
  const previewFile: UploadFile = {
    uid: Ul25Key(),
    name: newFile.name,
    status: "done",
    url: base64, // 让图片预览

  };
  fileList.value = [...fileList.value, previewFile]; // 更新文件列表
};

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const handlePreview = async (file: any) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
//#endregion
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="w-1/3 h-full">
      <QuestionEdit :_question-info="question.questionInfo" @changed="(data) => { question.questionInfo = data; }">
      </QuestionEdit>
    </div>
    <div class="w-2/3 h-full flex flex-col">
      <div class="w-full flex-auto">
        <div class="w-full h-full flex flex-col pl-8">
          <a-form ref="formRef" :model="question" :layout="'horizontal'"
            :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
            <a-form-item label="测评图形">
              <a-upload :file-list="fileList" :maxCount="1" :before-upload="beforeUpload" @remove="handleRemove"
                @preview="handlePreview" @change="handleChange" list-type="picture-card">
                <div class="text-2xl">
                  <plus-outlined></plus-outlined>
                  <div class="ant-upload-text pt-4">上传图片</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-form>
        </div>
      </div>
      <div class="w-full h-20 flex felx-row items-center justify-end">
        <a-space>
          <a-button type="primary" size="large" @click="SaveQuestion">保存</a-button>
        </a-space>
      </div>
    </div>
  </div>
  <a-modal :width="900" centered :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
    <img alt="example" style="width: 100%" :src="previewImage" />
  </a-modal>
</template>

<style scoped>
::v-deep(.ant-upload-list-picture-card .ant-upload-list-item-container) {
  width: 240px !important;
  height: 240px !important;
}

::v-deep(.ant-upload-list-picture-card .ant-upload-select-picture-card) {
  width: 240px !important;
  height: 240px !important;
}

::v-deep(.ant-upload-list-picture-card .ant-upload-list-item-container .ant-upload-list-item-actions) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

::v-deep(.ant-upload-list-picture-card .ant-upload-list-item-container .ant-upload-list-item-actions .anticon) {
  width: 50px !important;
  height: 50px !important;
  font-size: 30px !important;
}

::v-deep(.ant-upload-list-picture-card .ant-upload-list-item-container .ant-upload-list-item-actions .ant-upload-list-item-action) {
  width: 50px !important;
  height: 50px !important;
  font-size: 30px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

::v-deep(.ant-upload-list-picture-card .ant-upload-list-item-container .ant-upload-list-item-actions .ant-upload-list-item-action .anticon) {
  width: 30px !important;
  height: 30px !important;
  font-size: 30px !important;
}
</style>
