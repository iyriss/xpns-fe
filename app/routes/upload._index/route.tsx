import { useEffect } from 'react';
import { toast } from 'sonner';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { ActionFunction, LoaderFunction } from '@remix-run/node';
import { z } from 'zod';
import { useUploadActions } from './hooks/useUploadActions';
import { StepIndicator } from './components/steps/StepIndicator';
import { StepRenderer } from './components/steps/StepRenderer';
import { SuccessView } from './components/SuccessView';
import { NavigationButtons } from './components/NavigationButtons';
import { STEPS_MAPPING_TEMPLATE, UPLOAD_STEPS } from './utils/constants';
import { transformAndValidateTransactions } from './utils/validation-helpers';
import { MappingTemplate } from './types';

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');
  const mappingTemplates = await fetch(`${process.env.API_URL}/api/mapping-templates`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
  });

  const { data } = await mappingTemplates.json();
  return { mappingTemplates: data || [] };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const cookieHeader = request.headers.get('Cookie');

  const TransactionsSchema = z.object({
    bankStatement: z.string(),
    transactions: z
      .string()
      .transform((str) => JSON.parse(str))
      .pipe(
        z.array(
          z.object({
            date: z.string().datetime(),
            description: z.string(),
            subdescription: z.string().optional(),
            type: z.enum(['Debit', 'Credit']),
            amount: z.number(),
          }),
        ),
      ),
  });

  const parsed = TransactionsSchema.parse(Object.fromEntries(formData));

  if (!parsed.bankStatement) {
    return { success: false, error: 'Title is required.' };
  }

  const bankStatementRes = await fetch(`${process.env.API_URL}/api/bank-statements`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
    body: JSON.stringify({ title: parsed.bankStatement }),
  });

  const { data } = await bankStatementRes.json();
  if (!data) {
    return { success: false };
  }

  const transactionWithBankStatement = parsed.transactions.map((transactionRow: any) => {
    return {
      ...transactionRow,
      bankStatement: data._id,
      user: data.user,
    };
  });

  const transactionsRes = await fetch(`${process.env.API_URL}/api/transactions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
    body: JSON.stringify(transactionWithBankStatement),
  });

  if (transactionsRes.status !== 200) {
    // If transactions upload fails, delete the bank statement
    await fetch(`${process.env.API_URL}/api/bank-statements/${data._id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
    });
    return { success: false, error: 'Failed to upload transactions' };
  }

  return { success: true };
};

export default function UploadRoute() {
  const {
    currentStep,
    firstFive,
    csvFile,
    template,
    headers,
    dataHasHeaders,
    rows,
    mapping,
    bankStatement,
    handleUpload,
    handlePreview,
    handleHeaderSelection,
    handleMappingChange,
    handleMappingConfirm,
    handleBackToMapping,
    handleStatementTitleChange,
    handleReset,
    handleGoToMapping,
    handleMappingTemplateChange,
  } = useUploadActions();

  const fetcher = useFetcher();
  const mappingTemplateFetcher = useFetcher<{ success?: boolean; error?: string }>();
  const navigate = useNavigate();
  const data = fetcher.data as any;
  const { mappingTemplates } = useLoaderData() as { mappingTemplates: MappingTemplate[] };

  useEffect(() => {
    if (mappingTemplateFetcher.data?.success) {
      toast.success('Mapping template created successfully');
    } else if (mappingTemplateFetcher.data?.error) {
      toast.error(mappingTemplateFetcher.data.error);
    }
  }, [mappingTemplateFetcher.data?.success]);

  const handleUploadMore = () => window.location.reload();
  const handleViewStatements = () => navigate('/bank-statements');
  const handleBackToDashboard = () => navigate('/');

  const handleSaveMapping = () => {
    const mappingTitleInput = document.querySelector(
      'input[name="mappingTitle"]',
    ) as HTMLInputElement;

    const mappingTitle = mappingTitleInput?.value;
    if (mappingTitle?.trim()) {
      const data = {
        name: mappingTitle.trim(),
        mapping,
        headers,
        hasHeaderRow: dataHasHeaders || false,
      };

      mappingTemplateFetcher.submit(data, {
        method: 'POST',
        action: '/mapping-templates',
        encType: 'application/json',
      });
    }
    handleMappingConfirm();
  };

  return (
    <div className='mx-auto max-w-6xl p-6'>
      <div className='mb-12'>
        <h1 className='text-3xl font-light text-gray-900'>Upload bank statement</h1>
        <p className='mt-2 text-gray-500'>Add a new bank statement to track expenses</p>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
        {data?.success ? (
          <SuccessView
            onUploadMore={handleUploadMore}
            onViewStatements={handleViewStatements}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          <>
            <StepIndicator
              currentStep={currentStep}
              steps={template ? STEPS_MAPPING_TEMPLATE : UPLOAD_STEPS}
            />

            <fetcher.Form action='/upload' method='POST' encType='multipart/form-data'>
              <input type='hidden' name='bankStatement' value={bankStatement} />
              <input
                type='hidden'
                name='transactions'
                value={JSON.stringify(transformAndValidateTransactions(rows, mapping).transactions)}
              />
              <input type='hidden' name='mapping' value={JSON.stringify(mapping)} />
              <input type='hidden' name='headers' value={JSON.stringify(headers)} />

              <StepRenderer
                currentStep={currentStep}
                firstFive={firstFive}
                headers={headers}
                dataHasHeaders={dataHasHeaders}
                rows={rows}
                mapping={mapping}
                template={template}
                mappingTemplates={mappingTemplates}
                bankStatement={bankStatement}
                csvFile={csvFile}
                onMappingChange={handleMappingChange}
                onFileUpload={handleUpload}
                onHeaderSelection={handleHeaderSelection}
                onMappingTemplateChange={handleMappingTemplateChange}
                onBack={handleBackToMapping}
                onReset={handleReset}
                onStatementTitleChange={handleStatementTitleChange}
              />

              <NavigationButtons
                currentStep={currentStep}
                mapping={mapping}
                rows={rows}
                uploadValid={!!bankStatement && !!csvFile}
                onReset={handleReset}
                onPreview={handlePreview}
                onGoToMapping={handleGoToMapping}
                onMappingConfirm={handleSaveMapping}
              />
            </fetcher.Form>
          </>
        )}
      </div>
    </div>
  );
}
