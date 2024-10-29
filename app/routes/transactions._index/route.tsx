import { json } from '@remix-run/node';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch('http://localhost:5000/api/transactions');
  if (!res.ok) {
    throw new Response('Failed to fetch transactions', { status: 500 });
  }
  const data = await res.json();
  return json({ transactions: data.transactions });
};

export default function () {
  const { transactions } = useLoaderData() as any;
  return <div>transactions</div>;
}
