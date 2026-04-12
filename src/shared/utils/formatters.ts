import { APP_CONFIG } from '../../constants/config';

/**
 * Format a number as currency.
 * @param amount  The numeric amount.
 * @param currency  Optional override symbol. Defaults to APP_CONFIG.currencySymbol.
 */
export const formatCurrency = (amount: number, currency?: string): string => {
    const symbol = currency ?? APP_CONFIG.currencySymbol;
    return `${symbol} ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const isLowStock = (quantity: number, threshold: number): boolean => {
    return quantity <= threshold;
};

export const generateSKU = (productName: string): string => {
    const prefix = productName.slice(0, 3).toUpperCase();
    const suffix = Date.now().toString().slice(-5);
    return `${prefix}-${suffix}`;
};
