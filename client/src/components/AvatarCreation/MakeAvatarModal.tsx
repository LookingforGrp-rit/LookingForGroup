import React, { useState, useEffect } from 'react';
import './makeAvatar.css';

// avatar types and images for each color (three variations each animal)
const avatars = {
  cat: [
    'images/avatars/blackCat.png',
    'images/avatars/orangeCat.png',
    'images/avatars/whiteCat.png',
  ],
  dog: ['images/avatars/brownDog.png', 'images/avatars/blackDog.png', 'images/avatars/tanDog.png'],
  frog: [
    'images/avatars/greenFrog.png',
    'images/avatars/bluegreenFrog.png',
    'images/avatars/blueFrog.png',
  ],
  fox: ['images/avatars/orangeFox.png', 'images/avatars/redFox.png', 'images/avatars/tanFox.png'],
};

// array of hat images and alt text
// these hat images are not centered,
// it's the same size as the avatar images, and positioned based on the cat avatar to be the right height
// ex. if you place these images directly on top of the cat avatar, they will be positioned correctly
// in the case of the frog, since it's head is a bit lower, it uses it's own className and just lowers the hat position
const displayHats = [
  { src: 'images/icons/noItem.png', alt: 'none' },
  { src: 'images/hats/pinkBow.png', alt: 'pink bow' },
  { src: 'images/hats/flowerCrown.png', alt: 'flower crown' },
  { src: 'images/hats/plant.png', alt: 'plant' },
  { src: 'images/hats/mushrooms.png', alt: 'mushrooms' },
  { src: 'images/hats/cowboyHat.png', alt: 'cowboy hat' },
  { src: 'images/hats/wizardHat.png', alt: 'wizard hat' },
  { src: 'images/hats/chefsHat.png', alt: "chef's hat" },
  { src: 'images/hats/topHat.png', alt: 'top hat' },
  { src: 'images/hats/trafficCone.png', alt: 'orange traffic cone' },
  { src: 'images/hats/partyHat.png', alt: 'party hat' },
  { src: 'images/hats/halo.png', alt: 'halo' },

  // More hat ideas:
  // witch hat
  // santa hat
  // crown
  // baseball cap
  // graduation cap
  // astronaut helmet
];

// array of hat images and alt text for the hat option boxes
// these images are different, the hats are centered in the image
const hatIcons = [
  { src: 'images/icons/noItem.png', alt: 'none' },
  { src: 'images/icons/avatar-options/hats/pinkBowCenter.png', alt: 'pink bow' },
  { src: 'images/icons/avatar-options/hats/flowerCrownCenter.png', alt: 'flower crown' },
  { src: 'images/icons/avatar-options/hats/plantCenter.png', alt: 'plant' },
  { src: 'images/icons/avatar-options/hats/mushroomsCenter.png', alt: 'mushrooms' },
  { src: 'images/icons/avatar-options/hats/cowboyHatCenter.png', alt: 'cowboy hat' },
  { src: 'images/icons/avatar-options/hats/wizardHatCenter.png', alt: 'wizard hat' },
  { src: 'images/icons/avatar-options/hats/chefsHatCenter.png', alt: "chef's hat" },
  { src: 'images/icons/avatar-options/hats/topHatCenter.png', alt: 'top hat' },
  { src: 'images/icons/avatar-options/hats/trafficConeCenter.png', alt: 'orange traffic cone' },
  { src: 'images/icons/avatar-options/hats/partyHatCenter.png', alt: 'party hat' },
  { src: 'images/icons/avatar-options/hats/haloCenter.png', alt: 'halo' },
];

// array of clothes images and alt text
const displayClothes = [
  { src: 'images/icons/noItem.png', alt: 'none' },
  { src: 'images/clothes/pinkDress.png', alt: 'pink ballerina dress' },
  { src: 'images/clothes/overalls.png', alt: 'overalls' },
  { src: 'images/clothes/cowboyVest.png', alt: "cowboy vest eith sherrif's badge" },
  { src: 'images/clothes/darkJacket.png', alt: 'dark jacket' },
  { src: 'images/clothes/safetyVest.png', alt: 'orange safety vest' },
  { src: 'images/clothes/sailorDress.png', alt: 'sailor dress' },
  { src: 'images/clothes/pinkSweater.png', alt: 'pink sweater' },

  // More clothes ideas:
  // tuxedo
  // plain t-shirt
  // hoodie
  // astronaut suit
  // underwear
  // pajamas
  // lab coat

  // recognizeable outfits from tv shows or movies
  // silly idea
  // mario, luigi, peach, toad, bowser, yoshi, etc.
  // pokemon trainer
  // disney princesses or other characters
  // phineas and ferb outfits
  // kim possible
  // scooby doo's gang outfits
  // spongebob's squarepants
];

