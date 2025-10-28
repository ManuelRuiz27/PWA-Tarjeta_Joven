import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...refresh' })
  refreshToken!: string;

  @ApiProperty({
    type: () => UserResponseDto,
    nullable: true,
    example: {
      id: 'usr_123',
      nombre: 'Juan',
      apellidos: 'Pérez López',
      curp: 'PEPJ800101HDFLLL01',
      email: 'usuario@example.com',
      municipio: 'Guadalajara',
      telefono: '3312345678',
    },
  })
  user!: UserResponseDto | null;
}
