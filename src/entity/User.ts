import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { UserModule } from "./UserModule"
import { Notification } from "./Notification"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    email: string

    @OneToMany(() => UserModule, userModule => userModule.user)
    userModules: UserModule[]

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[]
    
}
