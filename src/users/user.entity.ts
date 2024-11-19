import { Role } from 'src/roles/roles.enum';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  username: string;

  @Column('text')
  password: string;

  @Column('text', { array: true })
  roles: Role[];
}
