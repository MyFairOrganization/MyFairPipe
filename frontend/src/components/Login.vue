<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref<string>('')
const password = ref<string>('')

function register() {
  router.push({ name: 'register' })
}
function home() {
  router.push('/home')
}
</script>

<template>
  <div class="bg-[#e0fbfc] flex justify-center items-start pt-12 md:pt-12">
    <div
      class="max-w-[400px] w-full mx-auto my-8 p-8 md:p-8 border border-gray-300 rounded-lg bg-white shadow-none"
    >
      <h1 class="text-[28px] leading-tight mb-6 font-semibold text-gray-900">Sign in</h1>

      <form class="flex flex-col" method="POST" @submit.prevent>
        <label for="email" class="block mb-2 text-[15px] font-semibold text-gray-600">
          E-Mail:
        </label>
        <input
          id="email"
          type="email"
          v-model.trim="email"
          placeholder="E-Mail"
          autocomplete="email"
          class="w-full p-2 pr-60 border border-gray-300 rounded mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <label for="password" class="block mb-2 text-[15px] font-semibold text-gray-600">
          Password:
        </label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="Password"
          autocomplete="current-password"
          class="w-full p-2 pr-60 border border-gray-300 rounded mb-4 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <p @click="register" class="mt-2 text-gray-800 text-sm cursor-pointer underline">
          Don't have an Account?
        </p>

        <button
          type="button"
          @click="home"
          class="p-2 mt-3 bg-[#293241] text-white rounded hover:bg-[#1f2833] transition"
        >
          Sign in
        </button>
      </form>
    </div>
  </div>
</template>
