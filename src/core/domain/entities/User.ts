/**
 * User entity representing the core domain model for users in the system
 * This is independent of any framework or external concern
 */
export class User {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validates that the user entity contains valid data
   */
  isValid(): boolean {
    return (
      !!this.id &&
      !!this.username &&
      !!this.email &&
      this.email.includes("@") &&
      !!this.phone
    );
  }
}
