import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginClientDto {
  @ApiProperty({
    description: 'Número de telefone do cliente para login',
    example: '+5511999999999',
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Telefone deve estar em formato válido',
  })
  phone: string;
} 