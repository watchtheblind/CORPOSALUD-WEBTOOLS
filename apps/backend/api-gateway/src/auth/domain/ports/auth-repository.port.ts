import type { UserDomain } from '../user.domain';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: 'admin' | 'doctor' | 'nurse';
}

export abstract class AuthRepositoryPort {
  abstract findByEmail(email: string): Promise<UserDomain | null>;
  abstract findCredentialsByEmail(
    email: string,
  ): Promise<(UserDomain & { passwordHash: string }) | null>;
  abstract create(input: CreateUserInput): Promise<UserDomain>;
}
