<template>
  <el-card class="!rounded-button">
    <template #header>
      <div class="flex justify-between items-center">
        <span>专利申请趋势</span>
        <el-select v-model="timeRange" placeholder="时间范围" class="w-32">
          <el-option label="近一周" value="week"/>
          <el-option label="近一月" value="month"/>
          <el-option label="近一年" value="year"/>
        </el-select>
      </div>
    </template>
    <div ref="chartRef" class="h-80"></div>
  </el-card>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();
const timeRange = ref('month');
let chartInstance: echarts.ECharts;

const initChart = () => {
  chartInstance = echarts.init(chartRef.value!);
  chartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [25, 35, 45, 35, 55, 75],
      type: 'line',
      smooth: true
    }]
  });
};

onMounted(initChart);
watch(timeRange, initChart);
</script>