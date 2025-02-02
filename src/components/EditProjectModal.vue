<script setup>
import { ref, onMounted, computed } from 'vue';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const props = defineProps({
  showModal: Boolean,
  onClose: Function,
  projectId: String,
});

const emit = defineEmits(['projectUpdated', 'columnAdded']);
const projectName = ref('');
const newColumnName = ref('');
const newAssigneeId = ref('');
const searchAssignee = ref('');
const columns = ref([]);
const assignees = ref([]);
const projectAssignees = ref([]);
const errorMessage = ref('');

const fetchProjectData = async () => {
  try {
    const project = await pb.collection('projects').getOne(props.projectId, {
      expand: 'column,assignee',
    });
    projectName.value = project.name;
    columns.value = project.expand.column || [];
    projectAssignees.value = project.expand.assignee || [];
    const allUsers = await pb.collection('users').getFullList();
    assignees.value = allUsers.filter(user => !projectAssignees.value.some(assignee => assignee.id === user.id));
  } catch (error) {
    console.error('Failed to fetch project data', error);
    errorMessage.value = 'Failed to fetch project data';
  }
};

const filteredAssignees = computed(() => {
  return assignees.value.filter(user => user.name.toLowerCase().includes(searchAssignee.value.toLowerCase()));
});

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
    emit('columnAdded');
  } catch (error) {
    console.error('Failed to add column', error);
    errorMessage.value = 'Failed to add column';
  }
};

const addAssignee = async () => {
  if (!newAssigneeId.value) {
    errorMessage.value = 'Assignee cannot be empty';
    return;
  }

  try {
    const newAssignee = assignees.value.find(user => user.id === newAssigneeId.value);
    if (newAssignee) {
      projectAssignees.value.push(newAssignee);
      await pb.collection('projects').update(props.projectId, {
        assignee: projectAssignees.value.map(assignee => assignee.id),
      });
      newAssigneeId.value = '';
      fetchProjectData();
    }
  } catch (error) {
    console.error('Failed to add assignee', error);
    errorMessage.value = 'Failed to add assignee';
  }
};

const removeAssignee = async (assigneeId) => {
  try {
    projectAssignees.value = projectAssignees.value.filter(assignee => assignee.id !== assigneeId);

    await pb.collection('projects').update(props.projectId, {
      assignee: projectAssignees.value.map(assignee => assignee.id),
    });

    fetchProjectData();
  } catch (error) {
    console.error('Failed to remove assignee', error);
    errorMessage.value = 'Failed to remove assignee';
  }
};

const moveColumnUp = async (index) => {
  if (index === 0) return;
  const temp = columns.value[index];
  columns.value[index] = columns.value[index - 1];
  columns.value[index - 1] = temp;
  await updateColumnOrder();
};

const moveColumnDown = async (index) => {
  if (index === columns.value.length - 1) return;
  const temp = columns.value[index];
  columns.value[index] = columns.value[index + 1];
  columns.value[index + 1] = temp;
  await updateColumnOrder();
};

const updateColumnOrder = async () => {
  try {
    for (let i = 0; i < columns.value.length; i++) {
      columns.value[i].columnOrder = i + 1;
      await pb.collection('columns').update(columns.value[i].id, {
        columnOrder: columns.value[i].columnOrder,
      });
    }
    await pb.collection('projects').update(props.projectId, {
      column: columns.value.map(col => col.id),
    });
    emit('projectUpdated');
  } catch (error) {
    console.error('Failed to update column order', error);
    errorMessage.value = 'Failed to update column order';
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
          <li v-for="(column, index) in columns" :key="column.id" class="flex items-center justify-between text-white">
            <span>{{ column.name }}</span>
            <div>
              <button @click="moveColumnUp(index)" class="text-blue-500 hover:text-blue-700">Up</button>
              <button @click="moveColumnDown(index)" class="ml-2 text-blue-500 hover:text-blue-700">Down</button>
            </div>
          </li>
        </ul>
      </div>
      <div class="mb-4">
        <label for="newAssignee" class="mb-2 block text-sm font-bold text-white">Add Assignee</label>
        <select v-model="newAssigneeId" id="newAssignee" class="w-full rounded border bg-gray-600 px-3 py-2 text-white">
          <option v-for="user in filteredAssignees" :key="user.id" :value="user.id" class="text-white">{{ user.name }}</option>
        </select>
        <button @click="addAssignee" class="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">Add Assignee</button>
      </div>
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold text-white">Assignees</h3>
        <ul>
          <li v-for="assignee in projectAssignees" :key="assignee.id" class="flex justify-between text-white">
            {{ assignee.name }}
            <button @click="removeAssignee(assignee.id)" class="text-red-500 hover:text-red-700">Remove</button>
          </li>
        </ul>
      </div>
      <div class="flex justify-end">
        <button @click="updateProject" class="px-4 py-2 text-white bg-[#40c27b] rounded hover:bg-[#2f8f5a]">Update Project</button>
        <button @click="props.onClose" class="ml-2 px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600">Cancel</button>
      </div>
    </div>
  </div>
</template>