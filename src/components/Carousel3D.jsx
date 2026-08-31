import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, animate, AnimatePresence } from "motion/react";
import Icon from "./Icon";
import "./Carousel3D.css";

function normalizeAngle(deg) {
  return ((deg % 360) + 360) % 360;
}

/* 0 at the front of the ring, 1 directly behind it. Measured over the full
   half-turn because the ring now shows its backs (see backface-visibility in
   the stylesheet) — the old 130deg cutoff clamped every rear panel to the same
   value, killing the depth cue exactly where the panels cross. */
function distanceFromFront(r, index, angleStep) {
  const facing = normalizeAngle(r + index * angleStep);
  const dist = facing > 180 ? 360 - facing : facing;
  return dist / 180;
}

function Carousel3DItem({ item, index, angleStep, radius, rotation, onSelect, isReduced, itemWidth, itemHeight }) {
  /* The only depth cue left. Perspective already scales the panels and the ring
     already sorts them in 3D, so the old scale/brightness/saturate stack shrank
     and greyed the photos a second time; a light haze on the far side separates
     front from back without draining the work of its colour. An explicit
     z-index is gone with it: the panels are meant to intersect, and sorting
     them by index overrides the depth sort that draws the crossing. */
  const opacity = useTransform(rotation, (r) =>
    isReduced ? 1 : 1 - distanceFromFront(r, index, angleStep) * 0.3
  );

  return (
    <div
      className="carousel3d-item-wrap"
      style={{
        width: "var(--c3d-item-w)",
        height: "var(--c3d-item-h)",
        transform: `rotateY(${index * angleStep}deg) translateZ(${radius}px)`,
      }}
    >
      <motion.button
        type="button"
        className="carousel3d-item"
        onClick={() => onSelect(index)}
        style={{ opacity }}
        aria-label={item.alt}
      >
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          className="carousel3d-image"
          loading="lazy"
          width={itemWidth}
          height={itemHeight}
        />
      </motion.button>
    </div>
  );
}

