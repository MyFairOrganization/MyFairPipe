<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {ENV} from "@/config/env.ts";

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const router = useRouter();

const register = () => {
    if (!email.value || !password.value || !confirmPassword.value) {
        errorMessage.value = 'Please fill all fields';
        return;
    }
    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
    }

    errorMessage.value = '';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${ENV.API_DOMAIN}/auth/register`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 201) {
                router.push('/login');
            } else {
                try {
                    errorMessage.value = JSON.parse(xhr.responseText).error;
                } catch {
                    errorMessage.value = 'Registration failed';
                }
            }
        }
    };

    xhr.send(
        JSON.stringify({
            user_email: email.value,
            username: username.value,
            password: password.value,
        })
    );
};
</script>

<template>
    <div class="page">
        <div class="card">
            <h1 class="title">Create New Account</h1>

            <form class="form" @submit.prevent="register">
                <label class="label" for="username">Username:</label>
                <input
                    id="username"
                    v-model="username"
                    class="input"
                    placeholder="Username"
                    type="text"
                />

                <label class="label" for="email">E-Mail:</label>
                <input
                    id="email"
                    v-model="email"
                    class="input"
                    placeholder="E-Mail"
                    type="email"
                />

                <label class="label" for="password">Password:</label>
                <input
                    id="password"
                    v-model="password"
                    class="input"
                    placeholder="Password"
                    type="password"
                />

                <label class="label" for="confirmPassword">Repeat Password:</label>
                <input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    class="input"
                    placeholder="Repeat Password"
                    type="password"
                />

                <button class="btn" type="submit">Create Account</button>

                <div v-if="errorMessage" style="color: red; margin-top: 10px">
                    {{ errorMessage }}
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>

.page {
    background-color: #e0fbfc;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 3rem;
}

.card {
    max-width: 400px;
    width: 100%;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: white;
}

.title {
    font-size: 28px;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    font-weight: 600;
    color: #111827;
}

.label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 15px;
    font-weight: 600;
    color: #374151;
}

.input {
    width: 100%;
    padding: 0.5rem;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 14px;
}

.input::placeholder {
    color: #9aa4b2;
}

.btn {
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    background-color: #293241;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn:hover {
    background-color: #1f2833;
}

@media (max-width: 520px) {
    .page {
        padding-top: 2rem;
    }

    .card {
        padding: 1.5rem;
    }
}
</style>
