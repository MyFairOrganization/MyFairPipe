<script setup lang="ts">
import { onMounted, ref } from "vue";
import Thumbnail from './Thumbnail.vue'
import { getIMGs } from "./Content.vue";

const thumbnails = ref([])
const loading = ref(true);

onMounted(async () => {
    thumbnails.value = await getIMGs(30, 0);
    loading.value = false;
    console.log(thumbnails.value)
});
</script>

<template>
    <div id="feed">
        <!-- Show loading indicator if data is not ready -->
        <div v-if="loading">Loading thumbnails...</div>

        <!-- Render Thumbnail component only when data is ready -->
        <Thumbnail v-else :thumbnails="thumbnails" />
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
}

#feed {
    justify-content: space-around;
}
</style>
