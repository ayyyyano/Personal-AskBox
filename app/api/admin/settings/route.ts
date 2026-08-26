import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  getFreshSiteSettings,
  resetSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import { deleteAttachment, saveSiteAsset } from "@/lib/r2";

const colorPattern = /^#[0-9a-f]{6}$/i;
const siteNamePattern = /^.{1,80}$/u;
const customTitlePattern = /^.{1,120}$/u;
const copyrightPattern = /^.{1,80}$/u;

type SettingsAction = "update" | "favicon" | "background" | "remove-background" | "reset";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "设置保存失败，请稍后再试。";
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getFreshSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const form = await request.formData();
    const action = String(form.get("action") ?? "update") as SettingsAction;
    const current = await getFreshSiteSettings();

    if (action === "reset") {
      await resetSiteSettings();
      await Promise.allSettled([
        deleteAttachment(current.faviconKey),
        deleteAttachment(current.backgroundKey),
      ]);
      return NextResponse.json({ settings: await getFreshSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "remove-background") {
      await updateSiteSettings({ ...current, backgroundKey: null, backgroundType: null });
      await deleteAttachment(current.backgroundKey).catch(() => undefined);
      return NextResponse.json({ settings: await getFreshSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "favicon" || action === "background") {
      const file = form.get("file");
      if (!(file instanceof File)) throw new Error("请选择图片文件。");
      const uploaded = await saveSiteAsset(file, action);
      const next: SiteSettings = action === "favicon"
        ? { ...current, faviconKey: uploaded.key, faviconType: uploaded.type }
        : { ...current, backgroundKey: uploaded.key, backgroundType: uploaded.type };
      try {
        await updateSiteSettings(next);
      } catch (error) {
        await deleteAttachment(uploaded.key);
        throw error;
      }
      await deleteAttachment(action === "favicon" ? current.faviconKey : current.backgroundKey).catch(() => undefined);
      return NextResponse.json({ settings: await getFreshSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
    }

    const primaryColor = String(form.get("primaryColor") ?? current.primaryColor).trim();
    const siteName = String(form.get("siteName") ?? current.siteName).trim();
    const askTitle = String(form.get("askTitle") ?? current.askTitle).trim();
    const displayTitle = String(form.get("displayTitle") ?? current.displayTitle).trim();
    const adminLoginTitle = String(form.get("adminLoginTitle") ?? current.adminLoginTitle).trim();
    const copyrightName = String(form.get("copyrightName") ?? current.copyrightName).trim();
    if (!colorPattern.test(primaryColor)) throw new Error("主题色必须是 #RRGGBB 格式。");
    if (!siteNamePattern.test(siteName)) throw new Error("站点名称长度必须为 1 到 80 个字符。");
    if (!customTitlePattern.test(askTitle) || !customTitlePattern.test(displayTitle) || !customTitlePattern.test(adminLoginTitle)) {
      throw new Error("自定义标题长度必须为 1 到 120 个字符。");
    }
    if (!copyrightPattern.test(copyrightName)) throw new Error("页脚名称长度必须为 1 到 80 个字符。");

    await updateSiteSettings({
      ...current,
      siteName,
      askTitle,
      displayTitle,
      adminLoginTitle,
      primaryColor: primaryColor.toUpperCase(),
      copyrightName,
    });
    return NextResponse.json({ settings: await getFreshSiteSettings() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
