import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import type { SignUpDTO, SignInDTO } from './dtos/auth.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() body: SignUpDTO) {
        
        return await this.authService.signUp(body);
        
    } 

    @Post('signin')
    async signin(@Body() body: SignInDTO) {
        
        return this.authService.signIn(body);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me(@Request() request: any) {
        return request.user;
    }
}
