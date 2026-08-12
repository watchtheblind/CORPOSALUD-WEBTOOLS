import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRole } from '../../domain/user.domain';

export interface AuthUser {
  id: bigint;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return request.user;
  },
);
