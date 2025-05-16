<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { apiClient } from '@/utils/ApiClientHelper'
import _ from "lodash";



const props = defineProps<{
  userId: string
}>()
const user = ref<any>({})

const emit = defineEmits<{
  (event: 'saveSuccess'): void;
  (event: 'cancel'): void;
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
      user.value.password = ''
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const formRef = ref();
const WebAppResetPassword = async () => {
  try {
    await formRef.value.validate();
    console.log("表单验证通过！");
  } catch (error) {
    console.log("表单验证失败:", error);
    message.error("表单验证失败!");
    return;
  }
  try {
    const response = await apiClient.post(`/Account/WebAppResetPassword/${user.value.userId}/${user.value.password}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("保存成功！");
      emit("saveSuccess")
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const Cancel = async () => {
  emit("cancel")
}

onMounted(() => {
  GetUserInfo();
})

const validateEmpty = (fieldName: string) => {
  return async (_rule: any, value: string) => {
    console.log(value)
    if (!value) {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    if (typeof value == "number" && value === 0) {
      return Promise.reject(new Error(`${fieldName} 不能为零`));
    }
    else if (typeof value == "string" && value.trim() === "") {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    return Promise.resolve();
  };
};
//#endregion

</script>

<template>
  <div class="w-full h-full">
    <a-form ref="formRef" :model="user" :layout="'horizontal'" :label-col="{ style: { width: '80px' } }">
      <a-form-item v-if="user.userId" label="用户编码">
        <a-input v-model:value="user.userId" size="large" disabled />
      </a-form-item>
      <a-form-item label="用户姓名">
        <a-input v-model:value="user.userName" size="large" disabled />
      </a-form-item>
      <a-form-item label="账号">
        <a-input v-model:value="user.account" size="large" disabled />
      </a-form-item>
      <a-form-item label="密码" name="password" :rules="[{ required: true, validator: validateEmpty('密码') }]">
        <a-input-password v-model:value="user.password" size="large" />
      </a-form-item>
      <a-form-item :span="24" style="text-align: right">
        <a-space :size="20">
          <a-button @click="Cancel">取消</a-button>
          <a-button type="primary" @click="WebAppResetPassword">保存</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
