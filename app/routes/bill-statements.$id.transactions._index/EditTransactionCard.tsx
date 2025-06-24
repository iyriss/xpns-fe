import { useRef, useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Form, useLocation, useNavigate, useSubmit } from '@remix-run/react';
import { toast } from 'sonner';
import CustomAllocationForm from './CustomAllocationForm';
import { Button } from '../../components/Button';
import { displayDate } from '../../utils/date-helpers';
import Dropdown from './TransactionDropdown';

type EditTransactionCardProps = {
  transaction: any;
  selected: boolean;
  groups: any[];
  defaultGroup: string;
  currentUser: string;
  billStatementId?: string;
  onTransactionSelected: (id: string) => void;
};

enum Allocation {
  EQUALLY = 'equally',
  MINE = 'mine',
  PEER = 'peer',
  CUSTOM = 'custom',
}

export default function EditTransactionCard({
  transaction,
  selected,
  groups,
  defaultGroup,
  currentUser,
  billStatementId,
  onTransactionSelected,
}: EditTransactionCardProps) {
  const [groupSelected, setGroupSelected] = useState('');
  const [allocationType, setAllocationType] = useState<Allocation>(Allocation.MINE);
  const [allocationBase, setAllocationBase] = useState<'fixed' | 'percentage'>('fixed');
  const [showDropdown, setShowDropdown] = useState(false);

  const isGroupsPage = useLocation().pathname.includes('groups');
  const ungroupedDebitSelected = transaction.type === 'Debit' && selected;

  const formRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  const navigate = useNavigate();

  const currentGroupId = groupSelected || defaultGroup;
  const currentGroup = groups.find((group) => group._id === currentGroupId);

  const getAllocations = () => {
    const selects = formRef.current?.querySelectorAll('select[name^="user-"]');
    const inputs = formRef.current?.querySelectorAll('input[name^="amount-"]');

    return Array.from(selects || []).map((select, index) => ({
      userId: (select as HTMLSelectElement).value,
      amount: Number((inputs?.[index] as HTMLInputElement).value),
    }));
  };

  function handleGroupSelected(e: any) {
    setGroupSelected(e.target.value);
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const transactionId = formData.get('transaction');
    const groupId = formData.get('group');
    const allocationType = formData.get('allocation');
    const note = formData.get('note');

    const transactionData = {
      transactionId: transactionId as string,
      group: groupId,
      allocation: {
        method: 'percentage',
        members: [],
      },
      note,
    } as {
      group: string;
      allocation: {
        method: 'percentage' | 'fixed';
        members: { user: string; portion: number; amount: number }[];
      };
      note: string;
    };

    switch (allocationType) {
      case Allocation.MINE:
        transactionData.allocation.method = 'percentage';
        transactionData.allocation.members = [
          { user: currentUser, portion: 100, amount: transaction.amount },
        ];
        break;

      case Allocation.EQUALLY:
        transactionData.allocation.method = 'fixed';
        const totalAmount = transaction.amount;
        const minimumAmountPerPerson = Math.floor(totalAmount / currentGroup.members.length);
        const extraCentsToDistribute = totalAmount % currentGroup.members.length;

        transactionData.allocation.members = currentGroup.members.map(
          (member: any, index: number) => {
            // If this person should get an extra cent (based on their position in the list)
            const getsExtraCent = index < extraCentsToDistribute;
            // Their final amount is either minimum + 1 cent or just minimum
            const finalAmount = getsExtraCent ? minimumAmountPerPerson + 1 : minimumAmountPerPerson;

            return { user: member._id, portion: finalAmount, amount: finalAmount };
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
            amount: (transaction.amount * amount) / 100,
          }));

          const total = transactionData.allocation.members.reduce(
            (sum, { amount }) => sum + amount,
            0,
          );

          if (total === transaction.amount) {
            toast.warning('Total amount does not match transaction amount');
            return;
          }
        } else {
          const total = allocations.reduce((sum, { amount }) => sum + amount * 100, 0);

          if (total !== transaction.amount) {
            toast.warning('Total amount does not match transaction amount');
            return;
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
    setShowDropdown(!showDropdown);
  }

  return (
    <Form
      key={transaction._id}
      className={`group relative h-fit w-full cursor-pointer border-b border-border py-6 ${
        (transaction.type === 'Credit' || transaction?.group) && !isGroupsPage ? 'bg-mist/40' : ''
      }`}
      onClick={handleClick}
      onSubmit={handleSubmit}
    >
      {transaction.group && !isGroupsPage && (
        <div className='absolute right-6 top-3 italic'>
          <span>In group: </span>
          <span>{groups.find((group) => group._id === transaction.group)?.name}</span>
        </div>
      )}

      {ungroupedDebitSelected && !isGroupsPage && (
        <div className='pointer-events-none absolute -inset-x-8 inset-y-0 h-full rounded border border-dashed border-accent' />
      )}

      <div className='relative'>
        <div
          className={`absolute -inset-x-4 -inset-y-2 ${ungroupedDebitSelected ? 'border-l border-l-accent' : ''}`}
        />

        <input hidden type='text' defaultValue={transaction._id} name='transaction' />
        <div className='flex items-center justify-between'>
          <EllipsisVerticalIcon
            onClick={handleOptionsSelected}
            className='-transform-y-1/2 invisible absolute right-0 z-10 size-6 h-full cursor-pointer text-muted hover:text-primary group-hover:visible'
          />
          {showDropdown && (
            <Dropdown
              transactionId={transaction._id}
              onClose={() => setShowDropdown(false)}
              onDeselectTransaction={() => onTransactionSelected('')}
              isGrouped={transaction.group}
            />
          )}
          <div
            className={`flex w-full items-center gap-4 ${(transaction.type === 'Credit' || !!transaction?.group) && !isGroupsPage ? 'opacity-50' : ''}`}
          >
            <div className='text-sm text-accent'>
              <div className='text-xl font-semibold'>
                {displayDate(transaction.date)?.split(' ')[1]}
              </div>
              <div>{displayDate(transaction.date)?.split(' ')[0]}</div>
            </div>
            <div>
              <div>{transaction.subdescription.trim() || transaction.description}</div>

              {!transaction.subdescription.trim() ? null : (
                <div className='text-sm text-muted'>{transaction.description}</div>
              )}
            </div>
          </div>
          <div
            className={`flex w-full items-center justify-center ${transaction.type === 'Credit' || !!transaction?.group ? 'opacity-50' : ''}`}
          >
            <div className='text-center'>
              <span className='mr-4 text-sm font-medium text-muted'>
                {transaction.type === 'Credit' ? 'Deposit' : 'Paid'}
              </span>
              ${(Number(transaction.amount) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      {transaction.type === 'Credit' && <div className='w-full' />}

      {!transaction.group && transaction.type === 'Debit' && (
        <div className='mt-3 space-y-3'>
          <div className='flex items-center gap-2 rounded-lg bg-slate-50 p-2'>
            <div className='flex-1 text-sm'>
              <span className='text-xs'>1.</span> Select group:
            </div>
            {groups.length > 0 ? (
              <select
                name='group'
                required
                className='h-10 w-1/3 cursor-pointer rounded-md border border-border bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm transition-all hover:border-gray-400'
                value={currentGroupId}
                onChange={handleGroupSelected}
              >
                <option value={''}>Choose...</option>
                {groups.map((group: any) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            ) : (
              <Button
                variant='text'
                className='!h-6 !px-2 !text-sm !text-primary hover:!text-primary/80'
                onClick={() => navigate('/groups')}
              >
                + Create
              </Button>
            )}
          </div>

          {!!currentGroup?.members?.length && (
            <div className='flex items-center gap-2 rounded-lg bg-slate-50 p-2'>
              <div className='flex-1 text-sm'>
                <span className='text-xs'>2. </span>Split:
              </div>

              <div className='flex w-1/3 gap-1'>
                <button
                  type='button'
                  onClick={() => setAllocationType(Allocation.MINE)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    allocationType === Allocation.MINE
                      ? 'bg-accent text-white'
                      : 'bg-white hover:bg-border'
                  }`}
                >
                  Me
                </button>

                {currentGroup.members.length > 1 && (
                  <>
                    <button
                      type='button'
                      onClick={() => setAllocationType(Allocation.EQUALLY)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        allocationType === Allocation.EQUALLY
                          ? 'bg-accent text-white'
                          : 'bg-white hover:bg-border'
                      }`}
                    >
                      Equal
                    </button>

                    <div className='flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => setAllocationType(Allocation.PEER)}
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${
                          allocationType === Allocation.PEER
                            ? 'bg-accent text-white'
                            : 'bg-white hover:bg-border'
                        }`}
                      >
                        For member
                      </button>
                    </div>

                    <button
                      type='button'
                      onClick={() => {
                        onTransactionSelected(transaction._id);
                        setAllocationType(Allocation.CUSTOM);
                      }}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        allocationType === Allocation.CUSTOM
                          ? 'bg-accent text-white'
                          : 'bg-white hover:bg-border'
                      }`}
                    >
                      Custom
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {allocationType === Allocation.PEER && (
            <div className='mt-2 flex items-center justify-between gap-1 rounded-lg border border-border bg-white p-3'>
              <p className='mb-2 text-sm font-medium text-muted'>Paid for</p>
              <select
                required
                name='peer-id'
                className='h-10 w-1/3 cursor-pointer rounded-md border border-border bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm transition-all hover:border-gray-400'
              >
                {currentGroup.members
                  .filter((user: any) => user._id !== currentUser)
                  .map((user: any) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {allocationType === Allocation.CUSTOM && (
            <div className='rounded-lg border border-border bg-white p-3'>
              <div className='mb-2 text-sm font-medium text-muted'>Custom amounts</div>
              <CustomAllocationForm
                formRef={formRef}
                allocationBase={allocationBase}
                amount={Number(transaction.amount) / 100}
                groupMembers={currentGroup.members}
                onAllocationBaseChange={(e) => setAllocationBase(e)}
              />
            </div>
          )}

          {!!currentGroup?.members?.length && (
            <div className='flex flex-col gap-2 rounded-lg bg-slate-50 p-2'>
              <div className='flex-1 text-sm'>
                <span className='text-xs'>3. </span>Note:
              </div>
              <div className='flex-1'>
                <textarea
                  name='note'
                  className='w-full border px-4 py-2 placeholder:text-sm placeholder:text-muted'
                  placeholder='Optional note…'
                />
              </div>
            </div>
          )}

          <div className='flex items-center justify-end gap-2'>
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
            <Button type='submit' disabled={!currentGroup}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
