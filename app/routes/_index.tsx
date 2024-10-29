import { ActionFunction } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';

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
