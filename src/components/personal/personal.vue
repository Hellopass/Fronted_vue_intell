<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-7xl px-4">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <!-- 头部区域 -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full overflow-hidden">
              <img :src="avatarUrl" alt="用户头像" class="w-full h-full object-cover"/>
            </div>
            <div>
              <h1 class="text-2xl font-medium text-gray-900">{{ userData.UserName }}</h1>
              <p class="text-gray-500 mt-1">ID: {{ userData.UserID }}</p>
            </div>
          </div>
          <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="handleEdit">
            <el-icon class="mr-1">
              <Edit/>
            </el-icon>
            编辑信息
          </el-button>
          <el-dialog
              title="编辑信息"
              v-model="dialogVisible"
              width="50%">
            <update_personal :user-data="userData"></update_personal>
            <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
          </el-dialog>
        </div>

        <!-- 信息内容区域 -->
        <div class="grid grid-cols-2 gap-x-12 gap-y-8">
          <!-- 基本信息 -->
          <div class="col-span-2 lg:col-span-1">
            <h2 class="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div class="space-y-4">
              <div class="flex items-center">
                <span class="w-24 text-gray-500">姓名</span>
                <span class="flex-1 text-gray-900">{{ userData.UserName }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">性别</span>
                <span class="flex-1 text-gray-900">{{ userData.Sex }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">邮箱</span>
                <span class="flex-1 text-gray-900">{{ userData.email }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">身份证号</span>
                <span class="flex-1 text-gray-900">{{ userData.IDCard }}</span>
              </div>
            </div>
          </div>

          <!-- 单位信息 -->
          <div class="col-span-2 lg:col-span-1">
            <h2 class="text-lg font-medium text-gray-900 mb-4">单位信息</h2>
            <div class="space-y-4">
              <div class="flex items-center">
                <span class="w-24 text-gray-500">所属学院</span>
                <span class="flex-1 text-gray-900">{{ userData.Unit }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">部门 ID</span>
                <span class="flex-1 text-gray-900">{{ userData.DepID }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">职称</span>
                <span class="flex-1 text-gray-900">{{ userData.TechIP }}</span>
              </div>
            </div>
          </div>

          <!-- 教育背景 -->
          <div class="col-span-2 lg:col-span-1">
            <h2 class="text-lg font-medium text-gray-900 mb-4">教育背景</h2>
            <div class="space-y-4">
              <div class="flex items-center">
                <span class="w-24 text-gray-500">最高学历</span>
                <span class="flex-1 text-gray-900">{{ userData.LastDegree }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">政治面貌</span>
                <span class="flex-1 text-gray-900">{{ userData.Political }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">一级学科</span>
                <span class="flex-1 text-gray-900">{{ userData.Cour }}</span>
              </div>
            </div>
          </div>

          <!-- 研究领域 -->
          <div class="col-span-2 lg:col-span-1">
            <h2 class="text-lg font-medium text-gray-900 mb-4">研究领域</h2>
            <div class="space-y-4">
              <div class="flex items-center">
                <span class="w-24 text-gray-500">研究方向</span>
                <span class="flex-1 text-gray-900">{{ userData.Research }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-24 text-gray-500">教学 IP</span>
                <span class="flex-1 text-gray-900">{{ userData.TechIP }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {Edit} from '@element-plus/icons-vue';
import axios from '../../axios/axios';
import router from "../../router/index"
import {ElMessage} from "element-plus";
import jwt_parse from "../../assets/jwt";
import Update_personal from "./update_personal.vue";

const avatarUrl = 'https://ai-public.mastergo.com/ai/img_res/59e20975b1acc5822314f29d0d3cb697.jpg';

interface UserData {
  UserID: number;
  UserName: string;
  DepID: number;
  Password: string;
  Authority: string;
  Sex: string;
  email: string;
  IDCard: string;
  Political: string;
  Unit: string;
  LastDegree: string;
  TechIP: string;
  Cour: string;
  Research: string;
  avatar: string;//头像连接
}

const userData = ref<UserData>({
  UserID: 0,
  UserName: '',
  DepID: 0,
  Password: '',
  Authority: '',
  Sex: '',
  email: '',
  IDCard: '',
  Political: '',
  Unit: '',
  LastDegree: '',
  TechIP: '',
  Cour: '',
  Research: '',
  avatar: avatarUrl,
});
const dialogVisible = ref(false);
const handleEdit = () => {
  dialogVisible.value = true
  console.log('编辑信息')
};

onMounted(() => {
  //向后端请求
  //解析jwt
  const token = localStorage.getItem('token')
  const parse = jwt_parse(token)

  // const response = await fetch('http://localhost:8080/user/10086');
  axios.get('/user/find', {
    params: {
      'user_id': parse.user_id
    }
  }).then(res => {
    const d = res.data.data
    userData.value.UserID = d.id
    userData.value.UserName = d.user_name
    userData.value.DepID = d.dep_id
    userData.value.Password = d.password
    userData.value.Authority = d.authority
    d.sex == 'male' ? userData.value.Sex = '男' : userData.value.Sex = '女'
    userData.value.email = d.email
    userData.value.IDCard = d.id_card
    userData.value.Political = d.political
    userData.value.Unit = d.unit
    userData.value.LastDegree = d.last_degree
    userData.value.TechIP = d.tech_ip
    userData.value.Cour = d.cour
    userData.value.Research = d.research

  }).catch(err => {
    ElMessage.error('登录过期，请重新登录')
    router.push('/').then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    })
  })

})


</script>

<style scoped>
.el-button {
  height: 40px;
  padding: 0 20px;
}
</style>

