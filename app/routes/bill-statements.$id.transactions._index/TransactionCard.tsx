import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Form, json, useNavigate, useSubmit } from '@remix-run/react';
import { useRef, useState } from 'react';
import CustomAllocationForm from './CustomAllocationForm';
import { Button } from '../../components/Button';
import { displayDate } from '../../utils/date-helpers';

type TransactionCardProps = {
  transaction: any;
  selected: boolean;
  groups: any[];
  users: any[];
  defaultGroup: string;
  currentUser: string;
  billStatementId: string;
  onTransactionSelected: (id: string) => void;
};

enum Allocation {
  HALF = 'half',
  MINE = 'mine',
  PARTNER = 'partner',
  CUSTOM = 'custom',
}

function divideAmountEqually(membersCount: number) {
  let basePercentage = Math.floor(100 / membersCount);
  let remainder = 100 % membersCount;

  return Array.from(
    { length: membersCount },
    (_, i) => basePercentage + (i < remainder ? 1 : 0), // Add 'remainder'
  );
}

export default function TransactionCard({
  transaction,
  selected,
  groups,
  users,
  defaultGroup,
  currentUser,
  billStatementId,
  onTransactionSelected,
}: TransactionCardProps) {
  function handleGroupSelected(e: any) {
    setGroupSelected(e.target.value);
  }

  const [groupSelected, setGroupSelected] = useState('');
  const [allocationType, setAllocationType] = useState<Allocation>(Allocation.MINE);
  const [allocationBase, setAllocationBase] = useState<'fixed' | 'percentage'>('fixed');

  const formRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  const navigate = useNavigate();

  const currentGroup = groupSelected || defaultGroup;
  const currentGroupMembers = groups.find((group) => group._id === currentGroup)?.members;

  const getAllocations = () => {
    const selects = formRef.current?.querySelectorAll('select[name^="user-"]');
    const inputs = formRef.current?.querySelectorAll('input[name^="amount-"]');

    return Array.from(selects || []).map((select, index) => ({
      userId: (select as HTMLSelectElement).value,
      amount: Number((inputs?.[index] as HTMLInputElement).value),
    }));
  };

  function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const transactionId = formData.get('transaction');
    const groupId = formData.get('group');
    const allocationType = formData.get('allocation');

    const transactionData = {
      transactionId: transactionId as string,
      group: groupId,
      allocation: {
        method: 'percentage',
        members: [],
      },
    } as {
      group: string;
      allocation: {
        method: 'percentage' | 'fixed';
        members: {
          user: string;
          portion: number;
        }[];
      };
    };

    switch (allocationType) {
      case Allocation.MINE:
        transactionData.allocation.method = 'percentage';
        transactionData.allocation.members = [
          {
            user: currentUser,
            portion: 100,
          },
        ];
        break;

      case Allocation.HALF:
        // TODO: make sure that amount equals 100
        transactionData.allocation.method = 'percentage';
        const portion = divideAmountEqually(currentGroupMembers.length);
        transactionData.allocation.members = currentGroupMembers.map(
          (member: any, index: number) => ({
            user: member,
            portion: portion[index],
          }),
        );
        break;

      case Allocation.PARTNER:
        const partnerId = formData.get('partner-id');
        transactionData.allocation.method = 'percentage';
        transactionData.allocation.members = [
          {
            user: partnerId as string,
            portion: 100,
          },
        ];
        break;

      case Allocation.CUSTOM:
        const allocations = getAllocations();
        if (allocationBase === 'percentage') {
          transactionData.allocation.method = 'percentage';
          transactionData.allocation.members = allocations.map(({ userId, amount }) => ({
            user: userId,
            portion: amount,
          }));
        } else {
          const total = allocations.reduce((sum, { amount }) => sum + amount * 100, 0);

          if (total !== transaction.amount) {
            throw new Error('Total amount does not match transaction amount');
          }
          transactionData.allocation.method = 'fixed';
          transactionData.allocation.members = allocations.map(({ userId, amount }) => ({
            user: userId,
            portion: amount * 100,
          }));
        }
        break;
    }

    formData.append('data', JSON.stringify(transactionData));
    submit(formData, {
      method: 'POST',
      action: `/bill-statements/${billStatementId}/transactions`,
    });
  }

  function handleClick() {
    if (transaction.type === 'Debit') {
      onTransactionSelected(transaction._id);
    }
  }

  return (
    <Form
      key={transaction._id}
      className={`group relative h-fit w-full border-b border-border py-4 ${transaction.type === 'Debit' ? 'cursor-pointer' : 'bg-border/70 opacity-40'}`}
      onClick={handleClick}
      onSubmit={handleSubmit}
    >
      {selected && (
        <div className='pointer-events-none absolute -inset-x-8 inset-y-0 h-full rounded border border-dashed border-primary' />
      )}
      <div className='relative'>
        <div
          className={`absolute -inset-x-4 -inset-y-2 ${selected ? 'rounded bg-primary/20' : ''}`}
        />

        <input hidden type='text' defaultValue={transaction._id} name='transaction' />
        <div className='flex items-center justify-between'>
          <EllipsisVerticalIcon className='-transform-y-1/2 invisible absolute right-0 size-6 h-full text-muted group-hover:visible' />
          <div className='flex w-full items-center gap-4'>
            <div className='text-sm text-[#38917D]'>
              <div className='text-xl font-semibold'>
                {displayDate(transaction.date)?.split(' ')[1]}
              </div>
              <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
            </div>
            <div>{transaction.subdescription.trim() || transaction.description}</div>
          </div>
          <div className='flex w-full items-center justify-center'>
            <div className='text-center'>
              <span className='mr-4 font-semibold'>
                {transaction.type === 'Credit' ? 'Deposit' : 'Paid'}
              </span>
              ${Math.abs(Number(transaction.amount) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      {transaction.type === 'Credit' && <div className='w-full' />}

      {selected && (
        <>
          <div className='mt-4 flex w-full items-center gap-4 pt-4'>
            <div className='min-w-[100px]'>
              Group<span className='text-error'>*</span>
            </div>
            {groups.length > 0 ? (
              <select
                name='group'
                required
                className='h-10 min-w-[400px] border px-4 py-2'
                value={currentGroup}
                onChange={handleGroupSelected}
              >
                <option value={''} className='!text-muted'>
                  Select a group
                </option>
                {groups.map((group: any) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className='text-muted'>
                <Button
                  variant='text'
                  className='!inline !px-0'
                  onClick={() => navigate('/groups')}
                >
                  Create a group
                </Button>
                <span> to start tracking your expenses.</span>
              </div>
            )}
          </div>

          {!!currentGroupMembers?.length ? (
            <div className='mt-4 flex w-full items-center gap-4 py-4'>
              <div className='flex min-w-[100px]'>
                Allocation<span className='text-error'> *</span>
              </div>

              <div className='flex w-full justify-between gap-4'>
                <label className='flex cursor-pointer items-center gap-2'>
                  <div className='relative'>
                    <input
                      type='radio'
                      id={Allocation.MINE}
                      name='allocation'
                      value={Allocation.MINE}
                      checked={
                        allocationType === Allocation.MINE ||
                        (currentGroupMembers.length === 1 && currentGroupMembers[0] === currentUser)
                      }
                      onChange={() => setAllocationType(Allocation.MINE)}
                      className='peer sr-only'
                    />
                    <div
                      className={`relative h-4 w-4 rounded-full border ${
                        allocationType === Allocation.MINE ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${
                          allocationType === Allocation.MINE ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>
                  </div>
                  <span>
                    Me <span className='text-sm text-muted'>(Only member in this group)</span>
                  </span>
                </label>

                {currentGroupMembers.length > 1 && (
                  <>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <div className='relative'>
                        <input
                          type='radio'
                          id={Allocation.HALF}
                          name='allocation'
                          value={Allocation.HALF}
                          checked={allocationType === Allocation.HALF}
                          onChange={() => setAllocationType(Allocation.HALF)}
                          className='peer sr-only'
                        />
                        <div
                          className={`relative h-4 w-4 rounded-full border ${
                            allocationType === Allocation.HALF
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${
                              allocationType === Allocation.HALF ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>
                      </div>
                      <span>
                        Divided equally{' '}
                        <span className='text-sm text-muted'>(÷ {currentGroupMembers.length})</span>
                      </span>
                    </label>

                    <label className='flex cursor-pointer items-center gap-2'>
                      <div className='relative'>
                        <input
                          type='radio'
                          id={Allocation.PARTNER}
                          name='allocation'
                          value={Allocation.PARTNER}
                          checked={allocationType === Allocation.PARTNER}
                          onChange={() => setAllocationType(Allocation.PARTNER)}
                          className='peer sr-only'
                        />
                        <div
                          className={`relative h-4 w-4 rounded-full border ${
                            allocationType === Allocation.PARTNER
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${
                              allocationType === Allocation.PARTNER ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>
                      </div>
                      <span>
                        Paid for
                        <select required name='partner-id' className='px-2 py-1'>
                          {users
                            .filter((user: any) => user._id !== currentUser)
                            .map((user: any) => (
                              <option key={user._id} value={user._id}>
                                {user.name}
                              </option>
                            ))}
                        </select>
                      </span>
                    </label>

                    <label className='flex cursor-pointer items-center gap-2'>
                      <div className='relative'>
                        <input
                          type='radio'
                          id={Allocation.CUSTOM}
                          name='allocation'
                          value={Allocation.CUSTOM}
                          checked={allocationType === Allocation.CUSTOM}
                          onChange={() => {
                            onTransactionSelected(transaction._id);
                            setAllocationType(Allocation.CUSTOM);
                          }}
                          className='peer sr-only'
                        />
                        <div
                          className={`relative h-4 w-4 rounded-full border ${
                            allocationType === Allocation.CUSTOM
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${
                              allocationType === Allocation.CUSTOM ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>
                      </div>
                      <span>Custom</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {allocationType === Allocation.CUSTOM && (
            <CustomAllocationForm
              formRef={formRef}
              allocationBase={allocationBase}
              amount={Math.abs(Number(transaction.amount) / 100)}
              onAllocationBaseChange={(e) => {
                setAllocationBase(e);
              }}
              users={users}
            />
          )}

          <div className='flex items-center justify-end gap-2 py-4'>
            <Button type='submit' disabled={!currentGroup}>
              Save
            </Button>
            <Button
              variant='outline'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onTransactionSelected('');
                setGroupSelected('');
                setAllocationType(Allocation.MINE);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
