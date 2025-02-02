<script setup>
import { ref, onMounted } from 'vue';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const props = defineProps({
  showModal: Boolean,
  onClose: Function,
  projectId: String,
});

const emit = defineEmits(['projectUpdated']);
const projectName = ref('');
const projectDescription = ref('');
const newColumnName = ref('');
const columns = ref([]);
const errorMessage = ref('');

const fetchProjectData = async () => {
  try {
    const project = await pb.collection('projects').getOne(props.projectId, {
      expand: 'column',
    });
    projectName.value = project.name;
    columns.value = project.expand.column || [];
  } catch (error) {
    console.error('Failed to fetch project data', error);
    errorMessage.value = 'Failed to fetch project data';
  }
};

const updateProject = async () => {
  try {
    await pb.collection('projects').update(props.projectId, {
      name: projectName.value,
    });
    emit('projectUpdated');
    props.onClose();
  } catch (error) {
    console.error('Failed to update project', error);
    errorMessage.value = 'Failed to update project';
  }
};

const addColumn = async () => {
  if (!newColumnName.value) {
    errorMessage.value = 'Column name cannot be empty';
    return;
  }

  try {
    const columnOrder = columns.value.length + 1;
    const newColumn = await pb.collection('columns').create({
      name: newColumnName.value,
      columnOrder: columnOrder,
    });
    columns.value.push(newColumn);

    await pb.collection('projects').update(props.projectId, {
      column: columns.value.map(col => col.id),
    });

    newColumnName.value = '';
    emit('projectUpdated');
  } catch (error) {
    console.error('Failed to add column', error);
    errorMessage.value = 'Failed to add column';
  }
};

onMounted(() => {
  if (props.projectId) {
    fetchProjectData();
  }
});
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
    <div class="w-full max-w-md rounded bg-gray-600 p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-bold text-white">Edit Project</h2>
      <div v-if="errorMessage" class="mb-4 p-2 text-red-600 bg-red-100 rounded">
        {{ errorMessage }}
      </div>
      <div class="mb-4">
        <label for="projectName" class="mb-2 block text-sm font-bold text-white">Project Name</label>
        <input v-model="projectName" type="text" id="projectName" class="w-full rounded border px-3 py-2 text-white" />
      </div>
      <div class="mb-4">
        <label for="newColumnName" class="mb-2 block text-sm font-bold text-white">Add New Column</label>
        <input v-model="newColumnName" type="text" id="newColumnName" class="w-full rounded border px-3 py-2 text-white" />
        <button @click="addColumn" class="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">Add Column</button>
      </div>
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold text-white">Columns</h3>
        <ul>
          <li v-for="column in columns" :key="column.id" class="text-white">{{ column.name }}</li>
        </ul>
      </div>
      <div class="flex justify-end">
        <button @click="updateProject" class="px-4 py-2 text-white bg-[#40c27b] rounded hover:bg-[#2f8f5a]">Update Project</button>
        <button @click="props.onClose" class="ml-2 px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600">Cancel</button>
      </div>
    </div>
  </div>
</template>