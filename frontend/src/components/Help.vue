<template>
    <div class="help-page">
        <section class="hero">
            <h1>MyFairPipe Help-Center</h1>
        </section>

        <section class="content">
            <h2>Common issues</h2>
            <p>
                After uploading a video, the video might not appear on the Homepage at first.
                That is because our Like-based Algorithm that sorts the videos on our Homepage by likes and dislikes
                only updates once every Minute, so you might have to wait a bit until your video shows up.
                While waiting you can check if the video was uploaded correctly on your Userpage.
            </p>
            <p>
                If your recently uploaded video shows a "This video is currently unavailable" message,
                it is likely that our background processes, such as converting your uploaded video into a format that our service can handle,
                or generating subtitles if none where uploaded initially. So you might need to be a bit more patient and wait a few minutes
                until your video is processed.
            </p>

        </section>
    </div>
</template>

<style scoped>
.help-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    line-height: 1.6;
}

.hero {
    text-align: center;
    margin-bottom: 2.5rem;
}

.hero h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.tagline {
    font-size: 2rem;
    color: #666;
}

.content h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;
}

.content p {
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #333;
}
</style>
<script setup lang="ts">
</script>