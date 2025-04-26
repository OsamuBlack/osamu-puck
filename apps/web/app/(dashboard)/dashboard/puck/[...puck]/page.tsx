/**
 * This file implements a *magic* catch-all route that renders the Puck editor.
 *
 * This route exposes /puck/[...puckPath], but is disabled by middleware.ts. The middleware
 * then rewrites all URL requests ending in `/edit` to this route, allowing you to visit any
 * page in your application and add /edit to the end to spin up a Puck editor.
 *
 * This approach enables public pages to be statically rendered whilst the /puck route can
 * remain dynamic.
 *
 * NB this route is public, and you will need to add authentication
 */

import "@measured/puck/puck.css";
import { Client } from "./client";
import { Metadata } from "next";
import { getPage, getPageTitle } from "@/lib/get-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puck: string[] }>;
}): Promise<Metadata> {
  const { puck = [] } = await params;
  const data = getPage(`/${puck.join("/")}`);
  const path = `/${puck.join("/")}`;

  return {
    title: "Editing: " + getPageTitle(path),
  };
}
import { AppSidebar } from "@/components/app-sidebar";
import { getPageUrls } from "@/lib/get-urls";
import { SidebarProvider } from "@workspace/ui/components/sidebar";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ puck: string[] }>;
  searchParams?: Promise<{
    prompt?: string;
  }>;
}) {
  const { puck = [] } = await params;
  const path = `/${puck.join("/")}`;
  const data = getPage(path) || {
    content: [],
    root: { props: { title: getPageTitle(path) } },
  };

  const urls = await getPageUrls();

  const { prompt } = (await searchParams) || { prompt: undefined };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-black">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar
          pageUrls={urls.map((page) => ({
            title: getPageTitle(page),
            url: page,
          }))}
        />
        <div className="w-full">
          <Client data={data} path={path} prompt={prompt} />
        </div>
      </SidebarProvider>
    </div>
  );
}

export const dynamic = "force-dynamic";
