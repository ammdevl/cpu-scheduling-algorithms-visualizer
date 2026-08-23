import styles from './Skeleton.module.scss';

interface SkeletonProps {
  w?: string | number;
  h?: string | number;
  r?: string;
  className?: string;
}

export function Skeleton({ w = '100%', h = 14, r = '6px', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width: w, height: h, borderRadius: r }}
    />
  );
}
