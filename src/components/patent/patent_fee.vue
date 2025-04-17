
<template>
  <div class="min-h-screen bg-gray-50 p-8">
<!--    &lt;!&ndash; 头部标题 &ndash;&gt;-->
<!--    <div class="mb-6">-->
<!--      <h1 class="text-2xl font-bold text-gray-800">专利年费管理</h1>-->
<!--    </div>-->

    <!-- 搜索区域 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <div  class="w-full">
            <el-input
                v-model="searchQuery"
                placeholder="请输入专利名称或编号搜索"
            >
              <template #prefix>
                <el-icon>
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <div class="w-40">
          <el-select
              v-model="statusFilter"
              placeholder="状态筛选"
              class="w-64"
          >
            <el-option label="全部" value=""/>
            <el-option label="待缴费" value="pending"/>
            <el-option label="已缴费" value="paid"/>
            <el-option label="已逾期" value="overdue"/>
          </el-select>
        </div>
        <el-button type="primary" class="!rounded-button whitespace-nowrap">
          <el-icon class="mr-1">
            <Search/>
          </el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">本月待缴费数量</p>
            <p class="text-2xl font-bold text-blue-600">28</p>
          </div>
          <el-icon class="text-3xl text-blue-400">
            <Calendar/>
          </el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">本月已缴费金额</p>
            <p class="text-2xl font-bold text-green-600">¥ 156,800</p>
          </div>
          <el-icon class="text-3xl text-green-400">
            <Money/>
          </el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">逾期未缴数量</p>
            <p class="text-2xl font-bold text-red-600">5</p>
          </div>
          <el-icon class="text-3xl text-red-400">
            <Warning/>
          </el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">年费节省金额</p>
            <p class="text-2xl font-bold text-purple-600">¥ 23,500</p>
          </div>
          <el-icon class="text-3xl text-purple-400">
            <Wallet/>
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 表格工具栏 -->
    <div class="bg-white p-4 rounded-t-lg shadow-sm border-b flex justify-between items-center">
      <div class="flex items-center gap-2">
        <el-button type="primary" class="!rounded-button whitespace-nowrap">
          <el-icon class="mr-1">
            <Plus/>
          </el-icon>
          批量缴费
        </el-button>
        <el-button class="!rounded-button whitespace-nowrap">
          <el-icon class="mr-1">
            <Download/>
          </el-icon>
          导出 Excel
        </el-button>
      </div>
      <div class="text-gray-500">
        共 {{ total }} 条记录
      </div>
    </div>

    <!-- 专利年费表格 -->
    <div class="bg-white rounded-b-lg shadow-sm">
      <el-table
          :data="tableData"
          @selection-change="handleSelectionChange"
          style="width: 100%"
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="name" label="专利名称/编号" min-width="300">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.name }}</span>
              <span class="text-gray-500 text-sm">{{ row.code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="专利类型" width="120"/>
        <el-table-column prop="amount" label="应缴金额" width="120">
          <template #default="{ row }">
            <span class="font-medium">¥ {{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="缴费截止日期" width="180"/>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag
                :type="getStatusType(row.status)"
                effect="light"
                class="!rounded-button"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 'pending'"
                type="primary"
                class="!rounded-button whitespace-nowrap"
                size="small"
            >
              立即缴费
            </el-button>
            <el-button
                class="!rounded-button whitespace-nowrap"
                size="small"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            class="!rounded-button"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {Search, Setting, Calendar, Money, Warning, Wallet, Plus, Download} from '@element-plus/icons-vue';

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(156);
const selectedRows = ref([]);

const tableData = ref([
  {
    name: '一种新型环保材料制备方法',
    code: 'CN202110123456.9',
    type: '发明专利',
    amount: '8,500',
    deadline: '2024-03-15',
    status: 'pending'
  },
  {
    name: '智能家居控制系统',
    code: 'CN202110789012.3',
    type: '实用新型',
    amount: '3,200',
    deadline: '2024-02-28',
    status: 'paid'
  },
  {
    name: '新型显示屏制造工艺',
    code: 'CN202110345678.1',
    type: '发明专利',
    amount: '12,600',
    deadline: '2024-01-15',
    status: 'overdue'
  },
  {
    name: '便携式医疗检测设备',
    code: 'CN202110901234.5',
    type: '发明专利',
    amount: '9,800',
    deadline: '2024-04-01',
    status: 'pending'
  },
  {
    name: '高效节能空调系统',
    code: 'CN202110567890.2',
    type: '实用新型',
    amount: '4,500',
    deadline: '2024-03-20',
    status: 'pending'
  }
]);

const getStatusType = (status: string) => {
  const types = {
    pending: 'warning',
    paid: 'success',
    overdue: 'danger'
  };
  return types[status as keyof typeof types];
};

const getStatusText = (status: string) => {
  const texts = {
    pending: '待缴费',
    paid: '已缴费',
    overdue: '已逾期'
  };
  return texts[status as keyof typeof texts];
};

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};
</script>

<style scoped>
.el-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb;
}

.el-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}

.el-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb;
}

.el-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}
</style>

