import {
    MAX_AMOUNT,
    MAX_YEAR_DIFF,
    MAX_DESCRIPTION_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MAX_TYPE_LENGTH,
} from './constants';

const dollarsToCents = (dollarAmount: number): number => Math.round(dollarAmount * 100);


export const validateMapping = (mapping: Record<string, string>) => {
    const mappedValues = new Set(Object.values(mapping));
    const mappedValuesArray = Object.values(mapping);

    // Check for required fields - O(1) lookup with Set
    const hasTransactionDate = mappedValues.has('date');
    const hasDescription = mappedValues.has('description');

    const hasAmount = mappedValues.has('amount');

    // Check for transaction type (either debit/credit OR type)
    const hasDebit = mappedValues.has('debit');
    const hasCredit = mappedValues.has('credit');
    const hasTransactionType = mappedValues.has('type');

    // Must have either (debit AND credit) OR (amount AND type)
    const hasValidTransactionType = (hasDebit && hasCredit) || (hasAmount && hasTransactionType);

    // Amount is required only if debit AND credit are not both present
    const hasValidAmount = hasAmount || (hasDebit && hasCredit);

    // Check for duplicates (excluding 'other' values)
    const nonIgnoreValues = mappedValuesArray.filter((value) => value !== 'other');
    const uniqueNonIgnoreValues = new Set(nonIgnoreValues);
    const hasDuplicates = nonIgnoreValues.length !== uniqueNonIgnoreValues.size;

    // Find duplicate values for error reporting
    const duplicateValues = mappedValuesArray.filter(
        (value, index, arr) => value !== 'other' && arr.indexOf(value) !== index,
    );

    return {
        isValid:
            hasTransactionDate &&
            hasDescription &&
            hasValidAmount &&
            hasValidTransactionType &&
            !hasDuplicates,
        missing: {
            transactionDate: !hasTransactionDate,
            description: !hasDescription,
            amount: !hasValidAmount,
            transactionType: !hasValidTransactionType,
        },
        hasDuplicates,
        duplicateValues: [...new Set(duplicateValues)],
        details: {
            hasTransactionDate,
            hasDescription,
            hasAmount,
            hasDebit,
            hasCredit,
            hasTransactionType,
        },
    };
};

