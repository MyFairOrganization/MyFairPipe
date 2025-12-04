<script setup lang="ts">
import { useRoute } from 'vue-router'
import { createVID, createIMG } from './Content.vue'
import { ref } from "vue";
const route = useRoute()
const props = { id: route.query.id as string, desc: route.query.desc as string }
const liked = ref(false)
const disliked = ref(false)

function like() {
  liked.value = !liked.value
  disliked.value = false
	console.log(liked.value + props.id + ' liked!')
}

function dislike() {
  disliked.value = !disliked.value
  liked.value = false
	console.log(disliked.value + props.id + ' disliked!')
}

function share() {
	console.log(props.id + ' shared!')
}
function download(){
	console.log(props.id + ' downloaded!')
}
function postComment(){
  console.log(props.id + ' sendComment!')
}
</script>

<template>
  <div class="layout">
		<div id="leftSide">
			<div class="player">
				<component :is="createVID(props.id, props.desc)" />
        <div id="underVideo">
          <h2>{{props.desc}}</h2>
          <div class="interactivePanel">
            <input class="interactive" id="like" type="image" :src="liked ? '/liked.svg' : '/like.svg'" v-on:click="like()" />
            <input class="interactive" id="dislike" type="image" :src="disliked ? '/disliked.svg' : '/dislike.svg'" v-on:click="dislike()" />
            <input class="interactive" id="share" type="image" src="/share.svg" v-on:click="share()" />
            <input class="interactive" id="download" type="image" src="/download.svg" v-on:click="download()" />
          </div>
        </div>
			</div>
		</div>
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

<style scoped>
  .layout{
    background: #e7fbff;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: flex-start;
  }
  #leftSide {
    width: 70%;
    flex: 70%;
    display: flex;
    flex-direction: column;
  }
  #thumbnails {
    flex: 30%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .player video{
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
  }
  .interactivePanel {
    width: 100%;
    display: flex;
    flex-direction: row;
    border-radius: 999px;
    background: #c6f0ff;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    width: fit-content;
  }
  .interactive {
    width: 32px;
    height: 32px;
    padding: 6px;
    border-radius: 50%;
    border: 1px solid #d0d0d0;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: transform 0.15s ease, box-shadow 0.15s ease,
    background 0.15s ease;
  }
  #underVideo {
    display: flex;
    flex-direction: row;
    gap: 600px;
  }
</style>

