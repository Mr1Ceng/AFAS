<template>
  <a-layout>
    <a-layout-header class="header flex flex-row">
      <a-menu class="w-[calc(100%-60px)]" v-model:selectedKeys="selectedKeys1" theme="dark" mode="horizontal"
        :style="{ lineHeight: '64px' }">
        <a-menu-item v-for="(menu, index) in menuList" :key="menu.key">{{ menu.label }}</a-menu-item>
      </a-menu>
      <div class="flex items-center justify-end">
        <a-switch :checked="isDarktheme" :checked-children="true" :un-checked-children="false"
          @change="() => { globalStore.changeTheme() }" />
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys"
          :items="menuList[selectedKeys1[0]].children" mode="inline" :style="{ height: '100%', borderRight: 0 }">
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content :style="{ background: '#fff', padding: '12px 24px 0', margin: 0, minHeight: '280px' }">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { watch, h, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMenuStore } from '@/stores/menuStore';
import {
  MailOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'; import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();
const isDarktheme = ref(globalStore.isDarktheme)

const router = useRouter()
const store = useMenuStore()

const selectedKeys1 = ref<number[]>([store._selectedKeys1]);
const selectedKeys2 = ref<string[]>(store.getSelectedKeys2());
let openKeys = ref<string[]>(store.getOpenKeys());

//菜单对象
const menuList = ref([
  {
    key: 0,
    label: '测评管理',
    title: '测评管理',
    children: [{
      key: 'Q_Test',
      icon: () => h(MailOutlined),
      label: '测评',
      title: '测评',
    },
    {
      key: 'Q_Result',
      icon: () => h(CalendarOutlined),
      label: '测评结果',
      title: '测评结果',
      children: [
        {
          key: 'Q_Query',
          label: '测评结果查询',
          title: '测评结果查询',
        },
        {
          key: 'Q_Import',
          label: '测评结果导入',
          title: '测评结果导入',
        }
      ],
    },
    {
      key: 'Q_Standard',
      icon: () => h(AppstoreOutlined),
      label: '测评标准',
      title: '测评标准',
    }
    ],
  },
  {
    key: 1,
    label: '设置',
    title: '设置',
    children: [{
      key: 'S_User',
      icon: () => h(MailOutlined),
      label: '用户管理',
      title: '用户管理',
    },
    {
      key: 'S_Test',
      icon: () => h(CalendarOutlined),
      label: '测评管理',
      title: '测评管理',
      children: [
        {
          key: 'S_Questionnaire',
          label: '测评试卷管理',
          title: '测评试卷管理',
        },
        {
          key: 'S_Standard',
          label: '测评标准管理',
          title: '测评标准管理',
        }
      ],
    }
    ]
  }
]);

watch(selectedKeys1, async (newValue, oldValue) => {
  selectedKeys2.value = store.getSelectedKeys2(newValue[0])
  openKeys.value = store.getOpenKeys(newValue[0])
  store.setter(newValue[0], selectedKeys2.value, openKeys.value)
})

watch(selectedKeys2, async (newValue, oldValue) => {
  store.setter(selectedKeys1.value[0], newValue, openKeys.value)
  router.push({ name: newValue[0], params: {} })
})

watch(openKeys, async (newValue, oldValue) => {
  store.setter(selectedKeys1.value[0], selectedKeys2.value, newValue)
})

</script>
<style scoped>
#components-layout-demo-top-side-2 .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
</style>
