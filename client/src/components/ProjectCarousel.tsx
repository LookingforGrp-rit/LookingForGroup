import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import placeholderThumbnail from '../images/project_temp.png'; // if this gets used, use preloader function in /functions/imageLoad.tsx
import { ProjectDetail } from '@looking-for-group/shared';

export const ProjectCarousel = ({ project }: { project: ProjectDetail }) => {
    // If no images exist, just use the thumbnail
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
