import { ActionFunction, json } from '@remix-run/node';
import { useActionData, useFetcher, useNavigate } from '@remix-run/react';
import { FormEvent, useState } from 'react';
import { z } from 'zod';
import { Button } from '../../components/Button';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

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
            typeOfTransaction: z.enum(['Debit', 'Credit']),
            amount: z.number(),
          }),
        ),
      ),
  });

  const parsed = TransactionsSchema.parse(Object.fromEntries(formData));

  const res = await fetch('http://localhost:5000/api/bill-statements', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: parsed.billStatement }),
  });
  const { billStatement } = await res.json();

  const transactionWithBillStatement = parsed.transactions.map((transactionRow: any) => {
    return { ...transactionRow, billStatement: billStatement._id };
  });

  const response = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(transactionWithBillStatement),
  });

  if (response.statusText === 'OK') {
    return json({ success: true });
  } else {
    return json({ success: false });
  }
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

      // Split each line by commas, accounting for quoted fields
      const parsedData = lines.map((line) => {
        const values = [];
        let value = '';
        let insideQuotes = false;

        for (let char of line) {
          if (char === '"') {
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

      setHeaders(parsedData[0]);
      setRows(parsedData.slice(1));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rows?.length) {
      //   toast.error('No transactions to submit.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const billStatement = formData.get('billStatement');
    if (!billStatement) {
      //   toast.error('Please provide a title.');
      return;
    }

    const transactions = rows.map((row) => {
      const transaction: any = {
        date: new Date(row[0]),
        description: row[1],
        subdescription: row[2],
        typeOfTransaction: row[3],
        amount: Math.round(Number(row[4]) * 100),
      };
      return transaction;
    });

    formData.append('transactions', JSON.stringify(transactions)); // JSON stringify the transactions array
    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <div className='mx-auto max-w-[1020px] p-5'>
      <h1 className='my-4 text-2xl font-extrabold'>Add expenses</h1>

      {data?.success ? (
        <div>
          <div>Transactions uploaded ✅. Want to upload more?</div>
          <div className='my-4 flex gap-8'>
            <Button type='button' variant='outline' onClick={() => navigate('/')}>
              Nah, thanks
            </Button>
            <Button type='button' onClick={() => window.location.reload()}>
              Yes, let's do it
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className='text-light my-2'>Upload your bill statement to track your expenses.</div>
          <fetcher.Form
            action='/upload'
            onSubmit={handleSubmit}
            method='POST'
            encType='multipart/form-data'
          >
            <div className='flex flex-col items-center rounded border-gray-400 bg-white p-5 shadow-sm'>
              <div className='mb-4 flex w-full flex-col gap-1'>
                <label htmlFor='billStatement'>
                  Bill statement title<span className='text-error'> *</span>
                </label>
                <input
                  name='billStatement'
                  className='border-border w-fit min-w-[400px] border px-4 py-2 font-semibold placeholder:font-normal'
                  required
                  placeholder='e.g. August 2024 checking account'
                />
              </div>
              {rows?.length && !data?.success ? (
                <table className='w-full border border-gray-200'>
                  <thead>
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} className='border-b bg-[#38917D]/20 px-4 py-2'>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className='border-b px-4 py-2 text-center'>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='relative flex h-40 w-full cursor-pointer items-center justify-center rounded-sm border border-dashed border-[#38917D] bg-[#38917D]/10 hover:bg-[#38917D]/20'>
                  <input
                    type='file'
                    className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
                    onChange={(e) => handleUpload(e.currentTarget.files)}
                    accept='text/csv'
                  />
                  <div className='cursor-pointer'>Upload bill statement</div>
                </div>
              )}
            </div>

            <Button
              type='submit'
              className='ml-auto mt-8'
              disabled={fetcher.state === 'submitting' || fetcher.state === 'loading'}
            >
              Submit
            </Button>
          </fetcher.Form>
        </>
      )}
    </div>
  );
}
