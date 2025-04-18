<template>
  <!-- 费用输入表单 -->
  <el-form label-width="120px">
    <!-- 专利类型选择 -->


    <el-form-item label="年费区间" prop="yearRange" required>
      <el-select
          v-model="form.yearRange"
          placeholder="请选择年费区间"
          :disabled="!form.patentType"
      >
        <el-option
            v-for="range in yearRanges"
            :key="range.value"
            :label="range.label"
            :value="range.value"
        />
      </el-select>
    </el-form-item>

    <!-- 自动显示金额 -->
    <el-form-item label="应缴金额" prop="amount">
      <el-input
          v-model="form.amount"
          placeholder="自动计算金额"
          readonly
      >
        <template #append>元</template>
      </el-input>
    </el-form-item>
  </el-form>

</template>

<script setup>
import {ref, reactive, watch, onMounted} from 'vue'

const props = defineProps({
  patentType: {  // 修复 prop 名称拼写
    type: String,
    required: true,
    validator: value => ['invention', 'utility'].includes(value)
  }
})

// 年费标准数据结构
const feeStandard = {
  invention: [
    {range: '1-3年', amount: 900},
    {range: '4-6年', amount: 1200},
    {range: '7-9年', amount: 2000},
    {range: '10-12年', amount: 4000},
    {range: '13-15年', amount: 6000},
    {range: '16-20年', amount: 8000}
  ],
  utility: [
    {range: '1-3年', amount: 600},
    {range: '4-5年', amount: 900},
    {range: '6-8年', amount: 1200},
    {range: '9-10年', amount: 2000}
  ]
}

const form = reactive({
  patentType: props.patentType, // 从 prop 初始化
  yearRange: '',
  amount: ''
})

const yearRanges = ref([])

// 初始化加载年费选项
const loadYearRanges = () => {
  form.yearRange = ''
  form.amount = ''
  yearRanges.value = feeStandard[form.patentType].map(item => ({
    value: item.range,
    label: `${item.range}`
  }))
}

// 监听父组件传入的专利类型变化
watch(() => props.patentType, (newVal) => {
  form.patentType = newVal
  loadYearRanges()
})

// 初始化执行
onMounted(() => {
  loadYearRanges()
})
const Emits = defineEmits(['submit']);

const GetAmount = () => {
  Emits('submit',form.amount)
}


// 监听年份区间选择
watch(() => form.yearRange, (newVal) => {
  if (newVal && form.patentType) {
    const selected = feeStandard[form.patentType].find(
        item => item.range === newVal
    )
    form.amount = selected ? selected.amount : ''
    GetAmount()
  }
})
</script>