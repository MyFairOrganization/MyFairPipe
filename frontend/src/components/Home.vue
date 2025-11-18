<script setup lang="ts">
import { createIMG } from './Content.vue'
</script>

<template>
	<div class="home">
		<div id="thumbnails">
			<component
				v-for="i in 24"
				:key="i"
				:is="
					createIMG(
						'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg',
						'testVideo' + i,
					)
				"
			/>
		</div>
	</div>
</template>

<style>
.thumbnail {
	width: 320px;
	height: 180px;
	object-fit: cover;
	border-radius: 15px;
}

.image-block {
	padding: 10px;
	border-radius: 20px;
}

.image-block:hover {
	background-color: #c9eef0;
}

.image-block:active {
	box-shadow: #ee6c4d 0 0 5px 5px;
	.thumbnail {
		filter: blur(2px);
	}
}

#thumbnails {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 40px;
	width: 100%;
	align-items: start;
}
</style>
