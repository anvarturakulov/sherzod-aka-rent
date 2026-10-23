import axios from 'axios';

export const setDocumentPaidInFull = async (
  id: number,
  paidInFull: boolean,
  token: string,
): Promise<{ id: number; paidInFull: boolean }> => {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_DOMAIN}/api/documents/${id}/paid-in-full`,
    { paidInFull },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const paidInFullSaveError = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;
  if (Array.isArray(message)) {
    return message.map(String).join(', ');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  return 'Не удалось сохранить отметку «Оплачен полностью»';
};
