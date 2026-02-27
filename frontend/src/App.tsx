import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetCouple } from './hooks/useQueries';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import VisionBoard from './pages/VisionBoard';
import DailyPlanner from './pages/DailyPlanner';
import CoupleSettings from './pages/CoupleSettings';
import YearlyPlanner from './pages/YearlyPlanner';
import MonthlyPlanner from './pages/MonthlyPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';
import JournalSection from './pages/JournalSection';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Heart,
  Menu,
  X,
  LogIn,
  LogOut,
  Loader2,
  CalendarRange,
  CalendarCheck,
  BookOpen,
  NotebookPen,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Profile Setup Modal ──────────────────────────────────────────────────────

function ProfileSetupModal() {
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile.mutate({ name: name.trim(), displayName: displayName.trim() || name.trim() });
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Welcome to Future Us ✨</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            Let's set up your profile to get started on your journey together.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="label-warm">Your Name</Label>
            <Input
              id="name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-body"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="label-warm">Display Name (optional)</Label>
            <Input
              id="displayName"
              placeholder="e.g. Alex Johnson"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="font-body"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending || !name.trim()}
          >
            {saveProfile.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Start Our Journey →'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Couple Mode Badge ────────────────────────────────────────────────────────

function CoupleModeBadge() {
  const { data: couple } = useGetCouple();
  const { identity } = useInternetIdentity();

  if (!couple || !identity) return null;

  return (
    <Link
      to="/couple-settings"
      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-light border border-rose-dusty/30 text-accent-foreground text-xs font-body font-semibold hover:bg-rose-dusty/20 transition-colors"
    >
      <Heart className="w-3 h-3 fill-current text-rose-dusty" />
      <span>Couple Mode</span>
    </Link>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vision-board', label: 'Vision Board', icon: Target },
    { to: '/yearly-planner', label: 'Yearly', icon: BookOpen },
    { to: '/monthly-planner', label: 'Monthly', icon: CalendarRange },
    { to: '/weekly-planner', label: 'Weekly', icon: CalendarCheck },
    { to: '/daily-planner', label: 'Daily', icon: CalendarDays },
    { to: '/journal', label: 'Journal', icon: NotebookPen },
    { to: '/couple-settings', label: 'Couple', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border/60 shadow-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-2xl">💑</span>
            <span className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              Future Us
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
                activeOptions={to === '/' ? { exact: true } : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <CoupleModeBadge />
            {isAuthenticated && userProfile && (
              <span className="hidden xl:block text-sm font-body text-muted-foreground">
                Hi, {userProfile.name} 👋
              </span>
            )}
            <Button
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="font-body"
            >
              {isLoggingIn ? (
                <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Logging in...</>
              ) : isAuthenticated ? (
                <><LogOut className="w-3 h-3 mr-1.5" /> Logout</>
              ) : (
                <><LogIn className="w-3 h-3 mr-1.5" /> Login</>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="lg:hidden pb-4 pt-2 border-t border-border/40 mt-2 grid grid-cols-2 gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
                activeOptions={to === '/' ? { exact: true } : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'future-us');

  return (
    <footer className="mt-auto py-8 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-body text-muted-foreground">
          © {year} Future Us. Built with{' '}
          <Heart className="inline w-3.5 h-3.5 text-rose-dusty fill-current mx-0.5" />{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ProfileSetupModal />
      <main className="flex-1">
        {isAuthenticated ? (
          <Outlet />
        ) : (
          <LandingScreen />
        )}
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}

// ─── Landing Screen ───────────────────────────────────────────────────────────

function LandingScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="text-6xl mb-4">💑</div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight">
            Your Future
            <span className="block text-primary italic">Together</span>
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Plan your life, track your vision, journal your growth — and share the journey with your partner.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-sm font-body text-muted-foreground">
          {['🎯 Vision Board', '📅 Daily Planner', '📆 Monthly Planner', '🗓️ Yearly Planner', '📓 Journal', '💑 Couple Mode', '✨ Daily Quotes'].map((f) => (
            <span key={f} className="px-4 py-2 rounded-full bg-card border border-border/60 shadow-warm">
              {f}
            </span>
          ))}
        </div>

        <Button
          size="lg"
          onClick={login}
          disabled={isLoggingIn}
          className="px-8 py-6 text-base font-body font-semibold rounded-2xl shadow-warm-lg"
        >
          {isLoggingIn ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connecting...</>
          ) : (
            'Begin Our Journey →'
          )}
        </Button>
        <p className="text-xs font-body text-muted-foreground">
          Secure login — your data lives on the Internet Computer blockchain
        </p>
      </div>
    </div>
  );
}

// ─── Router Setup ─────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const visionBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vision-board',
  component: VisionBoard,
});

const dailyPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-planner',
  component: DailyPlanner,
});

const coupleSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/couple-settings',
  component: CoupleSettings,
});

const yearlyPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/yearly-planner',
  component: YearlyPlanner,
});

const monthlyPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monthly-planner',
  component: MonthlyPlanner,
});

const weeklyPlannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/weekly-planner',
  component: WeeklyPlanner,
});

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/journal',
  component: JournalSection,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  visionBoardRoute,
  dailyPlannerRoute,
  coupleSettingsRoute,
  yearlyPlannerRoute,
  monthlyPlannerRoute,
  weeklyPlannerRoute,
  journalRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
