<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 筛选区 -->
    <div class="bg-white shadow-sm mx-auto max-w-7xl w-full mt-4 px-6 py-4 rounded-lg">
      <div class="grid grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
          <div class="flex space-x-2">
            <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm">年度</button>
            <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm">季度</button>
            <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm">月度</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">申请人</label>
          <el-select
              v-model="selectedApplicants"
              multiple
              collapse-tags
              placeholder="请选择申请人"
              class="w-full"
          >
            <el-option
                v-for="item in applicants"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">专利类型</label>
          <el-select
              v-model="selectedPatentTypes"
              multiple
              collapse-tags
              placeholder="请选择专利类型"
              class="w-full"
          >
            <el-option
                v-for="item in patentTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
        <div class="flex items-end">
          <button class="!rounded-button whitespace-nowrap bg-blue-600 text-white px-4 py-2 text-sm flex items-center space-x-1">
            <i class="el-icon-plus"></i>
            <span>添加筛选条件</span>
          </button>
        </div>
      </div>
      <div class="flex justify-between mt-4">
        <div class="flex space-x-2">
          <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm flex items-center space-x-1">
            <i class="el-icon-folder-opened"></i>
            <span>加载预设</span>
          </button>
          <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm flex items-center space-x-1">
            <i class="el-icon-folder-add"></i>
            <span>保存预设</span>
          </button>
        </div>
        <div class="flex space-x-2">
          <button class="!rounded-button whitespace-nowrap bg-blue-600 text-white px-4 py-2 text-sm flex items-center space-x-1">
            <i class="el-icon-download"></i>
            <span>导出报告</span>
          </button>
          <button class="!rounded-button whitespace-nowrap border border-gray-300 px-4 py-2 text-sm flex items-center space-x-1">
            <i class="el-icon-question"></i>
            <span>帮助文档</span>
          </button>
          <button class="!rounded-button whitespace-nowrap bg-blue-600 text-white px-4 py-2 text-sm flex items-center space-x-1">
            <i class="el-icon-search"></i>
            <span>应用筛选</span>
          </button>
        </div>
      </div>
    </div>
    <!-- 主内容区 -->
    <main class="flex-1 mx-auto max-w-7xl w-full mt-4 mb-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 图表展示区 -->
        <div class="lg:col-span-2 bg-white shadow-sm rounded-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-800">专利趋势分析</h2>
            <div class="flex space-x-2">
              <button
                  v-for="(type, index) in chartTypes"
                  :key="index"
                  @click="currentChartType = type.value"
                  class="!rounded-button whitespace-nowrap border px-3 py-1 text-sm"
                  :class="{'border-blue-600 text-blue-600': currentChartType === type.value, 'border-gray-300': currentChartType !== type.value}"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
          <div class="h-96 w-full" ref="chartContainer"></div>
          <div class="flex justify-between mt-6">
            <div class="flex space-x-2">
              <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm flex items-center space-x-1">
                <i class="el-icon-data-line"></i>
                <span>数据对比</span>
              </button>
              <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm flex items-center space-x-1">
                <i class="el-icon-zoom-in"></i>
                <span>放大查看</span>
              </button>
            </div>
            <div class="flex space-x-2">
              <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm flex items-center space-x-1">
                <i class="el-icon-picture"></i>
                <span>保存图片</span>
              </button>
              <button class="!rounded-button whitespace-nowrap border border-gray-300 px-3 py-1 text-sm flex items-center space-x-1">
                <i class="el-icon-download"></i>
                <span>导出数据</span>
              </button>
            </div>
          </div>
        </div>
        <!-- 数据分析区 -->
        <div class="bg-white shadow-sm rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-6">关键指标</h2>
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">专利总数</span>
                <span class="text-xl font-bold text-blue-600">12,458</span>
              </div>
              <div class="flex justify-between mt-2 text-sm">
                <span class="text-gray-500">同比</span>
                <span class="text-green-600">+15.6%</span>
              </div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">发明专利</span>
                <span class="text-xl font-bold text-green-600">8,742</span>
              </div>
              <div class="flex justify-between mt-2 text-sm">
                <span class="text-gray-500">占比</span>
                <span class="text-green-600">70.2%</span>
              </div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">实用新型</span>
                <span class="text-xl font-bold text-yellow-600">3,125</span>
              </div>
              <div class="flex justify-between mt-2 text-sm">
                <span class="text-gray-500">环比</span>
                <span class="text-red-600">-2.3%</span>
              </div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">外观设计</span>
                <span class="text-xl font-bold text-purple-600">591</span>
              </div>
              <div class="flex justify-between mt-2 text-sm">
                <span class="text-gray-500">同比</span>
                <span class="text-green-600">+8.4%</span>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <h3 class="text-md font-medium text-gray-700 mb-3">预警指标</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">专利到期预警</span>
                <span class="text-sm font-medium text-red-600">42件</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">年费缴纳预警</span>
                <span class="text-sm font-medium text-orange-500">128件</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">专利无效预警</span>
                <span class="text-sm font-medium text-yellow-600">15件</span>
              </div>
            </div>
          </div>
          <button class="!rounded-button whitespace-nowrap border border-blue-600 text-blue-600 w-full mt-6 py-2 text-sm flex items-center justify-center space-x-1">
            <i class="el-icon-setting"></i>
            <span>添加分析维度</span>
          </button>
        </div>
      </div>
      <!-- 个性化设置区 -->
      <div class="bg-white shadow-sm rounded-lg p-6 mt-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-800">个性化仪表板</h2>
          <button class="!rounded-button whitespace-nowrap bg-blue-600 text-white px-4 py-2 text-sm flex items-center space-x-1">
            <i class="el-icon-edit"></i>
            <span>编辑布局</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-40">
            <i class="el-icon-plus text-2xl text-gray-400"></i>
            <span class="text-sm text-gray-500 mt-2">拖拽组件到此处</span>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">热门申请人</span>
              <i class="el-icon-more text-gray-400"></i>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">华为技术有限公司</span>
                <span class="text-sm font-medium text-blue-600">2,458</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">腾讯科技</span>
                <span class="text-sm font-medium text-blue-600">1,872</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">阿里巴巴</span>
                <span class="text-sm font-medium text-blue-600">1,563</span>
              </div>
            </div>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">技术领域分布</span>
              <i class="el-icon-more text-gray-400"></i>
            </div>
            <div class="h-24 w-full" ref="pieChartContainer"></div>
          </div>
        </div>
      </div>
    </main>
