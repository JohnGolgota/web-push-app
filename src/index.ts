import * as express from "express"
import * as cors from "cors"
import { createServer } from "http"
import { Server as SockerServer } from "socket.io"
import "reflect-metadata"
import { AppDataSource } from "./data-source"
import { Notification } from "./entity/Notification"
import { User } from "./entity/User"
import { UserModule } from "./entity/UserModule"

const app = express()
app.use(cors())
app.use(express.json())
const server = createServer(app)
const io = new SockerServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

const PORT = process.env.PORT || 3000

app.use(express.static('public'))

AppDataSource.initialize()
    .then(async () => {
        console.log("Connect");
    })
    .catch(error => {
        console.log(error);
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

io.on("connection", (socket) => {
    console.log("conectado");
    socket.on("join", (userId) => {
        socket.join(userId.toString())
    })
    socket.on("disconnect", () => {
        console.log("desconectado");
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

        const notification = new Notification()
        notification.user = user
        notification.message = message

        await notificationRepository.save(notification)

        io.to(userId.toString()).emit("notification", { message })
    } catch (error) {
        console.error("Fail", error);
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

app.post("/api/module/:moduleId/activity", async (req, res) => {
    const moduleId = parseInt(req.params.moduleId)
    const { activityMessage } = req.body


    await notifyModuleActivity(moduleId, activityMessage)
    res.status(200).json({ message: "notificaciones enviadas", activityMessage })
})

app.get("/ping", async (req, res) => {
    io.emit("nada", { nada: "nada" })
    res.status(200).json({ message: "nada" })
})

server.listen(PORT, () => {
    console.log("running");
})

export { sendNotification }