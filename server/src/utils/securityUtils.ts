

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateQrToken = (prefix: string = 'TOKEN', byteLength: number = 4): string => {
  const uniqueSuffix = globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, byteLength * 2);
  return `${prefix}-${uniqueSuffix.toUpperCase()}`;
};

export const generateIdentifier = (prefix: string, count: number): string => {
  return `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
};
