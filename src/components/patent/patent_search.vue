<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4">
      <main class="h-screen flex items-center justify-center">
        <div class="w-2/3">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">专利检索</h1>
            <p class="text-gray-600">快速查询国内专利信息</p>
          </div>
          <div class="relative">
            <el-input
                v-model="searchQuery"
                placeholder="请输入关键词 申请号/公开号/申请人/发明人/发明名称"
                class="!rounded-button"
                :prefix-icon="Search"
                clearable
            >
              <template #append>
                <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="handleSearch">
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>




          <!-- 热门标签 -->
          <div class="flex flex-wrap justify-center gap-4 mt-6">
            <el-tag
                v-for="tag in hotTags"
                :key="tag"
                class="!rounded-button cursor-pointer"
                @click="handleTagClick(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import {parseAstAsync} from "vite";

const searchQuery = ref('');
const hotTags = ref([

]);

const handleSearch = () => {
// 处理搜索逻辑

};

const handleTagClick = (tag: string) => {
  searchQuery.value = tag;
  handleSearch();
};
</script>
<style scoped>
.el-input {
  --el-input-height: 56px;
  --el-input-border-radius: 28px;
  --el-input-border-color: #e5e7eb;
  --el-input-hover-border-color: #3b82f6;
  --el-input-focus-border-color: #3b82f6;
  --el-input-font-size: 16px;
}

.el-button--primary {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #2563eb;
  --el-button-hover-border-color: #2563eb;
}

.el-tag {
  --el-tag-bg-color: #f3f4f6;
  --el-tag-border-color: transparent;
  --el-tag-hover-color: #3b82f6;
  padding: 8px 16px;
}
</style>
