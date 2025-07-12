import { UploadStep, Step } from '../types';

export const UPLOAD_STEPS: Step[] = [
    { key: UploadStep.UPLOAD, label: 'Upload', description: 'Select CSV file' },
    { key: UploadStep.PREVIEW, label: 'Preview', description: 'Review data' },
    { key: UploadStep.MAPPING, label: 'Map', description: 'Map columns' },
    { key: UploadStep.SUBMIT, label: 'Submit', description: 'Upload bank statement' },
];

export const CSV_PREVIEW_ROWS = 5;
export const CSV_SAMPLE_ROWS = 10;
export const MAX_AMOUNT = 1000000000; // $1 billion limit
export const MAX_YEAR_DIFF = 50;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_DESCRIPTION_LENGTH = 1;
export const MAX_TYPE_LENGTH = 100; 