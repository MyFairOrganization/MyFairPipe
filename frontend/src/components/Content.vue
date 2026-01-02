<script>
import {h} from 'vue';

/**
 * CDN PATH
 * @type {string}
 */
export const CDN_PATH = 'http://cdn.myfairpipe.com/video/%PATH';

/**
 * Function to get all Videos uploaded from User: userID
 * @param userID            Uploader
 * @returns {Promise<any>}
 * @constructor
 */
async function GetVideosForUser(userID) {
    const PARAMS = new URLSearchParams();
    PARAMS.append('id', userID);

    try {
        const RESPONSE = await fetch(`http://api.myfairpipe.com/video/get_for?${PARAMS}`);

        if (RESPONSE.ok) {
            return await RESPONSE.json();
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
    const PARAMS = new URLSearchParams();
    PARAMS.append('limit', limit);
    PARAMS.append('offset', offset);

    try {
        const RESPONSE = await fetch(`http://api.myfairpipe.com/sorting/get?${PARAMS}`);

        if (RESPONSE.ok) {
            const DATA = await RESPONSE.json();
            return DATA.cachedVids;
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
    var ids
    if (userID === undefined) {
        ids = await GetVideos(limit, offset);
    } else {
        ids = await GetVideosForUser(userID);
    }

    const RESULT = [];

    if (ids !== undefined) {
        for (let id of ids) {
            if (id instanceof Object) {
                id = id.video_id;
            }
            const PARAMS = new URLSearchParams();
            PARAMS.append('id', id);

            const DETAILS = await fetch(`http://api.myfairpipe.com/video/get?${PARAMS}`);
            const DATA = await DETAILS.json();

            const THUMBNAIL_PATH = DATA.thumbnail_path;
            const TITLE = DATA.title;

            RESULT.push({
                id,
                title: TITLE,
                src: CDN_PATH.replace('%PATH', String(THUMBNAIL_PATH)),
            })
        }
    }

    return RESULT;
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
export function CreateVID(path, subtitles, subtitleLanguage, subtitleCode) {
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
                    src: CDN_PATH.replace('%PATH', path),
                    type: 'video/mp4',
                }),
                h('track', {
                    src: CDN_PATH.replace('%PATH', subtitles),
                    type: 'text/vtt',
                    kind: 'subtitles',
                    label: subtitleLanguage,
                    srclang: subtitleCode,
                }),
            ],
        ),
    ])
}
</script>