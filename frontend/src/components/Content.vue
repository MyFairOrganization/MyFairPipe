<script lang="ts">
import { h, onBeforeUnmount, ref } from "vue";
import Hls from 'hls.js'

/**
 * CDN PATH
 * @type {string}
 */
export const cdnPath = 'http://cdn.myfairpipe.com/video/%PATH';
const videoPath = 'http://cdn.myfairpipe.com%PATH';

/**
 * Function to get all Videos uploaded from User: userID
 * @param userID            Uploader
 * @returns {Promise<any>}
 * @constructor
 */
async function GetVideosForUser(userID) {
    const params = new URLSearchParams();
    params.append('id', userID);

    try {
        const res = await fetch(`http://api.myfairpipe.com/video/get_for?${params}`);

        if (res.ok) {
            return await res.json();
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * Function to get Videos
 * @param limit                 Amount of videos
 * @param offset                Offset from 0
 * @returns {Promise<number[]>}
 * @constructor
 */
async function GetVideos(limit, offset) {
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('offset', offset);

    try {
        const res = await fetch(`http://api.myfairpipe.com/sorting/get?${params}`);

        if (res.ok) {
            const data = await res.json();
            return data.cachedVids;
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * Get Video ids
 * @param limit     limits amount of videos
 * @param offset    offset from 0
 * @param userID    set if only videos from this user
 * @returns {Promise<*[]>}
 * @constructor
 */
export async function GetIMGs(limit = 0, offset = 0, userID = undefined) {
    let ids
    if (userID === undefined) {
        ids = await GetVideos(limit, offset);
    } else {
        ids = await GetVideosForUser(userID);
    }

    const result = [];

    if (ids !== undefined) {
        for (let id of ids) {
            if (id instanceof Object) {
                id = id.video_id;
            }
            const params = new URLSearchParams();
            params.append('id', id);

            const datails = await fetch(`http://api.myfairpipe.com/video/get?${params}`);
            const data = await datails.json();

            const thumbnailPath = data.thumbnail_path;
            const title = data.title;

            result.push({
                id,
                title: title,
                src: cdnPath.replace('%PATH', String(thumbnailPath)),
            })
        }
    }

    return result;
}

/**
 * Function for dynamically rendering video with
 * @param path              path to video in cdn
 * @param subtitles         path to subtitles
 * @param subtitleLanguage  language of subtitles
 * @param subtitleCode      ISO-639 code
 * @returns {VNode}
 * @constructor
 */
export function CreateVID(path: string, subtitles: string, subtitleLanguage: string, subtitleCode: string) {
    var type = path.split('.').pop()

    console.log(type)

    if (type.toLowerCase() === 'mp4' || type.toLowerCase() === 'mkv') {
        type = 'video/mp4'
    } else if (type.toLowerCase() === 'mov') {
        type = 'video/quicktime'
    }

    const veryHigh = cdnPath.replace('%PATH', '/video/70/1080p/1080p.mp4');
    const high = cdnPath.replace('%PATH', '/video/70/720p/720p.mp4');
    const low = cdnPath.replace('%PATH', '/video/70/480p/480p.mp4');
    const veryLow = cdnPath.replace('%PATH', '/video/70/360p/360p.mp4');


    return h('div', {class: 'video-block'}, [
        h(
            'video',
            {
                class: 'video',
                controls: true,
                preload: 'metadata',
                crossorigin: 'anonymous',
            },
            [
                h('source', {
                    src: cdnPath.replace('%PATH', path),
                    type: type,
                }),
                h('track', {
                    src: cdnPath.replace('%PATH', subtitles),
                    type: 'text/vtt',
                    kind: 'subtitles',
                    label: subtitleLanguage,
                    srclang: subtitleCode,
                }),
            ],
        ),
    ])
}

export function CreateVIDHLS(
    hlsPath: string,
    subtitles: string,
    subtitleLanguage: string,
    subtitleCode: string,
) {
    let hls: Hls | null = null
    let showError = ref(false)

    hlsPath = videoPath.replace('%PATH', hlsPath)

    return h(
        'div',
        { class: 'video-block' },
        [
            h('video', {
                class: 'video',
                controls: true,
                crossorigin: 'anonymous',

                onVnodeMounted(vnode) {
                    const video = vnode.el as HTMLVideoElement
                    if (!video) {
                        return h('p', 'Video is not available');
                    }

                    video.muted = false;
                    video.volume = 1.0;

                    // Add error event listener
                    video.addEventListener('error', () => {
                        showError.value = true
                    })

                    if (Hls.isSupported()) {
                        hls = new Hls({
                            startPosition: 0,
                        })
                        try {
                            hls.attachMedia(video);
                            hls.loadSource(hlsPath);
                        } catch (e) {
                            return h('p', 'Video is not available');
                        }

                        // Add HLS error handling
                        hls.on(Hls.Events.ERROR, (event, data) => {
                            if (data.fatal) {
                                showError.value = true
                            }
                        })
                    }
                    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = hlsPath
                    }
                },

                onVnodeBeforeUnmount() {
                    hls?.destroy();
                    hls = null;
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
            showError.value ? h('p', 'This video is not available') : null
        ].filter(Boolean),
    )
}

</script>
