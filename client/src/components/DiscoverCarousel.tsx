import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import usePreloadedImage from "../functions/imageLoad";
import { Project } from "@looking-for-group/shared";

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

export const DiscoverCarousel = ({ dataList = [] }) => {
    const projectImg = usePreloadedImage(`${API_BASE}/images/thumbnails/`, placeholderThumbnail);

    // Creates HTML elements from data, passed into the carousel
    const carouselContents = dataList.map((project: Project) => {
        return (
            <>
                <div className='discover-project-image'>
                <img
                    src={projectImg}
                    alt={'project image'}
                />
                </div>
                <div className='discover-project-about'>
                    <h2>{project.title}</h2>
                    <p>{project.hook}</p>
                    <a 
                        className='learn-more'
                        href={`${paths.routes.NEWPROJECT}?projectID=${project.projectId}`}
                    >Learn more -&gt;</a>
                </div>
            </>
        );
    });

    return (
        <Carousel dataList={carouselContents}>
            <div className='discover-carousel'>
                <div className='carousel-row'>
                    <CarouselButton 
                        direction='left'
                        className='discover-carousel-btn' 
                    />
                    <CarouselContent className='discover-carousel-content' />
                    <CarouselButton
                        direction='right'
                        className='discover-carousel-btn'
                    />
                </div>
                <div className='carousel-row'>
                    <CarouselTabs className='discover-carousel-tabs' />
                </div>
            </div>
        </Carousel>
    );
};