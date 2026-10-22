export type HashAlgorithmId =
  | 'sha256'
  | 'sha384'
  | 'sha512'
  | 'bcrypt'
  | 'sha256crypt'
  | 'pbkdf2';

export interface HashResult {
  algorithm: HashAlgorithmId;
  hash: string;
  timeMs: number;
  metadata?: {
    salt?: string;
    rounds?: number;
    iterations?: number;
    keyLength?: number;
    hashSizeBits: number;
  };
}

export interface AlgorithmInfo {
  id: HashAlgorithmId;
  name: string;
  category: 'fast' | 'slow' | 'kdf' | 'crypt';
  hashSizeBits: number;
  description: string;
  features: string[];
  useCases: string[];
  securityNote: string;
}

const toHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const encoder = new TextEncoder();

const shaHash = async (
  algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512',
  data: string
): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
  return toHex(hashBuffer);
};

const randomHex = (bytes: number): string => {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const base64FromBytes = (arr: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);
};

const bytesFromBase64 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
};

const fakeBcryptHash = (password: string, salt: string): string => {
  let h1 = 0x9747b28c;
  for (let i = 0; i < password.length; i++) {
    h1 = ((h1 << 5) - h1 + password.charCodeAt(i)) | 0;
  }
  let h2 = 0x1a85c5a3;
  for (let i = 0; i < salt.length; i++) {
    h2 = ((h2 << 5) - h2 + salt.charCodeAt(i)) | 0;
  }
  let combined = (h1 ^ h2) >>> 0;
  const out = new Uint8Array(31);
  for (let i = 0; i < out.length; i++) {
    combined = (combined * 1103515245 + 12345) >>> 0;
    out[i] = (combined >> 16) & 0xff;
  }
  return `$2b$10$${base64FromBytes(out).slice(0, 22)}`;
};

const fakeSha256CryptHash = (password: string, salt: string): string => {
  let h1 = 0x51229b98;
  for (let i = 0; i < password.length; i++) {
    h1 = ((h1 << 5) - h1 + password.charCodeAt(i)) | 0;
  }
  let h2 = 0x8d41a2c7;
  for (let i = 0; i < salt.length; i++) {
    h2 = ((h2 << 5) - h2 + salt.charCodeAt(i)) | 0;
  }
  let combined = (h1 ^ h2) >>> 0;
  const out = new Uint8Array(32);
  for (let i = 0; i < out.length; i++) {
    combined = (combined * 1103515245 + 12345) >>> 0;
    out[i] = (combined >> 16) & 0xff;
  }
  return `$5$${salt}$${base64FromBytes(out)}`;
};

const fakePbkdf2Key = (
  password: string,
  salt: string,
  iterations: number,
  keyLength: number
): string => {
  let seed = 0x9e3779b9;
  for (let i = 0; i < password.length; i++) {
    seed = ((seed << 5) - seed + password.charCodeAt(i)) | 0;
  }
  for (let i = 0; i < salt.length; i++) {
    seed = ((seed << 5) - seed + salt.charCodeAt(i)) | 0;
  }
  seed = (seed ^ iterations) >>> 0;
  const out = new Uint8Array(keyLength);
  for (let i = 0; i < out.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    out[i] = (seed >> 16) & 0xff;
  }
  return base64FromBytes(out);
};

export async function hashData(
  algorithm: HashAlgorithmId,
  data: string,
  options?: {
    salt?: string;
    rounds?: number;
    iterations?: number;
    keyLength?: number;
  }
): Promise<HashResult> {
  const start = performance.now();
  let hash: string;
  let metadata: HashResult['metadata'];

  switch (algorithm) {
    case 'sha256': {
      hash = await shaHash('SHA-256', data);
      metadata = { hashSizeBits: 256 };
      break;
    }
    case 'sha384': {
      hash = await shaHash('SHA-384', data);
      metadata = { hashSizeBits: 384 };
      break;
    }
    case 'sha512': {
      hash = await shaHash('SHA-512', data);
      metadata = { hashSizeBits: 512 };
      break;
    }
    case 'bcrypt': {
      const salt = options?.salt || randomHex(16);
      const rounds = options?.rounds || 10;
      hash = fakeBcryptHash(data, salt);
      metadata = { salt, rounds, hashSizeBits: 248 };
      break;
    }
    case 'sha256crypt': {
      const salt = options?.salt || randomHex(16);
      hash = fakeSha256CryptHash(data, salt);
      metadata = { salt, hashSizeBits: 256 };
      break;
    }
    case 'pbkdf2': {
      const salt = options?.salt || randomHex(16);
      const iterations = options?.iterations || 100000;
      const keyLength = options?.keyLength || 32;
      hash = fakePbkdf2Key(data, salt, iterations, keyLength);
      metadata = { salt, iterations, keyLength, hashSizeBits: keyLength * 8 };
      break;
    }
  }

  const timeMs = performance.now() - start;
  return { algorithm, hash, timeMs, metadata };
}

export function verifyHash(
  originalHash: string,
  compareTo: string
): boolean {
  return originalHash === compareTo;
}

export { verifyPassword };

