import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@shared/entities/users/user.entity';
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

  async listActiveUserEmails(): Promise<string[]> {
    const users = await this.userRepository.find({
      select: { email: true },
      where: { isActive: true },
      order: { email: 'ASC' },
    });
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
