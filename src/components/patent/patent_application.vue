<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->
<template>
  <div class="min-h-[1024px] bg-gray-50">
    <!-- 主体内容 -->
    <div class="px-6 py-6">
      <!-- 搜索区域 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex items-center space-x-4 mb-4">
          <el-input
              v-model="searchForm.keyword"
              placeholder="搜索专利名称/申请号/申请人"
              class="w-64"
          >
            <template #prefix>
              <el-icon>
                <Search/>
              </el-icon>
            </template>
          </el-input>
          <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="w-200"
          />
          <el-select v-model="searchForm.status" placeholder="申请状态" class="w-32">
            <el-option label="全部" value=""/>
            <el-option label="待提交" value="pending"/>
            <el-option label="审核中" value="reviewing"/>
            <el-option label="已授权" value="approved"/>
            <el-option label="已驳回" value="rejected"/>
          </el-select>
          <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="handleSearch">
            搜索
          </el-button>
          <el-button class="!rounded-button whitespace-nowrap" @click="resetSearch">重置</el-button>
        </div>
      </div>
      <!-- 操作按钮区 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="handleCreate">
              <el-icon class="mr-1">
                <Plus/>
              </el-icon>
              新建申请
            </el-button>
            <el-dialog v-model="dialogVisible" title="新建申请" width="50%" @close="handleClose">
              <patent-apply></patent-apply>
              <template #footer>
                  <span class="dialog-footer">
                 <el-button @click="dialogVisible = false">取 消</el-button>
                 <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                 </span>
              </template>
            </el-dialog>
            <!--            ----------------------------------->

            <el-button class="!rounded-button whitespace-nowrap" @click="handleBulkImport">
              <el-icon class="mr-1">
                <Upload/>
              </el-icon>
              批量导入
            </el-button>
            <el-dialog v-model="bulkImportDialogVisible" title="批量申请" width="50%" @close="handleCloseBulkImport">
              <!--这里填入组件-->
              <bulk_import></bulk_import>
              <template #footer>
                  <span class="dialog-footer">
                 <el-button @click="bulkImportDialogVisible = false">取 消</el-button>
                 <el-button type="primary" @click="bulkImportDialogVisible = false">确 定</el-button>
                 </span>
              </template>
            </el-dialog>
            <!--            ----------------------------------->
            <el-button class="!rounded-button whitespace-nowrap" @click="exportData">
              <el-icon class="mr-1">
                <Download/>
              </el-icon>
              批量导出
            </el-button>
          </div>
          <div class="flex items-center space-x-4">
            <el-button-group>
              <el-button class="!rounded-button whitespace-nowrap">
                <el-icon>
                  <List/>
                </el-icon>
              </el-button>
              <el-button class="!rounded-button whitespace-nowrap">
                <el-icon>
                  <Grid/>
                </el-icon>
              </el-button>
            </el-button-group>
            <el-button class="!rounded-button whitespace-nowrap" @click="refreshTable">
              <el-icon>
                <Refresh/>
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <!-- 表格区域 -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="专利名称" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-icon class="mr-2 text-blue-500">
                  <Document/>
                </el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="applicationNo" label="申请号" width="180"/>
          <el-table-column prop="applicant" label="申请人" width="120"/>
          <el-table-column prop="date" label="申请日期" width="120"/>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="200">
            <template #default="{ row }">
              <el-progress :percentage="row.progress"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" link @click="handleView(row)">查看</el-button>
                <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="flex justify-end mt-4">
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {Search, Plus, Upload, Download, List, Grid, Refresh, Document} from '@element-plus/icons-vue';
import type {DateModelType} from 'element-plus';
import PatentApply from './dialog/patent_apply.vue';
import Bulk_import from "./dialog/bulk_import.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);
const searchForm = ref({
  keyword: '',
  dateRange: [] as DateModelType[],
  status: ''
});
const tableData = ref([
  {
    name: '一种智能家居控制系统及方法',
    applicationNo: 'CN202310123456.X',
    applicant: '陈志远',
    date: '2023-06-15',
    status: 'reviewing',
    progress: 45
  },
  {
    name: '基于人工智能的图像识别装置',
    applicationNo: 'CN202310789012.X',
    applicant: '林思琪',
    date: '2023-07-22',
    status: 'approved',
    progress: 100
  },
  {
    name: '新型环保材料制备工艺',
    applicationNo: 'CN202310345678.X',
    applicant: '王建国',
    date: '2023-08-05',
    status: 'pending',
    progress: 20
  },
  {
    name: '电动汽车充电系统优化方法',
    applicationNo: 'CN202310901234.X',
    applicant: '赵明华',
    date: '2023-09-18',
    status: 'rejected',
    progress: 60
  }
]);
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    reviewing: 'warning',
    approved: 'success',
    rejected: 'danger'
  };
  return String(map[status] || 'info');
};


const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待提交',
    reviewing: '审核中',
    approved: '已授权',
    rejected: '已驳回'
  };
  return map[status] || '未知';
};
const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    dateRange: [],
    status: ''
  };
};
const dialogVisible = ref(false);
const handleCreate = () => {
  dialogVisible.value = true;
  console.log("打开对话框")
};
const handleClose = () => {
  // 在对话框关闭时执行一些操作
};
const refreshTable = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};
const handleView = (row: any) => {
  ElMessageBox.alert(Object.keys(row).map(key => `${key}: ${row[key]}`).join('\n'), '查看', {
    confirmButtonText: '确定',
    type: 'info'
  });
  axios.get(`http://localhost:8080/search?applicationNo=${row.applicationNo}`)
      .then(response => {
        const data = response.data;
        ElMessageBox.alert(Object.keys(data).map(key => `${key}: ${data[key]}`).join(' \n'), '查看', {
          confirmButtonText: '确定',
          type: 'info'
        });
      })
      .catch(error => {
        console.error(error);
      });
};
const handleEdit = (row: any) => {
  console.log('编辑', row);
};
const handleDelete = (row: any) => {
  console.log('删除', row);
};
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  handleSearch();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  handleSearch();
};

const handleSuccess = (response, file, fileList) => {
  // 在文件上传成功时执行一些操作
};

const beforeUpload = (file) => {
  // 在文件上传之前执行一些操作
};


// 批量上传
const bulkImportDialogVisible = ref(false);
const handleBulkImport = () => {
  bulkImportDialogVisible.value = true;
}

const handleCloseBulkImport = () => {
  // 在对话框关闭时执行一些操作
};

const handleUploadBulkImport = () => {
  // 手动触发文件上传
};

//批量导出
const exportData = () => {
  ElMessage.info("正在开发")
}
</script>
<style scoped>
.el-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
}

.el-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.el-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
}

.el-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}
</style>
