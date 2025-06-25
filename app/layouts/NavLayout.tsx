import { Form, useNavigate } from '@remix-run/react';
import { Button } from '../components/Button';

type NavLayoutProps = {
  children: React.ReactNode;
  userName?: string;
};

export const NavLayout: React.FC<NavLayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  return (
    <div className='h-full w-full'>
      <div className='mx-auto h-full w-full'>
        <div className='pointer-events-none fixed inset-0 -z-10'>
          <div className='absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl'></div>
          <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 blur-3xl'></div>
          <div className='absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-purple-100/10 to-indigo-400/10 blur-3xl'></div>
        </div>
        <div className='flex justify-between p-5'>
          <div
            className={`mb-5 cursor-pointer text-4xl font-extrabold ${
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

        <div className='mx-5 h-full'>{children}</div>
      </div>
    </div>
  );
};
