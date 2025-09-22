import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import placeholderThumbnail from '../images/project_temp.png'; // if this gets used, use preloader function in /functions/imageLoad.tsx
import { ProjectDetail } from '@looking-for-group/shared';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

export const ProjectCarousel = ({ project }: { project: ProjectDetail }) => {
    // If no images exist, just use the thumbnail
    const carouselContents = (!project.images || project.images.length === 0)
    ? [<img src={`/assets/project_temp-DoyePTay.png`} />]
    : project.images.map((imageData) => (
        <img
            src={`${API_BASE}/images/projects/${imageData.image}`}
            onLoad={(e) => {
                const projectImg = e.target as HTMLImageElement;
                projectImg.src = `${API_BASE}/images/projects/${imageData.image}`;
            }}
            onError={(e) => {
                const projectImg = e.target as HTMLImageElement;
                projectImg.src = placeholderThumbnail;
            }}
        />
    ))

    return (
        <Carousel dataList={carouselContents}>
            <div className='project-carousel'>
                <div className='carousel-row'>
                    <CarouselContent className='project-carousel-content' />
                </div>
                <div className='carousel-row'>
                    <CarouselButton 
                        direction='left'
                        className='project-carousel-btn' 
                    />
                    <CarouselTabs className='project-carousel-tabs'></CarouselTabs>
                    <CarouselButton 
                        direction='right'
                        className='project-carousel-btn' 
                    />
                </div>
            </div>
        </Carousel>
    );
};
