import { Supplier } from "../entities/Supplier";
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierFilterDTO,
  SupplierDomainListResponseDTO,
} from "../../application/dtos/SupplierDTO";

export interface ISupplierService {
  // Basic CRUD operations
  createSupplier(supplierData: CreateSupplierDTO): Promise<Supplier>;
  getSuppliers(
    params?: SupplierFilterDTO
  ): Promise<SupplierDomainListResponseDTO>;
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: number): Promise<Supplier>;
  updateSupplier(
    id: number,
    supplierData: UpdateSupplierDTO
  ): Promise<Supplier>;
  deleteSupplier(id: number): Promise<boolean>;
  restoreSupplier(id: number): Promise<Supplier>;

  // Search operations
  searchSuppliers(
    query: string,
    take?: number,
    skip?: number
  ): Promise<SupplierDomainListResponseDTO>;
  searchSuppliersByName(
    name: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
  searchSuppliersByEmail(
    email: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
  searchSuppliersByPhone(
    phone: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
  searchSuppliersByAddress(
    address: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;

  // Special queries
  getSuppliersWithDebts(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
  getSuppliersWithOverdueDebts(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
  getDeletedSuppliers(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
  getActiveSuppliers(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO>;
}
