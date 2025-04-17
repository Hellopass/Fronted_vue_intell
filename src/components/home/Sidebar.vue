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
        <el-menu-item index="1" @click="navigateTo('dashboard')">
          <el-icon>
            <DataBoard/>
          </el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <el-icon>
              <Document/>
            </el-icon>
            <span>专利管理</span>
          </template>
          <el-menu-item index="2-1" @click="navigateTo('patent_apply')">专利信息</el-menu-item>
<!--          <el-menu-item index="2-2" @click="navigateTo('patent_search')">专利检索</el-menu-item>-->
          <el-menu-item index="2-3" @click="navigateTo('patent_fee')">年费管理</el-menu-item>
          <el-menu-item index="2-4" @click="navigateTo('patent_statistics')">数据统计</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon>
              <Notebook/>
            </el-icon>
            <span>著作管理</span>
          </template>
          <el-menu-item index="3-1">著作登记</el-menu-item>
          <el-menu-item index="3-2">作品管理</el-menu-item>
          <el-menu-item index="3-3">合同管理</el-menu-item>
          <el-menu-item index="3-4">统计分析</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon>
              <PriceTag/>
            </el-icon>
            <span>商标管理</span>
          </template>
          <el-menu-item index="4-1">商标注册</el-menu-item>
          <el-menu-item index="4-2">商标监测</el-menu-item>
          <el-menu-item index="4-3">续展管理</el-menu-item>
          <el-menu-item index="4-4">许可备案</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon>
              <Folder/>
            </el-icon>
            <span>文档中心</span>
          </template>
          <el-menu-item index="5-1">文档库</el-menu-item>
          <el-menu-item index="5-2">模板中心</el-menu-item>
          <el-menu-item index="5-3">知识分享</el-menu-item>
          <el-menu-item index="5-4">文档审批</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="6-1">用户管理</el-menu-item>
          <el-menu-item index="6-2">角色权限</el-menu-item>
          <el-menu-item index="6-3">组织架构</el-menu-item>
          <el-menu-item index="6-4">系统参数</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="7" @click="navigateTo('personal_information')">
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
  router.push({path});
};

// 默认导航到 patent_apply 路由
onMounted(() => {
  router.push({path: 'dashboard'});
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