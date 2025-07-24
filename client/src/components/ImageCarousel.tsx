import { useState, useEffect, useRef } from 'react';
// import arrow from "../icons/s-arrow.png";
import image1 from '../images/blue_frog.png';
import image2 from '../images/banner.png';
import image3 from '../images/tall_img.png';
import { ThemeIcon } from './ThemeIcon';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

//To-do:
//Finish Discover page version of this component

//Default list of images to use
const imageList: string[] = [image1, image2, image3];

//Variable is identical in function to pages.
//warnings about this variable can be found in Joseph Dunne's page documentation
//All warnings shown about this variable in pages also applies to this one
const runningServer = true;

//This post was used to help create this component (found by Ben Gomez)
// https://blog.bitsrc.io/simple-carousel-in-react-2aac73887243

//Will need to take in a list of images to render
export const ImageCarousel = ({
  carouselType,
  dataList = imageList,
}: {
  carouselType: 'Project' | 'Discover';
  dataList?: string[];
}) => {
  //State variable tracking what the currently displayed image's index is
  const [currentIndex, setCurrentIndex] = useState(0);
  //State variable tracking whether or not the user's mouse is hovering over this component
  const [hovering, setHovering] = useState(false);

  const skipAuto = useRef(false);

  //Function to handle a change in which image index to use
  const handleIndexChange = (newIndex: number) => {
    //Skip next autoscroll due to button click
    skipAuto.current = true;
    if (newIndex > dataList.length - 1) {
      //If new index is greater than max index, set index to 0
      newIndex = 0;
    } else if (newIndex < 0) {
      //If new index is less than 0, set it to max index
      newIndex = dataList.length - 1;
    }

    //set new index
    setCurrentIndex(newIndex);
  };

  const handleHover = (hovering: boolean) => {
    if (hovering) {
      skipAuto.current = true;
      setHovering(true);
    } else {
      setHovering(false);
    }
  };

  //Function called regularly to automatically scroll through carousel images
  const autoScroll = () => {
    //Is a condition met to skip the next autoscroll?
    if (skipAuto.current) {
      //If so, is it caused by hovering?
      if (hovering) {
        //If so, skip function as well as next function
        return;
      } else {
        //If not, just skip this funciton
        skipAuto.current = false;
        return;
      }
    }

    //Otherwise, run function as normal
    if (currentIndex === dataList.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      autoScroll();
    }, 10_000);
    return () => clearInterval(interval);
  });

  const ProjectImageCarousel =
    dataList != null ? (
      <>
        {
          <>
            {/* Main image content of carousel */}
            <div
              id="project-image-carousel-content"
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
            >
              {dataList.map((image, index) => {
                const imageLink = runningServer ? `${API_BASE}/images/projects/${image}` : image;
                return (
                  <div
                    className="project-image-carousel-item"
                    key={index}
                    style={{ transform: `translate(-${currentIndex * 100}%)` }}
                  >
                    <img className="project-image-carousel-image" src={imageLink} />
                  </div>
                );
              })}
            </div>

            {/* Buttons for controlling carousel images */}
            <div id="project-image-carousel-buttons">
              <button
                onClick={() => handleIndexChange(currentIndex - 1)}
                id="project-image-carousel-left"
              >
                <ThemeIcon
                  light={'assets/arrow_light.png'}
                  dark={'assets/arrow_dark.png'}
                  alt={'left'}
                />
              </button>
              <div id="carousel-tabs">
                {dataList.map((image, index) => {
                  const className =
                    index === currentIndex ? 'carousel-tab carousel-tab-active' : 'carousel-tab';
                  return (
                    <button
                      className={className}
                      onClick={() => handleIndexChange(index)}
                      key={index}
                    >
                      <img />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleIndexChange(currentIndex + 1)}
                id="project-image-carousel-right"
              >
                <ThemeIcon
                  light={'assets/arrow_light.png'}
                  dark={'assets/arrow_dark.png'}
                  alt={'right'}
                />
              </button>
            </div>
          </>
        }
      </>
    ) : (
      <>No images could be loaded</>
    );

  const DiscoverCarousel =
    dataList != undefined ? (
      <>
        {
          <>
            <div id="discover-carousel-bar">
              <button
                onClick={() => handleIndexChange(currentIndex - 1)}
                id="discover-carousel-left"
              >
                <ThemeIcon
                  light={'assets/arrow_light.png'}
                  dark={'assets/arrow_dark.png'}
                  alt={'left'}
                />
              </button>
              <div
                id="discover-carousel-content"
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
              >
                {dataList.map((image, index) => (
                  <div
                    className="discover-carousel-item"
                    key={index}
                    style={{ transform: `translate(-${currentIndex * 100}%)` }}
                  >
                    <img className="discover-carousel-image" src={image} />
                    <div className="discover-carousel-title">Title here</div>
                    <div className="discover-carousel-description">
                      Description here Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Cumque, quidem? Fugit deleniti reiciendis doloremque assumenda neque rem
                      repudiandae hic odit quaerat. Debitis dicta fugit expedita, quaerat autem
                      animi quia voluptatum quam magni minus ducimus, aliquam obcaecati numquam.
                      Quisquam similique laudantium doloremque pariatur expedita dicta suscipit
                      eligendi molestiae, harum iusto sequi.
                    </div>
                  </div>
                ))}
              </div>

              <button className="discover-carousel-link">
                Learn More
                <ThemeIcon
                  light={'assets/arrow_light.png'}
                  dark={'assets/arrow_dark.png'}
                  alt={'right'}
                />
              </button>

              <button
                onClick={() => handleIndexChange(currentIndex + 1)}
                id="discover-carousel-right"
              >
                <ThemeIcon
                  light={'assets/arrow_light.png'}
                  dark={'assets/arrow_dark.png'}
                  alt={'right'}
                />
              </button>
            </div>

            <div id="discover-carousel-tabs">
              <div id="carousel-tabs">
                {dataList.map((image, index) => {
                  const className =
                    index === currentIndex ? 'carousel-tab carousel-tab-active' : 'carousel-tab';
                  return (
                    <button
                      className={className}
                      onClick={() => handleIndexChange(index)}
                      key={index}
                    >
                      <img />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        }
      </>
    ) : (
      <>Data failed to load</>
    );

  switch (carouselType) {
    case 'Project':
      return ProjectImageCarousel;
    case 'Discover':
      return DiscoverCarousel;
    default:
      console.log('Something went wrong, make sure carouselType is correct');
      return ProjectImageCarousel;
  }
};
