<script setup>
import { ref, watch, defineProps } from 'vue';
import PocketBase from 'pocketbase';


const pb = new PocketBase('http://127.0.0.1:8090');
const props = defineProps({
  task: Object,
  showModal: Boolean,
  onClose: Function,
});

const taskName = ref('');
const taskAuthor = ref('');
const taskPriority = ref('low');
const taskAssignee = ref('');
const taskDescription = ref('');

watch(() => props.task, (Task) => {
  if (Task) {
    taskName.value = Task.name 
    taskAuthor.value = //pb.collection('users').getOne(Task.author).name
    taskPriority.value = Task.priority
    taskAssignee.value = Task.assignee//pb.collection('users').getOne(Task.assignee).name
    taskDescription.value = Task.description 
    console.log('Task:', Task.name);
  }
}, { immediate: true });

</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-600 p-6 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl text-white font-bold mb-4">Task Details</h2>
      <div class="mb-4">
        <label for="taskName" class="block mb-2 text-sm font-bold text-white
        ">Task Name</label>
        <input v-model="taskName" type="text" id="taskName" class="w-full text-white px-3 py-2 border rounded" />
      </div>
      <div class="mb-4">
        <label for="taskAuthor" class="block mb-2 text-sm font-bold text-white">Author</label>
        <input v-model="taskAuthor" type="text" id="taskAuthor" class="w-full text-white px-3 py-2 border rounded"/>
      </div>
      <div class="mb-4">
        <label for="taskPriority" class="block mb-2 text-sm font-bold text-white">Priority</label>
        <select v-model="taskPriority" id="taskPriority" class="w-full text-white px-3 py-2 border rounded bg-gray-600">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskAssignedUser" class="block mb-2 text-sm font-bold text-white">Assigned User</label>
        <input v-model="taskAssignee" type="text" id="taskAssignedUser" class="w-full text-white px-3 py-2 border rounded"/>
      </div>
      <div class="mb-4">
        <label for="taskDescription" class="block mb-2 text-sm font-bold text-white">Description</label>
        <textarea v-model="taskDescription" id="taskDescription" class="w-full text-white px-3 py-2 border rounded"></textarea>
      </div>
      <div class="flex justify-end space-x-4">
        <button @click="onClose" class="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-300">Close</button>
      </div>
    </div>
  </div>
</template>