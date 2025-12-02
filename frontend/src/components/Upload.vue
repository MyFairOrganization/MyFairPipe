<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const title = ref('')
const description = ref('')
const videoFile = ref<File | null>(null)
const videoURL = ref<string | null>(null)
const router = useRouter()

function upload() {
  router.push('/upload')
}
function edit() {
  router.push('/edituser')
}
function submitForm() {
  console.log('Title:', title.value)
  console.log('Description:', description.value)
  console.log('Video File:', videoFile.value)
  router.push('/user')
}

// Video-Upload Handler
function handleVideoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    videoFile.value = target.files[0]
    videoURL.value = URL.createObjectURL(target.files[0])
  }
}
</script>

<template>
  <div class="container">
    <img class="pfp" src="/pfpExample.png" />
    <div class="user">
      <div class="left">
        <h1>User Name</h1>
        <p id="descr">This is a brief user description.</p>
        <button id="b1">Channel information</button>
      </div>

      <div class="right">
        <button class="btn" @click="upload">Upload Video</button>
        <button class="btn" @click="edit">Edit Account</button>
      </div>
    </div>
  </div>

  <hr class="line" />

  <!-- Zeigt das hochgeladene Video an -->
  <div v-if="videoURL" class="video-preview">
    <video :src="videoURL" controls width="400"></video>
  </div>

  <div class="form-container">
    <label for="title">Title:</label><br>
    <input id="title" v-model="title" type="text" placeholder="Enter title" />
    <br>
    <label for="description">Description:</label><br>
    <textarea id="description" v-model="description" placeholder="Enter description"></textarea>
    <br>
    <label for="video">Video Upload:</label><br>
    <input id="video" type="file" accept="video/*" @change="handleVideoUpload" />
    <br>
    <button class="upload" @click="submitForm">Upload</button>
  </div>
</template>

<style scoped>
.pfp {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
}

.container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
  margin-left: 7em;
}

.user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 900px;
  height: 250px;
  background-color: #98C1D9;
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

#b1 {
  margin-top: 5px;
  padding: 10px 20px;
  background-color: transparent;
  color: #293241;
  border: 1px solid #293241;
  border-radius: 20px;
  cursor: pointer;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  background-color: #3D5A80;
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

.form-container input,
.form-container textarea {
  width: 25%;
  padding: 8px;
  font-size: 1rem;
  margin-bottom: 10px;
}

.form-container button {
  padding: 8px 16px;
  font-size: 1rem;
  cursor: pointer;
}

.upload {
  padding: 10px 20px;
  background-color: #3D5A80;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.video-preview {
  margin: 20px 0;
}
</style>
