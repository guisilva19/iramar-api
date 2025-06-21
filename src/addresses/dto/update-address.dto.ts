import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAddressDto {
  @ApiPropertyOptional({
    description: 'Nome da rua',
    example: 'Rua das Flores'
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({
    description: 'Número',
    example: '123'
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({
    description: 'Complemento',
    example: 'Apto 45'
  })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({
    description: 'Bairro',
    example: 'Centro'
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'Cidade',
    example: 'São Paulo'
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado',
    example: 'SP'
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'CEP',
    example: '01234-567'
  })
  @IsOptional()
  @IsString()
  zipCode?: string;
} 