<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { EyeTwoTone, EyeInvisibleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons-vue';
const account = ref<string>("");
const password = ref<string>("");
</script>

<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="w-300 h-150 flex rounded-2xl overflow-hidden shadow-lg shadow-white/20 ">
      <div class="w-200 h-full">
        <a-carousel class="w-full h-full" autoplay>
          <div class="w-full h-full bg-amber-100">
            <img src="/images/1.png">
          </div>
          <div class="w-full h-full bg-amber-300">
            <img src="/images/2.png">
          </div>
          <div class="w-full h-full bg-amber-500">
            <img src="/images/3.png">
          </div>
        </a-carousel>
      </div>
      <div class="w-100 h-full p-8">
        <div class="h-40 flex items-center">
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
          <div class="w-full flex flex-row items-center">
            <a-button type="primary" class="w-full" size="large">
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
  </div>
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
