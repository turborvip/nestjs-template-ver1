import { IsNotEmpty } from "class-validator";
import { Role } from "src/constants/roles.enum";

export class CreateUserDto {
    @IsNotEmpty()
    username: string;

    password: string;

    @IsNotEmpty()
    name: string;

    roles: Role[] | undefined;
}