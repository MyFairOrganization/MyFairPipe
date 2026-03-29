<script lang="ts" setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {ENV} from "@/config/env.ts";

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

function goToRegister() {
    router.push('/register')
}

const login = () => {
    if (!email.value || !password.value) {
        errorMessage.value = 'Please fill all fields'
        return
    }

    errorMessage.value = ''

    const xhr = new XMLHttpRequest()

    xhr.open("POST", `${ENV.API_DOMAIN}/auth/login`, true);

    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')

    // WICHTIG: Cookies (Session / JWT) erlauben
    xhr.withCredentials = true

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Login erfolgreich → Cookie ist gesetzt
                router.push('/user')
            } else {
                try {
                    const res = JSON.parse(xhr.responseText)
                    errorMessage.value = res.error || 'Login failed'
                } catch {
                    errorMessage.value = 'Invalid response from server'
                }
                console.error('Login failed:', xhr.status)
            }
        }
    }

    const body = JSON.stringify({
        user_email: email.value,
        password: password.value,
    })

    xhr.send(body)
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <h1 class="login-title">Sign in</h1>
            <form class="login-form" @submit.prevent="login">
                <label class="login-label" for="email">E-Mail:</label>
                <input
                    id="email"
                    v-model.trim="email"
                    autocomplete="email"
                    class="login-input"
                    placeholder="E-Mail"
                    type="email"
                />

                <label class="login-label" for="password">Password:</label>
                <input
                    id="password"
                    v-model="password"
                    autocomplete="current-password"
                    class="login-input"
                    placeholder="Password"
                    type="password"
                />

                <p class="register-link" @click="goToRegister">Don't have an account? Register here</p>

                <button class="btn" type="submit">Sign in</button>
                <div v-if="errorMessage" style="color: red; margin-top: 10px">
                    {{ errorMessage }}
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    background-color: var(--color-light);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 3rem;
}

.login-card {
    max-width: 400px;
    width: 100%;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: white;
}

.login-title {
    font-size: 28px;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    font-weight: 600;
    color: #111827;
}

.login-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 15px;
    font-weight: 600;
    color: #374151;
}

.login-input {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 14px;
}

.login-input::placeholder {
    color: #9aa4b2;
}

.btn {
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    background-color: var(--color-grey);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn:hover {
    background-color: #1f2833;
}

.register-link {
    margin-top: 0.5rem;
    color: #1f2833;
    font-size: 14px;
    cursor: pointer;
    text-decoration: underline;
}

@media (max-width: 520px) {
    .login-page {
        padding-top: 2rem;
    }

    .login-card {
        padding: 1.5rem;
    }
}
</style>
