import { json } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/bill-statements`);
  const jsonRes = await res.json();
  return json({ billStatements: jsonRes.data });
};

export default function () {
  const { billStatements } = useLoaderData() as any;
  const navigate = useNavigate();

  return (
    <div className='mx-auto w-full max-w-[1020px] rounded bg-white p-5'>
      <h1 className='my-4 text-2xl font-semibold'>Uncaptured bill statements</h1>
      {billStatements.length ? (
        <>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#38917D]/20'>
                <th className='py-5'>Title</th>
                <th className='py-5'>Transaction dates</th>
                <th className='py-5'>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {billStatements.map((billStatement: any) => {
                return (
                  <tr
                    key={billStatement._id}
                    className='cursor-pointer border-b border-border/40 text-center hover:text-[#38917D]'
                    onClick={() => navigate(`/bill-statements/${billStatement._id}/transactions`)}
                  >
                    <td className='py-5'>{billStatement.title}</td>
                    <td className='py-5'>
                      {displayDate(billStatement.nearestTransaction)} -{' '}
                      {displayDate(billStatement.furthestTransaction)}
                    </td>
                    <td className='py-5'>{billStatement.transactionCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <div className='text-muted'>No bill statements to show.</div>
      )}
    </div>
  );
}

function displayDate(date: string) {
  if (!date) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-CA', options).format(new Date(date));
}
