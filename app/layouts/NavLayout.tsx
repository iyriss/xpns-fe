import { useNavigate } from '@remix-run/react';

type NavLayoutProps = {
  children: React.ReactNode;
};

export const NavLayout: React.FC<NavLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className='h-full min-h-screen w-full p-5'>
      <div className='mx-auto w-full'>
        <div className='mb-5 cursor-pointer text-4xl font-extrabold' onClick={() => navigate('/')}>
          xpns
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
