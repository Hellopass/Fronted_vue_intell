<template>
  <el-card class="!rounded-button">
    <template #header>
      <div class="flex justify-between items-center">
        <span>最近活动</span>
        <el-button type="primary" class="!rounded-button">查看全部</el-button>
      </div>
    </template>
    <el-table :data="activities" stripe>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === '专利' ? 'success' : row.type === '著作' ? 'warning' : 'info'">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="status" label="状态" width="120"/>
      <el-table-column prop="date" label="更新时间" width="180"/>
      <el-table-column label="操作" width="120">
        <template #default>
          <el-button type="primary" link>查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
defineProps({
  activities: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.el-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
}

:deep(.el-table__row) td {
  transition: background-color 0.2s;
}
</style>