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
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
      </div>
    </nav>

    <main class="content">
      <RouterView />
    </main>

    <nav class="footer">
      <h2>MyFairPipe</h2>
    </nav>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
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
  margin-top: 120px;
}

.footer {
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  color: black;
  padding: 2.5rem 2rem;
}
</style>
