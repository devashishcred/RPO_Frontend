export interface ContactLicenseType {
  id: number,
  name: string
}
export interface ContactLicense {
  id: number,
  idContactLicenseType: number,
  contactLicenseType: ContactLicenseType,
  number: string,
  expirationLicenseDate: string
}