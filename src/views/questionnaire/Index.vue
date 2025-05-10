<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive v-if="route.meta.keepAlive">
      <component :is="Component"/>
    </keep-alive>
    <component :is="Component" v-if="!route.meta.keepAlive" />
  </router-view>
</template>


<script lang="ts" setup>
defineOptions({
  name: 'QuestionnaireIndex'
});
</script>