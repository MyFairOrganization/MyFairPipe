<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import Thumbnail from "./Thumbnail.vue"
import { getIMGs } from "./Content.vue"

const router = useRouter()

const userName = ref('User Name')
const userDescription = ref('This is a brief user description.')
const userImage = ref('/pfpExample.png')

onMounted(async () => {
    const req = await fetch(`http://api.myfairpipe.com/user/get`, {
        credentials: 'include',
    })
    const user = await req.json()
    if (user.user.anonym) {
        router.push('/home')
    }
})

function loadProfile() {
  const xhr = new XMLHttpRequest()
  xhr.open("GET", "http://api.myfairpipe.com/user/get", true)
  xhr.withCredentials = true

  xhr.onload = () => {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText)
      userName.value = data.user.displayname
      userDescription.value = data.user.bio
    }
  }

  xhr.send()
}

function loadProfilePicture() {
  const xhr = new XMLHttpRequest()
  xhr.open("GET", "http://api.myfairpipe.com/user/picture/get", true)
  xhr.withCredentials = true

  xhr.onload = () => {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText)

      if (data.photo_url) {
        userImage.value = `${data.photo_url}?v=${Date.now()}`
      } else {
        userImage.value = '/pfpExample.png'
      }
    }
  }

  xhr.send()
}

function applyChanges() {
  const xhr = new XMLHttpRequest()
  xhr.open("PATCH", "http://api.myfairpipe.com/user/update", true)
  xhr.withCredentials = true

  const formData = new FormData()
  formData.append("displayName", userName.value)
  formData.append("bio", userDescription.value)

  xhr.onload = () => {
    if (xhr.status !== 200) {
      console.error("Profile update failed:", xhr.responseText)
    }
  }

  xhr.send(formData)
  router.push('/user')
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return

  const file = target.files[0]

  // Optimistic preview
  userImage.value = URL.createObjectURL(file)

  const xhr = new XMLHttpRequest()
  xhr.open("POST", "http://api.myfairpipe.com/user/picture/upload", true)
  xhr.withCredentials = true

  const formData = new FormData()
  formData.append("file", file)

  xhr.onload = () => {
    if (xhr.status === 200) {
      // Reload real CDN image
      loadProfilePicture()
    } else {
      console.error("Profile picture upload failed:", xhr.responseText)
    }
  }

  xhr.send(formData)
}

const thumbnails = ref([])
const loading = ref(true)

onMounted(async () => {
  loadProfile()
  loadProfilePicture()

  thumbnails.value = await getIMGs(10, 0)
  loading.value = false
})
</script>


<template>
  <div class="container">
    <div class="pfp-container">
      <img class="pfp" :src="userImage" alt="Profile Picture" />
      <input type="file" accept="image/*" @change="handleFileUpload" />
    </div>

    <div class="user">
      <div class="left">
        <input type="text" v-model="userName" class="name-input" />
        <textarea v-model="userDescription" class="descr-input"></textarea>
      </div>

      <div class="right">
        <button class="btn" @click="applyChanges">Apply</button>
        <button class="btn" @click="">Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 50px;
  margin-left: 5em;
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
  justify-content: space-between;
  align-items: flex-start;
  width: 900px;
  height: 250px;
  background-color: #98c1d9;
  padding: 20px 30px;
  border-radius: 10px;
  gap: 20px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.name-input {
  font-size: 2em;
  font-weight: bold;
  padding: 5px;
  width: 100%;
}

.descr-input {
  font-size: 1.2em;
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

.line {
  border: none;
  border-top: 1px solid #939393;
  width: 100%;
  margin-bottom: 50px;
}

#thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
