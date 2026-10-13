import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET_KEY } from './constants.js';

@Module({
  imports: [PrismaModule, JwtModule.register({
    global: true,
    secret: JWT_SECRET_KEY.secret,
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ]
})
export class AuthModule {}