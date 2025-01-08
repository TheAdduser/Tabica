<script setup>
import { ref, onMounted, watch } from 'vue';
import PocketBase from 'pocketbase';
import { useRouter, useRoute } from 'vue-router';

const pb = new PocketBase('http://127.0.0.1:8090');
const router = useRouter();
const route = useRoute();

const projects = ref([]);
const errorMessage = ref('');
const selectedProjectId = ref(route.params.id);

const fetchProjects = async () => {
  try {
    projects.value = await pb.collection('projects').getFullList();
  } catch (error) {
    errorMessage.value = 'Failed to fetch projects';
  }
};

const navigateToProjectHub = (projectId) => {
  router.push(`/hub/${projectId}`);
  selectedProjectId.value = projectId;
};

watch(() => route.params.id, (newId) => {
  selectedProjectId.value = newId;
});

onMounted(() => {
  fetchProjects();
});
</script>

<template>
  <div class="min-w-44 bg-gray-700 p-4 h-full min-h-screen">
    <h2 class="text-xl font-bold text-white mb-4 select-none">Projects</h2>
    <div v-if="errorMessage" class="p-2 text-red-600 bg-red-100 rounded">
      {{ errorMessage }}
    </div>
    <ul class="space-y-2">
      <li
        v-for="project in projects"
        :key="project.id"
        :class="{
          'bg-gray-600': project.id === selectedProjectId,
          'hover:bg-gray-600': project.id !== selectedProjectId,
          'p-2 rounded cursor-pointer truncate': true,
          'text-white': true
        }"
        @click="navigateToProjectHub(project.id)"
      >
        {{ project.name }}
      </li>
    </ul>
  </div>
</template>