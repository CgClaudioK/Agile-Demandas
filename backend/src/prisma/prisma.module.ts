import { Global, Module } from '@nestjs/common';
import { PrismaService } from './app.module.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}