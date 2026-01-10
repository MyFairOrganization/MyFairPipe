<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'

const username = ref('')
const title = ref('')
const description = ref('')
const ageRestricted = ref(false)
const videoFile = ref<File | null>(null)
const thumbnailFile = ref<File | null>(null)
const subtitleFile = ref<File | null>(null)
const language = ref<string | null>(null)
const languageShort = ref<string | null>(null)
const videoURL = ref<string | null>(null)
const thumbnailURL = ref<string | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref<string | null>(null)
const router = useRouter()

const maxFileSize = 4 * 1024 * 1024 * 1024

onMounted(async () => {
    const req = await fetch(`https://api.myfairpipe.com/user/get`, {
        credentials: 'include',
    })
    const user = await req.json()
    if (user.user.anonym) {
        router.push('/home')
    } else {
        username.value = user.user.username
    }
})

// --- Handlers for file selection ---
function handleVideoUpload(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        videoFile.value = target.files[0]
        videoURL.value = URL.createObjectURL(target.files[0])
        uploadError.value = null
    }
}

function handleThumbnailUpload(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        thumbnailFile.value = target.files[0]
        thumbnailURL.value = URL.createObjectURL(target.files[0])
    }
}

function handleSubtitleUpload(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        subtitleFile.value = target.files[0]
    }
}

// --- Upload Functions ---
async function uploadVideo() {
    if (!videoFile.value) return;

    const formData = new FormData();
    formData.append('file', videoFile.value);
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('age_restricted', ageRestricted.value.toString());
    if (subtitleFile.value) {
        formData.append('subtitles', 'true');
    } else {
        formData.append('subtitles', 'false');
    }

    let finalData

    const promise = await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                uploadProgress.value = Math.round((e.loaded / e.total) * 100)
            }
        })

        xhr.addEventListener('load', async () => {
            const contentType = xhr.getResponseHeader('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Non-JSON response:', xhr.responseText)
                reject(new Error(`Server returned ${xhr.status}: ${xhr.statusText}`))
                return
            }

            const data = JSON.parse(xhr.responseText)
            if (xhr.status >= 400) {
                reject(new Error(data.error || 'Upload failed'))
                return
            }

            resolve();
            finalData = data;
        })

        xhr.addEventListener('error', () => {return reject(new Error('Upload failed'))})
        xhr.addEventListener('abort', () => {return reject(new Error('Upload cancelled'))})

        xhr.open('POST', 'https://api.myfairpipe.com/video/upload')
        xhr.withCredentials = true
        xhr.send(formData)
        xhr.DONE
    })

    return {promise, finalData}
}

async function uploadThumbnail(id: number) {
    if (!thumbnailFile.value) return

    const formData = new FormData()
    formData.append('file', thumbnailFile.value)
    formData.append('id', String(id))

    let finalData

    const promise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.addEventListener('load', async () => {
            const contentType = xhr.getResponseHeader('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Non-JSON response:', xhr.responseText)
                reject(new Error(`Server returned ${xhr.status}: ${xhr.statusText}`))
                return
            }

            const data = JSON.parse(xhr.responseText)
            if (xhr.status >= 400) {
                reject(new Error(data.error || 'Thumbnail upload failed'))
                return
            }

            finalData = data
        })

        xhr.addEventListener('error', () => {return reject(new Error('Thumbnail upload failed'))})
        xhr.addEventListener('abort', () => {return reject(new Error('Thumbnail upload cancelled'))})

        xhr.open('POST', 'https://api.myfairpipe.com/thumbnail/upload')
        xhr.withCredentials = true
        xhr.send(formData)
        xhr.DONE
    })

    return {promise, finalData}
}

async function uploadSubtitle(id: number) {
    if (!subtitleFile.value || !language.value || !languageShort.value) return
    const formData = new FormData()
    formData.append('file', subtitleFile.value)
    formData.append('id', String(id))
    formData.append('language', language.value)
    formData.append('language_short', languageShort.value)

    const res = await fetch('https://api.myfairpipe.com/subtitles/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Subtitle upload failed')
}

