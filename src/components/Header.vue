<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PocketBase from 'pocketbase';
import AddTaskModal from './AddTaskModal.vue';
import EditProjectModal from './EditProjectModal.vue';

const pb = new PocketBase('http://127.0.0.1:8090');
const router = useRouter();
const route = useRoute();

const user = ref(null);
const dropdownOpen = ref(false);
const dropdownRef = ref(null);
const showAddTaskModal = ref(false);
const showEditProjectModal = ref(false);
const isProjectOwner = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

const logout = () => {
  pb.authStore.clear();
  router.push('/');
};

const fetchUser = async () => {
  try {
    user.value = await pb.collection('users').getOne(pb.authStore.model.id);
  } catch (error) {
    console.error('Failed to fetch user', error);
  }
};

const fetchProjectOwner = async () => {
  if (route.params.id) {
    try {
      const project = await pb.collection('projects').getOne(route.params.id);
      isProjectOwner.value = project.owner === pb.authStore.model.id;
    } catch (error) {
      console.error('Failed to fetch project owner', error);
    }
  }
};

const createNewTask = () => {
  showAddTaskModal.value = true;
};

const closeAddTaskModal = () => {
  showAddTaskModal.value = false;
};

const editProject = () => {
  showEditProjectModal.value = true;
};

const closeEditProjectModal = () => {
  showEditProjectModal.value = false;
};

watch(() => route.params.id, (newId) => {
  fetchProjectOwner();
});

onMounted(() => {
  fetchUser();
  fetchProjectOwner();
  document.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<template>
  <header class="flex w-full items-center justify-between bg-gray-800 p-4">
    <h1 class="select-none text-2xl font-bold text-white">Tab[<span class="text-[#40c27b]">i</span>]ca</h1>
    <div class="flex items-center space-x-4">
      <button v-if="route.params.id" @click="createNewTask" class="px-4 py-2 text-white bg-[#40c27b] rounded hover:bg-[#2f8f5a]">Add New Task</button>
      <button v-if="isProjectOwner" @click="editProject" class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">Edit Project</button>
      <div class="relative" ref="dropdownRef">
        <button @click="toggleDropdown" class="flex items-center space-x-2 rounded p-2 hover:bg-gray-700">
          <img :src="user?.avatar ? `http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}` : 'https://via.placeholder.com/40'" alt="Avatar" class="h-10 w-10 rounded-full" />
          <span class="text-white">{{ user?.name || 'Account' }}</span>
        </button>
        <div v-if="dropdownOpen" class="w-50 absolute right-0 z-10 mt-2 rounded-md bg-white shadow-lg">
          <div class="p-4">
            <p class="font-bold text-gray-600">{{ user?.name }}</p>
            <p class="text-gray-500">{{ user?.email }}</p>
          </div>
          <div class="border-t border-gray-200"></div>
          <div class="p-4">
            <button @click="() => router.push('/account')" class="w-full rounded p-2 text-left text-gray-600 hover:bg-gray-100">
              Account Options
            </button>
            <button @click="logout" class="mt-2 w-full rounded p-2 text-left text-red-500 hover:bg-gray-100">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    <AddTaskModal v-if="showAddTaskModal" :showModal="showAddTaskModal" :projectId="route.params.id" @taskAdded="fetchUser" @close="closeAddTaskModal" />
    <EditProjectModal v-if="showEditProjectModal" :showModal="showEditProjectModal" :projectId="route.params.id" @projectUpdated="handleProjectUpdated" @close="closeEditProjectModal" />
  </header>
</template>