import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// filter data masuk login
export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
