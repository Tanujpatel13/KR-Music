export function generateStaticParams() {
  return [
    { id: 'a5' },
    { id: 'a9' },
    { id: 'a6' },
    { id: 'a10' },
    { id: 'a7' },
    { id: 'a3' },
    { id: 'a8' }
  ];
}

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
