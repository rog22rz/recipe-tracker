import { useRef } from 'react';
import { PhotoThumb } from '../../components/PhotoThumb/PhotoThumb';
import { cx } from '../../lib/cx';
import styles from './PhotoDropField.module.css';

interface PhotoDropFieldProps {
  variant: 'mobile' | 'desktop';
  photoId: string | null;
  onPhotoSelected?: (file: File) => void;
}

export function PhotoDropField({ variant, photoId, onPhotoSelected }: PhotoDropFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onPhotoSelected?.(file);
  }

  return (
    <button
      type="button"
      className={cx(styles.dropzone, variant === 'desktop' && styles.desktop)}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={variant === 'mobile' ? 'environment' : undefined}
        className={styles.input}
        onChange={(event) => handleFiles(event.target.files)}
      />
      {photoId ? (
        <div className={styles.preview}>
          <PhotoThumb photoId={photoId} name="" size={170} />
        </div>
      ) : (
        <span className={styles.placeholder}>Drop tonight&rsquo;s photo</span>
      )}
    </button>
  );
}
