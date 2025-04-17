<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-[500px] w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
      <div>
        <h2 class="text-center text-3xl font-bold text-gray-900">注册账号</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              姓名 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <el-input
                  v-model="form.name"
                  :class="{ 'error-input': errors.name }"
                  placeholder="请输入姓名"
              />
              <div v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              邮箱 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <el-input
                  v-model="form.email"
                  :class="{ 'error-input': errors.email }"
                  placeholder="请输入邮箱"
              />
              <div v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              验证码 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 flex space-x-4">
              <el-input
                  v-model="form.verificationCode"
                  :class="{ 'error-input': errors.verificationCode }"
                  placeholder="请输入验证码"
              />
              <el-button
                  type="primary"
                  :disabled="countdown > 0"
                  @click="sendVerificationCode"
                  class="!rounded-button whitespace-nowrap"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
              </el-button>
            </div>
            <div v-if="errors.verificationCode" class="mt-1 text-sm text-red-500">
              {{ errors.verificationCode }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              密码 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 relative">
              <el-input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  :class="{ 'error-input': errors.password }"
                  placeholder="请输入密码"
              >
                <template #suffix>
                  <el-icon class="cursor-pointer" @click="showPassword = !showPassword">
                    <View v-if="showPassword"/>
                    <Hide v-else/>
                  </el-icon>
                </template>
              </el-input>
              <div v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              确认密码 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <el-input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :class="{ 'error-input': errors.confirmPassword }"
                  placeholder="请再次输入密码"
              >
                <template #suffix>
                  <el-icon class="cursor-pointer" @click="showConfirmPassword = !showConfirmPassword">
                    <View v-if="showConfirmPassword"/>
                    <Hide v-else/>
                  </el-icon>
                </template>
              </el-input>
              <div v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">
                {{ errors.confirmPassword }}
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              身份证号 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <el-input
                  v-model="form.idCard"
                  :class="{ 'error-input': errors.idCard }"
                  placeholder="请输入身份证号"
              />
              <div v-if="errors.idCard" class="mt-1 text-sm text-red-500">{{ errors.idCard }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              性别 <span class="text-red-500">*</span>
            </label>
            <div class="mt-2">
              <el-radio-group v-model="form.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
              <div v-if="errors.gender" class="mt-1 text-sm text-red-500">{{ errors.gender }}</div>
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意
          </el-checkbox>
          <a href="#" class="ml-1 text-blue-600 hover:text-blue-800">《隐私政策》</a>
        </div>
        <div>
          <el-button
              type="primary"
              :loading="loading"
              class="w-full !rounded-button whitespace-nowrap"
              :disabled="!isFormValid || loading"
              @click="handleSubmit"
          >
            注册
          </el-button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, computed} from 'vue';
import {View, Hide} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import axios from "../axios/axios";
import router from "../router/index"

interface FormData {
  name: string;
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  idCard: string;
  gender: string;
  agreement: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const form = ref<FormData>({
  name: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: '',
  idCard: '',
  gender: '',
  agreement: false
});
const errors = ref<FormErrors>({});
const loading = ref(false);
const countdown = ref(0);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
const validateIdCard = (idCard: string) => {
  const re = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return re.test(idCard);
};
const validate = () => {
  const newErrors: FormErrors = {};
  if (!form.value.name) {
    newErrors.name = '请输入姓名';
  }
  if (!form.value.email) {
    newErrors.email = '请输入邮箱';
  } else if (!validateEmail(form.value.email)) {
    newErrors.email = '请输入有效的邮箱地址';
  }
  if (!form.value.verificationCode) {
    newErrors.verificationCode = '请输入验证码';
  }
  if (!form.value.password) {
    newErrors.password = '请输入密码';
  } else if (form.value.password.length < 6) {
    newErrors.password = '密码长度不能少于6位';
  }
  if (!form.value.confirmPassword) {
    newErrors.confirmPassword = '请确认密码';
  } else if (form.value.confirmPassword !== form.value.password) {
    newErrors.confirmPassword = '两次输入的密码不一致';
  }
  if (!form.value.idCard) {
    newErrors.idCard = '请输入身份证号';
  } else if (!validateIdCard(form.value.idCard)) {
    newErrors.idCard = '请输入有效的身份证号';
  }
  if (!form.value.gender) {
    newErrors.gender = '请选择性别';
  }
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};
const isFormValid = computed(() => {
  return form.value.name &&
      form.value.email &&
      form.value.verificationCode &&
      form.value.password &&
      form.value.confirmPassword &&
      form.value.idCard &&
      form.value.gender &&
      form.value.agreement;
});
const sendVerificationCode = async () => {
  if (!form.value.email) {
    ElMessage.error('请先输入邮箱地址');
    return;
  }
  if (!validateEmail(form.value.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
    }
  }, 1000);
  //发送axios请求验证码
  const f = new FormData()
  f.append('email', form.value.email)
  await axios.post('/email', f, {
    headers: {'Content-Type': 'multipart/form-data'}
  }).then(response => {
    if (response.data.success) {
      ElMessage.success('验证码已发送');
    } else {
      ElMessage.error('验证码发送失败');
    }
  }).catch(error => {
    ElMessage.error('验证码发送失败')
  })
};
const handleSubmit = async () => {
  if (!validate()) {
    return;
  }
  if (!form.value.agreement) {
    ElMessage.error('请阅读并同意隐私政策');
    return;
  }
  loading.value = true;
  try {
//     await new Promise(resolve => setTimeout(resolve, 1500));
//     ElMessage.success('注册成功');
// // 这里可以添加注册成功后的逻辑
    //发送axios请求验证码
    const f = new FormData()
    f.append('email', form.value.email)
    f.append('name', form.value.name)
    f.append('verificationCode',form.value.verificationCode)
    f.append('password',form.value.password)
    f.append('idCard',form.value.idCard)
    f.append('gender',form.value.gender)
    await axios.post('/user/add', f, {
      headers: {'Content-Type': 'multipart/form-data'}
    }).then(response => {
      if(response.data.success){
        // //设置token
        // localStorage.setItem('token', response.data.token)
        ElMessage.success('注册成功');
        // 这里可以添加注册成功后的逻辑
        //跳转到登陆界面--延迟两秒
        router.push({name:"login"}).then(()=>{
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
      }else{
        ElMessage.error('注册失败，请重试');
      }

    }).catch(error => {
      console.log(error)
      ElMessage.error('注册失败，请重试');
    })
  } catch (error) {
    console.log(error)
    ElMessage.error('注册失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.error-input {
  border-color: #ff4949;
}

:deep(.el-input__wrapper) {
  border-radius: 0.375rem;
}

:deep(.el-radio) {
  margin-right: 1.5rem;
}

:deep(.el-button) {
  height: 2.5rem;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}
</style>
