type SettlementsProps = {
  settlements: any;
  members: any[];
  currentUser: any;
};

export default function Settlements({ settlements, members, currentUser }: SettlementsProps) {
  return (
    <>
      {settlements.map((settlement: any, i: number) => {
        const debtor = members.find((member: any) => member._id === settlement.from);
        const creditor = members.find((member: any) => member._id === settlement.to);

        if (!debtor || !creditor) return null;

        const amount = settlement.amount / 100;
        const isCurrentUser = currentUser._id;

        return (
          <div
            key={`amount-${i}`}
            className={`${isCurrentUser === debtor._id ? 'text-red-500' : ''} ${isCurrentUser === creditor._id ? 'text-green-800' : ''}`}
          >
            <span>{isCurrentUser === debtor._id ? 'You' : debtor.name}</span>
            {isCurrentUser === debtor._id ? ' owe ' : ' owes '}
            <span>{isCurrentUser === creditor._id ? 'you ' : `${creditor.name} `}</span>
            <span className='font-semibold'>${amount.toFixed(2)}</span>
          </div>
        );
      })}
    </>
  );
}
