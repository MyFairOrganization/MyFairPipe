<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const router = useRouter()

const register = () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Bitte alle Felder ausfüllen'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwörter stimmen nicht überein'
    return
  }
  console.log('Register:', { email: email.value, password: password.value })
  errorMessage.value = ''
}

localStorage.setItem(
  'user',
  JSON.stringify({
    email: email.value,
    password: password.value,
  }),
)

function home() {
  router.push('/home')
}
</script>

<template>
  <div class="max-w-[400px] mx-auto mt-8 p-8 border border-gray-300 rounded-lg bg-white">
    <h2 class="text-2xl font-semibold mb-4 text-center">Create New Account</h2>

    <form @submit.prevent="register" class="flex flex-col gap-4">
      <div>
        <label for="email" class="block mb-2 font-medium">E-Mail:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="E-Mail"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div>
        <label for="password" class="block mb-2 font-medium">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div>
        <label for="confirmPassword" class="block mb-2 font-medium">Repeat Password:</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Repeat"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div v-if="errorMessage" class="text-red-600">
        {{ errorMessage }}
      </div>

      <button
        type="submit"
        @click="home()"
        class="p-2 bg-[#293241] text-white rounded hover:bg-[#1f2833] transition"
      >
        Sign in
      </button>
    </form>
  </div>
</template>
