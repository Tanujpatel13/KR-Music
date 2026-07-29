import { MOCK_ALBUMS } from '../../../lib/mockAlbums';

export function generateStaticParams() {
  return MOCK_ALBUMS.map((album) => ({
    id: album.id,
  }));
}

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
