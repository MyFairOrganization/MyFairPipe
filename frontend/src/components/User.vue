<script lang="ts" setup>
import {GetIMGs} from './Content.vue'
import {onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import Thumbnail from './Thumbnail.vue'
import Upload from './Upload.vue'
import Loader from '@/components/Loader.vue'
import {ENV} from "@/config/env.ts";

const userPage = ref(true)
const uploadPage = ref(false)
const editPage = ref(false)

const userName = ref('User Name')
const userDescription = ref('This is a brief user description.')
const subscribers = ref(0)
const userImage = ref('')
const router = useRouter()
const route = useRoute()

const props = defineProps({
    id: String
});

watch(
    () => {return route.fullPath},
    () => {
        loadProfile()
        loadProfilePicture()
    },
)

function upload() {
    router.push('/upload')
}

function edit() {
    router.push('/edituser')
}

function subscribe() {
    if (props.id !== undefined && props.id !== "") {
        const params = new URLSearchParams();
        params.append('id', props.id);

        console.log(params);

        fetch(`${ENV.API_DOMAIN}/user/subscribe?${params}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        })
    }
}

async function logout() {
    await fetch(`${ENV.API_DOMAIN}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })

    router.push('/home')
}

const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
    const req = await fetch(`${ENV.API_DOMAIN}/user/get?_=${Date.now()}` + (props.id === "" || props.id === undefined ? "" : `&id=${props.id}`), {
        credentials: 'include',
        cache: 'no-store',
    })
    const user = await req.json()
    if (user.user.anonym && props.id === "") {
        router.push('/home')
    } else {
        const path = router.currentRoute._value.fullPath
        if (path === '/user') {
            userPage.value = true
            uploadPage.value = false
            editPage.value = false
        } else if (path === '/upload') {
            userPage.value = false
            uploadPage.value = true
            editPage.value = false
        }

        await Promise.all([loadProfile(), loadProfilePicture()])

        thumbnails.value = await GetIMGs(10, 0, user.user.user_id);
        loading.value = false;
    }
})

async function loadProfile() {
    try {
        const res = await fetch(`${ENV.API_DOMAIN}/user/get?_=${Date.now()}` + (props.id === "" || props.id === undefined ? "" : `&id=${props.id}`), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        })

        if (!res.ok) {
            console.error('Failed to load profile:', res.status)
            return
        }

        const data = await res.json()
        userName.value = data.user.displayname
        userDescription.value = data.user.bio
        subscribers.value = data.subscribers
    } catch (err) {
        console.error('Network error while loading profile:', err)
    }
}

async function loadProfilePicture() {
    try {
        const res = await fetch(`${ENV.API_DOMAIN}/user/picture/get` + (props.id === "" || props.id === undefined ? "" : `?id=${props.id}`), {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        })

        if (!res.ok) {
            console.error('Failed to load profile picture:', res.status)
            userImage.value = '/pfpExample.png'
            return
        }

        const data = await res.json()

        if (data.photo_url) {
            // Cache-Buster für CDN/Browser
            userImage.value = `${data.photo_url}?v=${Date.now()}`
        } else {
            userImage.value = '/pfpExample.png'
        }
    } catch (err) {
        console.error('Network error while loading profile picture:', err)
        userImage.value = '/pfpExample.png'
    }
}
</script>

<template>
    <div class="edit-container">
        <img :src="userImage" alt="Profile Picture" class="edit-pfp"/>
        <div class="edit-user">
            <div class="edit-left">
                <h1>{{ userName }}</h1>
                <p id="descr">
                    {{ userDescription }}
                </p>
                <p id="subscribers">
                    {{ subscribers }} Subscribers
                </p>
            </div>

            <div class="edit-right">
                <button v-if="!uploadPage && (props.id === '' || props.id === undefined)" class="btn" @click="upload">Upload Video</button>
                <button class="btn" v-if="(props.id === '' || props.id === undefined)" @click="edit">Edit Account</button>
                <button class="btn" v-if="(props.id === '' || props.id === undefined)" @click="logout()">Logout</button>
                <button class="btn" v-if="props.id !== '' && props.id !== undefined" @click="subscribe()">Subscribe</button>
            </div>
        </div>
    </div>
    <hr class="line"/>

    <div v-if="userPage" id="thumbnails">
        <Loader :loading="loading" :nothing="thumbnails.length === 0" msg="Loading Videos"/>

        <Thumbnail v-if="!loading" :thumbnails="thumbnails"/>
    </div>

    <component :is="Upload" v-if="uploadPage"/>
</template>

<style scoped>
.edit-pfp {
    width: 250px;
    height: 250px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    object-fit: cover;
}

.edit-container {
    display: flex;
    align-items: center;
    gap: 20px;
    max-width: 1200px;
    margin: 50px auto;
    padding: 0 1rem;
}

.edit-user {
    display: flex;
    align-items: center;
    background-color: var(--color-medium);
    padding: 20px 30px;
    border-radius: 10px;
    gap: 80px;
}

#subscribers {
    padding: 0;
    margin: 0;
    font-size: 1em;
    font-weight: bold;
}

.edit-left h1 {
    font-weight: bold;
    font-size: clamp(2rem, 4vw, 4rem);
    margin: 0;
}

#descr {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    margin: 10px 0;
}

.edit-right {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    background-color: var(--color-dark);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin: 5px 0;
}

.line {
    border: none;
    border-top: 1px solid #939393;
    width: 100%;
    margin-bottom: 50px;
}

#videos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;

    width: 80%;
    margin: 0 auto;
}

#thumbnails {
    width: 100%;
}

@media (max-width: 600px) {
    .edit-container {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 20px;
        margin: 30px auto;
        padding: 0 1rem;
    }

    .edit-user {
        flex-direction: column;
        gap: 20px;
        width: 100%;
        max-width: 400px;
        padding: 20px;
    }

    .edit-left {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .edit-right {
        width: 100%;
        align-items: center;
    }

    .btn {
        width: 100%;
        max-width: 250px;
    }

    .edit-pfp {
        width: 180px;
        height: 180px;
    }
}
</style>
