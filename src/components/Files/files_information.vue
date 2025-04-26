<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->
<template>
  <div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-6 min-h-[1024px]">
  <div class="flex h-full gap-6">
  <!-- 左侧导航 -->
  <div class="w-64 flex flex-col gap-4">
  <!-- 文件夹树 -->
  <div class="flex-1 bg-white rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-medium mb-4">文件夹</h3>
  <el-tree :data="folderTree" :props="defaultProps" @node-click="handleNodeClick">
  <template #default="{ node }">
  <div class="flex items-center">
  <el-icon class="mr-2">
  <Folder v-if="node.childNodes.length" />
  <Document v-else />
  </el-icon>
  <span>{{ node.label }}</span>
  </div>
  </template>
  </el-tree>
  </div>
  </div>
  <!-- 右侧内容区 -->
  <div class="flex-1">
  <!-- 搜索和工具栏 -->
  <div class="bg-white rounded-lg p-4 shadow-sm mb-6">
  <div class="flex items-center gap-4">
  <el-button type="primary" :class="{'!rounded-button': true}" @click="showNewFileDialog = true">
  <el-icon class="mr-1"><Plus /></el-icon>
  新建文件
  </el-button>
  <el-button-group>
  <el-button :class="{'!rounded-button': true}" @click="viewMode = 'list'" :type="viewMode === 'list' ? 'primary' : 'default'">
  <el-icon><List /></el-icon>
  </el-button>
  <el-button :class="{'!rounded-button': true}" @click="viewMode = 'grid'" :type="viewMode === 'grid' ? 'primary' : 'default'">
  <el-icon><Grid /></el-icon>
  </el-button>
  </el-button-group>
  <el-select v-model="sortBy" placeholder="排序方式" class="w-32 !rounded-button">
  <el-option v-for="item in sortOptions" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
  </div>
  </div>
  <!-- 文件列表 -->
  <div class="bg-white rounded-lg p-4 shadow-sm">
  <template v-if="viewMode === 'list'">
  <el-table :data="filteredFiles" style="width: 100%">
  <el-table-column label="文件名" min-width="300">
  <template #default="scope">
  <div class="flex items-center">
  <el-icon class="mr-2"><Document /></el-icon>
  <span>{{ scope.row.name }}</span>
  </div>
  </template>
  </el-table-column>
  <el-table-column prop="size" label="大小" width="120" />
  <el-table-column prop="modifiedDate" label="修改日期" width="180" />
  <el-table-column label="操作" width="180">
  <template #default="scope">
  <el-button text @click="previewFile(scope.row)">
  <el-icon><View /></el-icon>
  </el-button>
  <el-button text type="primary" @click="downloadFile(scope.row)">
  <el-icon><Download /></el-icon>
  </el-button>
  <el-button text type="danger" @click="deleteFile(scope.row)">
  <el-icon><Delete /></el-icon>
  </el-button>
  </template>
  </el-table-column>
  </el-table>
  </template>
  <template v-else>
  <div class="grid grid-cols-4 gap-4">
  <div v-for="file in filteredFiles" :key="file.id"
  class="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
  <div class="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
  <img :src="file.thumbnail" class="w-full h-full object-cover" />
  </div>
  <div class="text-sm truncate">{{ file.name }}</div>
  <div class="text-xs text-gray-500">{{ file.size }}</div>
  </div>
  </div>
  </template>
  </div>
  </div>
  </div>
  </div>
  <!-- 预览弹窗 -->
  <el-dialog v-model="previewVisible" title="文件预览" width="60%">
  <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
  <img v-if="currentPreview" :src="currentPreview.thumbnail" class="w-full h-full object-contain" />
  </div>
  <template #footer>
  <span class="dialog-footer">
  <el-button :class="{'!rounded-button': true}" @click="previewVisible = false">关闭</el-button>
  <el-button :class="{'!rounded-button': true}" type="primary" @click="downloadFile(currentPreview)">
  下载
  </el-button>
  </span>
  </template>
  </el-dialog>
  
  <!-- 新建文件弹窗 -->
  <el-dialog v-model="showNewFileDialog" title="新建文件" width="30%">
  <div class="mb-4">
  <el-input v-model="newFileName" placeholder="请输入文件名" class="!rounded-button" />
  </div>
  <template #footer>
  <span class="dialog-footer">
  <el-button :class="{'!rounded-button': true}" @click="showNewFileDialog = false">取消</el-button>
  <el-button :class="{'!rounded-button': true}" type="primary" @click="createNewFile">
  确定
  </el-button>
  </span>
  </template>
  </el-dialog>
  </div>
  </template>
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { Document, List, Grid, View, Download, Plus, Delete, Folder } from '@element-plus/icons-vue';
  const searchQuery = ref('');
  const viewMode = ref('list');
  const sortBy = ref('name');
  const previewVisible = ref(false);
  const showNewFileDialog = ref(false);
  const newFileName = ref('');
  const currentPreview = ref(null);
  const sortOptions = [
  { label: '名称', value: 'name' },
  { label: '大小', value: 'size' },
  { label: '修改日期', value: 'date' }
  ];
  const folderTree = [
  {
  label: '我的文档',
  children: [
  { label: '工作文件' },
  { label: '个人文件' },
  {
  label: '项目文档',
  children: [
  { label: '设计文稿' },
  { label: '开发文档' }
  ]
  }
  ]
  },
  {
  label: '图片资源',
  children: [
  { label: '照片' },
  { label: '设计素材' }
  ]
  }
  ];
  const files = [
  {
  id: 1,
  name: '项目需求说明书.docx',
  size: '2.5MB',
  modifiedDate: '2024-01-15 14:30',
  thumbnail: 'https://ai-public.mastergo.com/ai/img_res/766597554936bb17f81f645db952135b.jpg'
  },
  {
  id: 2,
  name: '产品设计方案.pdf',
  size: '5.8MB',
  modifiedDate: '2024-01-14 09:15',
  thumbnail: 'https://ai-public.mastergo.com/ai/img_res/1601784dcf43b04fa353f7338eaa0464.jpg'
  },
  {
  id: 3,
  name: '会议纪要.xlsx',
  size: '1.2MB',
  modifiedDate: '2024-01-13 16:45',
  thumbnail: 'https://ai-public.mastergo.com/ai/img_res/724358a9e19c9bd83ff83b5253ec3135.jpg'
  },
  {
  id: 4,
  name: '营销策划案.pptx',
  size: '8.7MB',
  modifiedDate: '2024-01-12 11:20',
  thumbnail: 'https://ai-public.mastergo.com/ai/img_res/e521a3020f81e292484946c93ab65672.jpg'
  }
  ];
  const defaultProps = {
  children: 'children',
  label: 'label'
  };
  const filteredFiles = ref(files);
  const handleNodeClick = (data: any) => {
  console.log(data);
  };
  const previewFile = (file: any) => {
  currentPreview.value = file;
  previewVisible.value = true;
  };
  const downloadFile = (file: any) => {
  console.log('Downloading:', file);
  };
  
  const deleteFile = (file: any) => {
  ElMessageBox.confirm('确定要删除该文件吗？', '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning'
  }).then(() => {
  const index = files.findIndex(f => f.id === file.id);
  if (index > -1) {
  files.splice(index, 1);
  ElMessage.success('删除成功');
  }
  }).catch(() => {});
  };
  
  const createNewFile = () => {
  if (!newFileName.value) {
  ElMessage.warning('请输入文件名');
  return;
  }
  const newFile = {
  id: files.length + 1,
  name: newFileName.value,
  size: '0KB',
  modifiedDate: new Date().toLocaleString(),
  thumbnail: 'https://mastergo.com/ai/api/search-image?query=modern minimalist document icon with blue background, professional business style, clean and simple design&width=400&height=400&orientation=squarish'
  };
  files.push(newFile);
  showNewFileDialog.value = false;
  newFileName.value = '';
  ElMessage.success('创建成功');
  };
  </script>
  <style scoped>
  .el-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  }
  .el-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
  }
  </style>
  