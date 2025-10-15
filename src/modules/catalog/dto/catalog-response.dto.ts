import { ApiProperty } from '@nestjs/swagger';

export class MerchantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  categoria!: string;

  @ApiProperty()
  municipio!: string;

  @ApiProperty()
  descuento!: string;

  @ApiProperty()
  direccion!: string;

  @ApiProperty()
  horario!: string;

  @ApiProperty({ nullable: true })
  descripcion?: string | null;

  @ApiProperty({ nullable: true })
  lat?: number | null;

  @ApiProperty({ nullable: true })
  lng?: number | null;
}

export class CatalogListDto {
  @ApiProperty({ type: [MerchantDto] })
  data!: MerchantDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}
