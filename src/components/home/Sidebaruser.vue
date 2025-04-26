<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-10">
    <div class="flex items-center h-16 px-6 border-b">
      <el-icon class="text-blue-600 text-xl">
        <Platform/>
      </el-icon>
      <span class="ml-2 text-lg font-medium">知识产权管理系统</span>
    </div>
    <nav class="p-4">
      <el-menu default-active="1" class="border-none">
        <el-menu-item index="1" @click="navigateTo('user_patent_apply')">
          <el-icon>
            <DataBoard/>
          </el-icon>
          <span>专利信息</span>
        </el-menu-item>
        <el-menu-item index="2" @click="navigateTo('user_article_information')">
          <el-icon>
            <Notebook/>
          </el-icon>
          <span>著作管理</span>
        </el-menu-item>

        <el-menu-item index="3" @click="navigateTo('user_trademark_information')">
          <el-icon>
            <PriceTag/>
          </el-icon>
          <span>商标管理</span>
        </el-menu-item>
        <el-menu-item index="4" @click="navigateTo('user_personal_information')">
          <el-icon>
            <User/>
          </el-icon>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  Platform,
  DataBoard,
  Document,
  Notebook,
  PriceTag,
  Folder,
  Setting, User,
} from '@element-plus/icons-vue';
import {useRouter} from 'vue-router';
import {onMounted} from "vue";

const router = useRouter();

const navigateTo = (path: string) => {
  router.push("/user/"+path);
};

// 默认导航到 patent_apply 路由
onMounted(() => {
  router.push('/user/user_patent_apply');
});
</script>

<style scoped>
.el-menu {
  border-right: none;
}

:deep(.el-sub-menu__title):hover {
  background-color: #f5f7fa;
}

:deep(.el-menu-item):hover {
  background-color: #f5f7fa;
}
</style>