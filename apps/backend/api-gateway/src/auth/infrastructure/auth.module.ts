import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaAuthRepository } from './adapters/prisma-auth.repository';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { AuthRepositoryPort } from '../domain/ports/auth-repository.port';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AuthRepositoryPort, useClass: PrismaAuthRepository },
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
  ],
  exports: [AuthRepositoryPort],
})
export class AuthModule {}
