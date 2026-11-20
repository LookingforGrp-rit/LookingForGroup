import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import { Tag } from './Tag';

interface TagDotProps {
  /** The project the dot belongs to; a mouse click opens it. Not needed when `open` is given. */
  projectId?: number;
  type: string;
  label: string;
  /**
   * Grow in place within its row, so the dots beside it move aside (or wrap to the next
   * line) instead of being covered by the pill.
   */
  inline?: boolean;
  /**
   * Lets the parent decide whether the pill is open, so it can keep exactly one dot in a row
   * open (an accordion). In this mode there is no hover, tapping the open dot does nothing,
   * and tapping elsewhere does not close it. A click or tap only calls `onSelect`, and never
   * reaches a clickable card around the dot.
   */
  open?: boolean;
  /** Called when a dot that is controlled by `open` is clicked or tapped */
  onSelect?: () => void;
}

// Space kept between the hover pill and the edge of the card
const EDGE_MARGIN = 8;
// Horizontal padding (10px x 2) and border (4px x 2) the pill adds around its label
const PILL_EXTRA_WIDTH = 28;
// The inline pill is tighter: padding 8px x 2 and the same border (see discoverMeet.css)
const INLINE_PILL_EXTRA_WIDTH = 24;
// Extra pixels so rounding never makes the label overflow its pill
const TEXT_SLACK = 2;

/**
 * A tag shown as a small colored dot that grows into a pill with the full label (styles live
 * in discoverMeet.css under .tag-dot-wrap). The color comes from the Tag component's
 * type-to-color mapping, same as the regular tags.
 *
 * On project cards the pill floats over the dots around it. On hover it is sized to fit its
 * label (up to the card's width) and centered on the dot, then slid back inside the card if
 * that would overflow an edge. So a dot at the far left uses what room it has to its left
 * first and only then covers the dots to its right. CSS can't know where the dot sits in the
 * card, so the size and offset are measured here and passed down as the --dot-w and --dot-x
 * custom properties.
 *
 * The pill is shown by the tag-dot-open class rather than :hover. A mouse entering and
 * leaving the dot sets it, and on touch screens (which have no hover, and leave :hover stuck
 * on the last tapped element) a tap toggles it and a tap anywhere else closes it. Tapping a
 * dot never opens the project on touch; the rest of the card does.
 *
 * A mouse click opens the project, matching the rest of the card/slide it sits in. On cards
 * this is also required: the dot sits above the card's link overlay so it can receive the
 * pointer, and would otherwise swallow the click.
 *
 * Skills on profile cards use `inline` and `open`/`onSelect` instead: the open pill grows in
 * its row, and the card keeps one skill open at all times.
 *
 * @param projectId - The project the dot belongs to, used for navigation
 * @param type - Tag type, which determines the dot's color
 * @param label - The full tag name shown when open
 * @param inline - Grow in the row's flow instead of floating over the dots beside it. The pill
 * is sized to its label, up to the width of the row (--dot-w), and the dots next to it make room.
 * @param open - Makes the parent control whether the pill is open (see above)
 * @param onSelect - Called when a dot controlled by `open` is clicked or tapped
 */
export const TagDot = ({ projectId, type, label, inline = false, open: controlledOpen, onSelect }: TagDotProps) => {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ownOpen, setOwnOpen] = useState(false);

  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : ownOpen;
  // Only a dot that manages itself changes its own state
  const setOpen = (value: boolean) => {
    if (!controlled) setOwnOpen(value);
  };

  const fitPill = () => {
    const wrap = wrapRef.current;
    const text = wrap?.querySelector('p');
    if (!wrap || !text) return;

    if (inline) {
      // The row is the dot's parent. The pill may use all of it, and no offset is needed
      // because it grows from the dot's own place in the row.
      const room = wrap.parentElement?.clientWidth ?? 0;
      if (!room) return;
      const range = document.createRange();
      range.selectNodeContents(text);
      const textWidth = Math.ceil(range.getBoundingClientRect().width);
      wrap.style.setProperty(
        '--dot-w',
        `${Math.min(textWidth + INLINE_PILL_EXTRA_WIDTH + TEXT_SLACK, room)}px`,
      );
      return;
    }

    const bounds = wrap.closest('.project-panel, .discover-project-about');
    if (!bounds) return;

    const wrapRect = wrap.getBoundingClientRect();
    const boundsRect = bounds.getBoundingClientRect();
    const minLeft = boundsRect.left + EDGE_MARGIN;
    const maxRight = boundsRect.right - EDGE_MARGIN;

    // scrollWidth rounds down to a whole pixel, and a label even a fraction of
    // a pixel wider than the pill gets cut off by the ellipsis, so measure the
    // text exactly and round up
    const range = document.createRange();
    range.selectNodeContents(text);
    const textWidth = Math.ceil(range.getBoundingClientRect().width);

    const width = Math.max(
      wrapRect.width,
      Math.min(textWidth + PILL_EXTRA_WIDTH + TEXT_SLACK, maxRight - minLeft),
    );
    const centered = wrapRect.left + wrapRect.width / 2 - width / 2;
    const left = Math.min(Math.max(centered, minLeft), maxRight - width);

    wrap.style.setProperty('--dot-w', `${width}px`);
    wrap.style.setProperty('--dot-x', `${left - wrapRect.left}px`);
  };

  // When the parent opens the pill, it needs its size before it is drawn (this also covers a
  // pill that starts open)
  useLayoutEffect(() => {
    if (controlled && open) fitPill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, open, inline, label]);

  // The inline pill is capped at the row's width, so size it again when the row changes
  // (turning the phone, a scrollbar appearing after the page loads)
  useEffect(() => {
    if (!inline || typeof ResizeObserver === 'undefined') return;
    const row = wrapRef.current?.parentElement;
    if (!row) return;
    const observer = new ResizeObserver(() => fitPill());
    observer.observe(row);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inline, label]);

  // A tapped pill stays open until the next tap outside it (not for a parent-controlled dot)
  useEffect(() => {
    if (!open || controlled) return;
    const closeOnOutsidePress = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, controlled]);

  // Mouse hover opens and closes the pill. Touch taps also fire pointerenter,
  // so they're ignored here and handled by the click instead.
  const handlePointerEnter = (e: React.PointerEvent) => {
    if (controlled || e.pointerType === 'touch') return;
    fitPill();
    setOpen(true);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (controlled || e.pointerType === 'touch') return;
    setOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // A dot the parent controls only reports the click. It never opens the card around it.
    if (controlled) {
      e.stopPropagation();
      onSelect?.();
      return;
    }

    // Touch has no hover, so a tap toggles the pill instead of opening the
    // project (the rest of the card still does). A mouse click opens it.
    const pointerType = (e.nativeEvent as PointerEvent).pointerType;
    const isTouch =
      pointerType === 'touch' || (!pointerType && window.matchMedia('(hover: none)').matches);
    if (isTouch) {
      if (!open) fitPill();
      setOpen(!open);
      return;
    }
    if (projectId !== undefined) navigate(`${paths.routes.PROJECT}?projectID=${projectId}`);
  };

  const classes = ['tag-dot-wrap', inline ? 'tag-dot-inline' : '', open ? 'tag-dot-open' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={wrapRef}
      className={classes}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <Tag type={type} selected={true} className='tag-dot'>
        <p>{label}</p>
      </Tag>
    </div>
  );
};
