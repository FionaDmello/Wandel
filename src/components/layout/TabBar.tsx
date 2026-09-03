import { useNavigate, useRouterState } from "@tanstack/react-router";

import { TABS } from "@/constants/tabs";

export function TabBar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-tabbar backdrop-blur-[12px] border-t border-t-soft shadow-tabbar flex z-[100] pb-safe">
      {TABS.map(({ id, label, route, Icon }) => {
        const active = pathname === route || pathname.startsWith(route + "/");
        return (
          <button
            key={id}
            type="button"
            data-tour={`tab-${id}`}
            onClick={() => navigate({ to: route })}
            className="flex-1 py-2 pb-[10px] bg-transparent border-none cursor-pointer flex flex-col items-center gap-[3px]"
          >
            <div
              className={`w-1 h-1 rounded-full mb-0.5 ${active ? "bg-amber" : "bg-transparent"}`}
            />
            <Icon active={active} />
            <span
              className={`font-sans text-[10px] mt-0.5 ${active ? "font-medium text-plum" : "font-normal text-plum"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
