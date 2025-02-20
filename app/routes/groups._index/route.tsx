import { ActionFunction, json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '../../components/Button';

const members = [
  { name: 'Sally', _id: '67281eae57e23c4dda65f10c' },
  { name: 'John', _id: '67281eba57e23c4dda65f10d' },
];

export const loader: LoaderFunction = async ({ request, context }) => {
  const res = await fetch(`${process.env.API_URL}/api/groups`);
  const jsonRes = await res.json();
  return json({ groups: jsonRes.data });
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
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, members }),
  });
  const { data } = await res.json();
  console.log('datal', data);
  if (res.statusText === 'OK') {
    return json({ success: true });
  } else {
    return json({ success: false });
  }
};

export default function () {
  const [creatingGroup, setCreatingGroup] = useState(false);
  const { groups } = useLoaderData<typeof loader>();
  console.log('groups :>> ', groups);
  const submit = useSubmit();

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
          className='flex items-end gap-8 bg-white p-5'
          onSubmit={(e) => {
            e.preventDefault();
            setCreatingGroup(false);
            const formData = new FormData(e.currentTarget);
            const checkedCheckboxes = document.querySelectorAll(
              'input[name="members"]:checked',
            ) as NodeListOf<HTMLInputElement>;
            const idsArray = Array.from(checkedCheckboxes).map((checkbox) => checkbox.value);
            formData.set('members', JSON.stringify(idsArray));
            submit(formData, { method: 'POST', encType: 'multipart/form-data' });
          }}
        >
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
            <div className='flex gap-4'>
              {members.map(({ name, _id }) => (
                <label key={_id} className='flex cursor-pointer items-center gap-1'>
                  <input type='checkbox' name='members' value={_id} />
                  {name}
                </label>
              ))}
            </div>
          </div>
          <div className='flex h-10 gap-2'>
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
      <div className='my-6 rounded bg-white px-6 py-3'>
        {!!groups.length &&
          groups.map(({ name }: { name: string }, idx: number) => {
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
    </div>
  );
}
