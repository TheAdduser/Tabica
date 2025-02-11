<script setup>
import { ref, onMounted } from 'vue';
import PocketBase from 'pocketbase';
import eventBus from '../eventBus';

const pb = new PocketBase('http://127.0.0.1:8090');
const props = defineProps({
  showModal: Boolean,
  onClose: Function,
  projectId: String,
});

const emit = defineEmits(['refreshSidebar', 'refreshKanban']);
const projectName = ref('');
const newColumnName = ref('');
const newAssigneeId = ref('');
const columns = ref([]);
const assignees = ref([]);
const projectAssignees = ref([]);
const errorMessage = ref('');
const showConfirmation = ref(false);
const projectOwner = ref('');

const fetchProjectData = async () => {
  try {
    const project = await pb.collection('projects').getOne(props.projectId, {
      expand: 'column,assignee,column.task',
    });
    projectName.value = project.name;
    columns.value = project.expand.column || [];
    projectAssignees.value = project.expand.assignee || [];
    projectOwner.value = project.owner;
    const allUsers = await pb.collection('users').getFullList();
    assignees.value = allUsers.filter(user => !projectAssignees.value.some(assignee => assignee.id === user.id));
  } catch (error) {
    console.error('Failed to fetch project data', error);
    errorMessage.value = 'Failed to fetch project data';
  }
};

const changeProjectName = async () => {
  try {
    await pb.collection('projects').update(props.projectId, {
      name: projectName.value,
    });
    eventBus.emit('refreshSidebar');
    eventBus.emit('refreshKanban');
    props.onClose();
  } catch (error) {
    console.error('Failed to change the name', error);
    errorMessage.value = 'Failed to change the name';
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
    eventBus.emit('refreshKanban');
    fetchProjectData();
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
      eventBus.emit('refreshKanban');
      fetchProjectData();
    }
  } catch (error) {
    console.error('Failed to add assignee', error);
    errorMessage.value = 'Failed to add assignee';
  }
};

const removeAssignee = async (assigneeId) => {
  if (assigneeId === projectOwner.value) {
    errorMessage.value = 'The owner cannot be removed from the project';
    return;
  }

  try {
    projectAssignees.value = projectAssignees.value.filter(assignee => assignee.id !== assigneeId);

    await pb.collection('projects').update(props.projectId, {
      assignee: projectAssignees.value.map(assignee => assignee.id),
    });

    eventBus.emit('refreshKanban');
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
    eventBus.emit('refreshKanban');
  } catch (error) {
    console.error('Failed to update column order', error);
    errorMessage.value = 'Failed to update column order';
  }
};

const removeColumn = async (index) => {
  const column = columns.value[index];
  if (column.expand.task && column.expand.task.length > 0) {
    errorMessage.value = 'Please remove all tasks from the column before deleting it.';
    return;
  }

  try {
    await pb.collection('columns').delete(column.id);
    columns.value.splice(index, 1);
    await updateColumnOrder();
    eventBus.emit('refreshKanban');
    fetchProjectData();
  } catch (error) {
    console.error('Failed to remove column', error);
    errorMessage.value = 'Failed to remove column';
  }
};

const renameColumn = async (index, newName) => {
  if (!newName) {
    errorMessage.value = 'Column name cannot be empty';
    return;
  }

  try {
    await pb.collection('columns').update(columns.value[index].id, {
      name: newName,
    });
    columns.value[index].name = newName;
    eventBus.emit('refreshKanban');
    fetchProjectData();
  } catch (error) {
    console.error('Failed to rename column', error);
    errorMessage.value = 'Failed to rename column';
  }
};

