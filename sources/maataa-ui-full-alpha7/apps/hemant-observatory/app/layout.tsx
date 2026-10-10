import type { Metadata } from "next";
import "./styles.css";
import "./modules.css";
import "./allb.css";
import "./allb-landings.css";

export const metadata: Metadata = {
  title: "Hemant Samwat Observatory Runtime",
  description:
    "An inspectable astronomy and calendar workspace. Demonstration values are labeled with their source and limits.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
