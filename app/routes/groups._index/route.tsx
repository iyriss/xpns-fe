import { useState, useEffect, useRef } from 'react';
import { ActionFunction, json, LoaderFunction } from '@vercel/remix';
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react';
import { z } from 'zod';
import { Button } from '../../components/Button';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  FolderOpenIcon,
  PlusIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/groups`, {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });
  const jsonRes = await res.json();

  const users = await fetch(`${process.env.API_URL}/api/users`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
  });

  const { data, currentUser } = await users.json();

  return json({ groups: jsonRes.data, users: data, currentUser });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const GroupSchema = z.object({
    name: z.string(),
    members: z
      .string()
      .transform((str) => JSON.parse(str))
      .pipe(z.string().array().min(1)),
  });

  const { name, members } = GroupSchema.parse(Object.fromEntries(formData));

  const res = await fetch(`${process.env.API_URL}/api/groups`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('Cookie') || '' },
    body: JSON.stringify({ name, members }),
  });

  const { data } = await res.json();

  if (res.statusText === 'OK') {
    return json({ success: true });
  } else {
    return json({ success: false });
  }
};

export default function () {
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Array<{ _id: string; name: string }>>([]);
  const { groups, users, currentUser } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedMembers([{ _id: currentUser._id, name: currentUser.name }]);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const otherUsers = users?.filter((user: any) => user._id !== currentUser._id) || [];

  const handleMemberToggle = (member: { _id: string; name: string }) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m._id === member._id);
      if (isSelected) {
        return prev.filter((m) => m._id !== member._id);
      }
      return [...prev, member];
    });
  };

  const handleSelectAll = () => {
    setSelectedMembers([{ _id: currentUser._id, name: currentUser.name }, ...otherUsers]);
  };

  const handleClearAll = () => {
    setSelectedMembers([{ _id: currentUser._id, name: currentUser.name }]);
  };

  return (
    <div className='mx-auto max-w-6xl px-6 py-12'>
      <div className='mb-12'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-light text-gray-900'>Groups</h1>
            <p className='mt-2 text-gray-500'>Create and manage expense groups</p>
          </div>
          {!!groups?.length && !creatingGroup && (
            <Button type='button' onClick={() => setCreatingGroup(true)} className='!text-sm'>
              <PlusIcon className='mr-1 h-4 w-4' />
              Create group
            </Button>
          )}
        </div>
      </div>

      <div className='space-y-8'>
        {creatingGroup && (
          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
            <div className='mb-6 flex items-center space-x-4'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-primary'>
                <UserGroupIcon className='h-7 w-7 text-primary' />
              </div>
              <div>
                <h2 className='text-xl font-medium text-gray-900'>Create New Group</h2>
                <p className='text-sm text-gray-500'>
                  Set up a group to split expenses with others
                </p>
              </div>
            </div>

            <Form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault();
                setCreatingGroup(false);
                const formData = new FormData(e.currentTarget);
                submit(formData, { method: 'POST', encType: 'multipart/form-data' });
              }}
            >
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label
                    htmlFor='name'
                    className='mb-2 block flex items-center text-sm font-medium text-gray-700'
                  >
                    <UserGroupIcon className='mr-2 h-4 w-4 text-gray-500' />
                    Group name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    name='name'
                    id='name'
                    autoComplete='off'
                    className='w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
                    required
                    placeholder='Roadtrip to Portland'
                  />
                </div>
                <div>
                  <label className='mb-2 block flex items-center text-sm font-medium text-gray-700'>
                    <UserPlusIcon className='mr-2 h-4 w-4 text-gray-500' />
                    Members <span className='text-red-500'>*</span>
                  </label>

                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      className='flex h-12 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500'
                    >
                      <span>{selectedMembers.length} members selected</span>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {selectedMembers.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {selectedMembers.map((member) => (
                          <span
                            key={member._id}
                            className='inline-flex items-center rounded-full px-3 py-1 text-sm text-primary-active'
                          >
                            {member.name}
                            {member._id === currentUser._id && (
                              <span className='ml-1 text-xs text-purple-500'>(You)</span>
                            )}
                            {member._id !== currentUser._id && (
                              <button
                                type='button'
                                onClick={() => handleMemberToggle(member)}
                                className='ml-2 hover:text-purple-800'
                              >
                                <XMarkIcon className='h-4 w-4' />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {isDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className='absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-4 shadow-lg'
                      >
                        <div className='border-b border-gray-200 pb-2'>
                          <div className='flex justify-between px-4'>
                            <button
                              type='button'
                              onClick={handleSelectAll}
                              className='text-sm font-medium text-primary hover:text-primary-active'
                            >
                              Select All
                            </button>
                            <button
                              type='button'
                              onClick={handleClearAll}
                              className='text-sm font-medium text-gray-600 hover:text-gray-700'
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                        <div className='max-h-60 overflow-auto'>
                          <label className='flex cursor-not-allowed items-center gap-3 p-3 text-gray-500'>
                            <div className='relative h-4 w-4'>
                              <input
                                type='checkbox'
                                checked
                                disabled
                                className='peer h-4 w-4 cursor-not-allowed appearance-none rounded border border-gray-300 bg-primary disabled:opacity-50'
                              />
                              <span className='pointer-events-none absolute left-[2px] top-[1px] text-sm text-white opacity-70'>
                                ✓
                              </span>
                            </div>
                            {currentUser.name}
                            <span className='text-xs text-gray-400'> (You)</span>
                          </label>

                          {otherUsers.map((user: any) => (
                            <label
                              key={user._id}
                              className='group flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-50'
                            >
                              <div className='relative h-4 w-4'>
                                <input
                                  type='checkbox'
                                  checked={selectedMembers.some((m) => m._id === user._id)}
                                  onChange={() => handleMemberToggle(user)}
                                  className='peer h-4 w-4 appearance-none rounded border border-gray-300 checked:border-primary checked:bg-primary group-hover:border-primary'
                                />
                                <span className='pointer-events-none absolute left-[2px] top-[1px] text-sm text-white opacity-0 peer-checked:opacity-100'>
                                  ✓
                                </span>
                              </div>
                              {user.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <input
                      type='hidden'
                      name='members'
                      value={JSON.stringify(selectedMembers.map((m) => m._id))}
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-end gap-3 border-t border-gray-200 pt-4'>
                <Button type='button' onClick={() => setCreatingGroup(false)} variant='outline'>
                  Cancel
                </Button>
                <Button type='submit'>Create Group</Button>
              </div>
            </Form>
          </div>
        )}

        {!!groups?.length ? (
          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-medium text-gray-900'>Groups you own or joined</h2>
              <div className='text-sm text-gray-500'>
                {groups.length} group{groups.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className='space-y-4'>
              {groups.map(
                (
                  {
                    name,
                    _id,
                    members,
                    user,
                  }: { name: string; _id: string; members: string[]; user: string },
                  idx: number,
                ) => {
                  const isOwner = user === currentUser._id;
                  const memberNames =
                    members?.map((member: any) => {
                      const name = member?._id === currentUser._id ? 'You' : (member as any).name;
                      return name;
                    }) || [];

                  return (
                    <Link
                      key={_id}
                      to={`/groups/${_id}`}
                      className='group block cursor-pointer rounded-xl border border-gray-100 p-6 transition-all hover:border-gray-200 hover:shadow-md'
                    >
                      <div className='flex items-start gap-4'>
                        <div className='min-w-0 flex-1'>
                          <div className='mb-2 flex items-center'>
                            <div className='mr-5 min-w-0'>
                              <h3 className='truncate text-lg font-semibold text-gray-900'>
                                {name}
                              </h3>
                            </div>
                            <span className='items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700'>
                              {isOwner ? 'Owner' : 'Member'}
                            </span>
                          </div>

                          <div className='mb-3 flex items-center justify-between gap-4 text-sm text-gray-600'>
                            <span className='flex items-center gap-1'>
                              <UserGroupIcon className='h-4 w-4 text-gray-400' />
                              {members.length} member{members.length !== 1 ? 's' : ''}
                            </span>
                            <div className='hidden text-sm text-gray-400 group-hover:block group-hover:text-primary'>
                              <ArrowRightIcon className='h-4 w-4' />
                            </div>
                          </div>

                          {memberNames.length > 0 && (
                            <p className='text-sm text-gray-700'>
                              <span className='font-medium text-gray-900'>Members:</span>{' '}
                              <span className='text-gray-600'>{memberNames.join(', ')}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        ) : creatingGroup ? null : (
          <div className='rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
              <FolderOpenIcon className='h-10 w-10 text-gray-400' />
            </div>
            <h3 className='mb-2 text-xl font-light text-gray-900'>No groups created yet</h3>
            <p className='mb-6 text-gray-500'>
              Create your first group to start splitting expenses
            </p>
            <Button onClick={() => setCreatingGroup(true)} className='mx-auto'>
              Create group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
