import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.notifications)
    user: User

    @Column()
    message: string

    @CreateDateColumn()
    createdAt: Date

    @Column({ default: false })
    read: boolean
}