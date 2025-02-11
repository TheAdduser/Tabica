<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import PocketBase from 'pocketbase';
import { useRouter, useRoute } from 'vue-router';
import CreateProjectModal from './CreateProjectModal.vue';
import EditProjectModal from "./EditProjectModal.vue";
import eventBus from '../eventBus';

const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);
const router = useRouter();
const route = useRoute();

const projects = ref([]);
const errorMessage = ref('');
const selectedProjectId = ref(route.params.id);
const showCreateProjectModal = ref(false);

const fetchProjects = async () => {
  try {
    projects.value = await pb.collection('projects').getFullList();
  } catch (error) {
    console.error('Failed to fetch projects', error);
    errorMessage.value = 'Failed to fetch projects';
  }
};

const navigateToProjectHub = (projectId) => {
  router.push(`/hub/${projectId}`);
  selectedProjectId.value = projectId;
};

const navigateToHub = () => {
  router.push('/hub');
};

const handleProjectCreated = (newProject) => {
  fetchProjects();
  navigateToProjectHub(newProject.id);
};

const handleProjectDeleted = () => {
  fetchProjects();
  navigateToHub();
};

watch(() => route.params.id, (newId) => {
  selectedProjectId.value = newId;
  fetchProjects();
}, { immediate: true });

onMounted(() => {
  fetchProjects();
  eventBus.on('refreshSidebar', handleProjectDeleted);
});

onBeforeUnmount(() => {
  eventBus.off('refreshSidebar', handleProjectDeleted);
});
</script>

<template>
  <div class="min-w-44 h-full min-h-screen bg-gray-700 p-4">
    <h2 class="mb-4 select-none text-xl font-bold text-white">Projects</h2>
    <div v-if="errorMessage" class="rounded bg-red-100 p-2 text-red-600">
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
    <div class="mt-4">
      <button @click="showCreateProjectModal = true" class="hover:bg-[#2f8f5a]transition w-full cursor-pointer rounded bg-[#40c27b] px-4 py-2 text-white duration-500 hover:scale-105">Create New Project</button>
    </div>
    <CreateProjectModal v-if="showCreateProjectModal" :showModal="showCreateProjectModal" @projectCreated="handleProjectCreated" @close="() => showCreateProjectModal = false" />
  </div>
</template>