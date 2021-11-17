import { Coach } from "../coach/coach.entity";
import { User } from "../user/user.entity";
import { Training } from "../training/training.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Group 
{
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    name : string;
    @ManyToMany( () => User, user => user.groups, { cascade: true, onDelete: "CASCADE" })
    members : User[];
    @ManyToMany( () => Coach, coach => coach.groups, { cascade: true, onDelete: "CASCADE" })
    coaches : Coach[];
    @ManyToMany( () => Training, training => training.groups, { cascade: true, onDelete: "CASCADE" })
    trainings : Training[];
}