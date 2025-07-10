import { useState } from 'react';
import { ActionFunction, ActionFunctionArgs, json } from '@vercel/remix';
import { useActionData, useFetcher, useNavigate } from '@remix-run/react';
import { set, z } from 'zod';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { ArrowLeftIcon, ArrowRightIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/Button';

const COLUMN_OPTIONS = [
  'transaction_date',
  'description',
  'subdescription',
  'amount',
  'debit',
  'credit',
  'transaction_type',
  'balance',
  'ignore',
];

// export const action: ActionFunction = async ({ request }) => {
//   const formData = await request.formData();
//   const cookieHeader = request.headers.get('Cookie');

//   const TransactionsSchema = z.object({
//     billStatement: z.string(),
//     transactions: z
//       .string()
//       .transform((str) => JSON.parse(str)) // Parse JSON string to array
//       .pipe(
//         z.array(
//           z.object({
//             date: z.string().datetime(),
//             description: z.string(),
//             subdescription: z.string(),
//             type: z.enum(['Debit', 'Credit']),
//             amount: z.number(),
//           }),
//         ),
//       ),
//   });

//   const parsed = TransactionsSchema.parse(Object.fromEntries(formData));
//   if (!parsed.billStatement) {
//     return json({ success: false, error: 'Title is required.' });
//   }

//   const billStatementRes = await fetch(`${process.env.API_URL}/api/bill-statements`, {
//     method: 'POST',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
//     body: JSON.stringify({ title: parsed.billStatement }),
//   });

//   const { data } = await billStatementRes.json();

//   if (!data) {
//     return json({ success: false });
//   }

//   const transactionWithBillStatement = parsed.transactions.map((transactionRow: any) => {
//     return {
//       ...transactionRow,
//       billStatement: data._id,
//       user: data.user,
//     };
//   });

//   const transactionsRes = await fetch(`${process.env.API_URL}/api/transactions`, {
//     method: 'POST',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
//     body: JSON.stringify(transactionWithBillStatement),
//   });

//   if (transactionsRes.status !== 200) {
//     // If transactions upload fails, delete the bill statement
//     await fetch(`${process.env.API_URL}/api/bill-statements/${data._id}`, {
//       method: 'DELETE',
//       credentials: 'include',
//       headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
//     });
//     return json({ success: false, error: 'Failed to upload transactions' });
//   }

//   return json({ success: true });
// };

const StatementTitleInput = ({
  onChange,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label htmlFor='billStatement' className='mb-2 block text-sm font-medium text-gray-700'>
      Statement Title <span className='text-red-500'>*</span>
    </label>
    <input
      name='billStatement'
      id='billStatement'
      className='w-full rounded-lg border border-gray-200 px-4 py-3 font-medium placeholder:text-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
      required
      placeholder='e.g. July 2024 Checking account'
      onChange={onChange}
    />
  </div>
);

const ColumnMappingTable = ({
  headers,
  rows,
  dataHasHeaders,
  mapping,
  onMappingChange,
}: {
  headers: string[];
  rows: string[][];
  dataHasHeaders: boolean | null;
  mapping: Record<string, string>;
  onMappingChange: (col: string, value: string) => void;
}) => {
  const columnWidth = headers.length > 0 ? `${100 / headers.length}%` : 'auto';

  return (
    <div>
      <div className='mb-5 rounded-lg bg-purple-50 px-6 py-4'>
        <h3 className='text-primary-active flex items-center gap-2 font-medium'>
          <DocumentTextIcon className='h-5 w-5' />
          Preview ({rows.length} transactions)
        </h3>
      </div>

      <div className='w-full rounded-lg border border-gray-200'>
        <table className='w-full table-fixed'>
          {dataHasHeaders === true && (
            <thead>
              <tr className='bg-gray-100'>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className='px-4 py-3 text-left text-sm font-medium text-gray-600'
                    style={{ width: columnWidth }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <thead>
            <tr className='bg-gray-100'>
              {headers.map((col) => (
                <th
                  key={col}
                  style={{ width: columnWidth }}
                  className='px-4 py-3 text-left text-sm font-medium text-gray-600'
                >
                  <select
                    value={mapping[col] || 'ignore'}
                    onChange={(e) => onMappingChange(col, e.target.value)}
                  >
                    {COLUMN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className='border-t border-gray-100'>
                {Object.values(row).map((value: any, index: number) => (
                  <td
                    key={index}
                    className='px-4 py-3 text-sm text-gray-600'
                    style={{ width: columnWidth }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PreviewTable = ({ firstFive, headers }: { firstFive: string[][]; headers: string[] }) => (
  <table className='w-full table-fixed border-collapse shadow-sm'>
    <thead>
      {firstFive.map((row, rowIndex) => (
        <tr
          key={`${row}-${rowIndex}`}
          className={`border-t border-gray-100/50 ${rowIndex === 0 ? 'bg-accent' : ''}`}
        >
          {row.map((col, colIndex) => (
            <th
              key={`${col}-${colIndex}`}
              className={`px-4 py-3 text-sm ${rowIndex === 0 ? 'font-bold text-white' : 'font-normal text-gray-600'}`}
              style={{ width: `${100 / (headers.length || row.length)}%` }}
            >
              {col}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  </table>
);

const FileUploadArea = ({ onFileUpload }: { onFileUpload: (files: FileList | null) => void }) => (
  <div className='relative'>
    <div className='flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100'>
      <input
        type='file'
        name='csv'
        className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
        onChange={(e) => onFileUpload(e.currentTarget.files)}
        accept='.csv'
        multiple={false}
      />
      <DocumentTextIcon className='h-12 w-12 text-gray-400' />
      <h3 className='mt-4 text-lg font-medium text-gray-900'>Upload your CSV file</h3>
      <div className='text-xs text-gray-500'>Drag and drop or click to browse</div>
    </div>
  </div>
);

type UploadStep = 'upload' | 'preview' | 'mapping' | 'submit';

const StepIndicator = ({
  currentStep,
  steps,
}: {
  currentStep: UploadStep;
  steps: { key: UploadStep; label: string; description: string }[];
}) => (
  <div className='mb-8'>
    <div className='flex items-center justify-between'>
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted =
          steps.findIndex((s) => s.key === currentStep) >
          steps.findIndex((s) => s.key === step.key);
        const isUpcoming =
          steps.findIndex((s) => s.key === currentStep) <
          steps.findIndex((s) => s.key === step.key);

        return (
          <div key={step.key} className='flex flex-1 items-center'>
            <div className='flex flex-col items-center'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-accent bg-accent text-white'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className='mt-2 text-center'>
                <div
                  className={`text-sm font-medium ${isActive ? 'text-accent' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {step.label}
                </div>
                <div className='text-xs text-gray-400'>{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 transition-all duration-200 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const PreviewStep = ({
  firstFive,
  headers,
  dataHasHeaders,
  onHeaderSelection,
}: {
  firstFive: string[][];
  headers: string[];
  dataHasHeaders: boolean | null;
  onHeaderSelection: (hasHeaders: boolean) => void;
}) => (
  <div className='mb-6'>
    <h3 className='text-lg font-medium text-gray-900'>Review your data</h3>
    <PreviewTable firstFive={firstFive} headers={headers} />

    <p className='mt-6 text-sm text-gray-500'>
      Let us know if the highlighted row on your CSV snippet contains column headers or one of your
      transactions data?
    </p>
    <div className='mt-4 flex items-center gap-8'>
      <label className='flex cursor-pointer items-center gap-2'>
        <div className='relative'>
          <input
            type='radio'
            name='tableHeaders'
            value='headers'
            checked={dataHasHeaders === true}
            onChange={() => onHeaderSelection(true)}
            className='sr-only'
          />
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
              dataHasHeaders === true
                ? 'border-accent bg-accent'
                : 'border-gray-400 bg-white hover:border-accent/50'
            }`}
          >
            {dataHasHeaders === true && <div className='h-2 w-2 rounded-full bg-white'></div>}
          </div>
        </div>
        <span className='text-sm'>Headers</span>
      </label>

      <label className='flex cursor-pointer items-center gap-2'>
        <div className='relative'>
          <input
            type='radio'
            name='tableHeaders'
            value='data'
            checked={dataHasHeaders === false}
            onChange={() => onHeaderSelection(false)}
            className='sr-only'
          />
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-200 ${
              dataHasHeaders === false
                ? 'border-accent bg-accent'
                : 'border-gray-400 bg-white hover:border-accent/50'
            }`}
          >
            {dataHasHeaders === false && <div className='h-2 w-2 rounded-full bg-white'></div>}
          </div>
        </div>
        <span className='text-sm'>Data</span>
      </label>
    </div>
  </div>
);

const MappingStep = ({
  headers,
  rows,
  dataHasHeaders,
  mapping,
  onMappingChange,
}: {
  headers: string[];
  rows: string[][];
  dataHasHeaders: boolean | null;
  mapping: Record<string, string>;
  onMappingChange: (col: string, value: string) => void;
}) => (
  <div>
    <div className='mb-6'>
      <h3 className='text-lg font-medium text-gray-900'>Map your columns</h3>
      <p className='mt-2 text-sm text-gray-500'>
        Tell us what each column represents so we can process your transactions correctly
      </p>
    </div>
    <ColumnMappingTable
      headers={headers}
      rows={rows}
      dataHasHeaders={dataHasHeaders}
      mapping={mapping}
      onMappingChange={onMappingChange}
    />
  </div>
);

const SubmitStep = ({
  billStatement,
  rows,
  mapping,
  headers,
  onBack,
}: {
  billStatement: string;
  rows: string[][];
  mapping: Record<string, string>;
  headers: string[];
  onBack: () => void;
}) => (
  <div className='text-center'>
    <div className='mb-6'>
      <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
        <svg
          className='h-8 w-8 text-green-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
        </svg>
      </div>
      <h3 className='mt-4 text-lg font-medium text-gray-900'>Ready to upload</h3>
      <p className='mt-2 text-sm text-gray-500'>Review your statement details before submitting</p>
    </div>

    <div className='mx-auto max-w-md space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6'>
      <div className='flex justify-between'>
        <span className='text-sm text-gray-600'>Statement Title:</span>
        <span className='text-sm font-medium text-gray-900'>{billStatement || 'No title'}</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-sm text-gray-600'>Transactions:</span>
        <span className='text-sm font-medium text-gray-900'>{rows.length} records</span>
      </div>
      <div className='flex justify-between'>
        <span className='text-sm text-gray-600'>Mapped Columns:</span>
        <span className='text-sm font-medium text-gray-900'>
          {Object.values(mapping).filter((v) => v !== 'ignore').length} of {headers.length}
        </span>
      </div>
    </div>

    <div className='mt-6 flex justify-center gap-3'>
      <Button variant='outline' onClick={onBack}>
        Back to mapping
      </Button>
      <Button
        type='submit'
        disabled={Object.keys(mapping).length !== headers.length || !billStatement || !rows.length}
      >
        Upload Statement
      </Button>
    </div>
  </div>
);

export default function () {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [firstFive, setFirstFive] = useState<string[][]>([]);
  const [dataHasHeaders, setDataHasHeaders] = useState<boolean | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [mappingConfirmed, setMappingConfirmed] = useState(false);
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [billStatement, setBillStatement] = useState('');

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const data = fetcher.data as ReturnType<typeof useActionData<typeof action>>;

  const steps = [
    { key: 'upload' as UploadStep, label: 'Upload', description: 'Select CSV file' },
    { key: 'preview' as UploadStep, label: 'Preview', description: 'Review data' },
    { key: 'mapping' as UploadStep, label: 'Map', description: 'Map columns' },
    { key: 'submit' as UploadStep, label: 'Submit', description: 'Upload statement' },
  ];

  const handleUpload = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }
    setCsvFile(file);
    setCurrentStep('preview');

    Papa.parse(file, {
      header: false,
      preview: 5,
      complete: (results) => setFirstFive(results.data as string[][]),
    });
  };

  const parseData = (includeHeaders: boolean) => {
    if (!csvFile) {
      return;
    }
    Papa.parse(csvFile, {
      header: includeHeaders,
      complete: (results) => {
        if (includeHeaders === true) {
          let initialMapping: Record<string, string> = {};
          const updatedHeaders = results.meta.fields as string[];
          setHeaders(updatedHeaders);
          updatedHeaders.forEach((col) => {
            if (col.toLowerCase().includes('date')) {
              initialMapping[col] = 'transaction_date';
            } else if (col.toLowerCase().includes('desc')) {
              initialMapping[col] = 'description';
            } else if (col.toLowerCase().includes('amount')) {
              initialMapping[col] = 'amount';
            } else if (col.toLowerCase().includes('type')) {
              initialMapping[col] = 'type';
            } else {
              initialMapping[col] = 'ignore';
            }
          });

          setMapping(initialMapping);
        } else {
          const dataArray = results.data as string[][];
          if (dataArray.length > 0) {
            setHeaders(
              Array.from({ length: dataArray[0].length }, (_, index) => `FILLER_COLUMN_${index}`),
            );
          }
        }
        setRows(results.data as string[][]);
        setCurrentStep('mapping');
      },
    });
  };

  const handleMappingChange = (col: string, value: string) => {
    setMapping((prev) => ({ ...prev, [col]: value }));
    console.log({ mapping });
  };

  const handleHeaderSelection = (hasHeaders: boolean) => {
    setDataHasHeaders(hasHeaders);
    if (hasHeaders) {
      parseData(true);
    } else {
      setHeaders([]);
      parseData(false);
    }
  };

  const handleMappingConfirm = () => {
    setMappingConfirmed(true);
    setCurrentStep('submit');
  };

  const handleBackToMapping = () => {
    setCurrentStep('mapping');
    setMappingConfirmed(false);
  };

  const handleStatementTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillStatement(e.target.value);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUploadArea onFileUpload={handleUpload} />;
      case 'preview':
        return (
          <PreviewStep
            firstFive={firstFive}
            headers={headers}
            dataHasHeaders={dataHasHeaders}
            onHeaderSelection={handleHeaderSelection}
          />
        );
      case 'mapping':
        return (
          <MappingStep
            headers={headers}
            rows={rows}
            dataHasHeaders={dataHasHeaders}
            mapping={mapping}
            onMappingChange={handleMappingChange}
          />
        );
      case 'submit':
        return (
          <SubmitStep
            billStatement={billStatement}
            rows={rows}
            mapping={mapping}
            headers={headers}
            onBack={handleBackToMapping}
          />
        );
      default:
        return <FileUploadArea onFileUpload={handleUpload} />;
    }
  };

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-12'>
        <h1 className='text-3xl font-light text-gray-900'>Upload Statement</h1>
        <p className='mt-2 text-gray-500'>Add a new bill statement to track expenses</p>
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
        {data?.success ? (
          <div className='py-12 text-center'>
            <div className='mb-6 text-2xl'>✅</div>
            <h2 className='mb-4 text-xl font-light text-gray-900'>
              Transactions uploaded successfully
            </h2>
            <div className='mx-auto flex max-w-xs flex-col gap-3'>
              <button
                type='button'
                onClick={() => window.location.reload()}
                className='hover:bg-primary-active w-full bg-primary px-6 py-3 font-medium text-white transition-colors'
              >
                Upload more
              </button>
              <button
                type='button'
                onClick={() => navigate('/bill-statements')}
                className='w-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50'
              >
                View statements
              </button>
              <button
                type='button'
                onClick={() => navigate('/')}
                className='w-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50'
              >
                Back to dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <StepIndicator currentStep={currentStep} steps={steps} />

            <fetcher.Form action='/upload' method='POST' encType='multipart/form-data'>
              {currentStep === 'upload' && (
                <div className='space-y-8'>
                  <StatementTitleInput onChange={handleStatementTitleChange} />
                  {renderCurrentStep()}
                </div>
              )}

              {currentStep === 'preview' && (
                <div className='space-y-8'>
                  <StatementTitleInput onChange={handleStatementTitleChange} />
                  {renderCurrentStep()}
                </div>
              )}

              {currentStep === 'mapping' && (
                <div className='space-y-8'>
                  <StatementTitleInput onChange={handleStatementTitleChange} />
                  {renderCurrentStep()}
                </div>
              )}

              {currentStep === 'submit' && (
                <div className='space-y-8'>
                  <StatementTitleInput onChange={handleStatementTitleChange} />
                  {renderCurrentStep()}
                </div>
              )}

              {currentStep !== 'submit' && currentStep !== 'upload' && (
                <div className='mt-10 flex justify-between'>
                  <Button
                    type='button'
                    onClick={() => {
                      setCurrentStep('upload');
                      setRows([]);
                      setHeaders([]);
                      setFirstFive([]);
                      setDataHasHeaders(null);
                      setMappingConfirmed(false);
                    }}
                    variant='text'
                  >
                    <ArrowLeftIcon className='mr-2 h-4 w-4' />
                    Back
                  </Button>
                  {currentStep === 'mapping' && (
                    <button
                      className='flex items-center bg-primary px-4 py-2 text-white'
                      onClick={handleMappingConfirm}
                    >
                      Confirm column types
                      <ArrowRightIcon className='ml-2 h-4 w-4' />
                    </button>
                  )}
                </div>
              )}
            </fetcher.Form>
          </>
        )}
      </div>
    </div>
  );
}
