import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [JwtModule],
  controllers: [UploadController],
  providers: [UploadService, RolesGuard],
})
export class UploadModule {}
