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
  street: string;

  @ApiProperty({
    description: 'Número',
    example: '123'
  })
  @IsString()
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
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo'
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Estado',
    example: 'SP'
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'CEP',
    example: '01234-567'
  })
  @IsString()
  zipCode: string;
} 