import { ActionFunction } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
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
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate('/upload')}>Upload</button>
      <button onClick={() => navigate('/transactions')}>
        Work on transactions
      </button>
      <button>See past transactions</button>
    </div>
  );
}
