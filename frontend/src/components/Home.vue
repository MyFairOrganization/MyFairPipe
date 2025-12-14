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
          i,
          'testVideo' + i,
        )
      "
    />
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
