/**
 * User entity representing the core domain model for users in the system
 * This is independent of any framework or external concern
 */
export class User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "STAFF";
  profileImageUrl?: string;
  createdDate?: Date;
  updatedDate?: Date;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "ADMIN" | "STAFF";
    profileImageUrl?: string;
    createdDate?: Date;
    updatedDate?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.role = data.role;
    this.profileImageUrl = data.profileImageUrl;
    this.createdDate = data.createdDate;
    this.updatedDate = data.updatedDate;
  }

  /**
   * Validates that the user entity contains valid data
   */
  isValid(): boolean {
    return (
      !!this.id &&
      !!this.name &&
      !!this.email &&
      this.email.includes("@") &&
      !!this.role &&
      ["ADMIN", "STAFF"].includes(this.role)
    );
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    return this.role === "ADMIN";
  }

  /**
   * Check if user has staff role
   */
  isStaff(): boolean {
    return this.role === "STAFF";
  }
}
