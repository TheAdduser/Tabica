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
  <div class="flex min-h-screen flex-col bg-gray-900">
    <Header class="top-0 z-10" />
    <div class="flex flex-1">
      <SideBar class="sticky left-0 top-0 z-10 h-screen" />
      <div class="relative flex-1">
        <div class="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div class="flex min-h-full flex-col">
            <div v-if="projectId" class="flex-1">
              <KanbanBoard :projectId="projectId" />
            </div>
            <div v-else class="pt-50 flex h-full w-full items-center justify-center font-bold text-white">
              <p>Please choose a project from the sidebar to proceed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>