import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import { ProjectWithFollowers } from "@looking-for-group/shared";


export const DiscoverCarousel = ({ dataList = [] }) => {

    // Creates HTML elements from data, passed into the carousel
    const carouselContents = dataList.map((project: ProjectWithFollowers) => {
        return (
            <>
                <div className='discover-project-image'>
                <img
                    src={project.thumbnail?.image ?? placeholderThumbnail}
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
                        size='large'
                    />
                    <CarouselContent className='discover-carousel-content' />
                    <CarouselButton
                        direction='right'
                        className='discover-carousel-btn'
                        size='large'
                    />
                </div>
                <div className='carousel-row'>
                    <CarouselTabs className='discover-carousel-tabs' />
                </div>
            </div>
        </Carousel>
    );
};