const removeProject = async () => {
  try {
    for (const column of columns.value) {
      if (column.expand.task) {
        for (const task of column.expand.task) {
          await pb.collection('tasks').delete(task.id);
        }
      }
      await pb.collection('columns').delete(column.id);
    }

    await pb.collection('projects').delete(props.projectId);
    eventBus.emit('refreshSidebar');
    eventBus.emit('refreshKanban');
    props.onClose();
  } catch (error) {
    console.error('Failed to remove project', error);
    errorMessage.value = 'Failed to remove project';
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
    <div class="w-full max-w-2xl rounded bg-gray-600 p-6 shadow-md">
      <h2 class="mb-4 text-2xl font-bold text-white">Edit Project</h2>
      <div v-if="errorMessage" class="mb-4 rounded bg-red-100 p-2 text-red-600">
        {{ errorMessage }}
      </div>
      <div class="mb-4">
        <label for="projectName" class="mb-2 block text-sm font-bold text-white">Project Name</label>
        <input v-model="projectName" type="text" id="projectName" class="w-full rounded border px-3 py-2 text-white" />
        <button @click="changeProjectName" class="mt-2 rounded bg-blue-500 px-4 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-blue-700">Change Name</button>
      </div>
      <div class="mb-4">
        <label for="newColumnName" class="mb-2 block text-sm font-bold text-white">Add New Column</label>
        <input v-model="newColumnName" type="text" id="newColumnName" class="w-full rounded border px-3 py-2 text-white" />
        <button @click="addColumn" class="mt-2 rounded bg-blue-500 px-4 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-blue-700">Add Column</button>
      </div>
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold text-white">Columns</h3>
        <ul>
          <li v-for="(column, index) in columns" :key="column.id" class="flex items-center justify-between text-white">
            <input v-model="column.name" type="text" class="w-2/3 px-2 py-1 text-white" />
            <div>
              <button @click="moveColumnUp(index)" title="Move column up" class="text-blue-500 transition duration-500 cursor-pointer hover:scale-105 hover:text-blue-700">
                <i class="fas fa-arrow-up" title="Move column up"></i>
              </button>
              <button @click="moveColumnDown(index)" title="Move column down" class="ml-2 text-blue-500 transition duration-500 cursor-pointer hover:scale-105 hover:text-blue-700">
                <i class="fas fa-arrow-down" title="Move column down"></i>
              </button>
              <button @click="renameColumn(index, column.name)" class="ml-2 text-green-500 transition duration-500 cursor-pointer hover:scale-105 hover:text-green-700">
                <i class="fas fa-pen" title="Rename column"></i>
              </button>
              <button @click="removeColumn(index)" class="ml-2 text-red-500 transition duration-500 cursor-pointer hover:scale-105 hover:text-red-700">
                <i class="fas fa-trash" title="Remove column"></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
      <div class="mb-4">
        <label for="newAssignee" class="mb-2 block text-sm font-bold text-white">Add Assignee</label>
        <select v-model="newAssigneeId" id="newAssignee" class="w-full rounded border bg-gray-600 px-3 py-2 text-white">
          <option v-for="user in assignees" :key="user.id" :value="user.id" class="text-white">{{ user.name }}</option>
        </select>
        <button @click="addAssignee" class="mt-2 rounded bg-blue-500 px-4 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-blue-700">Add Assignee</button>
      </div>
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-bold text-white">Assignees</h3>
        <ul>
          <li v-for="assignee in projectAssignees" :key="assignee.id" class="flex justify-between text-white">
            {{ assignee.name }}
            <button v-if="assignee.id !== projectOwner.value" @click="removeAssignee(assignee.id)" class="text-red-500 transition duration-500 cursor-pointer hover:scale-105 hover:text-red-700">
              <i class="fas fa-trash" title="Remove assignee"></i>
            </button>
          </li>
        </ul>
      </div>
      <div class="flex space-x-2">
        <button @click="showConfirmation = true" class="rounded bg-red-500 px-2 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-red-600">Delete Project</button>
        <button @click="props.onClose" class="ml-auto rounded-xl text-background bg-[#40c27b] px-2 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-[#2f8f5a]">Done</button>
      </div>
      <div v-if="showConfirmation" class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
        <div class="w-full max-w-md rounded bg-gray-600 p-6 shadow-md">
          <h2 class="mb-4 text-2xl font-bold text-white">Confirm Deletion</h2>
          <p class="mb-4 text-white">Are you sure you want to delete this project? This action cannot be undone.</p>
          <div class="flex justify-end space-x-2">
            <button @click="removeProject" class="rounded bg-red-500 px-2 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-red-600">Delete</button>
            <button @click="showConfirmation = false" class="rounded bg-gray-400 px-2 py-2 text-white transition duration-500 cursor-pointer hover:scale-105 hover:bg-gray-500">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>