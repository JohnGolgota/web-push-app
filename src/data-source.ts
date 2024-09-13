import "reflect-metadata"
import { DataSource } from "typeorm"
import { Module } from "./entity/Module"
import { Notification } from "./entity/Notification"
import { User } from "./entity/User"
import { UserModule } from "./entity/UserModule"

export const AppDataSource = new DataSource({
    type: "mariadb",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "test2",
    synchronize: true,
    logging: false,
    entities: [User, Module, UserModule, Notification],
    migrations: [],
    subscribers: [],
})
