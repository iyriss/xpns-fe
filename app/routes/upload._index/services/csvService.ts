import Papa from 'papaparse';
import { CSVParseResult } from '../types';
import { CSV_PREVIEW_ROWS } from '../utils/constants';

export class CSVService {
    static parsePreview(file: File): Promise<any[]> {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: false,
                preview: CSV_PREVIEW_ROWS,
                complete: (results: CSVParseResult) => {
                    const filteredPreview = this.filterEmptyRows(results.data);
                    resolve(filteredPreview);
                },
            });
        });
    }

    static parseFull(file: File, includeHeaders: boolean): Promise<{
        headers: string[];
        rows: any[];
        mapping: Record<string, string>;
    }> {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: includeHeaders,
                complete: (results: CSVParseResult) => {
                    const filteredData = this.filterEmptyRows(results.data);

                    let headers: string[];
                    let mapping: Record<string, string>;

                    if (includeHeaders) {
                        headers = results.meta.fields as string[];
                        mapping = this.generateInitialMapping(headers);
                    } else {
                        const dataArray = results.data as any[];
                        if (dataArray.length > 0) {
                            const firstRow = dataArray[0];
                            const columnCount = Array.isArray(firstRow)
                                ? firstRow.length
                                : Object.keys(firstRow).length;
                            headers = Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);
                            mapping = Object.fromEntries(
                                Array.from({ length: columnCount }, (_, index) => [`Column ${index + 1}`, 'other']),
                            );
                        } else {
                            headers = [];
                            mapping = {};
                        }
                    }

                    resolve({ headers, rows: filteredData, mapping });
                },
            });
        });
    }

    static parseTemplate(file: File, hasHeaders: boolean): Promise<any> {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: hasHeaders,
                complete: (results: CSVParseResult) => {
                    const filteredData = this.filterEmptyRows(results.data);
                    resolve({ rows: filteredData });
                },
            });
        });
    }

    private static filterEmptyRows(data: any[]): any[] {
        return data.filter((row) => {
            if (Array.isArray(row)) {
                return row.some((cell) => cell && cell.toString().trim() !== '');
            } else if (typeof row === 'object' && row !== null) {
                return Object.values(row).some((cell) => cell && cell.toString().trim() !== '');
            }
            return false;
        });
    }

    private static generateInitialMapping(headers: string[]): Record<string, string> {
        const mapping: Record<string, string> = {};

        headers.forEach((col) => {
            const lowerCol = col.toLowerCase();
            if (lowerCol.includes('date')) {
                mapping[col] = 'date';
            } else if (lowerCol.includes('desc')) {
                mapping[col] = 'description';
            } else if (lowerCol.includes('amount') || lowerCol.includes('amt')) {
                mapping[col] = 'amount';
            } else if (lowerCol.includes('type')) {
                mapping[col] = 'type';
            } else {
                mapping[col] = 'other';
            }
        });

        return mapping;
    }
} 