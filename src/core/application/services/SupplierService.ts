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
    // Validate required fields for creation
    if (!supplierData.name || !supplierData.name.trim()) {
      throw new Error("Name is required");
    }

    if (!supplierData.email || !supplierData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supplierData.email)) {
      throw new Error("Invalid email format");
    }

    return await this.supplierRepository.createSupplier(supplierData);
  }

  /**
   * Get suppliers with pagination and filtering
   */
  async getSuppliers(
    params?: SupplierFilterDTO
  ): Promise<SupplierDomainListResponseDTO> {
    return await this.supplierRepository.getSuppliers(params);
  }

  /**
   * Get all suppliers without pagination
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    return await this.supplierRepository.getAllSuppliers();
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: number): Promise<Supplier> {
    if (id <= 0) {
      throw new Error("Invalid supplier ID");
    }
    return await this.supplierRepository.getSupplierById(id);
  }

  /**
   * Update supplier
   */
  async updateSupplier(
    id: number,
    supplierData: UpdateSupplierDTO
  ): Promise<Supplier> {
    if (id <= 0) {
      throw new Error("Invalid supplier ID");
    }

    // Get existing supplier to validate the update
    const existingSupplier = await this.supplierRepository.getSupplierById(id);

    // Create a merged supplier object for validation
    const updatedSupplier = new Supplier({
      ...existingSupplier,
      ...supplierData,
    });

    // For updates, we only validate the fields that are being updated
    // and ensure the merged object has the required fields
    if (!updatedSupplier.name || !updatedSupplier.email) {
      throw new Error("Name and email are required");
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedSupplier.email)) {
      throw new Error("Invalid email format");
    }

    return await this.supplierRepository.updateSupplier(id, supplierData);
  }

  /**
   * Delete supplier (soft delete)
   */
  async deleteSupplier(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error("Invalid supplier ID");
    }
    return await this.supplierRepository.deleteSupplier(id);
  }

  /**
   * Restore deleted supplier
   */
  async restoreSupplier(id: number): Promise<Supplier> {
    if (id <= 0) {
      throw new Error("Invalid supplier ID");
    }
    return await this.supplierRepository.restoreSupplier(id);
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

  async searchSuppliersByContactPerson(
    contactPerson: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    if (!contactPerson || contactPerson.trim().length === 0) {
      throw new Error("Contact person is required for search");
    }

    try {
      return await this.supplierRepository.searchSuppliersByContactPerson(
        contactPerson,
        take,
        skip,
        sortBy,
        sortOrder
      );
    } catch (error) {
      console.error("Supplier contact person search failed:", error);
      throw new Error("Failed to search suppliers by contact person");
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
