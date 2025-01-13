<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const router = useRouter();

const user = ref(null);
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

const logout = () => {
  pb.authStore.clear();
  router.push('/');
};

const fetchUser = async () => {
  try {
    user.value = await pb.collection('users').getOne(pb.authStore.model.id);
  } catch (error) {
    console.error('Failed to fetch user', error);
  }
};

onMounted(() => {
  fetchUser();
  document.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<template>
  <header class="flex w-full items-center justify-between bg-gray-800 p-4">
    <h1 class="select-none text-2xl font-bold text-white">Tab[<span class="text-[#40c27b]">i</span>]ca</h1>
    <div class="relative" ref="dropdownRef">
      <button @click="toggleDropdown" class="flex items-center space-x-2 rounded p-2 hover:bg-gray-700">
        <img :src="user?.avatar ? `http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}` : 'https://via.placeholder.com/40'" alt="Avatar" class="h-10 w-10 rounded-full" />
        <span class="text-white">{{ user?.name || 'Account' }}</span>
      </button>
      <div v-if="dropdownOpen" class="w-50 absolute right-0 z-10 mt-2 rounded-md bg-white shadow-lg">
        <div class="p-4">
          <p class="font-bold text-gray-600">{{ user?.name }}</p>
          <p class="text-gray-500">{{ user?.email }}</p>
        </div>
        <div class="border-t border-gray-200"></div>
        <div class="p-4">
          <button @click="() => router.push('/account')" class="w-full rounded p-2 text-left text-gray-600 hover:bg-gray-100">
            Account Options
          </button>
          <button @click="logout" class="mt-2 w-full rounded p-2 text-left text-red-500 hover:bg-gray-100">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>