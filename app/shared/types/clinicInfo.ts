export interface ClinicInfo {
  name: string
  subtitle: string
  doctorName: string
  qualifications: string
  title: string
  memberships: string
  address: string
  email: string
  phone: string
  validity: string
  logo?: string  // base64 data URL
}

export const DEFAULT_CLINIC_INFO: ClinicInfo = {
  name: 'GASTRO AND LIVER CARE CENTER',
  subtitle: 'A Super-specialty digestive wellness clinic',
  doctorName: 'Dr. Mir Intikhab Maqbool',
  qualifications: 'MBBS, MD, DNB (Gastroenterology & Hepatology)',
  title: 'Consultant Gastroenterology and Hepatology',
  memberships: 'Life member: ISG, SGEI',
  address: 'NH-44, NEW COLONY, COURT ROAD PULWAMA',
  email: 'mirintikhab7@gmail.com',
  phone: '7006888514',
  validity: 'Valid for two visits within 15 days',
}
