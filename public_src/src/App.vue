<script setup lang="ts">
import { ref } from "vue"
import TryForm from './components/TryForm.vue'
import DesktopNotifications from "./components/DesktopNotifications.vue"
import NotificationSystem from "./components/NotificationSystem.vue"

const currentUserId = ref("1")

</script>

<template>
    <DesktopNotifications :userId="currentUserId" :key="currentUserId"></DesktopNotifications>
    <TryForm></TryForm>
    <NotificationSystem :userId="currentUserId" :key="currentUserId"></NotificationSystem>
    <input type="text" v-model="currentUserId">
</template>
