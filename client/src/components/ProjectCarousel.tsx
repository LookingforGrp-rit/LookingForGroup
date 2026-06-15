import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarousel";
import placeholderThumbnail from '../images/project_temp.png'; // if this gets used, use preloader function in /functions/imageLoad.tsx
import { ProjectDetail, ProjectVideo } from '@looking-for-group/shared';
import { getYouTubeEmbedURL } from "../functions/parseYoutube";

/**
 * Displays a carousel of project assets (videos and images).
 * Uses project-specific assets if available, otherwise falls back to a placeholder thumbnail.
 * Provides navigation buttons and tabs to switch between assets.
 *
 * @param project - ProjectDetail object containing project information and images
 * @param videos - Optional array of videos. This will eventually not be needed as it is added to the project object
 * @returns JSX element rendering a carousel for the project
 */
export const ProjectCarousel = ({ project, videos }: { project: ProjectDetail, videos?: ProjectVideo[] }) => {
    // Process the video elements into something displayable
    const videoElements = (videos || []).map((video, index) => {
        const embedUrl = getYouTubeEmbedURL(video.videoUrl); 
        if (!embedUrl) return null;
        
        return (
            <iframe
                key={`video-${index}`}
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', aspectRatio: '16/9', border: 'none', objectFit: 'cover' }}
            ></iframe>
        );
    }).filter(item => item !== null);

    // Process the images into a displayable element
    const imageElements = (project.projectImages && project.projectImages.length > 0)
        ? project.projectImages.map((imageData, index) => (
            <img
                key={`img-${index}`}
                src={imageData.image}
                onError={(e) => {
                    const projectImg = e.target as HTMLImageElement;
                    projectImg.src = placeholderThumbnail;
                }}
            />
        ))
        : [];

    // Combine the videos and images
    let carouselContents = [...videoElements, ...imageElements];
    
    // Place a placeholder as a fallback
    if (carouselContents.length === 0) {
        carouselContents = [<img key="placeholder" src={`/assets/bannerImages/project_temp.png`} />];
    }

    return (
        <Carousel dataList={carouselContents}>
            <div className='project-carousel'>
                <CarouselContent className='project-carousel-content' />
                {carouselContents.length > 1 ?
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
                </div> : ""}
                {/* <div className='carousel-row'>
                </div> */}
            </div>
        </Carousel>
    );
};
