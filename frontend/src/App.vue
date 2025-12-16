<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()

router.push('/home');
</script>

<template>
  <div>
    <nav class="header">
      <div class="row">
        <RouterLink to="/home">MyFairPipe</RouterLink>
        <div class="searchbar">
          <input type="text" placeholder="Search...">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016
            9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5
            4.99L20.49 19l-4.99-5zM10 15a5 5 0 110-10 5 5 0 010 10z"/></svg>
      </div>
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/user">User</RouterLink>
      </div>
    </nav>
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
  </div>
</template>
