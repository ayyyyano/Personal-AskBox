"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavigationItem = {
  value: string;
  label: string;
  href: string;
};

const publicItems: NavigationItem[] = [
  {
    value: "ask",
    label: "提问",
    href: "/ask",
  },
  {
    value: "display",
    label: "展示",
    href: "/display",
  },
  {
    value: "admin",
    label: "管理",
    href: "/admin",
  },
];

function getActiveValue(pathname: string, items: NavigationItem[]) {
  const activeItem = items.find((item) => {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  return activeItem?.value ?? items[0]?.value ?? "";
}

function NavigationIcon({ value, active }: { value: string; active: boolean }) {
  if (value === "ask") {
    return active ? <mdui-icon-add-comment slot="icon" /> : <mdui-icon-add-comment--outlined slot="icon" />;
  }
  if (value === "display") {
    return active ? <mdui-icon-question-answer slot="icon" /> : <mdui-icon-question-answer--outlined slot="icon" />;
  }
  if (value === "admin") {
    return active ? <mdui-icon-admin-panel-settings slot="icon" /> : <mdui-icon-admin-panel-settings--outlined slot="icon" />;
  }
  if (value === "questions") {
    return active ? <mdui-icon-list slot="icon" /> : <mdui-icon-list--outlined slot="icon" />;
  }
  return active ? <mdui-icon-settings slot="icon" /> : <mdui-icon-settings--outlined slot="icon" />;
}

function NavigationItems({
  items,
  rail,
  activeValue,
  onNavigate,
}: {
  items: NavigationItem[];
  rail: boolean;
  activeValue: string;
  onNavigate: (event: React.MouseEvent<HTMLElement>, href: string) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = activeValue === item.value;
        if (rail) {
          return (
            <mdui-navigation-rail-item
              key={item.value}
              value={item.value}
              href={item.href}
              onClick={(event) => onNavigate(event, item.href)}
              aria-current={active ? "page" : undefined}
            >
              <NavigationIcon value={item.value} active={active} />
              {item.label}
            </mdui-navigation-rail-item>
          );
        }
        return (
          <mdui-navigation-bar-item
            key={item.value}
            value={item.value}
            href={item.href}
            onClick={(event) => onNavigate(event, item.href)}
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
  const activeValue = getActiveValue(pathname, items);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  function navigate(event: React.MouseEvent<HTMLElement>, href: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    event.preventDefault();
    router.push(href);
  }

  useEffect(() => {
    import("@mdui/icons/add-comment.js");
    import("@mdui/icons/add-comment--outlined.js");
    import("@mdui/icons/admin-panel-settings.js");
    import("@mdui/icons/admin-panel-settings--outlined.js");
    import("@mdui/icons/list.js");
    import("@mdui/icons/list--outlined.js");
    import("@mdui/icons/question-answer.js");
    import("@mdui/icons/question-answer--outlined.js");
    import("@mdui/icons/settings.js");
    import("@mdui/icons/settings--outlined.js");

    const media = window.matchMedia("(min-width: 769px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (isDesktop === null) return null;

  return (
    <nav aria-label="主导航">
      {isDesktop ? (
        <div className="navigation-rail">
          <mdui-navigation-rail value={activeValue} alignment="center" contained>
            <NavigationItems items={items} rail activeValue={activeValue} onNavigate={navigate} />
          </mdui-navigation-rail>
        </div>
      ) : (
        <div className="navigation-bar">
          <mdui-navigation-bar value={activeValue} label-visibility="labeled">
            <NavigationItems items={items} rail={false} activeValue={activeValue} onNavigate={navigate} />
          </mdui-navigation-bar>
        </div>
      )}
    </nav>
  );
}

export function PublicNavigation() {
  return <Navigation />;
}
