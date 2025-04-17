<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-3xl">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-medium">编辑个人信息</h1>
        </div>
        <!-- 头像上传 -->
        <div class="flex flex-col items-center mb-8">
          <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :http-request="handleUpload"
          >
            <div class="relative">
              <img v-if="imageUrl" :src="imageUrl" class="w-24 h-24 rounded-full object-cover"/>
              <img v-else :src="form.avatar" class="w-24 h-24 rounded-full object-cover"/>
            </div>
            <div class="mt-2 text-sm text-gray-500">点击更换头像</div>
          </el-upload>
          <p class="mt-1 text-xs text-gray-400">支持 jpg、png 格式，文件大小不超过 2MB</p>
        </div>
        <!-- 表单 -->
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <div class="grid grid-cols-2 gap-6">
            <!-- 基本信息 -->
            <div class="col-span-2">
              <h2 class="text-lg font-medium mb-4">基本信息</h2>
              <el-form-item label="姓名" prop="name">
                <div class="text-gray-700">{{ form.UserName }}</div>
              </el-form-item>
              <el-form-item label="性别" prop="gender">
                <div class="text-gray-700">{{ form.Sex }}</div>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <div class="text-gray-700">{{ form.email }}</div>
              </el-form-item>
              <el-form-item label="身份证号" prop="idCard">
                <div class="text-gray-700">{{ form.IDCard }}</div>
              </el-form-item>
            </div>
            <!-- 教育背景 -->
            <div class="col-span-2">
              <h2 class="text-lg font-medium mb-4">教育背景</h2>
              <el-form-item label="最高学历" prop="LastDegree">
                <el-select v-model="form.LastDegree" placeholder="请选择最高学历">
                  <el-option label="博士研究生" value="博士研究生"/>
                  <el-option label="硕士研究生" value="硕士研究生"/>
                  <el-option label="本科" value="本科"/>
                  <el-option label="专科" value="专科"/>
                </el-select>
              </el-form-item>
              <el-form-item label="政治面貌" prop="Political">
                <el-select v-model="form.Political" placeholder="请选择政治面貌">
                  <el-option label="中共党员" value="中共党员"/>
                  <el-option label="中共预备党员" value="中共预备党员"/>
                  <el-option label="共青团员" value="共青团员"/>
                  <el-option label="群众" value="群众"/>
                  <el-option label="其他" value="其他"/>
                </el-select>
              </el-form-item>
              <el-form-item label="一级学科" prop="Unit">
                <el-input v-model="form.Cour" placeholder="请输入一级学科"/>
              </el-form-item>
            </div>
            <!-- 单位信息 -->
            <div class="col-span-2">
              <h2 class="text-lg font-medium mb-4">单位信息</h2>
              <el-form-item label="所属学院" prop="Cour">
                <el-input v-model="form.Unit"/>
              </el-form-item>
              <el-form-item label="部门 ID" prop="DepID">
                <el-input v-model="form.DepID"/>
              </el-form-item>
              <el-form-item label="职称" prop="TechIP">
                <el-select v-model="form.TechIP" placeholder="请选择职称">
                  <el-option label="教授" value="教授"/>
                  <el-option label="副教授" value="副教授"/>
                  <el-option label="讲师" value="讲师"/>
                  <el-option label="助教" value="助教"/>
                  <el-option label="学生" value="学生"/>
                </el-select>
              </el-form-item>
            </div>

            <!-- 研究领域 -->
            <div class="col-span-2">
              <h2 class="text-lg font-medium mb-4">研究领域</h2>
              <el-form-item label="研究方向" prop="research">
                <el-input v-model="form.Research" type="textarea" rows="3" placeholder="请输入研究方向"/>
              </el-form-item>
            </div>
          </div>

        </el-form>
      </div>
    </div>
    <el-button type="primary" class="a" @click="ModifyTheUser">确定修改</el-button>
  </div>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import type {FormInstance, FormRules} from 'element-plus';
import {Plus} from '@element-plus/icons-vue';
import {ElMessage} from "element-plus";
import router from '../../router/index'
import axios from '../../axios/axios'
import {defineEmits} from "vue"

//上传头像url--后端返回的头像地址
const AvatarUrl = ref('')

const imageUrl = ref('');
const formRef = ref<FormInstance>();
const form = ref({
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
  avatar: '',
});
const rules = ref<FormRules>({
  LastDegree: [{required: true, message: '请选择最高学历', trigger: 'change'}],
  Political: [{required: true, message: '请选择政治面貌', trigger: 'change'}],
  Research: [{required: true, message: '请输入研究方向', trigger: 'blur'}],
  Cour: [{required: true, message: '请输入所属学院', trigger: 'blur'}],
  DepID: [{required: true, message: '请输入部门ID', trigger: 'blur'}],
  TechIP: [{required: true, message: '请选择职称', trigger: 'change'}],
});

//上传头像
const handleUpload = async (file) => {
  const fd = new FormData();
  fd.append('avatar', file.file);
  fd.append('user_id', form.value.UserID);
  const res = await axios.post('/user/upload_avatar', fd, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  AvatarUrl.value = res.data.data
}
const handleAvatarSuccess = (res: any) => {
  imageUrl.value = AvatarUrl.value
};
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return false;
  }

  return true;
};

//传递值
const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
})
//赋值
onMounted(() => {
  form.value = {
    UserID: props.userData.UserID,
    UserName: props.userData.UserName,
    DepID: props.userData.DepID,
    Password: props.userData.Password,
    Authority: props.userData.Authority,
    Sex: props.userData.Sex,
    email: props.userData.email,
    IDCard: props.userData.IDCard,
    Political: props.userData.Political,
    Unit: props.userData.Unit,
    LastDegree: props.userData.LastDegree,
    TechIP: props.userData.TechIP,
    Cour: props.userData.Cour,
    Research: props.userData.Research,
    avatar: props.userData.avatar,
  };
})

//修改
const ModifyTheUser = () => {
  //返回数据
  const form_Data = new FormData()
  form_Data.append('user_id', form.value.UserID)//用户id
  form_Data.append('last_degree', form.value.LastDegree)//最高学历
  form_Data.append('political', form.value.Political)//政治面貌
  form_Data.append('cour', form.value.Cour)//一级学科
  form_Data.append('dep_id', form.value.DepID)//部门id
  form_Data.append('research', form.value.Research)//研究方向
  form_Data.append('unit', form.value.Unit)//所属学院
  form_Data.append('tech_ip', form.value.TechIP)//技术职称
  //发送put请求
  axios.put('/user/edit', form_Data, {
    headers: {'Content-Type': 'multipart/form-data'}
  }).then(res => {
    const data = res.data;
    if (data.success) {
      ElMessage.success(data.message);
    } else {
      ElMessage.error(data.message);
    }
    //向父组件传值
    ToParent()
  }).catch(err => {
    ElMessage.error('修改失败');
  })
}
//向父组件传值
const emit = defineEmits(['listenToChildEvent'])
const ToParent = () => {
  //多个事件
  emit('listenToChildEvent', false)

}


</script>
<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.avatar-uploader__wrapper {
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader__wrapper:hover {
  border-color: var(--el-color-primary);
}

.a {
  position: absolute;
  width: 160px;
  bottom: 0;
  height: 40px;
  right: 0;
}
</style>
