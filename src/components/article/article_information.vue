<template>
  <!-- 主容器 -->
  <div class="min-h-[1024px] bg-gray-50">
    <div class="px-6 py-6">

      <!-- 搜索区域模块 -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex gap-4 mb-4">
          <!-- 搜索输入 -->
          <el-input placeholder="搜索著作名称/作者" class="!w-72" v-model="searchKeyword"/>

          <!-- 状态筛选 -->
          <el-select v-model="filterStatus" placeholder="审核状态" class="!w-32">
            <el-option label="全部" value=""/>
            <el-option label="审核中" value="0"/>
            <el-option label="已通过" value="1"/>
            <el-option label="已驳回" value="2"/>
          </el-select>

          <!-- 类型筛选 -->
          <el-select v-model="filterType" placeholder="著作类型" class="!w-32">
            <el-option v-for="(label,value) in workTypeOptions" :key="value" :label="label" :value="value"/>
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
              著作申请
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
          <!-- 添加申请号列 -->
          <el-table-column prop="application_number" label="申请号" width="180"/>
          <el-table-column prop="title" label="著作名称" width="220"/>
          <el-table-column prop="applyDate" label="申请日期" width="120"/>

          <!-- 摘要列 -->
          <el-table-column prop="abstract" label="摘要说明" min-width="300">
            <template #default="{row}">
              <el-tooltip :content="row.abstract" placement="top">
                <span class="abstract-truncate">{{ truncateAbstract(row.abstract) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>

          <!-- 作者列 -->
          <el-table-column prop="authors" label="第一作者" width="180">
            <template #default="{row}">
              <div class="flex flex-wrap gap-1">
                <el-tag v-for="(author,index) in row.authors" :key="index" size="small" class="!m-0">
                  {{ author }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 状态列 -->
          <el-table-column prop="status" label="审核状态" width="120">
            <template #default="{row}">
              <el-tag :type="statusColorMap[row.status]">{{ workStatusOptions[row.status] }}</el-tag>
            </template>
          </el-table-column>

          <!-- 类型列 -->
          <el-table-column prop="type" label="著作类型" width="150">
            <template #default="{row}">
              <el-tag effect="plain">{{ workTypeOptions[row.type] }}</el-tag>
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
    <el-dialog v-model="reviewDialogVisible" title="著作审核" width="500px">
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
    <!-- 新建著作对话框 -->
    <el-dialog v-model="createDialogVisible" title="新建著作" width="800px" :close-on-click-modal="false">
      <el-form :model="createForm" :rules="formRules" ref="createFormRef" label-width="100px" label-position="right">
        <!-- 作者选择字段 -->
        <el-form-item label="作者列表" prop="authors">
          <el-select
              v-model="createForm.authors"
              multiple
              filterable
              allow-create
              :reserve-keyword="false"
              placeholder="输入或选择作者ID"
              class="!w-full"
              @change="handleAuthorsChange"
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

        <!-- 修改后的第一作者选择 -->
        <el-form-item label="第一作者" prop="firstAuthorId">
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <el-button
                  v-if="currentUser.id"
                  @click="setFirstAuthor(currentUser.id)"
                  :type="createForm.firstAuthorId === currentUser.id ? 'primary' : ''"
                  size="small"
              >
                设为本人 (ID:{{ currentUser.id }})
              </el-button>
              <el-input
                  v-model.number="createForm.firstAuthorId"
                  placeholder="输入第一作者ID"
                  clearable
                  style="width: 200px"
              />
            </div>
            <div class="text-xs text-gray-500">
              当前选择：{{ currentFirstAuthorInfo }}
            </div>
          </div>
        </el-form-item>

        <!-- 类型选择 -->
        <el-form-item label="著作类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择类型" class="!w-full">
            <el-option v-for="(label, value) in workTypeOptions" :key="value" :label="label" :value="value"/>
          </el-select>
        </el-form-item>

        <!-- 名称输入 -->
        <el-form-item label="著作全称" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入完整名称" clearable/>
        </el-form-item>

        <!-- 摘要输入 -->
        <el-form-item label="详细摘要" prop="abstract">
          <el-input v-model="createForm.abstract" type="textarea" :rows="4"
                    placeholder="请输入至少200字的详细摘要" resize="none" show-word-limit maxlength="500"/>
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
          <!-- 添加申请号信息 -->
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">申请号：</label>
            <span>{{ detailData.application_number }}</span>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">第一作者：</label>
            <div class="flex flex-wrap gap-1">
              <el-tag v-for="(author,index) in detailData.authors" :key="index" size="small" class="!m-0">
                {{ author }}
              </el-tag>
            </div>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">申请日期：</label>
            <span>{{ detailData.applyDate }}</span>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">著作类型：</label>
            <el-tag effect="plain">{{ workTypeOptions[detailData.type] }}</el-tag>
          </div>
          <div class="info-item flex items-center">
            <label class="text-gray-600 w-20">详细摘要：</label>
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
          <div v-else-if="currentFile.type === 'png' || 'jpg' || 'jpeg'">
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
import {log} from "echarts/types/src/util/log";
import {GetPatentFile} from "../../axios/patent"
import {renderAsync} from 'docx-preview'
// 引入 xlsx 库
import * as XLSX from 'xlsx';


/**************************** 导出文件 ****************************/
const exportTableData = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  // 定义表头
  const headers = [
    'ID',
    '著作名称',
    '申请日期',
    '摘要说明',
    '第一作者',
    '审核状态',
    '著作类型'
  ];

  // 处理数据
  const data = tableData.value.map((item, index) => {
    return {
      'ID': (index + 1) + ((Number(currentPage.value) - 1) * Number(pageSize.value)),
      '著作名称': item.title,
      '申请日期': item.applyDate,
      '摘要说明': item.abstract,
      '第一作者': item.authors.join(', '),
      '审核状态': workStatusOptions.value[item.status],
      '著作类型': workTypeOptions.value[item.type]
    };
  });

  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '著作信息');

  // 导出文件
  XLSX.writeFile(wb, '著作信息表.xlsx');
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

interface Article {
  id: number;
  title: string;
  abstract: string;
  applyDate: string;
  type: number;
  authors: string[];
  files: FileInfo[];
  status: number;
  current_sept:number;
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

// 著作类型映射
const workTypeOptions = ref({
  1: '书籍',
  2: '期刊论文',
  3: '会议论文',
  4: '学位论文',
  5: '技术标准',
  6: '网页资源'
})
// 著作审核状态映射
const workStatusOptions = ref({
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
      user.name.toLowerCase().includes(keyword) ||
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
const tableData = ref<Article[]>([])
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
    const {data} = await axios.get('/article/get_articles', {
      params
    });

    // 使用Promise.all处理并行请求
    const processedArticles = await Promise.all(
        data.data.articles.map(async (f: any) => {
          // 获取文件信息
          let filesdata: FileInfo[] = [];
          try {
            const fileRes = await axios.get("/article/get_files", {params: {id: f.id}});

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

          // 处理作者信息
          const authors = [f.first_author.user_name];
          if (f.co_authors?.length) {
            authors.push(...f.co_authors.map((a: any) => a.user_name));
          }
          
          return {
            id: f.id,
            title: f.title,
            abstract: truncateAbstract(f.abstract),
            applyDate: f.apply_date.split('T')[0],
            type: f.article_type,
            authors,
            files: filesdata,
            status: f.approval_status,
            current_sept:f.current_sept,
             // 添加申请号字段
          application_number: f.application_number 
          };
        })
    );
    tableData.value = processedArticles;
    total.value = data.data.total;
  } catch (error) {
    ElMessage.error('数据获取失败');
    console.error('API请求错误:', error);
  }
};

const truncateAbstract = (text: string) =>
    text.length > 20 ? `${text.substring(0, 15)}...` : text

const refreshTable = () => {
  fetchTableData()
}

/**************************** 新建著作模块 ****************************/
const createDialogVisible = ref(false)
const createFormRef = ref<InstanceType<typeof ElForm>>()
const createForm = ref({
  type: '',
  title: '',
  abstract: '',
  authors: [] as number[],
  firstAuthorId: null as number | null,
  files: [] as File[]
})
const handleCreate = () => {
  createDialogVisible.value = true
}
// 当前第一作者信息展示
const currentFirstAuthorInfo = computed(() => {
  if (!createForm.value.firstAuthorId) return '未选择'
  const user = userList.value.find(u => u.id === createForm.value.firstAuthorId)
  return user ? `${user.user_name} (ID:${user.id})` : `未知用户 (ID:${createForm.value.firstAuthorId})`
})

// 表单验证规则
const formRules = {
  type: [{required: true, message: '请选择著作类型', trigger: 'change'}],
  title: [
    {required: true, message: '请输入著作名称', trigger: 'blur'},
    {min: 5, max: 100, message: '长度在5到100个字符', trigger: 'blur'}
  ],
  abstract: [
    {required: true, message: '摘要不能为空', trigger: 'blur'},
    {min: 200, message: '摘要至少200字', trigger: 'blur'}
  ],
  authors: [
    {
      type: 'array',
      required: true,
      trigger: 'change',
      validator: (rule: any, value: number[], callback: Function) => {
        if (value.length === 0) {
          callback(new Error('至少需要一个作者'))
          return
        }

        const invalidIds = value.filter(id =>
            !Number.isInteger(id) ||
            id <= 0
        )

        if (invalidIds.length > 0) {
          callback(new Error(`包含无效用户ID: ${invalidIds.join(',')}`))
          return
        }

        callback()
      }
    }
  ],
  firstAuthorId: [
    {
      required: true,
      trigger: ['blur', 'change'],
      validator: (rule: any, value: number, callback: Function) => {
        if (!value) {
          callback(new Error('第一作者不能为空'))
          return
        }

        if (!Number.isInteger(value)) {
          callback(new Error('必须是有效的用户ID'))
          return
        }

        if (!createForm.value.authors.includes(value)) {
          callback(new Error('第一作者必须在作者列表中'))
          return
        }

        callback()
      }
    }
  ],
  files: [
    {
      validator: () => createForm.value.files.length > 0,
      message: '至少上传一个文件',
      trigger: 'change'
    }
  ]
}

// 作者选择相关逻辑
const handleAuthorsChange = (newAuthors: number[]) => {
  // 自动设置第一个作者为第一作者
  if (newAuthors.length > 0 && !newAuthors.includes(createForm.value.firstAuthorId!)) {
    createForm.value.firstAuthorId = newAuthors[0]
  }

  // 移除无效的firstAuthorId
  if (createForm.value.firstAuthorId && !newAuthors.includes(createForm.value.firstAuthorId)) {
    createForm.value.firstAuthorId = null
  }
}

const setFirstAuthor = (userId: number) => {
  createForm.value.firstAuthorId = userId
  // 如果不在作者列表则自动添加
  if (!createForm.value.authors.includes(userId)) {
    createForm.value.authors = [...createForm.value.authors, userId]
  }
}

// 用户搜索
const searchUsers = (query: string) => {
  userSearchKeyword.value = query
}

// 文件上传处理
const handleFileExceed = () => {
  ElMessage.warning('最多上传5个文件')
}

const beforeFileUpload = (file: File) => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (!validTypes.includes(file.type)) {
    ElMessage.error('仅支持PDF/Word文档')
    return false
  }

  if (file.size / 1024 / 1024 > 50) {
    ElMessage.error('文件大小不能超过50MB')
    return false
  }

  return true
}

// 提交表单
const submitCreateForm = async () => {
  try {
    await createFormRef.value?.validate()
    const loading = ElLoading.service({lock: true, text: '正在提交...'})

    try {
      const formData = new FormData()
      formData.append('articleType', createForm.value.type)

      formData.append('title', createForm.value.title)
      formData.append('abstract', createForm.value.abstract)
      formData.append('firstAuthorId', createForm.value.firstAuthorId!.toString())
      createForm.value.authors.forEach((id, index) => {
        formData.append(`authors`, id.toString())
      })

      createForm.value.files.forEach(file => {
        formData.append('files', file.raw)
      })

      const {data} = await axios.post('/article/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      if (data.success) {
        ElMessage.success('创建成功')
        refreshTable()
        createDialogVisible.value = false
      }
    } finally {
      loading.close()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '提交失败')
  }
}

const resetCreateForm = () => {
  createFormRef.value?.resetFields()
  createForm.value = {
    type: '',
    title: '',
    abstract: '',
    authors: [],
    firstAuthorId: null,
    files: []
  }
}
/**************************** 审核模块 ****************************/
// 审核相关状态
const reviewDialogVisible = ref(false)
const reviewForm = ref({
  result: 1, // 默认通过
  comment: ''
})
const currentReviewId = ref<number | null>(null)
const custatus = ref(0) //当前是初审还是终审
// 表单验证规则
const reviewRules = {
  result: [
    {required: true, message: '请选择审核结果', trigger: 'change'}
  ],
  comment: [
    {required: true, message: '请输入审核意见', trigger: 'blur'},
    {min: 10, message: '意见至少10个字符', trigger: 'blur'}
  ]
}


const showReviewButton = (row: Article) => {
  const userRole = currentUser.value?.authority
  const status = row.status
  custatus.value = status
  // 普通用户不可见
  if (!userRole || userRole === 'user') return false

  // 管理员可以审核终审核
  if (userRole === 'admin' && status === 0&&row.current_sept==2) return true

  // 审核员只能审核特定状态
  if (userRole === 'reviewer' && status === 0&&row.current_sept==1) return true

  return false
}
// 点击审核按钮
const handleReview = (row: Article) => {
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
  f.append('article_id', currentReviewId.value)
  f.append('reviewer_id', currentUser.value.id.toString())
  f.append('comment', reviewForm.value.comment.toString())
  f.append('status', reviewForm.value.result.toString())
  axios.put("/article/update_article_aduit", f, {
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

/**************************** 详情模块 ****************************/
const detailDialogVisible = ref(false)
const detailData = ref<Article>({
  id: '',
  title: '',
  abstract: '',
  applyDate: '',
  type: '',
  authors: [],
  files: [],
  status: ''
})

const showDetail = (row: Article) => {
  detailData.value = {...row}
  detailDialogVisible.value = true
}

/**************************** 文件管理模块 ****************************/

const currentFile = ref<FileInfo | null>(null)
const previewVisible = ref(false)
const pdfUrl = ref('')
const imageSrc = ref('')
// 添加 Word 预览相关逻辑
const wordContainer = ref<HTMLElement | null>(null)
let wordRenderCleanup: (() => void) | null = null
// 修改后的预览处理函数
const handlePreview = async (file: FileInfo) => {
  // 清理之前的状态
  currentFile.value = null
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  pdfUrl.value = ''
  imageSrc.value = ''

  // 清理 Word 渲染
  if (wordRenderCleanup) {
    wordRenderCleanup()
    wordRenderCleanup = null
  }

  currentFile.value = file
  previewVisible.value = true

  try {
    // 优先处理 PDF
    if (file.type === 'pdf') {
      pdfUrl.value = URL.createObjectURL(file.blob)
      return
    }

    // 处理 Word 文档
    if (['doc', 'docx'].includes(file.type)) {
      await nextTick()
      if (wordContainer.value) {
        const blob = new Blob([file.blob], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })

        wordRenderCleanup = await renderAsync(
            blob,
            wordContainer.value,
            null,
            {
              className: "docx",
              inWrapper: true,
              breakPages: true
            }
        )
      }
      return
    }

    // 处理图片
    if (['png', 'jpg', 'jpeg'].includes(file.type)) {
      imageSrc.value = URL.createObjectURL(file.blob)
      return
    }
  } catch (e) {
    ElMessage.error('文件预览失败')
    console.error('预览错误:', e)
  }
}

// 单文件下载
const handleDownload = (file: FileInfo) => {
  try {
    const url = URL.createObjectURL(file.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } catch (e) {
    ElMessage.error('文件下载失败')
    console.error('下载错误:', e)
  }
}

// 批量下载（创建ZIP包）
const handleBatchDownload = async () => {

  try {
    const JSZip = await import('jszip')
    const zip = new JSZip.default()
    const folder = zip.folder(`${detailData.value.title}_附件`)
    // 并行添加文件
    await Promise.all(
        detailData.value.files.map(async (file, index) => {
          const blob = await fetch(URL.createObjectURL(file.blob))
              .then(r => r.blob())
          folder?.file(file.name, blob)
        })
    )

    const content = await zip.generateAsync({type: 'blob'})
    const url = URL.createObjectURL(content)

    const link = document.createElement('a')
    link.href = url
    link.download = `${detailData.value.title}_附件.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('打包下载成功')
  } catch (e) {
    ElMessage.error('文件打包失败')
    console.error('打包错误:', e)
  }
}

/**************************** 删除模块 ****************************/
const handleDelete = (row: Article) => {
  ElMessageBox.confirm(`确定删除著作《${row.title}》吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await axios.delete(`/article/del_article?id=${row.id}`)
      ElMessage.success('删除成功')
      refreshTable()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

/**************************** 生命周期钩子 ****************************/
onMounted(() => {
  fetchTableData()
  // 初始化加载用户列表
  axios.get('/user/find_all').then(({data}) => {
    userList.value = data.data.users
    currentUser.value = data.data.current
  })
})
</script>

<style scoped>
/* 自定义表格样式 */
.el-table {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #fafafa;

}

/* 状态标签圆角 */
.el-tag {
  @apply rounded-lg;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .el-table-column[prop="progress"] {
    display: none;
  }
}
</style>