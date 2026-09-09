import { useRef } from 'react';
import { cx } from '../../lib/cx';
import styles from './PhotoDropField.module.css';

interface PhotoDropFieldProps {
  variant: 'mobile' | 'desktop';
  onPhotoSelected?: (file: File) => void;
}

export function PhotoDropField({ variant, onPhotoSelected }: PhotoDropFieldProps) {
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
        className={styles.input}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <span className={styles.placeholder}>Drop tonight&rsquo;s photo</span>
    </button>
  );
}
