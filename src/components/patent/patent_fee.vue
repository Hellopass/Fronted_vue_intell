<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!--    &lt;!&ndash; 头部标题 &ndash;&gt;-->
    <!--    <div class="mb-6">-->
    <!--      <h1 class="text-2xl font-bold text-gray-800">专利年费管理</h1>-->
    <!--    </div>-->

    <!-- 搜索区域 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <div class="w-full">
            <el-input
                v-model="searchQuery"
                placeholder="请输入专利名称或申请号搜索"
            >
              <template #prefix>
                <el-icon>
                  <Search/>
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <div class="w-40">
          <el-select
              v-model="statusFilter"
              placeholder="状态筛选"
              class="w-64"
          >
            <el-option label="全部" value=""/>
            <el-option label="待缴费" value="0"/>
            <el-option label="已缴费" value="1"/>
            <el-option label="已逾期" value="2"/>
          </el-select>
        </div>
        <el-button type="primary" class="!rounded-button whitespace-nowrap" @click="GetPatentFeesByFiltersApi">
          <el-icon class="mr-1">
            <Search/>
          </el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">今年待缴费数量</p>
            <p class="text-2xl font-bold text-blue-600">{{ year_pending_count }}</p>
          </div>
          <el-icon class="text-3xl text-blue-400">
            <Calendar/>
          </el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">今年已缴费金额</p>
            <p class="text-2xl font-bold text-green-600">¥ {{ year_paid_amount }}</p>
          </div>
          <el-icon class="text-3xl text-green-400">
            <Money/>
          </el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">逾期未缴数量</p>
            <p class="text-2xl font-bold text-red-600">{{ overdue_count }}</p>
          </div>
          <el-icon class="text-3xl text-red-400">
            <Warning/>
          </el-icon>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm mb-2">年费金额</p>
            <p class="text-2xl font-bold text-purple-600">¥ {{ total_annual_fee }}</p>
          </div>
          <el-icon class="text-3xl text-purple-400">
            <Wallet/>
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 表格工具栏 -->
    <div class="bg-white p-4 rounded-t-lg shadow-sm border-b flex justify-between items-center">
      <div class="flex items-center gap-2">
        <el-button type="primary" class="!rounded-button whitespace-nowrap">
          <el-icon class="mr-1">
            <Plus/>
          </el-icon>
          批量缴费
        </el-button>
        <el-button class="!rounded-button whitespace-nowrap" @click="exportExcel">
          <el-icon class="mr-1">
            <Download/>
          </el-icon>
          导出 Excel
        </el-button>
      </div>
      <div class="text-gray-500">
        共 {{ total }} 条记录
      </div>
    </div>

    <!-- 专利年费表格 -->
    <div class="bg-white rounded-b-lg shadow-sm">
      <el-table
          ref="exportTable"
          :data="tableData"
          @selection-change="handleSelectionChange"
          style="width: 100%"
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column prop="name" label="专利名称/申请号" min-width="300">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.name }}</span>
              <span class="text-gray-500 text-sm">{{ row.code }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="专利类型" width="120"/>
        <el-table-column prop="amount" label="应缴金额" width="120">
          <template #default="{ row }">
            <span class="font-medium">¥ {{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="缴费截止日期" width="180"/>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag
                :type="getStatusType(row.status)"
                effect="light"
                class="!rounded-button"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 0"
                type="primary"
                class="!rounded-button whitespace-nowrap"
                size="small"
            >
              立即缴费
            </el-button>
            <el-button
                class="!rounded-button whitespace-nowrap"
                size="small"
                @click="handleView(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            class="!rounded-button"
        />
      </div>
    </div>
  </div>
  <el-dialog v-model="detailVisibleFee" width="60%" @close="">
    <patent_fees :patent-type="currentRowType" v-on:submit="Amounts"></patent_fees>
    <template #footer>
                  <span class="dialog-footer">
                 <el-button @click="detailVisibleFee=false">取 消</el-button>
                 <el-button type="primary" @click="handleQ">确 定</el-button>
                 </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {Search, Setting, Calendar, Money, Warning, Wallet, Plus, Download} from '@element-plus/icons-vue';
import {GetFeeStatistics, GetAllFee, UpdateFee, GetPatentFeesByFilters} from '../../axios/patent'
import {ElLoading, ElMessage} from "element-plus";
import Patent_information from "./dialog/patent_information.vue";
import patent_fees from "./dialog/patent_fee.vue";
import {saveAs} from 'file-saver'
import * as XLSX from 'xlsx'

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(156);
const selectedRows = ref([]);

//统计专用
const overdue_count = ref(0)
const total_annual_fee = ref(0)
const year_paid_amount = ref(0)
const year_pending_count = ref(0)
// 表格数据
const tableData = ref([]);


//费用管理
const detailVisibleFee = ref(false)
const currentRowType = ref('');
const Amount = ref(0)
const apply_no = ref('')
const handleView = (row: any) => {
  detailVisibleFee.value = true;
  apply_no.value = row.code
  currentRowType.value = row.type == '发明专利' ? 'invention' : 'utility'
}
const Amounts = (r) => {
  Amount.value = r
}
const handleQ = () => {
  //发送请求
  UpdateFee(apply_no.value, Amount.value).then(res => {
    ElMessage.success('更新成功')
  }).catch(err => {
    ElMessage.error('更新失败')
  })
  detailVisibleFee.value = false
  //等待两秒
  setTimeout(() => {
    GetFeeStatisticss()
  }, 100)

}

// --------
//模糊查询
const GetPatentFeesByFiltersApi = () => {
  tableData.value = []
  GetPatentFeesByFilters(statusFilter.value, searchQuery.value, currentPage.value, pageSize.value).then(res => {
    const q = res.data.data
    total.value = q.pagination.total
    const f = q.data
    f.forEach(fee => {
      tableData.value.push({
        id: fee.id,
        name: fee.Patent.patent_name,
        code: fee.Patent.apply_no,
        type: getTypeText(fee.Patent.patent_type),
        amount: fee.amount,
        deadline: fee.DeadlineDate.split('T')[0],
        status: fee.payment_status,
      })
    })
  }).catch(err => {
    ElMessage.error('查询失败')
  })
}

//----
const getStatusType = (status: number) => {
  const types = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  };
  return types[status as keyof typeof types];
};

const getTypeText = (type: number) => {
  const texts = {
    0: '发明专利',
    1: '实用新型',
    2: '外观设计'
  };
  return texts[type];
};
const getStatusText = (status: number) => {
  const texts = {
    0: '待缴费',
    1: '已缴费',
    2: '已逾期'
  };
  return texts[status as keyof typeof texts];
};

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows;
};
//获取表格数据
const GetFeeStatisticss = () => {
  //获取表格数据
  tableData.value = []
  GetAllFee(currentPage.value, pageSize.value).then(res => {
    const p = res.data
    total.value = p.data.pagination.total
    const f = p.data.fees
    f.forEach(fee => {
      tableData.value.push({
        id: fee.id,
        name: fee.Patent.patent_name,
        code: fee.Patent.apply_no,
        type: getTypeText(fee.Patent.patent_type),
        amount: fee.amount,
        deadline: fee.DeadlineDate.split('T')[0],
        status: fee.payment_status,
      })
    })

  }).catch(err => {
    ElMessage.error(err)
  })

}

//钩子
onMounted(() => {
  //获取统计数据
  GetFeeStatistics().then(res => {
    const f = res.data.data
    overdue_count.value = f.overdue_count;
    total_annual_fee.value = f.total_annual_fee;
    year_paid_amount.value = f.year_paid_amount;
    year_pending_count.value = f.year_pending_count;
  }).catch(err => {
    ElMessage.error(err)
  })

  GetFeeStatisticss()

})


//实现导出excel

// 新增导出功能
const exportTable = ref()  // 添加表格引用

// 修改后的导出方法
// 修改后的导出方法
const exportExcel = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: '正在生成Excel文件...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 获取表格DOM
    const table = exportTable.value.$el.querySelector('.el-table__body-wrapper table')

    // 获取表头文本（排除操作列）
    const headers = Array.from(table.querySelectorAll('th'))
        .slice(0, -1) // 去掉最后一列操作列
        .map(th => th.textContent?.trim() || '')

    // 获取数据内容（排除操作列）
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td'))
            .slice(0, -1) // 去掉最后一列操作列
            .map(td => {
              // 处理状态标签
              const tag = td.querySelector('.el-tag')
              if (tag) return tag.textContent?.trim() || ''
              // 处理金额格式
              if (td.querySelector('.font-medium'))
                return td.textContent?.replace('¥ ', '') || ''
              return td.textContent?.trim() || ''
            })
    )

    // 构建带说明行的数据矩阵
    const data = [
      ['专利年费管理系统数据导出 - 导出时间：' + new Date().toLocaleString()], // 说明行
      headers,                                                                 // 表头
      ...rows                                                                  // 数据行
    ]

    // 创建worksheet
    const ws = XLSX.utils.aoa_to_sheet(data)

    // 合并说明行（合并所有列）
    const mergeRange = {
      s: { r: 0, c: 0 },         // 起始A1
      e: { r: 0, c: headers.length - 1 } // 结束列根据表头数变化
    }
    ws['!merges'] = [mergeRange]

    // 设置列宽
    ws['!cols'] = [
      { wch: 25 },  // 专利名称/申请号
      { wch: 12 },  // 专利类型
      { wch: 12 },  // 应缴金额
      { wch: 15 },  // 缴费截止日期
      { wch: 10 }   // 状态
    ]

    // 创建workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '专利数据')

    // 生成文件
    const wbout = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: true
    })

    // 转换编码
    const blob = new Blob([new Uint8Array(wbout)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 下载文件
    saveAs(blob, `专利年费数据_${new Date().toISOString().slice(0,10)}.xlsx`)

    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  } finally {
    ElLoading.service().close()
  }
}
</script>

<style scoped>
.el-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb;
}

.el-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}

.el-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb;
}

.el-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}
</style>

