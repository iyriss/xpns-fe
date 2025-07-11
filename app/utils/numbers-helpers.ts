// Utility function to format numbers with commas
export const formatNumberWithCommas = (value: any): string => {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const stringValue = String(value).trim();

    // Remove any existing commas and currency symbols
    const cleanValue = stringValue.replace(/[$,\s]/g, '');

    // Check if it's a valid number
    if (isNaN(Number(cleanValue))) {
        return stringValue; // Return original if not a number
    }

    // Format with commas
    return Number(cleanValue).toLocaleString();
};