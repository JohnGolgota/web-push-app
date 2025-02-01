import * as cors from "cors"
import * as express from "express"
import { createServer } from "http"
import "reflect-metadata"
import { Server as SocketServer } from "socket.io"
import { AppDataSource } from "./data-source"
import { Module } from "./entity/Module"
import { Notification } from "./entity/Notification"
import { Subscription } from "./entity/Subscription"
import { User } from "./entity/User"
import { UserModule } from "./entity/UserModule"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const server = createServer(app)
const io = new SocketServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const PORT = process.env.PORT || 3000

AppDataSource.initialize()
    .then(async () => {
    })
    .catch(error => {
    })

const userSockets = new Map()

io.on("connection", (socket) => {
    socket.on("authenticate", (userId) => {
        userSockets.set(userId, socket.id)
        socket.join(userId.toString())
    })

    socket.on("disconnect", () => {
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId)
                break
            }
        }
    })
})

async function sendNotification(userId: number, message: string) {
    try {
        const userRepository = AppDataSource.getRepository(User)
        const notificationRepository = AppDataSource.getRepository(Notification)

        const user = await userRepository.findOneBy({ id: userId })
        if (!user || !user.notificationsEnabled) {
            return;
        }

        const notification = new Notification()
        notification.user = user
        notification.message = message

        await notificationRepository.save(notification)

        const socketId = userSockets.get(userId.toString())
        if (socketId) {
            io.to(socketId).emit("notification", { message })
        }
    } catch (error) {
        console.error("Fail send notification func", error);
    }
}

async function notifySubscribers(activityUserId: number, moduleId: number | null, message: string) {
    const subscriptionRepository = AppDataSource.getRepository(Subscription)
    let subscribers: Subscription[]

    if (moduleId) {
        subscribers = await subscriptionRepository.find({
            where: [
                { subscribedToModule: { id: moduleId }, isActive: true },
                { subscribedToUser: { id: activityUserId }, isActive: true }
            ],
            relations: ["subscriber"]
        })
    } else {
        subscribers = await subscriptionRepository.find({
            where: { subscribedToUser: { id: activityUserId }, isActive: true },
            relations: ["subscriber"]
        })
    }

    for (const subscription of subscribers) {
        await sendNotification(subscription.subscriber.id, message)
    }
}

async function notifyModuleActivity(moduleId: number, activityMessage: string) {
    try {
        const userModuleRepository = AppDataSource.getRepository(UserModule)
        const userModules = await userModuleRepository.find({
            where: { module: { id: moduleId } },
            relations: ["user"]
        })
        for (const UserModule of userModules) {
            await sendNotification(UserModule.user.id, activityMessage)
        }
    } catch (error) {
        console.error("fail 2", error);
    }
}

app.post("/api/activity", async (req, res) => {
    const { userId, moduleId, message } = req.body
    await notifySubscribers(userId, moduleId, message)
    res.status(200).json({ message: "Actividad registrada y notificaciones enviadas" })
})

app.post("/api/subscribe", async (req, res) => {
    const { subscriberId, subscribedToUserId, subscribedToModuleId } = req.body
    try {
        const subscriptionRepository = AppDataSource.getRepository(Subscription)
        const userRepository = AppDataSource.getRepository(User)
        const moduleRepository = AppDataSource.getRepository(Module)

        const subscriber = await userRepository.findOneBy({ id: subscriberId })
        if (!subscriber) {
            return res.status(404).json({ error: "Suscriptor no encontrado" })
        }

        let subscribedToUser = null
        let subscribedToModule = null

        if (subscribedToUserId) {
            subscribedToUser = await userRepository.findOneBy({ id: subscribedToUserId })
            if (!subscribedToUser) {
                return res.status(404).json({ error: 'Usuario al que suscribirse no encontrado' })
            }
        }

        if (subscribedToModuleId) {
            subscribedToModule = await moduleRepository.findOneBy({ id: subscribedToModuleId });
            if (!subscribedToModule) {
                return res.status(404).json({ error: 'Módulo al que suscribirse no encontrado' });
            }
        }

        const subscription = new Subscription()
        subscription.subscriber = subscriber
        subscription.subscribedToUser = subscribedToUser
        subscription.subscribedToModule = subscribedToModule

        await subscriptionRepository.save(subscription)

        res.status(200).json({ message: "Subscription creada exitosamente" })

    } catch (error) {
        res.status(500).json({ error: `fail ${error}` })
    }
})

app.post("/api/toggle-notifications", async (req, res) => {
    const { userId, enabled } = req.body
    try {
        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            return res.status(404).json({ error: "usuario no encontrado" })
        }
        user.notificationsEnabled = enabled
        await userRepository.save(user)
        res.status(200).json({ message: `Notificaciones ${enabled ? "activas" : "desactivadas"}` })
    } catch (error) {
        res.status(404).json({ error: "Error al cambiar el estado de las notificaciones del usuario" })
    }
})

app.post("/api/send-notification", async (req, res) => {
    const { userId, message } = req.body
    await sendNotification(userId, message)
    res.status(200).json({ message: "Notificación enviada" })
})

app.post("/api/module/:moduleId/activity", async (req, res) => {
    const moduleId = parseInt(req.params.moduleId)
    const { activityMessage } = req.body


    await notifyModuleActivity(moduleId, activityMessage)
    res.status(200).json({ message: "notificaciones enviadas", activityMessage })
})

app.get("/api/subscriptions/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId)
    try {
        const subscriptionRepository = AppDataSource.getRepository(Subscription)
        const subscriptions = await subscriptionRepository.find({
            where: { subscriber: { id: userId }, isActive: true },
            relations: ["subscribedToUser", "subscribedToModule"]
        })
        res.json(subscriptions)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las suscripciones" })
    }
})

app.get("/api/notifications-status/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId)
    try {
        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            return res.status(404).json({ error: "no user" })
        }
        res.json({ notificationsEnabled: user.notificationsEnabled })
    } catch (error) {
        res.status(500).json({ error: "Error al obtener datos" })
    }
})

app.get("/api/notifications/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId)
    try {
        const notificationRepository = AppDataSource.getRepository(Notification)
        const notifications = await notificationRepository.find({
            where: { user: { id: userId } },
            relations: ["user"],
            order: { createdAt: "DESC" }
        })
        res.json(notifications)
    } catch (error) {
    }
})

app.get("/api/notification/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId)
    try {
        const notificationRepository = AppDataSource.getRepository(Notification)
        const notifications = await notificationRepository.find({
            where: { user: { id: userId } },
            relations: ["user"]
        })
        res.json(notifications)
    } catch (error) {
        res.status(500).json({ error: "Valió monda" })
    }
})

app.get("/ping", async (req, res) => {
    io.emit("pong", { message: "pong" })
    res.status(200).json({ message: "pong" })
})

app.delete("/api/unsubscribe/:subscriptionId", async (req, res) => {
    const subscriptionId = parseInt(req.params.subscriptionId)
    try {
        const subscriptionRepository = AppDataSource.getRepository(Subscription)
        const subscription = await subscriptionRepository.findOneBy({ id: subscriptionId })
        if (!subscription) {
            return res.status(404).json({ error: "Suscripción no encontrada" })
        }
        subscription.isActive = false
        await subscriptionRepository.save(subscription)
        res.status(200).json({ message: "Subscription desactivada exitosamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al desactivar la suscripción" })
    }
})

server.listen(PORT, () => {
    console.log("running");
})

export { sendNotification }

