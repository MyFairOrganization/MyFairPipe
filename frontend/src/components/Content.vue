<script>
import { h } from 'vue'
import { useRouter } from 'vue-router'

export const videoPath = 'https://calls.ars.electronica.art/2025/u19/asset/1068863'
const imagePath =
	'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg'

//http://cdn.10.2.23.92:9000/image/%ID/master.m3u8
export function createIMG(id, desc) {
	const router = useRouter()

	return h('div', {
			class: 'image-block',
			aspectRatio: '16 / 9',
			onClick(event) {
				router.push({ name: 'player', query: { desc: desc, id: id } })
			},
		}, [
			h('img', {
				src: imagePath.replace('%ID', id),
				width: '320',
				height: '180',
				class: 'thumbnail',
			}),
			h('p', { class: 'description' }, desc),
		],
	)
}

export function createVID(id, desc) {
	return h('div', { class: 'video-block' }, [
		h(
			'video', {
				width: '150%',
				aspectRatio: '16 / 9',
				height: 'auto',
				class: 'video',
				controls: true,
			}, [
				h('source', {
					src: videoPath,
					//type: 'application/x-mpegURL',
					type: 'video/mp4'
				}),
			],
		),
	])
}
</script>
