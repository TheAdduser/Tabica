<script setup>
import { ref, watch } from 'vue';
import PocketBase from 'pocketbase';
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
      expand: 'column.task.assignee',
    });
    console.log(project);
    columns.value = project.expand.column.sort((a, b) => a.columnOrder - b.columnOrder);
    tasks.value = project.expand.column.flatMap(column => column.expand.task);
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
}, { immediate: true });

</script>

<template>
  <div class="p-3">
    <div v-if="errorMessage" class="rounded bg-red-100 p-2 text-red-600">
      {{ errorMessage }}
    </div>
    <div class="max-w-[calc(100vw)] space-x-4">
      <div class="flex min-h-[calc(100vh-2rem)]" v-if="columns.length != 0">
        <div
          v-for="column in columns"
          :key="column.id"
          class="min-w-44 max-w-44 m-2 rounded-lg bg-gray-800 p-4 shadow-md"
        >
          <h3 class="text-xl font-bold text-white">{{ column.name }}</h3>
          <div class="mt-4 space-y-2">
            <div
              v-for="task in column.expand.task"
              :key="task.id"
              class="min-h-30 relative cursor-pointer rounded-lg bg-gray-700 p-2 font-bold text-white hover:bg-gray-600"
              @click="showTaskModal(task)"
            >
              {{ task.name }}

              <img v-if="task.expand.assignee" :src="pb.files.getURL(task.expand.assignee, task.expand.assignee.avatar)" alt="Avatar" class="absolute bottom-2 left-2 h-8 w-8 rounded-full" />
  
              <div class="absolute bottom-2 right-2 flex items-center space-x-2">
                <i v-if="task.priority === 'Low'" class="fas fa-arrow-down text-blue-500"></i>
                <i v-if="task.priority === 'Medium'" class="fas fa-equals text-yellow-500"></i>
                <i v-if="task.priority === 'High'" class="fas fa-arrow-up text-red-500"></i>     
              </div>
            </div>
          </div>
        </div>
        <div class="w-full"> </div>
      </div>
    </div>

    <TaskDetailsModal v-if="showModal" :task="selectedTask" @taskUpdated="handleTaskUpdated" :showModal="showModal" :projectId="projectId" :onClose="closeTaskModal" />
  </div>
</template>