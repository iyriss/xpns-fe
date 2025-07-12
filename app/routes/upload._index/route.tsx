import { useFetcher, useNavigate } from '@remix-run/react';
import { ActionFunction } from '@remix-run/node';
import { z } from 'zod';
import { useUploadActions } from './hooks/useUploadActions';
import { StepIndicator } from './components/steps/StepIndicator';
import { StepRenderer } from './components/steps/StepRenderer';
import { SuccessView } from './components/SuccessView';
import { NavigationButtons } from './components/NavigationButtons';
import { UPLOAD_STEPS } from './utils/constants';
import { transformAndValidateTransactions } from './utils/validation-helpers';

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
    headers,
    dataHasHeaders,
    rows,
    mapping,
    bankStatement,
    handleUpload,
    handleHeaderSelection,
    handleMappingChange,
    handleMappingConfirm,
    handleBackToMapping,
    handleStatementTitleChange,
    handleReset,
  } = useUploadActions();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const data = fetcher.data as any;

  const handleUploadMore = () => window.location.reload();
  const handleViewStatements = () => navigate('/bank-statements');
  const handleBackToDashboard = () => navigate('/');

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
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
            <StepIndicator currentStep={currentStep} steps={UPLOAD_STEPS} />

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
                bankStatement={bankStatement}
                onFileUpload={handleUpload}
                onHeaderSelection={handleHeaderSelection}
                onMappingChange={handleMappingChange}
                onBack={handleBackToMapping}
                onStatementTitleChange={handleStatementTitleChange}
              />

              <NavigationButtons
                currentStep={currentStep}
                mapping={mapping}
                rows={rows}
                onReset={handleReset}
                onMappingConfirm={handleMappingConfirm}
              />
            </fetcher.Form>
          </>
        )}
      </div>
    </div>
  );
}
