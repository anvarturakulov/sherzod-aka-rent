import { JournalMeta } from '@/app/service/documents/getJournalMeta';
import { formatDisplayDate, formatDisplayDateTime } from '@/app/utils/formatDisplayDate';

export const getTitleText = (contentType: string | undefined): string => {
    switch(contentType) {
        case 'document': return 'Документы'
        case 'reference': return 'Справочники'
        case 'servis': return 'Программа'
        default: return 'Отчёты'
    }
}

export const getButtonText = (contentType: string | undefined): string => {
    switch(contentType) {
        case 'document': return 'Новый документ'
        case 'reference': return 'Новое наименование'
        case 'servis': return 'Новая настройка'
        default: return 'Новый элемент'
    }
}

export const getFirstText = (contentType: string | undefined, isNewDocument: boolean, isNewReference: boolean, isNewSetting?: boolean): string => {
    if (contentType === 'document') {
        return isNewDocument ? 'создать новый документ' : 'просмотр документа'
    } else if (contentType === 'servis') {
        return isNewSetting ? 'создать новую настройку' : 'просмотр настройки'
    } else {
        return isNewReference ? 'создать новое наименование' : 'просмотр наименования'
    }
}

export const getSecondText = (contentType: string | undefined): string => {
    switch(contentType) {
        case 'document': return 'список документов'
        case 'reference': return 'список наименований'
        case 'servis': return 'список настроек'
        default: return 'отчёт'
    }
}

const formatJournalDate = (value: number | string | null | undefined): string => {
    if (value == null) return '—';
    const num = typeof value === 'number' ? value : Number(new Date(value).getTime());
    return formatDisplayDate(num) || '—';
};

const formatJournalDateTime = (value: number | string | null | undefined): string => {
    if (value == null) return '—';
    const num = typeof value === 'number' ? value : Number(new Date(value).getTime());
    return formatDisplayDateTime(num) || '—';
};

export const JOURNAL_META_PLACEHOLDER = 'Дата последнего документа';

export const getJournalMetaText = (journalMeta?: JournalMeta | null): string => {
    if (!journalMeta) return '';
    if (journalMeta.lastDocumentDate == null && journalMeta.lastModifiedAt == null) {
        return 'Документов нет';
    }
    return [
        `Дата последнего документа: ${formatJournalDate(journalMeta.lastDocumentDate)}`,
        `Последнее изменение: ${formatJournalDateTime(journalMeta.lastModifiedAt)}`,
    ].join(' · ');
};

export const getDateRangeText = (dateStart: number | undefined, dateEnd: number | undefined): string => {
    if (!dateStart || !dateEnd) return ''
    
    const formatDate = (date: number) => formatDisplayDate(date)
    
    const dateStartInStr = formatDate(dateStart)
    const dateEndInStr = formatDate(dateEnd)
    return `период: с ${dateStartInStr} по ${dateEndInStr}`
} 