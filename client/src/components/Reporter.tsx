import { useEffect, useState } from "react";
import profilePicture from "../images/lfrog.png";
import usePreloadedImage from "../functions/imageLoad";
import { routes } from "../constants/routes";
import { getUsersById } from "../api/users";
import { UserDetail } from "@looking-for-group/shared";

interface ProjectPanelProps {
    reporterId: number;
}

const Reporter = ({ reporterId }: ProjectPanelProps) => {
    const [reporter, setReporter] = useState<UserDetail>();
    const [messageBoxOpen, setMessageBoxOpen] = useState<boolean>(false);

    // get reporter's detail
    const getReporter = async () => {
        try {
            const res = await getUsersById(reporterId);

            if (res.data) {
                setReporter(res.data);
            }
        } catch (e) {
            console.error('Error in getReporter: ', e);
        }
    };

    // load profile image
    const imageSrc = usePreloadedImage(
        reporter?.profileImage ?? profilePicture,
        profilePicture,
    );

    useEffect(() => {
        getReporter();
    }, [reporterId]);

    if (reporter) {
        return <>
            <div id="reporter">
                <p className="reporter-header">Reporter</p>
                <div>
                    <a
                        href={`${routes.PROFILE}?userID=${reporter.userId}`}
                        className="reporter-profile"
                    >
                        <img
                            src={imageSrc}
                            alt={`${reporter.firstName} ${reporter.lastName}'s avatar`}
                            onError={(e) => {
                                const profileImg = e.target as HTMLImageElement;
                                profileImg.src = profilePicture;
                            }}
                        ></img>
                        <p>{reporter.firstName} {reporter.lastName}</p>
                    </a>
                    {!messageBoxOpen && (
                        <button
                            className="open-btn"
                            onClick={() => setMessageBoxOpen(true)}
                        >
                            Message {reporter.firstName}
                        </button>
                    )}
                    {messageBoxOpen && (
                        <div className="message-area">
                            <input
                                placeholder="Subject"
                                className="input"
                            ></input>
                            <textarea
                                placeholder="Write your message here..."
                                className="input input-multiline"
                            ></textarea>
                            <div className="message-actions">
                                <button className="cancel-btn" onClick={() => setMessageBoxOpen(false)}>Cancel</button>
                                <button className="confirm-btn">Send</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>;
    } else {
        return <>
            <div>
                <p>Loading...</p>
            </div>
        </>;
    }
};

export default Reporter;