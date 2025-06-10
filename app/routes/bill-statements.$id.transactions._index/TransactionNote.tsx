export default function TransactionNote() {
  return (
    <div className='mt-4 flex w-full gap-4 pt-4'>
      <div className='min-w-[100px]'>Note</div>
      <textarea
        name='note'
        className='w-full border px-4 py-2'
        placeholder='Little reminder of what this was for'
      />
    </div>
  );
}
