import { useState, useEffect } from 'react';
import { ThemeIcon } from './ThemeIcon';

const ToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = (scrollPage: HTMLElement) => {
    if (scrollPage.scrollTop > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = (scrollPage: HTMLElement | null) => {
    if (scrollPage) {
      scrollPage.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const pageElement = document.querySelector('.page') as HTMLElement | null;
    if (pageElement) {
      const handler = () => toggleVisible(pageElement);
      pageElement.addEventListener('scroll', handler);
      return () => pageElement.removeEventListener('scroll', handler);
    }
  }, []);

  return (
    <div className="ToTopContainer">
      <button
        className="to-top-button"
        onClick={() => scrollToTop(document.querySelector('.page') as HTMLElement | null)}
        style={{ display: visible ? 'inline' : 'none' }}
      >
        <ThemeIcon src={'assets/dropdown_light.svg'} darkSrc={'assets/dropdown_dark.svg'} />
      </button>
    </div>
  );
};

export default ToTopButton;
