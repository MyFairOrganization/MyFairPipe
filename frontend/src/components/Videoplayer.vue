<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { CreateVID, GetIMGs } from '@/components/Content.vue'
import { onMounted, ref } from 'vue'
import Thumbnail from '@/components/Thumbnail.vue'
import Loader from '@/components/Loader.vue'

const ROUTER = useRouter()
const ROUTE = useRoute()
const PATH = ref('')
const PROPS = { id: ROUTE.query.id as string }
const TITLE = ref('')
const DESCRIPTION = ref('')
const SUBTITLES = ref('')
const SUBTITLE_LANGUAGE = ref('')
const LIKED = ref(false)
const LIKES = ref('0')
const DISLIKED = ref(false)
const DISLIKES = ref('0')
const THUMBNAILS = ref([])
const LOADING = ref(true)

onMounted(async () => {
  await getLiked()
  await getDetails()
  THUMBNAILS.value = await GetIMGs(30, 0)
  LOADING.value = false
})

async function getDetails() {
  const PARAMS = new URLSearchParams()
  PARAMS.append('id', PROPS.id)

  const VIDEOREQ = await fetch(`http://api.myfairpipe.com/video/get?${PARAMS}`)
  const SUBTITLEREQ = await fetch(`http://api.myfairpipe.com/subtitles/get?${PARAMS}`)
  const VIDEODATA = await VIDEOREQ.json()
  const SUBTITLEDATA = await SUBTITLEREQ.json()

  var subtitlePath = SUBTITLEDATA.files
  subtitlePath = subtitlePath.filter((subtitles: string) => subtitles.endsWith('.vtt'))

  TITLE.value = VIDEODATA.title
  DESCRIPTION.value = VIDEODATA.description
  PATH.value = VIDEODATA.minio_path
  SUBTITLES.value = subtitlePath
  SUBTITLE_LANGUAGE.value = SUBTITLEDATA.languages[0]
}

async function getLiked() {
  const BODY = JSON.stringify({
    videoID: PROPS.id,
  })

  try {
    const RES = await fetch(`http://api.myfairpipe.com/like_dislike/get`, {
      method: 'POST',
      body: BODY,
      credentials: 'include',
    })

    if (RES.ok) {
      const DATA = await RES.json()
      LIKED.value = DATA.result?.liked
      LIKES.value = DATA.result.likes
      DISLIKED.value = DATA.result?.disliked
      DISLIKES.value = DATA.result.dislikes
    }
  } catch (e) {
    console.error(e)
  }
}

async function like() {
  const BODY = JSON.stringify({
    videoID: PROPS.id,
  })

  try {
    const RES = await fetch(`http://api.myfairpipe.com/like_dislike/like`, {
      method: 'POST',
      body: BODY,
      credentials: 'include',
    })

    if (RES.ok) {
      const DATA = await RES.json()
      LIKED.value = Boolean(DATA.result)
      DISLIKED.value = false
    }
  } catch (e) {
    console.error(e)
  }

  getLiked()
}

async function dislike() {
  const BODY = JSON.stringify({
    videoID: PROPS.id,
  })

  try {
    const RES = await fetch(`http://api.myfairpipe.com/like_dislike/dislike`, {
      method: 'POST',
      body: BODY,
      credentials: 'include',
    })

    if (RES.ok) {
      const DATA = await RES.json()
      DISLIKED.value = Boolean(DATA.result)
      LIKED.value = false
    }
  } catch (e) {
    console.error(e)
  }

  getLiked()
}
</script>

<template>
  <Loader :loading="LOADING" msg="Loading Video" :msg-else="THUMBNAILS.length === 0" />

  <div class="layout" v-if="!LOADING">
    <div id="leftSide">
      <div class="player">
        <component :is="CreateVID(PATH, SUBTITLES, SUBTITLE_LANGUAGE, SUBTITLE_LANGUAGE)" />
        <div>
          <div id="underVideo">
            <h2>{{ TITLE }}</h2>
            <div class="interactivePanel">
              <div>
                <input
                  class="interactive"
                  id="like"
                  type="image"
                  :src="LIKED ? '/liked.svg' : '/like.svg'"
                  v-on:click="like()"
                />
                <p class="information">likes: {{ LIKES }}</p>
              </div>
              <div>
                <input
                  class="interactive"
                  id="dislike"
                  type="image"
                  :src="DISLIKED ? '/disliked.svg' : '/dislike.svg'"
                  v-on:click="dislike()"
                />
                <p class="information">dislikes: {{ DISLIKES }}</p>
              </div>
            </div>
          </div>
          <p>{{ DESCRIPTION }}</p>
        </div>
      </div>
    </div>

    <Thumbnail v-if="!LOADING" :thumbnails="THUMBNAILS" />
  </div>
</template>

<style scoped>
.video {
  width: 90%;
  height: auto;
  aspect-ratio: 16 / 9;
  background-color: #3d5a80;
}

.thumbnail {
  width: 20%;
}

.layout {
  background: #e0fbfc;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  margin-top: 50px;
  padding-left: 2%;
  padding-right: 2%;
}

#leftSide {
  width: 60%;
}

#videos {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: normal;
  gap: 10px;
}

.player {
  display: flex;
  flex-direction: column;
  z-index: 1;
  justify-content: center;
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