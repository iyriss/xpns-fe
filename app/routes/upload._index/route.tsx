import { FormEvent, useState } from 'react';
import { ActionFunction, json } from '@vercel/remix';
import { useActionData, useFetcher, useNavigate } from '@remix-run/react';
import { z } from 'zod';
import { toast } from 'sonner';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components/Button';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const cookieHeader = request.headers.get('Cookie');

  const TransactionsSchema = z.object({
    billStatement: z.string(),
    transactions: z
      .string()
      .transform((str) => JSON.parse(str)) // Parse JSON string to array
      .pipe(
        z.array(
          z.object({
            date: z.string().datetime(),
            description: z.string(),
            subdescription: z.string(),
            type: z.enum(['Debit', 'Credit']),
            amount: z.number(),
          }),
        ),
      ),
  });

  const parsed = TransactionsSchema.parse(Object.fromEntries(formData));
  if (!parsed.billStatement) {
    return json({ success: false, error: 'Title is required.' });
  }

  const billStatementRes = await fetch(`${process.env.API_URL}/api/bill-statements`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
    body: JSON.stringify({ title: parsed.billStatement }),
  });

  const { data } = await billStatementRes.json();

  if (!data) {
    return json({ success: false });
  }

  const transactionWithBillStatement = parsed.transactions.map((transactionRow: any) => {
    return {
      ...transactionRow,
      billStatement: data._id,
      user: data.user,
    };
  });

  const transactionsRes = await fetch(`${process.env.API_URL}/api/transactions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
    body: JSON.stringify(transactionWithBillStatement),
  });

  if (transactionsRes.status !== 200) {
    // If transactions upload fails, delete the bill statement
    await fetch(`${process.env.API_URL}/api/bill-statements/${data._id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader || '' },
    });
    return json({ success: false, error: 'Failed to upload transactions' });
  }

  return json({ success: true });
};

export default function () {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const data = fetcher.data as ReturnType<typeof useActionData<typeof action>>;

  const handleUpload = (files: FileList | null) => {
    if (!files?.length) {
      console.error('Csv file is required');
      return;
    }

    if (files[0].type !== 'text/csv') {
      console.error('File must be csv format');
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      const result = (e?.target as FileReader).result;
      if (!result) {
        return;
      }

      // Split the CSV data by lines
      const lines = (result as string).trim().split('\n');
      console.log('lines::::', lines);
      // Split each line by commas, accounting for quoted fields
      const parsedData = lines.map((line) => {
        const values = [];
        let value = '';
        let insideQuotes = false;

        console.log('spliiiit', line.split(','));
        for (let char of line) {
          console.log('char', char);
          if (char === '"') {
            // todo: are all csv double quotes?
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(value);
            value = '';
          } else {
            value += char;
          }
        }
        values.push(value);
        return values.slice(1, values.length - 1);
      });

      console.log('parsedData:::', parsedData);

      setHeaders(parsedData[0]);
      setRows(parsedData.slice(1));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rows?.length) {
      toast.error('No transactions to submit.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const billStatement = formData.get('billStatement');
    if (!billStatement) {
      toast.error('Please provide a title.');
      return;
    }
    const transactions = rows.map((row) => {
      const transaction: any = {
        date: new Date(row[0]),
        description: row[1],
        subdescription: row[2],
        type: row[3],
        amount: Math.abs(Math.round(Number(row[4]) * 100)),
      };
      return transaction;
    });

    formData.append('transactions', JSON.stringify(transactions)); // JSON stringify the transactions array
    fetcher.submit(formData, { method: 'post' });
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
            <fetcher.Form
              action='/upload'
              onSubmit={handleSubmit}
              method='POST'
              encType='multipart/form-data'
            >
              <div className='space-y-8'>
                <div>
                  <label
                    htmlFor='billStatement'
                    className='mb-2 block text-sm font-medium text-gray-700'
                  >
                    Statement Title <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name='billStatement'
                    id='billStatement'
                    className='w-full rounded-lg border border-gray-200 px-4 py-3 font-medium placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
                    required
                    placeholder='e.g. August 2024 checking account'
                  />
                </div>

                {rows?.length && !data?.success ? (
                  <div className='space-y-4'>
                    <div className='rounded-lg bg-purple-50 px-6 py-4'>
                      <h3 className='text-primary-active flex items-center gap-2 font-medium'>
                        <DocumentTextIcon className='h-5 w-5' />
                        Preview ({rows.length} transactions)
                      </h3>
                    </div>
                    <div className='overflow-hidden rounded-lg border border-gray-200'>
                      <table className='w-full'>
                        <thead>
                          <tr className='bg-gray-50'>
                            {headers.map((header, index) => (
                              <th
                                key={index}
                                className='px-4 py-3 text-left text-sm font-medium text-gray-700'
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className='border-t border-gray-100'>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className='px-4 py-3 text-sm text-gray-600'>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className='relative'>
                    <div className='flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100'>
                      <input
                        type='file'
                        className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                        onChange={(e) => handleUpload(e.currentTarget.files)}
                        accept='text/csv'
                        multiple={false}
                      />
                      <DocumentTextIcon className='mb-4 h-12 w-12 text-gray-400' />
                      <div className='mb-2 text-sm text-gray-600'>
                        Drag and drop or click to browse
                      </div>
                      <div className='text-xs text-gray-500'>CSV files only</div>
                    </div>
                  </div>
                )}

                <div className='flex items-center justify-end gap-3 pt-4'>
                  <Button
                    type='button'
                    onClick={(e) => {
                      if (rows.length > 0) {
                        e.stopPropagation();
                        setRows([]);
                        setHeaders([]);
                      } else {
                        navigate('/');
                      }
                    }}
                    variant='outline'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      fetcher.state === 'submitting' ||
                      fetcher.state === 'loading' ||
                      rows.length === 0
                    }
                  >
                    {fetcher.state === 'submitting' ? 'Uploading...' : 'Upload Statement'}
                  </Button>
                </div>
              </div>
            </fetcher.Form>
          </>
        )}
      </div>
    </div>
  );
}
