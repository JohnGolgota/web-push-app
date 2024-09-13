<script lang="ts" setup>
import { onMounted, ref, onUnmounted, watch } from "vue";
import { io, Socket } from "socket.io-client"

const props = defineProps({
    userId: {
        type: String,
        required: true
    }
})

const notifications = ref<Array<{ id: number, message: string }>>([])
const notificationsEnabled = ref(true)
let socket: Socket

const socketEndpoint = import.meta.env.VITE_MAIN_SOCKET

const fetchNotificationsStatus = async () => {
    try {
        const response = await fetch(`${socketEndpoint}/api/notifications-status/${props.userId}`)
        const data = response.json()
        notificationsEnabled.value = data.notificationsEnabled
    } catch (error) {
        console.log("error:", error)

    }
}

const toggleNotifications = async () => {
    try {
        const response = await fetch(`${socketEndpoint}/api/toggle-notifications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: props.userId,
                enabled: notificationsEnabled.value
            })
        })
        if (!response.ok) {
            throw new Error("Error al cambiar el estado de las notificaciones");
        }
    } catch (error) {
        console.log("error:", error)
        // rollback
        notificationsEnabled.value = !notificationsEnabled.value
    }
}

const fetchNotifications = async () => {
    try {
        const response = await fetch(`${socketEndpoint}/api/notifications/${props.userId}`)
        const data = await response.json()
        notifications.value = data
    } catch (error) {
        console.log("fetchNotifications NotificationSystem.vue error:", error)
    }
}

watch(notificationsEnabled, newValue => {
    if (newValue) {
        fetchNotifications()
    } else {
        notifications.value = []
    }
})

onMounted(async () => {
    await fetchNotificationsStatus()

    socket = io(socketEndpoint)

    socket.on("connect", () => {
        socket.emit("authenticate", props.userId)
    })

    socket.on("notification", (data: { message: string }) => {
        notifications.value.unshift({
            id: Date.now(),
            message: data.message
        })
    })

    fetchNotifications()
})

onUnmounted(() => {
    if (socket) {
        socket.disconnect()
    }
})
</script>
<template>
    <div class="notification-system">
        <h2>N</h2>
        <div class="notification-toggle">
            <label for="">
                <input type="checkbox" name="" id="" v-model="notificationsEnabled">
                {{ notificationsEnabled ? "Desactivar" : "Activar" }} Notificaciones
            </label>
        </div>
        <ul>
            <li v-for="notification in notifications" :key="notification.id">
                {{ notification.message }}
            </li>
        </ul>
    </div>
</template>