import React, { MouseEventHandler, useRef, useState } from 'react';
import arrow from '../../../public/images/icons/s-arrow.png';

interface TermsOfServiceProps {
  show: boolean;
  onBack: MouseEventHandler<HTMLButtonElement>;
  onNext: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Interface for users getting started providing a simple user interface for 
 * signing up and getting started with making projects on the website.
 * @param show Boolean for modal display (get)
 * @param onBack Callback for back button
 * @param onNext Callback for next button
 * @returns modal markup render if show is true
 */
const TermsOfService: React.FC<TermsOfServiceProps> = ({ show, onBack, onNext }) => {
  // Returns modal markup when true, null if not true
  if (!show) {
    return null;
  }

  const nextBtn = useRef<HTMLButtonElement>(null);

  /* Used to activate the next button when user agrees to ToS */
  const [isChecked, setIsChecked] = useState(false);

  // render the page
  return (
    <div className="signupProcess-background">
      <div className="signupProcess-modal" id="tos-modal">
        <div className="TermsOfService">
          <h1 id="signupProcess-title">Terms of Service</h1>
          <p id="signupProcess-subTitle">In order to use Looking for Group, you must agree to the Terms of Service.</p>

          <div id="terms-of-service-text">
            {/* I don't think the raw ToS text should be written here */}

            {/* Placeholder text, until ToS is finalized */}
            <h2>Introduction and Acceptance</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque quis faucibus libero. Integer mi eros, 
                imperdiet et cursus a, egestas a purus. Donec ut mi purus. Quisque pretium mollis risus vitae malesuada. 
                Morbi id laoreet tellus. Mauris quis sem vitae velit fermentum sagittis. Proin sit amet turpis elit. Ut a porta urna. 
                Sed dictum dictum diam nec commodo. Duis venenatis pretium dolor eu vehicula. Nullam dapibus velit ligula, 
                non elementum nisl maximus eget. Cras semper purus ac rhoncus auctor. Vivamus ut justo a eros porta hendrerit. 
                Ut in sapien ut orci tempus ullamcorper vel eget dolor.</p>

            <h2>Description of Services</h2>
            <p>Suspendisse lacinia quam eget dapibus sollicitudin. Pellentesque ullamcorper ac massa ac ullamcorper. 
                Ut libero diam, sodales et turpis sed, sollicitudin aliquet ligula. Vestibulum tempor lectus quis arcu venenatis porta. 
                Nullam pulvinar enim a dictum suscipit. Nunc sodales massa id metus vehicula gravida at nec neque. Donec venenatis tincidunt elit a feugiat. 
                Quisque porta a nulla id vestibulum. Phasellus malesuada, nibh sed consectetur commodo, odio justo fermentum risus, 
                vitae aliquet nunc nisi ut arcu. Duis lobortis dui in erat feugiat pharetra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Nulla fermentum sagittis risus ac sodales. Ut consectetur faucibus congue. Fusce ac tellus congue, porttitor ante.</p>
          </div>

          <div id="signupProcess-btns">
            <button id="signup-backBtn" onClick={onBack}>
              <img src={arrow} alt="Left arrow" id="signup-leftArw"></img>
              Back
            </button>
            <div id="accept-tos-section">
                <input type="checkbox" id="tos-checkbox" name="tos" onChange={() => setIsChecked(!isChecked)}/>
                <label htmlFor="tos-checkbox" id="tos-accept-label">I accept the Terms of Service</label>
            </div>
            <button id="signup-nextBtn" onClick={onNext} ref={nextBtn} disabled={!isChecked}>
              Next
              <img src={arrow} alt="Right arrow" id="signup-rightArw"></img>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
