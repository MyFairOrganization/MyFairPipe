<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'

/**
 * Vue router.
 */
const ROUTER = useRouter();

/**
 * Vue refs for HTML contents.
 */
const USER_NAME = ref('User Name');
const USER_DESCRIPTION = ref('This is a brief user description.');
const USER_IMAGE = ref('');
const PFP_FILE = ref<File | null>(null);

/**
 * Executed after site loaded.
 */
onMounted(async () => {
  const REQ = await fetch(`http://api.myfairpipe.com/user/get`, {
    credentials: 'include',
  });
  const USER = await REQ.json();
  if (USER.user.anonym) {
    ROUTER.push('/home');
  }

  loadProfile();
  loadProfilePicture();
})

/**
 * Loads Profile data. (Username and bio)
 */
function loadProfile() {
  const XHR = new XMLHttpRequest();
  XHR.open('GET', 'http://api.myfairpipe.com/user/get', true);
  XHR.withCredentials = true;

  XHR.onload = () => {
    if (XHR.status === 200) {
      const DATA = JSON.parse(XHR.responseText)
      USER_NAME.value = DATA.user.displayname;
      USER_DESCRIPTION.value = DATA.user.bio;
    }
  }

  XHR.send();
}

/**
 * Loads profile picture.
 */
function loadProfilePicture() {
  const XHR = new XMLHttpRequest();
  XHR.open('GET', 'http://api.myfairpipe.com/user/picture/get', true);
  XHR.withCredentials = true;

  XHR.onload = () => {
    if (XHR.status === 200) {
      const DATA = JSON.parse(XHR.responseText);

      if (DATA.photo_url) {
        USER_IMAGE.value = `${DATA.photo_url}?v=${Date.now()}`;
      } else {
        USER_IMAGE.value = '/pfpExample.png';
      }
    }
  }

  XHR.send();
}

/**
 * Uploads changes to db.
 */
function applyChanges() {
  uploadPfp();
  const XHR = new XMLHttpRequest();
  XHR.open('PATCH', 'http://api.myfairpipe.com/user/update', true);
  XHR.withCredentials = true;

  const FORMDATA = new FormData();
  FORMDATA.append('displayName', USER_NAME.value);
  FORMDATA.append('bio', USER_DESCRIPTION.value);

  XHR.onload = () => {
    if (XHR.status !== 200) {
      console.error('Profile update failed:', XHR.responseText);
    }
  }

  XHR.send(FORMDATA);
  ROUTER.push('/user');
}

/**
 * Sets PFP in HTML.
 * @param event
 */
function handleFileUpload(event: Event) {
  const TARGET = event.target as HTMLInputElement;
  if (!TARGET.files || !TARGET.files[0]) return;

  // Optimistic preview
  PFP_FILE.value = TARGET.files[0];
  USER_IMAGE.value = URL.createObjectURL(PFP_FILE.value);
}

/**
 * Uploads PFP to db.
 */
async function uploadPfp() {
  const XHR = new XMLHttpRequest();
  XHR.open('POST', 'http://api.myfairpipe.com/user/picture/upload', true);
  XHR.withCredentials = true;

  const formData = new FormData();
  formData.append('file', PFP_FILE.value);

  XHR.onload = () => {
    if (XHR.status === 200) {
      // Reload real CDN image
      loadProfilePicture();
    } else {
      console.error('Profile picture upload failed:', XHR.responseText);
    }
  }

  XHR.send(formData);
}

/**
 * Returns to User-page.
 */
function back() {
  ROUTER.push('/user');
}

/**
 * Constants for Videos and loading.
 */
const THUMBNAILS = ref([]);
const LOADING = ref(true);
</script>

<template>
  <div class="container">
    <div class="pfp-container">
      <img class="pfp" :src="USER_IMAGE" alt="Profile Picture" />
      <input type="file" accept="image/*" @change="handleFileUpload" />
    </div>

    <div class="user">
      <div class="left">
        <input type="text" v-model="USER_NAME" class="name-input" />
        <textarea v-model="USER_DESCRIPTION" class="descr-input"></textarea>
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
  margin: 100px 5em 30%;
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
</style>