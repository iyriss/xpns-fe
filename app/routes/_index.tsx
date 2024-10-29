import { useState } from 'react';
import { ActionFunction } from '@remix-run/node';
import { Form, useFetcher } from '@remix-run/react';
import { z } from 'zod';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const transactions = JSON.parse(formData.get('transactions') as string);

  const TransactionsSchema = z.array(
    z.object({
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
  );

  TransactionsSchema.parse(transactions);

  return { success: true };
};

export default function () {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

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
        values.push(value); // Add the last value
        return values.slice(1); // Remove the first column
      });

      setHeaders(parsedData[0]);
      setRows(parsedData.slice(1));
    };
    reader.readAsText(file);
  };

  //   e.preventDefault();

  //   if (!parsed?.length) {
  //     console.error('No transactions found.');
  //     return;
  //   }

  //   const transactions = parsed.map((x) => {
  //     const transaction: any = { ...x };
  //     delete transaction._id;
  //     return transaction;
  //   });

  //   fetcher.submit(
  //     {
  //       transactions: JSON.stringify(transactions),
  //     },
  //     { method: 'post' }
  //   );
  // };
  return (
    <div>
      <Form encType='multipart/form-data'>
        <input
          type='file'
          onChange={(e) => handleUpload(e.currentTarget.files)}
          accept='text/csv'
        />
        <button type='submit'>submit</button>
      </Form>

      <div className='overflow-x-auto'>
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
    </div>
  );
}
