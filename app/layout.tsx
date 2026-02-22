import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apex — Student Hub",
  description: "The all-in-one academic operating system for high school students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, padding: 0, background: "#0A0A0F" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}