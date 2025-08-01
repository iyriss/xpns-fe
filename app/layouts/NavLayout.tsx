import { Form, useNavigate, useLocation } from '@remix-run/react';
import { Button } from '../components/Button';
import {
  DocumentCurrencyDollarIcon,
  TagIcon,
  UserGroupIcon,
  TableCellsIcon,
  HomeIcon,
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

type NavLayoutProps = {
  children: React.ReactNode;
  userName?: string;
};

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  {
    name: 'Bank statements',
    path: '/bank-statements',
    icon: DocumentCurrencyDollarIcon,
  },
  {
    name: 'Mapping templates',
    path: '/mapping-templates',
    icon: TableCellsIcon,
  },
  { name: 'Categories', path: '/categories', icon: TagIcon },
  { name: 'Groups', path: '/groups', icon: UserGroupIcon },
];

export const NavLayout: React.FC<NavLayoutProps> = ({ children, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    if (!isDashboard) {
      const timer = setTimeout(() => setShowNav(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowNav(false);
    }
  }, [isDashboard]);

  return (
    <div className='relative min-h-screen w-full'>
      <div className='fixed inset-0 -z-10 bg-gray-50' />

      <div
        className={`fixed left-0 right-0 top-0 z-20 flex h-[80px] justify-between p-5 transition-all duration-300 ease-in-out ${
          showNav ? 'bg-transparent' : 'bg-gray-50'
        }`}
      >
        <div
          className={`cursor-pointer text-4xl font-extrabold transition-all duration-300 ease-in-out ${
            userName ? 'cursor-pointer' : 'cursor-default'
          } text-gray-900`}
          onClick={() => (userName ? navigate('/') : null)}
        >
          xpns
        </div>
        {userName && !showNav && (
          <Form className='flex items-center gap-8' method='post' action='/logout'>
            {userName && <div>Hey, {userName}</div>}
            <Button variant='text' type='submit' className='flex items-center gap-2'>
              <ArrowRightStartOnRectangleIcon className='h-5 w-5' />
              Logout
            </Button>
          </Form>
        )}
      </div>
      {userName && (
        <div
          className={`fixed left-0 top-0 z-10 h-screen w-64 rounded-r-[40px] border-r border-gray-200 bg-[#f6f9fe] shadow-sm transition-all duration-300 ease-in-out ${
            showNav ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex h-full flex-col'>
            <div className='mt-8 flex-1 px-6 pt-[80px]'>
              <h3 className='mb-2 text-sm font-medium uppercase tracking-wider text-gray-500'>
                Navigation
              </h3>

              <nav className='space-y-2'>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path.slice(1)?.length > 0 && location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`group relative flex w-full items-center justify-between rounded-lg py-2.5 transition-all duration-200 ${
                        isActive ? 'text-primary-active' : ''
                      }`}
                    >
                      <div
                        className={`absolute -inset-x-3 top-0 -z-10 h-full w-full rounded-lg opacity-0 transition-opacity duration-200 group-hover:bg-[#edeffb] group-hover:opacity-100 ${
                          isActive ? 'opacity-100' : ''
                        }`}
                      />
                      <div className='flex items-center gap-3'>
                        <Icon className='h-5 w-5' />
                        <span>{item.name}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {userName && showNav && (
              <div className='px-6 pb-10 pt-6'>
                <Form method='post' className='space-y-5' action='/logout'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-2xl'>
                      <UserIcon className='h-5 w-5 text-gray-700' />
                    </div>
                    <div className='text-gray-700'>{userName}</div>
                  </div>
                  <Button variant='text' type='submit' className='flex items-center gap-2'>
                    <ArrowRightStartOnRectangleIcon className='h-5 w-5' />
                    Logout
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        className={`relative top-[80px] transition-all duration-300 ease-in-out ${
          showNav && userName ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className='mx-5'>{children}</div>
      </div>
    </div>
  );
};
