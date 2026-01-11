<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { GetIMGs } from '@/components/Content.vue';
import { nextTick, onMounted, ref } from 'vue';
import Thumbnail from '@/components/Thumbnail.vue';
import Loader from '@/components/Loader.vue';
import type Hls from 'hls.js';

const route = useRoute();
const path = ref('');
const props = { id: route.query.id as string };
const title = ref('');
const description = ref('');
const subtitles = ref('');
const subtitleLanguage = ref('');
const liked = ref(false);
const likes = ref('0');
const disliked = ref(false);
const dislikes = ref('0');
const thumbnails = ref([]);
const loading = ref(true);
const views = ref(0);
const error = ref(false);

const cdnPath = 'https://cdn.myfairpipe.com/video/%PATH';
const videoPath = 'https://cdn.myfairpipe.com%PATH';

const videoRef = ref<HTMLVideoElement | null>(null);

onMounted(async () => {
    await getLiked();
    await getDetails();
    thumbnails.value = await GetIMGs(30, 0);
    loading.value = false;

    await nextTick();

    await hlsInit();
});

async function getDetails() {
    const params = new URLSearchParams();
    params.append('id', props.id);

    const videoReq = await fetch(`https://api.myfairpipe.com/video/get?${params}`);
    const subtitleReq = await fetch(`https://api.myfairpipe.com/subtitles/get?${params}`);
    const videoData = await videoReq.json();
    const subtitleData = await subtitleReq.json();

    let subtitlePath = subtitleData.files;
    subtitlePath = String(subtitlePath.filter((subtitles: string) => {
        return subtitles.endsWith('.vtt');
    }));

    title.value = videoData.title;
    description.value = videoData.description;
    views.value = videoData.views;
    path.value = videoPath.replace('%PATH', videoData.path);
    subtitles.value = cdnPath.replace('%PATH', subtitlePath);
    subtitleLanguage.value = subtitleData.languages[0];
}

async function getLiked() {
    const body = JSON.stringify({
        videoID: props.id,
    });

    try {
        const res = await fetch(`https://api.myfairpipe.com/like_dislike/get`, {
            method: 'POST',
            body: body,
            credentials: 'include',
        });

        if (res.ok) {
            const data = await res.json();
            liked.value = data.result?.liked;
            likes.value = data.result.likes;
            disliked.value = data.result?.disliked;
            dislikes.value = data.result.dislikes;
        }
    } catch (e) {
        console.error(e);
    }
}

async function like() {
    const body = JSON.stringify({
        videoID: props.id,
    });

    try {
        const res = await fetch(`https://api.myfairpipe.com/like_dislike/like`, {
            method: 'POST',
            body: body,
            credentials: 'include',
        });

        if (res.ok) {
            const data = await res.json();
            liked.value = Boolean(data.result);
            disliked.value = false;
        }
    } catch (e) {
        console.error(e);
    }

    getLiked();
}

async function dislike() {
    const body = JSON.stringify({
        videoID: props.id,
    });

    try {
        const res = await fetch(`https://api.myfairpipe.com/like_dislike/dislike`, {
            method: 'POST',
            body: body,
            credentials: 'include',
        });

        if (res.ok) {
            const data = await res.json();
            disliked.value = Boolean(data.result);
            liked.value = false;
        }
    } catch (e) {
        console.error(e);
    }

    getLiked();
}

function hlsInit() {
    const video = videoRef.value;

    if (!video) {
        window.alert('You must specify a video object!');
        error.value = true;
        return;
    }

    video.muted = false;
    video.volume = 1.0;

    // Add error event listener
    video.addEventListener('error', () => {
        window.alert('Error accured during video.');
        error.value = true;
        return;
    })

    if (Hls.isSupported()) {
        const hls = new Hls({
            startPosition: 0,
        });
        try {
            hls.attachMedia(video);
            hls.loadSource(path.value);
        } catch (e) {
            window.alert('hls error');
            error.value = true;
            return;
        }

        // HLS Error handling
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                window.alert('fatal hls error');
                error.value = true;
                return;
            }
        })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = path.value;
    }
}
</script>

<template>
    <Loader :loading="loading" :msg-else="thumbnails.length === 0" msg="Loading Video"/>

    <div v-if="!loading" class="layout">
        <div id="leftSide">
            <div class="player">
                <div v-if="!error" class="video-block">
                    <video ref="videoRef" class="video" crossorigin="anonymous" controls>
                        <track :src="subtitles" kind="subtitles" srclang="cc" lang="en" default>
                    </video>
                </div>
                <div v-if="error" class="video-block">
                    <p>ERRORRRRRR</p>
                </div>
                <div>
                    <div id="underVideo">
                        <h2>{{ title }}</h2>
                        <div class="interactivePanel">
                            <div class="rating">
                                <input
                                    id="like"
                                    :src="liked ? '/liked.svg' : '/like.svg'"
                                    class="interactive"
                                    type="image"
                                    v-on:click="like()"
                                />
                                <p class="information">{{ likes }}</p>
                            </div>
                            <div class="rating">
                                <input
                                    id="dislike"
                                    :src="disliked ? '/disliked.svg' : '/dislike.svg'"
                                    class="interactive"
                                    type="image"
                                    v-on:click="dislike()"
                                />
                                <p class="information">{{ dislikes }}</p>
                            </div>
                        </div>
                    </div>
                    <p>{{ description }}</p>
                </div>
            </div>
        </div>
    <Thumbnail v-if="!loading" :thumbnails="thumbnails" />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 50px auto;
  padding: 0 1rem;
}

#leftSide {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

#videos {
  flex-shrink: 0;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.player video {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  background-color: #3d5a80;
  border-radius: 10px;
}

#underVideo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

#underVideo h2 {
  margin: 0;
  flex: 1;
}

.interactivePanel {
  display: flex;
  gap: 10px;
  padding: 6px;
  border-radius: 10px;
  background: #c6f0ff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.interactive {
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 50%;
  border: 1px solid #d0d0d0;
  background: #fff;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.rating {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.information {
  display: flex;
  padding: 0 10px;
  background-color: #e0fbfc;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
}

.player p {
  margin-top: 1rem;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .layout {
    flex-direction: column;
    gap: 1rem;
  }

  #videos {
    width: 100%;
    margin-top: 1rem;
    margin: 0 auto;
  }

  #underVideo {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .interactivePanel {
    align-self: flex-end;
  }
}
</style>