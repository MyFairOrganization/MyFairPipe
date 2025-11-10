<script setup lang="ts">
import { h } from 'vue'
import { createIMG, createVID } from './Content.vue'
</script>

<template>
  <div class="home">
    <div id="videos">
      <component
        v-for="i in 6"
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

.video-block p {
  text-align: left;
}

#videos {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 items per row */
  gap: 40px; /* space between items */
  width: 100%;
  align-items: start; /* align items to the top */
}
</style>
