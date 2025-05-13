<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { EyeTwoTone, EyeInvisibleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useAccountStore } from "@/stores/accountStore";
import { useGlobalStore } from "@/stores/globalStore";
import apiClient from '@/utils/ApiClientHelper'
import { getAuthorizationString } from '@/utils/AuthorizationHelper'
import router from '@/router';
import { useMenuStore } from '@/stores/menuStore';
const globalStore = useGlobalStore();
const menuStore = useMenuStore()
const isDarktheme = ref(globalStore.isDarktheme)
const accountStore = useAccountStore();
const account = ref<string>("");
const password = ref<string>("");
const isRemenber = ref<boolean>(accountStore.isRemenber);
if (isRemenber) {
  account.value = accountStore.account
}

const login = async () => {
  accountStore.setRemenber(account.value, isRemenber.value)
  try {
    const response = await apiClient.post('/Account/WebAppLoginByPassword', {
      account: account.value,
      password: password.value
    })
    console.log('响应:', response)
    if (response.status == 1) {
      accountStore.setToken(getAuthorizationString(response.data.userId, response.data.token.value))
      accountStore.setUser(response.data.user)
      if (response.data.user.isStaff) {
        menuStore.setter(0, ["Q_Query"], ["Q_Result"])
        router.push({ name: 'Q_Query', params: {} })
      } else {
        menuStore.setter(0, ["Q_Test"], ["Q_Result"])
        router.push({ name: 'Q_Test', params: {} })
      }
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}
</script>

<template>
  <a-layout class="w-full h-full justify-center items-center">
    <div class="w-300 h-150 flex rounded-2xl overflow-hidden shadow-lg shadow-gray-500/20 ">
      <div class="w-200 h-full">
        <a-carousel class="w-full h-full" autoplay>
          <div class="w-full h-full ">
            <img class="w-full h-full" src="/images/1.png">
          </div>
          <div class="w-full h-full ">
            <img class="w-full h-full" src="/images/2.png">
          </div>
          <div class="w-full h-full ">
            <img class="w-full h-full" src="/images/3.png">
          </div>
        </a-carousel>
      </div>
      <div class="w-100 h-full p-8">
        <div class="h-10 flex justify-end items-center">
          <a-switch v-model:checked="isDarktheme" @change="() => { globalStore.changeTheme() }" />
        </div>
        <div class="h-30 flex items-center">
          <span class="text-3xl ">
            AFAS注意力评估系统
          </span>
        </div>
        <div class="h-70 flex flex-col justify-around items-center ">
          <div class="w-full flex flex-row items-center">
            <a-input v-model:value="account" size="large">
              <template #prefix>
                <user-outlined />
              </template>
            </a-input>
          </div>
          <div class="w-full flex flex-row items-center">
            <a-input-password v-model:value="password" placeholder="请输入密码" size="large">
              <template #prefix>
                <LockOutlined />
              </template>
              <template #iconRender="v">
                <EyeTwoTone v-if="v"></EyeTwoTone>
                <EyeInvisibleOutlined v-else></EyeInvisibleOutlined>
              </template>
            </a-input-password>
          </div>
          <div class="w-full flex flex-row justify-center items-center">
            <a-checkbox v-model:checked="isRemenber">记住我</a-checkbox>
          </div>
          <div class="w-full flex flex-row items-center">
            <a-button type="primary" class="w-full" size="large" @click="login()">
              登录
            </a-button>
          </div>
        </div>
        <div class="h-40 flex items-center justify-center">
          <span class="text-sm ">
            Copyright © Mr1Ceng All Rights Reserved.
          </span>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<style>
.slick-slider,
.slick-list,
.slick-track,
.slick-slide,
.slick-slide div {
  height: 100%;
}
</style>
