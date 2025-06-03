import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from 'src/games/dto/create-game.dto';

export class updateProductDto extends PartialType(CreateGameDto) {}