<!--    &lt;!&ndash; 底部功能区 &ndash;&gt;-->
<!--    <footer class="bg-white border-t mt-auto py-4">-->
<!--      <div class="mx-auto max-w-7xl px-4 flex justify-between items-center">-->
<!--        <div class="text-sm text-gray-500">-->
<!--          © 2023 专利数据分析平台 - 所有权利保留-->
<!--        </div>-->
<!--        <div class="flex space-x-4">-->
<!--          <button class="text-sm text-gray-600 hover:text-blue-600">使用指南</button>-->
<!--          <button class="text-sm text-gray-600 hover:text-blue-600">快捷键</button>-->
<!--          <button class="text-sm text-gray-600 hover:text-blue-600">操作历史</button>-->
<!--          <button class="text-sm text-gray-600 hover:text-blue-600">反馈建议</button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </footer>-->
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
// 筛选数据
const selectedApplicants = ref([]);
const selectedPatentTypes = ref([]);
const currentChartType = ref('line');
const applicants = [
  { value: 'huawei', label: '华为技术有限公司' },
  { value: 'tencent', label: '腾讯科技' },
  { value: 'alibaba', label: '阿里巴巴' },
  { value: 'baidu', label: '百度' },
  { value: 'xiaomi', label: '小米科技' },
  { value: 'bytedance', label: '字节跳动' },
  { value: 'meituan', label: '美团' },
  { value: 'jd', label: '京东' },
];
const patentTypes = [
  { value: 'invention', label: '发明专利' },
  { value: 'utility', label: '实用新型' },
  { value: 'design', label: '外观设计' },
];
const chartTypes = [
  { value: 'line', label: '折线图' },
  { value: 'bar', label: '柱状图' },
  { value: 'pie', label: '饼图' },
];
// 图表实例
const chartContainer = ref<HTMLElement | null>(null);
const pieChartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let pieChartInstance: echarts.ECharts | null = null;
// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chartInstance = echarts.init(chartContainer.value);
    updateChart();
  }
  if (pieChartContainer.value) {
    pieChartInstance = echarts.init(pieChartContainer.value);
    updatePieChart();
  }
};
// 更新主图表
const updateChart = () => {
  if (!chartInstance) return;
  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['发明专利', '实用新型', '外观设计', 'PCT申请']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022', '2023'],
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '发明专利',
        type: currentChartType.value,
        data: [3200, 3320, 3010, 3340, 3900, 4300],
        itemStyle: {
          color: '#5470C6'
        },
        smooth: true
      },
      {
        name: '实用新型',
        type: currentChartType.value,
        data: [1200, 1320, 1010, 1340, 1900, 2300],
        itemStyle: {
          color: '#91CC75'
        },
        smooth: true
      },
      {
        name: '外观设计',
        type: currentChartType.value,
        data: [200, 320, 310, 340, 400, 500],
        itemStyle: {
          color: '#FAC858'
        },
        smooth: true
      },
      {
        name: 'PCT申请',
        type: currentChartType.value,
        data: [800, 932, 901, 934, 1290, 1330],
        itemStyle: {
          color: '#EE6666'
        },
        smooth: true
      }
    ]
  };
  chartInstance.setOption(option);
};
// 更新饼图
const updatePieChart = () => {
  if (!pieChartInstance) return;
  const option = {
    animation: false,
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#666'
      }
    },
    series: [
      {
        name: '技术领域',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '人工智能' },
          { value: 735, name: '5G通信' },
          { value: 580, name: '云计算' },
          { value: 484, name: '大数据' },
          { value: 300, name: '区块链' }
        ],
        color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']
      }
    ]
  };
  pieChartInstance.setOption(option);
};
// 监听图表类型变化
watch(currentChartType, () => {
  updateChart();
});
// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
  if (pieChartInstance) {
    pieChartInstance.resize();
  }
};
onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });
});
</script>
<style scoped>
/* 自定义样式 */
.bg-blue-50 {
  background-color: #f0f7ff;
}
.bg-green-50 {
  background-color: #f0f9eb;
}
.bg-yellow-50 {
  background-color: #fdf6ec;
}
.bg-purple-50 {
  background-color: #f9f0ff;
}
</style>
