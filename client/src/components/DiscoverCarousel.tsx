import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import { Tag } from "./Tag";
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import { ProjectWithFollowers } from "@looking-for-group/shared";

type DiscoverCarouselProps = {
  dataList? : ProjectWithFollowers[]
};

/**
 * Carousel component used on the Discover page to showcase a list of projects.
 * Converts an array of project data into visual carousel slides, each displaying
 * a thumbnail, title, hook, and a link to the project’s detailed view.
 *
 * @param dataList - Array of project objects used to generate carousel items. Defaults to an empty array.
 * @returns A styled carousel populated with dynamically generated project slides.
 */
export const DiscoverCarousel : React.FC<DiscoverCarouselProps> = ({ dataList = [] }) => {

    // Generate the content slides for the carousel based on the project data
    const carouselContents = dataList.map((project: ProjectWithFollowers) => {
        return (
            <>
                <div className='discover-project-image'>
                <a href={`${paths.routes.NEWPROJECT}?projectID=${project.projectId}`}>
                  <img
                    src={project.thumbnail?.image ?? placeholderThumbnail}
                    alt={'project image'}
                  />
                </a>
                </div>
                <div className='discover-project-about'>
                    <a className='discover-link' href={`${paths.routes.NEWPROJECT}?projectID=${project.projectId}`}>
                      <h2>{project.title}</h2>
                    </a>
                    <p>{project.hook}</p>
                    <div className="project-tags">
                      {
                        //If more tag types are usable, use commented code for cases
                        //Also, check to see how many additional tags a project has
                        (project.tags) ?
                        project.tags.map((tag, index) => {
                          if (index < 3) {
                            return (
                              <Tag key={index} type={tag.type.toLowerCase()}>
                                <p>{tag.label}</p>
                              </Tag>
                            );
                          } else if (index === 3) {
                            return (
                              <Tag key={index}>
                                <p>{"+" + (project.tags.length - 3).toString()}</p>
                              </Tag>
                            );
                          }
                        })
                        :
                        <></>
                      }
                  </div>
                    <a 
                        className='discover-link learn-more'
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