import { Supplier } from "../../domain/entities/Supplier";

// Create Supplier DTO
export interface CreateSupplierDTO {
  name: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  remarks?: string;
  isActive?: boolean;
}

// Update Supplier DTO
export interface UpdateSupplierDTO {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  remarks?: string;
  isActive?: boolean;
}

// Supplier Filter DTO
export interface SupplierFilterDTO {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  take?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Supplier List Response DTO
export interface SupplierDomainListResponseDTO {
  suppliers: Supplier[];
  total: number;
}

// API Response DTOs
export interface ApiSupplierResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSupplierListResponse {
  success: boolean;
  data: {
    suppliers: ApiSupplierResponse[];
    total: number;
  };
  message: string;
}

export interface ApiSupplierAllResponse {
  success: boolean;
  data: ApiSupplierResponse[];
  message: string;
}
