import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { LoaderFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { displayDate } from '../../utils/date-helpers';

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const res = await fetch(`${process.env.API_URL}/api/groups/${params.id}`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });
  const { data } = await res.json();

  const groupRes = await fetch(`${process.env.API_URL}/api/transactions/group/${params.id}`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });
  const { data: groupData } = await groupRes.json();

  const currentUserRes = await fetch(`${process.env.API_URL}/api/auth/me`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });

  const currentUser = await currentUserRes.json();

  return json({ group: data, groupTransactions: groupData, currentUser });
};

export default function () {
  const { group, groupTransactions, currentUser } = useLoaderData<typeof loader>();

  console.log('currentUser', currentUser);
  console.log('group', group);
  console.log('groupTransactions', groupTransactions);

  const isCurrentUser = (id: string) => (currentUser._id === id ? 'You' : null);

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div className='mx-auto w-full max-w-[1020px] rounded p-5'>
      <div className='flex items-center justify-between'>
        <h1 className='my-4 text-2xl font-semibold'>{group.name} group transactions</h1>
        <div className='group relative text-base text-muted'>
          <span className='cursor-pointer'>{group.members.length} members</span>
          {group.members?.length > 0 && (
            <div className='invisible absolute -left-2 top-full z-10 mt-1 w-max rounded bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100'>
              {group.members.map((member: any) => (
                <div key={member._id} className='my-2 min-w-16'>
                  <span className='mr-2 inline-block h-1 w-1 rounded-full bg-current align-middle' />
                  {member.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {groupTransactions.map((transaction: any) => {
        return (
          <div key={transaction._id} className={`my-3 h-fit w-full rounded bg-white px-6 py-3`}>
            <div className='flex items-center justify-between'>
              <EllipsisVerticalIcon className='-transform-y-1/2 invisible absolute right-0 size-6 h-full text-muted group-hover:visible' />
              <div className='flex w-full items-center gap-4'>
                <div className='text-sm text-[#38917D]'>
                  <div className='text-xl font-semibold'>
                    {displayDate(transaction.date)?.split(' ')[1]}
                  </div>
                  <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
                </div>
                <div>{transaction.subdescription.trim() || transaction.description}</div>
              </div>
              <div className='flex w-full items-center justify-center'>
                <div className='text-center'>
                  <span className='mr-2'>
                    {isCurrentUser(transaction.payer._id) || transaction.payer.name} paid
                  </span>
                  ${Math.abs(Number(transaction.amount) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
