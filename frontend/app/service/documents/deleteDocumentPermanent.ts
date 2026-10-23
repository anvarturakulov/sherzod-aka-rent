import axios from 'axios';
import { showMessage } from '../common/showMessage';

export const deleteDocumentPermanent = async (
  id: number | undefined,
  token: string | undefined,
  setMainData: Function | undefined,
) => {
  if (!id) return;

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const uri = process.env.NEXT_PUBLIC_DOMAIN + '/api/documents/permanent/' + id;

  try {
    await axios.delete(uri, config);
    if (setMainData) {
      showMessage('Документ полностью удалён из базы', 'success', setMainData);
      setMainData('updateDataForDocumentJournal', true);
    }
  } catch (error: any) {
    if (setMainData) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Ошибка при полном удалении документа';
      showMessage(String(message), 'error', setMainData);
    }
  }
};
