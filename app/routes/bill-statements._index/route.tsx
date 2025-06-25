import { json } from '@vercel/remix';
import { LoaderFunction } from '@vercel/remix';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { CalendarDaysIcon, CalendarIcon, ClockIcon, DocumentIcon } from '@heroicons/react/24/solid';

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
    <div className='mx-auto mb-10 h-fit w-full max-w-7xl rounded-3xl border border-border/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl'>
      <h1 className='my-4 text-2xl font-semibold'>Uncaptured bill statements</h1>
      {billStatements?.length ? (
        <>
          <table className='w-full'>
            <tbody>
              {billStatements.map((billStatement: any, index: number) => {
                return (
                  <tr
                    key={billStatement._id}
                    className='cursor-pointer border-b border-border/40 text-center hover:bg-border/20'
                    onClick={() => navigate(`/bill-statements/${billStatement._id}/transactions`)}
                  >
                    <td className='w-1/4 px-2 py-5 text-left'>
                      <div className='flex-1'>
                        <div className='mb-3 flex items-center space-x-3'>
                          <DocumentIcon className='h-5 w-5 text-primary' />
                          <div>
                            <h3 className='text-lg font-medium transition-colors'>
                              {billStatement.title}
                            </h3>
                            <div className='flex items-center space-x-4 text-sm text-muted'>
                              <div className='flex items-center space-x-2'>
                                <CalendarIcon className='h-4 w-4 text-muted' />
                                <span>Created {displayDate(billStatement.createdAt)}</span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <ClockIcon className='h-4 w-4 text-muted' />
                                <span>{getTimeAgo(billStatement.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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

function getTimeAgo(date: string) {
  if (!date) return '';

  const now = new Date();
  const created = new Date(date);
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}
