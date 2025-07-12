import { useState, useCallback } from 'react';
import { UploadStep } from '../types';

export interface UploadState {
    headers: string[];
    rows: any[];
    mapping: Record<string, string>;
    firstFive: any[];
    dataHasHeaders: boolean | null;
    csvFile: File | null;
    currentStep: UploadStep;
    bankStatement: string;
}

export const useUploadState = () => {
    const [state, setState] = useState<UploadState>({
        headers: [],
        rows: [],
        mapping: {},
        firstFive: [],
        dataHasHeaders: null,
        csvFile: null,
        currentStep: UploadStep.UPLOAD,
        bankStatement: '',
    });

    const updateState = useCallback((updates: Partial<UploadState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const resetState = useCallback(() => {
        setState({
            headers: [],
            rows: [],
            mapping: {},
            firstFive: [],
            dataHasHeaders: null,
            csvFile: null,
            currentStep: UploadStep.UPLOAD,
            bankStatement: '',
        });
    }, []);

    return {
        ...state,
        updateState,
        resetState,
    };
}; 