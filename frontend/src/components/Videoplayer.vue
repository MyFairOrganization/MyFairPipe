<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { createVID, getIMGs } from './Content.vue'
import { onMounted, ref } from 'vue'
import Thumbnail from './Thumbnail.vue'

const router = useRouter()
const route = useRoute()
const props = { id: route.query.id as string }
const title = ref('')
const description = ref('')
const liked = ref(false)
const likes = ref('0')
const disliked = ref(false)
const dislikes = ref('0')
const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
  await getLiked()
  await getDetails()
  thumbnails.value = await getIMGs(30, 0)
  loading.value = false
  console.log(thumbnails.value)
})

async function getDetails() {
  const params = new URLSearchParams()
  params.append('id', props.id)

  const req = await fetch(`http://api.myfairpipe.com/video/get?${params}`)
  const data = await req.json()

  title.value = data.title
  description.value = data.description
}

async function getLiked() {
  const body = JSON.stringify({
    videoID: props.id,
  })

  try {
    const response = await fetch(`http://api.myfairpipe.com/like_dislike/get`, {
      method: 'POST',
      body: body,
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
        console.log(data)
      liked.value = data.result?.liked
      likes.value = data.result.likes
      disliked.value = data.result?.disliked
      dislikes.value = data.result.dislikes
      console.log(data.result)
    } else {
      console.log(response)
    }
  } catch (e) {
    console.error(e)
  }
}

async function like() {
  const body = JSON.stringify({
    videoID: props.id,
  })

  try {
    const response = await fetch(`http://api.myfairpipe.com/like_dislike/like`, {
      method: 'POST',
      body: body,
      credentials: 'include',
    })

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

  getLiked()
}

async function dislike() {
  const body = JSON.stringify({
    videoID: props.id,
  })

  try {
    const response = await fetch(`http://api.myfairpipe.com/like_dislike/dislike`, {
      method: 'POST',
      body: body,
      credentials: 'include',
    })

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

  getLiked()
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
        <component :is="createVID(props.id)" />
        <div>
          <div id="underVideo">
            <h2>{{ title }}</h2>
            <div class="interactivePanel">
              <div>
                <input
                  class="interactive"
                  id="like"
                  type="image"
                  :src="liked ? '/liked.svg' : '/like.svg'"
                  v-on:click="like()"
                />
                <p class="information">likes: {{ likes }}</p>
              </div>
              <div>
                <input
                  class="interactive"
                  id="dislike"
                  type="image"
                  :src="disliked ? '/disliked.svg' : '/dislike.svg'"
                  v-on:click="dislike()"
                />
                <p class="information">dislikes: {{ dislikes }}</p>
              </div>
            </div>
          </div>
          <p>{{ description }}</p>
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
  border-radius: 10px;
  background: #c6f0ff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  spacing: 10px;
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

.information {
  display: flex;
  width: fit-content;
  height: auto;
  border-radius: 10px;
  padding: 0 10px 0 10px;
  justify-content: center;
  align-content: center;
  background-color: #e0fbfc;
}

#underVideo {
  display: flex;
  flex-direction: row;
  width: 90%;
  justify-content: space-between;
}
</style>
