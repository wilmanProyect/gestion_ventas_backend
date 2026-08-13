import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY } from '@modules/users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '@modules/users/domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '@modules/users/domain/ports/password-hasher.interface';
import type { IPasswordHasher } from '@modules/users/domain/ports/password-hasher.interface';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.getIsActive()) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const isValid = await this.passwordHasher.compare(
      dto.password,
      user.getPassword().getHash(),
    );

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.getId(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      roles: user.getRoles().map(role => role.getName()),
      permissions: user.getRoles().flatMap(role => role.getPermissions().map(p => p.getName())),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        roles: payload.roles,
        permissions: payload.permissions,
      },
    };
  }
}
