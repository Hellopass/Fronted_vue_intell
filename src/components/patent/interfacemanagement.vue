<template>
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- 顶部功能区 -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex flex-wrap gap-4 items-end">
          <!-- 搜索输入 -->
          <el-input
            v-model="searchParams.keyword"
            placeholder="接口名称/请求地址"
            class="w-72"
          />
  
          <!-- 筛选下拉 -->
          <el-select 
            v-model="searchParams.status"
            placeholder="全部状态"
            class="w-32"
          >
            <el-option label="全部状态" value="" />
            <el-option label="已启用" value="active" />
            <el-option label="维护中" value="maintaining" />
          </el-select>
  
          <el-select
            v-model="searchParams.module"
            placeholder="全部模块"
            class="w-32"
          >
            <el-option label="全部模块" value="" />
            <el-option label="认证中心" value="auth" />
            <el-option label="专利服务" value="patent" />
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
      >
        <el-table-column prop="name" label="接口名称" width="180" />
        <el-table-column label="请求方式" width="100">
          <template #default="{ row }">
            <el-tag :type="methodType[row.method]">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="请求地址" />
        <el-table-column prop="module" label="所属模块" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              :type="row.isClosed ? 'danger' : 'success'" 
              size="small"
              @click="handleClose(row)"
            >
              {{ row.isClosed ? '启用接口' : '关闭接口' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <el-pagination
        class="mt-4 justify-end"
        v-model:current-page="pagination.current"
        :page-size="pagination.size"
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
  
  const methodType = {
    GET: '',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger'
  };
  
  const statusType = {
    已启用: 'success',
    维护中: 'warning',
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
    total: 35
  });
  
  const tableData = reactive([
    {
      name: '用户登录接口',
      method: 'POST',
      path: '/api/v1/auth/login',
      module: '认证中心',
      status: '已启用',
      doc: '请求参数：{username, password}',
      isClosed: false // 新增字段，标记接口是否关闭
    },
    // 其他数据...
  ]);
  
  const handleSearch = () => {
    // 搜索逻辑
  };
  

  
  const handleClose = (row) => {
    row.isClosed == true? row.isClosed = false:row.isClosed = true;
    // 这里可以添加实际的关闭接口的逻辑，例如调用 API
  };
  
  const handleReset = () => {
    Object.assign(searchParams, {
      keyword: '',
      status: '',
      module: ''
    });
  };
  
  // 其他操作函数...
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