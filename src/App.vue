<script setup>
import PocketBase from 'pocketbase';
import { ref } from 'vue';
import router from './router';
import Footer from './components/Footer.vue';
import { RouterView } from 'vue-router';

const pb = new PocketBase('http://127.0.0.1:8090');
const isLogged = ref(pb.authStore.isValid);

if (isLogged.value) {
  router.push('/hub')
}
else {
  router.push('/login')
}
</script>


<template>
  <div class="flex min-h-screen flex-col">
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
