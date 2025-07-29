import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import placeholderThumbnail from '../images/project_temp.png';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface ProjectImage {
  image: string;
}

interface ProjectData {
  images?: ProjectImage[];
}

export const ProjectCarousel = ({ project }: { project: ProjectData }) => {
    // If no images exist, just use thumbnail
    let carouselContents;

    if (!project.images) {
        carouselContents = [];
        carouselContents.push(<img src={`/assets/project_temp-DoyePTay.png`} />);
    } else {
        carouselContents = project.images.map((imageData: ProjectImage) => {
            console.log(imageData);
    
            return (
                <img src={`${API_BASE}/images/projects/${imageData.image}`} />
            );
        });
    }

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