// --- Main Form Submission ---
async function submitForm() {
    // Validation
    if (!videoFile.value) {
        uploadError.value = 'Please select a video file'
        return
    }

    if (!thumbnailFile.value) {
        uploadError.value = 'Please select a thumbnail file'
        return
    }

    if (!title.value || !description.value) {
        uploadError.value = 'Title and description are required'
        return
    }

    if (videoFile.value.size > maxFileSize) {
        const sizeMB = Math.round(videoFile.value.size / (1024 * 1024))
        const maxMB = Math.round(maxFileSize / (1024 * 1024))
        uploadError.value = `File too large (${sizeMB}MB). Maximum size is ${maxMB}MB`
        return
    }

    if (subtitleFile.value && (!language.value || !languageShort.value)) {
        uploadError.value = 'Please set Subtitle language and/or ISO 639 code'
    }

    uploading.value = true
    uploadProgress.value = 0
    uploadError.value = null

    try {
        const videoData = await uploadVideo()
        if (videoData?.finalData) {
            const videoId = videoData.finalData.id
            await uploadThumbnail(videoId)
            await uploadSubtitle(videoId)
        }
        router.push('/user')
    } catch (error) {
        console.error('Upload error:', error)
        uploadError.value = error instanceof Error ? error.message : 'Upload failed'
    } finally {
        uploading.value = false
        uploadProgress.value = 0
    }
}
</script>

<template>
    <div class="uploadForm">
        <div class="preview">
            <div v-if="videoURL" class="video-preview">
                <p>Video to be Uploaded:</p>
                <video :src="videoURL" :type="videoFile?.type" controls width="400"></video>
            </div>

            <div v-if="thumbnailURL" class="video-preview">
                <p>Thumbnail to be Uploaded:</p>
                <img :src="thumbnailURL" width="400"/>
            </div>
        </div>

        <div class="form-container">
            <label for="title">Title: *</label><br/>
            <input
                id="title"
                v-model="title"
                :disabled="uploading"
                placeholder="Enter title"
                type="text"
                required
            /><br/>

            <label for="description">Description:*</label><br/>
            <textarea
                id="description"
                v-model="description"
                :disabled="uploading"
                placeholder="Enter description"
                required
            ></textarea
            ><br/>

            <label for="video">Video Upload: *</label><br/>
            <input
                id="video"
                :disabled="uploading"
                accept="video/*"
                type="file"
                @change="handleVideoUpload"
                required
            /><br/><br/>

            <label for="thumbnail">Thumbnail Upload: *</label><br/>
            <input
                id="thumbnail"
                accept="image/*"
                required
                type="file"
                @change="handleThumbnailUpload"
            /><br/><br/>

            <label for="subtitle">Subtitle Upload: </label><br/>
            <input id="subtitle" v-if="subtitleFile" accept="text/vtt" type="file" @change="handleSubtitleUpload"/><br/>
            <input id="language" v-if="subtitleFile" v-model="language" placeholder="Language"/><br/>
            <input
                id="language_short"
                v-model="languageShort"
                placeholder="ISO 639 language code"
            /><br/><br/>

            <div v-if="uploadError" class="error-message">
                {{ uploadError }}
            </div>

            <div v-if="uploading" class="progress-container">
                <div class="progress-bar">
                    <div :style="{ width: uploadProgress + '%' }" class="progress-fill"></div>
                </div>
                <p>Uploading: {{ uploadProgress }}%</p>
            </div>

            <button :disabled="uploading" class="upload" @click="submitForm">
                {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.pfp {
    width: 250px;
    height: 250px;
    border-radius: 50%;
    object-fit: cover;
}

.uploadForm {
    display: flex;
    flex-direction: column;
    width: 70%;
    padding-left: 10%;
}

.user {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 900px;
    height: 250px;
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

.form-container input,
.form-container textarea {
    width: 100%;
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
    background-color: #3d5a80;
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

.video-preview video {
    aspect-ratio: 16 / 9;
    background-color: #3D5A80;
    border-radius: 10px;
}

.video-preview img {
    aspect-ratio: 16 / 9;
    background-color: #3D5A80;
    object-fit: contain;
    border-radius: 10px;
}

.preview {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
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
    background-color: #3d5a80;
    transition: width 0.3s ease;
}
</style>