import { ReferenceModel } from '@/app/interfaces/reference.interface';
import { validateUzPassportFields } from '@/app/components/reference/helpers/uzPassport.validation';
import { validateUzJshshirFields } from '@/app/components/reference/helpers/uzJshshir.validation';
import { rentalContractsApi } from '@/app/service/rentalContracts/rentalContracts.service';

export async function validateIndividualClientForTools(
  partner: ReferenceModel | null | undefined,
  token: string | undefined,
  asOf: number,
  checkContract = false,
): Promise<string[]> {
  const rv = partner?.refValues;
  if (!rv || rv.isLegalEntity) return [];

  const errors: string[] = [];
  const individualLike = { ...rv, isIndividualPerson: true };

  if (validateUzPassportFields(individualLike) !== null) {
    errors.push('Паспортные данные заполнены неполностью');
  }

  if (validateUzJshshirFields(individualLike) !== null) {
    errors.push('ПИНФЛ не указан');
  }

  if (!(rv.address ?? '').trim()) {
    errors.push('Адрес не указан');
  }

  const hasPhone =
    Boolean((rv.phone ?? '').trim()) || Boolean((rv.phone2 ?? '').trim());
  if (!hasPhone) {
    errors.push('Номер телефона не указан');
  }

  if (checkContract) {
    const clientId = Number(partner?.id) || 0;
    if (token && clientId > 0) {
      try {
        const activeContract = await rentalContractsApi.getActiveByClient(
          token,
          clientId,
          asOf,
        );
        if (!activeContract) {
          errors.push('Договор с клиентом не найден');
        }
      } catch {
        errors.push('Договор с клиентом не найден');
      }
    } else {
      errors.push('Договор с клиентом не найден');
    }
  }

  return errors;
}
