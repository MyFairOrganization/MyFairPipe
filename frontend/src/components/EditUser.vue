<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createIMG } from './Content.vue'

const router = useRouter()

const userName = ref('User Name')
const userDescription = ref('This is a brief user description.')
const userImage = ref('/pfpExample.png')

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = e => {
      userImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function user() {
  router.push('/user')
}

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
        <button id="b1">Channel information</button>
      </div>

      <div class="right">
        <button class="btn" @click="user">Apply</button>
      </div>
    </div>
  </div>

  <hr class="line" />

  <div id="thumbnails">
    <component
      v-for="i in 24"
      :key="i"
      :is="createIMG(
        'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg',
        'testVideo' + i
      )"
    />
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

.thumbnail img {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
}
</style>
