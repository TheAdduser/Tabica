<script setup>
import { ref, watch} from 'vue';
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
let projectAssignee = ref([]);
const taskDescription = ref('');

watch(
  () => props.task,
  async (Task) => {
    if (Task) {
      const author = await pb.collection('users').getOne(Task.author);
      projectAssignee = await pb.collection('projects').getOne(props.projectId, {     
      expand: 'assignee',
      });
      taskName.value = Task.name;
      taskAuthor.value = author.name;
      taskPriority.value = Task.priority;
      taskAssignee.value = Task.expand.assignee.id;
      taskDescription.value = Task.description;
    }
    console.log(projectAssignee);
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
    emit('taskUpdated');
    props.onClose();
  } catch (error) {
    console.error('Failed to update task', error);
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
        <select v-model="taskAssignee" id="taskAssignee" placeholder="test" class="w-full rounded border bg-gray-600 px-3 py-2 text-white">
          <option v-for="user in projectAssignee.expand.assignee" :key="user.id" :value="user.id" class="text-white">{{ user.name }}</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="taskDescription" class="mb-2 block text-sm font-bold text-white">Description</label>
        <textarea v-model="taskDescription" id="taskDescription" class="w-full rounded border px-3 py-2 text-white"></textarea>
      </div>
      <div class="flex justify-end space-x-4">
        <button @click="props.onClose" class="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">Cancel</button>
        <button @click="updateTask" class="rounded bg-[#40c27b] px-4 py-2 text-white hover:bg-[#2f8f5a]">Update Task</button>
      </div>
    </div>
  </div>
</template>