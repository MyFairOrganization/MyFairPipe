<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Thumbnail from './Thumbnail.vue'
import { GetIMGs } from './Content.vue'
import Loader from '@/components/Loader.vue'

const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
  thumbnails.value = await GetIMGs(30, 0)
  loading.value = false
})
</script>

<template>
  <div id="feed">
    <Loader :loading="loading" msg="Loading Videos" :nothing="thumbnails.length === 0" />

    <Thumbnail v-if="!loading" :thumbnails="thumbnails" />
  </div>
</template>

<style>
.thumbnail {
  width: 75%;
  border-radius: 15px;
}

#videos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  max-width: 1400px;
}

#feed {
	margin-top: 50px;
	margin-bottom: 50px;
  display: flex;
  justify-content: space-around;
}
</style>