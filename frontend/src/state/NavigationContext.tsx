import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AppRoute =
  | { name: 'landing' }
  | { name: 'threads' }
  | { name: 'chat'; chatId: string; threadTitle?: string };

type NavigationContextValue = {
  route: AppRoute;
  goToLanding: () => void;
  goToThreads: () => void;
  goToChat: (params: { chatId: string; threadTitle?: string }) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<AppRoute>({ name: 'landing' });

  const goToLanding = useCallback(() => setRoute({ name: 'landing' }), []);
  const goToThreads = useCallback(() => setRoute({ name: 'threads' }), []);
  const goToChat = useCallback((params: { chatId: string; threadTitle?: string }) => {
    setRoute({ name: 'chat', chatId: params.chatId, threadTitle: params.threadTitle });
  }, []);

  const value = useMemo(
    () => ({
      route,
      goToLanding,
      goToThreads,
      goToChat,
    }),
    [route, goToLanding, goToThreads, goToChat],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useAppNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useAppNavigation must be used within NavigationProvider');
  }
  return ctx;
}
