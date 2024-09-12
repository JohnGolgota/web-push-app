import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Module } from "./entity/Module"
import { UserModule } from "./entity/UserModule"
import { Notification } from "./entity/Notification"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "test",
    synchronize: false,
    logging: false,
    entities: [User, Module, UserModule, Notification],
    migrations: [],
    subscribers: [],
})
