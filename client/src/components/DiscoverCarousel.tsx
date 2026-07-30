import { useState } from "react";
import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarousel";
import { Tag } from "./Tag";
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import { ProjectWithFollowers } from "@looking-for-group/shared";

import usePreloadedImage from '../functions/imageLoad.tsx';
import { Link, useNavigate } from "react-router-dom";
import { ImageLightbox } from "./ImageLightbox";

type DiscoverCarouselProps = {
  dataList?: ProjectWithFollowers[]
};

/**
 * Carousel component used on the Discover page to showcase a list of projects.
 * Converts an array of project data into visual carousel slides, each displaying
 * a thumbnail, title, hook, and a link to the project’s detailed view.
 *
 * @param dataList - Array of project objects used to generate carousel items. Defaults to an empty array.
 * @returns A styled carousel populated with dynamically generated project slides.
 */
export const DiscoverCarousel: React.FC<DiscoverCarouselProps> = ({ dataList = [] }) => {

  // Full-image viewer: holds the src of the image being viewed, or null when closed
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const navigate = useNavigate();

  if (dataList.length === 0) {
    return (
      <Carousel dataList={
        [
        <div style={{width: "100%", height: "301px"}}>
        </div>
        ]
      }>
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
  }

  // Generate the content slides for the carousel based on the project data
  const carouselContents = dataList.map((project: ProjectWithFollowers) => {
    return (
      <>
        <div className='discover-project-image'>
          <img
          // This checks if the image value for the project is null, and if so, uses a placeholder image
          // If there is a project image value, but the image doesnt exist or the value leads to nothing,
          // this will break and return no image, forcing the alt text to display
            src={project.thumbnail?.image ?? placeholderThumbnail}
          // A fix for this would be to usePreloadedImage, but for some reason this sometimes displays images of different projects
          // src={usePreloadedImage(`${project.thumbnail?.image}`, placeholderThumbnail)}
            alt={`${project.title} banner`}
          // Click to view the image full-size in the lightbox (navigation lives on the title & "Learn more" links)
            style={{ cursor: 'zoom-in' }}
            onClick={() => navigate(`${paths.routes.PROJECT}?projectID=${project.projectId}`)}
          />
        </div>
        <div className='discover-project-about'>
          <Link className='discover-link' to={`${paths.routes.PROJECT}?projectID=${project.projectId}`}>
            <h2>{project.title}</h2>
          </Link>
          <p>{project.hook}</p>
          <div className="project-tags">
            {
              //If more tag types are usable, use commented code for cases
              //Also, check to see how many additional tags a project has
              (project.tags) ?
                project.tags.map((tag, index) => {
                  if (index < 3) {
                    return (
                      <Tag key={index} type={tag.type.toLowerCase()}
                        selected={true}>
                        <p>{tag.label}</p>
                      </Tag>
                    );
                  } else if (index === 3) {
                    return (
                      <Tag key={index} selected={true}>
                        <p>{"+" + (project.tags.length - 3).toString()}</p>
                      </Tag>
                    );
                  }
                })
                :
                <></>
            }
          </div>
          <Link
            className='discover-link learn-more'
            to={`${paths.routes.PROJECT}?projectID=${project.projectId}`}
          >Learn more -&gt;</Link>

        </div>
      </>
    );
  });

  return (
    <>
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
    {lightboxSrc && (
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    )}
    </>
  );
};