import { formatDateWithTimezone, formatDateFr, isToday } from '~/utils/dateUtils';

export const useDate = () => {
    const formatDate = (date: Date | string, timezone?: string) => {
        if (!date) return '-';
        return formatDateWithTimezone(date, timezone);
    };

    const formatDateLong = (date: Date | string) => {
        if (!date) return '-';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDateFr(dateObj);
    };

    return {
        formatDate,
        formatDateLong,
        isToday
    };
};
