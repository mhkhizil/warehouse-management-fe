import * as z from "zod";

// Password strength requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  upperCase: /[A-Z]/,
  lowerCase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

// User registration schema
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(50, { message: "Username must be less than 50 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(15, { message: "Phone number must be less than 15 digits" })
      .regex(/^\+?\d+$/, { message: "Please enter a valid phone number" }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      })
      .refine((value) => PASSWORD_REGEX.upperCase.test(value), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((value) => PASSWORD_REGEX.lowerCase.test(value), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((value) => PASSWORD_REGEX.number.test(value), {
        message: "Password must contain at least one number",
      })
      .refine((value) => PASSWORD_REGEX.special.test(value), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login schema
export const loginSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" })
    .regex(/^\+?\d+$/, { message: "Please enter a valid phone number" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
