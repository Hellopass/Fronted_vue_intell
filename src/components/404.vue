<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
    <div class="max-w-4xl w-full px-6 py-12">
      <div class="flex flex-col items-center">
        <!-- 404图片区域 -->
        <div class="w-96 h-96 mb-8 relative overflow-hidden rounded-lg">
          <img :src="errorImage" alt="404 Error" class="w-full h-full object-cover object-top">
        </div>
        <!-- 文字内容区域 -->
        <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 class="text-2xl font-medium text-gray-700 mb-8">抱歉，您访问的页面不存在</h2>
        <!-- 按钮区域 -->
        <div class="flex space-x-4">
          <button
              class="!rounded-button bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center"
              @click="b">
            <el-icon class="mr-2">
              <HomeFilled/>
            </el-icon>
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {HomeFilled} from '@element-plus/icons-vue';
import router from '../router/index';
// 生成404错误页面的图片
const errorImage = 'https://ai-public.mastergo.com/ai/img_res/9302cc683bdb8255d1a279dc25181203.jpg';
const b = () => {
  router.push('/home').then(() => {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  })
}
</script>
<style scoped>
.min-h-screen {
  min-height: 1024px;
}
</style>
