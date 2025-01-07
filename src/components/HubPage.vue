<script setup>
import Header from './Header.vue';
import SideBar from './SideBar.vue';
import KanbanBoard from './KanbanBoard.vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectId = ref(route.params.id);

watch(() => route.params.id, (newId) => {
  projectId.value = newId;
}, { immediate: true });
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-900">
    <Header class=" top-0 z-10" />
    <div class="flex flex-1">
      <SideBar class="sticky left-0 top-0 h-screen z-10" />
      <div class="flex-1 relative">
        <div class="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div class="flex flex-col min-h-full">
            <div v-if="projectId" class="flex-1">
              <KanbanBoard :projectId="projectId" />
            </div>
            <div v-else class="flex items-center justify-center w-full h-full pt-50 text-white font-bold">
              <p>Please choose a project from the sidebar to proceed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>