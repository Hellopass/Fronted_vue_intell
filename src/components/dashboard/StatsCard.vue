<template>
  <el-card class="!rounded-button">
    <div class="flex items-center">
      <el-icon :class="iconClass" class="text-2xl">
        <component :is="icon"/>
      </el-icon>
      <div class="ml-4">
        <div class="text-sm text-gray-600">{{ label }}</div>
        <div class="text-2xl font-semibold mt-1">{{ value }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
  iconClass: String
});
</script>