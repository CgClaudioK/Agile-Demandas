import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/app.module.js';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET_KEY } from './constants.js';

@Module({
  imports: [JwtModule.register({
    global: true,
    secret: JWT_SECRET_KEY.secret,
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService]
})
export class AuthModule {}
