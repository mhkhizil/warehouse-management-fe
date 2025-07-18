import * as z from "zod";

// Password strength requirements
const PASSWORD_MIN_LENGTH = 6; // Updated to match API requirements

// User login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// User registration schema (admin only)
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be less than 50 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(15, { message: "Phone number must be less than 15 digits" })
      .regex(/^\+?\d+$/, { message: "Please enter a valid phone number" }),
    role: z.enum(["ADMIN", "STAFF"], {
      required_error: "Please select a role",
      invalid_type_error: "Role must be either ADMIN or STAFF",
    }),
    password: z.string().min(PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export form types
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
