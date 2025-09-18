import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('/register')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res,
  ) {
    const isUser = await this.authService.isUser(createUserDto.email);
    if (isUser) {
      throw new BadRequestException('This email is already registerd');
    }

    const result = await this.authService.signUp(createUserDto);
    const accessTokenExpiration = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME!,
      10,
    );
    const refreshTokenExpiration = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME!,
      10,
    );
    // @ts-ignore
    const { user, access_token, refresh_token } = result;

    await this.authService.setTokens(
      access_token,
      refresh_token,
      accessTokenExpiration,
      refreshTokenExpiration,
      res,
    );

    return user;
  }

  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!result) throw new BadRequestException('Please try again');
    // @ts-ignore
    const { user, access_token, refresh_token } = result;
    const accessTokenExpiration = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME!,
      10,
    );
    const refreshTokenExpiration = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME!,
      10,
    );

    await this.authService.setTokens(
      access_token,
      refresh_token,
      accessTokenExpiration,
      refreshTokenExpiration,
      res,
    );

    return user;
  }

  @Get('/google-redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req, @Res({ passthrough: true }) res) {
    const result = await this.authService.googleLogin(req);
    const accessTokenExpiration = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME!,
      10,
    );
    const refreshTokenExpiration = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME!,
      10,
    );

    const { access_token, refresh_token } =
      await this.authService.generateAuthTokens({
        username: result.email,
        sub: result.id,
      });

    await this.authService.setTokens(
      access_token,
      refresh_token,
      accessTokenExpiration,
      refreshTokenExpiration,
      res,
    );

    return result;

    /*     // redirect

    res.redirect(process.env.FRONTEND_SUCCESS_REDIRECT_URL) */
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res) {
    const oldRefreshToken = req.cookies['refresh_token'];
    if (!oldRefreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    let userId: number;
    try {
      const decodedToken = this.jwtService.decode(oldRefreshToken);
      userId = decodedToken.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken } =
      await this.authService.rotateRefreshToken(userId, oldRefreshToken);

    const accessTokenExpiration = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME!,
      10,
    );
    const refreshTokenExpiration = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME!,
      10,
    );

    await this.authService.setTokens(
      accessToken,
      refreshToken,
      accessTokenExpiration,
      refreshTokenExpiration,
      res,
    );

    return { message: 'tokens refreshed successfully!' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    const { userId, username } = req.user;
    if (userId) await this.authService.logout(userId);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'logged out successfully' };
  }
}
