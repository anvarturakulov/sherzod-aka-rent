'use client'
import { MaterialProps } from './material.props';
import styles from './material.module.css';
import { MaterialItem } from './materialItem/materialItem';
import { useEffect } from 'react';
import { numberValue } from '@/app/service/common/converters';
import { totalByKey } from '../../utils/calculations';
import { useEnterpriseName } from '../../hooks/useEnterpriseName';

export const Material = ({className, data, ...props }: MaterialProps) :JSX.Element => {
    const enterpriseName = useEnterpriseName();
    let title = 'ОБЩЕЕ СПИСАНИЕ СЫРЬЯ' 
    
    useEffect(()=> {
    }, [data])
    
    let datas = data ? data.filter((item: any) => item?.reportType == 'MATERIAL')[0]?.values : []

    return (
       <>
            <div className={styles.title}>
            {'СПИСАНИЕ СЫРЬЯ ПО ВСЕМУ ПРЕДПРИЯТИЮ'}
            {enterpriseName && <span> - {enterpriseName}</span>}
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <td>Продукция</td>
                        <td>Кол-во</td>
                        <td>Сумма</td>
                    </tr>
                </thead>
                
                {
                    datas && datas.length &&
                    datas
                    .map((element: any, key: number) => {
                        return <MaterialItem 
                            key={key}
                            item={element}
                        />
                    })
                }   
            
                <thead>
                    <tr>
                        <td>Итого</td>
                        <td></td>
                        <td className={styles.totalTd}>{numberValue(totalByKey('summa', datas))}</td>
                    </tr>
                </thead>
                
            </table>            
       </>
    )
} 