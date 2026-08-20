import { differenceInDays, isValid } from 'date-fns';

export const isMedicalCertificateValid = (issueDateStr: string, maxDaysOld: number = 30): { valid: boolean; reason?: string; daysOld?: number } => {
  if (!issueDateStr || !isValid(new Date(issueDateStr))) {
    return { valid: false, reason: 'Valid issue date is required' };
  }

  const certDate = new Date(issueDateStr);
  const now = new Date();
  
  const daysOld = differenceInDays(now, certDate);
  if (daysOld > maxDaysOld) {
    return { valid: false, reason: `Medical Certificate Expired. Certificate is ${daysOld} days old (Maximum allowed: ${maxDaysOld} days).`, daysOld };
  }

  return { valid: true, daysOld };
};
