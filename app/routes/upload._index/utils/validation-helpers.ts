import {
    CSV_SAMPLE_ROWS,
    MAX_AMOUNT,
    MAX_YEAR_DIFF,
    MAX_DESCRIPTION_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MAX_TYPE_LENGTH,
} from './constants';

// Validation utility functions
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

// Enhanced validation that checks data types and data quality
export const validateDataTypes = (mapping: Record<string, string>, rows: any[]) => {
    const errors: string[] = [];

    // Check each mapped column for data type validity
    Object.entries(mapping).forEach(([columnName, fieldType]) => {
        if (fieldType === 'other') return; // Skip ignored columns

        // Check first few rows for data type validation
        const sampleRows = rows.slice(0, CSV_SAMPLE_ROWS); // Check first 10 rows for better coverage

        sampleRows.forEach((row, rowIndex) => {
            let value: string;

            // Handle both array and object formats
            if (Array.isArray(row)) {
                const columnIndex = Object.keys(mapping).indexOf(columnName);
                if (columnIndex === -1 || columnIndex >= row.length) return;
                value = row[columnIndex];
            } else if (typeof row === 'object' && row !== null) {
                value = row[columnName];
            } else {
                return; // Skip non-array, non-object rows
            }

            if (!value || value.trim() === '') return;

            switch (fieldType) {
                case 'amount':
                case 'debit':
                case 'credit':
                case 'balance':
                    // Remove common currency symbols, commas, and whitespace
                    const cleanValue = value.replace(/[$,\s]/g, '');
                    if (isNaN(Number(cleanValue))) {
                        errors.push(
                            `Row ${rowIndex + 1}, ${columnName}: "${value}" cannot be converted to a number`,
                        );
                    } else {
                        // Check for reasonable amount ranges
                        const numValue = Number(cleanValue);
                        if (numValue > MAX_AMOUNT) {
                            // $1 billion limit
                            errors.push(`Row ${rowIndex + 1}, ${columnName}: amount seems unusually large`);
                        }
                    }
                    break;

                case 'date':
                    // Try to parse as date - be flexible with formats
                    const dateValue = new Date(value);
                    if (isNaN(dateValue.getTime())) {
                        errors.push(`Row ${rowIndex + 1}, ${columnName}: "${value}" is not a valid date`);
                    } else {
                        // Check for reasonable date ranges
                        const now = new Date();
                        const yearDiff = Math.abs(now.getFullYear() - dateValue.getFullYear());
                        if (yearDiff > MAX_YEAR_DIFF) {
                            errors.push(
                                `Row ${rowIndex + 1}, ${columnName}: date seems too far in the past/future`,
                            );
                        }
                        // Check for future dates (warn but don't error)
                        if (dateValue > now) {
                            console.warn(`Row ${rowIndex + 1}, ${columnName}: future date detected`);
                        }
                    }
                    break;

                case 'description':
                    // Check for reasonable description length
                    if (value.trim().length < MIN_DESCRIPTION_LENGTH) {
                        errors.push(`Row ${rowIndex + 1}, ${columnName}: description is too short`);
                    }
                    if (value.trim().length > MAX_DESCRIPTION_LENGTH) {
                        errors.push(
                            `Row ${rowIndex + 1}, ${columnName}: description is too long (max ${MAX_DESCRIPTION_LENGTH} chars)`,
                        );
                    }
                    break;

                case 'type':
                    // Check for reasonable type values
                    if (value.trim().length < MIN_DESCRIPTION_LENGTH) {
                        errors.push(`Row ${rowIndex + 1}, ${columnName}: transaction type is too short`);
                    }
                    if (value.trim().length > MAX_TYPE_LENGTH) {
                        errors.push(`Row ${rowIndex + 1}, ${columnName}: transaction type is too long`);
                    }
                    break;
            }
        });
    });

    return errors;
};

