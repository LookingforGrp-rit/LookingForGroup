import { createContext, useContext, useEffect, useRef, useState, ReactNode, TransitionEvent, KeyboardEvent } from 'react';
import { ThemeIcon } from './ThemeIcon';

// This post was used to help create this component (found by Ben Gomez)
// https://blog.bitsrc.io/simple-carousel-in-react-2aac73887243

const CarouselContext = createContext<{
    // Logical index of the active slide (0..length-1), used by tabs
    currentIndex: number;
    // Position within the cloned slide track that the transform points at
    displayIndex: number;
    // Whether the track should animate (false during the seamless snap)
    animate: boolean;
    // Move one slide in a direction (-1 left, +1 right) with seamless wrap
    handleStep: (direction: number) => void;
    // Jump directly to a logical index (used by tabs)
    handleIndexChange: (newIndex: number) => void;
    // Notify when user hovers over carousel (pauses auto-scroll)
    handleHover: (hovering: boolean) => void;
    // Fires when the track finishes sliding, used to snap off a clone
    handleTransitionEnd: (e: TransitionEvent) => void;
    // List of React elements to display in the carousel
    dataList: React.ReactNode[];
    // Reference to each slide for accessibility
    slideRefs: React.RefObject<(HTMLDivElement | null)[]>;
}>({
    currentIndex: 0,
    displayIndex: 0,
    animate: true,
    handleStep: () => {},
    handleIndexChange: () => {},
    handleHover: () => {},
    handleTransitionEnd: () => {},
    dataList: [],
    slideRefs: { current: [] }
});

/**
 * Creates a button to navigate forward or backward in carousel order
 *
 * @param direction 'left' or 'right' to indicate button direction
 * @param className optional additional class names
 * @param size 'small' for DiscoverCarousel, 'large' for ProjectCarousel
 * @returns A button to move the carousel in the direction specified
 */
export const CarouselButton = ({
    direction,
    className = '',
    size = 'large',
}: {
    direction: 'left' | 'right';
    className?: string;
    size: 'small' | 'large';
}) => {
    const { handleStep } = useContext(CarouselContext);
    // +1 or -1 based on direction
    const directionNum = direction === 'left' ? -1 : 1;

    return (
        <button
            className={`${className} carousel-btn-${direction}`}
            onClick={() => handleStep(directionNum)}
            aria-label={direction === 'left' ? 'Go to previous slide' : 'Go to next slide'}
        >
            <ThemeIcon
                id={size === 'small' ? 'dropdown-arrow' : 'carousel-arrow'}
                width={size === 'small' ? 17 : 24}
                height={size === 'small' ? 18 : 68}
                className={'color-fill'}
                aria-hidden={true}
            />
        </button>
    );
};

/**
 * Displays a series of buttons (tabs) to indicate current carousel item and allow navigation.
 *
 * @param className optional additional class names
 * @returns A JSX div element containing navigation buttons for the carousel
 */
export const CarouselTabs = ({ className = '' }: { className?: string }) => {
    const { currentIndex, handleStep, handleIndexChange, dataList } = useContext(CarouselContext);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        let newIndex = currentIndex;

        if (e.key === 'ArrowRight')
            newIndex = 1;
        else if (e.key === 'ArrowLeft')
            newIndex = -1;
        else
            return; // Don't intercept other keys

        e.preventDefault();
        e.stopPropagation();
        handleStep(newIndex);
        
        // Shift keyboard focus to new tab
        setTimeout(() => {
            tabRefs.current[newIndex]?.focus();
        }, 0);
    };

    return (
        <div 
            className={`carousel-tabs ${className}`}
            role="tablist"
            aria-label="Carousel slides"
            onKeyDown={handleKeyDown}
        >
            {dataList.map((_, index) => {
                const isActive = index === currentIndex;

                return (
                    <button
                        className={`carousel-tab${isActive ? ' carousel-tab-active' : ''}`}
                        onClick={() => handleIndexChange(index)}
                        aria-selected={isActive}
                        aria-label={`Go to slide ${index + 1}`}
                        tabIndex={isActive ? 0 : -1}
                        key={index}
                    ></button>
                );
            })}
        </div>
    );
};

