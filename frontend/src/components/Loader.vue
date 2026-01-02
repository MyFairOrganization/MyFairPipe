<script lang="ts" setup>
const PROPS = defineProps({
    msg: String,
    nothing: Boolean,
    loading: Boolean,
})
</script>

<template>
    <div v-if="PROPS.loading" class="loading-screen">
        <div class="loader"/>
        <h2>{{ PROPS.msg }}</h2>
    </div>

    <div v-else-if="PROPS.nothing" class="loading-screen">
        <h2>Nothing yet</h2>
    </div>
</template>

<style scoped>
.loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;
    height: auto;
    margin: 50px;
}

.loader {
    border: 16px solid #e0fbfc;
    border-top: 16px solid #3d5a80;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
