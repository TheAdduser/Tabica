<script setup>
import { ref, onMounted } from 'vue';
import PocketBase from 'pocketbase';
import Header from './Header.vue';
import Modal from './Modal.vue';
import { useRouter } from 'vue-router';

const pb = new PocketBase('http://127.0.0.1:8090');
const router = useRouter();

const projects = ref([]);
const newProjectName = ref('');
const errorMessage = ref('');
const showModal = ref(false);
const projectToDelete = ref(null);

const fetchProjects = async () => {
  try {
    projects.value = await pb.collection('projects').getFullList({
    });
  } catch (error) {
    errorMessage.value = 'Failed to fetch projects';
  }
};

const createProject = async () => {
  if (!newProjectName.value) {
    errorMessage.value = 'Project name is required';
    return;
  }

  try {
    const newProject = await pb.collection('projects').create({
      name: newProjectName.value,
      owner: pb.authStore.model.id,
      assignee: pb.authStore.model.id
    });

    newProjectName.value = '';
    fetchProjects();
  } catch (error) {
    errorMessage.value = 'Failed to create project';
  }
};

const confirmDeleteProject = (project) => {
  projectToDelete.value = project;
  showModal.value = true;
};

const deleteProject = async () => {
  try {
    await pb.collection('projects').delete(projectToDelete.value.id);
    showModal.value = false;
    fetchProjects();
  } catch (error) {
    errorMessage.value = 'Failed to delete project';
  }
};

async function cancelModal() {
  try {
    showModal.value = false;
  } catch (error) {
    errorMessage.value = 'failed to cancel modal';
  }
}

const navigateToHub = (projectId) => {
  router.push(`/hub/${projectId}`);
};

onMounted(() => {
  fetchProjects();
});
</script>

<template>
  <div>
    <Header />
    <div class="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <div class="w-full max-w-2xl flex-row space-y-6 rounded bg-gray-800 p-8 shadow-md">
        <h2 class="text-center text-2xl font-bold text-white">Projects</h2>
        <div v-if="errorMessage" class="rounded bg-red-100 p-2 text-red-600">
          {{ errorMessage }}
        </div>
        <ul class="space-y-2">
          <li v-for="project in projects" :key="project.id" class="float-left flex w-full items-center justify-between rounded border-black bg-gray-700 p-2 text-white">
            <div class="w-full rounded border-black bg-gray-600 p-2 text-2xl font-bold">
              <router-link :to="'/hub/' + project.id">
                <div class="break-all">{{ project.name }}</div>
              </router-link>
            </div>
            <button @click="confirmDeleteProject(project)" class="float-right ml-4 max-h-12 rounded bg-red-500 px-4 py-2 text-xl font-bold text-white hover:bg-red-700">
              Delete
            </button>
          </li>
        </ul>
        <form @submit.prevent="createProject" class="space-y-4">
          <div>
            <label for="newProjectName" class="mb-2 block text-sm font-bold text-gray-300">New Project Name</label>
            <input v-model="newProjectName" type="text" id="newProjectName" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" required />
          </div>
          <button type="submit" class="rounded bg-[#40c27b] px-4 py-2 font-bold text-white hover:bg-[#2f8f5a]">
            Create Project
          </button>
        </form>
      </div>
    </div>
    <Modal
      :show="showModal"
      title="Delete Project"
      message="Are you sure you want to delete this project?"
      @confirm="deleteProject"
      @cancel="cancelModal"
    />
  </div>
</template>