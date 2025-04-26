<template>
  <!-- 主容器 -->
  <div class="min-h-[1024px] bg-gray-50">
    <div class="px-6 py-6">

      <!-- 搜索区域模块 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex gap-4 mb-4">
          <!-- 搜索输入 -->
          <el-input placeholder="搜索商标名称/第一申请人" class="!w-72" v-model="searchKeyword"/>

          <!-- 状态筛选 -->
          <el-select v-model="filterStatus" placeholder="审核状态" class="!w-32">
            <el-option label="全部" value=""/>
            <el-option label="审核中" value="0"/>
            <el-option label="已通过" value="1"/>
            <el-option label="已驳回" value="2"/>
          </el-select>

          <!-- 类型筛选 -->
          <el-select v-model="filterType" placeholder="商标类型" class="!w-32">
            <el-option v-for="(label,value) in trademarkTypeOptions" :key="value" :label="label" :value="value"/>
          </el-select>

          <!-- 操作按钮 -->
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>

      <!-- 操作按钮区模块 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <el-button type="primary" @click="handleCreate">
              <el-icon class="mr-1">
                <Plus/>
              </el-icon>
              商标申请
            </el-button>
            <el-button @click="exportTableData">
              <el-icon class="mr-1">
                <Download/>
              </el-icon>
              导出excel
            </el-button>
          </div>
          <el-button @click="refreshTable">
            <el-icon>
              <Refresh/>
            </el-icon>
          </el-button>
        </div>
      </div>

      <!-- 表格区域模块 -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <!-- 表格主体 -->
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <!-- 添加选择框列 -->
          <el-table-column type="selection" width="55" />
          <!-- 添加自增 ID 列 -->
          <el-table-column label="ID" width="80">
            <template #default="{ $index }">
              {{ ($index + 1) + ((Number(currentPage) - 1) * Number(pageSize)) }}
            </template>
          </el-table-column>
          <!-- 各列定义 -->
          <el-table-column prop="title" label="商标名称" width="220"/>
          <el-table-column prop="applyDate" label="申请日期" width="120"/>
          <el-table-column prop="application_number" label="申请号" width="180"/>
          <!-- 摘要列 -->
          <el-table-column prop="abstract" label="商标说明" min-width="300">
            <template #default="{row}">
              <el-tooltip :content="row.abstract" placement="top">
                <span class="abstract-truncate">{{ truncateAbstract(row.abstract) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 申请人列 -->
          <el-table-column prop="applicants" label="第一申请人" width="180">
            <template #default="{row}">
              <div class="flex flex-wrap gap-1">
                <el-tag v-for="(applicant,index) in row.applicants" :key="index" size="small" class="!m-0">
                  {{ applicant }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column prop="status" label="审核状态" width="120">
            <template #default="{row}">
              <el-tag :type="statusColorMap[row.status]">{{ trademarkStatusOptions[row.status] }}</el-tag>
            </template>
          </el-table-column>

          <!-- 类型列 -->
          <el-table-column prop="type" label="商标类型" width="150">
            <template #default="{row}">
              <el-tag effect="plain">{{ trademarkTypeOptions[row.type] }}</el-tag>
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{row}">
              <el-button link type="primary" @click="showDetail(row)">查看</el-button>
              <el-button link type="warning">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              <el-button
                v-if="showReviewButton(row)"
                link
                type="success"
                @click="handleReview(row)"
              >
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页模块 -->
        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- ******************************** 弹窗模块 ******************************** -->
    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="商标审核" width="500px">
      <el-form
        :model="reviewForm"
        :rules="reviewRules"
        ref="reviewFormRef"
        label-width="80px"
      >
        <!-- 审核结果 -->
        <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="reviewForm.result">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="0">驳回</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 审核意见 -->
        <el-form-item label="审核意见" prop="comment">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
            clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">确认</el-button>
      </template>
    </el-dialog>
    <!-- 新建商标对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建商标" width="800px" :close-on-click-modal="false">
      <el-form :model="createForm" :rules="formRules" ref="createFormRef" label-width="100px" label-position="right">
        <!-- 申请人选择字段 -->
        <el-form-item label="申请人列表" prop="applicants">
          <el-select
            v-model="createForm.applicants"
            multiple
            filterable
            allow-create
            :reserve-keyword="false"
            placeholder="输入或选择申请人ID"
            class="!w-full"
            @change="handleApplicantsChange"
            @filter="searchUsers"
          >
            <el-option
              v-for="user in filteredUserList"
              :key="user.id"
              :label="`${user.user_name} (ID:${user.id})`"
              :value="user.id"
            />
          </el-select>
          <div class="text-xs text-gray-500 mt-1">
            支持直接输入用户ID（数字）或从列表选择
          </div>
        </el-form-item>

        <!-- 修改后的第一申请人选择 -->
        <el-form-item label="第一申请人" prop="firstApplicantId">
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <el-button
                v-if="currentUser.id"
                @click="setFirstApplicant(currentUser.id)"
                :type="createForm.firstApplicantId === currentUser.id ? 'primary' : ''"
                size="small"
              >
                设为本人 (ID:{{ currentUser.id }})
              </el-button>
              <el-input
                v-model.number="createForm.firstApplicantId"
                placeholder="输入第一申请人ID"
                clearable
                style="width: 200px"
              />
            </div>
            <div class="text-xs text-gray-500">
              当前选择：{{ currentFirstApplicantInfo }}
            </div>
          </div>
        </el-form-item>

        <!-- 类型选择 -->
        <el-form-item label="商标类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择类型" class="!w-full">
            <el-option v-for="(label, value) in trademarkTypeOptions" :key="value" :label="label" :value="value"/>
          </el-select>
        </el-form-item>

        <!-- 名称输入 -->
        <el-form-item label="商标全称" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入完整名称" clearable/>
        </el-form-item>

        <!-- 摘要输入 -->
        <el-form-item label="详细说明" prop="abstract">
          <el-input v-model="createForm.abstract" type="textarea" :rows="4"
                    placeholder="请输入至少200字的详细说明" resize="none" show-word-limit maxlength="500"/>
        </el-form-item>

        <!-- 文件上传部分增加多文件支持 -->
        <el-form-item label="相关文件" prop="files">
          <el-upload
            v-model:file-list="createForm.files"
            :auto-upload="false"
            multiple
            :limit="5"
            :on-exceed="handleFileExceed"
            :before-upload="beforeFileUpload"
          >
            <el-button type="primary">
              <el-icon class="mr-1">
                <Upload/>
              </el-icon>
              点击上传（支持多选）
            </el-button>
            <template #tip>
              <div class="el-upload__tip text-gray-400">
                支持同时上传多个文件，格式：PDF/DOC/DOCX，单个≤50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateForm">提交</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="detailDialogVisible" width="800px" :close-on-click-modal="false">
      <div class="detail-container">
        <!-- 头部信息 -->
        <div class="bg-blue-500 px-4 py-3 rounded-t flex justify-between items-center mb-6">
          <h2 class="text-white text-lg">{{ detailData.title }}</h2>
        </div>

        <!-- 基础信息网格 -->
        <div class="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 px-4">
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">第一申请人：</label>
            <div class="flex flex-wrap gap-1">
              <el-tag v-for="(applicant,index) in detailData.applicants" :key="index" size="small" class="!m-0">
                {{ applicant }}
              </el-tag>
            </div>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">申请日期：</label>
            <span>{{ detailData.applyDate }}</span>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">商标类型：</label>
            <el-tag effect="plain">{{ trademarkTypeOptions[detailData.type] }}</el-tag>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">申请号：</label>
            <span>{{ detailData.application_number }}</span>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">详细说明：</label>
            <span>{{ detailData.abstract }}</span>
          </div>
        </div>

        <!-- 文件下载区 -->
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
          <el-table :data="detailData.files" style="width: 100%">
            <el-table-column label="文件名称(点击可以实现文件预览)">
              <template #default="{ row }">
                <div class="flex items-center">
                  <el-icon class="mr-2 text-blue-500" :size="20">
                    <Document/>
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
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewVisible" title="文件预览" width="60%">
      <div class="min-h-[400px] flex items-center justify-center">
        <div v-if="currentFile" class="w-full h-full">
          <!-- PDF 使用独立容器 -->
          <div v-if="currentFile.type === 'pdf'" key="pdf-preview">
            <embed :src="pdfUrl" type="application/pdf" class="w-full min-h-[500px]"/>
          </div>

          <!-- 图片预览 -->
          <!-- 修正条件判断 -->
          <div v-else-if="['png', 'jpg', 'jpeg'].includes(currentFile.type)">
            <img :src="imageSrc" alt="Image Preview" class="max-w-full max-h-full"/>
          </div>

          <!-- Word 使用独立容器 -->
          <div v-else-if="['doc', 'docx'].includes(currentFile.type)" key="word-preview">
            <div ref="wordContainer" class="doc-preview p-4 bg-white"></div>
          </div>

          <!-- 其他文件类型 -->
          <div v-else>
            <el-icon class="mb-4 text-gray-400" :size="64">
              <Document/>
            </el-icon>
            <p class="text-gray-600">{{ currentFile?.name }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick} from 'vue'
import {ElMessage, ElLoading, ElForm, ElMessageBox} from 'element-plus'
import axios from '../../axios/axios'
import {GetPatentFile} from "../../axios/patent"
import {renderAsync} from 'docx-preview'
// 引入 xlsx 库
import * as XLSX from 'xlsx';
import { log } from 'echarts/types/src/util/log.js'


/**************************** 导出文件 ****************************/
const exportTableData = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  // 定义表头
  const headers = [
    'ID',
    '商标名称',
    '申请日期',
    '商标说明',
    '申请人',
    '审核状态',
    '商标类型'
  ];

  // 处理数据
  const data = tableData.value.map((item, index) => {
    return {
      'ID': (index + 1) + ((Number(currentPage) - 1) * Number(pageSize)),
      '商标名称': item.title,
      '申请日期': item.applyDate,
      '商标说明': item.abstract,
      '申请人': item.applicants.join(', '),
      '审核状态': trademarkStatusOptions.value[item.status],
      '商标类型': trademarkTypeOptions.value[item.type]
    };
  });

  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '商标信息');

  // 导出文件
  XLSX.writeFile(wb, '商标信息表.xlsx');
};


/**************************** 类型定义 ****************************/
interface User {
  id: number
  user_name: string
  authority: 'admin' | 'reviewer' | 'user' // 明确角色类型
}

// 新增的类型定义
interface AuditStep {
  name: string
  status: 'success' | 'pending'
  reviewerId?: number
  reviewerName?: string
  comment?: string
  time?: string
}

interface ReviewForm {
  comment: string
  result: number // 1:通过 0:驳回
}

interface Trademark {
  id: number;
  title: string;
  abstract: string;
  applyDate: string;
  type: number;
  applicants: string[];
  files: FileInfo[];
  status: number;
  application_number: string; 
}

interface FileInfo {
  name: string
  type: string
  size: string
  date: string
  blob: Blob
}

/**************************** 全局状态 ****************************/
// 当前用户信息（应从登录状态获取）
const currentUser = ref<User>()

// 商标类型映射
const trademarkTypeOptions = ref({
  1: '商品商标',
  2: '服务商标',
  3: '集体商标',
  4: '证明商标',
})
// 商标审核状态映射
const trademarkStatusOptions = ref({
  0: '审核中',
  1: '已通过',
  2: '被驳回',
})
// 状态标签颜色映射
const statusColorMap: Record<number, string> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
}

