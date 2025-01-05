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
    columns.value = await pb.collection('projects').getOne(props.projectId,{
      expand: 'column.task',
      sort: 'expand.column.columnOrder',
    });

    console.log('Fetched columns:', columns.value);
  }
  catch (error) {
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
  if (typeof(props.projectId) !== 'undefined') {
    fetchData();
  }
});

</script>

<template>
    <div class="space-x-4 mt-4 max-w-[calc(100vw-2rem)] pl-5">
       <div class="flex flex-row gap-6 min-h-[calc(100vh-2rem)] " v-if="columns.length!=0">
        <div
          v-for="column in columns.expand.column"
          :key="column"
          class="p-4 bg-gray-800 rounded-lg shadow-md min-w-64 max-w-64"
        >
          <h3 class="text-xl font-bold text-white">{{ column.name }}</h3>
          <div class="space-y-2 mt-4">
            <div
              v-for="task in column.expand.task"
              :key="task"
              class="p-2 bg-gray-700 rounded-lg text-white min-h-30 font-bold hover:cursor-pointer hover:bg-gray-600"
              @click="showTaskModal(task)"
            >
              {{ task.name }}

              <!-- 
              priority if else with 3 icons
              assigne with avatar if empty leave empty
              if clicked on task show modal with task details
              -->
            </div>
          
          </div>
        </div>
      </div>
      <TaskDetailsModal v-if="showModal" :task="selectedTask" @taskUpdated="handleTaskUpdated":showModal="showModal" :onClose="closeTaskModal" /> 
  </div>
</template>