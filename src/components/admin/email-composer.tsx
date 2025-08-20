
'use client'

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendCustomEmailAction } from '@/app/admin/actions';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail: string;
  toName: string;
  initialSubject?: string;
  initialBody?: string;
}

export default function EmailComposer({ 
    open, 
    onOpenChange, 
    toEmail, 
    toName, 
    initialSubject = '',
    initialBody = ''
}: EmailComposerProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setSubject(initialSubject);
    setBody(initialBody);
  }, [initialSubject, initialBody]);

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) {
        toast({ title: "Subject and body are required.", variant: 'destructive'});
        return;
    }

    startTransition(async () => {
        const result = await sendCustomEmailAction({
            to: toEmail,
            name: toName,
            subject: subject,
            body: body.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
        });

        if (result.success) {
            toast({ title: 'Email Sent!', description: `Your message has been sent to ${toName}.` });
            onOpenChange(false);
            setSubject('');
            setBody('');
        } else {
            toast({ title: 'Failed to Send Email', description: result.error, variant: 'destructive' });
        }
    });
  };

  const isBulk = toEmail.includes(',');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription className="break-words">
            Send a message to {toName} {isBulk ? '' : `(${toEmail})`}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="body" className="text-right pt-2">
              Body
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="col-span-3 min-h-[200px]"
              placeholder="Write your message here..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            {isPending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
