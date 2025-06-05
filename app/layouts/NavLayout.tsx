import { Form, useNavigate } from '@remix-run/react';
import { Button } from '../components/Button';

type NavLayoutProps = {
  children: React.ReactNode;
  userName?: string;
};

export const NavLayout: React.FC<NavLayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  return (
    <div className='h-full min-h-screen w-full p-5'>
      <div className='mx-auto w-full'>
        <div className='mb-5 flex justify-between'>
          <div
            className='mb-5 cursor-pointer text-4xl font-extrabold'
            onClick={() => navigate('/')}
          >
            xpns
          </div>
          <Form className='flex items-center gap-8' method='post' action='/logout'>
            {userName && <div>Hi, {userName}</div>}
            <Button variant='text' type='submit'>
              Logout
            </Button>
          </Form>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
