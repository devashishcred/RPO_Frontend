import { CompanyLicenseType } from "./contact"
import { ContactLicenseType } from "./contactLicense"

export interface CompanyType {
    id: number,
    description: string
}

export interface CompanyLicense {
    id: number,
    idCompanyLicenseType: number,
    companyLicenseType: CompanyLicenseType,
    number: string,
    expirationLicenseDate: string
}