export default function WatchLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    // This layout intentionally does not render the main Header component,
    // as the watch page components provide their own full-screen UI.
    // It also doesn't render the default <main> tag with padding.
    return <>{children}</>;
  }
