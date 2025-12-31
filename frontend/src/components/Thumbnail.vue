<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
    thumbnails: Array
})

const router = useRouter();
const thumbnails = props.thumbnails;

function goToPlayer(id) {
    router.push({ name: "player", query: { id } });
}
</script>

<template>
    <div id="videos">
        <div
            v-for="thumb in thumbnails"
            :key="thumb.id"
            class="image-block"
            @click="goToPlayer(thumb.id)"
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
	background-color: #3D5A80;
    border-radius: 5px;
}

.image-block:hover {
    color: #98c1d9;
}

.image-block p {
    text-align: left;
	max-width: 320px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

#videos {
	width: 100%;
	display: flex;
	justify-content: center;
}
</style>
