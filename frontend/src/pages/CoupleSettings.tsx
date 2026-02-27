import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCouple, useCreateCouple, useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Heart, Link2, Link2Off, Copy, Check, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CoupleSettings() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: couple, isLoading: coupleLoading } = useGetCouple();
  const { data: userProfile } = useGetCallerUserProfile();
  const createCouple = useCreateCouple();

  const [partnerPrincipal, setPartnerPrincipal] = useState('');
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!identity) return null;

  const myPrincipal = identity.getPrincipal().toString();
  const isInCouple = !!couple;

  const partnerPrincipalId = couple
    ? couple.partner1.toString() === myPrincipal
      ? couple.partner2.toString()
      : couple.partner1.toString()
    : null;

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(myPrincipal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Principal ID copied!');
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerPrincipal.trim()) return;
    try {
      await createCouple.mutateAsync({
        partner1: myPrincipal,
        partner2: partnerPrincipal.trim(),
      });
      toast.success('Couple connected! 💑 You can now share your journey together.');
      setPartnerPrincipal('');
      queryClient.invalidateQueries({ queryKey: ['couple'] });
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.message?.includes('already in a couple')) {
        toast.error('One or both partners are already in a couple.');
      } else if (error?.message?.includes('Invalid principal')) {
        toast.error('Invalid principal ID. Please check and try again.');
      } else {
        toast.error('Failed to connect. Please verify the principal ID and try again.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <img
          src="/assets/generated/couple-icon.dim_256x256.png"
          alt="Couple"
          className="w-24 h-24 mx-auto object-contain"
        />
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Couple Mode 💑
        </h1>
        <p className="font-body text-muted-foreground max-w-md mx-auto">
          Connect with your partner to share your 10-year journey, vision board, and daily planner together.
        </p>
      </div>

      {coupleLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : isInCouple ? (
        /* Connected State */
        <div className="space-y-5">
          <div className="card-warm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-light">
                <Heart className="w-5 h-5 text-rose-dusty fill-current" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Connected!</h2>
                <p className="text-sm font-body text-muted-foreground">You're sharing your journey together.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 space-y-1">
                <p className="label-warm text-xs">Your Principal ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-foreground/80 flex-1 truncate">{myPrincipal}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopyPrincipal}>
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-body">Connected with</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-muted border border-rose-dusty/20 space-y-1">
                <p className="label-warm text-xs">Partner's Principal ID</p>
                <code className="text-xs font-mono text-foreground/80 block truncate">{partnerPrincipalId}</code>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full font-body text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => setDisconnectOpen(true)}
              >
                <Link2Off className="w-4 h-4 mr-2" />
                Disconnect from Partner
              </Button>
            </div>
          </div>

          <div className="card-warm p-5 space-y-3">
            <h3 className="font-display text-lg font-semibold text-foreground">What's Shared</h3>
            <ul className="space-y-2">
              {[
                { icon: '🎯', text: 'Vision Board goals are visible to both partners' },
                { icon: '📅', text: 'Daily Planner entries are shared' },
                { icon: '✨', text: 'Dashboard shows combined progress' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                  <span className="shrink-0">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* Not Connected State */
        <div className="space-y-5">
          {/* My Principal */}
          <div className="card-warm p-5 space-y-3">
            <h2 className="section-title">Your Principal ID</h2>
            <p className="text-sm font-body text-muted-foreground">
              Share this ID with your partner so they can connect with you.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/40">
              <code className="text-xs font-mono text-foreground/80 flex-1 truncate">{myPrincipal}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyPrincipal}>
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Connect Form */}
          <div className="card-warm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="section-title">Connect with Partner</h2>
            </div>
            <p className="text-sm font-body text-muted-foreground">
              Enter your partner's Principal ID to link your accounts and share your journey.
            </p>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="partnerPrincipal" className="label-warm">Partner's Principal ID</Label>
                <Input
                  id="partnerPrincipal"
                  placeholder="e.g. aaaaa-aa..."
                  value={partnerPrincipal}
                  onChange={(e) => setPartnerPrincipal(e.target.value)}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full font-body font-semibold rounded-2xl"
                disabled={createCouple.isPending || !partnerPrincipal.trim()}
              >
                {createCouple.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                ) : (
                  <><Heart className="w-4 h-4 mr-2" /> Connect with Partner</>
                )}
              </Button>
            </form>
          </div>

          <div className="card-warm p-5 space-y-3">
            <h3 className="font-display text-lg font-semibold text-foreground">How It Works</h3>
            <ol className="space-y-2">
              {[
                'Copy your Principal ID above and share it with your partner.',
                'Your partner enters your Principal ID in their Couple Settings.',
                'Once connected, both of you can see and edit shared planner data.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-body text-muted-foreground">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Disconnect Dialog */}
      <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Disconnect from Partner?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will remove the couple link. Your existing data will remain, but you'll no longer share entries with your partner. This action cannot be undone from the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast.info('Please contact support to disconnect. This feature requires admin access.');
                setDisconnectOpen(false);
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
