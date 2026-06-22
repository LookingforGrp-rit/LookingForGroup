import { MouseEventHandler } from 'react';
import arrow from '../../../public/images/icons/s-arrow.png';

interface CreateProfileRedirectProps {
    show: boolean;
    onBack: MouseEventHandler<HTMLButtonElement>;
    onNext: MouseEventHandler<HTMLButtonElement>;
}

const CreateProfileRedirect: React.FC<CreateProfileRedirectProps> = ({ show, onNext, onBack }) => {
    if (!show) {
        return null;
    }
    return (
        <div className="signupProcess-background">
            <div className="signupProcess-modal" id="create-profile-redirect-modal">
                <div className="CreateProfileRedirect">
                    <div id="create-profile-redirect-text">
                        <h1 id="signupProcess-title">Your LFG account is almost complete!</h1>
                        <p>Let's start personalizing your profile.</p>
                    </div>

                    <div id="signupProcess-btns">
                        <button id="signup-backBtn" onClick={onBack}>
                            <img src={arrow} alt="Left arrow" id="signup-leftArw"></img>
                            Back
                        </button>
                        <button id="signup-nextBtn" onClick={onNext}>
                            Next
                            <img src={arrow} alt="Right arrow" id="signup-rightArw"></img>
                        </button>
                    </div>
                </div>
            </div>
        </div>);
};

export default CreateProfileRedirect;