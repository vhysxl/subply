import { IsBoolean, IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
  name: string;

  @IsBoolean()
  isPopular: boolean;

  @IsString()
  currency: string;

  @IsString()
  imageUrl: string | null;
}
