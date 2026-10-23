import { getNgrokBypassHeaders, withApiDomain } from '@/app/service/common/getApiDomain';

export type ToolComponentLine = {
  id?: number;
  componentReferenceId: number;
  qty: number;
};

const headers = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  ...getNgrokBypassHeaders(),
});

export const toolComponentsApi = {
  async list(token: string, referenceId: number): Promise<ToolComponentLine[]> {
    const response = await fetch(withApiDomain(`/api/tool-components/${referenceId}`), {
      headers: headers(token),
    });
    if (!response.ok) {
      throw new Error('Не удалось загрузить состав колонны');
    }
    return response.json();
  },

  async replace(
    token: string,
    referenceId: number,
    items: ToolComponentLine[],
  ): Promise<ToolComponentLine[]> {
    const response = await fetch(withApiDomain(`/api/tool-components/${referenceId}`), {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        items: items.map((item) => ({
          componentReferenceId: Number(item.componentReferenceId),
          qty: Number(item.qty),
        })),
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || 'Не удалось сохранить состав колонны');
    }
    return response.json();
  },
};
