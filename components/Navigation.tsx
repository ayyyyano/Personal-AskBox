"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { navigatePublicView, usePublicView } from "@/lib/public-view";

type NavigationItem = {
  value: "ask" | "display" | "admin";
  label: string;
  href: string;
};

const publicItems: NavigationItem[] = [
  {
    value: "ask",
    label: "提问",
    href: "/",
  },
  {
    value: "display",
    label: "展示",
    href: "/#display",
  },
  {
    value: "admin",
    label: "管理",
    href: "/admin",
  },
];

function getActiveValue(pathname: string) {
  const path = pathname.replace(/\/$/, "");
  return ["/admin", "/admin/questions", "/admin/settings"].includes(path) ? "admin" : "";
}

function NavigationIcon({ value, active }: { value: NavigationItem["value"]; active: boolean }) {
  if (value === "ask") {
    return active ? <mdui-icon-add-comment slot="icon" /> : <mdui-icon-add-comment--outlined slot="icon" />;
  }
  if (value === "display") {
    return active ? <mdui-icon-question-answer slot="icon" /> : <mdui-icon-question-answer--outlined slot="icon" />;
  }
  return active ? <mdui-icon-admin-panel-settings slot="icon" /> : <mdui-icon-admin-panel-settings--outlined slot="icon" />;
}

function NavigationItems({
  items,
  sidebar,
  activeValue,
  onNavigate,
}: {
  items: NavigationItem[];
  sidebar: boolean;
  activeValue: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = activeValue === item.value;
        if (sidebar) {
          return (
            <mdui-list-item
              key={item.value}
              href={item.href}
              active={active}
              rounded
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                onNavigate(item.href);
              }}
              aria-current={active ? "page" : undefined}
            >
              <NavigationIcon value={item.value} active={active} />
              {item.label}
            </mdui-list-item>
          );
        }
        return (
            <mdui-navigation-bar-item
              key={item.value}
              value={item.value}
              role="link"
              tabindex="0"
              onClick={() => onNavigate(item.href)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onNavigate(item.href);
                }
              }}
              aria-current={active ? "page" : undefined}
            >
            <NavigationIcon value={item.value} active={active} />
            {item.label}
          </mdui-navigation-bar-item>
        );
      })}
    </>
  );
}

export function Navigation() {
  const items = publicItems;
  const pathname = usePathname();
  const router = useRouter();
  const view = usePublicView();
  const activeValue = pathname === "/" ? view : getActiveValue(pathname);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  function navigate(href: string) {
    if (pathname === "/" && (href === "/" || href === "/#display")) {
      navigatePublicView(href === "/#display" ? "display" : "ask");
      return;
    }
    if (pathname === href) return;
    router.push(href);
  }

  useEffect(() => {
    import("@mdui/icons/add-comment.js");
    import("@mdui/icons/add-comment--outlined.js");
    import("@mdui/icons/admin-panel-settings.js");
    import("@mdui/icons/admin-panel-settings--outlined.js");
    import("@mdui/icons/question-answer.js");
    import("@mdui/icons/question-answer--outlined.js");

    const media = window.matchMedia("(min-width: 769px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  if (isDesktop === null) return null;

  return (
    <nav aria-label="主导航">
      {isDesktop ? (
        <aside className="navigation-sidebar">
          <mdui-list>
            <NavigationItems items={items} sidebar activeValue={activeValue} onNavigate={navigate} />
          </mdui-list>
        </aside>
      ) : (
        <div className="navigation-bar">
          <mdui-navigation-bar value={activeValue} label-visibility="labeled">
            <NavigationItems items={items} sidebar={false} activeValue={activeValue} onNavigate={navigate} />
          </mdui-navigation-bar>
        </div>
      )}
    </nav>
  );
}

export function PublicNavigation() {
  return <Navigation />;
}