// Additional validation for data consistency
export const validateDataConsistency = (mapping: Record<string, string>, rows: any[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    console.log(rows);

    // Check for empty rows
    const emptyRows = rows.filter((row) => {
        if (Array.isArray(row)) {
            return row.every((cell) => !cell || cell.trim() === '');
        } else if (typeof row === 'object' && row !== null) {
            return Object.values(row).every((cell) => !cell || String(cell).trim() === '');
        }
        return false;
    });

    if (emptyRows.length > 0) {
        warnings.push(`${emptyRows.length} empty row(s) detected - these will be skipped`);
    }

    // Check for rows with inconsistent column counts
    const expectedColumns = Object.keys(mapping).length;
    const inconsistentRows = rows.filter((row, index) => {
        // Skip non-arrays/objects and empty rows (already handled above)
        if (!Array.isArray(row) && (typeof row !== 'object' || row === null)) return false;
        if (Array.isArray(row) && row.every((cell) => !cell || cell.trim() === '')) return false;
        if (
            typeof row === 'object' &&
            Object.values(row).every((cell) => !cell || String(cell).trim() === '')
        )
            return false;

        if (Array.isArray(row)) {
            return row.length !== expectedColumns;
        } else {
            return Object.keys(row).length !== expectedColumns;
        }
    });

    if (inconsistentRows.length > 0) {
        warnings.push(`${inconsistentRows.length} row(s) with inconsistent column counts detected`);
    }

    // Check for rows with missing required data
    const requiredFields = ['date', 'description', 'amount'];
    const requiredFieldColumns = requiredFields.map((field) => {
        const entry = Object.entries(mapping).find(([_, type]) => type === field);
        return entry ? entry[0] : null; // Return column name instead of index
    });

    rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row) && (typeof row !== 'object' || row === null)) return;

        requiredFieldColumns.forEach((columnName, fieldIndex) => {
            if (columnName) {
                let value: string;
                if (Array.isArray(row)) {
                    const columnIndex = Object.keys(mapping).indexOf(columnName);
                    if (columnIndex === -1 || columnIndex >= row.length) return;
                    value = row[columnIndex];
                } else {
                    value = row[columnName];
                }

                if (!value || value.trim() === '') {
                    errors.push(`Row ${rowIndex + 1}: missing ${requiredFields[fieldIndex]}`);
                }
            }
        });
    });

    // Check for duplicate transactions (same date, description, and amount)
    const transactionSignatures = new Set();
    const duplicates: string[] = [];

    rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row) && (typeof row !== 'object' || row === null)) return;

        const dateCol = Object.entries(mapping).find(([_, type]) => type === 'date');
        const descCol = Object.entries(mapping).find(([_, type]) => type === 'description');
        const amountCol = Object.entries(mapping).find(([_, type]) => type === 'amount');

        if (dateCol && descCol && amountCol) {
            let dateValue: string, descValue: string, amountValue: string;

            if (Array.isArray(row)) {
                const dateIndex = Object.keys(mapping).indexOf(dateCol[0]);
                const descIndex = Object.keys(mapping).indexOf(descCol[0]);
                const amountIndex = Object.keys(mapping).indexOf(amountCol[0]);

                if (dateIndex >= row.length || descIndex >= row.length || amountIndex >= row.length) return;

                dateValue = row[dateIndex];
                descValue = row[descIndex];
                amountValue = row[amountIndex];
            } else {
                dateValue = row[dateCol[0]];
                descValue = row[descCol[0]];
                amountValue = row[amountCol[0]];
            }

            const signature = `${dateValue}-${descValue}-${amountValue}`;
            if (transactionSignatures.has(signature)) {
                duplicates.push(`Row ${rowIndex + 1}`);
            } else {
                transactionSignatures.add(signature);
            }
        }
    });

    // Warn about any duplicates found
    if (duplicates.length > 0) {
        warnings.push(`${duplicates.length} potential duplicate transaction(s) detected`);
    }

    return { errors, warnings };
};

export const getValidationMessage = (mapping: Record<string, string>, rows: any[] = []) => {
    const validation = validateMapping(mapping);
    const dataTypeErrors = validateDataTypes(mapping, rows);
    const consistencyResult = validateDataConsistency(mapping, rows);

    if (validation.isValid && dataTypeErrors.length === 0 && consistencyResult.errors.length === 0) {
        // If there are only warnings, show them but don't block submission
        if (consistencyResult.warnings.length > 0) {
            return `Warnings: ${consistencyResult.warnings.slice(0, 3).join(', ')}${consistencyResult.warnings.length > 3 ? `... and ${consistencyResult.warnings.length - 3} more` : ''}`;
        }
        return null;
    }

    const errors = [];
    const warnings = [];

    // Check for missing required fields
    if (validation.missing.transactionDate) errors.push('transaction date');
    if (validation.missing.description) errors.push('description');
    if (validation.missing.amount) errors.push('amount');
    if (validation.missing.transactionType) errors.push('transaction type (debit/credit or type)');

    // Check for duplicates
    if (validation.hasDuplicates) {
        const duplicateList = validation.duplicateValues.join(', ');
        errors.push(`duplicate mappings: ${duplicateList}`);
    }

    // Add data type errors
    if (dataTypeErrors.length > 0) {
        errors.push(...dataTypeErrors.slice(0, 3)); // Show first 3 data type errors
        if (dataTypeErrors.length > 3) {
            errors.push(`... and ${dataTypeErrors.length - 3} more data type errors`);
        }
    }

    // Add consistency errors
    if (consistencyResult.errors.length > 0) {
        errors.push(...consistencyResult.errors.slice(0, 2)); // Show first 2 consistency errors
        if (consistencyResult.errors.length > 2) {
            errors.push(`... and ${consistencyResult.errors.length - 2} more consistency issues`);
        }
    }

    // Add warnings
    if (consistencyResult.warnings.length > 0) {
        warnings.push(...consistencyResult.warnings.slice(0, 2)); // Show first 2 warnings
        if (consistencyResult.warnings.length > 2) {
            warnings.push(`... and ${consistencyResult.warnings.length - 2} more warnings`);
        }
    }

    let message = `Validation errors: ${errors.join(', ')}`;
    if (warnings.length > 0) {
        message += `. Warnings: ${warnings.join(', ')}`;
    }

    return message;
};
