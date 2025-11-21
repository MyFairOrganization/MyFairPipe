<script setup lang="ts">
import { createIMG } from './Content.vue'
</script>

<template>
  <div class="grid grid-cols-3 gap-10 w-full items-start">
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
</template>
