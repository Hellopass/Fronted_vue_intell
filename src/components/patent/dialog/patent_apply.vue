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
            <!--            <span v-if="autoSaveStatus" class="text-sm text-green-600 flex items-center">-->
            <!--              <el-icon class="mr-1"><Check/></el-icon>已保存-->
            <!--            </span>-->
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
            <el-form-item label="专利类型" required>
              <el-select v-model="basicForm.type" placeholder="请选择专利类型" class="w-full">
                <el-option label="发明专利" value="0"/>
                <el-option label="实用新型" value="1"/>
                <el-option label="外观设计" value="2"/>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="currentStep === 1">
          <h2 class="text-xl font-semibold mb-6">文件上传</h2>
          <el-upload
              ref="uploadRef"
              class="upload-demo"
              action="#"
              drag
              :auto-upload="false"
              :on-success="handleFileSuccess"
              :http-request:="handleFileHttpReq"
              :on-change="handleFileChange"
              multiple
          >
            <el-icon class="el-icon--upload">
              <Upload/>
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </div>

        <div v-if="currentStep === 2">
          <h2 class="text-xl font-semibold mb-6">确认信息</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <h3 class="font-medium mb-2">基本信息</h3>
                <p>专利名称：{{ basicForm.title }}</p>
                <p>专利类型：{{
                    basicForm.type === '0' ? '发明专利' : basicForm.type === '1' ? '实用新型' : basicForm.type === '2' ? '外观设计' : ''
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
                v-if="currentStep < 2"
            >下一步
            </el-button>
            <el-button
                type="success"
                @click="submitApplication"
                class="!rounded-button"
                v-if="currentStep === 2"
            >提交申请
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助文档对话框 -->
    <el-dialog
        v-model="showHelp"
        title="专利申请流程和材料表格"
        width="50%"
    >
      <div class="help-content">
        <ol class="list-decimal list-inside space-y-2">
          <li>
            申请发明专利需要提交《发明专利请求书》、《说明书》、《权利要求书》、《说明书摘要》，根据您的技术方案必要时还需要提交《说明书附图》
          </li>
          <li>
            申请文件必须使用国家知识产权局统一制定的标准表格。这些表格可以向各地的专利代办处索取或直接从国家知识产权局政府网站下载。下载表格链接为：https://www.cnipa.gov.cn/col/col192/index.html，表格背面有说明和注意事项。
          </li>
        </ol>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {ElMessage} from 'element-plus';
import {Check, Upload, QuestionFilled} from '@element-plus/icons-vue';
import type {UploadInstance} from 'element-plus'
import axios from "axios";
import router from "../../../router";
import {CreatePatent, Patent, UploadFile} from '../../../axios/patent'


const currentStep = ref(0);
const showHelp = ref(false);
const autoSaveStatus = ref(true);

const basicForm = ref({
  title: '',
  type: ''
});

const techForm = ref({
  field: '',
  solution: ''
});

const uploadedFiles = ref([
  // {
  //   name: '专利说明书.pdf',
  //   size: '2.5MB',
  //   status: '待上传'
  // },
  // {
  //   name: '技术图纸.dwg',
  //   size: '1.8MB',
  //   status: '待上传'
  // }
]);

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
    // autoSave();
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
    file: file.raw,
    size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
  });
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

// const autoSave = () => {
//   autoSaveStatus.value = false;
//   setTimeout(() => {
//     autoSaveStatus.value = true;
//   }, 1000);
// };

const submitApplication = () => {
  //先提交信息拿到apply_no
  const p = new Patent(basicForm.value.title, basicForm.value.type, 0, 2)
  const req = CreatePatent(p)
  req.then((res) => {
    //拿到申请号
    const apply_no = res.data.data.apply_no
    if (apply_no === '') {
      ElMessage.success('资料不全，请补全之后在提交');
    } else {
      //上传文件
      const uploadFile = UploadFile(uploadedFiles, apply_no);
      uploadFile.then((res) => {
        if (res.data.success) {
          ElMessage.success('申请已提交成功！');
          //清空表单
          basicForm.value = {
            title: '',
            type: '',
          }
          uploadedFiles.value = []
          ToParent()
        } else {
          ElMessage.error('申请提交失败！请联系管理员');
        }
      })
    }
  }).catch((err) => {
    ElMessage.error('申请提交失败！请补全信息');
  })
  currentStep.value = 0
};

//向父组件传值
const emit = defineEmits(['listenPatent'])
const ToParent = () => {
  //多个事件
  emit('listenPatent', false)

}

const handleFileSuccess = () => {

}

//文件上传
const handleFileHttpReq = (file) => {
  return file
}
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

