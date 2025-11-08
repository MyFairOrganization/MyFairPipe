<script setup lang="ts">
import { h } from 'vue'

function createIMG(path, desc) {
  return h('div', { class: 'video-block' }, [
    h('img', {
      src: path,
      width: '320',
      height: '180',
      class: 'thumbnail'
    }),
    h('p', { class: 'description' }, desc),
  ])
}

function createVID(path, desc) {
  return h('div', { class: 'video-block' }, [
    h('video', {
      src: path,
      width: '320',
      height: '180',
      class: 'video',
      controls: true
    }),
    h('p', { class: 'description' }, desc),
  ])
}
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
