<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <div class="w-[480px] bg-white rounded-xl shadow-lg p-10">
      <!-- 标题区域 -->
      <h1 class="text-2xl font-medium text-center mb-3">忘记密码</h1>
      <p class="text-gray-600 text-center mb-8">请输入邮箱获取验证码重置密码</p>
      <!-- 表单区域 -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="relative">
          <el-input
              v-model="email"
              :class="{ 'is-invalid': emailError }"
              placeholder="请输入邮箱地址"
              size="large"
              :disabled="isVerified"
          >
            <template #prefix>
              <el-icon class="text-gray-400">
                <Message />
              </el-icon>
            </template>
          </el-input>
          <p v-if="emailError" class="text-red-500 text-sm mt-1">请输入有效的邮箱地址</p>
        </div>
        <div class="relative flex gap-4">
          <el-input
              v-model="verificationCode"
              :class="{ 'is-invalid': codeError }"
              placeholder="请输入验证码"
              size="large"
              :disabled="!isCodeSent || isVerified"
          >
            <template #prefix>
              <el-icon class="text-gray-400">
                <Lock />
              </el-icon>
            </template>
          </el-input>
          <el-button
              type="primary"
              :loading="sendingCode"
              class="whitespace-nowrap !rounded-button"
              @click="handleSendCode"
              :disabled="!email || isCodeSent"
          >
            {{ isCodeSent ? `重新发送(${countdown}s)` : '获取验证码' }}
          </el-button>
        </div>
        <p v-if="codeError" class="text-red-500 text-sm mt-1">请输入正确的验证码</p>
        <div v-if="isVerified">
          <div class="relative mb-4">
            <el-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :class="{ 'is-invalid': passwordError }"
                placeholder="请输入新密码"
                size="large"
            >
              <template #prefix>
                <el-icon class="text-gray-400">
                  <Lock />
                </el-icon>
              </template>
              <template #suffix>
                <el-icon class="cursor-pointer text-gray-400" @click="showPassword = !showPassword">
                  <View v-if="showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
            <p v-if="passwordError" class="text-red-500 text-sm mt-1">密码长度至少6位</p>
            <div class="mt-2 text-sm text-gray-500">
              <p>密码要求：</p>
              <ul class="list-disc list-inside">
                <li>长度至少6位</li>
                <li>包含字母和数字</li>
                <li>不能包含特殊字符</li>
              </ul>
            </div>
          </div>
          <div class="relative">
            <el-input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :class="{ 'is-invalid': confirmPasswordError }"
                placeholder="请再次输入新密码"
                size="large"
            >
              <template #prefix>
                <el-icon class="text-gray-400">
                  <Lock />
                </el-icon>
              </template>
              <template #suffix>
                <el-icon class="cursor-pointer text-gray-400" @click="showConfirmPassword = !showConfirmPassword">
                  <View v-if="showConfirmPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
            <p v-if="confirmPasswordError" class="text-red-500 text-sm mt-1">两次输入的密码不一致</p>
          </div>
        </div>
        <!-- 提交按钮 -->
        <el-button
            type="primary"
            :loading="loading"
            class="w-full !rounded-button h-12 text-base"
            @click="handleSubmit"
        >
          {{ isVerified ? '确认修改' : '验证' }}
        </el-button>
        <!-- 成功提示 -->
        <div v-if="isSubmitted" class="bg-green-50 p-4 rounded-lg">
          <div class="flex items-center">
            <el-icon class="text-green-500 mr-2">
              <CircleCheckFilled />
            </el-icon>
            <span class="text-green-700">密码修改成功</span>
          </div>
        </div>
      </form>
      <!-- 底部链接 -->
      <div class="mt-8 text-center space-y-4">
        <a href="/" class="text-gray-600 hover:text-gray-800 text-sm">返回登录</a>
        <div class="flex justify-center space-x-6">
          <a href="#" class="text-gray-600 hover:text-gray-800 text-sm">常见问题</a>
          <a href="#" class="text-gray-600 hover:text-gray-800 text-sm">联系客服</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Message, Lock, CircleCheckFilled, View, Hide } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
const email = ref('');
const verificationCode = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const sendingCode = ref(false);
const isSubmitted = ref(false);
const isCodeSent = ref(false);
const isVerified = ref(false);
const countdown = ref(60);
const emailError = ref(false);
const codeError = ref(false);
const passwordError = ref(false);
const confirmPasswordError = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
      isCodeSent.value = false;
      countdown.value = 60;
    }
  }, 1000);
};
const handleSendCode = async () => {
  if (!validateEmail(email.value)) {
    emailError.value = true;
    return;
  }
  emailError.value = false;
  sendingCode.value = true;
  try {
// 模拟发送验证码
    await new Promise(resolve => setTimeout(resolve, 1000));
    isCodeSent.value = true;
    startCountdown();
    ElMessage.success('验证码已发送');
  } catch (error) {
    ElMessage.error('发送失败，请重试');
  } finally {
    sendingCode.value = false;
  }
};
const validatePassword = (): boolean => {
  const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password.value);
  passwordError.value = password.value.length < 6 || !hasLetterAndNumber;
  confirmPasswordError.value = password.value !== confirmPassword.value;
  return !passwordError.value && !confirmPasswordError.value;
};
const handleSubmit = async () => {
  if (!isVerified.value) {
    if (!verificationCode.value) {
      codeError.value = true;
      return;
    }
    loading.value = true;
    try {
// 模拟验证码验证
      await new Promise(resolve => setTimeout(resolve, 1000));
      isVerified.value = true;
      codeError.value = false;
    } catch (error) {
      ElMessage.error('验证失败，请重试');
    } finally {
      loading.value = false;
    }
    return;
  }
  if (!validatePassword()) {
    return;
  }
  loading.value = true;
  try {
// 模拟修改密码
    await new Promise(resolve => setTimeout(resolve, 1500));
    isSubmitted.value = true;
    ElMessage.success('密码修改成功');
  } catch (error) {
    ElMessage.error('修改失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.is-invalid {
  border-color: #ff4949;
}
:deep(.el-input__wrapper) {
  padding: 4px 11px;
  background-color: #fff;
}
:deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
}
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}
:deep(.el-button.is-loading) {
  opacity: 0.8;
}
</style>
