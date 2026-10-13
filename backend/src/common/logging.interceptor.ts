import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const start = Date.now();
        const log = (status: number) =>
            this.logger.log(JSON.stringify({ method: req.method, path: req.url, status, ms: Date.now() - start, userId: req.user?.id ?? null }));
        return next.handle().pipe(
            tap({ next: () => log(res.statusCode), error: (e) => log(e?.getStatus?.() ?? 500) }),
        );
    }
}