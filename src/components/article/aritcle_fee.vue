<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- 搜索区域 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative min-w-[1100px]"> 
          <el-input
            v-model="searchQuery"
            placeholder="请输入著作名称搜索"
            class="!rounded-button"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          class="w-40 !rounded-button"
        >
          <el-option label="全部" value="" />
          <el-option label="待缴费" value="0" />
          <el-option label="已缴费" value="1" />
          <el-option label="已逾期" value="2" />
        </el-select>
        <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="fetchData">
          <el-icon class="mr-1"><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
<!-- 数据统计卡片 -->
<div class="grid grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">待缴费数量</p>
            <p class="text-2xl font-bold text-blue-600">{{ pending_count }}</p>
          </div>
          <el-icon class="text-3xl text-blue-400"><Calendar /></el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">已缴费金额</p>
            <p class="text-2xl font-bold text-green-600">¥ {{ paid_amount }}</p>
          </div>
          <el-icon class="text-3xl text-green-400"><Money /></el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">逾期未缴数量</p>
            <p class="text-2xl font-bold text-red-600">{{ overdue_count }}</p>
          </div>
          <el-icon class="text-3xl text-red-400"><Warning /></el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">年费金额</p>
            <p class="text-2xl font-bold text-purple-600">¥ {{ total_amount }}</p>
          </div>
          <el-icon class="text-3xl text-purple-400"><Wallet /></el-icon>
        </div>
      </div>
    </div>
    <!-- 表格工具栏 -->
    <div class="bg-white p-4 rounded-t-lg shadow-sm border-b flex justify-between items-center">
      <div class="flex items-center gap-2">
        <el-button type="primary" class="!rounded-button whitespace-nowrap">
          <el-icon class="mr-1"><Plus /></el-icon>
          批量缴费
        </el-button>
        <el-button class="!rounded-button whitespace-nowrap" @click="exportToExcel">
          <el-icon class="mr-1"><Download /></el-icon>
          导出 Excel
        </el-button>
      </div>
      <div class="text-gray-500">
        共 {{ total }} 条记录
      </div>
    </div>

    <!-- 著作年费表格 -->
    <div class="bg-white rounded-b-lg shadow-sm">
      <el-table
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="著作名称/申请号" min-width="300">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.title }}</span>
              <span class="text-gray-500 text-sm">{{ row.application_number }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="应缴金额" width="120">
          <template #default="{ row }">
            <span class="font-medium">¥ {{ row.review_fee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="缴费截止日期" width="180" />
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
              v-if="row.status === 0"
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
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref,onMounted } from 'vue';
import { Search, Setting, Calendar, Money, Warning, Wallet, Plus, Download } from '@element-plus/icons-vue';
import axios from '../../axios/axios'; // 导入 Axios 库
import * as XLSX from 'xlsx';
import { ta } from 'element-plus/lib/locale/index.js';

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(156);
const selectedRows = ref([]);

const overdue_count = ref(0);
const paid_amount = ref(0);
const pending_count = ref(0);
const total_amount = ref(0);

interface PatentFee {
  title: string;
  application_number: string;
  type: number;
  review_fee: string;
  deadline: string;
  status: number;
}

const tableData = ref<PatentFee[]>([]);

const getStatusType = (status: string) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  };
  return types[status as keyof typeof types];
};

const getStatusText = (status: string) => {
  const texts = {
    0: '待缴费',
    1: '已缴费',
    2: '已逾期'
  };
  return texts[status as keyof typeof texts];
};

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};

// 重写初始化表格函数
const fetchData = async () => {
  tableData.value = []; // 清空表格数据
  try {
    const response = await axios.get('/article/get_fee_all', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchQuery.value,
        status: statusFilter.value
      }
    });
    const data = response.data;
    console.log(data.data.fees);
    
    tableData.value = data.data.fees.map((item: any) => ({
      title: item.article.title,
      application_number: item.article.application_number,
      type: item.article.patent_type,
      review_fee: item.review_fee,
      deadline: item.payment_deadline.split('T')[0],
      status: item.status
    }));

    total.value = data.data.total;
  } catch (error) {
    console.error('获取专利年费数据失败:', error);
    // 可以在这里添加更多的错误处理逻辑，比如显示错误提示框
  }
};

//钩子
onMounted(() => {
  fetchData()
  //获取数据统计信息
  axios.get('/article/get_monthly_fee_stats').then((response) => {
    const data =response.data.data
    overdue_count.value = data.overdue_count;
    paid_amount.value = data.paid_amount;
    pending_count.value = data.pending_count;
    total_amount.value = data.total_amount;
  })
});


// 导出 Excel 函数
const exportToExcel = () => {
  const headers = [
    '申请号',
    '专利类型',
    '应缴金额',
    '缴费截止日期',
    '状态'
  ];

  const data = tableData.value.map((row) => [
    `${row.application_number}`,
    row.type,
    `¥ ${row.review_fee}`,
    row.deadline,
    getStatusText(row.status.toString())
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '专利年费数据');

  // 导出文件
  XLSX.writeFile(workbook, '专利年费数据.xlsx');
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
