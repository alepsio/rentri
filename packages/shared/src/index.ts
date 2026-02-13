import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40),
});

export const createAirlineSchema = z.object({
  name: z.string().min(3).max(50),
  code: z.string().min(2).max(3),
  homeAirportId: z.string().uuid(),
  timezone: z.string().min(2),
  language: z.string().default('it'),
});

export const createRouteSchema = z.object({
  originAirportId: z.string().uuid(),
  destinationAirportId: z.string().uuid(),
  aircraftId: z.string().uuid(),
  ticketPrice: z.number().positive(),
  frequencyPerDay: z.number().int().min(1).max(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAirlineInput = z.infer<typeof createAirlineSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
