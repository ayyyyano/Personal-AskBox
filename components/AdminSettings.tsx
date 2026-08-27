"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/site-settings";

type Action = "update" | "favicon" | "background" | "remove-background" | "reset";

function assetUrl(kind: "favicon" | "background", revision: number) {
  return `/api/site-assets/${kind}?v=${revision}`;
}

export function AdminSettings({ initialSettings }: { initialSettings: SiteSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [askTitle, setAskTitle] = useState(initialSettings.askTitle);
  const [displayTitle, setDisplayTitle] = useState(initialSettings.displayTitle);
  const [adminLoginTitle, setAdminLoginTitle] = useState(initialSettings.adminLoginTitle);
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor);
  const [copyrightName, setCopyrightName] = useState(initialSettings.copyrightName);
  const [topBarOpacity, setTopBarOpacity] = useState(initialSettings.topBarOpacity);
  const [navigationOpacity, setNavigationOpacity] = useState(initialSettings.navigationOpacity);
  const [cardOpacity, setCardOpacity] = useState(initialSettings.cardOpacity);
  const [backgroundOpacity, setBackgroundOpacity] = useState(initialSettings.backgroundOpacity);
  const [busy, setBusy] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLElement>(null);
  const hasUnsavedChanges = siteName !== settings.siteName || askTitle !== settings.askTitle || displayTitle !== settings.displayTitle || adminLoginTitle !== settings.adminLoginTitle || primaryColor !== settings.primaryColor || copyrightName !== settings.copyrightName || topBarOpacity !== settings.topBarOpacity || navigationOpacity !== settings.navigationOpacity || cardOpacity !== settings.cardOpacity || backgroundOpacity !== settings.backgroundOpacity;

  useEffect(() => {
    const el = feedbackRef.current;
    if (!el) return;
    const handler = () => setFeedback(null);
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, []);

  useEffect(() => {
    import("@mdui/icons/palette.js");
    import("@mdui/icons/opacity.js");
    import("@mdui/icons/title.js");
    import("@mdui/icons/text-fields.js");
    import("@mdui/icons/image.js");
    import("@mdui/icons/wallpaper.js");
    import("@mdui/icons/copyright.js");
    import("@mdui/icons/restore-page.js");
    import("@mdui/icons/upload-file.js");
    import("@mdui/icons/delete.js");
    import("@mdui/icons/save.js");
  }, []);

  async function submit(action: Action, file?: File) {
    setBusy(action);
    setFeedback(null);
    const form = new FormData();
    form.set("action", action);
    if (file) form.set("file", file);
    if (action === "update") {
      form.set("siteName", siteName);
      form.set("askTitle", askTitle);
      form.set("displayTitle", displayTitle);
      form.set("adminLoginTitle", adminLoginTitle);
      form.set("primaryColor", primaryColor);
      form.set("copyrightName", copyrightName);
      form.set("topBarOpacity", String(topBarOpacity));
      form.set("navigationOpacity", String(navigationOpacity));
      form.set("cardOpacity", String(cardOpacity));
      form.set("backgroundOpacity", String(backgroundOpacity));
    }

    try {
      const response = await fetch("/api/admin/settings", { method: "POST", body: form });
      const data = (await response.json().catch(() => null)) as { settings?: SiteSettings; error?: string } | null;
      if (!response.ok || !data?.settings) {
        setFeedback({ title: "保存失败", message: data?.error ?? "请稍后再试。" });
        return;
      }
      setSettings(data.settings);
      setSiteName(data.settings.siteName);
      setAskTitle(data.settings.askTitle);
      setDisplayTitle(data.settings.displayTitle);
      setAdminLoginTitle(data.settings.adminLoginTitle);
      setPrimaryColor(data.settings.primaryColor);
      setCopyrightName(data.settings.copyrightName);
      setTopBarOpacity(data.settings.topBarOpacity);
      setNavigationOpacity(data.settings.navigationOpacity);
      setCardOpacity(data.settings.cardOpacity);
      setBackgroundOpacity(data.settings.backgroundOpacity);
      setFeedback({
        title: action === "reset" ? "配置已还原" : "设置已保存",
        message: action === "reset" ? "所有自定义设置已恢复为默认值。" : "新的设置已应用到前台与管理后台。",
      });
      router.refresh();
    } catch {
      setFeedback({ title: "保存失败", message: "网络错误，请稍后再试。" });
    } finally {
      setBusy(null);
    }
  }

  function chooseFile(kind: "favicon" | "background", file: File | undefined) {
    if (!file) return;
    void submit(kind, file);
  }

  function resetSettings() {
    if (window.confirm("确定要还原所有自定义设置吗？上传的头像和背景图也会被删除。")) {
      void submit("reset");
    }
  }

  return (
    <section className="settings-page" aria-labelledby="admin-settings-title">
      <header className="settings-header">
        <p className="eyebrow">站点外观</p>
        <h1 id="admin-settings-title" className="page-title">自定义设置</h1>
        <p className="lede">逐项调整公开页面的外观和署名。修改会应用到前台与管理后台。</p>
      </header>

      <div className="settings-list">
        <h2 id="settings-content" className="settings-section-title">基础内容</h2>
        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-title className="settings-item-icon"></mdui-icon-title>
              <div className="settings-item-copy">
                <strong>站点名称</strong>
                <span className="muted">显示在顶部导航、页面标题和法律文本中</span>
              </div>
            </div>
            <span className="settings-item-current muted">当前配置：{settings.siteName}</span>
            <div className="settings-text-controls">
              <mdui-text-field
                value={siteName}
                label="站点名称"
                placeholder="例如：我的提问箱"
                variant="filled"
                maxlength="80"
                onInput={(event) => setSiteName((event.target as HTMLInputElement | null)?.value ?? "")}
              />
              <mdui-button type="button" variant="tonal" disabled={!hasUnsavedChanges || undefined} loading={busy === "update" || undefined} onClick={() => submit("update")}>
                <mdui-icon-save slot="icon"></mdui-icon-save>
                保存
              </mdui-button>
            </div>
          </div>
        </mdui-card>

        <h2 id="settings-appearance" className="settings-section-title">主题与透明度</h2>
        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-opacity className="settings-item-icon"></mdui-icon-opacity>
              <div className="settings-item-copy">
                <strong>界面透明度</strong>
                <span className="muted">调整顶栏、底部/侧边应用栏、全局卡片和背景图片的透明度</span>
              </div>
            </div>
            <div className="settings-opacity-fields">
              {([
                ["顶栏", topBarOpacity, setTopBarOpacity],
                ["底部/侧边应用栏", navigationOpacity, setNavigationOpacity],
                ["全局卡片", cardOpacity, setCardOpacity],
                ["背景图片", backgroundOpacity, setBackgroundOpacity],
              ] as const).map(([label, value, setter]) => (
                <label className="settings-opacity-field" key={label}>
                  <span><strong>{label}</strong><output>{value}%</output></span>
                  <input type="range" min="0" max="100" step="1" value={value} aria-label={`${label}透明度`} onChange={(event) => setter(Number(event.target.value))} />
                </label>
              ))}
            </div>
            <mdui-button type="button" variant="tonal" disabled={!hasUnsavedChanges || undefined} loading={busy === "update" || undefined} onClick={() => submit("update")}>
              <mdui-icon-save slot="icon"></mdui-icon-save>
              保存透明度
            </mdui-button>
          </div>
        </mdui-card>

        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-text-fields className="settings-item-icon"></mdui-icon-text-fields>
              <div className="settings-item-copy">
                <strong>页面标题</strong>
                <span className="muted">自定义提问页、展示页和后台登录页的主标题</span>
              </div>
            </div>
            <div className="settings-title-fields">
              <mdui-text-field
                value={askTitle}
                label="提问页标题"
                placeholder="有什么想问的吗？"
                variant="filled"
                maxlength="120"
                onInput={(event) => setAskTitle((event.target as HTMLInputElement | null)?.value ?? "")}
              />
              <mdui-text-field
                value={displayTitle}
                label="展示页标题"
                placeholder="来看看回答吧。"
                variant="filled"
                maxlength="120"
                onInput={(event) => setDisplayTitle((event.target as HTMLInputElement | null)?.value ?? "")}
              />
              <mdui-text-field
                value={adminLoginTitle}
                label="后台登录页标题"
                placeholder="别来无恙啊！"
                variant="filled"
                maxlength="120"
                onInput={(event) => setAdminLoginTitle((event.target as HTMLInputElement | null)?.value ?? "")}
              />
            </div>
            <mdui-button type="button" variant="tonal" disabled={!hasUnsavedChanges || undefined} loading={busy === "update" || undefined} onClick={() => submit("update")}>
              <mdui-icon-save slot="icon"></mdui-icon-save>
              保存标题
            </mdui-button>
          </div>
        </mdui-card>

        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-palette className="settings-item-icon"></mdui-icon-palette>
              <div className="settings-item-copy">
                <strong>全局页面主题色</strong>
                <span className="muted">用于按钮、导航激活状态和重点内容</span>
              </div>
            </div>
            <span className="settings-item-current muted">当前配置：{settings.primaryColor}</span>
            <div className="settings-color-controls">
              <input
                type="color"
                value={primaryColor}
                aria-label="选择全局页面主题色"
                onChange={(event) => setPrimaryColor(event.target.value.toUpperCase())}
              />
              <mdui-text-field
                value={primaryColor}
                label="HEX 颜色"
                variant="filled"
                maxlength="7"
                onInput={(event) => setPrimaryColor(((event.target as HTMLInputElement | null)?.value ?? "").toUpperCase())}
              />
              <mdui-button type="button" variant="tonal" disabled={!hasUnsavedChanges || undefined} loading={busy === "update" || undefined} onClick={() => submit("update")}>
                <mdui-icon-save slot="icon"></mdui-icon-save>
                保存
              </mdui-button>
            </div>
          </div>
        </mdui-card>

        <h2 id="settings-assets" className="settings-section-title">图片资源</h2>
        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-image className="settings-item-icon"></mdui-icon-image>
              <div className="settings-item-copy">
                <strong>主页面头像（favicon）</strong>
                <span className="muted">显示在浏览器标签页和顶部品牌区域</span>
              </div>
            </div>
            <span className="settings-item-current muted">支持 PNG、JPG、WEBP、ICO，最大 1MB</span>
            <div className="settings-asset-controls">
              <div className="settings-preview settings-preview-avatar">
                <img src={settings.faviconKey ? assetUrl("favicon", settings.revision) : "/favicon.ico"} alt="当前头像预览" />
              </div>
              <input ref={faviconInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/x-icon" hidden onChange={(event) => chooseFile("favicon", event.target.files?.[0])} />
              <mdui-button type="button" variant="outlined" loading={busy === "favicon" || undefined} onClick={() => faviconInputRef.current?.click()}>
                <mdui-icon-upload-file slot="icon"></mdui-icon-upload-file>
                上传并更换
              </mdui-button>
            </div>
          </div>
        </mdui-card>

        <h2 id="settings-other" className="settings-section-title">其他设置</h2>
        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-wallpaper className="settings-item-icon"></mdui-icon-wallpaper>
              <div className="settings-item-copy">
                <strong>全局背景图片</strong>
                <span className="muted">应用到前台和管理后台页面，可随时清除</span>
              </div>
            </div>
            <span className="settings-item-current muted">支持 PNG、JPG、WEBP，最大 4MB</span>
            <div className="settings-asset-controls">
              {settings.backgroundKey ? (
                <div className="settings-preview settings-preview-background">
                  <img src={assetUrl("background", settings.revision)} alt="当前背景预览" />
                </div>
              ) : <span className="muted">未设置背景图片</span>}
              <input ref={backgroundInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => chooseFile("background", event.target.files?.[0])} />
              <mdui-button type="button" variant="outlined" loading={busy === "background" || undefined} onClick={() => backgroundInputRef.current?.click()}>
                <mdui-icon-upload-file slot="icon"></mdui-icon-upload-file>
                上传并更换
              </mdui-button>
              {settings.backgroundKey ? (
                <mdui-button type="button" variant="text" loading={busy === "remove-background" || undefined} onClick={() => submit("remove-background")}>
                  <mdui-icon-delete slot="icon"></mdui-icon-delete>
                  清除
                </mdui-button>
              ) : null}
            </div>
          </div>
        </mdui-card>

        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-copyright className="settings-item-icon"></mdui-icon-copyright>
              <div className="settings-item-copy">
                <strong>页脚版权名称</strong>
                <span className="muted">显示为 Copyright © 2026 名称</span>
              </div>
            </div>
            <span className="settings-item-current muted">当前配置：{settings.copyrightName}</span>
            <div className="settings-text-controls">
              <mdui-text-field
                value={copyrightName}
                label="版权名称"
                variant="filled"
                maxlength="80"
                onInput={(event) => setCopyrightName((event.target as HTMLInputElement | null)?.value ?? "")}
              />
              <mdui-button type="button" variant="tonal" disabled={!hasUnsavedChanges || undefined} loading={busy === "update" || undefined} onClick={() => submit("update")}>
                <mdui-icon-save slot="icon"></mdui-icon-save>
                保存
              </mdui-button>
            </div>
          </div>
        </mdui-card>

        <mdui-card className="settings-card" variant="outlined">
          <div className="settings-item-content">
            <div className="settings-item-heading">
              <mdui-icon-restore-page className="settings-item-icon"></mdui-icon-restore-page>
              <div className="settings-item-copy">
                <strong>还原默认配置</strong>
                <span className="muted">主题色、头像、背景图片和版权名称均恢复为当前默认值</span>
              </div>
            </div>
            <span className="settings-item-current muted">此操作会删除已上传的站点头像和背景图片</span>
            <mdui-button type="button" variant="outlined" loading={busy === "reset" || undefined} onClick={resetSettings}>
              <mdui-icon-restore-page slot="icon"></mdui-icon-restore-page>
              还原默认
            </mdui-button>
          </div>
        </mdui-card>
      </div>

      <mdui-dialog ref={feedbackRef} open={feedback ? true : undefined} headline={feedback?.title ?? "提示"}>
        <p>{feedback?.message}</p>
        <mdui-button slot="action" variant="text" type="button" onClick={() => setFeedback(null)}>知道了</mdui-button>
      </mdui-dialog>
    </section>
  );
}
