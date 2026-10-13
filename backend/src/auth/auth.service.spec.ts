import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  const prisma = { user: { findUnique: vi.fn(), create: vi.fn() } };
  const jwt = { signAsync: vi.fn() };
  let service: AuthService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new AuthService(prisma as any, jwt as any);
  });

  it('signUp cria usuário sem expor a senha', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({ id: '1', ...data }));

    const result = await service.signUp({ email: 'a@a.com', name: 'A', password: 'senha1234' });

    expect(result).toEqual({ id: '1', email: 'a@a.com', name: 'A' });
    const saved = prisma.user.create.mock.calls[0][0].data.password;
    expect(saved).not.toBe('senha1234');
  });

  it('signUp retorna conflito se o e-mail já existe', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });
    await expect(service.signUp({ email: 'a@a.com', name: 'A', password: 'senha1234' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('signIn retorna token com credenciais válidas', async () => {
    const password = await bcrypt.hash('senha1234', 4);
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@a.com', name: 'A', password });
    jwt.signAsync.mockResolvedValue('tok');

    await expect(service.signIn({ email: 'a@a.com', password: 'senha1234' })).resolves.toEqual({ token: 'tok' });
  });

  it('signIn rejeita senha inválida e usuário inexistente', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.signIn({ email: 'x@x.com', password: 'z' })).rejects.toBeInstanceOf(UnauthorizedException);

    const password = await bcrypt.hash('certa1234', 4);
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1', password });
    await expect(service.signIn({ email: 'a@a.com', password: 'errada' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
