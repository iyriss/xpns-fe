import { useState, useEffect, useRef } from 'react';
import { ActionFunction, json, LoaderFunction } from '@vercel/remix';
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react';
import { z } from 'zod';
import { Button } from '../../components/Button';
import {
  ChevronDownIcon,
  FolderOpenIcon,
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
    <div className='mx-auto mb-10 h-fit w-full max-w-7xl rounded-3xl border border-border/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl'>
      <div className='flex items-center justify-between'>
        <h1 className='my-4 text-2xl font-semibold'>Groups</h1>

        {!creatingGroup && (
          <Button type='button' onClick={() => setCreatingGroup(true)}>
            Create group
          </Button>
        )}
      </div>

      {creatingGroup && (
        <Form
          className='rounded-lg border border-border bg-white p-5 shadow-sm'
          onSubmit={(e) => {
            e.preventDefault();
            setCreatingGroup(false);
            const formData = new FormData(e.currentTarget);
            submit(formData, { method: 'POST', encType: 'multipart/form-data' });
          }}
        >
          <div className='flex gap-4'>
            <div className='flex w-full flex-col gap-1'>
              <label htmlFor='name' className='flex items-center text-sm text-muted'>
                <UserGroupIcon className='mr-2 inline h-4 w-4' />
                Group name<span className='text-error'> *</span>
              </label>
              <input
                name='name'
                autoComplete='off'
                className='w-full border border-border px-4 py-2 text-sm font-semibold placeholder:font-normal placeholder:text-muted/70'
                required
                placeholder='e.g. Roadtrip to Portland'
              />
            </div>
            <div className='flex w-full flex-col gap-1'>
              <label className='flex items-center text-sm text-muted'>
                <UserPlusIcon className='mr-2 inline h-4 w-4 text-muted' />
                Members<span className='text-error'> *</span>
              </label>

              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className='flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm transition-all hover:border-gray-400'
                >
                  <span>{selectedMembers.length} members selected</span>

                  <ChevronDownIcon className={`h-5 w-5 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {selectedMembers.length > 0 && (
                  <div className='mb-4 mt-2 flex flex-wrap gap-2'>
                    {selectedMembers.map((member) => (
                      <span
                        key={member._id}
                        className='group inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm hover:text-primary'
                      >
                        {member.name}
                        {member._id === currentUser._id && (
                          <span className='ml-1 text-xs text-muted'>(You)</span>
                        )}
                        {member._id !== currentUser._id && (
                          <button
                            type='button'
                            onClick={() => handleMemberToggle(member)}
                            className='ml-2 group-hover:text-primary'
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
                    className='absolute z-10 mt-1 w-full rounded-lg border border-border/40 bg-white py-4 shadow-lg'
                  >
                    <div className='border-b border-border pb-2'>
                      <div className='flex justify-between px-4'>
                        <Button
                          type='button'
                          variant='text'
                          onClick={handleSelectAll}
                          className='text-sm'
                        >
                          Select All
                        </Button>
                        <Button
                          type='button'
                          variant='text'
                          onClick={handleClearAll}
                          className='text-sm'
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                    <div className='max-h-60 overflow-auto'>
                      <label className='flex cursor-not-allowed items-center gap-2 p-2 text-muted hover:bg-border'>
                        <div className='relative h-4 w-4'>
                          <input
                            type='checkbox'
                            checked
                            disabled
                            className='peer h-4 w-4 cursor-not-allowed appearance-none rounded border border-border bg-accent/80 disabled:opacity-50'
                          />
                          <span className='pointer-events-none absolute left-[2px] top-[1px] text-sm text-white opacity-70'>
                            ✓
                          </span>
                        </div>
                        {currentUser.name}
                        <span className='text-xs text-muted'> (You)</span>
                      </label>

                      {otherUsers.map((user: any) => (
                        <label
                          key={user._id}
                          className='group flex cursor-pointer items-center gap-2 p-2 hover:bg-border'
                        >
                          <div className='relative h-4 w-4'>
                            <input
                              type='checkbox'
                              checked={selectedMembers.some((m) => m._id === user._id)}
                              onChange={() => handleMemberToggle(user)}
                              className='peer h-4 w-4 appearance-none rounded border border-border checked:border-accent checked:bg-accent group-hover:border-accent'
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
          <div className='flex h-10 justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              className='w-fit'
              onClick={() => setCreatingGroup(false)}
            >
              Cancel
            </Button>
            <Button type='submit' className='w-fit'>
              Save
            </Button>
          </div>
        </Form>
      )}

      {!!groups?.length ? (
        <div className='my-6 rounded bg-white py-3'>
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
              const lastGroup = idx === groups.length - 1;
              return (
                <Link
                  className={`group block h-fit w-full cursor-pointer py-4 hover:text-primary ${lastGroup ? '' : 'border-b border-border/40'}`}
                  key={name}
                  to={`/groups/${_id}`}
                >
                  <div className='flex items-center gap-2'>
                    <UserGroupIcon className='h-4 w-4 text-accent' />
                    <div className='group-hover:underline'>{name}</div>
                    {user === currentUser._id && (
                      <div className='ml-auto text-sm text-muted'>Your group</div>
                    )}
                  </div>
                  <div className='text-sm text-muted'>
                    {members.length} members
                    {members?.length && (
                      <span>
                        {' '}
                        - (
                        {members
                          .map((member: any) => {
                            const name =
                              member?._id === currentUser._id ? 'You' : (member as any).name;
                            return name;
                          })
                          .join(', ')}
                        )
                      </span>
                    )}
                  </div>
                </Link>
              );
            },
          )}
        </div>
      ) : creatingGroup ? null : (
        <div className='py-12 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
            <FolderOpenIcon className='h-8 w-8 text-muted/60' />
          </div>
          <h3 className='text-lg font-medium'>No groups created yet.</h3>
        </div>
      )}
    </div>
  );
}
