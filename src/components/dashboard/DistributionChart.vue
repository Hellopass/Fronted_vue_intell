<template>
  <el-card class="!rounded-button">
    <template #header>
      <div class="flex justify-between items-center">
        <span>知识产权类型分布</span>
      </div>
    </template>
    <div ref="chartRef" class="h-80"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts;

onMounted(() => {
  chartInstance = echarts.init(chartRef.value!);
  chartInstance.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'bottom'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: [
        { value: 328, name: '专利' },
        { value: 156, name: '著作权' },
        { value: 89, name: '商标' }
      ],
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  });
});
</script>