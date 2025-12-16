<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useRouter } from 'vue-router'

const router = useRouter()

router.push('/home')
</script>

<template>
  <div>
    <nav class="header">
      <div class="row">
        <RouterLink to="/home">MyFairPipe</RouterLink>
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
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/user">User</RouterLink>
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
  border-left: 1px solid var(--color-border);
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
  width: 240px;
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
</style>
