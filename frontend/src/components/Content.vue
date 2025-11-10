<script>
import { h } from 'vue'
import { useRouter } from 'vue-router'

const videoPath = 'https://calls.ars.electronica.art/2025/u19/asset/1068863'
const imagePath =
  'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg'

//http://cdn.10.2.23.92:9000/image/%ID/master.m3u8
export function createIMG(id, desc) {
  const router = useRouter()

  return h('div', { class: 'video-block' }, [
    h('img', {
      src: imagePath.replace('%ID', id),
      width: '320',
      height: '180',
      class: 'thumbnail',
      onClick(event) {
        router.push({ name: 'player', query: { desc: desc, id: id } })
      },
    }),
    h('p', { class: 'description' }, desc),
  ])
}

export function createVID(id, desc) {
  return h('div', { class: 'video-block' }, [
    h('video', {
      src: videoPath,
      width: '150%',
      height: 'auto',
      class: 'video',
      controls: true,
    }),
    h('h1', { class: 'description' }, desc),
  ])
}
</script>
