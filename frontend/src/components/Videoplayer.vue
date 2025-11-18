<script setup lang="ts">
import { useRoute } from 'vue-router'
import { createVID, videoPath } from './Content.vue'

const route = useRoute()
const props = { id: route.query.id as string, desc: route.query.desc as string }

function like() {
	console.log(props.id + ' liked!')
}

function dislike() {
	console.log(props.id + ' disliked!')
}

function share() {
	console.log(props.id + ' shared!')
}
function download(){
	console.log(props.id + ' downloaded!')
}
</script>

<template>
	<div class="player">
		<component :is="createVID(props.id, props.desc)" />
	</div>
	<div class="interactivePanel">
		<input class="interactive" id="like" type="image" src="/like.svg" v-on:click="like()" />
		<input class="interactive" id="dislike" type="image" src="/dislike.svg" v-on:click="dislike()" />
		<input class="interactive" id="share" type="image" src="/share.svg" v-on:click="share()" />
		<input class="interactive" id="download" type="image" src="/download.svg" v-on:click="download()" />
	</div>
</template>

<style scoped>
video {
	border-radius: 20px;
	z-index: -100000000;
}

.interactive {
	background-color: transparent;
	border: transparent;
	width: 38px;
	height: 38px;
	padding: 3px;
}

.interactive:hover {
	background-color: #C9EEF0;
	border-radius: 5px;
}

.interactive:active {
	box-shadow: #EE6C4D 0 0 5px 5px;
}

.interactivePanel {
	display: flex;
	flex-direction: row;
	gap: 5px;
	padding: 10px;
	margin-right: 0;
	margin-left: auto;
	width: fit-content;
	align-content: end;
}
</style>
