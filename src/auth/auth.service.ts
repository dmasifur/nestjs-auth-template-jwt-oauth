import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.userService.findOne({ email: username });

    if (!user) return null;

    const decoded = bcrypt.compare(pass, user.password!);
    if (!decoded) throw new BadRequestException('Wrong password');

    const { password, ...result } = user;
    return result;
  }

  async isUser(email: string) {
    const user = await this.userService.findOne({ email });
    if (!user) return false;
    return true;
  }

  async signUp(createUserDto: CreateUserDto) {
    const newUser = await this.userService.create(createUserDto);
    const { password, ...result } = newUser;
    const payload = { username: result.email, sub: result.id };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const refreshTokenKey = `refresh_token:${newUser.id}`;
    const refreshTokenExpirationSeconds = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '604800000',
      10,
    );
    await this.redisService.set(
      refreshTokenKey,
      refresh_token,
      refreshTokenExpirationSeconds,
    );

    return {
      user: result,
      access_token,
      refresh_token,
    };
  }

  async login(username: string, password: string) {
    const isValidUser = await this.validateUser(username, password);
    if (!isValidUser) return null;
    const payload = { username: isValidUser.email, sub: isValidUser.id };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const refreshTokenKey = `refresh_token:${isValidUser.id}`;
    const refreshTokenExpirationSeconds = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '604800000',
      10,
    );
    await this.redisService.set(
      refreshTokenKey,
      refresh_token,
      refreshTokenExpirationSeconds,
    );

    return {
      user: isValidUser,
      access_token,
      refresh_token,
    };
  }

  async generateAuthTokens(payload) {
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      console.log('no data from google');
      return null;
    }
    return req.user;
  }

  async rotateRefreshToken(userId: number, oldRefreshToken: string) {
    const refreshTokenKey = `refresh_token:${userId}`;
    const storedRefreshToken = await this.redisService.get(refreshTokenKey);

    if (!storedRefreshToken || storedRefreshToken !== oldRefreshToken) {
      await this.redisService.del(refreshTokenKey);
      throw new UnauthorizedException(
        'Invalid or expired token, please login again',
      );
    }

    try {
      this.jwtService.verify(oldRefreshToken);
    } catch (error) {
      await this.redisService.del(refreshTokenKey);
      throw new UnauthorizedException(
        'Invalid refresh token signature or expiration. Please login again',
      );
    }

    const user = await this.userService.findOne({ id: userId });

    if (!user) throw new BadRequestException('User not found');

    const payload = { username: user.email, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshTokenExpirationSeconds = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '604800000',
      10,
    );

    await this.redisService.set(
      refreshTokenKey,
      newRefreshToken,
      refreshTokenExpirationSeconds,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await this.redisService.del(`refresh_token:${userId}`);
  }

  async setTokens(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiration: number,
    refreshTokenExpiration: number,
    res: Response,
  ) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + accessTokenExpiration),
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + refreshTokenExpiration),
    });
  }
}
