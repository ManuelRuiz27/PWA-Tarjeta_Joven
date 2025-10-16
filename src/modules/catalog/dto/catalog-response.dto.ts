import { ApiProperty } from '@nestjs/swagger';

export class MerchantDto {
  @ApiProperty({ example: 'mrc_123' })
  id!: string;

  @ApiProperty({ example: 'Hamburguesas El Buen Sabor' })
  nombre!: string;

  @ApiProperty({ example: 'restaurantes' })
  categoria!: string;

  @ApiProperty({ example: 'Guadalajara' })
  municipio!: string;

  @ApiProperty({ example: '15% de descuento' })
  descuento!: string;

  @ApiProperty({ example: 'Av. Principal 123, Col. Centro' })
  direccion!: string;

  @ApiProperty({ example: 'Lunes a Domingo 9:00 - 22:00' })
  horario!: string;

  @ApiProperty({ nullable: true, example: 'Promoción válida mostrando tu credencial.' })
  descripcion?: string | null;

  @ApiProperty({ nullable: true, example: 20.6736 })
  lat?: number | null;

  @ApiProperty({ nullable: true, example: -103.344 })
  lng?: number | null;
}

export class CatalogListDto {
  @ApiProperty({
    type: [MerchantDto],
    example: [
      {
        id: 'mrc_123',
        nombre: 'Hamburguesas El Buen Sabor',
        categoria: 'restaurantes',
        municipio: 'Guadalajara',
        descuento: '15% de descuento',
        direccion: 'Av. Principal 123, Col. Centro',
        horario: 'Lunes a Domingo 9:00 - 22:00',
        descripcion: 'Promoción válida mostrando tu credencial.',
        lat: 20.6736,
        lng: -103.344,
      },
    ],
  })
  data!: MerchantDto[];

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;
}
