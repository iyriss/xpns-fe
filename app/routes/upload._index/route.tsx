import { Form } from '@remix-run/react';
import { useState } from 'react';

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
        return values.slice(1, values.length - 1); // Remove the first and last column
      });

      setHeaders(parsedData[0]);
      setRows(parsedData.slice(1));
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {rows?.length ? (
        <div className='overflow-x-auto'>
          <Form encType='multipart/form-data'>
            <button type='submit'>submit</button>
          </Form>
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
