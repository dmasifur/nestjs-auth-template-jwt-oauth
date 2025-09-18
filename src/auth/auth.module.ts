import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './constanats';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { GoogleStrategy } from './google.strategy';
import { GoogleAuthGuard } from './google-auth.guard';

@Module({
  imports:[UsersModule, PassportModule, JwtModule.register({
    secret:JWT_SECRET.key,
    signOptions:{expiresIn:'15m'},
    
  })],
  providers: [AuthService, JwtStrategy,JwtAuthGuard, UsersService,PrismaService,GoogleStrategy,GoogleAuthGuard],
  controllers: [AuthController]
})
export class AuthModule {}
