<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <main class="mx-auto max-w-6xl">
      <!-- 两列布局 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 专利申请趋势 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">年度申请趋势</h3>
          <div class="h-64" ref="trendChart"></div>
        </div>

        <!-- 专利类型分布 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">类型占比分析</h3>
          <div class="h-64" ref="typeChart"></div>
        </div>

        <!-- 申请人排名 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">申请人 TOP10</h3>
          <div class="h-96" ref="applicantChart"></div>
        </div>

        <!-- 技术领域分布 -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">技术领域分布</h3>
          <div class="h-96" ref="techChart"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue'
import * as echarts from 'echarts'

// 专利申请趋势数据
const trendData = ref([
  {year: '2019', count: 2458},
  {year: '2020', count: 3120},
  {year: '2021', count: 3980},
  {year: '2022', count: 4015},
  {year: '2023', count: 4580}
])

// 专利类型分布数据
const typeData = ref([
  {name: '发明专利', value: 6543},
  {name: '实用新型', value: 2890},
  {name: '外观设计', value: 1234}
])

// 申请人TOP10数据
const applicantData = ref([
  {name: '华为技术', count: 2458},
  {name: '国家电网', count: 1892},
  {name: '腾讯科技', count: 1785},
  {name: '浙江大学', count: 1563},
  {name: 'OPPO', count: 1421},
  {name: '京东方', count: 1325},
  {name: '清华大学', count: 1254},
  {name: '阿里巴巴', count: 1189},
  {name: '中科院', count: 1124},
  {name: '比亚迪', count: 1048}
])

// 技术领域数据
const techData = ref([
  {name: '人工智能', value: 2458},
  {name: '5G通信', value: 1892},
  {name: '新能源', value: 1785},
  {name: '半导体', value: 1563},
  {name: '物联网', value: 1421}
])

// 图表实例
const trendChart = ref<HTMLElement | null>(null)
const typeChart = ref<HTMLElement | null>(null)
const applicantChart = ref<HTMLElement | null>(null)
const techChart = ref<HTMLElement | null>(null)

// 初始化所有图表
onMounted(() => {
  // 申请趋势（折线图）
  initChart(trendChart.value, {
    xAxis: {
      type: 'category',
      data: trendData.value.map(d => d.year),
      axisLabel: {color: '#666'}
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        formatter: '{value}件'
      }
    },
    series: [{
      data: trendData.value.map(d => d.count),
      type: 'line',
      smooth: true,
      areaStyle: {color: '#bfdbfe'},
      itemStyle: {color: '#3b82f6'}
    }]
  })

  // 类型分布（饼图）
  initChart(typeChart.value, {
    tooltip: {formatter: '{b}: {d}%'},
    series: [{
      type: 'pie',
      radius: '65%',
      data: typeData.value,
      label: {color: '#666'},
      color: ['#3b82f6', '#10b981', '#f59e0b']
    }]
  })

  // 申请人排名（横向条形图）
  initChart(applicantChart.value, {
    tooltip: {formatter: '{b}: {c}件'},
    xAxis: {type: 'value'},
    yAxis: {
      type: 'category',
      data: applicantData.value.map(d => d.name),
      axisLabel: {color: '#666'}
    },
    series: [{
      type: 'bar',
      data: applicantData.value.map(d => d.count),
      itemStyle: {color: '#3b82f6'}
    }]
  })

  // 技术分布（柱状图）
  initChart(techChart.value, {
    tooltip: {formatter: '{b}: {c}件'},
    xAxis: {
      type: 'category',
      data: techData.value.map(d => d.name),
      axisLabel: {
        rotate: 45,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#666',
        formatter: '{value}件'
      }
    },
    series: [{
      type: 'bar',
      data: techData.value.map(d => d.value),
      itemStyle: {color: '#10b981'}
    }]
  })
})

// 通用图表初始化方法
const initChart = (element: HTMLElement | null, option: echarts.EChartsOption) => {
  if (!element) return
  const chart = echarts.init(element)
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}
</script>

<style scoped>
/* 统一图表容器高度 */
.h-64 {
  height: 20rem;
}

.h-96 {
  height: 24rem;
}
</style>