/**************************** 用户模块 ****************************/
const userList = ref<User[]>([])
const userSearchKeyword = ref('')

// 过滤后的用户列表
const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) return userList.value
  const keyword = userSearchKeyword.value.toLowerCase()
  return userList.value.filter(user =>
    user.user_name.toLowerCase().includes(keyword) ||
    user.id.toString().includes(keyword)
  )
})

/**************************** 搜索模块 ****************************/
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')

const handleSearch = () => {
  tableData.value = null
  refreshTable()
}

const resetSearch = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterType.value = ''
}

/**************************** 表格模块 ****************************/
const tableData = ref<Trademark[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchTableData = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
      status: filterStatus.value,
      type: filterType.value
    };
    const {data} = await axios.get('/trademark/get_trademarks', {
      params
    });
    // 使用Promise.all处理并行请求
    const processedTrademarks = await Promise.all(
      data.data.trademarks.map(async (f: any) => {
        // 获取文件信息
        let filesdata: FileInfo[] = [];
        try {
          const fileRes = await axios.get("/trademark/get_files", {params: {id: f.id}});

          // 并行处理文件获取
          const filePromises = fileRes.data.data.map(async (c: any) => {
            try {
              const fileData = await GetPatentFile(c);
              const s = c.split("/")
              const filename = s[s.length - 1]
              const type = filename.split('.').pop()?.toLowerCase() || 'unknown'
              return {
                name: filename,
                type: type,
                size: (fileData.data.size / 1048576).toFixed(2) + ' MB',
                date: f.apply_date.split('T')[0],
                blob: fileData.data
              };
            } catch (e) {
              console.error('文件获取失败:', c, e);
              return null;
            }

          });

          filesdata = (await Promise.all(filePromises)).filter(Boolean) as FileInfo[];
        } catch (e) {
          console.error('文件列表获取失败:', f.id, e);
        }

        // 处理申请人信息
        const applicants = [f.first_author.user_name];
        if (f.co_applicants?.length) {
          applicants.push(...f.co_applicants.map((a: any) => a.user_name));
        }
        return {
          id: f.id,
          title: f.title,
          abstract: truncateAbstract(f.abstract),
          applyDate: f.apply_date.split('T')[0],
          type: f.trademark_type,
          applicants,
          files: filesdata,
          status: f.approval_status,
             // 添加申请号字段
             application_number: f.application_number 
        };
      })
    );

    // 确保完整赋值
    tableData.value = processedTrademarks;
    // 更新总数据量
    total.value = data.data.total;

  } catch (error) {
    console.error('获取商标数据失败:', error);
    ElMessage.error('获取商标数据失败，请稍后重试');
  }
}

