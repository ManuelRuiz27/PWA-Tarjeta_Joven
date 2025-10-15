import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  apellidos!: string;

  @ApiProperty()
  curp!: string;

  @ApiProperty({ nullable: true })
  municipio?: string | null;

  @ApiProperty({ nullable: true })
  telefono?: string | null;
}
