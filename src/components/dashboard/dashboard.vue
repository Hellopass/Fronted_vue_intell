<script setup>

import RecentActivities from "./RecentActivities.vue";
import StatsCard from "./StatsCard.vue";
import TrendChart from "../home/TrendChart.vue";
import DistributionChart from "./DistributionChart.vue";
import {onMounted, ref} from "vue";
import axios from "../../axios/axios";
const statistics = ref([]);

const recentActivities = ref([
  {type: '专利', name: '一种基于机器学习的图像识别方法', status: '审核中', date: '2024-01-15 14:30'},
  {type: '著作', name: '智能办公软件系统V2.0', status: '已授权', date: '2024-01-14 09:15'},
  {type: '商标', name: 'TechFlow商标注册', status: '已提交', date: '2024-01-13 16:45'},
  {type: '专利', name: '新型环保材料制备工艺', status: '已授权', date: '2024-01-12 11:20'},
  {type: '著作', name: '数据分析平台开发文档', status: '审核中', date: '2024-01-11 15:40'}
]);

const fetchData = async () => {
  try {
    const response = await axios.get('/statistics/get_all');
    const data = response.data.data;
    statistics.value.push( 
      {label: '专利总数', value: data.patent_count, icon: 'Document', iconClass: 'text-blue-500'},
     {label: '著作权数', value: data.article_count, icon: 'Notebook', iconClass: 'text-green-500'},
     {label: '商标数量', value:data.trademark_count, icon: 'PriceTag', iconClass: 'text-yellow-500'},
     {label: '待审批', value: data.pending_approval, icon: 'Bell', iconClass: 'text-red-500'})
    
  } catch (error) {
    console.error('数据获取失败:', error);
  }
};
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="grid grid-cols-4 gap-6 mb-6">
    <StatsCard
        v-for="(stat, index) in statistics"
        :key="index"
        :label="stat.label"
        :value="stat.value"
        :icon="stat.icon"
        :icon-class="stat.iconClass"
    />
  </div>

  <div class="grid grid-cols-2 gap-6 mb-6">
    <TrendChart/>
    <DistributionChart/>
  </div>

  <!-- <RecentActivities :activities="recentActivities"/> -->
</template>

<style scoped>

</style>