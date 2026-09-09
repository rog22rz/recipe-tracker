import { cx } from '../../lib/cx';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  size?: 'mobile' | 'desktop';
}

export function SearchInput({ value, onChange, placeholder, size = 'mobile' }: SearchInputProps) {
  return (
    <input
      type="text"
      className={cx(styles.input, styles[size])}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
