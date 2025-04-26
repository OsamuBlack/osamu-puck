import { Data } from "@measured/puck";
import fs from "fs";

// Replace with call to your database
export const getPage = (path: string) => {
  const allData: Record<string, Data> | null = fs.existsSync("database.json")
    ? JSON.parse(fs.readFileSync("database.json", "utf-8"))
    : null;

  return allData ? allData[path] : null;
};

export const pageTitleFromPath = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "New Page";
};

export const getPageTitle = (path: string) => {
  const title = pageTitleFromPath(path);
  return title!.charAt(0).toUpperCase() + title!.slice(1);
};