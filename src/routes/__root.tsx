import {
  createRootRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import { StatusBar } from "@/components/layout/StatusBar";
import { TabBar } from "@/components/layout/TabBar";
import { ProtocolOrchestrator } from "@/features/protocols/ProtocolOrchestrator";
import { TourOrchestrator } from "@/features/tour/TourOrchestrator";
import { supabase } from "@/lib/supabase";

const CHROME_HIDDEN_ROUTES = ["/auth", "/setup", "/review"];

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const hideChrome = CHROME_HIDDEN_ROUTES.includes(pathname);
  const showSettings =
    !pathname.startsWith("/break") &&
    !pathname.startsWith("/build") &&
    pathname !== "/history" &&
    pathname !== "/settings";
  const onSettings = showSettings
    ? () => navigate({ to: "/settings" })
    : undefined;

  return (
    <>
      {!hideChrome && <StatusBar onSettings={onSettings} />}
      <Outlet />
      {!hideChrome && <TabBar />}
      {!hideChrome && <ProtocolOrchestrator />}
      {!hideChrome && <TourOrchestrator />}
    </>
  );
}

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (location.pathname !== "/auth") {
        await supabase.auth.signOut();
        throw redirect({ to: "/auth" });
      }
      return;
    }

    if (location.pathname === "/auth") {
      throw redirect({ to: "/engine" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("setup_complete")
      .eq("id", user.id)
      .single();

    const setupComplete = profile?.setup_complete ?? false;

    if (!setupComplete && location.pathname !== "/setup") {
      throw redirect({ to: "/setup" });
    }

    if (setupComplete && location.pathname === "/setup") {
      throw redirect({ to: "/engine" });
    }
  },
  component: RootLayout,
});
