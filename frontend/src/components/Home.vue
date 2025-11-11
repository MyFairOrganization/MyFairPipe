<script setup lang="ts">
import { h } from 'vue'
import { createIMG, createVID } from './Content.vue'
</script>

<template>
  <div class="home">
    <div id="videos">
      <component
        v-for="i in 24"
        :key="i"
        :is="
          createIMG(
            'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg',
            'testVideo' + i,
          )
        "
      />
    </div>
  </div>
</template>

<style>
.thumbnail {
  width: 320px;
  height: 180px;
  border-radius: 15px;
}

.image-block:hover {
  color: #98C1D9;
}

.video-block,image-block p {
  text-align: left;
}

#videos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  width: 100%;
  align-items: start;
}
</style>
