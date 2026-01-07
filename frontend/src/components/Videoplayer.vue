<script lang="ts" setup>
import {useRoute} from 'vue-router';
import {  CreateVIDHLS, GetIMGs } from "@/components/Content.vue";
import {onMounted, ref} from 'vue';
import Thumbnail from '@/components/Thumbnail.vue';
import Loader from '@/components/Loader.vue';

const route = useRoute();
const path = ref('');
const props = {id: route.query.id as string};
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
const error = ref(false)

onMounted(async () => {
    await getLiked();
    await getDetails();
    thumbnails.value = await GetIMGs(30, 0);
    loading.value = false;
});

async function getDetails() {
    const params = new URLSearchParams();
    params.append('id', props.id);

    const videoReq = await fetch(`http://api.myfairpipe.com/video/get?${params}`);
    const subtitleReq = await fetch(`http://api.myfairpipe.com/subtitles/get?${params}`);
    const videoData = await videoReq.json();
    const subtitleData = await subtitleReq.json();

    let subtitlePath = subtitleData.files;
    subtitlePath = subtitlePath.filter((subtitles: string) => {
        return subtitles.endsWith('.vtt');
    })

    title.value = videoData.title;
    description.value = videoData.description;
    path.value = videoData.path;
    subtitles.value = subtitlePath;
    subtitleLanguage.value = subtitleData.languages[0];
}

async function getLiked() {
    const body = JSON.stringify({
        videoID: props.id,
    });

    try {
        const res = await fetch(`http://api.myfairpipe.com/like_dislike/get`, {
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
        const res = await fetch(`http://api.myfairpipe.com/like_dislike/like`, {
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
        const res = await fetch(`http://api.myfairpipe.com/like_dislike/dislike`, {
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
</script>

<template>
    <Loader :loading="loading" :msg-else="thumbnails.length === 0" msg="Loading Video"/>

    <div v-if="!loading" class="layout">
        <div id="leftSide">
            <div class="player">
                <component :is="CreateVIDHLS(path, subtitles, subtitleLanguage, subtitleLanguage)"/>
                <div>
                    <div id="underVideo">
                        <h2>{{ title }}</h2>
                        <div class="interactivePanel">
                            <div>
                                <input
                                    id="like"
                                    :src="liked ? '/liked.svg' : '/like.svg'"
                                    class="interactive"
                                    type="image"
                                    v-on:click="like()"
                                />
                                <p class="information">likes: {{ likes }}</p>
                            </div>
                            <div>
                                <input
                                    id="dislike"
                                    :src="disliked ? '/disliked.svg' : '/dislike.svg'"
                                    class="interactive"
                                    type="image"
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

        <Thumbnail v-if="!loading" :thumbnails="thumbnails"/>
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
    transition: transform 0.15s ease,
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