interface ConfirmModalProps {
  message: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export default function ConfirmModal({ message, description, onConfirm, onCancel, confirmLabel = 'Delete' }: ConfirmModalProps) {
  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{message}</h3>
        {description && (
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">{description}</p>
        )}
        <div className="modal-action">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button
            className="btn text-white border-none"
            style={{ backgroundColor: '#a28847' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8a7339')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a28847')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </dialog>
  );
}
