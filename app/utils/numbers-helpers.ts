export const formatNumberWithCommas = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value).trim();
    if (stringValue === '') {
        return '';
    }

    const cleanValue = stringValue.replace(/[$,\s]/g, '');

    if (isNaN(Number(cleanValue))) {
        return stringValue; // Return original if not a number
    }

    return Number(cleanValue).toLocaleString();
};