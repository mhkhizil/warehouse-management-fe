// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Link, useNavigate } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import { motion } from "framer-motion";

// // Components and utils
// import { AuthLayout } from "@/components/layout/auth-layout";
// import {
//   Form,
//   FormField,
//   FormLabel,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Select } from "@/components/ui/select";
// import { useAuth } from "@/core/presentation/hooks/useAuth";

// // Validation
// import { registerSchema, RegisterFormValues } from "@/lib/validations/auth";

// export default function RegisterPage() {
//   const navigate = useNavigate();
//   const { register: registerUser, error: authError } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterFormValues>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       phone: "",
//       role: "STAFF",
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const onSubmit = async (data: RegisterFormValues) => {
//     setIsSubmitting(true);
//     try {
//       await registerUser({
//         name: data.name,
//         email: data.email,
//         phone: data.phone,
//         role: data.role,
//         password: data.password,
//       });

//       // Registration successful, redirect to dashboard
//       navigate("/");
//     } catch {
//       // Error already handled in auth context
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className="space-y-6">
//         <div>
//           <h2 className="text-2xl font-semibold tracking-tight">
//             Create an account
//           </h2>
//           <p className="text-sm text-muted-foreground">
//             Enter your details below to create your account (Admin only)
//           </p>
//         </div>

//         {authError && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
//           >
//             {authError}
//           </motion.div>
//         )}

//         <Form onSubmit={handleSubmit(onSubmit)}>
//           <FormField>
//             <FormLabel required>Name</FormLabel>
//             <Input
//               {...register("name")}
//               placeholder="Enter your full name"
//               error={errors.name?.message}
//               autoComplete="name"
//             />
//           </FormField>

//           <FormField>
//             <FormLabel required>Email</FormLabel>
//             <Input
//               {...register("email")}
//               type="email"
//               placeholder="Enter your email"
//               error={errors.email?.message}
//               autoComplete="email"
//             />
//           </FormField>

//           <FormField>
//             <FormLabel required>Phone Number</FormLabel>
//             <Input
//               {...register("phone")}
//               placeholder="Enter your phone number"
//               error={errors.phone?.message}
//               autoComplete="tel"
//             />
//             <FormDescription>
//               This will be used for contact purposes
//             </FormDescription>
//           </FormField>

//           <FormField>
//             <FormLabel required>Role</FormLabel>
//             <Select {...register("role")} error={errors.role?.message}>
//               <option value="STAFF">Staff</option>
//               <option value="ADMIN">Admin</option>
//             </Select>
//           </FormField>

//           <FormField>
//             <FormLabel required>Password</FormLabel>
//             <div className="relative">
//               <Input
//                 {...register("password")}
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Create a password"
//                 error={errors.password?.message}
//                 autoComplete="new-password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//               </button>
//             </div>
//           </FormField>

//           <FormField>
//             <FormLabel required>Confirm Password</FormLabel>
//             <div className="relative">
//               <Input
//                 {...register("confirmPassword")}
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="Confirm your password"
//                 error={errors.confirmPassword?.message}
//                 autoComplete="new-password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
//               >
//                 {showConfirmPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//               </button>
//             </div>
//           </FormField>

//           <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
//             {isSubmitting ? "Creating account..." : "Create account"}
//           </Button>
//         </Form>

//         <div className="text-center text-sm">
//           Already have an account?{" "}
//           <Link
//             to="/login"
//             className="font-medium text-primary underline-offset-4 hover:underline"
//           >
//             Login here
//           </Link>
//         </div>
//       </div>
//     </AuthLayout>
//   );
// }