export default function Carousel3D({
  items = [],
  className = "",
  itemWidth: itemWidthProp = 200,
  itemHeight: itemHeightProp,
  itemRatio = 1.32,
  /* Multiple of the radius that would sit the panels exactly edge to edge.
     Above 1 the ring is wider than the stage that frames it, so only three or
     four panels are ever in view and the rest swing out past the edges — that
     is what buys the empty ground between them. Pulling it back under 1 packs
     every photo into the frame at once and they fuse into an opaque wall, which
     is the failure mode this whole geometry exists to avoid. */
  tightness = 1.4,
  /* Camera distance as a multiple of the radius, so the foreshortening holds at
     every container width instead of drifting as the ring resizes under a fixed
     px perspective. At 2.6 the front panel gains about 1.6x — big enough to
     dominate, short of the smear that sets in as the ring nears the lens. */
  perspectiveRatio = 2.6,
  autoRotateDuration = 90,
  paused = false,
  onActiveIndexChange,
  groupLabel = "Portfolio",
  prevLabel = "Previous",
  nextLabel = "Next",
}) {
  const count = items.length;
  const angleStep = count > 0 ? 360 / count : 0;

  const wrapRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The panels are meant to be oversized — the front one should dominate the
  // stage, not sit inside it. A phone-width container gets a bigger slice still,
  // or the photos shrink to the floor and read as thumbnails. The ring runs
  // wider than its box either way; the stage's mask feathers whatever passes.
  const widthFraction = containerWidth && containerWidth < 760 ? 0.56 : 0.3;
  const itemWidth = containerWidth
    ? Math.max(150, Math.min(itemWidthProp, Math.round(containerWidth * widthFraction)))
    : itemWidthProp;
  const itemHeight = itemHeightProp ?? Math.round(itemWidth * itemRatio);

  const radius = useMemo(() => {
    if (count < 2) return 0;
    return Math.round((itemWidth / 2 / Math.tan(Math.PI / count)) * tightness);
  }, [itemWidth, count, tightness]);
  const perspective = Math.round(radius * perspectiveRatio) || 1500;

  const stageRef = useRef(null);
  const dragState = useRef(null);
  const resumeTimer = useRef(null);

  const rotation = useMotionValue(0);
  const tiltX = useSpring(0, { stiffness: 110, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 110, damping: 18 });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  useMotionValueEvent(rotation, "change", (r) => {
    if (count === 0) return;
    const idx = ((Math.round(-r / angleStep) % count) + count) % count;
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  useEffect(() => {
    if (paused || isInteracting || count < 2) return;
    const controls = animate(rotation, rotation.get() - 360, {
      duration: autoRotateDuration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [paused, isInteracting, autoRotateDuration, rotation, count]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  // The carousel is the one place that knows which panel is at the front; a
  // parent that wants to act on "whatever is showing now" (Portfolio's "book
  // this" CTA) has no other way to find out.
  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  const wakeAutoplay = () => {
    clearTimeout(resumeTimer.current);
    setIsInteracting(true);
    resumeTimer.current = setTimeout(() => setIsInteracting(false), 4200);
  };

  const handlePointerDown = (e) => {
    if (paused || count < 2) return;
    stageRef.current?.setPointerCapture?.(e.pointerId);
    dragState.current = { startX: e.clientX, startRotation: rotation.get() };
    clearTimeout(resumeTimer.current);
    setIsInteracting(true);
  };

  const handlePointerMove = (e) => {
    if (dragState.current) {
      const dx = e.clientX - dragState.current.startX;
      rotation.set(dragState.current.startRotation + dx * 0.4);
    }
    if (paused || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    // Restrained on purpose: the panels are far larger than they were, so the
    // old amplitude swung them a long way and the ring read as wobbling rather
    // than as responding to the cursor.
    tiltY.set(nx * 6);
    tiltX.set(-ny * 4);
  };

  const handlePointerUp = () => {
    if (dragState.current) {
      dragState.current = null;
      wakeAutoplay();
    }
  };

  const handlePointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    if (dragState.current) {
      dragState.current = null;
      wakeAutoplay();
    }
  };

  const step = (dir) => {
    if (count < 2) return;
    wakeAutoplay();
    animate(rotation, rotation.get() - dir * angleStep, {
      type: "spring",
      stiffness: 140,
      damping: 20,
    });
  };

  const goTo = (index) => {
    if (count < 2) return;
    wakeAutoplay();
    let delta = index - activeIndex;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    animate(rotation, rotation.get() - delta * angleStep, {
      type: "spring",
      stiffness: 140,
      damping: 20,
    });
  };

  if (count === 0) return null;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`carousel3d ${className}`}
      style={{
        "--c3d-item-w": `${itemWidth}px`,
        "--c3d-item-h": `${itemHeight}px`,
        "--c3d-persp": `${perspective}px`,
      }}
    >
      <div
        ref={stageRef}
        className="carousel3d-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label={groupLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div className="carousel3d-tilt" style={{ rotateX: tiltX, rotateY: tiltY }}>
          <motion.div className="carousel3d-ring" style={{ rotateY: rotation }}>
            {items.map((item, index) => (
              <Carousel3DItem
                key={item.src}
                item={item}
                index={index}
                angleStep={angleStep}
                radius={radius}
                rotation={rotation}
                onSelect={goTo}
                isReduced={paused}
                itemWidth={itemWidth}
                itemHeight={itemHeight}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="carousel3d-controls">
        <button
          type="button"
          className="carousel3d-arrow"
          onClick={() => step(-1)}
          aria-label={prevLabel}
        >
          <Icon name="chevronLeft" size={18} />
        </button>

        <div className="carousel3d-caption">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {items[activeIndex]?.caption}
            </motion.span>
          </AnimatePresence>
          <span className="carousel3d-count">
            {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          className="carousel3d-arrow"
          onClick={() => step(1)}
          aria-label={nextLabel}
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}
