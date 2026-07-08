'use client';

import { ko } from '@/i18n/ko';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';

export function ResetConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      titleId="reset-confirm-title"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel}>
            {ko.wizard.resetConfirmNo}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onConfirm}
            className="bg-danger hover:bg-danger active:bg-danger"
          >
            {ko.wizard.resetConfirmYes}
          </Button>
        </div>
      }
    >
      <h2 id="reset-confirm-title" className="text-h3 font-semibold text-ink-900 py-4">
        {ko.wizard.resetConfirmTitle}
      </h2>
    </Sheet>
  );
}
