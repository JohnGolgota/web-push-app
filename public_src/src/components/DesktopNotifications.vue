<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { io, Socket } from "socket.io-client"

const permissionGranted = ref(false)
const socketEndpoint = import.meta.env.VITE_MAIN_SOCKET
const socket: Socket = io(socketEndpoint)
socket.emit("join", 1)

const requestPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        console.log("🚀 ~ file: DesktopNotifications.vue:12 ~ requestPermission ~ permission:", permission)
        permissionGranted.value = permission === 'granted';
        if (permissionGranted.value) {
            initializeSocketListeners();
        }
    } catch (error) {
        console.error("🚀 ~ file: DesktopNotifications.vue:21 ~ requestPermission ~ error:", error)
    }
}
const showNotification = (message: string) => {
    console.log("show?")
    if (permissionGranted.value) {
        console.log("show")
        new Notification("Nueva Notificación", {
            body: message,
            icon: "/Cosmere_symbol.svg"
        })
    }
}
const initializeSocketListener = () => {
    console.log("en función")
    socket.on('notification', (data: { message: string }) => {
        showNotification(data.message);
    });
}
onMounted(() => {
    console.log("inicio")
    permissionGranted.value = Notification.permission === "granted"
    if (permissionGranted.value) {
        console.log("comienzo")
        initializeSocketListener()
    }
})
</script>
<template>
    <div class="desktop-notifications">
        <button @click="requestPermission" v-if="!permissionGranted">
            Activar Notificaciones de escritorio
        </button>
        <p v-else>
            Notificaciones de escritorio Activadas
        </p>
    </div>
</template>