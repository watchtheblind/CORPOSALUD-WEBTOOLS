import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import type { UserDomain } from '../../domain/user.domain';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: {
    email: string;
    password: string;
    role: 'admin' | 'doctor' | 'nurse';
  }): Promise<{ user: UserDomain; token: string }> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('Email ya registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    const token = this.jwtService.sign({
      sub: String(user.id),
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
