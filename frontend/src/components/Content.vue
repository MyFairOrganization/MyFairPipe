<script>
import { h } from 'vue'
import { useRouter } from 'vue-router'

export const videoPath = 'https://calls.ars.electronica.art/2025/u19/asset/1068863'
const imagePath =
	'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg'

//http://cdn.10.2.23.92:9000/image/%ID/master.m3u8

async function getVideos(limit, offset) {
    const params = new URLSearchParams()
    params.append('limit', limit)
    params.append('offset', offset)

    try {
        const response = await fetch(`http://api.myfairpipe.com/sorting/get?${params}`)

        if (response.ok) {
            const data = await response.json()
            return data.cachedVids;
        } else {
            console.log(response)
        }
    } catch (e) {
        console.error(e)
    }
}

export async function getIMGs(limit, offset) {
    const ids = await getVideos(limit, offset)
    console.log(ids)

    return ids.map((id) => ({
        id,
        title: "TestVideo " + id,
        src: imagePath.replace("%ID", String(id)),
    }));
}

function createIMG(id, title) {
    const router = useRouter();

	return h('div', {
			class: 'image-block',
			onClick(event) {
				router.push({ name: 'player', query: { desc: title, id: id } })
			},
		}, [
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
			'video', {
				width: '90%',
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
