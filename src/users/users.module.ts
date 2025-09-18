import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';



@Module({
  controllers: [],
  providers: [UsersService,PrismaService,RedisService],
})
export class UsersModule {}
