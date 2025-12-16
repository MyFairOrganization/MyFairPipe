<script setup lang="ts">
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    const router = useRouter();

    const email = ref<string>('')
    const password = ref<string>('')

    function register(){
        router.push({name: 'register'});
    }
    function home(){
        router.push('/home');
    }

</script>

<template>
    <div class="page">
      <h1 class="title">Sign in</h1>

      <form class="form" method="POST" @submit.prevent onsubmit="home()">
        <label class="label" for="email">E-Mail:</label>
        <input
          id="email"
          type="email"
          v-model.trim="email"
          class="input"
          placeholder="E-Mail"
          autocomplete="email"
        />

        <label class="label" for="password">Password:</label>
        <input
          id="password"
          type="password"
          v-model="password"
          class="input"
          placeholder="Password"
          autocomplete="current-password"
        />

        <p v-on:click="register">Don't have an Account?</p>
        <button class="btn" type="button" @click="home" >Sign in</button>
      </form>
  </div>
</template>

<style scoped>
    .page {
      background-color: white;
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding-right: 10rem;
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
