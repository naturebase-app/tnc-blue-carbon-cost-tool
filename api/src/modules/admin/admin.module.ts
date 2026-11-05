import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from '@api/modules/auth/auth.module';
import { ImportModule } from '@api/modules/import/import.module';
import { AdminExportService } from '@api/modules/admin/admin-export.service';
import { UsersModule } from '@api/modules/users/users.module';
import { CustomProjectsModule } from '@api/modules/custom-projects/custom-projects.module';

@Module({
  imports: [AuthModule, ImportModule, UsersModule, CustomProjectsModule],
  controllers: [AdminController],
  providers: [AdminExportService],
})
export class AdminModule {}