// Optimized function to transform and validate raw CSV data in a single pass
export const transformAndValidateTransactions = (
    rows: any[],
    mapping: Record<string, string>,
): {
    transactions: any[];
    errors: string[];
    warnings: string[];
} => {
    const transactions: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const transactionSignatures = new Set();

    rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row) && (typeof row !== 'object' || row === null)) return;

        const transaction: any = {
            date: '',
            description: '',
            type: 'Debit',
        };

        let hasRequiredFields = { date: false, description: false, amount: false };

        // Process each mapped column
        Object.entries(mapping).forEach(([columnName, fieldType]) => {
            if (fieldType === 'other') return; // Skip ignored columns

            let value: any;

            // Extract value from row (handle both array and object formats)
            if (Array.isArray(row)) {
                const columnIndex = Object.keys(mapping).indexOf(columnName);
                if (columnIndex >= 0 && columnIndex < row.length) {
                    value = row[columnIndex];
                }
            } else if (typeof row === 'object' && row !== null) {
                value = row[columnName];
            }

            if (value === null || value === undefined || value === '') return;

            // Transform and validate value based on field type
            switch (fieldType) {
                case 'date':
                    const dateValue = new Date(value);
                    if (isNaN(dateValue.getTime())) {
                        errors.push(`Row ${rowIndex + 1} (${columnName}) "${value}" is not a valid date`);
                    } else {
                        // Check for reasonable date ranges
                        const now = new Date();
                        const yearDiff = Math.abs(now.getFullYear() - dateValue.getFullYear());
                        if (yearDiff > MAX_YEAR_DIFF) {
                            warnings.push(
                                `Row ${rowIndex + 1} (${columnName}) date seems too far in the past/future`,
                            );
                        }
                        transaction.date = dateValue.toISOString();
                        hasRequiredFields.date = true;
                    }
                    break;

                case 'description':
                    const descValue = String(value).trim();
                    if (descValue.length < MIN_DESCRIPTION_LENGTH) {
                        errors.push(`Row ${rowIndex + 1} (${columnName}) description is too short`);
                    } else if (descValue.length > MAX_DESCRIPTION_LENGTH) {
                        errors.push(
                            `Row ${rowIndex + 1} (${columnName}) description is too long (max ${MAX_DESCRIPTION_LENGTH} chars)`,
                        );
                    } else {
                        transaction.description = descValue;
                        hasRequiredFields.description = true;
                    }
                    break;

                case 'subdescription':
                    const subDescValue = String(value).trim();
                    if (subDescValue.length > MAX_DESCRIPTION_LENGTH) {
                        warnings.push(`Row ${rowIndex + 1} (${columnName}) subdescription is too long`);
                    }
                    transaction.subdescription = subDescValue;
                    break;

                case 'amount':
                    const cleanAmount = String(value).replace(/[$,\s]/g, '');
                    const numAmount = parseFloat(cleanAmount);
                    if (isNaN(numAmount)) {
                        errors.push(
                            `Row ${rowIndex + 1} (${columnName}) "${value}" cannot be converted to a number`,
                        );
                    } else if (Math.abs(numAmount) > MAX_AMOUNT) {
                        warnings.push(`Row ${rowIndex + 1} (${columnName}) amount seems unusually large`);
                    } else {

                        transaction.amount = dollarsToCents(Math.abs(numAmount));
                        hasRequiredFields.amount = true;
                    }
                    break;

                case 'debit':
                    const cleanDebit = String(value).replace(/[$,\s]/g, '');
                    const numDebit = Number(cleanDebit);
                    if (isNaN(numDebit)) {
                        errors.push(
                            `Row ${rowIndex + 1} (${columnName}) "${value}" cannot be converted to a number`,
                        );
                    } else {
                        transaction.amount = dollarsToCents(Math.abs(numDebit));
                        transaction.type = 'Debit';
                        hasRequiredFields.amount = true;
                    }
                    break;

                case 'credit':
                    const cleanCredit = String(value).replace(/[$,\s]/g, '');
                    const numCredit = Number(cleanCredit);
                    if (isNaN(numCredit)) {
                        errors.push(
                            `Row ${rowIndex + 1} (${columnName}) "${value}" cannot be converted to a number`,
                        );
                    } else {
                        transaction.amount = dollarsToCents(Math.abs(numCredit));
                        transaction.type = 'Credit';
                        hasRequiredFields.amount = true;
                    }
                    break;

                case 'type':
                    const typeValue = String(value).trim();
                    if (typeValue.length < MIN_DESCRIPTION_LENGTH) {
                        errors.push(`Row ${rowIndex + 1} (${columnName}) transaction type is too short`);
                    } else if (typeValue.length > MAX_TYPE_LENGTH) {
                        warnings.push(`Row ${rowIndex + 1} (${columnName}) transaction type is too long`);
                    } else {
                        if (
                            typeValue.toLowerCase().includes('debit') ||
                            typeValue.toLowerCase().includes('withdrawal')
                        ) {
                            transaction.type = 'Debit';
                        } else if (
                            typeValue.toLowerCase().includes('credit') ||
                            typeValue.toLowerCase().includes('deposit')
                        ) {
                            transaction.type = 'Credit';
                        }
                    }
                    break;
            }
        });

        // Check for missing required fields
        if (!hasRequiredFields.date) {
            errors.push(`Row ${rowIndex + 1}: missing date`);
        }
        if (!hasRequiredFields.description) {
            errors.push(`Row ${rowIndex + 1}: missing description`);
        }
        if (!hasRequiredFields.amount) {
            errors.push(`Row ${rowIndex + 1}: missing amount`);
        }

        // Check for duplicate transactions
        if (hasRequiredFields.date && hasRequiredFields.description && hasRequiredFields.amount) {
            const signature = `${transaction.date}-${transaction.description}-${transaction.amount}`;
            if (transactionSignatures.has(signature)) {
                warnings.push(`Row ${rowIndex + 1}: potential duplicate transaction`);
            } else {
                transactionSignatures.add(signature);
            }
        }

        // Only add transaction if it has all required fields
        if (hasRequiredFields.date && hasRequiredFields.description && hasRequiredFields.amount) {
            transactions.push(transaction);
        }
    });

    return { transactions, errors, warnings };
};

// Updated validation message function using the optimized approach
export const getValidationMessage = (mapping: Record<string, string>, rows: any[] = []) => {
    const validation = validateMapping(mapping);
    const { transactions, errors, warnings } = transformAndValidateTransactions(rows, mapping);

    if (validation.isValid && errors.length === 0) {
        // If there are only warnings, show them but don't block submission
        if (warnings.length > 0) {
            return `<strong>Warnings:</strong> ${warnings.slice(0, 3).join('. ')}${warnings.length > 3 ? `... and ${warnings.length - 3} more` : ''}`;
        }
        return null;
    }

    const allErrors = [];
    const allWarnings = [];

    // Check for missing required fields in mapping
    if (validation.missing.transactionDate) allErrors.push('transaction date');
    if (validation.missing.description) allErrors.push('description');
    if (validation.missing.amount) allErrors.push('amount');
    if (validation.missing.transactionType) allErrors.push('transaction type (debit/credit or type)');

    // Check for duplicate mappings
    if (validation.hasDuplicates) {
        const duplicateList = validation.duplicateValues.join('. ');
        allErrors.push(`Cannot have duplicate mapping values: ${duplicateList}`);
    }

    // Add data validation errors
    if (errors.length > 0) {
        allErrors.push(...errors.slice(0, 3)); // Show first 3 errors
        if (errors.length > 3) {
            allErrors.push(`... and ${errors.length - 3} more validation errors`);
        }
    }

    // Add warnings
    if (warnings.length > 0) {
        allWarnings.push(...warnings.slice(0, 2)); // Show first 2 warnings
        if (warnings.length > 2) {
            allWarnings.push(`... and ${warnings.length - 2} more warnings`);
        }
    }

    let message = `<strong class='text-red-700'>Validation errors:</strong> <span class='text-red-700'>${allErrors.join('. ')}.</span>`;
    if (allWarnings.length > 0) {
        message += `<br><strong class='text-gray-500'>Warnings:</strong> <span class='text-gray-500'>${allWarnings.join('. ')}.</span>`;
    }

    return message;
}; 