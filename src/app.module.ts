import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import configuration from './config/configuration';

@Module({
  imports: [ConfigModule.forRoot({
    load:[configuration],
    isGlobal:true,
    envFilePath:['.env']
  }), AuthModule, UsersModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
