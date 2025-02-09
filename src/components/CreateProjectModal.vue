<script setup>
import { ref } from 'vue';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const props = defineProps({
  showModal: Boolean,
  onClose: Function,
});

const emit = defineEmits(['projectCreated']);
const projectName = ref('');
const errorMessage = ref('');

const createProject = async () => {
  if (!projectName.value) {
    errorMessage.value = 'Project name cannot be empty';
    return;
  }

  try {
    const newProject = await pb.collection('projects').create({
      name: projectName.value,
      owner: pb.authStore.model.id,
      assignee: [pb.authStore.model.id],
    });

    const defaultColumns = ['Backlog', 'In Progress', 'Code Review','Ready For Testing','In Testing','Deployed on DEV', 'Deployed on UAT','Ready for Deployment', 'Deployed on PROD'];
    const columnIds = [];
    for (let i = 0; i < defaultColumns.length; i++) {
      const newColumn = await pb.collection('columns').create({
        name: defaultColumns[i],
        columnOrder: i + 1,
      });
      columnIds.push(newColumn.id);
    }

    await pb.collection('projects').update(newProject.id, {
      column: columnIds,
    });

    projectName.value = '';
    emit('projectCreated', newProject);
    props.onClose();
  } catch (error) {
    console.error('Failed to create project', error);
    errorMessage.value = 'Failed to create project';
  }
};
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
    <div class="w-full max-w-md rounded bg-gray-600 p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-bold text-white">Create New Project</h2>
      <div v-if="errorMessage" class="mb-4 rounded bg-red-100 p-2 text-red-600">
        {{ errorMessage }}
      </div>
      <div class="mb-4">
        <label for="projectName" class="mb-2 block text-sm font-bold text-white">Project Name</label>
        <input v-model="projectName" type="text" id="projectName" class="w-full rounded border px-3 py-2 text-white" />
      </div>
      <div class="flex justify-end space-x-2">
        <button @click="createProject" class="rounded bg-[#40c27b] px-2 py-2 text-white hover:bg-[#2f8f5a]">Create Project</button>
        <button @click="props.onClose" class="rounded bg-gray-400 px-2 py-2 text-white hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
</template>