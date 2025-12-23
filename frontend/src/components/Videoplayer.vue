<script setup lang="ts">
import { useRoute } from 'vue-router'
import { createVID, getIMGs } from './Content.vue'
import { onMounted, ref } from 'vue'
import Thumbnail from './Thumbnail.vue'

const route = useRoute()
const props = { id: route.query.id as string, desc: route.query.desc as string }
const liked = ref(false)
const disliked = ref(false)
const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
  await getLiked()
  thumbnails.value = await getIMGs(30, 0)
  loading.value = false
  console.log(thumbnails.value)
})

async function getLiked() {
  const params = new URLSearchParams()
  params.append('videoID', props.id)
  params.append('username', 'testuser')

  try {
    const response = await fetch(`http://api.myfairpipe.com/like_dislike/get?${params}`)

    if (response.ok) {
      const data = await response.json()
      liked.value = data.result.liked
      disliked.value = data.result.disliked
      console.log(data.result)
    } else {
      console.log(response)
    }
  } catch (e) {
    console.error(e)
  }
}

async function like() {
  const params = new URLSearchParams()
  params.append('videoID', props.id)
  params.append('username', 'testuser')

  try {
    const response = await fetch(`http://api.myfairpipe.com/like_dislike/like?${params}`)

    if (response.ok) {
      const data = await response.json()
      liked.value = Boolean(data.result)
      disliked.value = false
      console.log(data.result)
    } else {
      console.log(response)
    }
  } catch (e) {
    console.error(e)
  }
}

async function dislike() {
  const params = new URLSearchParams()
  params.append('videoID', props.id)
  params.append('username', 'testuser')

  try {
    const response = await fetch(`http://api.myfairpipe.com/like_dislike/dislike?${params}`)

    if (response.ok) {
      const data = await response.json()
      disliked.value = Boolean(data.result)
      liked.value = false
      console.log(data.result)
    } else {
      console.log(response)
    }
  } catch (e) {
    console.error(e)
  }
}

function share() {
  console.log(props.id + ' shared!')
}

function download() {
  console.log(props.id + ' downloaded!')
}

function postComment() {
  console.log(props.id + ' sendComment!')
}
</script>

<template>
  <div class="layout">
    <div id="leftSide">
      <div class="player">
        <component :is="createVID(props.id, props.desc)" />
        <div id="underVideo">
          <h2>{{ props.desc }}</h2>
          <div class="interactivePanel">
            <input
              class="interactive"
              id="like"
              type="image"
              :src="liked ? '/liked.svg' : '/like.svg'"
              v-on:click="like()"
            />
            <input
              class="interactive"
              id="dislike"
              type="image"
              :src="disliked ? '/disliked.svg' : '/dislike.svg'"
              v-on:click="dislike()"
            />
            <input
              class="interactive"
              id="share"
              type="image"
              src="/share.svg"
              v-on:click="share()"
            />
            <input
              class="interactive"
              id="download"
              type="image"
              src="/download.svg"
              v-on:click="download()"
            />
          </div>
        </div>
      </div>
    </div>

    <div id="thumbnails">
      <!-- Show loading indicator if data is not ready -->
      <div v-if="loading">Loading thumbnails...</div>

      <!-- Render Thumbnail component only when data is ready -->
      <Thumbnail v-else :thumbnails="thumbnails" />
    </div>
  </div>
</template>

<style scoped>
.layout {
  background: #e0fbfc;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
}

#leftSide {
  flex: 90%;
  display: flex;
  flex-direction: column;
}

#videos {
  flex: 30%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player {
  z-index: 1;
}

.player video {
  border-radius: 10px;
  z-index: 1;
}

.interactivePanel {
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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

#underVideo {
  display: flex;
  flex-direction: row;
  width: 90%;
  justify-content: space-between;
}
</style>
