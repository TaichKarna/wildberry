import jwt from 'jsonwebtoken';
import { appleConfig } from '../config';

/**
 * Generates a JWT token for Apple App Store Server API authentication
 * @returns JWT token string
 */
export function generateAppleJWT(): string {
  const payload = {
    iss: appleConfig.issuerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300, // 5-minute expiry
    aud: 'appstoreconnect-v1',
  };

  return jwt.sign(payload, appleConfig.privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: appleConfig.keyId,
      typ: 'JWT',
    },
  });
}
