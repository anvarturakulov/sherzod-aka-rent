'use client'
import { FoydaProps } from './foyda.props';
import { FoydaItem } from './foydaItem/foydaItem';
import styles from './foyda.module.css';
import { useEffect, useState } from 'react';
import { numberValue } from '@/app/service/common/converters';
import { useEnterpriseName } from '../../hooks/useEnterpriseName';

const totalByKey = (key:string, data:any[]) => {
    let total = 0;
    data && data.length &&
    data.forEach((item:any) => {
        let totalInner = 0
        if (item.subItems && item.subItems.length) {
            item.subItems.forEach((elem: any) => {
                totalInner += elem[key]
            })
        }
        total += totalInner
    })
    return total
  }

export const Foyda = ({className, data, ...props }: FoydaProps) :JSX.Element => {
    const enterpriseName = useEnterpriseName();

    useEffect(()=> {
    }, [data])
    
    let datas = data ? data.filter((item: any) => item?.reportType == 'FOYDA')[0]?.values : []

    return (
       <>
      <div className={styles.title}>
        ФOЙДА ХИСОБИ
        {enterpriseName && <span> - {enterpriseName}</span>}
      </div>
      <div className={styles.tableContainer}> {/* Новый контейнер */}
        <table className={styles.table}>
          <thead>
            <tr>
              <td className={styles.section}>Цех</td>
              <td>Кол-во произведённого хлеба</td>
              <td>Кол-во теста</td>
              <td>Кол-во хлеба, прод. в цехе</td>
              <td>Кол-во хлеба на доставку</td>
              <td>Общая сумма продаж</td>
              <td>Расход муки</td>
              <td>Расх. сырья</td>
              <td>Расх. зарплаты</td>
              <td>Комм. и проч. расх.</td>
              <td>Денежн. расх.</td>
              <td>Общ. − расход муки</td>
              <td>Общ. − расход сырья</td>
              <td>Общ. − зарплата</td>
              <td>Общ. − комм. и проч. расх.</td>
              <td>Общ. − денежные расходы</td>
              <td>Чистая прибыль</td>
              <td>Норма сырья</td>
              <td>Прибыль на 1 хлеб</td>
            </tr>
          </thead>
          {/* <tbody> */}
            {datas &&
              datas.length &&
              datas.map((element: any, key: number) => {
                return <FoydaItem key={key} item={element} />;
              })}
          {/* </tbody> */}
          <thead className={styles.thead}>
            <tr className={styles.tr}>
              <td className={styles.section}>Итого</td>
              <td className={styles.column}>{numberValue(totalByKey('productionCount', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('comeProductDocsByProduct', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('saleCountWithOutMove', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('countDeleviry', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('saleWithMove', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('zagatovka', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('material', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('zp', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('service', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('payment', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('addingZagatovka', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('addingMaterial', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('addingZp', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('addingService', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('addingPayment', datas))}</td>
              <td className={styles.column}>{numberValue(totalByKey('earning', datas))}</td>
              <td className={styles.column}></td>
              <td className={styles.column}></td>
            </tr>
          </thead>
        </table>
      </div>
    </>
    )
} 

