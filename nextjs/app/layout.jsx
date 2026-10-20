import "@fontsource-variable/inter";
import "./globals.css";

export const metadata = {
  title: { default: "Editing · TDM 155AI week 7", template: "%s · TDM 155AI week 7" },
  description: "TDM 155AI week 7: Editing. Resource sheets for editing audio, video, and images, in apps and on the command line.",
};

export const viewport = {
  colorScheme: "dark",
  themeColor: "#121412",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
