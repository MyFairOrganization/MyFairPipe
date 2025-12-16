<script setup lang="ts">
    import { ref } from 'vue';
    import { useRouter } from 'vue-router'

    const email = ref('');
    const username = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const errorMessage = ref('');
    const router = useRouter();

    const register = () => {
    if (!email.value || !password.value || !confirmPassword.value) {
        errorMessage.value = 'Please fill all fields';
        return;
    }
    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
    }
    registerApi(email.value, password.value, username.value);
    errorMessage.value = '';

    };
    async function registerApi(email: string, password: string, username: string) {
      const url = "http://localhost:3000/auth/register";

      try {
        const response = await fetch(url,
          {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "user_email": email,
                "username": username,
                "password": password
              }
            )
          });
        if (!response.ok) {
          errorMessage.value = 'Error: ' + response.status;
        }

        const result = await response.json();
        console.log(result);
        // router.push('/home');
      } catch (error: any) {
        console.error(error.message);
      }
    }
</script>

<template>
    <div class="register-container">
        <h2>Create New Account</h2>
        <form @submit.prevent="register">
        <div>
            <label for="username">Username:</label>
            <input id="username" v-model="username" type="text" placeholder="Username" />
        </div>
        <div>
            <label for="email">E-Mail:</label>
            <input id="email" v-model="email" type="email" placeholder="E-Mail" />
        </div>
        <div>
            <label for="password">Password:</label>
            <input id="password" v-model="password" type="password" placeholder="Password" />
        </div>
        <div>
            <label for="confirmPassword">Repeat Password:</label>
            <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="Repeat" />
        </div>
        <div v-if="errorMessage" style="color: red">{{ errorMessage }}</div>
        <button type="submit">Sign in</button>
        </form>
    </div>
</template>

<style scoped>
    .register-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: white;
    }

    .register-container div {
    margin-bottom: 1rem;
    }

    .register-container label {
    display: block;
    margin-bottom: 0.5rem;
    }

    .register-container input {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
    }

    button {
    padding: 0.5rem 1rem;
    background-color: #293241;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    }

    button:hover {
    background-color: #1f2833;
    }
</style>
