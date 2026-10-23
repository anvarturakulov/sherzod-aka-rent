'use client'
import { CostProps } from './cost.props';
import { CostItem } from './costItem/costItem';
import styles from './cost.module.css';
import { useEffect } from 'react';
import { numberValue } from '@/app/service/common/converters';

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

export const Cost = ({className, data, ...props }: CostProps) :JSX.Element => {
    
    useEffect(()=> {

    }, [data])
    
    const costValues = data?.costValues ?? [];
    // const 
    const totalCount = totalByKey('productionCount', costValues)
    const totalHamirCount = totalByKey('comeProductDocsByProduct', costValues)
    const totalSale = totalByKey('saleWithMove', costValues)
    const totalEarning = totalByKey('earning', costValues)

    return (
       <>
            <div className={styles.title}>Данные по себестоимости</div>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <td>№</td>
                        <td>Наименование цеха</td>
                        <td>Кол-во произведено</td>
                        <td>Кол-во теста</td>
                        <td>Итого продаж</td>
                        <td>Итого расходов</td>
                        <td>Итого прибыль</td>
                        <td>Себестоимость</td>
                    </tr>
                </thead>
                <tbody>
                    {   
                        costValues && costValues.length ? (
                            costValues.map((element: any, key: number) => {
                                return <CostItem key={key} item={element} index={key} />
                            })
                        ) : null
                    }
                    <tr>
                        <td className={styles.totalTd}></td>
                        <td className={styles.totalTd}>Итого</td>
                        <td className={styles.totalTd}>{numberValue(totalCount)}</td>
                        <td className={styles.totalTd}>{numberValue(totalHamirCount)}</td>
                        <td className={styles.totalTd}>{numberValue(totalSale)}</td>
                        <td className={styles.totalTd}>{numberValue(totalSale - totalEarning)}</td>
                        <td className={styles.totalTd}>{numberValue(totalEarning)}</td>
                        <td className={styles.totalTd}></td>
                    </tr>
                </tbody>
                
            </table>
            
       </>
    )
} 

