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
            <p>Looking For Group (LFG) is a platform designed to help connect developers and designers.
              Whether you are trying to bring a passion project to life or looking for a team to join,
              LFG provides the tools you need to connect and collaborate together.
              By signing up, you agree to our user guidelines.</p>

            <h2>Description of Services</h2>
            <ul>
              <li><b>Discover & Meet:</b> Browse through a feed of active projects looking for contributors,
                or seek out individuals who match the skill sets your team needs.</li>
              <li><b>Project Creation:</b> Easily pitch your ideas to the community by creating detailed
                project pages that outline your goals, required roles, and current progress.</li>
              <li><b>Project Management:</b> Keep track of the teams you've joined and
                the projects you lead through the "My Projects" dashboard.</li>
              <li><b>Professional Profiles:</b> Showcase your unique talents, background, and previous work
                through customizable user profiles so others can find exactly what you bring to the table.</li>
            </ul>

            <h2>User Guidelines</h2>
            <p>The following guidelines below help keep LFG a friendly, encouraging,
              and creative community for everyone to enjoy. If you see anyone or anything that violates these guidelines,
              please use our report feature to notify a moderator.</p>
            
            <h3>User Eligibility</h3>
            <ul>
            <li>
                 Users must be either presently affiliated with RIT (Student or Staff) or formerly affiliated with RIT (Alumni).
                 This is so we can focus on RIT students getting the help they need to get co-ops, internships, or future jobs.
            </li>
            </ul>

            <h3>Copyright</h3>
            <ul>
            <li>
                Users are responsible for following general U.S. copyright law (found <a href="https://www.copyright.gov/title17/" target="_blank">here</a>)
            </li>
            <li>
                <strong>Theft Is Not Tolerated. </strong>Projects found using stolen material will be taken down and should be reported.
                <ul>
                    <li>If a project uses a work without permission the user will be asked to remove the stolen work
                      or else the project will be deleted</li>
                </ul>
            </li>
            <li>
                Projects falling under Fair Use Guidelines (<a href="https://www.copyright.gov/fair-use/" target="_blank">U.S. Copyright Office Fair Use Index</a>)
                will not be taken down, however, Fair Use is never guaranteed in every case.
            </li>
            </ul>

            <h3>Banned Content</h3>
            <ul>
               <li>Content promoting/inciting hate, harassment, or discrimination are not tolerated on LFG.
                 As well as selling the project/products on the site. Such content will be taken down and will result in bans.
                   <ul>
                       <li>
                           We do not carry any responsibilities involving payment for hiring if complications occur.
                       </li>
                   </ul>
               </li>
               <li>
                  Sensitive content such as Suicide, real or disturbing depictions of violence, 
                  content that exploits children in any way and sexually explicit content should not be displayed in promotional images/videos.  
                   Projects with these themes should be tagged appropriately.   
               </li>
            </ul>

            <h3>AI Content</h3>
            <ul>
               <li>Projects must disclose use of AI</li>
               <li>AI used maliciously to violate copyright laws is strictly prohibited
                and will result in the project taken down and potential bans.</li>
               <li>All other rules on this website applies to AI generated content.</li>
            </ul>

            <h2>Data Protection and Security</h2>
            <ul>
              <li>We do not use cookies to store your data.</li>
              <li>Any projects along with assets placed upon the site belong to the owner. LFG does not claim ownership.</li>
            </ul>

            <h3>Data Collection</h3>
            <p>We store:</p>
            <ul>
              <li>RIT Email</li>
              <li>{"Full Name (first/preferred, last)"}</li>
              <li>Major</li>
              <li>Year</li>
              <li>{"Phone Number (optional)"}</li>
            </ul>
          </div>

          <div id="signupProcess-btns">
            <button id="signup-backBtn" onClick={onBack}>
              <svg width="70" height="25" id="back" className="color-fill scale-on-hover" aria-label="back"><use href="/assets/icons.svg#back"></use></svg>
            </button>
            <div id="accept-tos-section">
              <input type="checkbox" id="tos-checkbox" name="tos" onChange={() => setIsChecked(!isChecked)} />
              <label htmlFor="tos-checkbox" id="tos-accept-label">I accept the Terms of Service</label>
            </div>
            <button id="signup-nextBtn" onClick={onNext} ref={nextBtn} disabled={!isChecked}>
              <svg width="70" height="25" id="next" className="color-fill scale-on-hover" aria-label="next"><use href="/assets/icons.svg#next"></use></svg>

            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
