<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import Thumbnail from './Thumbnail.vue'
import {GetIMGs} from './Content.vue'
import Loader from '@/components/Loader.vue'

const thumbnails = ref([]);
const loading = ref(true);
const limit = 10;

onMounted(async () => {
    thumbnails.value = await GetIMGs(limit, 0);
    loading.value = false;
});

async function loadMore() {
    loading.value = true;
    const newThumbnails = await GetIMGs(limit, thumbnails.value.length);
    console.log(newThumbnails);
    thumbnails.value.push(...newThumbnails);
    loading.value = false;
}
</script>

<template>
    <div id="feed">
        <Loader :loading="loading" :nothing="thumbnails.length === 0" msg="Loading Videos"/>

        <Thumbnail v-if="!loading" :thumbnails="thumbnails"/>

        <button v-if="thumbnails.length === limit" id="more" @click="loadMore">Load more videos</button>
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

#more {
    display: block;
    border: none;
    border-radius: 10px;
    width: 80%;
    margin: 20px auto;
    background-color: #3D5A80;
    color: white;
    padding: 10px;
}

#more:hover {
    background-color: #98c1d9;
    color: black;
}

#feed {
    margin-top: 50px;
    margin-bottom: 50px;
    gap: 20px;
    width: 100%;
}
</style>