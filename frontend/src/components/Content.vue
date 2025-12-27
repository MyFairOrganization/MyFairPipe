<script>
import { h } from 'vue'
import { useRouter } from 'vue-router'

export const videoPath = 'http://cdn.myfairpipe.com:9000/video/%ID/%ID.mp4'
const imagePath = 'http://cdn.myfairpipe.com:9000/video/%PATH'

//http://cdn.10.2.23.92:9000/image/%ID/master.m3u8

async function getVideosForUser(userID) {
  const params = new URLSearchParams()
  params.append('id', userID)

  try {
    const response = await fetch(`http://api.myfairpipe.com/video/get_for?${params}`)

    if (response.ok) {
      const data = await response.json()
      console.log(data)
      return data
    } else {
      console.log(response)
    }
  } catch (e) {
    console.error(e)
  }
}

async function getVideos(limit, offset) {
  const params = new URLSearchParams()
  params.append('limit', limit)
  params.append('offset', offset)

  try {
    const response = await fetch(`http://api.myfairpipe.com/sorting/get?${params}`)

    if (response.ok) {
      const data = await response.json()
      return data.cachedVids
    } else {
      console.log(response)
    }
  } catch (e) {
    console.error(e)
  }
}

export async function getIMGs(limit = 0, offset = 0, userID = undefined) {
  var ids;
  if (userID === undefined) {
    ids = await getVideos(limit, offset)
  } else {
    ids = await getVideosForUser(userID)
  }
  console.log(ids)

  const result = []

  for (let id of ids) {
    console.log(id)
    if (id instanceof Object) {
      id = id.video_id
    }
    const params = new URLSearchParams()
    params.append('id', id)

    const details = await fetch(`http://api.myfairpipe.com/video/get?${params}`)
    const data = await details.json()

    const thumbnailPath = data.thumbnail_path
    const title = data.title

    result.push({
      id,
      title: title,
      src: imagePath.replace('%PATH', String(thumbnailPath)),
    })
  }

  return result
}

function createIMG(id, title) {
  const router = useRouter()

  return h(
    'div',
    {
      class: 'image-block',
      onClick(event) {
        router.push({ name: 'player', query: { id: id } })
      },
    },
    [
      h('img', {
        src: imagePath.replace('%ID', id),
        width: '320',
        height: '180',
        class: 'thumbnail',
      }),
      h('p', { class: 'description' }, title),
    ],
  )
}

export function createVID(id) {
  return h('div', { class: 'video-block' }, [
    h(
      'video',
      {
        width: '90%',
        aspectRatio: '16 / 9',
        height: 'auto',
        class: 'video',
        controls: true,
        preload: 'metadata',
      },
      [
        h('source', {
          src: videoPath.replaceAll('%ID', id),
          //type: 'application/x-mpegURL',
          type: 'video/mp4',
        }),
      ],
    ),
  ])
}
</script>
