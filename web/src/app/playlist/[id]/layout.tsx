export function generateStaticParams() {
  return [{ id: '1' }]; // Return a fallback mock ID for static pre-rendering
}

export default function PlaylistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
