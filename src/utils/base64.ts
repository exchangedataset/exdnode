export function encodeBase64(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBase64(encoded: string): Buffer {
  const normal = encoded + Array(5 - (encoded.length % 4)).fill('=');
  const base64 = normal
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return Buffer.from(base64, 'base64');
}

export function validateBase64(str: string): boolean {
  return /^[A-Za-z0-9\-_]+$/.test(str);
}
