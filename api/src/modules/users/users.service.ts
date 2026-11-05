import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@shared/entities/users/user.entity';
import type { UserEmailCategory } from '@shared/contracts/admin.contract';
import { Repository } from 'typeorm';

import { AppBaseService } from '@api/utils/app-base.service';
import { CreateUserDto } from '@shared/dtos/users/create-user.dto';
import { UpdateUserDto } from '@shared/dtos/users/update-user.dto';
import { AppInfoDTO } from '@api/utils/info.dto';
@Injectable()
export class UsersService extends AppBaseService<
  User,
  CreateUserDto,
  UpdateUserDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super(userRepository, 'user', 'users');
  }

  async findOneBy(id: string) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async saveUser(newUser: Partial<User>) {
    return this.userRepository.save(newUser);
  }

  async delete(user: User) {
    return this.userRepository.remove(user);
  }

  async isUserActive(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user.isActive;
  }

  async listUserEmails(categories?: UserEmailCategory[]): Promise<string[]> {
    const selectedCategories = categories ?? ['active'];
    if (selectedCategories.length === 0) {
      return [];
    }

    const query = this.userRepository
      .createQueryBuilder('user')
      .select('user.email', 'email')
      .distinct(true)
      .orderBy('user.email', 'ASC');

    if (!selectedCategories.includes('all')) {
      const conditions: string[] = [];
      const parameters: Record<string, boolean> = {};

      if (selectedCategories.includes('active')) {
        conditions.push('user.isActive = :isActive');
        parameters.isActive = true;
      }

      if (selectedCategories.includes('saved-projects')) {
        query.leftJoin('user.customProjects', 'customProject');
        conditions.push('customProject.id IS NOT NULL');
      }

      if (conditions.length === 0) {
        return [];
      }

      query.andWhere(`(${conditions.join(' OR ')})`, parameters);
    }

    const users = await query.getRawMany<{ email: string }>();
    const seenEmails = new Set<string>();

    return users.flatMap(({ email }) => {
      const trimmedEmail = email.trim();
      const normalizedEmail = trimmedEmail.toLowerCase();
      if (!normalizedEmail || seenEmails.has(normalizedEmail)) {
        return [];
      }

      seenEmails.add(normalizedEmail);
      return [trimmedEmail];
    });
  }

  async getUserStatistics(): Promise<{
    activeUsers: number;
    usersCreatedLast90Days: number;
  }> {
    const [activeUsers, usersCreatedLast90Days] = await Promise.all([
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository
        .createQueryBuilder('user')
        .where(
          "user.createdAt BETWEEN CURRENT_TIMESTAMP - INTERVAL '90 days' AND CURRENT_TIMESTAMP",
        )
        .getCount(),
    ]);

    return { activeUsers, usersCreatedLast90Days };
  }
}