// Only displays the current index of dataList (dataList MUST be an array of elements to work)
/**
 * Displays the current carousel item(s) and handles hover interactions.
 *
 * To allow the first and last slides to wrap into each other smoothly, a clone
 * of the last slide is prepended and a clone of the first slide is appended.
 * The transform points at `displayIndex` within this cloned track.
 *
 * @param className optional additional class names
 * @returns A JSX div element containing carousel content elements
 */
export const CarouselContent = ({ className = '' }: { className?: string }) => {
    const { displayIndex, animate, handleHover, handleTransitionEnd, dataList, slideRefs } =
        useContext(CarouselContext);

    const hasClones = dataList.length > 1;
    // [cloneOfLast, ...slides, cloneOfFirst] when there is more than one slide.
    const slides = hasClones
            ? [dataList[dataList.length - 1], ...dataList, dataList[0]]
            : dataList;

    return (
        <div className="carousel-contents" onTransitionEnd={handleTransitionEnd}>
            {slides.map((data, index) => {
                const isActive = index === displayIndex;
                
                // Calculate logical index. Only assign refs to the actual slides, not clones.
                const logicalIndex = hasClones ? index - 1 : index;
                const isRealSlide = logicalIndex >= 0 && logicalIndex < dataList.length;

                return (
                    <div
                        ref={(el) => { 
                            if (slideRefs.current && isRealSlide) {
                                slideRefs.current[logicalIndex] = el;
                            } 
                        }}
                        className={className}
                        key={index}
                        onMouseEnter={() => handleHover(true)}
                        onMouseLeave={() => handleHover(false)}
                        style={{
                            transform: `translate(-${displayIndex * 100}%)`,
                            // Disable the CSS transition only for the instant snap off a clone
                            transition: animate ? undefined : 'none',
                        }}
                        inert={!isActive ? true : undefined}
                    >
                        {data}
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Primary carousel provider component that manages state and auto-scrolling.
 * @param dataList array of React elements to display in the carousel
 * @param children nested carousel components like CarouselButton, CarouselTabs, CarouselContent
 * @returns A JSX Context Provider wrapping the carousel children
 */
export const Carousel = ({
    dataList = [],
    children,
}: {
    dataList?: ReactNode[];
    children: ReactNode;
}) => {
    const length = dataList.length;
    const hasClones = length > 1;

    // Position within the cloned track. Real slide i lives at displayIndex i+1
    // (the prepended last-slide clone occupies index 0).
    const [displayIndex, setDisplayIndex] = useState(hasClones ? 1 : 0);
    // Whether the track animates. Briefly false while snapping off a clone.
    const [animate, setAnimate] = useState(true);
    // Whether the user is hovering over the carousel (pauses auto-scroll)
    const [hovering, setHovering] = useState(false);

    // Boolean ref that temporarily disables auto-scroll after user interaction
    const skipAuto = useRef(false);
    // Guards against the snap running more than once per transition
    const snapping = useRef(false);

    // Logical (real) index for tabs/active state, accounting for clones.
    const currentIndex = hasClones
        ? (((displayIndex - 1) % length) + length) % length
        : displayIndex;

    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

    /**
     * Moves the track by one step, allowing it to land on a clone so the
     * first/last wrap looks like a normal single-slide move.
     * @param direction -1 (left) or +1 (right)
     */
    const advance = (direction: number) => {
        setAnimate(true);
        setDisplayIndex((prev) => {
            const next = prev + direction;
            // Clamp into the cloned-track range [0, length + 1]
            if (next < 0) return 0;
            if (hasClones && next > length + 1) return length + 1;
            if (!hasClones && next > length - 1) return length - 1;
            return next;
        });
    };

    /**
     * Step handler for the nav buttons. Pauses auto-scroll, then advances.
     */
    const handleStep = (direction: number) => {
        skipAuto.current = true;
        advance(direction);
    };

    /**
     * Jump directly to a logical slide index (used by the tab dots).
     * @param newIndex - Desired logical index to navigate to
     */
    const handleIndexChange = (newIndex: number) => {
        skipAuto.current = true;
        
        const activeContainer = slideRefs.current[currentIndex];
        const wasUserFocused = activeContainer && activeContainer.contains(document.activeElement);

        let targetedIndex = newIndex;
        if (newIndex > dataList.length - 1) {
            targetedIndex = 0;
        } else if (newIndex < 0) {
            targetedIndex = dataList.length - 1;
        }

        setAnimate(true);
        setDisplayIndex(hasClones ? targetedIndex + 1 : targetedIndex);

        if (wasUserFocused) {
            setTimeout(() => {
                const nextContainer = slideRefs.current[targetedIndex];
                if (nextContainer) {
                    // Focusable objects in new container
                    const focusableSelectors = 'a:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), [tabindex="0"]';
                    const firstFocusable = nextContainer.querySelector<HTMLElement>(focusableSelectors);
                    
                    // Focus the first one if there is one
                    if (firstFocusable) {
                        firstFocusable.focus({ preventScroll: true });
                    } else {
                        // If for some reason there are links missing
                        nextContainer.setAttribute('tabindex', '-1');
                        nextContainer.focus({ preventScroll: true });
                    }
                }
            }, 50); // Slight delay for DOM to update
        }
    };

    /**
     * When the track finishes sliding onto a clone, instantly (no animation)
     * jump to the matching real slide so the next move continues seamlessly.
     */
    const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName !== 'transform') return;
        if (!hasClones || snapping.current) return;

        if (displayIndex === 0) {
            // Landed on the clone of the last slide -> snap to the real last slide
            snapping.current = true;
            setAnimate(false);
            setDisplayIndex(length);
        } else if (displayIndex === length + 1) {
            // Landed on the clone of the first slide -> snap to the real first slide
            snapping.current = true;
            setAnimate(false);
            setDisplayIndex(1);
        }
    };

    /**
     * Called when the user hovers over the carousel.
     * @param hover - true if the mouse is over the carousel, false otherwise
     */
    const handleHover = (hover: boolean) => {
        if (hover) {
            skipAuto.current = true;
            setHovering(true);
        } else {
            setHovering(false);
        }
    };

    // Re-enable animation on the frame after a no-animation snap so the browser
    // paints the snapped position before transitions are turned back on.
    useEffect(() => {
        if (animate) return;
        const raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                setAnimate(true);
                snapping.current = false;
            })
        );
        return () => cancelAnimationFrame(raf);
    }, [animate]);

    // Reset to the first real slide whenever the slide count changes
    // (e.g. data loads in asynchronously). Snap without animating.
    useEffect(() => {
        setAnimate(false);
        setDisplayIndex(length > 1 ? 1 : 0);
        snapping.current = false;
    }, [length]);

    /**
     * Auto-scroll logic: advances carousel by one slide unless skipAuto or hovering is true.
     */
    useEffect(() => {
        const autoScroll = () => {
            if (skipAuto.current) {
                if (!hovering)
                    skipAuto.current = false;
                return;
            }

            advance(1);
        };

        const interval = setInterval(autoScroll, 10_000);
        return () => clearInterval(interval);
    }, [dataList.length, hovering]);

    const handleGlobalCarouselArrows = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            handleStep(1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            e.stopPropagation();
            handleStep(-1);
        }
    };

    return (
        <CarouselContext.Provider
            value={{
                currentIndex,
                displayIndex,
                animate,
                handleStep,
                handleIndexChange,
                handleHover,
                handleTransitionEnd,
                dataList,
                slideRefs,
            }}
        >
            <div onKeyDown={handleGlobalCarouselArrows}>
                {children}
            </div>
        </CarouselContext.Provider>
    );
};