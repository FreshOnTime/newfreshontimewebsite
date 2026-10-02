'use client';

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { accountButton } from './AccountPage';

export function ConfirmAction({ open, onOpenChange, title, description, label, busy, error, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string;
  label: string; busy: boolean; error?: string | null; onConfirm: () => void;
}) {
  return <AlertDialog open={open} onOpenChange={(value) => { if (!busy) onOpenChange(value); }}>
    <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-lg sm:max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-brand-green">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={busy} className="min-h-11">Keep as it is</AlertDialogCancel>
        <button type="button" disabled={busy} className={accountButton} onClick={onConfirm}>{busy ? 'Saving…' : label}</button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
