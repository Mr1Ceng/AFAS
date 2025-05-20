<template>
  <a-layout class="h-full">
    <a-layout-header class="header flex flex-row">
      <div class="flex items-center justify-end pr-12.5">
        <img src="/favicon.ico" width="60px" height="60px">
        <!-- <a-button type="primary" style="" @click="toggleCollapsed">
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </a-button> -->
      </div>
      <a-menu class="w-[calc(100%-60px)]" v-model:selectedKeys="selectedKeys1" theme="dark" mode="horizontal"
        @select="changeMenu1" :style="{ lineHeight: '64px' }">
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
            {{ accountStore.user.userName }}
          </a-button>
        </a-popover>
        <a-switch v-model:checked="isDarkTheme" @change="() => { globalStore.changeTheme() }">
          <template #checkedChildren><check-outlined /></template>
          <template #unCheckedChildren><close-outlined /></template>
        </a-switch>
      </div>
    </a-layout-header>
    <a-layout class="flex-1">
      <a-layout-sider width="200" v-model:collapsed="collapsed" collapsible>
        <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys" @select="changeMenu2"
          :items="menuList[selectedKeys1[0]].children" mode="inline" :style="{ height: '100%', borderRight: 0 }">
        </a-menu>
      </a-layout-sider>
      <a-layout class="flex-1">
        <a-layout-content class="h-full w-full" :style="{ padding: '12px 24px 0', margin: 0, minHeight: '280px' }">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
  <a-modal v-model:open="modalVisible" width="600px" title="密码修改" centered :maskClosable="false" :closable="false"
    :footer="null" :bodyStyle="{ height: '318px', paddingTop: '20px' }">
    <PasswordEdit :user-id="currentUserId" @save-success="saveSuccess" @cancel="setModalVisible(false)"></PasswordEdit>
  </a-modal>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'DefaultLayout'
});
import { watch, h, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/utils/ApiClientHelper';
import { useMenuStore } from '@/stores/menuStore';
import PasswordEdit from '@/components/user/PasswordEdit.vue';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MailOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue';
import { useGlobalStore } from "@/stores/globalStore";
import { useAccountStore } from "@/stores/accountStore";
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';

const globalStore = useGlobalStore();
const accountStore = useAccountStore();
const isDarkTheme = ref(globalStore.isDarkTheme)

const router = useRouter()
const store = useMenuStore()
const selectedKeys1 = ref<number[]>([store._selectedKeys1]);
const selectedKeys2 = ref<string[]>(store.getSelectedKeys2());
let openKeys = ref<string[]>(store.getOpenKeys());
const collapsed = ref(true);
const { _selectedKeys1, _selectedKeys2, _openKeys } = storeToRefs(store);
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;

  openKeys.value = collapsed.value ? [] : store.getOpenKeys();

};
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
        // {
        //   key: 'S_Questionnaire',
        //   label: '测评试卷管理',
        //   title: '测评试卷管理',
        // },
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

watch(_selectedKeys1, async (newValue, oldValue) => {
  // console.log("_selectedKeys1", newValue)
  // console.log("selectedKeys1",selectedKeys1.value)
  selectedKeys1.value = [newValue]
}, { deep: true })
watch(_selectedKeys2, async (newValue, oldValue) => {
  // console.log("_selectedKeys2",newValue)
  // console.log("selectedKeys2",selectedKeys2.value)
  selectedKeys2.value = newValue[_selectedKeys1.value]
}, { deep: true })

watch(_openKeys, async (newValue, oldValue) => {
  // console.log("_openKeys",newValue)
  // console.log("openKeys",openKeys.value)

  openKeys.value = collapsed.value ? [] : newValue[_selectedKeys1.value];
}, { deep: true })

//#endregion

const changeMenu1 = ({ key, selectedKeys }: { key: number; selectedKeys: number[] }) => {
  // console.log(key)
  // console.log(selectedKeys)
  selectedKeys2.value = store.getSelectedKeys2(key)
  openKeys.value = collapsed.value ? [] : store.getOpenKeys(key);
  store.setter(key, selectedKeys2.value, openKeys.value)
  router.push({ name: selectedKeys2.value[0], params: {} })
}

const changeMenu2 = ({ key, selectedKeys }: { key: string; selectedKeys: string[] }) => {
  // console.log(key)
  // console.log(selectedKeys)
  store.setter(selectedKeys1.value[0], selectedKeys2.value, openKeys.value)
  router.push({ name: selectedKeys2.value[0], params: {} })
}

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
  setModalVisible(true, accountStore.user.userId);
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
