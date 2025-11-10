<script setup lang="ts">
import { h } from 'vue'
import { createIMG, createVID } from './Content.vue'
</script>

<template>
  <div class="home">
    <h1>Home Page</h1>
    <div id="videos">
      <component v-for="i in 6" :key="i" :is="createIMG('https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg', 'testVideo')" />
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .home {
    min-height: 100vh;
    display: block;
    align-items: center;
  }
}

.thumbnail {
  width: 320px;
  height: 180px;
}

.video-block p {
  text-align: left;
}

#videos {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  gap: 20px;
  align-items: flex-start;
}
</style>
