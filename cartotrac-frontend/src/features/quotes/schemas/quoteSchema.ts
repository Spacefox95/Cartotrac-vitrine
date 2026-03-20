import { z } from 'zod';

export const quoteSchema = z.object({
  reference: z.string().min(1, 'La reference est requise'),
  client_id: z.coerce.number().int().positive('Le client est requis'),
  status: z.string().min(1, 'Le statut est requis'),
  total_ht: z.string().min(1, 'Le total HT est requis'),
  total_ttc: z.string().min(1, 'Le total TTC est requis'),
});

export type QuoteSchema = z.infer<typeof quoteSchema>;
