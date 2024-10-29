import { ActionFunction, json } from '@remix-run/node';
import { useActionData, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { z } from 'zod';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const transactionsRows = JSON.parse(formData.get('transactions') as string);

  const TransactionsSchema = z.array(
    z.object({
      date: z.string().datetime(),
      description: z.string(),
      subdescription: z.string(),
      typeOfTransaction: z.enum(['Debit', 'Credit']),
      amount: z.number(),
    })
  );

  TransactionsSchema.parse(transactionsRows);

  const res = await fetch('http://localhost:5000/api/billing-cycles', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'first one' }),
  });
  const { billingCycle } = await res.json();

  const transactionWithBillingCycle = transactionsRows.map(
    (transactionRow: any) => {
      return { ...transactionRow, billingCycle: billingCycle._id };
    }
  );

  const response = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(transactionWithBillingCycle),
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rows?.length) {
      //   toast.error('No transactions to submit.');
      return;
    }

    const transactions = rows.map((row) => {
      const transaction: any = {
        date: new Date(row[0]),
        description: row[1],
        subdescription: row[2],
        typeOfTransaction: row[3],
        amount: Number(row[4]),
      };
      return transaction;
    });

    fetcher.submit(
      { transactions: JSON.stringify(transactions) },
      { method: 'post' }
    );
  };

  return (
    <div>
      {data?.success && <div>Transactions uploaded. Want to upload more?</div>}
      {rows?.length && !data?.success ? (
        <div className='overflow-x-auto'>
          <fetcher.Form
            action='/upload'
            onSubmit={handleSubmit}
            method='POST'
            encType='multipart/form-data'
          >
            <input name='billingCycle' type='text' />
            <button
              type='submit'
              disabled={
                fetcher.state === 'submitting' || fetcher.state === 'loading'
              }
            >
              Submit
            </button>
          </fetcher.Form>
          <table className='min-w-full border border-gray-200'>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className='px-4 py-2 border-b'>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className='text-center px-4 py-2 border-b'
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <input
          type='file'
          onChange={(e) => handleUpload(e.currentTarget.files)}
          accept='text/csv'
        />
      )}
    </div>
  );
}
