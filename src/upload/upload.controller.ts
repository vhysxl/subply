import { Controller, Get, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/constants/role.enum';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin)
  getSignature() {
    return this.uploadService.generateSignature();
  }
}
