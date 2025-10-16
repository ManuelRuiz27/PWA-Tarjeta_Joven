import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FastifyRequest } from 'fastify';
import { OtpThrottleGuard } from '../../common/guards/otp-throttle.guard';
import { RefreshGuard } from '../../common/guards/refresh.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @UseGuards(OtpThrottleGuard)
  @ApiOperation({ summary: 'Enviar OTP al usuario' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'OTP enviado correctamente' })
  async sendOtp(@Body() dto: SendOtpDto): Promise<void> {
    await this.authService.sendOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verificar OTP' })
  @ApiOkResponse({ type: AuthTokensDto })
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokensDto> {
    return this.authService.verifyOtp(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: RegisterResponseDto,
    description: 'Registro recibido correctamente',
  })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  refresh(@Req() request: FastifyRequest, @Body() _dto: RefreshTokenDto) {
    const payload = (request as any).user as { sub: string; curp: string };
    return this.authService.refreshToken(payload);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Sesión cerrada correctamente' })
  logout() {
    return this.authService.logout();
  }
}
