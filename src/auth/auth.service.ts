import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: { name: string; email: string; password: string }) {
    const existing = await this.usersService.getUserByEmail(payload.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await this.usersService.createUser({
      name: payload.name,
      email: payload.email,
      passwordHash,
    });

    const token = this.signToken(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.usersService.getUserByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async me(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return this.sanitizeUser(user);
  }

  private signToken(id: string, email: string, role: string) {
    return this.jwtService.sign({ sub: id, email, role });
  }

  private sanitizeUser(user: { passwordHash: string; [key: string]: unknown }) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
