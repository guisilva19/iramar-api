import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({
    description: 'Nome da rua',
    example: 'Rua das Flores'
  })
  @IsString()
  @IsOptional()
  street: string;

  @ApiProperty({
    description: 'Número',
    example: '123'
  })
  @IsString()
  @IsOptional()
  number: string;

  @ApiPropertyOptional({
    description: 'Complemento',
    example: 'Apto 45'
  })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro'
  })
  @IsString()
  @IsOptional()
  neighborhood: string;

  @ApiProperty({
    description: 'Latitude',
    example: -23.5505
  })
  @IsOptional()
  lat: any;

  @ApiProperty({
    description: 'Longitude',
    example: -46.6333
  })
  @IsOptional()
  lng: any;
} 
