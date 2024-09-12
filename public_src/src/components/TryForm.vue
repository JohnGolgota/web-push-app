<script lang="ts" setup>
import { ref } from "vue"

const socketEndpoint = import.meta.env.VITE_MAIN_SOCKET

const mesInput = ref()
const quienInput = ref()

const onS = async (e) => {
    const url = `${socketEndpoint}/api/module/1/activity`;
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            "activityMessage": mesInput.value
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}
</script>
<template>
    <div class="main-algo" @submit.prevent="onS">
        <form id="el-form">
            <label for="mes">cosas</label>
            <input type="text" name="mes" id="mes" v-model="mesInput">
            <label for="quien">pa quien</label>
            <input type="text" name="quien" id="quien" v-model="quienInput">
            <button type="submit">Pa</button>
        </form>
    </div>
</template>