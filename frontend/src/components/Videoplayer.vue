<script setup lang="ts">
import { useRoute } from 'vue-router'
import { createVID } from "./Content.vue";

const route = useRoute()
const props = { id: route.query.id as string, desc: route.query.desc as string }
</script>

<template>
  <div class="player">
    <component :is="createVID(props.id, props.desc)" />
  </div>
</template>

<style scoped>

</style>
