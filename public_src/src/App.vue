<script setup lang="ts">
import { onMounted, ref } from "vue";
import io from "socket.io-client"
import TryForm from './components/TryForm.vue'
import DesktopNotifications from "./components/DesktopNotifications.vue"

const notifications = ref(["1", "2"])
const socketEndpoint = import.meta.env.VITE_MAIN_SOCKET
const socket = io(socketEndpoint)

onMounted(() => {
  const userId = "1"
  socket.emit("join", userId)
  socket.on("notification", (data) => {
    notifications.value.push(data)
  })
  fetch(`${socketEndpoint}/api/notification/${userId}`)
    .then(response => response.json())
    .then(data => {
      notifications.value = data
    })
})
</script>

<template>
  <DesktopNotifications></DesktopNotifications>
  <TryForm></TryForm>
  <div class="notification-system">
    <h2>Notis</h2>
    <ul>
      <li v-for="notification in notifications" :key="notification.id">
        {{ notification.message }}
      </li>
    </ul>
  </div>
</template>
