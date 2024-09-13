import * as cors from "cors"
import * as express from "express"
import { createServer } from "http"
import "reflect-metadata"
import { Server as SockerServer } from "socket.io"
import { AppDataSource } from "./data-source"
import { Notification } from "./entity/Notification"
import { User } from "./entity/User"
import { UserModule } from "./entity/UserModule"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const server = createServer(app)
const io = new SockerServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const PORT = process.env.PORT || 3000

AppDataSource.initialize()
    .then(async () => {
        console.log("Connect");
    })
    .catch(error => {
        console.log(error);
    })

const userSockets = new Map()

io.on("connection", (socket) => {
    console.log("usuario conectado");
    socket.on("authenticate", (userId) => {
        userSockets.set(userId, socket.id)
        socket.join(userId.toString())
        console.log(`Usuario ${userId} autenticado`);
    })
    socket.on("disconnect", () => {
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId)
                break
            }
        }
        console.log("Usuario desconectado");
    })
})

async function sendNotification(userId: number, message: string) {
    try {
        const userRepository = AppDataSource.getRepository(User)
        const notificationRepository = AppDataSource.getRepository(Notification)

        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        if (!user.notificationsEnabled) {
            console.log("Notificaciones desactivadas para el usuario");
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

app.get("/api/notifications-status/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId)
    try {
        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOneBy({ id: userId })
        console.log("user:")
        if (!user) {
            return res.status(404).json({ error: "no user" })
        }
        res.json({ notificationsEnabled: user.notificationsEnabled })
    } catch (error) {
        res.status(500).json({ error: "Error al obtener datos" })
    }
})

app.post("/api/send-notification", async (req, res) => {
    const { userId, message } = req.body
    await sendNotification(userId, message)
    res.status(200).json({ message: "Notificación enviada" })
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
        console.log("/api/notifications/:userId endpoint error:", error)
    }
})

app.get("/api/notification/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId)
    console.log(userId);
    try {
        const notificationRepository = AppDataSource.getRepository(Notification)
        const notifications = await notificationRepository.find({
            where: { user: { id: userId } },
            relations: ["user"]
        })
        res.json(notifications)
    } catch (error) {
        res.status(500).json({ error: "Valio monda" })
    }
})

app.post("/api/module/:moduleId/activity", async (req, res) => {
    const moduleId = parseInt(req.params.moduleId)
    const { activityMessage } = req.body


    await notifyModuleActivity(moduleId, activityMessage)
    res.status(200).json({ message: "notificaciones enviadas", activityMessage })
})

app.get("/ping", async (req, res) => {
    io.emit("pong", { message: "pong" })
    res.status(200).json({ message: "pong" })
})

server.listen(PORT, () => {
    console.log("running");
})

export { sendNotification }

