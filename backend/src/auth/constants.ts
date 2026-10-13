const secret = process.env.JWT_SECRET_KEY;

if (!secret) {
    throw new Error('JWT_SECRET_KEY não definido nas variáveis de ambiente');
}

export const JWT_SECRET_KEY = { secret };
