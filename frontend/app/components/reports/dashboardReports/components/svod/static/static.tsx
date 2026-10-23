'use client'
import { StaticProps } from './static.props';
import styles from './static.module.css';
import { useEffect } from 'react';
import { numberValue } from '@/app/service/common/converters';

export const Static = ({className, data, ...props }: StaticProps) :JSX.Element => {
    
    useEffect(()=> {

    }, [data])
    
    const values = data?.values ?? [];

    return (
       <div>
            <div className={styles.title}>Данные по движению денег</div>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        <td>№</td>
                        <td>Курсаткич номи</td>
                        <td>...</td>
                        <td>Сумма</td>
                    </tr>
                </thead>
                <tbody>
                    
                    <tr>
                        <td className={styles.value}>1</td>
                        <td className={styles.caption}>Приход от клиентов</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.incomeFromClients)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>2</td>
                        <td className={styles.caption}>Приход от внутренних предприятий</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.incomeFromDepartments)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>3</td>
                        <td className={styles.caption}>Возврат от поставщиков</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.incomeFromSuppliers)}</td>
                    </tr>
                    <tr>
                        <td className={styles.valueBold}>4</td>
                        <td className={styles.captionBold}>Итого приход</td>
                        <td className={styles.valueBold}></td>
                        <td className={styles.valueBold}>{numberValue(values?.totalIncome)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>5</td>
                        <td className={styles.caption}>Выдано на расходы</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.leaveCashForCharges)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>6</td>
                        <td className={styles.caption}>Выдано на зарплату</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.leaveCashForZp)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>7</td>
                        <td className={styles.caption}>Клиентыга кайтарилган</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.leaveCashForClients)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>8</td>
                        <td className={styles.caption}>Выдано внутренним предприятиям</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.leaveCashForDepartments)}</td>
                    </tr>
                    <tr>
                        <td className={styles.value}>9</td>
                        <td className={styles.caption}>Выдано поставщикам</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.leaveCashForSuppliers)}</td>
                    </tr>

                    <tr>
                        <td className={styles.value}>10</td>
                        <td className={styles.caption}>Выдано учредителям</td>
                        <td className={styles.value}></td>
                        <td className={styles.value}>{numberValue(values?.leaveCashForFounder)}</td>
                    </tr>
                    <tr>
                        <td className={styles.valueBold}>11</td>
                        <td className={styles.captionBold}>Итого расходов</td>
                        <td className={styles.valueBold}></td>
                        <td className={styles.valueBold}>{numberValue(values?.totalLeaveCash)}</td>
                    </tr>
                    
                </tbody>
            </table>
       </div>
    )
} 

