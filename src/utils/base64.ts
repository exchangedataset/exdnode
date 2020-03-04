export function encodeBase64(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBase64(encoded: string): Buffer {
  const str = Array(5 - (encoded.length % 4)).join('=')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return Buffer.from(str, 'base64');
}

export function validateBase64(str: string): boolean {
  return /^[A-Za-z0-9\-_]+$/.test(str);
}
