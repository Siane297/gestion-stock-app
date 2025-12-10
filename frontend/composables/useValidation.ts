import { z } from 'zod';
import type { ZodSchema } from 'zod';

/**
 * Composable pour la validation de formulaires avec Zod
 */
export const useValidation = () => {
  /**
   * Valide des données par rapport à un schéma Zod
   * @param schema Schéma Zod
   * @param data Données à valider
   * @returns Objet contenant le succès, les données validées ou les erreurs
   */
  const validate = <T>(schema: ZodSchema<T>, data: unknown) => {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: null,
      };
    } else {
      // Formater les erreurs pour une utilisation facile dans l'UI
      const formattedErrors: Record<string, string> = {};
      
      result.error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        // Garder seulement la première erreur par champ
        if (!formattedErrors[path]) {
          formattedErrors[path] = err.message;
        }
      });

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }
  };

  /**
   * Helper pour créer des schémas de validation communs
   */
  const rules = {
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    required: (message = 'Ce champ est requis') => z.string().min(1, message),
    phone: z.string().regex(/^\+?[0-9\s-]{10,}$/, 'Numéro de téléphone invalide'),
  };

  return {
    validate,
    rules,
  };
};
