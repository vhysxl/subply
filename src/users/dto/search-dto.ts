import { IsAlphanumeric, IsNotEmpty } from 'class-validator';

export class SearchUserDto {
  @IsNotEmpty()
  @IsAlphanumeric('en-US', {
    message: 'Search term must contain only letters and numbers',
  })
  name: string;
}
