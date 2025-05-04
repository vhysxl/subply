import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// filter data masuk register
export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password: string;
}
