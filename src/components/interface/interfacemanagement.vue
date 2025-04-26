<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 顶部功能区 -->
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div class="flex flex-wrap gap-4 items-end">
        <!-- 搜索输入 -->
        <el-input
          v-model="searchParams.keyword"
          placeholder="请求地址"
          class="w-72"
        />

        <!-- 筛选下拉 -->
        <el-select 
          v-model="searchParams.status"
          placeholder="全部状态"
          class="w-32"
        >
          <el-option label="全部状态" value="" />
          <el-option label="已启用" value="true" />
          <el-option label="已停用" value="false" />
        </el-select>

        <el-select
          v-model="searchParams.module"
          placeholder="全部模块"
          class="w-32"
        >
          <el-option label="全部模块" value="" />
          <el-option label="user" value="user" />
          <el-option label="article" value="article" />
          <el-option label="patent" value="patent" />
          <el-option label="email" value="email" />
          <el-option label="login" value="login" />
          <el-option label="pay" value="pay" />
          <el-option label="route" value="route" />
          <el-option label="statistics" value="statistics" />
          <el-option label="trademark" value="trademark" />
          <el-option label="statistics" value="statistics" />
          <el-option label="statistics" value="statistics" />
          
        </el-select>

        <!-- 操作按钮 -->
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <!-- 移除新增接口按钮 -->
        <el-button @click="handleExport">导出Excel</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table 
      :data="tableData"
      class="mt-4 rounded-lg shadow-sm"
      header-cell-class-name="bg-blue-50"
      @selection-change="handleSelectionChange"
    >
      <!-- 添加选框列 -->
      <el-table-column type="selection" width="55" />
      <!-- 自增 ID 列 -->
      <el-table-column label="ID" width="80">
        <template #default="{ $index }">
          {{ ($index + 1) + (pagination.current - 1) * pagination.size }}
        </template>
      </el-table-column>
      <el-table-column label="所属模块" width="120">
        <template #default="{ row }">
          {{ extractModuleFromPath(row.path) }}
        </template>
      </el-table-column>
      <el-table-column prop="path" label="请求地址" />
      <el-table-column label="请求方式" width="100">
        <template #default="{ row }">
          <el-tag :type="methodType[row.method]">{{ row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="调用次数" width="100" />
      <el-table-column prop="total_time" label="总调用时间" width="120">
        <template #default="{ row }">
          {{ (row.total_time / 1000000).toFixed(2) }} ms
        </template>
      </el-table-column>
      <el-table-column label="平均调用时间" width="120">
        <template #default="{ row }">
          {{ ((row.total_time / row.count) / 1000000).toFixed(2) }} ms
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType[getDisplayStatus(row.status)]">{{ getDisplayStatus(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button 
            :type="row.status ? 'danger' : 'success'" 
            size="small"
            @click="confirmToggleStatus(row)"
          >
            {{ row.status  ? '关闭接口' : '启用接口' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination 
    class="mt-4 justify-end" 
    layout="total, sizes, prev, pager, next" 
    :total="pagination.total"
    :page-sizes="[10, 20, 50, 100]"
    @current-change="handlePageChange"
    @size-change="handleSizeChange"
    v-model:current-page="pagination.current"
     />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import axios from '../../axios/axios';
import { ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';

const methodType = {
  GET: '',
  POST: 'success',
  PUT: 'warning',
  DELETE: 'danger'
};

const statusType = {
  已启用: 'success',
  已停用: 'danger'
};

const searchParams = reactive({
  keyword: '',
  status: '',
  module: ''
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

const tableData = ref([]);

// 新增方法，将布尔值转换为文字描述
const getDisplayStatus = (status) => {
  return status === true ? '已启用' : '已停用';
};

const fetchData = async () => {
  try {
    const response = await axios.get('/route/interface_info', {
      params: {
        keyword: searchParams.keyword,
        page_size: pagination.size,
        page: pagination.current,
        status: searchParams.status ,
        split_path: searchParams.module
      }
    });
    // console.log('响应数据:', response.data); // 打印响应数据，方便调试
    tableData.value = response.data.data.routes;
    pagination.total = response.data.data.total;
    pagination.current = response.data.data.page;
    pagination.size = response.data.data.page_size;
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  Object.assign(searchParams, {
    keyword: '',
    status: '',
    module: ''
  });
  pagination.current = 1;
  fetchData();
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

const confirmToggleStatus = async (row) => {
  const actionText = row.status ? '关闭' : '启用';
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}路径为 ${row.path} 的接口吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // 用户点击确定，执行状态切换逻辑
    await toggleStatus(row);
  } catch (error) {
    // 用户点击取消，不做任何操作
    if (error !== 'cancel') {
      console.error('操作出错:', error);
    }
  }
};

const toggleStatus = async (row) => {
  try {
    // 将显示状态转换为布尔值
    const currentBooleanStatus = row.status;
    const newBooleanStatus = !currentBooleanStatus;

    const formData = new FormData();
    formData.append('status', newBooleanStatus);
    formData.append('path', row.path);

    // 调用后端接口更新状态
    await axios.put('/route/interface_status', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // 更新本地数据
    row.status = newBooleanStatus;
  } catch (error) {
    console.error('更新接口状态失败:', error);
    // 可以添加错误提示逻辑
  }
};

const handleExport = () => {
  if (tableData.value.length === 0) {
    ElMessageBox.warning('当前没有数据可导出');
    return;
  }

  // 定义表头
  const header = [
    'ID',
    '所属模块',
    '请求地址',
    '请求方式',
    '调用次数',
    '总调用时间(ms)',
    '平均调用时间(ms)',
    '状态'
  ];

  // 转换表格数据
  const data = tableData.value.map((row, index) => [
    (index + 1) + (pagination.current - 1) * pagination.size,
    extractModuleFromPath(row.path),
    row.path,
    row.method,
    row.count,
    (row.total_time / 1000000).toFixed(2),
    ((row.total_time / row.count) / 1000000).toFixed(2),
    getDisplayStatus(row.status)
  ]);

  // 将表头添加到数据的第一行
  data.unshift(header);

  // 创建工作簿和工作表
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '接口数据');

  // 导出 Excel 文件
  XLSX.writeFile(wb, '接口数据.xlsx');
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};
const handleSizeChange = (size) => {
  pagination.size = size;
  fetchData();
};
onMounted(() => {
  fetchData();
});

// 新增方法，从路径中提取模块名
const extractModuleFromPath = (path) => {
  if (!path) return '';
  const parts = path.split('/');
  return parts.length > 1 ? parts[1] : '';
};
</script>

<style>
/* 定制Element Plus组件颜色 */
.el-button--success {
  --el-button-bg-color: #67C23A;
  --el-button-hover-bg-color: #85ce61;
}

.el-tag--success {
  --el-tag-bg-color: var(--el-color-success-light-9);
  --el-tag-text-color: var(--el-color-success);
}
</style>