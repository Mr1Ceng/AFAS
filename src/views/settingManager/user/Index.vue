<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">用户查询</span>
    </div>
    <div class="w-full h-12 pb-4">
      <a-row>
        <a-col flex="auto">
          <a-input-search class="pr-4" v-model:value="queryText" placeholder="姓名/手机号/账号" style="width: 300px"
            @search="UserGridQuery" /></a-col>
        <a-col flex="100px" class="flex pr-4 justify-end">
          <a-button type="primary" @click="setDrawerVisible(true, '')">新增</a-button>
        </a-col>
      </a-row>
    </div>
    <div ref="tableContainer" class="w-full h-[calc(100%-112px)] flex">
      <a-table class="h-full" :columns="columns" :data-source="Users?.data" :pagination="pagination"
        :scroll="{ y: tableHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'avatarUrl'">
            <a-popover placement="left">
              <template #content>
                <img class="w-100" :src="record[column.dataIndex]">
              </template>
              <a-button size="small" type="link">
                {{ record[column.dataIndex] ? '查看' : '' }}
              </a-button>
            </a-popover>
          </template>
          <template v-if="column.dataIndex === 'gender'">
            {{ EnumHelper.getDescriptionByValue(GerderDescription, record[column.dataIndex]) }}
          </template>
          <template v-if="column.dataIndex === 'isDeveloper'">
            {{ record[column.dataIndex] ? '是' : '否' }}
          </template>
          <template v-if="column.dataIndex === 'role'">
            {{ EnumHelper.getDescriptionByValue(RoleDescription, record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button size="small" type="link" @click="() => { setDrawerVisible(true, record['userId']); }">
              详情
            </a-button>
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" danger @click="() => { showDeleteConfirm(record); }">删除</a-menu-item>
                  <a-menu-item key="2" @click="() => { setModalVisible(true, record['userId']); }">修改密码</a-menu-item>
                </a-menu>
              </template>
              <a-button size="small" type="link">
                编辑
              </a-button>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-modal v-model:open="modalVisible" width="600px" title="密码修改" centered :maskClosable="false" :closable="false"
    :footer="null" :bodyStyle="{ height: '318px', paddingTop: '20px' }">
    <PasswordEdit :user-id="currentUserId" @save-success="saveSuccess" @cancel="setModalVisible(false)"></PasswordEdit>
  </a-modal>
  <a-drawer title="用户编辑" placement="right" :open="drawerVisible" :destroyOnClose="true"
    @close="() => { setDrawerVisible(false); }" :width="600">
    <UserEdit :user-id="currentUserId" @save-success="saveSuccess"></UserEdit>
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted, createVNode } from 'vue';
import { apiClient } from '@/utils/ApiClientHelper'
import dayjs from "dayjs";
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import type { DataList } from "@/models/common/DataList";
import { UserColumns, type UserQueryRow } from "@/models/user/UserQueryRow";
import UserEdit from '@/components/user/UserEdit.vue';
import PasswordEdit from '@/components/user/PasswordEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleDescription, RoleEnum } from '@/enums/RoleEnum';
import { useAccountStore } from "@/stores/accountStore";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';

const accountStore = useAccountStore();
const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
});
const tableQueryModel = ref<TableQueryModelWithData<Record<string, any>>>({
  index: 0,
  size: 10,
  sorter: { key: "UserId", value: Sorter.ASC },
  data: {},
});
const Users = ref<DataList<UserQueryRow>>();
const UserGridQuery = async () => {
  try {
    const response = await apiClient.post('/User/UserGridQuery', tableQueryModel.value)
    console.log('响应:', response)
    if (response.status == 1) {
      Users.value = response.data
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

const RemoveUser = async (userId: string) => {
  try {
    const response = await apiClient.post(`/User/RemoveUser/${userId}`)
    console.log('响应:', response)
    if (response.status == 1) {
      message.success("删除成功！");
      UserGridQuery();
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

onMounted(() => {
  UserGridQuery();
})

//#region 计算属性
const columns = computed(() => {
  var columnsList = [
    'account',
    'userName',
    'mobile',
    'nickName',
    'avatarUrl',
    'gender',
    'age',
    'role',
    'isDeveloper',
  ];
  const columns: any[] = [];
  columnsList.forEach((item) => {
    columns.push(
      UserColumns.find(x => x.dataIndex == item)
    )
  });
  columns.forEach((item) => {
    if (item.dataIndex == 'account') {
      item.width = '160px'
    }
    if (item.dataIndex == 'account' || item.dataIndex == 'userName' || item.dataIndex == 'mobile') {
      item.fixed = 'left';
    }
  })
  columns.push({
    title: '操作',
    dataIndex: 'action',
    ellipsis: true,
    align: "center",
    fixed: 'right',
    width: "150px",
  })
  return columns;
});
const queryText = computed({
  get: () => tableQueryModel.value.data?.queryText ?? "",
  set: (value) => {
    if (!tableQueryModel.value.data) {
      tableQueryModel.value.data = { queryText: "" };
    }
    tableQueryModel.value.data.queryText = value;
  },
});
const pagination = computed(() => {
  return {
    current: tableQueryModel.value.index + 1, // AntD 的分页索引从 1 开始
    pageSize: tableQueryModel.value.size,
    total: Users.value?.count,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showQuickJumper: true,
    onChange: (page: number, pageSize: number) => {
      tableQueryModel.value.size = pageSize;
      tableQueryModel.value.index = page - 1;
      UserGridQuery();
    },
    showTotal: (total: any, range: any[]) => `第${range[0]}-${range[1]}条/总共${total}条`
  }
});
//#endregion

//弹框
const modalVisible = ref<boolean>(false);
const setModalVisible = (open: boolean, userId: string = '') => {
  modalVisible.value = open;
  if (open) {
    currentUserId.value = userId
  } else {
  }
};
//抽屉
const drawerVisible = ref<boolean>(false);
const setDrawerVisible = (open: boolean, userId: string = '') => {
  drawerVisible.value = open;
  if (open) {
    currentUserId.value = userId
  } else {
    UserGridQuery();
  }
};
const currentUserId = ref<string>("")

const saveSuccess = () => {
  setDrawerVisible(false);
  setModalVisible(false);
}

const showDeleteConfirm = (data: any) => {
  Modal.confirm({
    title: `确认删除用户【${data.userName}】?`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      RemoveUser(data.userId)
    }
  });
};
</script>