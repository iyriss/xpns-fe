interface SuccessViewProps {
  onUploadMore: () => void;
  onViewStatements: () => void;
  onBackToDashboard: () => void;
}

export const SuccessView = ({
  onUploadMore,
  onViewStatements,
  onBackToDashboard,
}: SuccessViewProps) => (
  <div className='py-12 text-center'>
    <div className='mb-6 text-2xl'>✅</div>
    <h2 className='mb-4 text-xl font-light text-gray-900'>Transactions uploaded successfully</h2>
    <div className='mx-auto flex max-w-xs flex-col gap-3'>
      <button
        type='button'
        onClick={onUploadMore}
        className='hover:bg-primary-active w-full bg-primary px-6 py-3 font-medium text-white transition-colors'
      >
        Upload more
      </button>
      <button
        type='button'
        onClick={onViewStatements}
        className='w-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50'
      >
        View statements
      </button>
      <button
        type='button'
        onClick={onBackToDashboard}
        className='w-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50'
      >
        Back to dashboard
      </button>
    </div>
  </div>
);
