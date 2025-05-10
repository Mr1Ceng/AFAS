<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import apiClient from '@/utils/ApiClientHelper'
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleDescription } from '@/enums/RoleEnum';
import _ from "lodash";

const props = defineProps<{
  userId: string
}>()
const gerderList = EnumHelper.getEnumDescriptions(GerderDescription);
const roleList = EnumHelper.getEnumDescriptions(RoleDescription);
const user = ref<any>({})
// #region 监听器

watch(() => props.userId, async (newValue, oldValue) => {

})

//#endregion

//#region 获取答案
const GetUserInfo = async () => {
  if (props.userId == "") {
    return;
  }
  try {
    const response = await apiClient.post('/User/GetUser/' + props.userId)
    console.log('响应:', response)
    if (response.status == 1) {
      user.value = response.data;
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
onMounted(()=>{
  GetUserInfo();
})
//#endregion
const student = computed(() => {
  return ""
})

</script>

<template>
  <div class="w-full h-full p-4">
      <a-form :layout="'horizontal'" :label-col="{ style: { width: '80px' } }">
        <a-form-item label="用户编码">
          <a-input v-model:value="user.userId" size="large" />
        </a-form-item>
        <a-form-item label="用户姓名">
          <a-input v-model:value="user.userName" size="large" />
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model:value="user.nickName" size="large" />
        </a-form-item>
        <a-form-item label="用户头像">
          <a-input v-model:value="user.avatarUrl" size="large" />
        </a-form-item>
        <a-form-item label="性别">
        <a-radio-group v-model:value="user.gender">
          <a-radio-button v-for="item in gerderList" :value="item.value">{{ item.description }}</a-radio-button>
        </a-radio-group>
        </a-form-item>
        <a-form-item label="年龄">
          <a-input-number v-model:value="user.age" size="large" addon-after="岁" :min="0" />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model:value="user.mobile" size="large" />
        </a-form-item>
        <a-form-item label="角色">
        <a-radio-group v-model:value="user.role">
          <a-radio-button v-for="item in roleList" :value="item.value">{{ item.description }}</a-radio-button>
        </a-radio-group>
        </a-form-item>
        <a-form-item :span="24" style="text-align: right">
          <a-button type="primary">保存</a-button>
        </a-form-item>
      </a-form>
  </div>
</template>

<style scoped>
</style>
