<!- 用户端-->
<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebaruser @update:activeModule="activeModule = $event"/>
    <main class="ml-64 min-h-screen">
      <div class="sticky top-0 z-50">
        <Header/>
      </div>
      <div class="p-6">
        <!--        需要显示的模块-->
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">

import Sidebar from '../components/home/Sidebar.vue';
import Header from '../components/home/Header.vue';
import Dashboard from "./dashboard/dashboard.vue";
import {ref} from "vue"
import Sidebaruser from './home/Sidebaruser.vue';

const activeModule = ref('dashboard')
</script>