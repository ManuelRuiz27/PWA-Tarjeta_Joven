import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'usr_123' })
  id!: string;

  @ApiProperty({ example: 'Juan' })
  nombre!: string;

  @ApiProperty({ example: 'Pérez López' })
  apellidos!: string;

  @ApiProperty({ example: 'PEPJ800101HDFLLL01' })
  curp!: string;

  @ApiProperty({ nullable: true, example: 'usuario@example.com' })
  email?: string | null;

  @ApiProperty({ nullable: true, example: 'Guadalajara' })
  municipio?: string | null;

  @ApiProperty({ nullable: true, example: '3312345678' })
  telefono?: string | null;
}
