import { jwtVerify, importX509 } from 'jose';
import axios from 'axios';

// Cache for Apple's public keys
let applePublicKeys: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches Apple's public keys from their JWKS endpoint
 * @returns Public keys in JWKS format
 */
async function fetchApplePublicKeys(): Promise<any> {
  const now = Date.now();
  
  // Use cached keys if available and not expired
  if (applePublicKeys && (now - lastFetchTime < CACHE_DURATION)) {
    return applePublicKeys;
  }
  
  try {
    // Apple's JWKS endpoint for App Store Server API
    const response = await axios.get('https://appleid.apple.com/auth/keys');
    applePublicKeys = response.data;
    lastFetchTime = now;
    return applePublicKeys;
  } catch (error) {
    console.error('Error fetching Apple public keys:', error);
    throw new Error('Failed to fetch Apple public keys');
  }
}

/**
 * Verifies a JWS (JSON Web Signature) from Apple
 * @param signedPayload The JWS string to verify
 * @returns The decoded payload as a JavaScript object
 */
export async function verifyJWS(signedPayload: string): Promise<any> {
  try {
    // For App Store Server Notifications, we can directly parse the payload
    // Apple's App Store Server Notifications v2 use a specific format
    // This is a simplified implementation - in production, you should verify the signature
    
    const parts = signedPayload.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWS format');
    }
    
    // Decode the payload (middle part)
    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error('Error verifying JWS:', error);
    throw new Error('Failed to verify JWS signature');
  }
}

/**
 * Properly verifies a JWS with signature validation
 * For production use, this should be used instead of the simplified verifyJWS
 * @param signedPayload The JWS string to verify
 * @returns The decoded and verified payload
 */
export async function verifyJWSWithSignature(signedPayload: string): Promise<any> {
  try {
    const jwks = await fetchApplePublicKeys();
    
    // Extract header to get the key ID
    const headerBase64 = signedPayload.split('.')[0];
    const headerJson = Buffer.from(headerBase64, 'base64').toString('utf-8');
    const header = JSON.parse(headerJson);
    
    // Find the matching key in the JWKS
    const key = jwks.keys.find((k: any) => k.kid === header.kid);
    if (!key) {
      throw new Error('No matching key found in JWKS');
    }
    
    // Verify the JWS using the public key
    const publicKey = await importX509(key.x5c[0], header.alg);
    
    // Correctly verify the JWS and extract the payload
    const { payload } = await jwtVerify(signedPayload, publicKey);
    
    // Handle the payload correctly based on its type
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    } else if (payload instanceof Uint8Array) {
      return JSON.parse(new TextDecoder().decode(payload));
    } else {
      // If it's already an object, return it directly
      return payload;
    }
  } catch (error) {
    console.error('Error verifying JWS with signature:', error);
    throw new Error('Failed to verify JWS signature');
  }
}
