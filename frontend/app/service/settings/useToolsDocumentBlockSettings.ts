'use client';

import useSWR from 'swr';
import { useAppContext } from '@/app/context/app.context';
import { getSettingByKeyFromDB } from './getSettingByKeyFromDB';

export const SHOW_CLIENT_GOODS_SALE_KEY = 'showClientGoodsSale';
export const SHOW_EXTRA_CHARGE_KEY = 'showExtraCharge';
export const SHOW_FORMWORK_PLANNER_KEY = 'showFormworkPlanner';

/** Нет записи или любое значение кроме false — блок виден. */
const isBlockVisible = (value: unknown): boolean => value !== false;

/** Кнопка «Опалубка» видна только при явном true. */
const isFormworkEnabled = (value: unknown): boolean => value === true;

export const useToolsDocumentBlockSettings = (enabled = true) => {
  const { mainData } = useAppContext();
  const token = mainData.users?.user?.token;

  const { data } = useSWR(
    enabled && token ? ['tools-document-block-settings', token] : null,
    async () => {
      const [sale, extra, formwork] = await Promise.all([
        getSettingByKeyFromDB(SHOW_CLIENT_GOODS_SALE_KEY, token),
        getSettingByKeyFromDB(SHOW_EXTRA_CHARGE_KEY, token),
        getSettingByKeyFromDB(SHOW_FORMWORK_PLANNER_KEY, token),
      ]);
      return {
        showClientGoodsSale: isBlockVisible(sale),
        showExtraCharge: isBlockVisible(extra),
        showFormworkPlanner: isFormworkEnabled(formwork),
      };
    },
  );

  return {
    showClientGoodsSale: data?.showClientGoodsSale ?? true,
    showExtraCharge: data?.showExtraCharge ?? true,
    showFormworkPlanner: data?.showFormworkPlanner ?? false,
  };
};