// 截断摘要函数
const truncateAbstract = (text: string, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 刷新表格
const refreshTable = () => {
  fetchTableData()
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  // 可以在这里添加选择变化后的逻辑
}

// 显示详情
const showDetail = (row: Trademark) => {
  detailData.value = {...row}
  detailDialogVisible.value = true
}


const handleDelete = (row: Article) => {
  ElMessageBox.confirm(`确定删除商标《${row.title}》吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await axios.delete(`/trademark/del_trademark?id=${row.id}`)
      ElMessage.success('删除成功')
      refreshTable()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const custatus = ref(0) //当前是初审还是终审
const showReviewButton = (row: Article) => {
  const userRole = currentUser.value?.authority
  const status = row.status
  custatus.value = status
  // 普通用户不可见
  if (!userRole || userRole === 'user') return false

  // 管理员可以审核终审核
  if (userRole === 'admin' && status === 2) return true

  // 审核员只能审核特定状态
  if (userRole === 'reviewer' && status === 1) return true

  return false
}
// 审核表单引用
const currentReviewId = ref<number | null>(null)

const handleReview = (row: Trademark) => {
  currentReviewId.value = row.id
  reviewForm.value = {result: 1, comment: ''} // 重置表单
  reviewDialogVisible.value = true
}

// 提交审核
const submitReview = () => {
  //返回审核是否通过
  //审核建议
  //审核员id
  //文章id
  const f = new FormData()
  f.append('trademark_id', currentReviewId.value)
  f.append('reviewer_id', currentUser.value.id.toString())
  f.append('comment', reviewForm.value.comment.toString())
  f.append('status', reviewForm.value.result.toString())
  axios.put("/trademark/update_trademark_status", f, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => {
    ElMessage.success('审核成功')
  }).catch(err => {
    ElMessage.error('审核失败')
  })
  fetchTableData()
  reviewDialogVisible.value = false
}
// 处理新建
// 点击商标申请按钮的处理函数
const handleCreate = () => {
  // 重置表单
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
  // 打开新建商标对话框
  createDialogVisible.value = true
}

// 提交新建表单
const submitCreateForm = () => {
  createFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 处理文件上传
      const formData = new FormData()
      formData.append('trademarkType', createForm.value.type.toString())
      formData.append('title', createForm.value.title.toString())
      formData.append('abstract',createForm.value.abstract.toString()  )
      formData.append('firstAuthorId', createForm.value.firstApplicantId.toString())
       createForm.value.applicants.forEach((id, index) => {
        formData.append(`authors`, id.toString())
      })

      createForm.value.files.forEach(file => {
        formData.append('files', file.raw)
      })

      axios.post('/trademark/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        ElMessage.success('商标申请提交成功')
        createDialogVisible.value = false
        refreshTable()
      }).catch((error) => {
        console.error('商标申请提交失败:', error)
        ElMessage.error('商标申请提交失败，请稍后重试')
      })
    }
  })
}

// 处理申请人变化
const handleApplicantsChange = (value: number[]) => {
  // 可以在这里添加申请人变化后的逻辑
}

// 设置第一申请人
const setFirstApplicant = (id: number) => {
  createForm.value.firstApplicantId = id
}

// 搜索用户
const searchUsers = (query: string) => {
  userSearchKeyword.value = query
  // 可以在这里添加搜索用户的逻辑
}

// 处理文件超出限制
const handleFileExceed = (files: any[], fileList: any[]) => {
  ElMessage.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${fileList.length} 个文件`)
}

// 文件上传前的钩子
const beforeFileUpload = (file: any) => {
  const isPDF = file.type === 'application/pdf'
  const isDOC = file.type === 'application/msword'
  const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!(isPDF || isDOC || isDOCX)) {
    ElMessage.error('上传文件只能是 PDF/DOC/DOCX 格式!')
  }
  if (!isLt50M) {
    ElMessage.error('上传文件大小不能超过 50MB!')
  }
  return (isPDF || isDOC || isDOCX) && isLt50M
}

