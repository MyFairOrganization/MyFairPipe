<script lang="ts">
import { h, onBeforeUnmount, ref } from "vue";
import Hls from 'hls.js'
import {num} from "video.js";

/**
 * CDN PATH
 * @type {string}
 */
export const cdnPath = 'https://cdn.myfairpipe.com/video/%PATH';

/**
 * Function to get all Videos uploaded from User: userID
 * @param userID            Uploader
 * @returns {Promise<any>}
 * @constructor
 */
async function GetVideosForUser(userID: string) {
  const params = new URLSearchParams();
  params.append('id', userID);

  try {
    const res = await fetch(`https://api.myfairpipe.com/video/get_for?${params}`);

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
async function GetVideos(limit: number, offset: number) {
  const params = new URLSearchParams();
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  try {
    const res = await fetch(`https://api.myfairpipe.com/sorting/get?${params}`);

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

      const datails = await fetch(`https://api.myfairpipe.com/video/get?${params}`);
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
</script>
