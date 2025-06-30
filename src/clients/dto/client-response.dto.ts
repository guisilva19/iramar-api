import { ApiProperty } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({
    description: 'ID único do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Número de telefone do cliente',
    example: '+5511999999999',
  })
  phone: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
} 