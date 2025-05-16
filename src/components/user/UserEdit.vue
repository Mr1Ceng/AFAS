<script setup lang="ts">
import { computed, onMounted, ref, watch, defineEmits } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleDescription } from '@/enums/RoleEnum';
import _ from "lodash";
import { PlusOutlined } from '@ant-design/icons-vue';
import type { UploadProps, UploadFile } from 'ant-design-vue';

const props = defineProps<{
  userId: string
}>()
const gerderList = EnumHelper.getEnumDescriptions(GerderDescription);
const roleList = EnumHelper.getEnumDescriptions(RoleDescription);
const user = ref<any>({})

const emit = defineEmits<{
  (event: 'saveSuccess', value: string): void;
}>();
// #region 监听器

watch(() => props.userId, async (newValue, oldValue) => {

})

//#endregion

//#region 获取信息

const GetUserInfo = async () => {
  if (props.userId == "") {
    return;
  }
  try {
    const response = await apiClient.post('/User/GetUser/' + props.userId)
    console.log('响应:', response)
    if (response.status == 1) {
      user.value = response.data;
      if (user.value.avatarUrl) {
        fileList.value = [{
          uid: "-1",
          name: "preview.png",
          status: "done",
          url: user.value.avatarUrl,
        }]
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
const formRef = ref();
const SaveUser = async () => {
  try {
    await formRef.value.validate();
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const response = await apiClient.post('/User/SaveUser', user.value)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      emit("saveSuccess", response.data)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

onMounted(() => {
  GetUserInfo();
})

//#endregion
const student = computed(() => {
  return ""
})

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
    uid: newFile.uid,
    name: newFile.name,
    status: "done",
    url: base64, // 让图片预览
  };
  user.value.avatarUrl = base64;
  fileList.value = [...fileList.value, previewFile]; // 更新文件列表
};
//#endregion

const validateEmpty = (fieldName: string) => {
  return async (_rule: any, value: string) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    return Promise.resolve();
  };
};
</script>

<template>
  <div class="w-full h-full p-4">
    <a-form ref="formRef" :model="user" :layout="'horizontal'"
      :label-col="{ style: { width: '90px', paddingRight: '10px' } }">
      <a-form-item v-if="user.userId" label="用户编码">
        <a-input v-model:value="user.userId" size="large" disabled />
      </a-form-item>
      <a-form-item label="用户姓名" name="userName" :rules="[{ required: true, validator: validateEmpty('用户姓名') }]">
        <a-input v-model:value="user.userName" size="large" />
      </a-form-item>
      <a-form-item label="昵称">
        <a-input v-model:value="user.nickName" size="large" />
      </a-form-item>
      <a-form-item label="用户头像">
        <a-upload :file-list="fileList" :maxCount="1" :before-upload="beforeUpload" @remove="handleRemove"
          @change="handleChange" list-type="picture-card">
          <div v-if="fileList?.length == 0">
            <plus-outlined></plus-outlined>
            <div class="ant-upload-text">上传头像</div>
          </div>
        </a-upload>
      </a-form-item>
      <a-form-item label="性别">
        <a-radio-group :style="{ width: '100%' }" size="large" v-model:value="user.gender">
          <a-radio-button :style="{ width: '50%' }" v-for="item in gerderList" :value="item.value">{{ item.description
            }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="年龄">
        <a-input-number :style="{ width: '100%' }" v-model:value="user.age" size="large" addon-after="岁" :min="0" />
      </a-form-item>
      <a-form-item label="联系电话">
        <a-input v-model:value="user.mobile" size="large" />
      </a-form-item>
      <a-form-item label="角色">
        <a-radio-group :style="{ width: '100%' }" size="large" v-model:value="user.role">
          <a-radio-button :style="{ width: '50%' }" v-for="item in roleList" :value="item.value">{{ item.description
            }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :span="24" style="text-align: right">
        <a-button type="primary" @click='SaveUser'>保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
