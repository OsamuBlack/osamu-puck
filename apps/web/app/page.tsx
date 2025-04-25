import { getPage } from "@/lib/get-page";
import Client from "./client";
import { Data } from "@measured/puck";

export default async function Page() {
  const data = getPage("/dashboard/editShadcn") || {
    content: [],
    root: {},
  };

  return (
    <>
      <Client data={data} />
    </>
  );
}
