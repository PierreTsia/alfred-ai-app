import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const montserrat = Montserrat({ subsets: ["latin"] });

let title = "Llama Tutor – AI Personal Tutor";
let description = "Learn faster with our open source AI personal tutor";
let url = "https://llamatutor.com/";
let ogimage = "https://llamatutor.together.ai/og-image.png";
let sitename = "llamatutor.com";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale ?? "fr"} className="h-full">
      <head>
        <PlausibleProvider domain="llamatutor.together.ai" />
      </head>
      <ClerkProvider>
        <body
          className={`${montserrat.className} text-gray-700 flex h-full flex-col justify-between antialiased`}
        >
          <NextIntlClientProvider messages={messages}>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </NextIntlClientProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
