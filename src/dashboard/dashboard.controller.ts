import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Obter estatísticas do dashboard',
    description: 'Retorna estatísticas gerais do sistema: produtos pendentes, total de produtos e pedidos do dia atual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas obtidas com sucesso',
    type: DashboardStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão (apenas ADMIN pode acessar)',
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getDashboardStats();
  }
} 