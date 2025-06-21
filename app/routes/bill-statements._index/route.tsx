import { json } from '@vercel/remix';
import { LoaderFunction } from '@vercel/remix';
import { useLoaderData, useNavigate } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/bill-statements`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });

  const jsonRes = await res.json();
  return json({ billStatements: jsonRes.data });
};

export default function () {
  const { billStatements } = useLoaderData() as any;
  const navigate = useNavigate();

  return (
    <div className='mx-auto mb-10 h-fit w-full max-w-[1020px] rounded bg-white p-5'>
      <h1 className='my-4 text-2xl font-semibold'>Uncaptured bill statements</h1>
      {billStatements?.length ? (
        <>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#38917D]/20'>
                <th className='px-2 py-5 text-left'>Title</th>
                <th className='px-2 py-5 text-left'>Created at</th>
              </tr>
            </thead>
            <tbody>
              {billStatements.map((billStatement: any) => {
                return (
                  <tr
                    key={billStatement._id}
                    className='cursor-pointer border-b border-border/40 text-center hover:bg-gray-100'
                    onClick={() => navigate(`/bill-statements/${billStatement._id}/transactions`)}
                  >
                    <td className='w-3/4 px-2 py-5 text-left'>{billStatement.title}</td>
                    <td className='w-1/4 px-2 py-5 text-left'>
                      {displayDate(billStatement.createdAt)}
                    </td>
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
