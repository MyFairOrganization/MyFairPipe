<script lang="ts">
import { defineComponent, h, onBeforeUnmount, ref } from 'vue'
import Hls from 'hls.js'

/**
 * CDN PATH
 * @type {string}
 */
export const cdnPath = 'https://cdn.myfairpipe.com/video/%PATH'
const videoPath = 'https://cdn.myfairpipe.com%PATH'

/**
 * Function to get all Videos uploaded from User: userID
 * @param userID            Uploader
 * @returns {Promise<any>}
 * @constructor
 */
async function GetVideosForUser(userID) {
  const params = new URLSearchParams()
  params.append('id', userID)

  try {
    const res = await fetch(`https://api.myfairpipe.com/video/get_for?${params}`)

    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.error(e)
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
  const params = new URLSearchParams()
  params.append('limit', limit)
  params.append('offset', offset)

  try {
    const res = await fetch(`https://api.myfairpipe.com/sorting/get?${params}`)

    if (res.ok) {
      const data = await res.json()
      return data.cachedVids
    }
  } catch (e) {
    console.error(e)
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
    ids = await GetVideos(limit, offset)
  } else {
    ids = await GetVideosForUser(userID)
  }

  const result = []

  if (ids !== undefined) {
    for (let id of ids) {
      if (id instanceof Object) {
        id = id.video_id
      }
      const params = new URLSearchParams()
      params.append('id', id)

      const datails = await fetch(`https://api.myfairpipe.com/video/get?${params}`)
      const data = await datails.json()

      const thumbnailPath = data.thumbnail_path
      const title = data.title

      result.push({
        id,
        title: title,
        src: cdnPath.replace('%PATH', String(thumbnailPath)),
      })
    }
  }

  return result
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
export function CreateVID(
  path: string,
  subtitles: string,
  subtitleLanguage: string,
  subtitleCode: string,
) {
  let type = path.split('.').pop()

  console.log(type)

  if (type.toLowerCase() === 'mp4' || type.toLowerCase() === 'mkv') {
    type = 'video/mp4'
  } else if (type.toLowerCase() === 'mov') {
    type = 'video/quicktime'
  }

  const veryHigh = cdnPath.replace('%PATH', '/video/70/1080p/1080p.mp4')
  const high = cdnPath.replace('%PATH', '/video/70/720p/720p.mp4')
  const low = cdnPath.replace('%PATH', '/video/70/480p/480p.mp4')
  const veryLow = cdnPath.replace('%PATH', '/video/70/360p/360p.mp4')

  return h('div', { class: 'video-block' }, [
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

export const CreateVIDHLS = defineComponent({
  props: {
    hlsPath: { type: String, required: true },
    subtitles: { type: String, required: true },
    subtitleLanguage: { type: String, required: true },
    subtitleCode: { type: String, required: true },
  },

  setup(props) {
    const qualityMenu = ref<any[]>([])
    const showError = ref(false)
    let hls: Hls | null = null

    return () =>
      {return h('div', { class: 'video-block' }, [
        h('video', {
          class: 'video',
          controls: true,
          crossorigin: 'anonymous',

          onVnodeMounted(vnode) {
            const video = vnode.el as HTMLVideoElement

            if (!Hls.isSupported()) return

            hls = new Hls()
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
              qualityMenu.value = data.levels.map((l, i) => {return {
                index: i,
                height: l.height,
                bitrate: l.bitrate,
              }})
            })

            hls.attachMedia(video)
            hls.loadSource(props.hlsPath)
          },

          onVnodeBeforeUnmount() {
            hls?.destroy()
            hls = null
          },
        }),

        h(
          'div',
          { class: 'quality-menu' },
          qualityMenu.value.map((q) => {return h('div', { class: 'quality-option' }, q.height + 'p')}),
        ),

        showError.value && h('p', 'This video is not available'),
      ])}
  },
})
</script>
