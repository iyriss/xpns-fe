export enum UploadStep {
    UPLOAD = 'upload',
    PREVIEW = 'preview',
    MAPPING = 'mapping',
    MAPPING_TEMPLATE = 'mapping_template',
    SUBMIT = 'submit',
}

export interface Step {
    key: UploadStep;
    label: string;
    description: string;
}

export interface MappingTemplate {
    _id: string;
    name: string;
    headers: string[];
    mapping: Record<string, string>;
    hasHeaderRow: boolean;
}

export interface CSVParseResult {
    data: any[];
    meta: {
        fields?: string[];
    };
} 