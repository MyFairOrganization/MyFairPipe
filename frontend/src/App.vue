<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const loggedIn = ref(false)
const anonym = ref(false)
const username = ref('')

async () => {
    await checkLoggedIn()
}

onMounted(async () => {
  loggedIn.value = await checkLoggedIn()
    console.log(loggedIn.value)
    console.log(anonym.value)

  if (!loggedIn.value && !anonym.value) {
    const register = await fetch('http://api.myfairpipe.com/auth/anonymLogin', {
      method: 'POST',
      credentials: 'include',
    })

    const data = await register.json()

    console.log(data)

    const body = JSON.stringify({
      user_email: data.user.user_email,
      password: data.password,
    })

    const login = await fetch('http://api.myfairpipe.com/auth/login', {
      method: 'POST',
      body: body,
      credentials: 'include',
    })

    console.log(login)
  }
})

async function checkLoggedIn() {
  const req = await fetch('http://api.myfairpipe.com/user/get', {
    credentials: 'include',
  })

  if (req.ok) {
    const data = await req.json()
    if (data.user.anonym) {
      anonym.value = true
      return false
    }
    username.value = data.user.username
  }
  anonym.value = false

  return req.status < 400
}
</script>

<template>
  <div>
    <nav class="header">
      <div class="row">
        <img src="@/assets/logo.svg" alt="Logo" height="40" />
        <RouterLink to="/home" class="navtxt">MyFairPipe</RouterLink>
        <div class="searchbar">
          <input type="text" placeholder="Search..." />
          <svg viewBox="0 0 24 24">
            <path
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016
            9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5
            4.99L20.49 19l-4.99-5zM10 15a5 5 0 110-10 5 5 0 010 10z"
            />
          </svg>
        </div>
        <RouterLink to="/home" class="navtxt">Home</RouterLink>
        <RouterLink v-if="loggedIn" to="/user" class="navtxt">{{ username }}</RouterLink>
        <RouterLink v-if="!loggedIn" to="/login" class="navtxt" id="loginbtn">Login</RouterLink>
      </div>
    </nav>

    <main class="content">
      <RouterView :key="$route.fullPath" />
    </main>

    <nav class="footer">
      <h2>MyFairPipe</h2>
    </nav>
  </div>
</template>

<style scoped>
.header {
  line-height: 1.5;
  z-index: 1000;
}

.navtxt {
  font-size: 20px;
  color: var(--color-text);
  text-decoration: none;
}

video {
  z-index: 1;
}

nav {
  width: 100%;
  font-size: 14px;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}

nav a:first-of-type {
  border: 0;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: white;
  color: black;
  padding: 2.5rem 2rem;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.content {
  margin-top: 100px;
}

.footer {
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  color: black;
  padding: 2.5rem 2rem;
}

.searchbar {
  background: #eee;
  border-radius: 999px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 500px;
}

.searchbar input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
}

.searchbar svg {
  width: 18px;
  height: 18px;
  fill: gray;
}

#loginbtn {
  border: 1px solid var(--color-text);
  background-color: black;
  color: white;
  padding: 6px 16px;
  border-radius: 6px;
}
</style>
