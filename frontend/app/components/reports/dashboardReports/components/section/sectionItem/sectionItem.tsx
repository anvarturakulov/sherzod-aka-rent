'use client'
import { SectionItemProps } from './sectionItem.props';
import styles from './sectionItem.module.css';
import cn from 'classnames';
import { Htag } from '@/app/components';
import { numberValue } from '@/app/service/common/converters';

export const SectionItem = ({className, item, sectionType, ...props }: SectionItemProps) :JSX.Element => {
    const counts = (item && item.counts && item?.counts.length) ? [...item.counts] : []
    return (
       <>
          <div className={styles.item}>
            <Htag tag='h1'>{item?.section}</Htag>
            {
                ( sectionType != 'buxgalter' && sectionType != 'founder')
                && counts && counts.length &&
                counts
                .map((element: any, key: number) => {
                        return (
                            <div key = {key} className={cn(styles.box, {
                                [styles.greyRow]: (key+3) % 2 !== 0
                            })}>
                                <Htag tag='h2' className={styles.h2}>{element?.name}</Htag>
                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Остаток на начало дня</div>
                                    <div>{numberValue(element?.startBalansCountNon)}</div>
                                </div>

                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Приход производства</div>
                                    <div>{numberValue(element?.prodCountNon)}</div>
                                </div>
                                
                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Приход внутр. перемещения</div>
                                    <div>{numberValue(element?.moveIncomeCountNon)}</div>
                                </div>
                                
                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Проданный хлеб</div>
                                    <div>
                                        {numberValue(element?.saleCountNon)}
                                        <span>
                                            &nbsp;({numberValue(item?.maydaSavdoCount)})
                                        </span> 
                                    </div>
                                </div>
                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Хлеб выданный на заказ</div>
                                    <div>
                                        {numberValue(element?.saleCountOrder)}
                                         
                                    </div>
                                </div>
                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Брак (списан) хлеб</div>
                                    <div>{numberValue(element?.brakCountNon)}</div>
                                </div>
                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Расход внутр. перемещения</div>
                                    <div>{numberValue(element?.moveOutNon)}</div>
                                </div>

                                <div className={cn(styles.row, styles.rowCount)}>
                                    <div className={styles.title}>Остаток хлеба на руках</div>
                                    <div>{numberValue(element?.endBalansCountNon)}</div>
                                </div>
                            </div>
                        ) 
                            
                    })
                
            }
            <div className={styles.sumBox}>
                <Htag tag='h2' className={cn(styles.h2, styles.bottomTitle)}>По деньгам</Htag>
                <div className={styles.row}>
                    <div className={styles.title}>Начальный остаток</div>
                    <div className={styles.value}>{numberValue(item?.startBalansSumma)}</div>
                </div>
                
                <div className={styles.row}>
                    <div className={styles.title}>Денежный приход (от клиентов)</div>
                    <div className={styles.value}>{numberValue(item?.incomeFromClients)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.title}>Денежный приход (от внутр. предприятий)</div>
                    <div className={styles.value}>{numberValue(item?.incomeFromDepartments)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.title}>Приход денег от перемещения</div>
                    <div className={styles.value}>{numberValue(item?.moveIncome)}</div>
                </div>

                <div className={styles.row}>
                    <div className={cn(styles.title, styles.totalTitle, styles.blueText)}>ИТОГО ПРИХОД</div>
                    <div className={cn(styles.value, styles.totalValue, styles.blueText)}>{numberValue(item?.allIncome)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.title}>Выдано на расходы</div>
                    <div className={styles.value}>{numberValue(item?.outForCharges)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.title}>Выдано поставщикам</div>
                    <div className={styles.value}>{numberValue(item?.outForSuppliers)}</div>
                </div>
                
                <div className={styles.row}>
                    <div className={styles.title}>Выдано внутренним предприятиям</div>
                    <div className={styles.value}>{numberValue(item?.outForDepartments)}</div>
                </div>
                
                <div className={styles.row}>
                    <div className={styles.title}>Расход денег на перемещение</div>
                    <div className={styles.value}>{numberValue(item?.moveOut)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.title}>Выдано учредителю</div>
                    <div className={styles.value}>{numberValue(item?.outForFounder)}</div>
                </div>
                

                <div className={styles.row}>
                    <div className={cn(styles.title, styles.totalTitle, styles.redText)}>ИТОГО РАСХОД</div>
                    <div className={cn(styles.value, styles.totalValue, styles.redText)}>{numberValue(item?.allOut)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.title}>Конечный остаток</div> 
                    <div className={styles.value}>{numberValue(item?.endBalansSumma)}</div>
                </div>
            </div>
            
          </div>
      </>
    )
} 