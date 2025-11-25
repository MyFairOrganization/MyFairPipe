<script setup lang="ts">
import { createIMG } from './Content.vue'

</script>

<template>
    <div class="container">
        <img class="pfp" src="/pfpExample.png"></img>
            <div class="user">
                <h1>User Name</h1>
                <p id="descr">This is a brief user description.</p>
                <button id="b1">Channel information</button>
                <div class="buttons">
                    <button class="btn">Upload Video</button>
                    <button class="btn">Start Livestream</button>
                    <button class="btn">Edit Account</button>
                </div>
            </div>
    </div>
    <hr class="line">
    <div id="thumbnails">
			<component
				v-for="i in 24"
				:key="i"
				:is="
					createIMG(
						'https://static.vecteezy.com/ti/gratis-vektor/p1/7160087-video-symbol-video-symbol-play-video-zeichen-kostenlos-vektor.jpg',
						'testVideo' + i,
					)
				"
			/>
		</div>

</template>

<style scoped>
    .pfp {
        width: 250px;
        height: 250px;
        border-radius: 50%;
        object-fit: cover;
    }
    .user {
        width: 900px;
        height: 250px;
        background-color: #98C1D9;
        padding: 20px;
        padding-left: 30px;
        border-radius: 10px;
    }
    .container {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 50px;
    }
    #b1 {
        margin-top: 5px;
        padding: 10px 20px;
        background-color: transparent;
        color: #293241;
        border: 1px solid #293241;
        border-radius: 20px;
        cursor: pointer;
    }
    h1 {
        font-weight: bold;
        font-size: 4em;
    }
    #descr {
        font-size: 1.5em;
        margin-bottom: 10px;
    }
    .line {
        border: none;
        border-top: 1px solid #939393;
        width: 100%;
        margin-bottom: 50px;
    }
    .user {
        display: flex;
        justify-content: space-between; /* Text links, Buttons rechts */
        align-items: center; /* vertikal zentriert */
        width: 900px;
        height: 250px;
        background-color: #98C1D9;
        padding: 20px 30px;
        border-radius: 10px;
        gap: 20px;
    }

    .user-info h1 {
        font-weight: bold;
        font-size: 4em;
        margin: 0;
    }

    #descr {
        font-size: 1.5em;
        margin: 10px 0;
    }

    #b1 {
        margin-top: 5px;
        padding: 10px 20px;
        background-color: transparent;
        color: #293241;
        border: 1px solid #293241;
        border-radius: 20px;
        cursor: pointer;
    }

    /* Buttons rechts nebeneinander */
    .buttons {
        display: flex;
        flex-direction: column; /* vertikal anordnen */
        gap: 10px; /* Abstand zwischen Buttons */
    }

    .btn {
        padding: 10px 20px;
        background-color: #293241;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
    }
</style>