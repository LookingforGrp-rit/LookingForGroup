import { useState, useEffect } from 'react';
import { ThemeIcon } from './ThemeIcon';

/**
 * Renders a button that appears when the user scrolls down the page, allowing them to quickly return to the top
 * Handles visibility based on scroll position and smooth scrolling behavior on click
 * 
 * @returns A JSX element containing the scroll-to-top button
 */
const ToTopButton = () => {
  // Whether the scroll-to-top button is visible
  const [visible, setVisible] = useState(false);

  /**
   * Checks scroll position and updates button visibility
   * @param scrollPage - The page container element
   */
  const toggleVisible = (scrollPage: HTMLElement) => {
    if (scrollPage.scrollTop > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  /**
   * Scrolls the page to the top smoothly
   * @param scrollPage - The page container element
   */
  const scrollToTop = (scrollPage: HTMLElement | null) => {
    if (scrollPage) {
      scrollPage.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    // Select the main scrollable page container
    const pageElement = document.querySelector('.page') as HTMLElement | null;
    if (pageElement) {
      // Handler updates visibility on scroll
      const handler = () => toggleVisible(pageElement);
      pageElement.addEventListener('scroll', handler);
      // Cleanup on unmount
      return () => pageElement.removeEventListener('scroll', handler);
    }
  }, []);

  return (
    <div className="ToTopContainer">
      <button
        className="to-top-button"
        onClick={() => scrollToTop(document.querySelector('.page') as HTMLElement | null)}
        style={{ display: visible ? 'inline' : 'none', scale: -1 }} //styling gets overridden by this rule
      >
        <ThemeIcon
          id={'dropdown-arrow'}
          width={15}
          height={10}
          className={'color-fill'}
          ariaLabel={'dropdown arrow'}
        />
      </button>
    </div>
  );
};

export default ToTopButton;
