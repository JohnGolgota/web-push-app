import { Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Module } from "./Module";

@Entity()
export class UserModule {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.userModules)
    user: User

    @ManyToOne(() => Module, module => module.userModules)
    module: Module
}