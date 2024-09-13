import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Notification } from "./Notification"
import { UserModule } from "./UserModule"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    email: string

    @Column({ default: true })
    notificationsEnabled: boolean

    @OneToMany(() => UserModule, userModule => userModule.user)
    userModules: UserModule[]

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[]

}
