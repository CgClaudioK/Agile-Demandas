import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SignUpDTO, SignInDTO } from './dtos/auth.js';
import { AuthService } from './auth.service.js';
import { CurrentUser, Public, type AuthUser } from '../common/decorators.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Public()
    @ApiOperation({ summary: 'Cadastrar novo usuário (nasce como SOLICITANTE)' })
    @ApiBody({
        type: SignUpDTO,
        examples: {
            padrao: {
                summary: 'Exemplo de cadastro',
                value: {
                    name: 'João da Silva',
                    email: 'joao.silva@empresa.com',
                    password: 'Senha@Forte123',
                },
            },
        },
    })
    @Post('signup')
    async signup(@Body() body: SignUpDTO) {
        return await this.authService.signUp(body);
    } 

    @Public()
    @ApiOperation({ summary: 'Autenticar com e-mail e senha e obter JWT' })
    @ApiBody({
        type: SignInDTO,
        examples: {
            padrao: {
                summary: 'Exemplo de login',
                value: {
                    email: 'analista@agile.com',
                    password: 'Analista@123',
                },
            },
        },
    })
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    async signin(@Body() body: SignInDTO) {
        return this.authService.signIn(body);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obter dados do usuário autenticado a partir do JWT' })
    @Get('me')
    async me(@CurrentUser() user: AuthUser) {
        return user;
    }
}