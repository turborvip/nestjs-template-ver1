import { Role } from 'src/constants/roles.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  name: string;

  @Column({ unique: true })
  @Exclude()
  username: string;

  @Column({ type: 'text' })
  @Exclude()
  password: string;

  @Column({ type: 'text', array: true, default: [Role.User] })
  roles: Role[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
