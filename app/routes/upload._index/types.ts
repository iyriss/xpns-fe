export enum UploadStep {
    UPLOAD = 'upload',
    PREVIEW = 'preview',
    MAPPING = 'mapping',
    SUBMIT = 'submit',
}

export interface Step {
    key: UploadStep;
    label: string;
    description: string;
}

export interface CSVParseResult {
    data: any[];
    meta: {
        fields?: string[];
    };
} 