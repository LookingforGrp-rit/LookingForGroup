import { CarouselButton, CarouselTabs, CarouselContent, Carousel } from "./ImageCarouselNew";
import { Tags } from "./Tags";
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
                          /* let category : string;
                          switch (tag.type) {
                          } */
                          let tag_color : string = "label-green";
                          switch(tag.type) {
                            case "Creative"    :
                              tag_color = "label-green";
                              break;
                            case "Technical"   :
                              tag_color = "label-blue";
                              break;
                            case "Games"       :
                              tag_color = "label-purple";
                              break;
                            case "Multimedia"  :
                              tag_color = "label-blue";
                              break;
                            case "Music"       :
                              tag_color = "label-orange";
                              break;
                            case "Other"       :
                              tag_color = "label-yellow";
                              break;
                            default:
                              tag_color = "label-grey";
                              break;
                          }

                          if (index < 3) {
                            return (
                              <Tags
                                className={`project-tag-label carousel-tag ` + tag_color}
                                key={index}
                              >
                                {tag.label}
                              </Tags>
                            );
                          } else if (index === 3) {
                            return (
                              <Tags
                                className={`project-tag-label carousel-tag label-grey`}
                                key={index}
                              >
                                {"+" + (project.tags.length - 3).toString()}
                              </Tags>
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