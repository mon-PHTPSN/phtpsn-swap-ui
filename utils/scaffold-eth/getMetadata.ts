import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://phtpsn.github.io/phtpsn-swap-ui";
const titleTemplate = "%s | PHT Exchange";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description,
      images: [imageUrl],
    },
    icons: {
      icon: [{ url: `${baseUrl}/favicon.png`, sizes: "32x32", type: "image/png" }],
    },
  };
};