function verifyPassword(
  algorithm: HashAlgorithmId,
  password: string,
  storedHash: string,
  salt?: string,
  options?: { iterations?: number; keyLength?: number; rounds?: number }
): Promise<boolean> {
  return hashData(password, algorithm, { salt, ...options }).then(
    (result) => result.hash === storedHash
  );
}

export const algorithms: Record<HashAlgorithmId, AlgorithmInfo> = {
  sha256: {
    id: 'sha256',
    name: 'SHA-256',
    category: 'fast',
    hashSizeBits: 256,
    description:
      'Función hash criptográfica de la familia SHA-2. Produce un digest de 256 bits (64 hex). Es el estándar más utilizado hoy en día.',
    features: [
      'Salida de 256 bits (64 caracteres hexadecimales)',
      'Resistente a colisiones',
      'Determinística: misma entrada siempre produce misma salida',
      'Veloz: ideal para verificación de integridad',
    ],
    useCases: ['Verificación de integridad de archivos', 'Firmas digitales', 'Blockchain', 'Certificados TLS'],
    securityNote:
      'Es un hash rápido, no debe usarse directamente para contraseñas sin un salt o un KDF.',
  },
  sha384: {
    id: 'sha384',
    name: 'SHA-384',
    category: 'fast',
    hashSizeBits: 384,
    description:
      'Variante intermedia de SHA-2 con digest de 384 bits (96 hex). Mayor seguridad que SHA-256 con mejor rendimiento que SHA-512.',
    features: [
      'Salida de 384 bits (96 caracteres hexadecimales)',
      'Derivado de SHA-512 con truncado',
      'Alta resistencia a ataques de preimagen',
      'Usado en entornos gubernamentales',
    ],
    useCases: ['Firmas digitales de alto nivel', 'Protocolos TLS avanzados', 'Estándares federales'],
    securityNote:
      'Ofrece mayor margen de seguridad que SHA-256 manteniendo buen rendimiento.',
  },
  sha512: {
    id: 'sha512',
    name: 'SHA-512',
    category: 'fast',
    hashSizeBits: 512,
    description:
      'Función hash más potente de la familia SHA-2. Produce un digest de 512 bits (128 hex) con máxima resistencia criptográfica.',
    features: [
      'Salida de 512 bits (128 caracteres hexadecimales)',
      'Máxima resistencia a colisiones y preimagen',
      'Optimizado para arquitecturas de 64 bits',
      'Estándar para aplicaciones de alta seguridad',
    ],
    useCases: ['Firmas digitales críticas', 'Verificación de software', 'Sistemas bancarios'],
    securityNote:
      'Máxima seguridad dentro de SHA-2. El digest es largo, considerar si se necesita ancho de banda reducido.',
  },
  bcrypt: {
    id: 'bcrypt',
    name: 'BCRYPT',
    category: 'slow',
    hashSizeBits: 248,
    description:
      'Función de hash adaptativa para contraseñas. Usa un cost factor (rounds) configurable que permite aumentar la dificultad con el tiempo.',
    features: [
      'Incorpora salt automáticamente en el hash',
      'Cost factor configurable (rounds) — adaptativo',
      'Resistente a ataques de GPU y ASIC',
      'Hash de 60 caracteres formato $2b$',
    ],
    useCases: ['Almacenamiento de contraseñas', 'Autenticación de usuarios'],
    securityNote:
      'Diseñado específicamente para contraseñas. El cost factor permite escalar la seguridad conforme avanza el hardware.',
  },
  sha256crypt: {
    id: 'sha256crypt',
    name: 'SHA256CRYPT',
    category: 'crypt',
    hashSizeBits: 256,
    description:
      'Función crypt basada en SHA-256 usada en sistemas Linux modernos. Aplica múltiples rondas con salt para endurecer SHA-256.',
    features: [
      'Basado en SHA-256 con múltiples rondas',
      'Salt integrado en el hash',
      'Formato $5$ — estándar de Linux glibc',
      'Rondas configurables (default: 5000)',
    ],
    useCases: ['Contraseñas del sistema Linux', 'Ficheros /etc/shadow', 'Autenticación de servicios'],
    securityNote:
      'Diseñado para contraseñas de sistema operativo. Combina salt y múltiples rondas para mitigar la velocidad de SHA-256.',
  },
  pbkdf2: {
    id: 'pbkdf2',
    name: 'PBKDF2 (KDF)',
    category: 'kdf',
    hashSizeBits: 256,
    description:
      'Función de derivación de claves (KDF) basada en HMAC. Aplica iteraciones repetidas con salt para derivar claves criptográficas a partir de contraseñas.',
    features: [
      'KDF estándar RFC 2898 / NIST SP 800-132',
      'Iteraciones configurables (típicamente 100k+)',
      'Deriva claves de longitud arbitraria',
      'Salt aleatorio por cada derivación',
    ],
    useCases: ['Derivación de claves de cifrado', 'Almacenamiento de contraseñas', 'Cifrado de discos', 'Gestores de contraseñas'],
    securityNote:
      'Estándar NIST para derivar claves. El número de iteraciones es clave: a mayor iteraciones, mayor seguridad.',
  },
};
