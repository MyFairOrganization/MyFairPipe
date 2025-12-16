<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const title = ref('')
const description = ref('')
const ageRestricted = ref(false)
const videoFile = ref<File | null>(null)
const videoURL = ref<string | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref<string | null>(null)
const router = useRouter()

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes

function upload() {
  router.push('/upload')
}

function edit() {
  router.push('/edituser')
}

async function submitForm() {
  // Validation
  if (!videoFile.value) {
    uploadError.value = 'Please select a video file'
    return
  }

  if (!title.value || !description.value) {
    uploadError.value = 'Title and description are required'
    return
  }

  // Check file size
  if (videoFile.value.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(videoFile.value.size / (1024 * 1024))
    const maxMB = Math.round(MAX_FILE_SIZE / (1024 * 1024))
    uploadError.value = `File too large (${sizeMB}MB). Maximum size is ${maxMB}MB`
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  uploadError.value = null

  try {
    // Create FormData object
    const formData = new FormData()
    formData.append('file', videoFile.value)
    formData.append('title', title.value)
    formData.append('description', description.value)
    formData.append('age_restricted', ageRestricted.value.toString())

    // Use XMLHttpRequest for progress tracking
    const response = await new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      xhr.addEventListener('load', () => {
        resolve(new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((acc, line) => {
            const [key, value] = line.split(': ')
            if (key && value) acc[key] = value
            return acc
          }, {} as Record<string, string>))
        }))
      })

      xhr.addEventListener('error', () => reject(new Error('Upload failed')))
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

      xhr.open('POST', 'http://api.localhost/video/upload')
      xhr.withCredentials = true
      xhr.send(formData)
    })

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response:', text)
      throw new Error(`Server returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    console.log('Upload successful:', data)

    // Redirect to user page or video page after successful upload
    router.push('/user')
    // Or redirect to the uploaded video: router.push(`/video/${data.id}`)

  } catch (error) {
    console.error('Upload error:', error)
    uploadError.value = error instanceof Error ? error.message : 'Upload failed'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// Video-Upload Handler
function handleVideoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    videoFile.value = target.files[0]
    videoURL.value = URL.createObjectURL(target.files[0])
    uploadError.value = null
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

  <!-- Error Message -->
  <div v-if="uploadError" class="error-message">
    {{ uploadError }}
  </div>

  <!-- Upload Progress -->
  <div v-if="uploading" class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
    </div>
    <p>Uploading: {{ uploadProgress }}%</p>
  </div>

  <!-- Video Preview -->
  <div v-if="videoURL" class="video-preview">
    <video :src="videoURL" controls width="400"></video>
  </div>

  <div class="form-container">
    <label for="title">Title:</label><br>
    <input id="title" v-model="title" type="text" placeholder="Enter title" :disabled="uploading" />
    <br>

    <label for="description">Description:</label><br>
    <textarea id="description" v-model="description" placeholder="Enter description" :disabled="uploading"></textarea>
    <br>

    <label for="age-restricted">
      <input id="age-restricted" v-model="ageRestricted" type="checkbox" :disabled="uploading" />
      Age Restricted
    </label>
    <br>

    <label for="video">Video Upload:</label><br>
    <input id="video" type="file" accept="video/*" @change="handleVideoUpload" :disabled="uploading" />
    <br>

    <button class="upload" @click="submitForm" :disabled="uploading">
      {{ uploading ? 'Uploading...' : 'Upload' }}
    </button>
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

.upload:disabled {
  background-color: #6c7a89;
  cursor: not-allowed;
}

.video-preview {
  margin: 20px 0;
}

.error-message {
  color: #ee4266;
  background-color: #ffeef1;
  padding: 12px;
  border-radius: 5px;
  margin: 20px 0;
  border: 1px solid #ee4266;
}

.progress-container {
  margin: 20px 0;
}

.progress-bar {
  width: 400px;
  height: 30px;
  background-color: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #3D5A80;
  transition: width 0.3s ease;
}
</style>
