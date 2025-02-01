<template>
    <div class="subscription-manager">
        <h2>Gestionar Suscripciones</h2>
        <div class="subscription-form">
            <select v-model="subscriptionType">
                <option value="user">Usuario</option>
                <option value="module">Módulo</option>
            </select>
            <input v-if="subscriptionType === 'user'" v-model="subscribedToUserId" placeholder="ID del usuario">
            <input v-if="subscriptionType === 'module'" v-model="subscribedToModuleId" placeholder="ID del módulo">
            <button @click="subscribe">Suscribirse</button>
        </div>
        <h3>Mis Suscripciones</h3>
        <ul>
            <li v-for="subscription in subscriptions" :key="subscription.id">
                {{ subscriptionDescription(subscription) }}
                <button @click="unsubscribe(subscription.id)">Cancelar suscripción</button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, onMounted, defineProps } from 'vue';

const props = defineProps({
    userId: {
        type: String,
        required: true
    }
})

const socketEndpoint = import.meta.env.VITE_MAIN_SOCKET

const subscriptions = ref([]);
const subscriptionType = ref('user');
const subscribedToUserId = ref('');
const subscribedToModuleId = ref('');

const fetchSubscriptions = async () => {
    try {
        const response = await fetch(`${socketEndpoint}/api/subscriptions/${props.userId}`);
        subscriptions.value = await response.json();
    } catch (error) {
        console.error('Error al obtener suscripciones:', error);
    }
};

const subscribe = async () => {
    try {
        let data = {
            subscriberId: props.userId,
            subscribedToUserId: subscriptionType.value === 'user' ? subscribedToUserId.value : null,
            subscribedToModuleId: subscriptionType.value === 'module' ? subscribedToModuleId.value : null,
        }
        console.log("data:", data)
        const response = await fetch(`${socketEndpoint}/api/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            await fetchSubscriptions();
            subscribedToUserId.value = '';
            subscribedToModuleId.value = '';
        } else {
            console.error('Error al suscribirse');
        }
    } catch (error) {
        console.error('Error al suscribirse:', error);
    }
};

const unsubscribe = async (subscriptionId: number) => {
    try {
        const response = await fetch(`${socketEndpoint}/api/unsubscribe/${subscriptionId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            await fetchSubscriptions();
        } else {
            console.error('Error al cancelar la suscripción');
        }
    } catch (error) {
        console.error('Error al cancelar la suscripción:', error);
    }
};

const subscriptionDescription = (subscription) => {
    if (subscription.subscribedToUser) {
        return `Usuario: ${subscription.subscribedToUser.username}`;
    } else if (subscription.subscribedToModule) {
        return `Módulo: ${subscription.subscribedToModule.name}`;
    }
    return 'Suscripción desconocida';
};

onMounted(fetchSubscriptions);

</script>

<style scoped>
.subscription-manager {
    margin-top: 20px;
}

.subscription-form {
    margin-bottom: 20px;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
}

button {
    margin-left: 10px;
}
</style>