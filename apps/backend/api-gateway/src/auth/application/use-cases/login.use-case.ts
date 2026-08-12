import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import type { UserDomain } from '../../domain/user.domain';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: {
    email: string;
    password: string;
  }): Promise<{ user: UserDomain; token: string }> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const credentials = await this.authRepository.findCredentialsByEmail(
      dto.email,
    );
    if (!credentials) {
      throw new Error('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      credentials.passwordHash,
    );
    if (!passwordMatches) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.jwtService.sign({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
