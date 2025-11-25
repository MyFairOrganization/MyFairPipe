<script setup lang="ts">
import { useRoute } from 'vue-router'
import { createVID } from './Content.vue'

const route = useRoute()
const props = { id: route.query.id as string, desc: route.query.desc as string }

function like() {
  console.log(props.id + ' liked!')
}

function dislike() {
  console.log(props.id + ' disliked!')
}
</script>

<template>
  <div class="player">
    <component :is="createVID(props.id, props.desc)" />
  </div>
  <div class="flex flex-row gap-1 p-3 mr-0 ml-auto w-fit content-end">
    <input
      class="bg-transparent border-transparent w-[38px] h-[38px] p-[3px] hover:bg-[#c9eef0] hover:rounded-[5px] active:shadow-[0_0_5px_5px_#ee6c4d]"
      id="like"
      type="image"
      src="/like.svg"
      v-on:click="like()"
      alt="Like"
    />
    <input
      class="bg-transparent border-transparent w-[38px] h-[38px] p-[3px] hover:bg-[#c9eef0] hover:rounded-[5px] active:shadow-[0_0_5px_5px_#ee6c4d]"
      id="dislike"
      type="image"
      src="/dislike.svg"
      v-on:click="dislike()"
      alt="Dislike"
    />
  </div>
</template>
