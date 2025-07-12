import { Button } from '../../components/Button';
import { ModalBody, ModalFooter } from '../../components/Modal';

import { Modal } from '../../components/Modal';

export const DeleteBankStatementModal = ({
  isOpen,
  onClose,
  onDelete,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}) => {
  return (
    <Modal title='Delete bank statement' isOpen={isOpen} onClose={onClose}>
      <ModalBody>
        <p className='text-sm text-gray-500'>
          Are you sure you want to delete this bank statement and its associated transactions? This
          action cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <div className='flex justify-end gap-3 pt-4'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onDelete} loading={isLoading}>
            Delete
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
