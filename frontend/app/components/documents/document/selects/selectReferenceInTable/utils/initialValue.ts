import { ReferenceModel } from '@/app/interfaces/reference.interface';

export const getInitialValue = (
  data: ReferenceModel[],
  currentItemId: number | undefined
): string => {
  if (!data || data.length === 0 || !currentItemId) return 'Не выбрано';

  const foundItem = data.find((elem: ReferenceModel) => elem?.id === currentItemId);
  return foundItem?.name || 'Не выбрано';
}; 