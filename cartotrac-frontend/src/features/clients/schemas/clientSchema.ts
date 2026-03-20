import { z } from 'zod';

export const clientSchema = z.object({
  company_name: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  contact_name: z.string(),
  email: z.string().email('Email invalide').or(z.literal('')),
  phone: z.string(),
});

export type ClientSchema = z.infer<typeof clientSchema>;
