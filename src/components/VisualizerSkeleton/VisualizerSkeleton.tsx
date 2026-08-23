import { Skeleton } from '../Skeleton/Skeleton';
import v from '../Visualizer/Visualizer.module.scss';

export function VisualizerSkeleton() {
  return (
    <div className={v.layout} aria-hidden="true">
      <aside className={v.config}>
        <div className={v.panel}>
          <Skeleton h={13} w="28%" />
          <Skeleton h={42} r="8px" />
          <Skeleton h={13} w="55%" />
        </div>
        <div className={v.panel}>
          <Skeleton h={13} w="32%" />
          <Skeleton h={180} r="8px" />
          <Skeleton h={36} w="48%" r="999px" />
        </div>
      </aside>
      <section className={v.results}>
        <div className={v.panel}>
          <Skeleton h={17} w="34%" />
          <Skeleton h={12} />
          <Skeleton h={12} w="86%" />
          <Skeleton h={12} w="64%" />
          <Skeleton h={72} r="8px" />
        </div>
        <div className={v.panel}>
          <Skeleton h={17} w="24%" />
          <Skeleton h={200} r="8px" />
        </div>
        <div className={v.panel}>
          <Skeleton h={17} w="28%" />
          <Skeleton h={140} r="8px" />
        </div>
      </section>
    </div>
  );
}
