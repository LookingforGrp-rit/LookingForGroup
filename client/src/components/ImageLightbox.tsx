import { useEffect } from "react";
import close from "../icons/cancel.png";

/**
 * Full-screen overlay that shows a single image at its natural size, capped to
 * the viewport. Small images stay small; large images scale down to fit while
 * keeping their aspect ratio — so the viewer's size follows the image's size.
 *
 * Closes on the backdrop, the close button, or the Escape key.
 *
 * @param src image to display at full size
 * @param alt alt text for the image
 * @param onClose called when the viewer should close
 * @returns JSX overlay element
 */
export const ImageLightbox = ({
  src,
  alt = "",
  onClose,
}: {
  src: string;
  alt?: string;
  onClose: () => void;
}) => {
  // Close on Escape, and lock background scroll while open (same class the app's
  // Popup uses) so the page behind the overlay doesn't move.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  return (
    <div
      className="image-lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full size image"
    >
      <button
        className="image-lightbox-close"
        onClick={onClose}
        aria-label="Close full image"
      >
        <img src={close} alt="close" />
      </button>
      <img
        className="image-lightbox-img"
        src={src}
        alt={alt}
        // Clicking the image itself shouldn't close the viewer — only the backdrop.
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
