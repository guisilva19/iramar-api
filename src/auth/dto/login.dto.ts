import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'gui@gmail.com',
    description: 'Email do administrador',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do administrador (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
