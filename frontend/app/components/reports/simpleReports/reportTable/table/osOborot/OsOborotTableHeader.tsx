import styles from './osOborot.module.css';

export const OsOborotTableHeader = (): JSX.Element => (
  <thead>
    <tr>
      <td className={styles.stickyCol} rowSpan={2}>
        №
      </td>
      <td className={styles.stickyCol} rowSpan={2}>
        Наименование
      </td>
      <td className={styles.stickyCol} rowSpan={2}>
        Артикул
      </td>
      <td className={styles.groupHead} colSpan={3}>
        Начальный остаток
      </td>
      <td className={styles.groupHead} colSpan={2}>
        Приход
      </td>
      <td className={styles.groupHead} colSpan={2}>
        Расход
      </td>
      <td className={styles.groupHead} colSpan={3}>
        Конечный остаток
      </td>
    </tr>
    <tr>
      <td className={styles.subHead}>Балансовая стоимость</td>
      <td className={styles.subHead}>Амортизация</td>
      <td className={styles.subHead}>Остаточная стоимость</td>
      <td className={styles.subHead}>Основное средство</td>
      <td className={styles.subHead}>Амортизация</td>
      <td className={styles.subHead}>Основное средство</td>
      <td className={styles.subHead}>Амортизация</td>
      <td className={styles.subHead}>Балансовая стоимость</td>
      <td className={styles.subHead}>Амортизация</td>
      <td className={styles.subHead}>Остаточная стоимость</td>
    </tr>
  </thead>
);
