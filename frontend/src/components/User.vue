<script lang="ts" setup>
import {GetIMGs} from './Content.vue'
import {onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import Thumbnail from './Thumbnail.vue'
import Upload from './Upload.vue'
import Loader from '@/components/Loader.vue'

const userPage = ref(true)
const uploadPage = ref(false)
const editPage = ref(false)

const userName = ref('User Name')
const userDescription = ref('This is a brief user description.')
const userImage = ref('')
const router = useRouter()
const route = useRoute()

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

async function logout() {
    await fetch(`https://api.myfairpipe.com/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })

    router.push('/home')
}

const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
    const req = await fetch(`https://api.myfairpipe.com/user/get?_=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
    })
    const user = await req.json()
    if (user.user.anonym) {
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
        const res = await fetch(`https://api.myfairpipe.com/user/get?_=${Date.now()}`, {
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
    } catch (err) {
        console.error('Network error while loading profile:', err)
    }
}

async function loadProfilePicture() {
    try {
        const res = await fetch('https://api.myfairpipe.com/user/picture/get', {
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
    <div class="container">
        <img :src="userImage" alt="Profile Picture" class="pfp"/>
        <div class="user">
            <div class="left">
                <h1>{{ userName }}</h1>
                <p id="descr">
                    {{ userDescription }}
                </p>
            </div>

            <div class="right">
                <button v-if="!uploadPage" class="btn" @click="upload">Upload Video</button>
                <button class="btn" @click="edit">Edit Account</button>
                <button class="btn" @click="logout()">Logout</button>
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
.pfp {
    width: 250px;
    height: 250px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    object-fit: cover;
}

.container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 50px;
    margin-bottom: 50px;
    margin-left: 7em;
}

.user {
    display: flex;
    justify-content: space-between;
    justify-items: left;
    width: fit-content;
    height: fit-content;
    background-color: #98c1d9;
    padding: 20px 30px;
    border-radius: 10px;
    gap: 20px;
}

.left h1 {
    font-weight: bold;
    font-size: 4em;
    margin: 0;
}

#descr {
    font-size: 1.5em;
    margin: 10px 0;
}

.right {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    background-color: #3d5a80;
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
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 50px;
        margin-bottom: 50px;
        margin-left: 7em;
    }

    .user {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 900px;
        height: 250px;
        background-color: #98c1d9;
        padding: 20px 30px;
        border-radius: 10px;
        gap: 20px;
    }
}
</style>