// array of clothes images and alt text for the clothes option boxes
const clothesIcons = [
  { src: 'images/icons/noItem.png', alt: 'none' },
  { src: 'images/icons/avatar-options/clothes/pinkDressCenter.png', alt: 'pink ballerina dress' },
  { src: 'images/icons/avatar-options/clothes/overallsCenter.png', alt: 'overalls' },
  {
    src: 'images/icons/avatar-options/clothes/cowboyVestCenter.png',
    alt: "cowboy vest eith sherrif's badge",
  },
  { src: 'images/icons/avatar-options/clothes/darkJacketCenter.png', alt: 'dark jacket' },
  { src: 'images/icons/avatar-options/clothes/safetyVestCenter.png', alt: 'orange safety vest' },
  { src: 'images/icons/avatar-options/clothes/sailorDressCenter.png', alt: 'sailor dress' },
  { src: 'images/icons/avatar-options/clothes/pinkSweaterCenter.png', alt: 'pink sweater' },
];

// array of accessory images and alt text
const displayAccessories = [
  { src: 'images/icons/noItem.png', alt: 'none' },
  { src: 'images/accessories/cyberGlasses.png', alt: 'cyber glasses' },
  { src: 'images/accessories/wand.png', alt: 'wand' },
  { src: 'images/accessories/cane.png', alt: 'cane' },
  { src: 'images/accessories/redCape.png', alt: 'red cape' },
  { src: 'images/accessories/wings.png', alt: 'wings' },

  // More accessory ideas:
  // necklace
  // purse
  // bowtie
  // tie
  // scarf
  // belt
  // staff
  // sword
  // shield
];

// array of accessory images and alt text for the accessory option boxes
const accessoryIcons = [
  { src: 'images/icons/noItem.png', alt: 'none' },
  { src: 'images/icons/avatar-options/accessories/cyberGlassesCenter.png', alt: 'cyber glasses' },
  { src: 'images/icons/avatar-options/accessories/wandCenter.png', alt: 'wand' },
  { src: 'images/icons/avatar-options/accessories/caneCenter.png', alt: 'cane' },
  { src: 'images/icons/avatar-options/accessories/redCapeCenter.png', alt: 'red cape' },
  { src: 'images/icons/avatar-options/accessories/wingsCenter.png', alt: 'wings' },
];

