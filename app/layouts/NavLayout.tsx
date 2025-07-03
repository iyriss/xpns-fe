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
      <div className='h-full bg-gray-50'>
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

        <div className='mx-5'>{children}</div>
      </div>
    </div>
  );
};
