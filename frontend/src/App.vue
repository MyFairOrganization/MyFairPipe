<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

const router = useRouter()

router.push('/home')
</script>

<template>
  <nav
    class="fixed top-0 left-0 w-full bg-white text-black py-10 px-8 text-lg z-[9999] text-center"
  >
    <div class="flex flex-row gap-[20px]">
      <RouterLink to="/home">MyFairPipe</RouterLink>
      <RouterLink to="/home">Home</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </div>
  </nav>

  <div class="flex flex-col h-screen min-h-screen">
    <div class="w-full py-12"></div>

    <main class="max-w-[1280px] mx-auto my-0 p-8 font-normal grow">
      <RouterView />
    </main>

    <footer class="w-full bg-white text-black py-10 text-lg">
      <h2 class="pl-8">MyFairPipe</h2>
    </footer>
  </div>
</template>
