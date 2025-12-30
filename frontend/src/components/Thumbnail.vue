<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
    thumbnails: Array
})

const router = useRouter();
const thumbnails = props.thumbnails;

function goToPlayer(id, title) {
    router.push({ name: "player", query: { id, desc: title } });
}
</script>

<template>
    <div id="videos">
        <div
            v-for="thumb in thumbnails"
            :key="thumb.id"
            class="image-block"
            @click="goToPlayer(thumb.id, thumb.title)"
            style="aspect-ratio: 16/9; cursor: pointer;"
        >
            <img :src="thumb.src"  class="thumbnail" />
            <p class="description">{{ thumb.title }}</p>
        </div>
    </div>
</template>

<style>
.thumbnail {
    width: 320px;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    background: radial-gradient(circle, #3D5A80 50%, #E0FBFC 100%);
    border-radius: 5px;
}

.image-block:hover {
    color: #98c1d9;
}

p {
    text-align: left;
}
</style>
