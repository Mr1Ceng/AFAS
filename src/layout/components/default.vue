<template>
  <a-layout>
    <a-layout-header class="header flex flex-row">
      <a-menu class="w-[calc(100%-60px)]" v-model:selectedKeys="selectedKeys1" theme="dark" mode="horizontal"
        :style="{ lineHeight: '64px' }">
        <a-menu-item v-for="(menu, index) in menuList" :key="menu.key" :disabled="!menu.show">{{ menu.label
          }}</a-menu-item>
      </a-menu>
      <div class="flex items-center justify-end">
        <a-popover placement="bottomRight">
          <template #content>
            <span class="text-sm">{{ accountStore.user.userId }}</span>
            <div class="w-full flex flex-row justify-end items-center pt-4">
              <a-button size="small" type="link" @click="changePassword">
                修改密码
              </a-button>
              <a-button size="small" type="link" @click="logout">
                退出登录
              </a-button>
            </div>
          </template>
          <template #title>
            <span class="text-xl pr-2">{{ accountStore.user.userName }}</span>
            <span>( {{ accountStore.user.mobile }} )</span>
          </template>
          <a-button type="text">
            {{ accountStore.user.userName}}
          </a-button>
        </a-popover>
        <a-switch v-model:checked="isDarktheme" @change="() => { globalStore.changeTheme() }">
          <template #checkedChildren><check-outlined /></template>
          <template #unCheckedChildren><close-outlined /></template>
        </a-switch>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200">
        <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys"
          :items="menuList[selectedKeys1[0]].children" mode="inline" :style="{ height: '100%', borderRight: 0 }">
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content :style="{ padding: '12px 24px 0', margin: 0, minHeight: '280px' }">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
  <a-modal v-model:open="modalVisible" width="600px" title="" centered :maskClosable="false" :closable="false" :footer="null" :bodyStyle="{ height: '288px' }">
    <PasswordEdit :user-id="currentUserId" @save-success="saveSuccess" @cancel="setModalVisible(false)"></PasswordEdit>
  </a-modal>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'DefaultLayout'
});
import { watch, h, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/utils/ApiClientHelper';
import { useMenuStore } from '@/stores/menuStore';
import PasswordEdit from '@/components/user/PasswordEdit.vue';
import {
  MailOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue';
import { useGlobalStore } from "@/stores/globalStore";
import { useAccountStore } from "@/stores/accountStore";
import { message } from 'ant-design-vue';
const globalStore = useGlobalStore();
const accountStore = useAccountStore();
const isDarktheme = ref(globalStore.isDarktheme)

const router = useRouter()
const store = useMenuStore()
const selectedKeys1 = ref<number[]>([store._selectedKeys1]);
const selectedKeys2 = ref<string[]>(store.getSelectedKeys2());
let openKeys = ref<string[]>(store.getOpenKeys());

//#region 菜单对象
const menuList = ref([
  {
    key: 0,
    label: '测评',
    title: '测评',
    children: [{
      key: 'Q_Test',
      icon: () => h(MailOutlined),
      label: '测评',
      title: '测评',
      disabled: accountStore.user.isStaff && !accountStore.user.isDeveloper
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
          disabled: !accountStore.user.isStaff && !accountStore.user.isDeveloper
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
    show: true
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
          key: 'S_SpiralMaze',
          label: '漩涡迷宫配置管理',
          title: '漩涡迷宫配置管理',
        },
        {
          key: 'S_Standard',
          label: '测评标准管理',
          title: '测评标准管理',
        }
      ],
    }
    ],
    show: accountStore.user.isStaff || accountStore.user.isDeveloper
  }
]);
//#endregion

//#region 监听器
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
//#endregion

const logout = async () => {
  // accountStore.setToken("")
  // accountStore.setUser({})
  // router.push({ name: 'login', params: {} })
  try {
    const response = await apiClient.post('/Account/WebAppLogout')
    console.log('响应:', response)
    if (response.status == 1) {
      accountStore.setToken("")
      accountStore.setUser({})
      router.push({ name: 'login', params: {} })
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const changePassword = () => {
  message.info("如需修改密码，请联系管理员！");
  setModalVisible(true,accountStore.user.userId);
}

//弹框
const currentUserId = ref<string>("")
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean, userId: string = '') => {
  modalVisible.value = open;
  if (open) {
    currentUserId.value = userId
  } else {
  }
};
const saveSuccess = () => {
  setModalVisible(false);
  logout()
}
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
