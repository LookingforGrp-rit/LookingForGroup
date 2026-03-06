import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { ThemeIcon } from './ThemeIcon';

// This post was used to help create this component (found by Ben Gomez)
// https://blog.bitsrc.io/simple-carousel-in-react-2aac73887243

const CarouselContext = createContext<{
    // Index of the currently visible carousel item
    currentIndex: number;
    // Function to set the current index (wraps around boundaries)
    handleIndexChange: (newIndex: number) => void;
    // Function to notify when user hovers over carousel (pauses auto-scroll)
    handleHover: (hovering: boolean) => void;
    // List of React elements to display in the carousel
    dataList: React.ReactNode[];
}>({
    currentIndex: 0,
    handleIndexChange: () => {},
    handleHover: () => {},
    dataList: [],
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
    const { currentIndex, handleIndexChange } = useContext(CarouselContext);
    // +1 or -1 based on direction
    const directionNum = direction === 'left' ? -1 : 1;

    return (
        <button
            className={`${className} carousel-btn-${direction}`}
            onClick={() => handleIndexChange(currentIndex + directionNum)}
        >
            <ThemeIcon
                id={size === 'small' ? 'dropdown-arrow' : 'carousel-arrow'}
                width={size === 'small' ? 17 : 24}
                height={size === 'small' ? 18 : 68}
                className={'color-fill'}
                ariaLabel={direction === 'left' ? 'Previous Image' : 'Next Image'}
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
    const { currentIndex, handleIndexChange, dataList } = useContext(CarouselContext);

    return (
        <div className={`carousel-tabs ${className}`}>
            {dataList.map((_, index) => {
                const active = index === currentIndex ? ' carousel-tab-active' : '';
                return (
                    <button
                        className={`carousel-tab${active}`}
                        onClick={() => handleIndexChange(index)}
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
 * @param className optional additional class names
 * @returns A JSX div element containing carousel content elements
 */
export const CarouselContent = ({ className = '' }: { className?: string }) => {
    const { currentIndex, handleHover, dataList } = useContext(CarouselContext);

    return (
        <div className="carousel-contents">
            {dataList.map((data, index) => (
                <div
                    className={className}
                    key={index}
                    onMouseEnter={() => handleHover(true)}
                    onMouseLeave={() => handleHover(false)}
                    style={{ transform: `translate(-${currentIndex * 100}%)` }}
                >
                    {data}
                </div>
            ))}
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
    // Index of the currently active carousel slide
    const [currentIndex, setCurrentIndex] = useState(0);
    // Whether the user is hovering over the carousel (pauses auto-scroll)
    const [hovering, setHovering] = useState(false);

    // Boolean ref that temporarily disables auto-scroll after user interaction
    // Prevents auto-scroll immediately after user clicks a button or hovers
    const skipAuto = useRef(false);

    /**
     * Changes the current slide index, wrapping around if it exceeds bounds.
     * Also sets skipAuto to true to prevent immediate auto-scroll after manual navigation.
     *
     * @param newIndex - Desired index to navigate to
     */
    const handleIndexChange = (newIndex: number) => {
        skipAuto.current = true;
        if (newIndex > dataList.length - 1) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = dataList.length - 1;
        }

        setCurrentIndex(newIndex);
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

    /**
     * Auto-scroll logic: advances carousel by one slide unless skipAuto or hovering is true.
     * Wraps around at the end of dataList.
     */
    const autoScroll = () => {
        if (skipAuto.current) {
            if (hovering) {
                return;
            } else {
                skipAuto.current = false;
                return;
            }
        }

        if (currentIndex === dataList.length - 1) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // Interval effect to automatically scroll carousel every 10 seconds
    // Stops scrolling when user interacts (hover or button click)
    useEffect(() => {
        const interval = setInterval(() => {
            autoScroll();
        }, 10_000);

        return () => clearInterval(interval);
    });

    return (
        <CarouselContext.Provider
            value={{ currentIndex, handleIndexChange, handleHover, dataList }}
        >
            {children}
        </CarouselContext.Provider>
    );
};
