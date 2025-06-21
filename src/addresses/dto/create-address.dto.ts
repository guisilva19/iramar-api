import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
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