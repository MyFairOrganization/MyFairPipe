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
	<div class="interactivePanel">
		<input class="interactive" id="like" type="image" src="/like.svg" v-on:click="like()" />
		<input
			class="interactive"
			id="dislike"
			type="image"
			src="/dislike.svg"
			v-on:click="dislike()"
		/>
	</div>
</template>

<style scoped>
video {
	border-radius: 20px;
}

.interactive {
	background-color: transparent;
	border: transparent;
	width: 32px;
	height: 32px;
}

.interactivePanel {
	display: flex;
	flex-direction: row;
	gap: 20px;
	padding: 10px;
	align-items: flex-end;
}
</style>
