import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '../../components/Button';

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

  useEffect(() => {
    setSelectedMembers([{ _id: currentUser._id, name: currentUser.name }]);
  }, [currentUser]);

  const otherUsers = users?.filter((user) => user._id !== currentUser._id) || [];

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
    <div className='mx-auto w-full max-w-[1020px]'>
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
          className='bg-white p-5'
          onSubmit={(e) => {
            e.preventDefault();
            setCreatingGroup(false);
            const formData = new FormData(e.currentTarget);
            submit(formData, { method: 'POST', encType: 'multipart/form-data' });
          }}
        >
          <div className='flex gap-4'>
            <div className='flex w-full flex-col gap-1'>
              <label htmlFor='name'>
                Group name<span className='text-error'> *</span>
              </label>
              <input
                name='name'
                autoComplete='off'
                className='w-full border border-border px-4 py-2 font-semibold placeholder:font-normal'
                required
                placeholder='e.g. Roadtrip to Portland'
              />
            </div>
            <div className='flex w-full flex-col gap-1'>
              <label>
                Members<span className='text-error'> *</span>
              </label>

              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className='flex w-full items-center justify-between rounded border border-border px-4 py-2 text-left hover:bg-gray-50'
                >
                  <span>{selectedMembers.length} members selected</span>
                  <svg
                    className={`h-5 w-5 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {selectedMembers.length > 0 && (
                  <div className='mb-4 mt-2 flex flex-wrap gap-2'>
                    {selectedMembers.map((member) => (
                      <span
                        key={member._id}
                        className='group inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm'
                      >
                        {member.name}
                        {member._id !== currentUser._id && (
                          <button
                            type='button'
                            onClick={() => handleMemberToggle(member)}
                            className='ml-2 text-gray-500 hover:text-gray-700 group-hover:text-primary'
                          >
                            x
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {isDropdownOpen && (
                  <div className='absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg'>
                    <div className='border-b border-gray-200 p-2'>
                      <div className='flex justify-between'>
                        <Button type='button' variant='text' onClick={handleSelectAll}>
                          Select All
                        </Button>
                        <Button type='button' variant='text' onClick={handleClearAll}>
                          Clear All
                        </Button>
                      </div>
                    </div>
                    <div className='max-h-60 overflow-auto'>
                      <label className='flex cursor-not-allowed items-center gap-2 p-2 text-muted hover:bg-gray-50'>
                        <div className='relative h-4 w-4'>
                          <input
                            type='checkbox'
                            checked
                            disabled
                            className='peer h-4 w-4 cursor-not-allowed appearance-none rounded border border-gray-300 disabled:opacity-50'
                          />
                          <svg
                            className='pointer-events-none absolute left-0 top-[2px] h-4 w-4 opacity-70'
                            viewBox='0 0 16 16'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <rect width='16' height='16' fill='#38917D' rx='2' />
                            <path
                              d='M12 5L6.5 10.5L4 8'
                              stroke='white'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                        {currentUser.name} (You)
                      </label>

                      {otherUsers.map((user) => (
                        <label
                          key={user._id}
                          className='flex cursor-pointer items-center gap-2 p-2 hover:bg-gray-50'
                        >
                          <div className='relative h-4 w-4'>
                            <input
                              type='checkbox'
                              checked={selectedMembers.some((m) => m._id === user._id)}
                              onChange={() => handleMemberToggle(user)}
                              className='peer h-4 w-4 appearance-none rounded border border-gray-300 checked:border-primary checked:bg-primary'
                            />
                            <svg
                              className='pointer-events-none absolute left-0 top-[2px] h-4 w-4 opacity-0 peer-checked:opacity-100'
                              viewBox='0 0 16 16'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M12 5L6.5 10.5L4 8'
                                stroke='white'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
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
            <Button type='submit' className='w-fit'>
              Save
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-fit'
              onClick={() => setCreatingGroup(false)}
            >
              Cancel
            </Button>
          </div>
        </Form>
      )}

      {!!groups?.length ? (
        <div className='my-6 rounded bg-white px-6 py-3'>
          {groups.map(({ name }: { name: string }, idx: number) => {
            const lastGroup = idx === groups.length - 1;
            return (
              <div
                className={`h-fit w-full cursor-pointer py-4 hover:text-[#38917D] ${lastGroup ? '' : 'border-b border-border/40'}`}
              >
                •&nbsp;&nbsp;
                {name}
              </div>
            );
          })}
        </div>
      ) : creatingGroup ? null : (
        <div className='my-6 rounded bg-white px-6 py-3'>
          <div className='text-muted'>No groups created yet.</div>
        </div>
      )}
    </div>
  );
}
