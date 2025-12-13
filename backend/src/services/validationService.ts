/**
 * Fonctions utilitaires de validation communes
 */

/**
 * Valide qu'une chaîne n'est pas vide et a une longueur minimale
 */
export function validateRequiredString(
  value: unknown, 
  fieldName: string, 
  minLength: number = 1
): string {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} est obligatoire`);
  }
  const str = String(value).trim();
  if (str.length < minLength) {
    throw new Error(`${fieldName} doit contenir au moins ${minLength} caractère${minLength > 1 ? 's' : ''}`);
  }
  return str;
}

/**
 * Valide un email
 */
export function validateEmail(email: unknown): string | null {
  if (email === null || email === undefined || email === '') {
    return null;
  }
  const str = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    throw new Error("Format d'email invalide");
  }
  return str;
}

/**
 * Valide un numéro de téléphone
 */
export function validatePhone(phone: unknown, minDigits: number = 8): string | null {
  if (phone === null || phone === undefined || phone === '') {
    return null;
  }
  const str = String(phone).trim().replace(/\s+/g, '');
  if (str.length < minDigits) {
    throw new Error(`Le numéro de téléphone doit contenir au moins ${minDigits} chiffres`);
  }
  return str;
}

/**
 * Valide un nombre positif
 */
export function validatePositiveNumber(
  value: unknown, 
  fieldName: string, 
  allowZero: boolean = true
): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} doit être un nombre`);
  }
  if (allowZero ? num < 0 : num <= 0) {
    throw new Error(`${fieldName} doit être un nombre ${allowZero ? 'positif ou nul' : 'strictement positif'}`);
  }
  return num;
}

/**
 * Valide un entier positif
 */
export function validatePositiveInteger(
  value: unknown, 
  fieldName: string, 
  allowZero: boolean = false
): number {
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new Error(`${fieldName} doit être un nombre entier`);
  }
  if (allowZero ? num < 0 : num <= 0) {
    throw new Error(`${fieldName} doit être un entier ${allowZero ? 'positif ou nul' : 'strictement positif'}`);
  }
  return num;
}

/**
 * Valide un pourcentage (0-100)
 */
export function validatePercentage(value: unknown, fieldName: string): number {
  const num = Number(value);
  if (isNaN(num) || num < 0 || num > 100) {
    throw new Error(`${fieldName} doit être un pourcentage entre 0 et 100`);
  }
  return num;
}

/**
 * Valide un format d'heure (HH:MM)
 */
export function validateTimeFormat(time: unknown): string | null {
  if (time === null || time === undefined || time === '') {
    return null;
  }
  const str = String(time).trim();
  if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(str)) {
    throw new Error("Format d'heure invalide (attendu: HH:MM)");
  }
  return str;
}

/**
 * Valide un UUID
 */
export function validateUUID(value: unknown, fieldName: string): string {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} est obligatoire`);
  }
  const str = String(value).trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)) {
    throw new Error(`${fieldName} n'est pas un identifiant valide`);
  }
  return str;
}

/**
 * Valide une date
 */
export function validateDate(value: unknown, fieldName: string): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const date = new Date(value as string);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} n'est pas une date valide`);
  }
  return date;
}

/**
 * Nettoie une chaîne (trim + suppression caractères dangereux)
 */
export function sanitizeString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value)
    .trim()
    .replace(/[<>]/g, '') // Supprime < et > pour éviter XSS basique
    .replace(/[\x00-\x1F\x7F]/g, ''); // Supprime caractères de contrôle
}

/**
 * Valide un tableau non vide
 */
export function validateNonEmptyArray<T>(
  value: unknown, 
  fieldName: string
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} doit être un tableau`);
  }
  if (value.length === 0) {
    throw new Error(`${fieldName} ne peut pas être vide`);
  }
  return value as T[];
}

/**
 * Valide une valeur enum
 */
export function validateEnum<T extends string>(
  value: unknown, 
  allowedValues: T[], 
  fieldName: string
): T {
  const str = String(value).trim() as T;
  if (!allowedValues.includes(str)) {
    throw new Error(`${fieldName} doit être l'une des valeurs suivantes: ${allowedValues.join(', ')}`);
  }
  return str;
}
