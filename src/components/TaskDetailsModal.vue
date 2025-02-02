<script setup>
import { ref, watch } from 'vue';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const props = defineProps({
  task: Object,
  showModal: Boolean,
  onClose: Function,
  projectId: String,
});

const emit = defineEmits(['taskUpdated']);
const taskName = ref('');
const taskAuthor = ref('');
const taskPriority = ref('');
const taskAssignee = ref('');
const projectAssignees = ref([]);
const taskDescription = ref('');
const taskStatus = ref('');
const columns = ref([]);
const isProjectOwner = ref(false);

const fetchColumns = async () => {
  try {
    const project = await pb.collection('projects').getOne(props.projectId, {
      expand: 'column',
    });
    columns.value = (project.expand.column || []).sort((a, b) => a.columnOrder - b.columnOrder);
    isProjectOwner.value = project.owner === pb.authStore.model.id;
  } catch (error) {
    console.error('Failed to fetch columns', error);
  }
};

const fetchTaskDetails = async (Task) => {
  if (Task) {
    const author = await pb.collection('users').getOne(Task.author);
    const project = await pb.collection('projects').getOne(props.projectId, {     
      expand: 'assignee',
    });
    projectAssignees.value = project.expand.assignee || [];
    taskName.value = Task.name;
    taskAuthor.value = author.name;
    taskPriority.value = Task.priority;
    taskAssignee.value = Task.expand.assignee.id;
    taskDescription.value = Task.description;

    const column = columns.value.find(col => col.task.includes(Task.id));
    if (column) {
      taskStatus.value = column.id;
    }
  }
};

watch(
  () => props.task,
  async (Task) => {
    if (Task) {
      await fetchColumns();
      await fetchTaskDetails(Task);
    }
  },
  { immediate: true }
);

const updateTask = async () => {
  try {
    await pb.collection('tasks').update(props.task.id, {
      name: taskName.value,
      priority: taskPriority.value,
      assignee: taskAssignee.value,
      description: taskDescription.value,
    });

    const currentColumn = columns.value.find(col => col.task.includes(props.task.id));
    const newColumn = columns.value.find(col => col.id === taskStatus.value);

    if (currentColumn && newColumn && currentColumn.id !== newColumn.id) {
      currentColumn.task = currentColumn.task.filter(taskId => taskId !== props.task.id);
      await pb.collection('columns').update(currentColumn.id, { task: currentColumn.task });

      newColumn.task.push(props.task.id);
      await pb.collection('columns').update(newColumn.id, { task: newColumn.task });
    }

    emit('taskUpdated');
    props.onClose();
  } catch (error) {
    console.error('Failed to update task', error);
  }
};

const deleteTask = async () => {
  try {
    await pb.collection('tasks').delete(props.task.id);

    const currentColumn = columns.value.find(col => col.task.includes(props.task.id));
    if (currentColumn) {
      currentColumn.task = currentColumn.task.filter(taskId => taskId !== props.task.id);
      await pb.collection('columns').update(currentColumn.id, { task: currentColumn.task });
    }

    emit('taskUpdated');
    props.onClose();
  } catch (error) {
    console.error('Failed to delete task', error);
  }
};
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
    <div class="w-full max-w-md rounded bg-gray-600 p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-bold text-white">Task Details</h2>
      <div class="mb-4">
        <label for="taskName" class="mb-2 block text-sm font-bold text-white">Task Name</label>
        <input v-model="taskName" type="text" id="taskName" class="w-full rounded border px-3 py-2 text-white" />
      </div>
      <div class="mb-4">
        <label for="taskAuthor" class="mb-2 block text-sm font-bold text-white">Author</label>
        <input v-model="taskAuthor" type="text" id="taskAuthor" class="w-full rounded border px-3 py-2 text-white" disabled />
      </div>
      <div class="mb-4">
        <label for="taskPriority" class="mb-2 block text-sm font-bold text-white">Priority</label>
        <select v-model="taskPriority" id="taskPriority" class="w-full rounded border bg-gray-600 px-3 py-2 text-white">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskAssignee" class="mb-2 block text-sm font-bold text-white">Assigned User</label>
        <select v-model="taskAssignee" id="taskAssignee" class="w-full rounded border bg-gray-600 px-3 py-2 text-white">
          <option v-for="user in projectAssignees" :key="user.id" :value="user.id" class="text-white">{{ user.name }}</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskStatus" class="mb-2 block text-sm font-bold text-white">Status</label>
        <select v-model="taskStatus" id="taskStatus" class="w-full rounded border bg-gray-600 px-3 py-2 text-white">
          <option v-for="column in columns" :key="column.id" :value="column.id" class="text-white">{{ column.name }}</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskDescription" class="mb-2 block text-sm font-bold text-white">Description</label>
        <textarea v-model="taskDescription" id="taskDescription" class="w-full rounded border px-3 py-2 text-white"></textarea>
      </div>
      <div class="flex justify-end space-x-4">
        <button v-if="isProjectOwner" @click="deleteTask" class="px-4 py-2 text-white bg-red-700 rounded hover:bg-red-800">Delete Task</button>
        <button @click="updateTask" class="px-4 py-2 text-white bg-[#40c27b] rounded hover:bg-[#2f8f5a]">Update Task</button>
        <button @click="props.onClose" class="px-4 py-2 text-white bg-gray-400 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
</template>