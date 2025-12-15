<script setup lang="ts">
    import { getIMGs } from './Content.vue'
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'

    const router = useRouter();

    function upload(){
        router.push('/upload');
    }
    function edit(){
        router.push('/edituser');
    }
</script>

<template>
    <div class="container">
        <img class="pfp" src="/pfpExample.png"></img>
            <div class="user">
                <div class="left">
                    <h1>User Name</h1>
                    <p id="descr">This is a brief user description.</p>
                    <button id="b1">Channel information</button>
                </div>

                <div class="right">
                    <button class="btn" @click="upload">Upload Video</button>
                    <button class="btn" @click="edit">Edit Account</button>
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

.container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 50px;
    margin-left: 7em;
}

.user {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 900px;
    height: 250px;
    background-color: #98C1D9;
    padding: 20px 30px;
    border-radius: 10px;
    gap: 20px;
}

.left h1 {
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

.right {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    background-color: #3D5A80;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin: 5px 0;
}

.line {
    border: none;
    border-top: 1px solid #939393;
    width: 100%;
    margin-bottom: 50px;
}

#thumbnails {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.thumbnail img {
    width: 150px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
}

</style>
