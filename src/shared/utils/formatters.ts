import { APP_CONFIG } from '../../constants/config';

/**
 * Format a number as currency.
 * @param amount  The numeric amount.
 * @param currency  Optional override symbol. Defaults to APP_CONFIG.currencySymbol.
 */
export const formatCurrency = (amount: number, currency?: string): string => {
    const symbol = currency ?? APP_CONFIG.currencySymbol;
    return `${symbol}${amount.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const isLowStock = (quantity: number, threshold: number): boolean => {
    return quantity <= threshold;
};

export const generateSKU = (productName: string): string => {
    const prefix = productName.slice(0, 3).toUpperCase();
    const suffix = Date.now().toString().slice(-5);
    return `${prefix}-${suffix}`;
};
