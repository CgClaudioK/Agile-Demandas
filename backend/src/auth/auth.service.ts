import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { SignUpDTO, SignInDTO } from './dtos/auth.js';
import { PrismaService } from '../prisma/app.module.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService, private jwtService: JwtService) {} 
    
    async signUp(data: SignUpDTO) {

        const userAlreadyExists = await this.prismaService.user.findUnique({
            where: { email: data.email }
        });

        if (userAlreadyExists) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prismaService.user.create({ 
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword
            }
        });

        return { 
            id: user.id,
            email: user.email,
            name: user.name
         };
    }

    async signIn(data: SignInDTO) {
        const user = await this.prismaService.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = await this.jwtService.signAsync({ id: user.id, email: user.email, name: user.name });
        
        return { 
            token
         };
    }
}
