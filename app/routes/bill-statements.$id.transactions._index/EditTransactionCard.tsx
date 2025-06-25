import { useRef, useState } from 'react';
import {
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TagIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import { Form, useFetcher, useLocation, useNavigate } from '@remix-run/react';
import { toast } from 'sonner';
import CustomAllocationForm from './CustomAllocationForm';
import { Button } from '../../components/Button';
import { displayDate } from '../../utils/date-helpers';
import Dropdown from './TransactionDropdown';
import CategoryDropdown from './CategoryDropdown';

type EditTransactionCardProps = {
  transaction: any;
  selected: boolean;
  groups: any[];
  categories: any[];
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
  categories,
  defaultGroup,
  currentUser,
  billStatementId,
  onTransactionSelected,
}: EditTransactionCardProps) {
  const [groupSelected, setGroupSelected] = useState('');
  const [allocationType, setAllocationType] = useState<Allocation>(Allocation.MINE);
  const [allocationBase, setAllocationBase] = useState<'fixed' | 'percentage'>('fixed');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySelected, setCategorySelected] = useState<any>(null);

  const isGroupsPage = useLocation().pathname.includes('groups');
  const ungroupedDebitSelected = transaction.type === 'Debit' && selected;

  const formRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const currentGroupId = groupSelected || defaultGroup;
  const currentGroup = groups.find((group) => group._id === currentGroupId);
  const currentCategory = categorySelected || transaction.category;
  const selectedCategory = categories.find((c) => c._id === currentCategory);

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

  function handleCategoryClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setShowCategoryDropdown(!showCategoryDropdown);
  }

  function handleCategorySelect(categoryId: string) {
    setCategorySelected(categoryId);
    setShowCategoryDropdown(false);
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const transactionId = formData.get('transaction');
    const groupId = formData.get('group');
    const note = formData.get('note');
    const category = formData.get('category') as string;

    const transactionData = {
      transactionId: transactionId as string,
      group: groupId,
      ...(category && { category }),
      allocation: {
        method: 'percentage',
        members: [],
      },
      note,
    } as {
      group: string;
      category?: string;
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
    fetcher.submit(formData, {
      method: 'PUT',
      action: `/bill-statements/${billStatementId}/transactions`,
    });
  }

  function handleClick(e: any) {
    e.stopPropagation();
    onTransactionSelected(transaction._id);
  }

  function handleOptionsSelected(e: any) {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  }

  return (
    <Form
      key={transaction._id}
      className={`group relative h-fit w-full cursor-pointer border-t border-border py-6 ${
        (transaction.type === 'Credit' || transaction?.group) && !isGroupsPage ? 'bg-mist/40' : ''
      }`}
      onClick={handleClick}
      onSubmit={handleSubmit}
    >
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
        <>
          <div className='mt-6 flex space-x-16'>
            <div className='w-1/2'>
              <div className='mb-4 flex items-center gap-8'>
                <label className='flex min-w-[80px] items-center gap-2 text-sm text-muted'>
                  <TagIcon className='h-4 w-4' />
                  Category
                </label>

                <div className='relative flex-1'>
                  {selectedCategory ? (
                    <div className='flex items-center gap-2'>
                      <span className='rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-muted'>
                        {selectedCategory.name}
                      </span>
                      <input type='hidden' name='category' value={currentCategory} />
                      <Button variant='text' onClick={handleCategoryClick} className='text-sm'>
                        Edit
                      </Button>
                    </div>
                  ) : (
                    <button
                      type='button'
                      onClick={handleCategoryClick}
                      className='text-sm text-primary transition-colors hover:text-primary/80'
                    >
                      Choose
                    </button>
                  )}

                  {showCategoryDropdown && (
                    <CategoryDropdown
                      transactionId={transaction._id}
                      currentCategory={selectedCategory?._id}
                      categories={categories}
                      onCategorySelect={handleCategorySelect}
                      onClose={() => setShowCategoryDropdown(false)}
                    />
                  )}
                </div>
              </div>

              <div className='mb-4 flex items-center gap-8'>
                <label className='flex min-w-[80px] items-center gap-2 text-sm text-muted'>
                  <UserGroupIcon className='h-4 w-4' />
                  Group
                </label>
                <div className='flex-1'>
                  {groups.length > 0 ? (
                    <select
                      name='group'
                      required
                      className='w-full cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm transition-all hover:border-gray-400'
                      value={currentGroupId}
                      onChange={handleGroupSelected}
                    >
                      <option value={''}>Choose group...</option>
                      {groups.map((group: any) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Button
                      variant='text'
                      className='!h-8 !px-3 !text-sm !text-primary hover:!text-primary/80'
                      onClick={() => navigate('/groups')}
                    >
                      Create group
                    </Button>
                  )}
                </div>
              </div>

              {!!currentGroup?.members?.length && (
                <>
                  <div className='mb-4 flex items-center gap-8'>
                    <label className='flex min-w-[80px] items-center gap-2 text-sm text-muted'>
                      <CurrencyDollarIcon className='h-4 w-4' />
                      Split
                    </label>
                    <div className='flex-1'>
                      <div className='flex flex-wrap gap-2'>
                        <button
                          type='button'
                          onClick={() => setAllocationType(Allocation.MINE)}
                          className={`rounded-full px-3 py-1 text-sm transition-colors ${
                            allocationType === Allocation.MINE
                              ? 'bg-accent text-white'
                              : 'bg-border/20 text-muted hover:bg-border/40'
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
                                  : 'bg-border/20 text-muted hover:bg-border/40'
                              }`}
                            >
                              Equal
                            </button>

                            <button
                              type='button'
                              onClick={() => setAllocationType(Allocation.PEER)}
                              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                allocationType === Allocation.PEER
                                  ? 'bg-accent text-white'
                                  : 'bg-border/20 text-muted hover:bg-border/40'
                              }`}
                            >
                              For member
                            </button>

                            <button
                              type='button'
                              onClick={() => {
                                onTransactionSelected(transaction._id);
                                setAllocationType(Allocation.CUSTOM);
                              }}
                              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                allocationType === Allocation.CUSTOM
                                  ? 'bg-accent text-white'
                                  : 'bg-border/20 text-muted hover:bg-border/40'
                              }`}
                            >
                              Custom
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {allocationType === Allocation.PEER && (
                    <div className='flex items-center gap-8'>
                      <label className='flex min-w-[80px] items-center gap-2 text-sm text-muted'>
                        <UserIcon className='h-4 w-4 text-muted' />
                        Paid for
                      </label>
                      <div className='flex-1'>
                        <select
                          required
                          name='peer-id'
                          className='w-full cursor-pointer rounded-md border border-border bg-white px-3 py-2 text-sm transition-all hover:border-gray-400'
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
                    </div>
                  )}

                  {allocationType === Allocation.CUSTOM && (
                    <CustomAllocationForm
                      formRef={formRef}
                      allocationBase={allocationBase}
                      amount={Number(transaction.amount) / 100}
                      groupMembers={currentGroup.members}
                      onAllocationBaseChange={(e) => setAllocationBase(e)}
                    />
                  )}
                </>
              )}
            </div>

            <div className='w-1/2'>
              <label className='flex min-w-[80px] items-center gap-2 pb-1 text-sm text-muted'>
                <PencilSquareIcon className='h-4 w-4 text-muted' />
                Note
              </label>

              <textarea
                name='note'
                className='w-full rounded-md border border-border/40 px-3 py-2 text-sm placeholder:text-muted/70'
                placeholder='Optional note about this expense...'
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-2 pt-2'>
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
        </>
      )}
    </Form>
  );
}
