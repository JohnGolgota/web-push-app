import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserModule } from "./UserModule";

@Entity()
export class Module {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => UserModule, userModule => userModule.module)
    userModules: UserModule[]
}