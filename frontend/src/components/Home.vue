<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Thumbnail from './Thumbnail.vue'
import { getIMGs } from './Content.vue'
import Loader from '@/components/Loader.vue'

const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
  thumbnails.value = await getIMGs(30, 0)
  loading.value = false
  console.log(thumbnails.value)
})
</script>

<template>
  <div id="feed">
    <Loader :loading="loading" msg="Loading Videos" :nothing="thumbnails.length === 0" />

    <Thumbnail v-if="!loading" :thumbnails="thumbnails" />
  </div>
</template>

<style scoped>
.thumbnail {
  width: 75%;
  border-radius: 15px;
}

#videos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 50px;
  gap: 40px;
  width: 100%;
}

#feed {
  justify-content: space-around;
}
</style>
