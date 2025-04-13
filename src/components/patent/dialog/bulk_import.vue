<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <h1 class="text-2xl font-medium mb-8 text-gray-800">文件上传</h1>

      <!-- 上传区域 -->
      <div
          class="upload-zone relative border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8"
          :class="{ 'border-blue-500 bg-blue-50': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @dragover.prevent
          @drop.prevent="handleDrop"
      >
        <div class="flex flex-col items-center justify-center">
          <el-icon class="text-gray-400 mb-4" :size="48">
            <Upload/>
          </el-icon>
          <p class="text-gray-600 mb-2">点击或拖拽文件到这里上传</p>
          <p class="text-gray-400 text-sm">支持格式：PDF、Word、Excel、ZIP等</p>
        </div>
        <input
            ref="fileInput"
            type="file"
            multiple
            class="hidden"
            @change="handleFileSelect"
        />
      </div>

      <!-- 文件列表 -->
      <div v-if="fileList.length > 0" class="mb-8">
        <div class="bg-gray-50 px-4 py-3 rounded-t-lg flex items-center text-gray-600 text-sm font-medium">
          <span class="w-1/2">文件名称</span>
          <span class="w-1/4">文件大小</span>
          <span class="w-1/4">状态</span>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="(file, index) in fileList" :key="index" class="px-4 py-4 flex items-center">
            <div class="w-1/2 flex items-center">
              <el-icon class="mr-2 text-gray-400">
                <Document/>
              </el-icon>
              <span class="text-gray-700 truncate">{{ file.name }}</span>
            </div>
            <div class="w-1/4 text-gray-600 text-sm">{{ formatFileSize(file.size) }}</div>
            <div class="w-1/4 flex items-center">
              <template v-if="file.status === 'uploading'">
                <el-progress
                    :percentage="file.progress"
                    :stroke-width="4"
                    class="flex-1 mr-4"
                />
              </template>
              <template v-else-if="file.status === 'success'">
                <span class="text-green-500 flex items-center">
                  <el-icon class="mr-1"><CircleCheck/></el-icon>
                  已完成
                </span>
              </template>
              <template v-else-if="file.status === 'error'">
                <span class="text-red-500 flex items-center">
                  <el-icon class="mr-1"><CircleClose/></el-icon>
                  上传失败
                </span>
              </template>
              <el-button
                  type="danger"
                  :icon="Delete"
                  class="ml-2 !rounded-button"
                  @click="removeFile(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-between">
        <div class="text-gray-500 text-sm">
          <p>单个文件大小限制：100MB</p>
          <p>可同时上传 10 个文件</p>
        </div>
        <div class="space-x-4">
          <el-button
              type="primary"
              class="!rounded-button whitespace-nowrap"
              @click="triggerFileInput"
          >
            选择文件
          </el-button>
          <el-button
              type="success"
              class="!rounded-button whitespace-nowrap"
              :disabled="!hasNewFiles"
              @click="startUpload"
          >
            开始上传
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue';
import {ElMessage} from 'element-plus';
import {Upload, Document, CircleCheck, CircleClose, Delete} from '@element-plus/icons-vue';
import axios from "axios";

interface FileItem {
  file: File;
  name: string;
  size: number;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  progress: number;
}

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const fileList = ref<FileItem[]>([]);

const hasNewFiles = computed(() => {
  return fileList.value.some(file => file.status === 'waiting');
});

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    addFiles(Array.from(input.files));
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const addFiles = (files: File[]) => {
  if (fileList.value.length + files.length > 10) {
    ElMessage.warning('最多只能上传10个文件');
    return;
  }

  files.forEach(file => {
    if (file.size > 100 * 1024 * 1024) {
      ElMessage.warning(`文件 ${file.name} 超过100MB限制`);
      return;
    }

    fileList.value.push({
      file,
      name: file.name,
      size: file.size,
      status: 'waiting',
      progress: 0
    });
  });
};

const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const startUpload = () => {
  fileList.value.forEach(item => {
    if (item.status === 'waiting') {
      simulateUpload(item);
    }
  });
};

const simulateUpload = (item: FileItem) => {
  item.status = 'uploading';
  const formData = new FormData();
  formData.append('file', item.file);
  ElMessage.success(`正在访问接口`);
  axios.post('http://localhost:8080/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      item.progress = progress;
    }
  })
      .then(response => {
        item.status = 'success';
        ElMessage.success(`文件 ${item.name} 上传成功`);
      })
      .catch(error => {
        item.status = 'error';
        ElMessage.error(`文件 ${item.name} 上传失败`);
      });
};
</script>

<style scoped>
.upload-zone {
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}
</style>

