<template>
  <header class="h-16 bg-white shadow-sm px-6 flex items-center justify-between">
    <!-- 新增面包屑组件 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">{{ item }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="flex items-center space-x-4">
      <el-badge :value="3">
        <el-button :icon="Bell" circle />
      </el-badge>
      <el-avatar :size="32" src="https://ai-public.mastergo.com/ai/img_res/410fe1edbb98608b7041af71c5d5c36a.jpg"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref ,onMounted,onUnmounted} from 'vue';
import { Bell, Search } from '@element-plus/icons-vue';
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus';
import { emitter } from '../../assets/eventBus'; // 导入事件总线
// 定义面包屑信息
const breadcrumbItems = ref<string[]>(['仪表盘']);

onMounted(() => {
  emitter.on('custom-event', (data) => {
    breadcrumbItems.value = data.data;
  });
});

onUnmounted(() => {
  emitter.off('custom-event'); // 清理监听
});
</script>