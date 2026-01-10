<script lang="ts" setup>
import {RouterLink, RouterView, useRoute} from 'vue-router'
import {ref, watch} from 'vue'

const route = useRoute()
const loggedIn = ref(false)
const anonym = ref(false)
const username = ref('')

watch(
    () => {return route.fullPath},
    async () => {
        loggedIn.value = await checkLoggedIn()

        if (!loggedIn.value && !anonym.value) {
            const register = await fetch('https://api.myfairpipe.com/auth/anonymLogin', {
                method: 'POST',
                credentials: 'include',
            })

            const data = await register.json()

            const body = JSON.stringify({
                user_email: data.user.user_email,
                password: data.password,
            })

            await fetch('https://api.myfairpipe.com/auth/login', {
                method: 'POST',
                body: body,
                credentials: 'include',
            })
        }
    },
)

async function checkLoggedIn() {
    const req = await fetch('https://api.myfairpipe.com/user/get', {
        credentials: 'include',
    })

    if (req.ok) {
        const data = await req.json()
        if (data.user.anonym) {
            anonym.value = true
            return false
        }
        username.value = data.user.username
    }
    anonym.value = false

    return req.status < 400
}
</script>

<template>
    <div class="full">
        <nav class="header">
            <div class="row">
                <div class="left-side">
                    <RouterLink class="navtxt" to="/home"><img alt="Logo" height="40" src="@/assets/logo.svg"/></RouterLink>
                    <RouterLink class="navtxt brand-text" to="/home">MyFairPipe</RouterLink>
                </div>
                <div class="right-side">
                    <RouterLink class="navtxt" to="/home">Home</RouterLink>
                    <RouterLink v-if="loggedIn" class="navtxt" to="/user">{{ username }}</RouterLink>
                    <RouterLink v-else id="loginbtn" class="navtxt" to="/login">Login</RouterLink>
                </div>
            </div>
        </nav>

        <main class="content">
            <RouterView :key="$route.fullPath"/>
        </main>

        <nav class="footer-container">
            <div class="footer">
                <div class="footer-nav">
                    <h2>© MyFairPipe</h2>
                </div>
                <div class="footer-nav">
                    <RouterLink class="footer-txt" to="/about">About</RouterLink>
                    <RouterLink class="footer-txt" to="/imprint">Imprint</RouterLink>
                </div>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.header {
    line-height: 1.5;
    z-index: 1000;
}

template {
    width: 100%;
}

.full {
    width: 100%;
}

.navtxt {
    font-size: 20px;
    color: var(--color-text);
    text-decoration: none;
}

.footer-txt {
    font-size: 15px;
    color: var(--color-text);
    text-decoration: none;
}

video {
    z-index: 1;
}

nav {
    width: 100%;
    font-size: 14px;
    text-align: center;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    display: flex;
    align-items: center;
}

nav a:first-of-type {
    border: 0;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: white;
    color: black;
    padding: 2.5rem 2rem;
}

.row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.left-side,
.right-side {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.content {
    margin-top: 100px;
    align-content: space-around;
}

.footer-container {
    width: 100%;
    background: white;
    color: black;
    padding: 2.5rem 2rem;
    left: 0;
    bottom: 0;
    position: absolute;
}

.footer {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-content: center;
}

.footer-nav {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    gap: 10px;
}

.searchbar input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
}

.searchbar svg {
    width: 18px;
    height: 18px;
    fill: gray;
}

#loginbtn {
    border: 1px solid var(--color-text);
    background-color: black;
    color: white;
    padding: 6px 16px;
    border-radius: 6px;
}

@media (max-width: 600px) {
    .brand-text {
        display: none;
    }

    .header {
        padding: 1.5rem 1rem;
    }

    .navtxt {
        font-size: 16px;
    }
}
</style>