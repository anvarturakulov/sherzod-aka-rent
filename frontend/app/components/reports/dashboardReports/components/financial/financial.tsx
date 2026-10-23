'use client';
import { FinancialProps } from './financial.props';
import styles from './financial.module.css';
import { useEffect, useMemo } from 'react';
import { numberValue } from '@/app/service/common/converters';
import { useAppContext } from '@/app/context/app.context';
import { totalByKey } from '../../utils/calculations';
import { useEnterpriseName } from '../../hooks/useEnterpriseName';

const total = (key: string, data: any[]) => {
  const item = data.find((item: any) => item?.innerReportType === key); // Заменил filter на find
  return item ? item.total : 0;
};

export const Financial = ({ className, data, ...props }: FinancialProps): JSX.Element => {
  const { mainData, setMainData } = useAppContext();
  const { currentFinancialInnerReportType } = mainData.report;
  const enterpriseName = useEnterpriseName();

  // Предвычисляем данные с помощью useMemo
  const { financialData, totals, innerValues } = useMemo(() => {
    // console.time('Data Processing');
    const financialData = data?.find((item: any) => item?.reportType === 'FINANCIAL')?.values || [];

    const totals = {
      incomeFromClients: total('incomeFromClients', financialData),
      incomeFromDepartments: total('incomeFromDepartments', financialData) ,  // 
      incomeOther: total('incomeOther', financialData),
      outForCharges: total('outForCharges', financialData),
      outForZP: total('outForZP', financialData),
      outForSuppliers: total('outForSuppliers', financialData),
      outForDepartments: total('outForDepartments', financialData),
      outForFounders: total('outForFounders', financialData),
      startBalans: total('startBalans', financialData),
      endBalans: total('endBalans', financialData),
    };

    const incomeAll = totals.incomeFromClients + totals.incomeFromDepartments + totals.incomeOther;
    const outAll = totals.outForCharges + totals.outForZP + totals.outForSuppliers + totals.outForDepartments + totals.outForFounders;

    const innerReport = financialData.find((item: any) => item?.innerReportType === currentFinancialInnerReportType);
    const innerValues = innerReport?.innerValues || [];

    // console.timeEnd('Data Processing');
    return { financialData, totals: { ...totals, incomeAll, outAll }, innerValues };
  }, [data, currentFinancialInnerReportType]);

  return (
    <>
      <div className={styles.title}>
        Денежный поток — по всему предприятию
        {enterpriseName && <span> - {enterpriseName}</span>}
      </div>

      <div className={styles.box}>
        <div className={styles.main}>
          <table className={styles.table}>
            <thead>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'startBalans')}
              >
                <td>Остаток денег на начало периода</td>
                <td className={styles.totalTd}>{numberValue(totals.startBalans)}</td>
              </tr>
              <tr>
                <td>Приход денег</td>
                <td className={styles.totalTd}></td>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'incomeFromClients')}
              >
                <th>Деньги, поступившие на предприятие (от клиентов) </th>
                <th className={styles.totalTd}>{numberValue(totals.incomeFromClients)}</th>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'incomeFromDepartments')}
              >
                <th>Деньги, поступившие на предприятие (от внутренних предприятий)</th>
                <th className={styles.totalTd}>{numberValue(totals.incomeFromDepartments)}</th>
              </tr>
              {/* <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'incomeOther')}
              >
                <th>Деньги от внешних контрагентов</th>
                <th className={styles.totalTd}>{numberValue(totals.incomeOther)}</th>
              </tr> */}
              <tr>
                <td>Итого</td>
                <td className={styles.totalTd}>{numberValue(totals.incomeAll)}</td>
              </tr>
              <tr>
                <td>На что израсходованы деньги</td>
                <td className={styles.totalTd}></td>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'outForZP')}
              >
                <th>Выдана зарплата сотрудникам</th>
                <th className={styles.totalTd}>{numberValue(totals.outForZP)}</th>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'outForCharges')}
              >
                <th>Израсходовано для предприятия</th>
                <th className={styles.totalTd}>{numberValue(totals.outForCharges)}</th>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'outForSuppliers')}
              >
                <th>Выдано поставщикам</th>
                <th className={styles.totalTd}>{numberValue(totals.outForSuppliers)}</th>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'outForDepartments')}
              >
                <th>Выдано внутренним предприятиям</th>
                <th className={styles.totalTd}>{numberValue(totals.outForDepartments)}</th>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'outForFounders')}
              >
                <th>Выдано учредителю</th>
                <th className={styles.totalTd}>{numberValue(totals.outForFounders)}</th>
              </tr>
              <tr>
                <td>Итого</td>
                <td className={styles.totalTd}>{numberValue(totals.outAll)}</td>
              </tr>
              <tr>
                <td>Осталось от сегодняшних денег</td>
                <td className={styles.totalTd}>{numberValue((totals.incomeAll - totals.outAll)>0 ? (totals.incomeAll - totals.outAll): 0)}</td>
              </tr>
              <tr
                onDoubleClick={() => setMainData && setMainData('currentFinancialInnerReportType', 'endBalans')}
              >
                <td>Остаток денег на конец периода</td>
                <td className={styles.totalTd}>{numberValue(totals.endBalans)}</td>
              </tr>
            </thead>
          </table>
        </div>
        <div className={styles.inner}>
          <table className={styles.table}>
            <thead>
              <tr>
                <td className={styles.innerName}>Наименование</td>
                <td className={styles.innerValue}>Сумма</td>
              </tr>
              {innerValues.map((element: any, index: number) => (
                <tr key={index}>
                  <th className={styles.innerName}>{element?.name}</th>
                  <th className={styles.totalTd} >{numberValue(element?.value)}</th>
                </tr>
              ))}
              <tr>
                <td className={styles.innerName}>Итого</td>
                <td className={styles.totalTd}>{numberValue(total(currentFinancialInnerReportType, financialData))}</td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </>
  );
};