<template>
    <component :is="CreateVIDHLS(<string>hlsPath, <string>subtitles, <string>subtitleLanguage, <string>subtitleCode)" />
</template>

<script setup lang="ts">
import Hls from 'hls.js'
import { h } from "vue";

const props = defineProps({
    hlsPath: String,
    subtitles: String,
    subtitleLanguage: String,
    subtitleCode: String,
})

export const cdnPath = 'http://cdn.myfairpipe.com/video/%PATH';
const videoPath = 'http://cdn.myfairpipe.com%PATH';

/* props */
export function CreateVIDHLS(
    hlsPath: string,
    subtitles: string,
    subtitleLanguage: string,
    subtitleCode: string,
) {
    let hls: Hls | null = null

    hlsPath = videoPath.replace('%PATH', hlsPath)

    return h(
        'div',
        { class: 'video-block' },
        [
            h('video', {
                class: 'video',
                controls: true,
                preload: 'metadata',
                crossorigin: 'anonymous',

                onVnodeMounted(vnode) {
                    const video = vnode.el as HTMLVideoElement
                    if (!video) return

                    // Initialize audio state early
                    video.muted = false
                    video.volume = 1.0

                    // Safari (native HLS)
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = hlsPath

                        // Safari sometimes needs this after metadata
                        video.addEventListener('loadedmetadata', () => {
                            video.muted = false
                            video.volume = 1.0
                        }, { once: true })
                    }
                    // hls.js browsers
                    else if (Hls.isSupported()) {
                        hls = new Hls({
                            enableWorker: true,
                            capLevelToPlayerSize: true,
                        })

                        hls.attachMedia(video)
                        hls.loadSource(hlsPath)

                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            // 🔑 unlock audio
                            video.muted = false
                            video.volume = 1.0

                            // 🔑 ensure an audio track is selected
                            if (hls && hls.audioTracks && hls.audioTracks.length > 0) {
                                hls.audioTrack = 0
                            }
                        })
                    }
                },

                onVnodeBeforeUnmount() {
                    hls?.destroy()
                    hls = null
                },
            }, [
                h('track', {
                    src: cdnPath.replace('%PATH', subtitles),
                    kind: 'subtitles',
                    srclang: subtitleCode,
                    label: subtitleLanguage,
                    default: true,
                }),
            ]),
        ],
    )
}
</script>
