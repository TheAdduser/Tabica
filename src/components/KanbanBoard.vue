<script setup>
import { ref, watch } from 'vue';
import PocketBase from 'pocketbase';
import { defineProps } from 'vue';
import TaskDetailsModal from './TaskDetailsModal.vue';

const pb = new PocketBase('http://127.0.0.1:8090');

const props = defineProps({
  projectId: String,
});
const columns = ref([]);
const tasks = ref([]);
const errorMessage = ref('');
const showModal = ref(false);
const selectedTask = ref(null);

const fetchData = async () => {
  try {
    const project = await pb.collection('projects').getOne(props.projectId, {
      expand: 'column.task',
    });

    columns.value = project.expand.column.sort((a, b) => a.columnOrder - b.columnOrder);
    tasks.value = project.expand.column.flatMap(column => column.expand.task);
    console.log('Fetched columns:', columns.value);
  } catch (error) {
    errorMessage.value = 'Failed to fetch columns';
  }
};

const showTaskModal = (task) => {
  selectedTask.value = task;
  showModal.value = true;
};

const closeTaskModal = () => {
  showModal.value = false;
  selectedTask.value = null;
};

const handleTaskUpdated = () => {
  fetchData();
};

watch(() => props.projectId, () => {
  if (typeof props.projectId !== 'undefined') {
    fetchData();
  }
});

</script>

<template>
  <div class="p-5">
    <div v-if="errorMessage" class="p-2 text-red-600 bg-red-100 rounded">
      {{ errorMessage }}
    </div>
    <div class="space-x-4 max-w-[calc(100vw)]">
      <div class="flex gap-6 min-h-[calc(100vh-2rem)]" v-if="columns.length != 0">
        <div
          v-for="column in columns"
          :key="column.id"
          class="p-4 bg-gray-800 rounded-lg shadow-md min-w-44 max-w-44"
        >
          <h3 class="text-xl font-bold text-white">{{ column.name }}</h3>
          <div class="space-y-2 mt-4">
            <div
              v-for="task in column.expand.task"
              :key="task.id"
              class="relative p-2 bg-gray-700 rounded-lg text-white min-h-30 font-bold cursor-pointer"
              @click="showTaskModal(task)"
            >
              {{ task.name }}
              <div class="absolute bottom-2 right-2 flex items-center space-x-2">
                <i v-if="task.priority === 'Low'" class="fas fa-arrow-down text-green-500"></i>
                <i v-if="task.priority === 'Medium'" class="fas fa-equals text-yellow-500"></i>
                <i v-if="task.priority === 'High'" class="fas fa-arrow-up text-red-500"></i>
                <img v-if="task.assignedUser" :src="`http://127.0.0.1:8090/api/files/users/${task.assignedUser.id}/${task.assignedUser.avatar}`" alt="Avatar" class="w-6 h-6 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TaskDetailsModal v-if="showModal" :task="selectedTask" @taskUpdated="handleTaskUpdated" :showModal="showModal" :onClose="closeTaskModal" />
  </div>
</template>