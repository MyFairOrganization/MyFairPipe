<script lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'

const videoPath = 'https://calls.ars.electronica.art/2025/u19/asset/1068863'
const imagePath =
  'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg'

//http://cdn.10.2.23.92:9000/image/%ID/master.m3u8
export function createIMG(id, desc) {
  const router = useRouter()

  return h(
    'div',
    {
      class: `
        p-2.5
        rounded-[20px]
        cursor-pointer
        hover:bg-[#c9eef0]
        active:shadow-[0_0_5px_5px_#ee6c4d]
        active:[&>.thumbnail]:blur-[2px]
        transition
      `,
      aspectRatio: '16 / 9',
      onClick() {
        router.push({ name: 'player', query: { desc: desc, id: id } })
      },
    },
    [
      h('img', {
        src: imagePath.replace('%ID', id),
        width: '320',
        height: '180',
        class: `
          w-[320px]
          h-[180px]
          object-cover
          rounded-[15px]
          thumbnail
        `,
      }),
      h(
        'p',
        {
          class: `
            text-gray-700
            text-sm
            mt-2
            description
          `,
        },
        desc,
      ),
    ],
  )
}

export function createVID(id, desc) {
  return h('div', { class: 'flex flex-col gap-2 video-block' }, [
    h(
      'video',
      {
        width: '150%',
        height: 'auto',
        aspectRatio: '16 / 9',
        class: `
            rounded-[20px]
            -z-[100000000]
          `,
        controls: true,
      },
      [
        h('source', {
          src: videoPath,
          type: 'video/mp4',
        }),
      ],
    ),
    h(
      'h2',
      {
        class: `
            text-lg
            font-semibold
            description
          `,
      },
      desc,
    ),
  ])
}
</script>
