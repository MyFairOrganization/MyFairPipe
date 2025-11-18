<script setup lang="ts">

</script>

<template>
    <div class="container">
        <img class="pfp" src="/pfpExample.png"></img>
            <div class="user">
                <h1>User Name</h1>
                <p id="descr">This is a brief user description.</p>
                <button id="b1">Channel information</button>
            </div>
    </div>
    <hr class="line">

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

</style>