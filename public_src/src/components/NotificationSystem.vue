<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client"

const props = defineProps({
    userId: {
        type: String,
        required: true
    }
})

const notifications = ref<Array<{ id: number, message: string }>>([])
let socket: Socket

const socketEndpoint = import.meta.env.VITE_MAIN_SOCKET

onMounted(async () => {
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

const fetchNotifications = async () => {
    try {
        const response = await fetch(`${socketEndpoint}/api/notifications/${props.userId}`)
        const data = await response.json()
        notifications.value = data
    } catch (error) {
        console.log("fetchNotifications NotificationSystem.vue error:", error)
    }
}

onUnmounted(() => {
    if (socket) {
        socket.disconnect()
    }
})
</script>
<template>
    <div class="notification-system">
        <h2>Notis</h2>
        <ul>
            <li v-for="notification in notifications" :key="notification.id">
                {{ notification.message }}
            </li>
        </ul>
    </div>
</template>