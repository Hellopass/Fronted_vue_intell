<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2 class="login-title">欢迎登录</h2>
        <p class="login-subtitle">请使用您的账号密码登录系统</p>
      </div>
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
      >
        <el-form-item prop="username">
          <el-input
              v-model="form.username"
              placeholder="请输入注册邮箱"
              :prefix-icon="User"
              class="login-input !rounded-button"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              class="login-input !rounded-button"
              show-password
          />
        </el-form-item>
        <div class="login-options">
          <el-checkbox v-model="form.remember" class="remember-checkbox">
            记住密码
          </el-checkbox>
          <el-link type="primary" :underline="false">
            <router-link to="/forget">忘记密码？</router-link>
          </el-link>
        </div>
        <el-button
            type="primary"
            class="login-button !rounded-button whitespace-nowrap"
            :loading="loading"
            @click="handleLogin"
        >
          登录
        </el-button>
        <div class="divider">
          <span class="divider-text">其他登录方式</span>
        </div>
        <div class="social-login">
          <el-button
              class="social-button !rounded-button whitespace-nowrap"
              :icon="Message"
              @click="handleSocialLogin('sms')"
          >
            短信登录
          </el-button>
          <el-button
              class="social-button !rounded-button whitespace-nowrap"
              :icon="Position"
              @click="handleSocialLogin('qrcode')"
          >
            扫码登录
          </el-button>
        </div>
      </el-form>
      <div class="register-tip">
        还没有账号？
        <el-link type="primary" :underline="false">
          <router-link to="/register">立即注册</router-link>
        </el-link>
        <div class="agreement">
          登录即表示同意
          <el-link type="primary" :underline="false">用户协议</el-link>
          和
          <el-link type="primary" :underline="false">隐私政策</el-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, reactive, onMounted} from 'vue';
import type {FormInstance, FormRules} from 'element-plus';
import {User, Lock, Message, Position} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import axios from "../axios/axios";
import router from "../router/index";

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({
  username: '',
  password: '',
  remember: false
});
const rules: FormRules = {
  username: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'}
  ]
};


const handleLogin = async () => {
  if (!formRef.value) return;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(form.username)) {
    ElMessage.error('无效的电子邮件地址');
    return;
  }

  loading.value = true;
  const formData = new FormData();
  formData.append('username', form.username);
  formData.append('password', form.password);

  try {
    const response = await axios.post('/login', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    });
    if (response.data.success) {
      // 设置token
      localStorage.setItem('token', response.data.data.token);
      ElMessage.success(response.data.message);
      router.push("/home").then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
    } else {
      ElMessage.error(response.data.message);
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

const handleSocialLogin = (type: string) => {
  ElMessage.info(`暂未开放${type === 'sms' ? '短信' : '扫码'}登录`);
};
//记住密码
onMounted(() => {
  const savedUsername = localStorage.getItem('username');
  const savedPassword = localStorage.getItem('password');
  if (savedUsername && savedPassword) {
    form.username = savedUsername;
    form.password = savedPassword;
    form.remember = true;
  }
});
</script>
<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  background-color: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #909399;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-input {
  height: 44px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-checkbox {
  color: #606266;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.divider {
  position: relative;
  margin: 24px 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #dcdfe6;
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background-color: #fff;
  color: #909399;
  font-size: 14px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.register-tip {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.agreement {
  margin-top: 8px;
}

.el-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6;
  transition: all 0.3s ease;
}

.el-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.el-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc;
}

.el-input :deep(.el-input__inner) {
  font-size: 14px;
  color: #606266;
}

.el-input :deep(.el-input__prefix) {
  color: #909399;
}

.el-button {
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-button:not(.el-button--primary):hover {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
}

.el-checkbox {
  transition: all 0.3s ease;
}

.el-link {
  transition: all 0.3s ease;
}

.el-link:hover {
  opacity: 0.8;
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}
</style>
