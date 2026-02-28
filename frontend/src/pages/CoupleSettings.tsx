import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCouple,
  useCreateCouple,
  useDissolveCouple,
  useGetCallerUserProfile,
  CoupleCreateErrorException,
} from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';
import { CoupleCreateError } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Heart, Link2, Link2Off, Copy, Check, Loader2, Users, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

type ConnectError =
  | { kind: 'callerAlreadyLinked' }
  | { kind: 'partnerAlreadyLinked' }
  | { kind: 'invalidPrincipal' }
  | { kind: 'generic'; message: string }
  | null;

export default function CoupleSettings() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: couple, isLoading: coupleLoading } = useGetCouple();
  const { data: userProfile } = useGetCallerUserProfile();
  const createCouple = useCreateCouple();
  const dissolveCouple = useDissolveCouple();

  const [partnerPrincipal, setPartnerPrincipal] = useState('');
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState<ConnectError>(null);

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

    setConnectError(null);

    let partnerPrincipalObj: Principal;
    try {
      partnerPrincipalObj = Principal.fromText(partnerPrincipal.trim());
    } catch {
      setConnectError({ kind: 'invalidPrincipal' });
      return;
    }

    try {
      await createCouple.mutateAsync({
        partner1: Principal.fromText(myPrincipal),
        partner2: partnerPrincipalObj,
      });
      toast.success('Couple connected! 💑 You can now share your journey together.');
      setPartnerPrincipal('');
      setConnectError(null);
      queryClient.invalidateQueries({ queryKey: ['couple'] });
    } catch (err: unknown) {
      if (err instanceof CoupleCreateErrorException) {
        switch (err.variant) {
          case CoupleCreateError.callerAlreadyLinked:
            setConnectError({ kind: 'callerAlreadyLinked' });
            break;
          case CoupleCreateError.partnerAlreadyLinked:
            setConnectError({ kind: 'partnerAlreadyLinked' });
            break;
          case CoupleCreateError.anonymousNotPermitted:
            setConnectError({ kind: 'generic', message: 'Anonymous users cannot be linked. Please log in first.' });
            break;
          case CoupleCreateError.unauthorized:
            setConnectError({ kind: 'generic', message: 'You are not authorized to perform this action.' });
            break;
          default:
            setConnectError({ kind: 'generic', message: 'Failed to connect. Please try again.' });
        }
      } else {
        const error = err as Error;
        if (error?.message?.includes('Invalid principal')) {
          setConnectError({ kind: 'invalidPrincipal' });
        } else {
          setConnectError({ kind: 'generic', message: 'Failed to connect. Please verify the principal ID and try again.' });
        }
      }
    }
  };

  const handleDisconnect = async () => {
    setDisconnectError(null);
    try {
      await dissolveCouple.mutateAsync();
      setDisconnectOpen(false);
      setPartnerPrincipal('');
      setConnectError(null);
      toast.success('Disconnected from partner. You can now connect with a new partner.');
    } catch (err: unknown) {
      const error = err as Error;
      setDisconnectError(error?.message ?? 'Failed to disconnect. Please try again.');
    }
  };

  const handleDisconnectAndRetry = () => {
    setDisconnectOpen(true);
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
                onClick={() => {
                  setDisconnectError(null);
                  setDisconnectOpen(true);
                }}
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

            {/* Inline error messages */}
            {connectError && (
              <div className="space-y-3">
                {connectError.kind === 'callerAlreadyLinked' && (
                  <Alert className="border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="font-display text-amber-800 dark:text-amber-300 text-sm">
                      You're already in a couple
                    </AlertTitle>
                    <AlertDescription className="font-body text-amber-700 dark:text-amber-400 text-sm space-y-2">
                      <p>Your account is already linked to another partner. You must disconnect your current couple before linking to a new partner.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 font-body text-destructive border-destructive/30 hover:bg-destructive/5"
                        onClick={handleDisconnectAndRetry}
                      >
                        <Link2Off className="w-3.5 h-3.5 mr-1.5" />
                        Disconnect Current Couple
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {connectError.kind === 'partnerAlreadyLinked' && (
                  <Alert className="border-rose-500/40 bg-rose-50/60 dark:bg-rose-950/20">
                    <Info className="h-4 w-4 text-rose-600" />
                    <AlertTitle className="font-display text-rose-800 dark:text-rose-300 text-sm">
                      Partner is already linked
                    </AlertTitle>
                    <AlertDescription className="font-body text-rose-700 dark:text-rose-400 text-sm">
                      The partner you entered is already in a couple with someone else. They must disconnect from their current partner first before you can link with them.
                    </AlertDescription>
                  </Alert>
                )}

                {connectError.kind === 'invalidPrincipal' && (
                  <Alert variant="destructive" className="bg-destructive/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-display text-sm">Invalid Principal ID</AlertTitle>
                    <AlertDescription className="font-body text-sm">
                      The Principal ID you entered is not valid. Please double-check the ID — it should look like <code className="font-mono text-xs">xxxxx-xxxxx-xxxxx-xxxxx-cai</code>.
                    </AlertDescription>
                  </Alert>
                )}

                {connectError.kind === 'generic' && (
                  <Alert variant="destructive" className="bg-destructive/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-display text-sm">Connection Failed</AlertTitle>
                    <AlertDescription className="font-body text-sm">
                      {connectError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="partnerPrincipal" className="label-warm">Partner's Principal ID</Label>
                <Input
                  id="partnerPrincipal"
                  placeholder="e.g. aaaaa-aa..."
                  value={partnerPrincipal}
                  onChange={(e) => {
                    setPartnerPrincipal(e.target.value);
                    if (connectError) setConnectError(null);
                  }}
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

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={disconnectOpen} onOpenChange={(open) => {
        if (!dissolveCouple.isPending) {
          setDisconnectOpen(open);
          if (!open) setDisconnectError(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Disconnect from Partner?</AlertDialogTitle>
            <AlertDialogDescription className="font-body space-y-2">
              <span className="block">
                This will remove the couple link for <strong>both you and your partner</strong>. Your existing planner data will remain intact, but you'll no longer share entries.
              </span>
              <span className="block text-muted-foreground">
                After disconnecting, you can connect with a new partner at any time.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {disconnectError && (
            <Alert variant="destructive" className="bg-destructive/5 mx-0">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-display text-sm">Disconnect Failed</AlertTitle>
              <AlertDescription className="font-body text-sm">{disconnectError}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              className="font-body"
              disabled={dissolveCouple.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDisconnect();
              }}
              disabled={dissolveCouple.isPending}
            >
              {dissolveCouple.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Disconnecting...</>
              ) : (
                <><Link2Off className="w-4 h-4 mr-2" /> Yes, Disconnect</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
