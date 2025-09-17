
/**
 * Format currency values to INR
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format currency values to INR with zero decimal places
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatPriceINR = (price: number): string => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0 
  }).format(price);
};

/**
 * Format a date string into a human-readable format
 * @param dateString Date string to format
 * @param includeTime Whether to include time in the formatted date
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime: boolean = false): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Capitalize the first letter of each word in a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Format an order status by replacing underscores with spaces and capitalizing
 * @param status Order status string
 * @returns Formatted status string
 */
export const formatOrderStatus = (status: string): string => {
  if (!status) return "Unknown";
  return status.replace(/_/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if an array or string is empty
 * @param value Array or string to check
 * @returns True if empty, false otherwise
 */
export const isEmpty = (value: any[] | string | null | undefined): boolean => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};
