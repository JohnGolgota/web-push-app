import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Module } from "./Module";
import { User } from "./User";

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.subscriptions)
    subscriber: User

    @ManyToOne(() => User, { nullable: true })
    subscribedToUser: User

    @ManyToOne(() => Module, { nullable: true })
    subscribedToModule: Module

    @Column({ default: true })
    isActive: boolean
}