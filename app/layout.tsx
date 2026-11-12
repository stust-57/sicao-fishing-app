import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "四草大橋釣魚情報站",
  description: "台南四草潮汐、天氣、魚種與釣況資訊"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}