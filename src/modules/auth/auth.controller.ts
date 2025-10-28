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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FastifyRequest } from 'fastify';
import { OtpThrottleGuard } from '../../common/guards/otp-throttle.guard';
import { RefreshGuard } from '../../common/guards/refresh.guard';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './validation/auth.validation';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @UseGuards(OtpThrottleGuard)
  @ApiOperation({ summary: 'Enviar OTP al usuario' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'OTP enviado correctamente' })
  async sendOtp(@Body(new JoiValidationPipe(sendOtpSchema)) dto: SendOtpDto): Promise<void> {
    await this.authService.sendOtp(dto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verificar OTP' })
  @ApiOkResponse({ type: AuthTokensDto })
  verifyOtp(@Body(new JoiValidationPipe(verifyOtpSchema)) dto: VerifyOtpDto): Promise<AuthTokensDto> {
    return this.authService.verifyOtp(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({ type: AuthTokensDto })
  @HttpCode(HttpStatus.OK)
  login(@Body(new JoiValidationPipe(loginSchema)) dto: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: RegisterResponseDto,
    description: 'Registro recibido correctamente',
  })
  async register(@Body(new JoiValidationPipe(registerSchema)) dto: RegisterDto): Promise<RegisterResponseDto> {
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
  refresh(
    @Req() request: FastifyRequest & { user: AuthenticatedUser },
    @Body(new JoiValidationPipe(refreshSchema)) _dto: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(request.user);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Sesión cerrada correctamente' })
  logout() {
    return this.authService.logout();
  }
}
