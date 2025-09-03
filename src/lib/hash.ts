import { createHash } from 'crypto';

export function hashFile(buffer: Buffer): string {
  return createHash('md5').update(buffer).digest('hex');
}

export function hashFileWithParams(buffer: Buffer, params: Record<string, any>): string {
  const paramsString = JSON.stringify(params);
  return createHash('md5').update(buffer).update(paramsString).digest('hex');
}
