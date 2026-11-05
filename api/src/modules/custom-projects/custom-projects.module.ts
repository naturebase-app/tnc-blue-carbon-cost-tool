import { Module } from '@nestjs/common';
import { CustomProjectsService } from '@api/modules/custom-projects/custom-projects.service';
import { CountriesModule } from '@api/modules/countries/countries.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomProject } from '@shared/entities/custom-project.entity';
import { CustomProjectsController } from './custom-projects.controller';
import { CalculationsModule } from '@api/modules/calculations/calculations.module';
import { CustomProjectFactory } from '@api/modules/custom-projects/input-factory/custom-project.factory';
import { SaveCustomProjectEventHandler } from '@api/modules/custom-projects/events/handlers/save-custom-project.handler';
import { RestorationPlanService } from '@api/modules/custom-projects/restoration-plan.service';
import { ModelComponentsVersionEntity } from '@shared/entities/model-versioning/model-components-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomProject, ModelComponentsVersionEntity]),
    CountriesModule,
    CalculationsModule,
  ],
  providers: [
    CustomProjectsService,
    CustomProjectFactory,
    SaveCustomProjectEventHandler,
    RestorationPlanService,
  ],
  controllers: [CustomProjectsController],
  // TODO: since probably the project factory will be needed for both regular and custom projects, we should move it to the calculations module
  exports: [CustomProjectFactory, CustomProjectsService],
})
export class CustomProjectsModule {}
