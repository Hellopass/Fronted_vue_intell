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
          <el-select v-model="searchForm.status" placeholder="申请状态" class="w-32">
            <el-option label="全部" value=""/>
            <el-option label="待提交" value="1"/>
            <el-option label="审核中" value="2"/>
            <el-option label="已授权" value="3"/>
            <el-option label="已驳回" value="4"/>
          </el-select>
          <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="handleSearchFuzzy">
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
              <patent-apply v-on:listenPatent="getvalue"></patent-apply>
              <template #footer>
                  <span class="dialog-footer">
                 <el-button @click="dialogVisible = false">取 消</el-button>
                 <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                 </span>
              </template>
            </el-dialog>
            <!--            ----------------------------------->

            <el-dialog v-model="bulkImportDialogVisible" title="批量申请" width="50%" @close="handleCloseBulkImport">
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
              导出 Excel
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
                <!--           ============================================--------------->
                <el-button type="primary" link @click="handleView(row)">查看</el-button>
                <el-dialog v-model="lookValue" width="60%" @close="lookClose">
                  <patent_information
                      :applicant="row.applicant"
                      :application-no="row.applicationNo"
                      :date="row.date"
                      :name="row.name"
                      :progress=row.progress
                      :status=row.type
                  ></patent_information>
                  <template #footer>
                  <span class="dialog-footer">
                 <el-button @click="lookValue = false">取 消</el-button>
                 <el-button type="primary" @click="lookValue = false">确 定</el-button>
                 </span>
                  </template>
                </el-dialog>
                <!--           ============================================--------------->

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
import {onMounted, ref} from 'vue';
import {Search, Plus, Upload, Download, List, Grid, Refresh, Document} from '@element-plus/icons-vue';

import PatentApply from './dialog/patent_apply.vue';
import Bulk_import from "./dialog/bulk_import.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import axios from "axios";
import {GetPatentList, DeletePatent, GetPatentListByKeyword} from '../../axios/patent'
import Patent_information from "./dialog/patent_information.vue";

const lookValue = ref(false)
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);
const searchForm = ref({
  keyword: '',
  status: ''
});
const tableData = ref([]);
const tableDataB = ref([]);

//查看
const lookClose = () => {
  lookValue.value = false
}


const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'danger'
  };
  return String(map[status] || 'info');
};


const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    1: '待提交',
    2: '审核中',
    3: '已授权',
    4: '已驳回'
  };
  return map[status] || '未知';
};

//模糊查询
const handleSearchFuzzy = () => {
  const req = GetPatentListByKeyword(searchForm.value.keyword, searchForm.value.status)
  req.then(res => {
    tableData.value = []
    const data = res.data.data;
    tableDataB.value = data
    total.value = data.length;
    const d = pagination(currentPage.value, pageSize.value, data)
    d.forEach(d => {
      //分割时间
      const split = d.apply_data.split('T');
      tableData.value.push({
        type: d.patent_type,
        name: d.patent_name,
        applicationNo: d.apply_no,
        applicant: d.User.user_name,
        date: split[0],
        status: d.status,
        progress: d.status != 4 ? (d.status / 3).toFixed(2) * 100 : 100
      })
    })
  })
}


//分页算法
const pagination = (currentPage, pageSize, data) => {
  //计算总页数
  if (currentPage == 1 || data.length < pageSize) {
    return data.slice(0, pageSize);
  }
  const start = (currentPage - 1) * pageSize;
  const end = currentPage * pageSize;
  return data.slice(start, end);
}

const handleSearch = () => {
  tableData.value = []
  loading.value = true;
  GetPatentList().then(res => {
    const data = res.data.data;
    tableDataB.value = data
    total.value = data.length;
    const d = pagination(currentPage.value, pageSize.value, data)

    d.forEach(d => {
      //分割时间
      const split = d.apply_data.split('T');
      tableData.value.push({
        type: d.patent_type,
        name: d.patent_name,
        applicationNo: d.apply_no,
        applicant: d.User.user_name,
        date: split[0],
        status: d.status,
        progress: d.status != 4 ? (d.status / 3).toFixed(2) * 100 : 100
      })
    })
  }).catch(err => {
    console.log(err)
    ElMessage.error('系统错误!请联系管理员')
  })
  loading.value = false;
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
  handleSearch()
};
const handleView = (row: any) => {
  lookValue.value = true

};
const handleEdit = (row: any) => {
  console.log('编辑', row);
  ElMessage.info('还在开发')
};
const handleDelete = (row: any) => {
  //删除专利信息
  DeletePatent(row.applicationNo).then(res => {
    if (res.data.success) {
      handleSearch()
      ElMessage.success("删除成功")
    } else {
      ElMessage.success("删除失败")

    }
  }).catch(err => {
    ElMessage.success("删除出现错误")

  })
};
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  handleSearch();
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  tableData.value = []
  const d = pagination(currentPage.value, pageSize.value, tableDataB.value)
  d.forEach(d => {
    //分割时间
    const split = d.apply_data.split('T');
    tableData.value.push({
      type: d.patent_type,
      name: d.patent_name,
      applicationNo: d.apply_no,
      applicant: d.User.user_name,
      date: split[0],
      status: d.status,
      progress: d.status != 4 ? (d.status / 3).toFixed(2) * 100 : 100
    })
  })
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

//子组件传值
const getvalue = (value) => {
  dialogVisible.value = value
  handleSearch()
}


//获取数据
onMounted(() => {
  handleSearch()
})

</script>
<style scoped>
.el-table__body :deep(.el-table__inner-wrapper) {
  border: none;
}

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
