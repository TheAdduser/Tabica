<script setup>
import { ref, onMounted, watch } from 'vue';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

const props = defineProps({
  showModal: Boolean,
  onClose: Function,
  projectId: String,
});

const emit = defineEmits(['taskAdded']);
const taskName = ref('');
const taskPriority = ref('');
const taskAssignee = ref('');
const projectAssignees = ref([]);
const taskDescription = ref('');
const taskStatus = ref('');
const columns = ref([]);
const errorMessage = ref('');

const fetchProjectData = async () => {
  try {
    const project = await pb.collection('projects').getOne(props.projectId, {
      expand: 'column,assignee',
    });
    columns.value = (project.expand.column || []).sort((a, b) => a.columnOrder - b.columnOrder);
    projectAssignees.value = project.expand.assignee || [];
  } catch (error) {
    console.error('Failed to fetch project data', error);
    errorMessage.value = 'Failed to fetch project data';
  }
};

const addTask = async () => {
  try {
    const authorId = pb.authStore.model.id;
    const newTask = await pb.collection('tasks').create({
      name: taskName.value,
      priority: taskPriority.value,
      assignee: taskAssignee.value || authorId,
      description: taskDescription.value,
      statusId: taskStatus.value,
      projectId: props.projectId,
      author: authorId,
    });

    const taskColumn = columns.value.find(column => column.id === taskStatus.value);
    if (taskColumn) {
      taskColumn.task.push(newTask.id);
      await pb.collection('columns').update(taskColumn.id, { task: taskColumn.task });
    }

    emit('taskAdded');
    props.onClose();
  } catch (error) {
    console.error('Failed to add task', error);
    errorMessage.value = 'Failed to add task';
  }
};

watch(() => props.projectId, (newProjectId) => {
  if (newProjectId) {
    fetchProjectData();
  }
}, { immediate: true });

onMounted(() => {
  if (props.projectId) {
    fetchProjectData();
  }
});
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
    <div class="w-full max-w-md rounded bg-gray-600 p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-bold text-white">Add New Task</h2>
      <div v-if="errorMessage" class="mb-4 p-2 text-red-600 bg-red-100 rounded">
        {{ errorMessage }}
      </div>
      <div class="mb-4">
        <label for="taskName" class="mb-2 block text-sm font-bold text-white">Task Name</label>
        <input v-model="taskName" type="text" id="taskName" class="w-full rounded border px-3 py-2 text-white" required />
      </div>
      <div class="mb-4">
        <label for="taskPriority" class="mb-2 block text-sm font-bold text-white">Priority</label>
        <select v-model="taskPriority" id="taskPriority" class="w-full rounded border bg-gray-600 px-3 py-2 text-white" required>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskAssignee" class="mb-2 block text-sm font-bold text-white">Assigned User</label>
        <select v-model="taskAssignee" id="taskAssignee" class="w-full rounded border bg-gray-600 px-3 py-2 text-white" required>
          <option v-for="user in projectAssignees" :key="user.id" :value="user.id" class="text-white">{{ user.name }}</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskStatus" class="mb-2 block text-sm font-bold text-white">Status</label>
        <select v-model="taskStatus" id="taskStatus" class="w-full rounded border bg-gray-600 px-3 py-2 text-white" required>
          <option v-for="column in columns" :key="column.id" :value="column.id" class="text-white">{{ column.name }}</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskDescription" class="mb-2 block text-sm font-bold text-white">Description</label>
        <textarea v-model="taskDescription" id="taskDescription" class="w-full rounded border px-3 py-2 text-white"></textarea>
      </div>
      <div class="flex justify-end space-x-2">
        <button @click="addTask" class="px-2 py-2 text-white bg-[#40c27b] rounded hover:bg-[#2f8f5a]">Add Task</button>
        <button @click="props.onClose" class="px-2 py-2 text-white bg-gray-400 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
</template>