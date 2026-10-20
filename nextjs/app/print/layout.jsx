// Print pages: black ink on white, no chrome, tuned for Letter paper.
export const metadata = { title: { default: "Print · TDM 155AI week 7", template: "%s · Print · TDM 155AI week 7" } };

export default function PrintLayout({ children }) {
  return <div className="print-root">{children}</div>;
}
