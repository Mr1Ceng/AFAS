<template>
  <div class="h-full w-full flex flex-col">
    <div class="w-full h-16 pt-2">
      <span class="text-xl">用户查询</span>
    </div>
    <div class="w-full h-12 flex flex-row pb-4">
      <a-input-search class="pr-4" v-model:value="queryText" placeholder="姓名/手机号/账号" style="width: 200px"
        @search="UserGridQuery" />
    </div>
    <div ref="tableContainer" class="w-full h-[calc(100%-112px)] flex">
      <a-table class="h-full" :columns="columns" :data-source="Users?.data" :pagination="pagination"
        :scroll="{ y: tableHeight }">
        <!-- <template #headerCell="{ column }">
          <template
            v-if="column.dataIndex === 'radarImage' || column.dataIndex === 'sImage' || column.dataIndex === 'tImage'">
            <span>
              qqq
            </span>
          </template>
</template> -->
        <template #bodyCell="{ column, record }">
          <template
            v-if="column.dataIndex === 'avatarUrl'">
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
            {{ record[column.dataIndex]?'是':'否'}}
          </template>
          <template v-if="column.dataIndex === 'role'">
            {{ EnumHelper.getDescriptionByValue(RoleDescription, record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button size="small" type="link" @click="() => {currentUserId = record['userId'];setDrawerVisible(true); }">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-drawer
    title="用户编辑"
    placement="right"
    :open="drawerVisible"
    :destroyOnClose="true"
    @close="()=>{setDrawerVisible(false);UserGridQuery();}"
    :width="600"
  >
    <UserEdit :user-id="currentUserId"></UserEdit>
  </a-drawer>
</template>


<script lang="ts" setup>
import { watch, h, ref, computed, onMounted } from 'vue';
import apiClient from '@/utils/ApiClientHelper'
import dayjs from "dayjs";
import { Sorter } from "@/enums/common/Sorter";
import type { TableQueryModelWithData } from "@/models/common/TableQueryModel";
import type { DataList } from "@/models/common/DataList";
import { UserColumns, type UserQueryRow } from "@/models/user/UserQueryRow";
import UserEdit from '@/components/user/UserEdit.vue';
import { EnumHelper } from '@/utils/EnumHelper';
import { GerderDescription } from '@/enums/GerderEnum';
import { RoleDescription } from '@/enums/RoleEnum';

const tableContainer = ref<any>();
const tableHeight = computed(() => {
  return tableContainer.value?.clientHeight - 150;
});
const tableWidth = computed(() => {
  return tableContainer.value?.clientWidth;
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

onMounted(()=>{
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
    if (item.dataIndex == 'account' || item.dataIndex == 'userName' || item.dataIndex == 'mobile'){
      item.fixed ='left';
    }
  })
  columns.push({
    title: '操作',
    dataIndex: 'action',
    ellipsis: true,
    align: "center",
    fixed: 'right',
    width: "100px",
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

//抽屉
const drawerVisible = ref<boolean>(false);
  const setDrawerVisible = (open: boolean) => {
    drawerVisible.value = open;
};
const currentUserId = ref<string>("")
</script>