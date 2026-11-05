import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppBaseService } from '@api/utils/app-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { CustomProject } from '@shared/entities/custom-project.entity';
import { CalculationEngine } from '@api/modules/calculations/calculation.engine';
import { CustomProjectFactory } from '@api/modules/custom-projects/input-factory/custom-project.factory';
import { GetOverridableCostInputs } from '@shared/dtos/custom-projects/get-overridable-cost-inputs.dto';
import { DataRepository } from '@api/modules/calculations/data.repository';
import { GetOverridableAssumptionsDTO } from '@shared/dtos/custom-projects/get-overridable-assumptions.dto';
import { AssumptionsRepository } from '@api/modules/calculations/assumptions.repository';
import { User } from '@shared/entities/users/user.entity';
import { EventBus } from '@nestjs/cqrs';
import { SaveCustomProjectEvent } from '@api/modules/custom-projects/events/save-custom-project.event';
import { FetchSpecification } from 'nestjs-base-service';
import { GetActivityTypesDefaults } from '@shared/dtos/custom-projects/get-activity-types-defaults.dto';
import { z } from 'zod';
import { customProjectsQuerySchema } from '@shared/contracts/custom-projects.contract';
import {
  CreateCustomProjectDto,
  OverridableCostInputsDto,
} from '@shared/dtos/custom-projects/create-custom-project.dto';
import { ModelComponentsVersionEntity } from '@shared/entities/model-versioning/model-components-version.entity';

export type CustomProjectFetchSpecificacion = z.infer<
  typeof customProjectsQuerySchema
>;

@Injectable()
export class CustomProjectsService extends AppBaseService<
  CustomProject,
  CreateCustomProjectDto,
  unknown,
  unknown
> {
  logger = new Logger(CustomProjectsService.name);
  constructor(
    @InjectRepository(CustomProject)
    public readonly repo: Repository<CustomProject>,
    public readonly calculationEngine: CalculationEngine,
    public readonly dataRepository: DataRepository,
    public readonly assumptionsRepository: AssumptionsRepository,
    public readonly customProjectFactory: CustomProjectFactory,
    @InjectRepository(ModelComponentsVersionEntity)
    private readonly versionRepository: Repository<ModelComponentsVersionEntity>,
    private readonly eventBus: EventBus,
  ) {
    super(repo, 'customProject', 'customProjects');
  }

  async create(dto: CreateCustomProjectDto): Promise<CustomProject> {
    const { countryCode, ecosystem, activity } = dto;
    const {
      additionalBaseData,
      baseIncrease,
      baseSize,
      additionalAssumptions,
      country,
    } = await this.dataRepository.getDataToComputeCustomProjects({
      countryCode,
      ecosystem,
      activity,
    });
    if (dto.initialCarbonPriceAssumption) {
      additionalAssumptions.carbonPrice = dto.initialCarbonPriceAssumption;
    }

    const projectInput = this.customProjectFactory.createProjectInput(
      dto,
      additionalBaseData,
      additionalAssumptions,
    );

    const calculationOutput = this.calculationEngine.calculate({
      projectInput,
      baseIncrease,
      baseSize,
      dto,
    });
    const { costOutput, breakEvenCostOutput } = calculationOutput;

    const currentVersion = await this.versionRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });
    console.log('Current Version:', currentVersion);

    const customProject = this.customProjectFactory.createProject(
      dto,
      country,
      projectInput,
      breakEvenCostOutput?.breakEvenCarbonPrice || null,
      costOutput,
      breakEvenCostOutput?.breakEvenCost || null,
      currentVersion, // Pass the current version to the custom project
    );

    return customProject;
  }

  async saveCustomProject(dto: CustomProject, user: User): Promise<string> {
    try {
      const { id } = await this.repo.save({ ...dto, user });
      this.eventBus.publish(new SaveCustomProjectEvent(user.id, true));
      return id;
    } catch (error) {
      this.logger.error(`Error saving custom project: ${error}`);
      this.eventBus.publish(new SaveCustomProjectEvent(user.id, false, error));
      throw new ServiceUnavailableException(
        `Custom project could not be saved, please try again later`,
      );
    }
  }

  async countSavedProjects(): Promise<number> {
    return this.repo.count();
  }

  async countSavedProjectsUpdatedLast90Days(): Promise<number> {
    return this.repo
      .createQueryBuilder('customProject')
      .where(
        "customProject.updatedAt BETWEEN CURRENT_TIMESTAMP - INTERVAL '90 days' AND CURRENT_TIMESTAMP",
      )
      .getCount();
  }

  async getActivityTypeDefaults(dto: GetActivityTypesDefaults) {
    return this.dataRepository.getActivityTypesDefaults(dto);
  }

  async getDefaultCostInputs(
    dto: GetOverridableCostInputs,
  ): Promise<OverridableCostInputsDto> {
    return this.dataRepository.getOverridableCostInputs(dto);
  }

  async getDefaultAssumptions(dto: GetOverridableAssumptionsDTO) {
    return this.assumptionsRepository.getOverridableModelAssumptions(dto);
  }

  async extendGetByIdQuery(
    query: SelectQueryBuilder<CustomProject>,
    fetchSpecification?: FetchSpecification,
    info?: { user: User },
  ): Promise<SelectQueryBuilder<CustomProject>> {
    const { user } = info;

    query.leftJoinAndSelect('customProject.version', 'version');
    query.andWhere('customProject.user_id = :userId', { userId: user.id });

    return query;
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<CustomProject>,
    fetchSpecification: CustomProjectFetchSpecificacion,
    info?: { user: User },
  ): Promise<SelectQueryBuilder<CustomProject>> {
    const { user } = info;

    query.andWhere('customProject.user_id = :userId', { userId: user.id });
    query.leftJoinAndSelect('customProject.version', 'version');

    if (fetchSpecification.partialProjectName) {
      query = query.andWhere('project_name ILIKE :projectName', {
        projectName: `%${fetchSpecification.partialProjectName}%`,
      });
    }

    return query;
  }

  async areProjectsCreatedByUser(
    userId: string,
    projectIds: string[],
  ): Promise<boolean> {
    const customProjects = await this.repo.find({
      where: {
        id: In(projectIds),
      },
      relations: ['user'],
    });

    return customProjects.every(
      (customProject) => customProject.user?.id === userId,
    );
  }
}
