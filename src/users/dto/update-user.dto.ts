import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsIn, IsOptional } from 'class-validator';

export class updateUserDto extends PartialType(CreateUserDto) {
  @IsArray()
  @IsOptional()
  @IsIn(['admin', 'superadmin', 'user'], { each: true })
  roles?: ('admin' | 'user' | 'superadmin')[];
}
