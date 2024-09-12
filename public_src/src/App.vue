<script setup lang="ts">
import { onMounted, ref } from "vue";
import io from "socket.io-client"
import TryForm from "./components/TryForm.vue"

const notifications = ref(["1", "2"])
const socket = io("http://10.1.1.163:3000")

onMounted(() => {
  const userId = "1"
  socket.emit("join", userId)
  socket.on("notification", (data) => {
    notifications.value.push(data)
  })
  fetch(`http://10.1.1.163:3000/api/notification/${userId}`)
    .then(response => response.json())
    .then(data => {
      notifications.value = data
    })
})
</script>

<template>
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
