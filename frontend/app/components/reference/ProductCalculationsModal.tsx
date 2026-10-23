'use client'
import React, { useState, useEffect } from 'react';
import { Product } from '@/app/interfaces/product.interface';
import { ReferenceModel } from '@/app/interfaces/reference.interface';
import { ProductCalculation } from '@/app/interfaces/productCalculation.interface';
import { useAppContext } from '@/app/context/app.context';
import { ReferencesService } from '@/app/service/references/references.service';
import { ProductCalculationsService } from '@/app/service/productCalculations/productCalculations.service';
import styles from './ProductCalculationsModal.module.css';


interface ProductCalculationsModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (calculations: ProductCalculation[]) => void;
}

export const ProductCalculationsModal: React.FC<ProductCalculationsModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave
}) => {
  const { mainData } = useAppContext();
  const [calculations, setCalculations] = useState<ProductCalculation[]>([]);
  const [originalCalculations, setOriginalCalculations] = useState<ProductCalculation[]>([]);
  const [materials, setMaterials] = useState<ReferenceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Загружаем материалы при открытии модального окна
  useEffect(() => {
    if (isOpen && product) {
      loadMaterials();
      loadCalculations();
    }
  }, [isOpen, product]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      console.log('Loading materials...', { token: mainData.users.user?.token ? 'present' : 'missing' });
      
      const allTMZ = await ReferencesService.getReferencesByType('TMZ', mainData.users.user?.token || '');
      console.log('All TMZ loaded:', allTMZ);
      
      // Фильтруем только материалы (typeTMZ === 'MATERIAL')
      const materials = allTMZ.filter(item => 
        item.refValues?.typeTMZ === 'MATERIAL' && 
        !item.isFolder &&
        !item.refValues?.markToDeleted
      );
      
      console.log('Materials filtered:', materials);
      setMaterials(materials || []);
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
      setMaterials([]);
      
      // Показываем пользователю более понятное сообщение об ошибке
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        alert('Ошибка загрузки с сервера. Проверьте подключение к интернету.');
      } else {
        alert(`Ошибка загрузки материалов: ${error instanceof Error ? error.message : 'Проверьте данные.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCalculations = async () => {
    if (!product) return;
    
    try {
      const calculations = await ProductCalculationsService.getCalculationsByProduct(product.id, mainData.users.user?.token || '');
      setCalculations(calculations || []);
      setOriginalCalculations(calculations || []); // Сохраняем оригинальный список для сравнения
    } catch (error) {
      console.error('Ошибка загрузки калькуляции продукции:', error);
      setCalculations([]);
      setOriginalCalculations([]);
      
      // Показываем пользователю более понятное сообщение об ошибке
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        console.warn('Ошибка загрузки с сервера');
      }
    }
  };

  const addCalculation = () => {
    const newCalculation: ProductCalculation = {
      productId: product?.id || 0,
      materialId: 0,
      quantityPerUnit: 0
    };
    setCalculations([...calculations, newCalculation]);
  };

  const updateCalculation = (index: number, field: keyof ProductCalculation, value: any) => {
    const updated = [...calculations];
    updated[index] = { ...updated[index], [field]: value };
    setCalculations(updated);
  };

  const removeCalculation = (index: number) => {
    const updated = calculations.filter((_, i) => i !== index);
    setCalculations(updated);
  };

  const handleSave = async () => {
    if (!product || !calculations) return;

    // Получаем enterpriseId из пользователя
    const enterpriseId = mainData.users.user?.enterpriseId;
    if (!enterpriseId) {
      alert('Ошибка: не удалось определить организацию пользователя. Войдите в систему снова.');
      return;
    }

    // Валидация данных перед отправкой
    const validCalculations = calculations.filter(calc => 
      calc.materialId && calc.materialId > 0 && 
      calc.quantityPerUnit && calc.quantityPerUnit > 0
    );

    if (validCalculations.length === 0) {
      alert('Есть незаполненные данные. Проверьте введённые значения.');
      return;
    }

    try {
      setSaving(true);
      
      // Находим калькуляции, которые были удалены
      const deletedCalculations = originalCalculations.filter(original => 
        original.id && !calculations.some(current => current.id === original.id)
      );
      
      // Удаляем калькуляции, которые были удалены из списка
      for (const deletedCalculation of deletedCalculations) {
        if (deletedCalculation.id) {
          await ProductCalculationsService.deleteCalculation(
            deletedCalculation.id,
            mainData.users.user?.token || ''
          );
        }
      }
      
      // Сохраняем каждую валидную калькуляцию
      for (const calculation of validCalculations) {
        if (calculation.id) {
          // Обновляем существующую калькуляцию
          await ProductCalculationsService.updateCalculation(
            calculation.id,
            {
              productId: calculation.productId,
              materialId: calculation.materialId,
              quantityPerUnit: calculation.quantityPerUnit
            },
            mainData.users.user?.token || ''
          );
        } else {
          // Яратиб олиш
          await ProductCalculationsService.createCalculation(
            {
              productId: calculation.productId,
              materialId: calculation.materialId,
              enterpriseId: enterpriseId,
              quantityPerUnit: calculation.quantityPerUnit
            },
            mainData.users.user?.token || ''
          );
        }
      }

      onSave(calculations);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      
      // Показываем более детальную информацию об ошибке
      let errorMessage = 'Ошибка сохранения';
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP error! status: 400')) {
          errorMessage = 'Некорректные данные. Проверьте введённые значения.';
        } else if (error.message.includes('HTTP error! status: 404')) {
          errorMessage = 'Продукция или материал не найдены. Обновите страницу и попробуйте снова.';
        } else if (error.message.includes('HTTP error! status: 409')) {
          errorMessage = 'Калькуляция продукции отсутствует.';
        } else if (error.message.includes('fetch failed')) {
          errorMessage = 'Ошибка связи с сервером. Проверьте подключение к интернету.';
        } else {
          errorMessage = `Ошибка сохранения: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Калькуляция продукции: {product.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.actions}>
            <button 
              className={styles.addButton}
              onClick={addCalculation}
              disabled={loading || !materials || materials.length === 0}
              title={`Загрузка: ${loading}, Материалы: ${materials?.length || 0}`}
            >
              {loading ? 'Загрузка...' : '+ Добавить материал'}
            </button>
          </div>

          <div className={styles.calculationsList}>
            {calculations && calculations.length > 0 && calculations.map((calculation, index) => (
              <div key={index} className={styles.calculationItem}>
                <div className={styles.field}>
                  <label>Материал:</label>
                  <select
                    value={calculation.materialId}
                    onChange={(e) => updateCalculation(index, 'materialId', Number(e.target.value))}
                  >
                    <option value={0}>Выберите материал</option>
                    {materials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Норма расхода:</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={calculation.quantityPerUnit}
                    onChange={(e) => updateCalculation(index, 'quantityPerUnit', Number(e.target.value))}
                    placeholder="0.000"
                  />
                </div>

                <button 
                  className={styles.removeButton}
                  onClick={() => removeCalculation(index)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          {(!calculations || calculations.length === 0) && (
            <div className={styles.emptyState}>
              <p>
                {loading ? 'Загрузка данных...' : 
                 (!materials || materials.length === 0) ? 'Материалы не найдены. Проверьте, что в справочнике есть материалы (тип ТМЦ MATERIAL).' :
                 'Калькуляция продукции отсутствует. Нажмите «Добавить материал», чтобы добавить позицию.'}
              </p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={saving}
          >
            Отмена
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || !calculations || calculations.length === 0}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};
