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
            <img :src="thumb.src" width="320" height="180" class="thumbnail" />
            <p class="description">{{ thumb.title }}</p>
        </div>
    </div>
</template>

