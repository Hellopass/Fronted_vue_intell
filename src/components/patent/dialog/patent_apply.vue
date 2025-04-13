<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->
<!--专利申请表格-->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- 顶部进度条和导航 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">专利申请</h1>
          <div class="flex items-center gap-4">
            <span v-if="autoSaveStatus" class="text-sm text-green-600 flex items-center">
              <el-icon class="mr-1"><Check/></el-icon>已保存
            </span>
            <el-button type="primary" class="!rounded-button" @click="showHelp = true">
              <el-icon class="mr-1">
                <QuestionFilled/>
              </el-icon>
              帮助文档
            </el-button>
          </div>
        </div>

        <el-steps :active="currentStep" finish-status="success" class="mb-6">
          <el-step title="基本信息" description="填写专利基本信息"/>
          <el-step title="技术说明" description="填写技术细节"/>
          <el-step title="文件上传" description="上传相关文件"/>
          <el-step title="确认提交" description="确认申请信息"/>
        </el-steps>
      </div>

      <!-- 主要内容区域 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div v-if="currentStep === 0">
          <h2 class="text-xl font-semibold mb-6">基本信息</h2>
          <el-form ref="basicFormRef" :model="basicForm" label-width="120px">
            <el-form-item label="专利名称" required>
              <el-input v-model="basicForm.title" placeholder="请输入专利名称"/>
            </el-form-item>
            <el-form-item label="发明人" required>
              <el-input v-model="basicForm.inventor" placeholder="请输入发明人姓名"/>
            </el-form-item>
            <el-form-item label="专利类型" required>
              <el-select v-model="basicForm.type" placeholder="请选择专利类型" class="w-full">
                <el-option label="发明专利" value="invention"/>
                <el-option label="实用新型" value="utility"/>
                <el-option label="外观设计" value="design"/>
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="currentStep === 1">
          <h2 class="text-xl font-semibold mb-6">技术说明</h2>
          <el-form ref="techFormRef" :model="techForm" label-width="120px">
            <el-form-item label="技术领域" required>
              <el-input type="textarea" v-model="techForm.field" rows="3" placeholder="请描述专利所属技术领域"/>
            </el-form-item>
            <el-form-item label="技术方案" required>
              <el-input type="textarea" v-model="techForm.solution" rows="6" placeholder="请详细描述技术方案"/>
            </el-form-item>
          </el-form>
        </div>

        <div v-if="currentStep === 2">
          <h2 class="text-xl font-semibold mb-6">文件上传</h2>
          <el-upload
              class="upload-demo"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload">
              <Upload/>
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>

          <div class="mt-6">
            <h3 class="font-medium mb-4">已上传文件</h3>
            <el-table :data="uploadedFiles" style="width: 100%">
              <el-table-column prop="name" label="文件名称"/>
              <el-table-column prop="size" label="大小"/>
              <el-table-column prop="status" label="状态"/>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="danger" @click="removeFile(scope.$index)" class="!rounded-button">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <div v-if="currentStep === 3">
          <h2 class="text-xl font-semibold mb-6">确认信息</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <h3 class="font-medium mb-2">基本信息</h3>
                <p>专利名称：{{ basicForm.title }}</p>
                <p>发明人：{{ basicForm.inventor }}</p>
                <p>专利类型：{{
                    basicForm.type === 'invention' ? '发明专利' : basicForm.type === 'utility' ? '实用新型' : '外观设计'
                  }}</p>
              </div>
              <div>
                <h3 class="font-medium mb-2">上传文件</h3>
                <ul>
                  <li v-for="(file, index) in uploadedFiles" :key="index">
                    {{ file.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="flex justify-between mt-8">
          <el-button
              v-if="currentStep > 0"
              @click="prevStep"
              class="!rounded-button"
          >上一步
          </el-button>
          <div class="flex gap-4">
            <el-button
                type="primary"
                @click="nextStep"
                class="!rounded-button"
                v-if="currentStep < 3"
            >下一步
            </el-button>
            <el-button
                type="success"
                @click="submitApplication"
                class="!rounded-button"
                v-if="currentStep === 3"
            >提交申请
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助文档对话框 -->
    <el-dialog
        v-model="showHelp"
        title="帮助文档"
        width="50%"
    >
      <div class="help-content">
        <h3 class="font-medium mb-4">专利申请流程说明</h3>
        <ol class="list-decimal list-inside space-y-2">
          <li>填写基本信息：包括专利名称、发明人信息等</li>
          <li>技术说明：详细描述专利的技术方案和应用领域</li>
          <li>上传文件：上传相关证明文件和技术图纸</li>
          <li>确认提交：核对所有信息后提交申请</li>
        </ol>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {ElMessage} from 'element-plus';
import {Check, Upload, QuestionFilled} from '@element-plus/icons-vue';

const currentStep = ref(0);
const showHelp = ref(false);
const autoSaveStatus = ref(true);

const basicForm = ref({
  title: '',
  inventor: '',
  type: ''
});

const techForm = ref({
  field: '',
  solution: ''
});

const uploadedFiles = ref([
  {
    name: '专利说明书.pdf',
    size: '2.5MB',
    status: '已上传'
  },
  {
    name: '技术图纸.dwg',
    size: '1.8MB',
    status: '已上传'
  }
]);

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
    autoSave();
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const handleFileChange = (file: any) => {
  uploadedFiles.value.push({
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
    status: '已上传'
  });
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const autoSave = () => {
  autoSaveStatus.value = false;
  setTimeout(() => {
    autoSaveStatus.value = true;
  }, 1000);
};

const submitApplication = () => {
  ElMessage.success('申请已提交成功！');
};
</script>

<style scoped>
.el-steps {
  margin-bottom: 2rem;
}

.help-content {
  line-height: 1.6;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.el-icon--upload) {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 1rem;
}

:deep(.el-upload__text) {
  color: #606266;
}

:deep(.el-upload__text em) {
  color: #409EFF;
  font-style: normal;
}
</style>

