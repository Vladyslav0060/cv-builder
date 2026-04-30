import { Injectable } from '@nestjs/common';
import { Prisma, User, Credential } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { EnrichedUser, enrichedUserSelect } from './user.select';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<any> {
    try {
      const { password, ...user } = data;
      const passwordHash = await argon2.hash(password);
      return this.prisma.user.create({
        data: {
          ...user,
          credential: { create: { passwordHash } },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findEnrichedUser(userId: string): Promise<EnrichedUser> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: enrichedUserSelect,
    });
  }

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUniqueOrThrow({
      where: userWhereUniqueInput,
    });
  }

  async findUserWithCredentials(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<(User & { credential: Credential | null }) | null> {
    return this.prisma.user.findUniqueOrThrow({
      where: userWhereUniqueInput,
      include: { credential: true },
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      data,
      where: { id },
    });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
