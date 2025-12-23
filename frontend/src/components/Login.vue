<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

function goToRegister() {
  router.push('/register');
}

const login = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill all fields';
    return;
  }

  try {
    const response = await fetch('http://api.myfairpipe.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // <-- sehr wichtig, damit Cookies gespeichert werden
      body: JSON.stringify({
        user_email: email.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      errorMessage.value = data.error || 'Login failed';
      return;
    }

    // Login erfolgreich, Cookie wird automatisch gespeichert
    // router.push('/home');
  } catch (err) {
    console.error('Login error:', err);
    errorMessage.value = 'Server error. Please try again.';
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="title">Sign in</h1>
      <form class="form" @submit.prevent="login">
        <label class="label" for="email">E-Mail:</label>
        <input
          id="email"
          v-model.trim="email"
          autocomplete="email"
          class="input"
          placeholder="E-Mail"
          type="email"
        />

        <label class="label" for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          autocomplete="current-password"
          class="input"
          placeholder="Password"
          type="password"
        />

        <p @click="goToRegister">Don't have an account? Register here</p>

        <button class="btn" type="submit">Sign in</button>
        <div v-if="errorMessage" style="color: red; margin-top: 10px">
          {{ errorMessage }}
        </div>
      </form>
  </div>
</template>

<style scoped>
.page {
  background-color: #e0fbfc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 3rem;
}

.card {
  max-width: 400px;
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
}

.title {
  font-size: 28px;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 14px;
}

.input::placeholder {
  color: #9aa4b2;
}

.btn {
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  background-color: #293241;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #1f2833;
}

p {
  margin-top: 0.5rem;
  color: #1f2833;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 520px) {
  .page {
    padding-top: 2rem;
  }

  .card {
    padding: 1.5rem;
  }
}
</style>
