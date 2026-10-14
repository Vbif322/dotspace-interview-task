import { randomUUID } from 'crypto';
import type { UUID } from 'crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { Transaction } from 'sequelize';

import { CONFIG } from '#utilities/config.js';
import { ErrorExtended } from '#utilities/exceptions/index.js';

import { RepoRefreshToken } from '#repositories/auth/refresh-token.repository.js';

interface IAccessTokenPayload {
  id: number;
  uuid: UUID;
  login: string;
  displayName: string;
  isActivated: boolean;
}

interface IRefreshTokenPayload {
  id: number;
  uuid: UUID;
}

/**
 * Выпуск, проверка и хранение JWT-токенов.
 */
class ServiceToken {
  generateAccessToken(payload: IAccessTokenPayload): string {
    return jwt.sign(payload, CONFIG.JWT_SECRET, {
      expiresIn: CONFIG.JWT_ACCESS_TTL as SignOptions['expiresIn'],
    });
  }

  generateRefreshToken(payload: IRefreshTokenPayload): string {
    return jwt.sign(payload, CONFIG.JWT_SECRET, {
      expiresIn: CONFIG.JWT_REFRESH_TTL as SignOptions['expiresIn'],
      jwtid: randomUUID(),
    });
  }

  verifyAccessToken(token: string): IAccessTokenPayload {
    try {
      const payload = jwt.verify(token, CONFIG.JWT_SECRET);

      if (typeof payload === 'string') {
        throw ErrorExtended.Response.Client.Unauthorized();
      }

      return {
        id: payload.id,
        uuid: payload.uuid,
        login: payload.login,
        displayName: payload.displayName,
        isActivated: payload.isActivated,
      };
    } catch (error) {
      throw ErrorExtended.Response.Client.Unauthorized(undefined, error);
    }
  }

  /** Сохраняет refresh-токен сессии пользователя. */
  async save(
    userId: number,
    token: string,
    userAgent: string | null,
    transaction?: Transaction,
  ): Promise<string> {
    const decoded = jwt.decode(token);
    const exp =
      decoded !== null && typeof decoded !== 'string' ? decoded.exp : undefined;

    if (exp === undefined) {
      throw ErrorExtended.Response.Client.BadRequest({
        message: 'У refresh-токена не задан срок действия',
      });
    }

    const refreshToken = await RepoRefreshToken.create(
      {
        userId,
        token,
        userAgent,
        expireAt: new Date(exp * 1000),
      },
      transaction,
    );

    return refreshToken.token;
  }
}

const serviceInstance = new ServiceToken();

export { serviceInstance as ServiceToken };
export type { IAccessTokenPayload, IRefreshTokenPayload };
