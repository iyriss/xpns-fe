import { useCallback } from 'react';
import { CSVService } from '../services/csvService';
import { UploadStep, MappingTemplate } from '../types';
import { useUploadState } from './useUploadState';

export const useUploadActions = () => {
    const { updateState, resetState, ...state } = useUploadState();

    const handleUpload = useCallback(async (files: FileList | null) => {
        const file = files?.[0];
        if (!file) return;

        updateState({ csvFile: file, currentStep: UploadStep.PREVIEW });

        try {
            const template = state.template && Object.keys(state?.mapping).length > 0 && state?.headers?.length > 0;
            if (template) {
                const preview = await CSVService.parseTemplate(file, state.dataHasHeaders || false);
                updateState({ rows: preview.rows, currentStep: UploadStep.MAPPING_TEMPLATE });
            } else {
                const preview = await CSVService.parsePreview(file);
                updateState({ firstFive: preview });
            }
        } catch (error) {
            console.error('Error parsing CSV preview:', error);
        }
    }, [updateState, state.dataHasHeaders, state.mapping, state.headers, state.template]);

    const handleHeaderSelection = useCallback(async (hasHeaders: boolean) => {
        if (!state.csvFile) return;

        updateState({ dataHasHeaders: hasHeaders });

        try {
            const { headers, rows, mapping } = await CSVService.parseFull(state.csvFile, hasHeaders);
            updateState({
                headers,
                rows,
                mapping,
                currentStep: UploadStep.MAPPING
            });
        } catch (error) {
            console.error('Error parsing CSV:', error);
        }
    }, [state.csvFile, updateState]);

    const handleMappingChange = useCallback((col: string, value: string) => {
        updateState({
            mapping: { ...state.mapping, [col]: value }
        });
    }, [state.mapping, updateState]);

    const handleMappingConfirm = useCallback(() => {
        updateState({ currentStep: UploadStep.SUBMIT });
    }, [updateState]);

    const handleBackToMapping = useCallback(() => {
        updateState({ currentStep: UploadStep.MAPPING, template: "" });
    }, [updateState]);

    const handleStatementTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateState({ bankStatement: e.target.value });
    }, [updateState]);

    const handleMappingTemplateChange = useCallback((template: MappingTemplate | null) => {
        if (!template) {
            updateState({ template: '', headers: [], mapping: {}, dataHasHeaders: false });
            return;
        }

        updateState({
            template: template._id,
            headers: template.headers,
            mapping: template.mapping,
            dataHasHeaders: template.hasHeaders,
        });
    }, [updateState]);

    const handleReset = useCallback(() => {
        resetState();
    }, [resetState]);

    return {
        ...state,
        handleUpload,
        handleHeaderSelection,
        handleMappingChange,
        handleMappingConfirm,
        handleBackToMapping,
        handleStatementTitleChange,
        handleMappingTemplateChange,
        handleReset,
    };
}; 