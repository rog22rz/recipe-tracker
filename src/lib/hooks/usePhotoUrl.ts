import { useEffect, useState } from 'react';
import { getPhotoBlob } from '../photos';

export function usePhotoUrl(photoId: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(null);
    if (!photoId) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    getPhotoBlob(photoId).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);

  return url;
}
