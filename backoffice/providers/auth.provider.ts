import { BaseAuthProvider, LoginHandlerOptions } from 'adminjs';
import type { Response } from 'express';
import { ROLES } from '@shared/entities/users/roles.enum.js';
import { UserDto, UserWithAccessToken } from '@shared/dtos/users/user.dto.js';
import { API_URL } from '../config/api-url.js';

export class AuthProvider extends BaseAuthProvider {
  override async handleLogin(opts: LoginHandlerOptions, context?: any) {
    const { email, password } = opts.data;
    try {
      const response = await fetch(`${API_URL}/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data: UserWithAccessToken = await response.json();
        const { user, accessToken } = data;
        if (this.isAdmin(user)) {
          return { ...user, accessToken };
        }
        return null;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private isAdmin(user: UserDto) {
    return user.role === ROLES.ADMIN;
  }

  override async handleLogout({ res }: { res: Response }) {
    // Remove auth cookies
    res.setHeader('Set-Cookie', [
      `backoffice=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
      `next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
      `__Secure-next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure`,
    ]);
  }
}
