<template>
    <div class="about-page">
        <section class="hero">
            <h1>About MyFairPipe</h1>
            <p class="tagline">
                A fair, privacy-focused video streaming platform.
            </p>
        </section>

        <section class="content">
            <h2>What is MyFairPipe?</h2>
            <p>
                MyFairPipe is a web-streaming platform created as a school project.
                It is similar to popular video platforms, but with a strong focus on
                anonymity, fairness, and data safety.
            </p>

            <h2>Our Idea</h2>
            <p>
                Many video platforms require users to share large amounts of personal
                data. With MyFairPipe, we wanted to explore an alternative approach:
                allowing people to watch content without needing to log in or provide
                personal information.
            </p>

            <h2>Anonymity & Data Safety</h2>
            <p>
                Watching videos on MyFairPipe does not require an account.
                We do not collect personal user data for viewing content.
            </p>
            <p>
                Creating an account is only required if a user wants to upload videos.
                In that case, only the data necessary for account functionality
                (such as login credentials) is used.
            </p>

            <h2>Our Vision</h2>
            <p>
                We believe that online platforms should respect users and their privacy.
                MyFairPipe is our attempt to show that video streaming can work with
                fewer barriers and less data collection.
            </p>
        </section>
    </div>
</template>

<style scoped>
.about-page {
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
