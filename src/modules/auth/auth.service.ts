import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/services/prisma.service';
import { UsersService } from '../users/users.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly otpTtlSeconds: number;
  private readonly otpMaxResends: number;
  private readonly otpMaxAttempts: number;
  private readonly otpCooldownSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.otpTtlSeconds = Number(
      this.configService.get<string>('OTP_TTL_SECONDS') ?? '300',
    );
    this.otpMaxResends = Number(
      this.configService.get<string>('OTP_MAX_RESENDS') ?? '3',
    );
    this.otpMaxAttempts = Number(
      this.configService.get<string>('OTP_MAX_ATTEMPTS') ?? '5',
    );
    this.otpCooldownSeconds = Number(
      this.configService.get<string>('OTP_COOLDOWN_SECONDS') ?? '60',
    );
  }

  async sendOtp({ curp }: SendOtpDto) {
    const normalizedCurp = curp.toUpperCase();
    const existing = await this.prisma.otpRequest.findFirst({
      where: { curp: normalizedCurp },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const secondsSinceLast =
        (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSinceLast < this.otpCooldownSeconds) {
        throw new ForbiddenException({
          code: 'OTP_COOLDOWN',
          message: 'Debes esperar antes de solicitar un nuevo OTP',
          details: { secondsRemaining: Math.ceil(this.otpCooldownSeconds - secondsSinceLast) },
        });
      }
      const remainingResends = this.otpMaxResends - existing.resends;
      if (remainingResends <= 0) {
        throw new ForbiddenException({
          code: 'OTP_MAX_RESENDS',
          message: 'Se alcanzó el máximo de envíos permitidos',
        });
      }
    }

    const otp = this.generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + this.otpTtlSeconds * 1000);

    if (existing) {
      await this.prisma.otpRequest.update({
        where: { id: existing.id },
        data: {
          codeHash,
          expiresAt,
          resends: existing.resends + 1,
          attempts: 0,
        },
      });
    } else {
      await this.prisma.otpRequest.create({
        data: {
          curp: normalizedCurp,
          codeHash,
          expiresAt,
          resends: 1,
        },
      });
    }

    return {
      message: 'OTP enviado',
      otp,
    };
  }

  async verifyOtp({ curp, otp }: VerifyOtpDto): Promise<AuthTokensDto> {
    const normalizedCurp = curp.toUpperCase();
    const request = await this.prisma.otpRequest.findFirst({
      where: { curp: normalizedCurp },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) {
      throw new BadRequestException({
        code: 'OTP_NOT_FOUND',
        message: 'No se encontró una solicitud de OTP',
      });
    }

    if (request.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException({
        code: 'OTP_EXPIRED',
        message: 'El código OTP ha expirado',
      });
    }

    const isValid = await bcrypt.compare(otp, request.codeHash);
    if (!isValid) {
      const attempts = request.attempts + 1;
      await this.prisma.otpRequest.update({
        where: { id: request.id },
        data: { attempts },
      });
      if (attempts >= this.otpMaxAttempts) {
        throw new ForbiddenException({
          code: 'OTP_MAX_ATTEMPTS',
          message: 'Has superado el número de intentos permitidos',
        });
      }
      throw new BadRequestException({
        code: 'OTP_INVALID',
        message: 'El código OTP es incorrecto',
      });
    }

    await this.prisma.otpRequest.delete({ where: { id: request.id } });

    const user = await this.usersService.findByCurp(normalizedCurp);
    const tokens = await this.createTokens(user?.id ?? normalizedCurp, normalizedCurp);

    return {
      ...tokens,
      user: user ? this.usersService.mapToResponse(user) : null,
    };
  }

  async register(data: RegisterDto) {
    const normalizedCurp = data.curp.toUpperCase();
    const birthDate = this.parseBirthDate(data.fechaNacimiento);

    if (!birthDate) {
      throw new BadRequestException({
        code: 'INVALID_BIRTHDATE',
        message: 'Formato de fecha inválido, use DD/MM/AAAA',
      });
    }

    if (!data.acepta_tc) {
      throw new BadRequestException({
        code: 'TERMINOS_NO_ACEPTADOS',
        message: 'Debes aceptar los términos y condiciones',
      });
    }

    const existing = await this.usersService.findByCurp(normalizedCurp);
    const payload = {
      nombre: data.nombre,
      apellidos: data.apellidos,
      fechaNacimiento: birthDate,
      colonia: data.colonia,
      curp: normalizedCurp,
      municipio: data.municipio,
      telefono: data.telefono,
      isActive: false,
    };

    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: payload,
        })
      : await this.prisma.user.create({ data: payload });

    return { userId: user.id };
  }

  async refreshToken({ refreshToken }: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
      const accessToken = await this.jwtService.signAsync(
        { sub: payload.sub, curp: payload.curp },
        {
          secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_TTL') ?? '900s',
        },
      );
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'El token de refresco es inválido o ha expirado',
      });
    }
  }

  async logout() {
    return;
  }

  private async createTokens(userId: string, curp: string) {
    const payload = { sub: userId, curp };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TTL') ?? '900s',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TTL') ?? '7d',
    });
    return { accessToken, refreshToken };
  }

  private parseBirthDate(value: string) {
    const [day, month, year] = value.split('/').map((v) => Number(v));
    if (!day || !month || !year) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
