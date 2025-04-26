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
        <el-menu-item index="1" @click="navigateTo('dashboard',['仪表盘'])">
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
          <el-menu-item index="2-1" @click="navigateTo('patent_apply',['专利管理','专利信息'])">专利信息</el-menu-item>
          <el-menu-item index="2-2" @click="navigateTo('')">数据统计</el-menu-item>
          <el-menu-item index="2-4" @click="navigateTo('patentfee_information',['专利管理','年费信息'])">年费信息</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon>
              <Notebook/>
            </el-icon>
            <span>著作管理</span>
          </template>
          <el-menu-item index="3-1" @click="navigateTo('article_information',['著作管理','著作信息'])">著作信息</el-menu-item>
          <el-menu-item index="3-2" @click="navigateTo('')">数据统计</el-menu-item>
          <el-menu-item index="3-4" @click="navigateTo('articlefee_information',['著作管理','年费管理'])">年费信息</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon>
              <PriceTag/>
            </el-icon>
            <span>商标管理</span>
          </template>
          <el-menu-item index="4-1"  @click="navigateTo('trademark_information',['商标管理','商标信息'])" >商标信息</el-menu-item>
          <el-menu-item index="4-2" @click="navigateTo('')">数据统计</el-menu-item>
          <el-menu-item index="4-4" @click="navigateTo('trademarkfee_information',['商标管理','年费管理'])">年费信息</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon>
              <Folder/>
            </el-icon>
            <span>文档中心</span>
          </template>
          <el-menu-item index="5-1" @click="navigateTo('file_information',['文档中心','文档库'])">文档库</el-menu-item>
          <el-menu-item index="5-2" @click="navigateTo('')">数据统计</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="6">
          <template #title>
            <el-icon>
              <Setting/>
            </el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="6-1">用户管理</el-menu-item>
          <el-menu-item index="6-4">系统参数</el-menu-item>
          <el-menu-item index="6-2" @click="navigateTo('')">数据统计</el-menu-item>
          <el-menu-item index="6-3" @click="navigateTo('interface',['专利管理','接口管理'])">接口管理</el-menu-item>
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
import { emitter } from '../../assets/eventBus'; // 导入事件总线
import { number } from 'echarts';
const router = useRouter();

const navigateTo = (path: string,data: string[]) => {
  sendData(data)
  router.push("/home/"+path);
};

const sendData = (data:any) => {
  emitter.emit('custom-event', { data: data });
};

// 默认导航到 patent_apply 路由
onMounted(() => {
  router.push({ path: '/home/dashboard'});
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