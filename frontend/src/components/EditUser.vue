<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ENV} from "@/config/env.ts";

/**
 * Vue router.
 */
const router = useRouter();

/**
 * Vue refs for HTML contents.
 */
const userName = ref('User Name');
const userDescription = ref('This is a brief user description.');
const userImage = ref('');
const pfpFile = ref<File | null>(null);

/**
 * Executed after site loaded.
 */
onMounted(async () => {
    const req = await fetch(`${ENV.API_DOMAIN}/user/get`, {
        credentials: 'include',
    });
    const user = await req.json();
    if (user.user.anonym) {
        router.push('/home');
    }

    loadProfile();
    loadProfilePicture();
})

/**
 * Loads Profile data. (Username and bio)
 */
function loadProfile() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${ENV.API_DOMAIN}/user/get`, true);
    xhr.withCredentials = true;

    xhr.onload = () => {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            userName.value = data.user.displayname;
            userDescription.value = data.user.bio;
        }
    }

    xhr.send();
}

/**
 * Loads profile picture.
 */
function loadProfilePicture() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${ENV.API_DOMAIN}/user/picture/get`, true);
    xhr.withCredentials = true;

    xhr.onload = () => {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            if (data.photo_url) {
                userImage.value = `${data.photo_url}?v=${Date.now()}`;
            } else {
                userImage.value = '/pfpExample.png';
            }
        }
    }

    xhr.send();
}

/**
 * Uploads changes to db.
 */
function applyChanges() {
    uploadPfp();
    const xhr = new XMLHttpRequest();
    xhr.open('PATCH', `${ENV.API_DOMAIN}/user/update`, true);
    xhr.withCredentials = true;

    const formData = new FormData();
    formData.append('displayName', userName.value);
    formData.append('bio', userDescription.value);

    xhr.onload = () => {
        if (xhr.status !== 200) {
            console.error('Profile update failed:', xhr.responseText);
        }
    }

    xhr.send(formData);
    router.push('/user');
}

/**
 * Sets PFP in HTML.
 * @param event
 */
function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || !target.files[0]) return;

    // Optimistic preview
    pfpFile.value = target.files[0];
    userImage.value = URL.createObjectURL(pfpFile.value);
}

/**
 * Uploads PFP to db.
 */
async function uploadPfp() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${ENV.API_DOMAIN}/user/picture/upload`, true);
    xhr.withCredentials = true;

    const formData = new FormData();
    formData.append('file', pfpFile.value);

    xhr.onload = () => {
        if (xhr.status === 200) {
            // Reload real CDN image
            loadProfilePicture();
        } else {
            console.error('Profile picture upload failed:', xhr.responseText);
        }
    }

    xhr.send(formData);
}

/**
 * Returns to User-page.
 */
function back() {
    router.push('/user');
}
</script>

<template>
    <div class="container">
        <div class="pfp-container">
            <img :src="userImage" alt="Profile Picture" class="pfp"/>
            <input accept="image/*" type="file" @change="handleFileUpload"/>
        </div>

        <div class="user">
            <div class="left">
                <input v-model="userName" class="name-input" type="text"/>
                <textarea v-model="userDescription" class="descr-input"></textarea>
            </div>

            <div class="right">
                <button class="btn" @click="applyChanges">Apply</button>
                <button class="btn" @click="back">Back</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    max-width: 1200px;
    margin: 50px auto;
    padding: 0 1rem;
}

.pfp-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
}

.pfp {
    width: 250px;
    height: 250px;
    border-radius: 50%;
    object-fit: cover;
}

.user {
    display: flex;
    align-items: flex-start;
    background-color: #98c1d9;
    padding: 20px 30px;
    border-radius: 10px;
    gap: 80px;
    width: 100%;
}

.left {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
}

.name-input {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: bold;
    padding: 5px;
    width: 100%;
}

.descr-input {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    padding: 5px;
    width: 100%;
    resize: vertical;
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

@media (max-width: 600px) {
    .container {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 20px;
        margin: 30px auto;
        padding: 0 1rem;
    }

    .user {
        flex-direction: column;
        gap: 20px;
        width: 100%;
        max-width: 400px;
        padding: 20px;
    }

    .left {
        align-items: center;
    }

    .right {
        width: 100%;
        align-items: center;
    }

    .btn {
        width: 100%;
        max-width: 250px;
    }

    .pfp {
        width: 180px;
        height: 180px;
    }
}
</style>