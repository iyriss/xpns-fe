import { Form, useNavigate } from '@remix-run/react';
import { Button } from '../components/Button';

type NavLayoutProps = {
  children: React.ReactNode;
  userName?: string;
};

export const NavLayout: React.FC<NavLayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  return (
    <div className='relative min-h-screen w-full'>
      <div className='fixed inset-0 -z-10 bg-gray-50' />

      <div className='fixed left-0 right-0 top-0 z-10 flex h-[80px] justify-between bg-gray-50 p-5 shadow-sm'>
        <div
          className={`cursor-pointer text-4xl font-extrabold ${
            userName ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={() => (userName ? navigate('/') : null)}
        >
          xpns
        </div>
        {userName && (
          <Form className='flex items-center gap-8' method='post' action='/logout'>
            {userName && <div>Hi, {userName}</div>}
            <Button variant='text' type='submit'>
              Logout
            </Button>
          </Form>
        )}
      </div>

      <div className='relative top-[80px] mx-5'>{children}</div>
    </div>
  );
};