// 处理批量下载
const handleBatchDownload = () => {
  // 可以在这里添加批量下载的逻辑
}

// 处理文件预览
const handlePreview = (row: FileInfo) => {
  currentFile.value = row
  if (row.type === 'pdf') {
    pdfUrl.value = URL.createObjectURL(row.blob)
  } else if (['png', 'jpg', 'jpeg'].includes(row.type)) {
    imageSrc.value = URL.createObjectURL(row.blob)
  } else if (['doc', 'docx'].includes(row.type)) {
    nextTick(() => {
      if (wordContainer.value) {
        renderAsync(row.blob, wordContainer.value, null, {})
      }
    })
  }
  previewVisible.value = true
}

// 处理文件下载
const handleDownload = (row: FileInfo) => {
  const url = URL.createObjectURL(row.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = row.name
  link.click()
  URL.revokeObjectURL(url)
}

// 审核对话框状态
const reviewDialogVisible = ref(false)
const reviewForm = ref<ReviewForm>({
  comment: '',
  result: 1
})
const reviewRules = {
  result: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
  comment: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
}
const reviewFormRef = ref<InstanceType<typeof ElForm>>()
const currentReviewTrademarkId = ref<number | null>(null)

// 新建对话框状态
const createDialogVisible = ref(false)
const createForm = ref({
  applicants: [] as number[],
  firstApplicantId: null as number | null,
  type: null as number | null,
  title: '',
  abstract: '',
  files: [] as any[]
})
const formRules = {
  applicants: [{ type: 'array', required: true, message: '请选择申请人', trigger: 'change' }],
  firstApplicantId: [{ required: true, message: '请选择第一申请人', trigger: 'change' }],
  type: [{ required: true, message: '请选择商标类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入商标全称', trigger: 'blur' }],
  abstract: [{ required: true, message: '请输入详细说明', trigger: 'blur' }]
}
const createFormRef = ref<InstanceType<typeof ElForm>>()

// 详情对话框状态
const detailDialogVisible = ref(false)
const detailData = ref<Trademark>({} as Trademark)

// 文件预览对话框状态
const previewVisible = ref(false)
const currentFile = ref<FileInfo | null>(null)
const pdfUrl = ref('')
const imageSrc = ref('')
const wordContainer = ref<HTMLElement | null>(null)

// 当前第一申请人信息
const currentFirstApplicantInfo = computed(() => {
  const user = userList.value.find(u => u.id === createForm.value.firstApplicantId)
  return user ? `${user.user_name} (ID:${user.id})` : '未选择'
})

onMounted(() => {
  fetchTableData()
  // 可以在这里添加获取用户列表的逻辑
   // 初始化加载用户列表
   axios.get('/user/find_all').then(({data}) => {
    userList.value = data.data.users
    currentUser.value = data.data.current
  })
})
</script>

<style scoped>
.abstract-truncate {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

