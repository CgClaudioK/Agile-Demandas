import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { CurrentUser, type AuthUser } from '../common/decorators.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    @ApiOperation({ summary: 'Obter resumo e totalizadores de demandas (por status e prioridade)' })
    @Get()
    summary(@CurrentUser() user: AuthUser) {
        return this.dashboardService.summary(user);
    }
}