import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/logging.interceptor.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { DemandsModule } from './demands/demands.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, DemandsModule, DashboardModule],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}