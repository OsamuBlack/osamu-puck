"use client";

import { Data } from "@measured/puck";
import { Render } from "@measured/puck";
import Script from "next/script";
import config from "../(dashboard)/dashboard/puck/puck.config";

export default function Client({ data }: { data: Data }) {
  return (
    <>
      <Render data={data} config={config} />
      <Script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" />
    </>
  );
}
