<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- 标题区域 -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 class="text-2xl font-bold text-white">专利详情</h1>
      </div>

      <!-- 基础信息卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="space-y-6">

          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ prop.name }}</h2>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500 mb-1">申请号</p>
                <p class="font-mono text-gray-900">{{ prop.applicationNo }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">申请日期</p>
                <p class="text-gray-900">{{ prop.date }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">申请人</p>
                <p class="text-gray-900">{{ prop.applicant }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">专利类型</p>
                <el-tag type="success" class="!rounded-button">{{ TypeMap[prop.status] }}</el-tag>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">发明人</h3>
            <div class="flex flex-wrap gap-3">
              <!--              <el-tag v-for="inventor in inventors" :key="inventor" class="!rounded-button">-->
              <!--                {{ inventor }}-->
              <!--              </el-tag>-->
              <el-tag class="!rounded-button">
                {{ inventor }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件列表卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">相关文件</h3>
          <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="handleBatchDownload">
            <el-icon class="mr-1">
              <Download/>
            </el-icon>
            批量下载
          </el-button>
        </div>

        <el-table :data="documents" style="width: 100%">
          <el-table-column label="文件名称(点击可以实现文件预览)">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-icon class="mr-2 text-blue-500" :size="20">
                  <component :is="getFileIcon(row.type)"/>
                </el-icon>
                <span class="text-blue-600 cursor-pointer hover:text-blue-800" @click="handlePreview(row)">
                  {{ row.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="文件大小" width="150"/>
          <el-table-column prop="date" label="上传日期" width="200"/>
          <el-table-column width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDownload(row)">
                <el-icon>
                  <Download/>
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="文件预览" width="60%">
      <div class="min-h-[400px] flex items-center justify-center">
        <!--        <div class="text-center">-->
        <!--          <el-icon class="mb-4 text-gray-400" :size="64">-->
        <!--            <Document/>-->
        <!--          </el-icon>-->
        <!--          <p class="text-gray-600">{{ currentFile?.name }}</p>-->
        <!--        </div>-->
        <div v-if="currentFile" class="w-full h-full">
          <div v-if="currentFile.type === 'pdf'">
            <embed :src="pdfUrl" type="application/pdf" width="100%" height="600px"/>
          </div>
          <div v-else-if="currentFile.type === 'png' || 'jpg' || 'jpeg'">
            <img :src="imageSrc" alt="Image Preview" class="max-w-full max-h-full"/>
          </div>
          <div v-else>
            <el-icon class="mb-4 text-gray-400" :size="64">
              <Document/>
            </el-icon>
            <p class="text-gray-600">{{ currentFile?.name }}</p>
          </div>
        </div>

        <!--        -------->


      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, onMounted, ref} from 'vue';
import {Document, Download, Files, Picture} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import {GetPatentFile, GetPatentFilePath} from "../../../axios/patent"

const prop = defineProps({
  applicant: {
    type: String,
    required: true
  },
  applicationNo: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    required: true
  }
})

//设置一个map
const TypeMap = {
  0: '发明专利',
  1: '实用新型',
  2: '外观设计',
}

interface DocumentItem {
  name: string;
  type: string;
  size: string;
  date: string;
  blob: Blob;
}

const inventor = ref(prop.applicant);

const documents = ref<DocumentItem[]>([]);

const previewVisible = ref(false);
const currentFile = ref<DocumentItem | null>(null);

const pdfUrl = ref('');
const imageSrc = ref('');
const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return Document;
    case 'word':
      return Files;
    case 'image':
      return Picture;
    default:
      return Document;
  }
};

const handlePreview = (file: DocumentItem) => {
  currentFile.value = file;
  if (file.type === 'pdf') {
    pdfUrl.value = URL.createObjectURL(file.blob);
  } else if (file.type === 'png' || 'jpg' || 'jpeg') {
    imageSrc.value = URL.createObjectURL(file.blob);
  }
  previewVisible.value = true;
};

const handleDownload = (file: DocumentItem) => {
  ElMessage.success(`开始下载：${file.name}`);
  const url = URL.createObjectURL(file.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleBatchDownload = () => {
  documents.value.forEach(file => {
    handleDownload(file)
  })
};

//获取文件信息
onMounted(() => {
  GetPatentFilePath(prop.applicationNo).then((res) => {
    const d = res.data
    if (d.success) {
      const files = d.data;
      //请求文件
      files.forEach(file => {
        GetPatentFile(file).then((res) => {
          const s = file.split("/")
          const filename = s[s.length - 1]
          const type = filename.split('.')[1]
          const size = (res.data.size / 1048576).toFixed(2)  //MB
          documents.value.push({
            name: filename,
            type: type,
            size: size + "MB",
            date: prop.date,
            blob: res.data,
          })
        }).catch(err => {

        })
      })
    }
  }).catch(err => {
    console.log(err);
  })
})

</script>

<style scoped>
.el-table {
  --el-table-border-color: theme('colors.gray.200');
  --el-table-header-bg-color: theme('colors.gray.50');
  --el-table-row-hover-bg-color: theme('colors.gray.50');
}
</style>

