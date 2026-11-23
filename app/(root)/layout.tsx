import "../fonts";
import "../globals.css";
import { site } from "@/lib/content";
import { tokensCss } from "@/lib/tokens";

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.defaultLanguage}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
