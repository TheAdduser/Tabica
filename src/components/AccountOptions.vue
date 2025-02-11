<script setup>
import { ref } from 'vue';
import PocketBase from 'pocketbase';
import { useRouter } from 'vue-router';

const pb = new PocketBase('http://127.0.0.1:8090');
const router = useRouter();

const user = ref(pb.authStore.model);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const avatarFile = ref(null);
const name = ref(user.value.name);

const updatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  try {
    await pb.collection('users').update(user.value.id, {
      oldPassword: currentPassword.value,
      password: newPassword.value,
      passwordConfirm: confirmPassword.value,
    });
    successMessage.value = 'Password updated successfully';
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = 'Failed to update password';
    successMessage.value = '';
  }
};

const handleFileChange = (event) => {
  avatarFile.value = event.target.files[0];
};

const handleDrop = (event) => {
  event.preventDefault();
  avatarFile.value = event.dataTransfer.files[0];
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const updateAvatar = async () => {
  if (!avatarFile.value) {
    errorMessage.value = 'Please select an avatar file';
    return;
  }

  const formData = new FormData();
  formData.append('avatar', avatarFile.value);

  try {
    await pb.collection('users').update(user.value.id, formData);
    successMessage.value = 'Avatar updated successfully';
    errorMessage.value = '';
    user.value = await pb.collection('users').getOne(pb.authStore.model.id);
  } catch (error) {
    errorMessage.value = 'Failed to update avatar';
    successMessage.value = '';
  }
};

const updateProfile = async () => {
  try {
    await pb.collection('users').update(user.value.id, {
      name: name.value,
    });
    successMessage.value = 'Profile updated successfully';
    errorMessage.value = '';
    user.value = await pb.collection('users').getOne(pb.authStore.model.id);
  } catch (error) {
    errorMessage.value = 'Failed to update profile';
    successMessage.value = '';
  }
};

const goToHub = () => {
  router.push('/hub');
};
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-900">
    <div class="w-full max-w-md space-y-6 rounded bg-gray-800 p-8 shadow-md">
      <h2 class="text-center text-2xl font-bold text-white">Account Options</h2>
      <div v-if="errorMessage" class="rounded bg-red-100 p-2 text-red-600">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="rounded bg-green-100 p-2 text-green-600">
        {{ successMessage }}
      </div>
      <div class="space-y-4">
        <div>
          <label for="name" class="mb-2 block text-sm font-bold text-gray-300">Name</label>
          <input v-model="name" type="text" id="name" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" />
        </div>
        <button @click="updateProfile" class="w-full cursor-pointer rounded bg-[#40c27b] px-4 py-2 font-bold text-white transition duration-500 hover:scale-105 hover:bg-[#2f8f5a]">
          Update Profile
        </button>
        <div>
          <label class="mb-2 block text-sm font-bold text-gray-300">Avatar</label>
          <div
            class="w-full rounded border-2 border-dashed border-gray-500 bg-gray-700 p-4 text-center text-white"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @click="$refs.fileInput.click()"
          >
            <input type="file" class="hidden" @change="handleFileChange" ref="fileInput" />
            <p v-if="!avatarFile">Drag and drop an avatar image here, or click to select a file</p>
            <p v-else>{{ avatarFile.name }}</p>
          </div>
          <button @click="updateAvatar" class="mt-4 w-full cursor-pointer rounded bg-[#40c27b] px-4 py-2 font-bold text-white transition duration-500 hover:scale-105 hover:bg-[#2f8f5a]">
            Update Avatar
          </button>
        </div>
        <div>
          <label for="currentPassword" class="mb-2 block text-sm font-bold text-gray-300">Current Password</label>
          <input v-model="currentPassword" type="password" id="currentPassword" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" />
        </div>
        <div>
          <label for="newPassword" class="mb-2 block text-sm font-bold text-gray-300">New Password</label>
          <input v-model="newPassword" type="password" id="newPassword" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" />
        </div>
        <div>
          <label for="confirmPassword" class="mb-2 block text-sm font-bold text-gray-300">Confirm New Password</label>
          <input v-model="confirmPassword" type="password" id="confirmPassword" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" />
        </div>
        <button @click="updatePassword" class="w-full cursor-pointer rounded bg-[#40c27b] px-4 py-2 font-bold text-white transition duration-500 hover:scale-105 hover:bg-[#2f8f5a]">
          Update Password
        </button>
        <button @click="goToHub" class="mt-4 w-full cursor-pointer rounded bg-gray-500 px-4 py-2 font-bold text-white transition duration-500 hover:scale-105 hover:bg-gray-700">
          Back to Hub
        </button>
      </div>
    </div>
  </div>
</template>