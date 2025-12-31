<template>
  <div class="video-container">
    <video
      ref="videoPlayer"
      controls
      preload="auto"
      :width="width"
      :height="height"
      class="video-player"
    >
      <source :src="fullVideoUrl" :type="videoType" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script lang="ts">
export default {
  name: 'VideoPlayer',
  props: {
    videoPath: {
      type: String,
      required: true,
    },
    width: {
      type: [String, Number],
      default: 640,
    },
    height: {
      type: [String, Number],
      default: 360,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    controls: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      cdnBase: 'http://cdn.myfairpipe.com/video/',
    }
  },
  computed: {
    fullVideoUrl() {
      return `${this.cdnBase}${this.videoPath}`
    },
    videoType() {
      const extension = this.videoPath.split('.').pop().toLowerCase()
      const mimeTypes = {
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        mkv: 'video/x-matroska',
      }
      return mimeTypes[extension] || 'video/mp4'
    },
  },
  mounted() {
    if (this.autoplay) {
      this.$refs.videoPlayer.autoplay = true
    }
  },
}
</script>

<style scoped>
.video-container {
  max-width: 100%;
  margin: 0 auto;
}

.video-player {
  width: 100%;
  height: auto;
  display: block;
}
</style>
