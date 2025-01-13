<script setup>
import { ref } from 'vue';
import PocketBase from 'pocketbase';
import { useRouter } from 'vue-router';

const pb = new PocketBase('http://127.0.0.1:8090');
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const errorMessage = ref('');

const defaultAvatarUrl = new URL('../assets/default-avatar.png', import.meta.url).href; 

const register = async () => {
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  try {
    // Fetch the default avatar file
    const response = await fetch(defaultAvatarUrl);
    const blob = await response.blob();
    const file = new File([blob], 'default-avatar.png', { type: blob.type });

    // Create a FormData object
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('password', password.value);
    formData.append('passwordConfirm', password.value);
    formData.append('avatar', file);

    // Create the user with the FormData object
    await pb.collection('users').create(formData);
    errorMessage.value = '';
    router.push('/login');
  } catch (error) {
    errorMessage.value = 'Registration failed';
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-900">
    <div class="w-full max-w-md space-y-6 rounded bg-gray-800 p-8 shadow-md">
      <h1 class="text-center text-4xl font-bold text-white">Tab[<span class="text-[#40c27b]">i</span>]ca</h1>
      <h2 class="text-center text-2xl font-bold text-white">Register</h2>
      <div v-if="errorMessage" class="rounded bg-red-100 p-2 text-red-600">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="register">
        <div class="mb-4">
          <label for="name" class="mb-2 block text-sm font-bold text-gray-300">Name</label>
          <input v-model="name" type="text" id="name" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" required />
        </div>
        <div class="mb-4">
          <label for="email" class="mb-2 block text-sm font-bold text-gray-300">Email</label>
          <input v-model="email" type="email" id="email" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" required />
        </div>
        <div class="mb-4">
          <label for="password" class="mb-2 block text-sm font-bold text-gray-300">Password</label>
          <input v-model="password" type="password" id="password" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" required />
        </div>
        <div class="mb-6">
          <label for="passwordConfirm" class="mb-2 block text-sm font-bold text-gray-300">Confirm Password</label>
          <input v-model="passwordConfirm" type="password" id="passwordConfirm" class="w-full rounded border-black bg-gray-700 px-3 py-2 text-white" required />
        </div>
        <div class="flex items-center justify-between">
          <button type="submit" class="rounded bg-[#40c27b] px-4 py-2 font-bold text-white hover:bg-[#2f8f5a]">
            Register
          </button>
          <span class="text-sm text-white">Already have an account? <router-link to="/login" class="text-blue-500 hover:underline">Login</router-link></span>
          
        </div>
      </form>
    </div>
  </div>
</template>