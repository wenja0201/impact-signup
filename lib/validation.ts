import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1, "Vorname fehlt").max(80),
  lastName: z.string().min(1, "Nachname fehlt").max(80),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().max(30).optional().or(z.literal("")),
  discipline: z.enum([
    "Boxen",
    "Kickboxen",
    "BJJ",
    "Muay Thai",
    "MMA",
    "Kindertraining",
  ]),
  experienceLevel: z.enum(["Anfänger", "Fortgeschritten", "Profi"]),
  plan: z.enum(["1_monat", "6_monate", "12_monate", "24_monate"]),
});

export type SignupInput = z.infer<typeof signupSchema>;
