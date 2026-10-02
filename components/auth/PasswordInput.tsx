'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return <div className="relative">
      <Input {...props} ref={ref} disabled={disabled} type={visible ? 'text' : 'password'} className={cn(className, 'pr-12')} />
      <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} aria-controls={props.id} disabled={disabled} onClick={() => setVisible(value => !value)} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-brand-green disabled:opacity-50">
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>;
  },
);
PasswordInput.displayName = 'PasswordInput';
