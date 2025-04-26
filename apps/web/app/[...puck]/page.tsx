import { getPage, getPageTitle } from "@/lib/get-page";
import Client from "./client";
import { Metadata, ResolvingMetadata } from "next";
import { MetadataProps } from "@workspace/puck/next-meta/config";
import { Data } from "@measured/puck";
import { notFound } from "next/navigation";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ puck: string[] }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { puck } = await params;
  const path = `/${puck.join("/")}`;

  const data = getPage(path) as Data<any, MetadataProps> | null | undefined;
  const parentData = await parent;

  if (data) {
    const images = data.root.props?.ogImages;
    return {
      title: data.root.props?.title + " | " + parentData.title?.absolute,
      description: data.root.props?.description,
      metadataBase:
        (data.root.props?.canonical && new URL(data.root.props?.canonical)) ||
        parentData.metadataBase,
      openGraph: {
        title: data.root.props?.title || parentData.openGraph?.title,
        description:
          data.root.props?.description || parentData.openGraph?.description,
        images: images?.length
          ? images.map((image: any) => ({
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.alt,
            }))
          : parentData.openGraph?.images,
      },
      twitter: {
        title: data.root.props?.title || parentData.twitter?.title,
        description:
          data.root.props?.description ||
          parentData.twitter?.description ||
          undefined,
        images: images?.length
          ? images.map((image: any) => ({
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.alt,
            }))
          : parentData.twitter?.images,
      },
    };
  } else {
    return {
      title: parentData.title?.absolute
        ? "Not Found | " + parentData.title?.absolute
        : "Not Found",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ puck: string[] }>;
}) {
  const { puck } = await params;
  const path = `/${puck.join("/")}`;

  const data = getPage(path);

  if (!data) {
    return notFound();
  }

  return <Client data={data} />;
}
export const dynamic = "force-static";
