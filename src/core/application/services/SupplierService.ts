import { Supplier } from "../../domain/entities/Supplier";
import { ISupplierService } from "../../domain/services/ISupplierService";
import { ISupplierRepository } from "../../domain/repositories/ISupplierRepository";
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierFilterDTO,
  SupplierDomainListResponseDTO,
} from "../dtos/SupplierDTO";

/**
 * Supplier Service implementation
 * Contains business logic for supplier-related operations
 */
export class SupplierService implements ISupplierService {
  private supplierRepository: ISupplierRepository;

  constructor(supplierRepository: ISupplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: CreateSupplierDTO): Promise<Supplier> {
    // Validate required fields
    if (
      !supplierData.name ||
      !supplierData.email ||
      !supplierData.phone ||
      !supplierData.address ||
      !supplierData.contactPerson
    ) {
      throw new Error(
        "Name, email, phone, address, and contact person are required"
      );
    }

    // Validate email format
    if (!supplierData.email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    // Validate phone format (basic validation)
    if (!supplierData.phone || supplierData.phone.length < 10) {
      throw new Error("Please enter a valid phone number");
    }

    try {
      return await this.supplierRepository.createSupplier(supplierData);
    } catch (error) {
      console.error("Supplier creation failed:", error);
      throw new Error("Failed to create supplier. Please try again.");
    }
  }

  /**
   * Get suppliers with pagination and filtering
   */
  async getSuppliers(
    params?: SupplierFilterDTO
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      return await this.supplierRepository.getSuppliers(params);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      throw new Error("Failed to fetch suppliers");
    }
  }

  /**
   * Get all suppliers without pagination
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      return await this.supplierRepository.getAllSuppliers();
    } catch (error) {
      console.error("Failed to fetch all suppliers:", error);
      throw new Error("Failed to fetch all suppliers");
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: number): Promise<Supplier> {
    if (!id || id <= 0) {
      throw new Error("Valid supplier ID is required");
    }

    try {
      return await this.supplierRepository.getSupplierById(id);
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      throw new Error("Supplier not found");
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(
    id: number,
    supplierData: UpdateSupplierDTO
  ): Promise<Supplier> {
    if (!id || id <= 0) {
      throw new Error("Valid supplier ID is required");
    }

    // Validate email format if provided
    if (supplierData.email && !supplierData.email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    // Validate phone format if provided
    if (supplierData.phone && supplierData.phone.length < 10) {
      throw new Error("Please enter a valid phone number");
    }

    try {
      return await this.supplierRepository.updateSupplier(id, supplierData);
    } catch (error) {
      console.error("Supplier update failed:", error);
      throw new Error("Failed to update supplier");
    }
  }

  /**
   * Delete supplier (soft delete)
   */
  async deleteSupplier(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("Valid supplier ID is required");
    }

    try {
      return await this.supplierRepository.deleteSupplier(id);
    } catch (error) {
      console.error("Supplier deletion failed:", error);
      throw new Error("Failed to delete supplier");
    }
  }

  /**
   * Restore deleted supplier
   */
  async restoreSupplier(id: number): Promise<Supplier> {
    if (!id || id <= 0) {
      throw new Error("Valid supplier ID is required");
    }

    try {
      return await this.supplierRepository.restoreSupplier(id);
    } catch (error) {
      console.error("Supplier restoration failed:", error);
      throw new Error("Failed to restore supplier");
    }
  }

  /**
   * Search suppliers
   */
  async searchSuppliers(
    query: string,
    take: number = 10,
    skip: number = 0
  ): Promise<SupplierDomainListResponseDTO> {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    try {
      return await this.supplierRepository.searchSuppliers(query, take, skip);
    } catch (error) {
      console.error("Supplier search failed:", error);
      throw new Error("Failed to search suppliers");
    }
  }

  /**
   * Search suppliers by name
   */
  async searchSuppliersByName(
    name: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    if (!name || name.trim().length === 0) {
      throw new Error("Name is required for search");
    }

    try {
      return await this.supplierRepository.searchSuppliersByName(
        name,
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Supplier name search failed:", error);
      throw new Error("Failed to search suppliers by name");
    }
  }

  /**
   * Search suppliers by email
   */
  async searchSuppliersByEmail(
    email: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    if (!email || email.trim().length === 0) {
      throw new Error("Email is required for search");
    }

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    try {
      return await this.supplierRepository.searchSuppliersByEmail(
        email,
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Supplier email search failed:", error);
      throw new Error("Failed to search suppliers by email");
    }
  }

  /**
   * Search suppliers by phone
   */
  async searchSuppliersByPhone(
    phone: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    if (!phone || phone.trim().length === 0) {
      throw new Error("Phone is required for search");
    }

    try {
      return await this.supplierRepository.searchSuppliersByPhone(
        phone,
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Supplier phone search failed:", error);
      throw new Error("Failed to search suppliers by phone");
    }
  }

  /**
   * Search suppliers by address
   */
  async searchSuppliersByAddress(
    address: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    if (!address || address.trim().length === 0) {
      throw new Error("Address is required for search");
    }

    try {
      return await this.supplierRepository.searchSuppliersByAddress(
        address,
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Supplier address search failed:", error);
      throw new Error("Failed to search suppliers by address");
    }
  }

  /**
   * Get suppliers with debts
   */
  async getSuppliersWithDebts(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      return await this.supplierRepository.getSuppliersWithDebts(
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Failed to fetch suppliers with debts:", error);
      throw new Error("Failed to fetch suppliers with debts");
    }
  }

  /**
   * Get suppliers with overdue debts
   */
  async getSuppliersWithOverdueDebts(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      return await this.supplierRepository.getSuppliersWithOverdueDebts(
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Failed to fetch suppliers with overdue debts:", error);
      throw new Error("Failed to fetch suppliers with overdue debts");
    }
  }

  /**
   * Get deleted suppliers
   */
  async getDeletedSuppliers(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      return await this.supplierRepository.getDeletedSuppliers(
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Failed to fetch deleted suppliers:", error);
      throw new Error("Failed to fetch deleted suppliers");
    }
  }

  /**
   * Get active suppliers
   */
  async getActiveSuppliers(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      return await this.supplierRepository.getActiveSuppliers(
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Failed to fetch active suppliers:", error);
      throw new Error("Failed to fetch active suppliers");
    }
  }
}
