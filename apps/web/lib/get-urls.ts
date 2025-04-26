import { Data } from "@measured/puck";
import fs from "fs";

// Replace with call to your database
export const getPageUrls = () => {
  const allData: Record<string, Data> | null = fs.existsSync("database.json")
    ? JSON.parse(fs.readFileSync("database.json", "utf-8"))
    : null;

  return allData ? Object.keys(allData) : [];
};
