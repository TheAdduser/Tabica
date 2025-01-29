<script setup>

const props = defineProps({
  show: Boolean,
  title: String,
  message: String,
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-md rounded bg-gray-800 p-6 shadow-md">
      <h2 class="mb-4 text-xl font-bold text-white">{{ title }}</h2>
      <p class="mb-4 text-white">{{ message }}</p>
      <div class="flex justify-end space-x-4">
        <button @click="handleCancel" class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">Cancel</button>
        <button @click="handleConfirm" class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">Delete</button>
      </div>
    </div>
  </div>
</template>