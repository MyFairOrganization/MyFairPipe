<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router'

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

  function registerApi(email: string, password: string, username: string) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://api.myfairpipe.com/auth/register', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          try {
            router.push('/login');
          } catch (e: any) {
            errorMessage.value = 'Invalid response from server';
          }
        } else {
          errorMessage.value = JSON.parse(xhr.responseText).error;
          console.error('Request failed with status', xhr.status);
        }
      }
    };

    const body = JSON.stringify({
      user_email: email,
      username: username,
      password: password
    });

    xhr.send(body);
  }
}

</script>

<template>
    <div class="register-container">
        <h1 class="title">Create New Account</h1>
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
        max-width: 500px;
        margin: 2rem auto;
        padding: 2rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: white;
        padding-right: 10rem;
    }

    .title {
        font-size: 28px;
        line-height: 1.2;
        margin-bottom: 1.5rem;
        font-weight: 600;
        color: #111827;
    }

    .register-container div {
        margin-bottom: 0.5rem;
    }

    .register-container label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 15px;
        font-weight: 600;
        color: #374151;
    }

    .register-container input {
        width: 100%;
        padding: 0.5rem;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 1rem;
        font-size: 14px;
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

    .input::placeholder {
      color: #9aa4b2;
    }
</style>
