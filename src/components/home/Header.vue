<template>
  <header class="h-16 bg-white shadow-sm px-6 flex items-center justify-between">
    <div class="flex-1 max-w-2xl">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索专利、著作、商标..."
          class="w-full"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <div class="flex items-center space-x-4">
      <el-badge :value="3">
        <el-button :icon="Bell" circle />
      </el-badge>
      <el-avatar :size="32" src="https://ai-public.mastergo.com/ai/img_res/410fe1edbb98608b7041af71c5d5c36a.jpg"/>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Bell, Search } from '@element-plus/icons-vue';

const searchKeyword = ref('');
</script>