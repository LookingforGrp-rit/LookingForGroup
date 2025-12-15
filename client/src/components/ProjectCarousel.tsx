import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import placeholderThumbnail from '../images/project_temp.png'; // if this gets used, use preloader function in /functions/imageLoad.tsx
import { ProjectDetail } from '@looking-for-group/shared';

/**
 * Displays a carousel of project images.
 * Uses project-specific images if available, otherwise falls back to a placeholder thumbnail.
 * Provides navigation buttons and tabs to switch between images.
 *
 * @param project - ProjectDetail object containing project information and images
 * @returns JSX element rendering a carousel for the project
 */
export const ProjectCarousel = ({ project }: { project: ProjectDetail }) => {
    /**
     * carouselContents
     * Array of JSX <img> elements to display in the carousel.
     * - Falls back to a default placeholder if project has no images.
     * - Each <img> element has an onError handler to swap to a placeholder if the image fails to load.
     */
    const carouselContents = (!project.projectImages || project.projectImages.length === 0)
    ? [<img src={`/assets/project_temp-DoyePTay.png`} />]
    : project.projectImages.map((imageData) => (
        <img
            src={imageData.image}
            onError={(e) => {
                const projectImg = e.target as HTMLImageElement;
                projectImg.src = placeholderThumbnail;
            }}
        />
    ))

    return (
        <Carousel dataList={carouselContents}>
            <div className='project-carousel'>
                <CarouselContent className='project-carousel-content' />
                <div className='carousel-row'>
                    <CarouselButton 
                        direction='left'
                        className='project-carousel-btn'
                        size='small'
                    />
                    <CarouselTabs className='project-carousel-tabs'></CarouselTabs>
                    <CarouselButton 
                        direction='right'
                        className='project-carousel-btn'
                        size='small'
                    />
                </div>
                {/* <div className='carousel-row'>
                </div> */}
            </div>
        </Carousel>
    );
};