//
// MakeAvatarModal component
//
const MakeAvatarModal = ({ show, onClose, setAvatarImage, mode, onNext, onBack }) => {
  // initialize state variables
  const [slideIndex, setSlideIndex] = useState(1); // current slide index
  const [selectedAvatar, setSelectedAvatar] = useState('cat'); // current selected avatar type
  const [colorOptions, setColorOptions] = useState(avatars.cat); // color options for the selected avatar
  const [activeTab, setActiveTab] = useState('avatar-color'); // active customization tab (color or hats)

  // current color
  // start with the first color when switching between animals
  const [currentColors, setCurrentColors] = useState({
    cat: avatars.cat[0],
    dog: avatars.dog[0],
    frog: avatars.frog[0],
    fox: avatars.fox[0],
  });

  // current hats for each avatar when selected
  const [currentHats, setCurrentHats] = useState('');

  // current clothes for each avatar when selected
  const [currentClothes, setCurrentClothes] = useState('');

  // current accessories for each avatar when selected
  const [currentAccessories, setCurrentAccessories] = useState('');

  // states for active options
  // these are used to highlight the selected item in the options box
  // based on item index

  // color index for each avatar
  const [activeColor, setActiveColor] = useState({
    cat: 0,
    dog: 0,
    frog: 0,
    fox: 0,
  });

  // index of the active hat, clothes, and accessory
  const [activeHat, setActiveHat] = useState(0);
  const [activeClothes, setActiveClothes] = useState(0);
  const [activeAccessory, setActiveAccessory] = useState(0);

  // update color options when animal/selected avatar changes
  useEffect(() => {
    setColorOptions(avatars[selectedAvatar]);
  }, [selectedAvatar]);

  // change the slide index and update the selected avatar
  // scroll through each type of animal avatar
  const plusSlides = (n) => {
    // get the new slide index
    let newSlideIndex = slideIndex + n;
    // if the new slide index is greater than the total number of avatars, set it to 1
    const totalAvatars = Object.keys(avatars).length;
    if (newSlideIndex > totalAvatars) newSlideIndex = 1;
    // if the new slide index is less than 1, set it to the total number
    if (newSlideIndex < 1) newSlideIndex = totalAvatars;
    // set the new slide index and update the selected avatar
    setSlideIndex(newSlideIndex);
    setSelectedAvatar(Object.keys(avatars)[newSlideIndex - 1]);
  };

  // set the slide index to the value and update the selected avatar
  const currentSlide = (n) => {
    setSlideIndex(n);
    setSelectedAvatar(Object.keys(avatars)[n - 1]);
  };

  // change the selected item (hat, clothes, accessory)
  // index: index of the customization item
  // type: type of customization item (hat, clothes, accessory)
  const changeItems = (index, type) => {
    // get the item based on the index and type
    const items = {
      hat: displayHats[index] ? displayHats[index].src : null, // if the item doesn't exist, set to null
      clothes: displayClothes[index] ? displayClothes[index].src : null,
      accessory: displayAccessories[index] ? displayAccessories[index].src : null,
    };

    // get the current item for the selected avatar
    const currentItem = items[type];
    const noItem = 'images/icons/noItem.png'; // default no item image

    // if the item doesn't exist, return
    // image should always exist, but just in case
    if (!currentItem) return;

    // set the current item
    const currentItemState = {
      hat: setCurrentHats,
      clothes: setCurrentClothes,
      accessory: setCurrentAccessories,
    };

    // update the current item for all avatars
    // this is done to display the selected item on all avatars
    Object.keys(avatars).forEach((avatar) => {
      currentItemState[type]((prevItems) => ({
        ...prevItems,
        [avatar]: currentItem === noItem ? '' : currentItem,
      }));
    });

    // set the active item based on the index
    if (type === 'hat') setActiveHat(index);
    if (type === 'clothes') setActiveClothes(index);
    if (type === 'accessory') setActiveAccessory(index);
  };

  // change the color of the avatar
  const changeColor = (color, index) => {
    // update the color for the selected avatar
    setCurrentColors((prevColors) => ({
      ...prevColors,
      [selectedAvatar]: color,
    }));

    // update the active color based on the index
    setActiveColor((prevColors) => ({
      ...prevColors,
      [selectedAvatar]: index,
    }));
  };

  // get the class for the hat image
  // in the case where the hat needs to be in different locations for each avatar
  // based on the selected avatar to display the hat correctly (location)
  const getHatClass = (avatar) => {
    switch (avatar) {
      // frog avatar has a different hat position (slightly lower)
      case 'frog':
        return 'avatar-hat avatar-frog-hat';
      default:
        return 'avatar-hat';
    }
  };

  // if the modal is not shown, return null
  if (!show) {
    return null;
  }

  // save and update the avatar
  const updateAvatar = () => {
    // get the images in the displayed avatar
    const avatar = document.getElementById(`currentAvatar-${selectedAvatar}`) as HTMLImageElement;
    const hat = document.getElementById(`currentHat-${selectedAvatar}`) as HTMLImageElement;
    const outfit = document.getElementById(`currentClothes-${selectedAvatar}`) as HTMLImageElement;
    const accessory = document.getElementById(
      `currentAccessory-${selectedAvatar}`
    ) as HTMLImageElement;

    // check if the avatar, hat, and outfit exist (they always should but just in case)
    if (!avatar || !hat || !outfit || !accessory) return;

    // create a canvas to draw the images on
    const canvas = document.createElement('canvas');
    canvas.width = avatar.width;
    canvas.height = avatar.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // drawing the images on the canvas

    // draw the avatar
    ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height);

    // draw the hat
    // adjust the hat position based on the avatar
    // frog avatar has a different hat position
    if (selectedAvatar === 'frog') {
      ctx.drawImage(hat, 0, 10, hat.width, hat.height);
    } else {
      ctx.drawImage(hat, 0, 0, hat.width, hat.height);
    }

    // draw the outfit
    ctx.drawImage(outfit, 0, 0, outfit.width, outfit.height);

    // draw the accessory
    ctx.drawImage(accessory, 0, 0, accessory.width, accessory.height);

    // save the canvas as a new image and display in sidebar
    const newAvatar = canvas.toDataURL('image/png');
    setAvatarImage(newAvatar);

    // TODO: update the user's avatar in the database
  };

  let backgroundClassName = '';
  if (mode === 'signup') {
    // if the mode is signup, set the page background to the colorful image
    // else just have the transparent background
    backgroundClassName = 'signupProcess-background';
  } else {
    backgroundClassName = 'no-background';
  }

  // render the page
  return (
    <div className={backgroundClassName}>
      <div className="avatar-modal">
        <div className="MakeAvatar">
          {/* 
                        signup mode is a slightly different version, 
                        instead of a close (x) button and save button, it has a back and next button
                    */}

          {/* different titles based on the mode */}
          {mode === 'signup' ? (
            <h1 id="avatar-customize-title">Create Your Avatar</h1>
          ) : (
            <>
              {/* Close (x) button */}
              <div className="avatar-close-btn" onClick={onClose}>
                <img src="images/icons/cancel.png" alt="close" />
              </div>

              <h1 id="avatar-customize-title">Edit Avatar</h1>
            </>
          )}

          {/*************************************************************

                        Avatar Display

                    *************************************************************/}
          <div id="avatar-select">
            {/* previous button */}
            <button id="avatar-arrowBtn" onClick={() => plusSlides(-1)}>
              <img
                src="images/icons/s-arrow.png"
                alt="left arrow"
                className="avatar-left-btn avatar-btn-icon"
              />
            </button>

            {/* displayed avatar */}
            <div id="avatar">
              {/* avatar container */}
              <div className="avatar-slideshow">
                {Object.keys(avatars).map((key, index) => (
                  <div
                    className="avatar-slide"
                    key={key}
                    style={{ display: slideIndex === index + 1 ? 'flex' : 'none' }}
                  >
                    {/* avatar */}
                    <div className="myAvatar" id={key}>
                      <div id="avatar-hat-container">
                        <img
                          src={currentHats[key]}
                          alt="hat"
                          className={getHatClass(key)}
                          id={`currentHat-${key}`}
                        />
                      </div>

                      <img
                        src={currentColors[key]}
                        alt={key}
                        className="avatar-animals"
                        id={`currentAvatar-${key}`}
                      />

                      <div id="avatar-outfit-container">
                        <img
                          src={currentClothes[key]}
                          alt="clothes"
                          className="avatar-clothes"
                          id={`currentClothes-${key}`}
                        />
                      </div>

                      <div id="avatar-accessory-container">
                        <img
                          src={currentAccessories[key]}
                          alt="accessory"
                          className="avatar-accessories"
                          id={`currentAccessory-${key}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* dot indicators */}
              <div style={{ textAlign: 'center' }}>
                {Object.keys(avatars).map((_, index) => (
                  <span
                    className={`avatar-slide-dot ${slideIndex === index + 1 ? 'active-avatar' : ''}`}
                    key={index}
                    onClick={() => currentSlide(index + 1)}
                  ></span>
                ))}
              </div>
            </div>

            {/* next button */}
            <button id="avatar-arrowBtn" onClick={() => plusSlides(1)}>
              <img
                src="images/icons/s-arrow.png"
                alt="right arrow"
                className=" avatar-right-btn avatar-btn-icon"
              />
            </button>
          </div>

          {/* avatar customization options */}
          <div id="avatar-customization">
            <div id="avatar-customize-options">
              {/*************************************************************

                                Tabs 

                            *************************************************************/}
              <div className="avatar-tabs">
                <div
                  className={`avatar-tab-links ${activeTab === 'avatar-color' ? 'avatar-active-link' : ''}`}
                  onClick={() => setActiveTab('avatar-color')}
                >
                  <img
                    src="images/icons/paint-bucket.png"
                    alt="paint bucket"
                    className="avatar-icon"
                  />
                </div>
                <div
                  className={`avatar-tab-links ${activeTab === 'avatar-hats' ? 'avatar-active-link' : ''}`}
                  onClick={() => setActiveTab('avatar-hats')}
                >
                  <img src="images/icons/cowboy-hat.png" alt="hat" className="avatar-icon" />
                </div>
                <div
                  className={`avatar-tab-links ${activeTab === 'avatar-clothes' ? 'avatar-active-link' : ''}`}
                  onClick={() => setActiveTab('avatar-clothes')}
                >
                  <img
                    src="images/icons/clothes-hanger.png"
                    alt="clothes hanger"
                    className="avatar-icon"
                  />
                </div>
                <div
                  className={`avatar-tab-links ${activeTab === 'avatar-accessories' ? 'avatar-active-link' : ''}`}
                  onClick={() => setActiveTab('avatar-accessories')}
                >
                  <img src="images/icons/sunglasses.png" alt="sunglasses" className="avatar-icon" />
                </div>
              </div>

              {/*************************************************************

                                Color Variation Options

                            *************************************************************/}
              <div
                className={`avatar-tab-contents ${activeTab === 'avatar-color' ? 'avatar-active-tab' : ''}`}
                id="avatar-color"
              >
                <div className="avatar-options">
                  {colorOptions.map((color, index) => (
                    <div key={index} className="avatar-color-option">
                      <img
                        src={color}
                        alt={`avatar-color-option-${index}`}
                        className={`avatar-color ${activeColor[selectedAvatar] === index ? 'active-color' : ''}`}
                        onClick={() => changeColor(color, index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/*************************************************************

                                Hat Options

                            *************************************************************/}
              <div
                className={`avatar-tab-contents ${activeTab === 'avatar-hats' ? 'avatar-active-tab' : ''}`}
                id="avatar-hats"
              >
                <div className="avatar-options">
                  {hatIcons.map((hat, index) => (
                    <div
                      key={index}
                      className={`avatar-hat-option ${activeHat === index ? 'active-hat' : ''}`}
                      onClick={() => changeItems(index, 'hat')}
                    >
                      <img src={hat.src} alt={hat.alt} />
                    </div>
                  ))}
                </div>
              </div>

              {/*************************************************************

                                Clothing Options

                            *************************************************************/}
              <div
                className={`avatar-tab-contents ${activeTab === 'avatar-clothes' ? 'avatar-active-tab' : ''}`}
                id="avatar-clothes"
              >
                <div className="avatar-options">
                  {clothesIcons.map((clothes, index) => (
                    <div
                      key={index}
                      className={`avatar-clothes-option ${activeClothes === index ? 'active-clothes' : ''}`}
                      onClick={() => changeItems(index, 'clothes')}
                    >
                      <img src={clothes.src} alt={clothes.alt} />
                    </div>
                  ))}
                </div>
              </div>

              {/*************************************************************

                                Accessory Options 

                            *************************************************************/}
              <div
                className={`avatar-tab-contents ${activeTab === 'avatar-accessories' ? 'avatar-active-tab' : ''}`}
                id="avatar-accessories"
              >
                <div className="avatar-options">
                  {accessoryIcons.map((accessory, index) => (
                    <div
                      key={index}
                      className={`avatar-accessory-option ${activeAccessory === index ? 'active-accessory' : ''}`}
                      onClick={() => changeItems(index, 'accessory')}
                    >
                      <img src={accessory.src} alt={accessory.alt} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/*
           *    determine buttons based on the set mode
           *    one for signup with next and back buttons
           *    other for editing in the app with save button
           */}
          {mode === 'signup' ? (
            <div id="signupProcess-btns">
              <button id="avatar-backBtn" onClick={onBack}>
                Back
              </button>
              <button
                id="avatar-createBtn"
                onClick={() => {
                  updateAvatar();
                  onNext();
                }}
              >
                Next
              </button>
            </div>
          ) : (
            <button
              id="avatar-editBtn"
              onClick={() => {
                updateAvatar();
                onClose();
              }}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeAvatarModal;
