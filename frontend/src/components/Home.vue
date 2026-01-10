<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import Thumbnail from './Thumbnail.vue'
import {GetIMGs} from './Content.vue'
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
        <Loader :loading="loading" :nothing="thumbnails.length === 0" msg="Loading Videos"/>

        <Thumbnail v-if="!loading" :thumbnails="thumbnails"/>
    </div>
</template>

<style>
#videos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;

    width: 80%;
    margin: 0 auto;
}

#feed {
    margin-top: 50px;
    margin-bottom: 50px;
    width: 100%;
}
</style>