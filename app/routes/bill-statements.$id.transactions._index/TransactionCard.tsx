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
  EQUALLY = 'equally',
  MINE = 'mine',
  PEER = 'peer',
  CUSTOM = 'custom',
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

  const ungroupedDebitSelected = transaction.type === 'Debit' && selected && !transaction?.group;
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
          amount: number;
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
            amount: transaction.amount,
          },
        ];
        break;

      case Allocation.EQUALLY:
        transactionData.allocation.method = 'fixed';
        const totalAmount = transaction.amount;
        const minimumAmountPerPerson = Math.floor(totalAmount / currentGroupMembers.length);
        const extraCentsToDistribute = totalAmount % currentGroupMembers.length;

        transactionData.allocation.members = currentGroupMembers.map(
          (member: any, index: number) => {
            // If this person should get an extra cent (based on their position in the list)
            const getsExtraCent = index < extraCentsToDistribute;
            // Their final amount is either minimum + 1 cent or just minimum
            const finalAmount = getsExtraCent ? minimumAmountPerPerson + 1 : minimumAmountPerPerson;

            return {
              user: member,
              portion: finalAmount,
              amount: finalAmount,
            };
          },
        );
        break;

      case Allocation.PEER:
        const peerId = formData.get('peer-id');
        transactionData.allocation.method = 'percentage';
        transactionData.allocation.members = [
          {
            user: peerId as string,
            portion: 100,
            amount: transaction.amount,
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
            amount: transaction.amount * amount,
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
            amount: amount * 100,
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
    onTransactionSelected(transaction._id);
  }

  function handleOptionsSelected(e: any) {
    e.stopPropagation();
    console.log('options selected');
    // todo: show dropdown
  }

  return (
    <Form
      key={transaction._id}
      className={`group relative h-fit w-full border-b border-border py-4 ${transaction.type === 'Credit' || transaction?.group ? 'bg-border/70' : 'cursor-pointer'}`}
      onClick={handleClick}
      onSubmit={handleSubmit}
    >
      {transaction.group && (
        <div className='absolute right-6 top-3 italic'>
          <span>In group: </span>
          <span>{groups.find((group) => group._id === transaction.group)?.name}</span>
        </div>
      )}

      {ungroupedDebitSelected && (
        <div className='pointer-events-none absolute -inset-x-8 inset-y-0 h-full rounded border border-dashed border-accent' />
      )}

      <div className='relative'>
        <div
          className={`absolute -inset-x-4 -inset-y-2 ${ungroupedDebitSelected ? 'rounded bg-accent/20' : ''}`}
        />

        <input hidden type='text' defaultValue={transaction._id} name='transaction' />
        <div className='flex items-center justify-between'>
          <EllipsisVerticalIcon
            onClick={handleOptionsSelected}
            className='-transform-y-1/2 invisible absolute right-0 z-10 size-6 h-full cursor-pointer text-muted hover:text-primary group-hover:visible'
          />
          <div
            className={`flex w-full items-center gap-4 ${transaction.type === 'Credit' || !!transaction?.group ? 'opacity-50' : ''}`}
          >
            <div className='text-sm text-accent'>
              <div className='text-xl font-semibold'>
                {displayDate(transaction.date)?.split(' ')[1]}
              </div>
              <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
            </div>
            <div>{transaction.subdescription.trim() || transaction.description}</div>
          </div>
          <div
            className={`flex w-full items-center justify-center ${transaction.type === 'Credit' || !!transaction?.group ? 'opacity-50' : ''}`}
          >
            <div className='text-center'>
              <span className='mr-4 font-semibold'>
                {transaction.type === 'Credit' ? 'Deposit' : 'Paid'}
              </span>
              ${(Number(transaction.amount) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      {transaction.type === 'Credit' && <div className='w-full' />}

      {ungroupedDebitSelected && (
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
                          id={Allocation.EQUALLY}
                          name='allocation'
                          value={Allocation.EQUALLY}
                          checked={allocationType === Allocation.EQUALLY}
                          onChange={() => setAllocationType(Allocation.EQUALLY)}
                          className='peer sr-only'
                        />
                        <div
                          className={`relative h-4 w-4 rounded-full border ${
                            allocationType === Allocation.EQUALLY
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${
                              allocationType === Allocation.EQUALLY ? 'opacity-100' : 'opacity-0'
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
                          id={Allocation.PEER}
                          name='allocation'
                          value={Allocation.PEER}
                          checked={allocationType === Allocation.PEER}
                          onChange={() => setAllocationType(Allocation.PEER)}
                          className='peer sr-only'
                        />
                        <div
                          className={`relative h-4 w-4 rounded-full border ${
                            allocationType === Allocation.PEER
                              ? 'border-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ${
                              allocationType === Allocation.PEER ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>
                      </div>
                      <span>
                        Paid for
                        <select required name='peer-id' className='px-2 py-1'>
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
              amount={Number(transaction.amount) / 100}
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
