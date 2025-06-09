import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/constants/role.enum';
import { GetUserId } from 'src/common/decorator/user.decorator';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  createGame(
    @Body() createGameDto: CreateGameDto,
    @GetUserId() adminId: string,
  ) {
    return this.gamesService.createGames(createGameDto, adminId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  update(
    @Param('id') gameId: string,
    @Body() updateGameDto: UpdateGameDto,
    @GetUserId() adminId: string,
  ) {
    return this.gamesService.updateGame(gameId, updateGameDto, adminId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  remove(@Param('id') gameId: string, @GetUserId() adminId: string) {
    return this.gamesService.removeGame(gameId, adminId);
  }
}
