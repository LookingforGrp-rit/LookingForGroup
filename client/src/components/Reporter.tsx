import { useEffect, useState, useRef } from "react";
import profilePicture from "../images/lfrog.png";
import usePreloadedImage from "../functions/imageLoad";
import { routes } from "../constants/routes";
import { getUsersById } from "../api/users";
import { UserDetail } from "@looking-for-group/shared";
import { sendModeratorNotification } from "../api/mod-tools";

interface ProjectPanelProps {
    reporterId: number;
    modUserId: number;
    reason: string;
}

const Reporter = ({ reporterId, modUserId, reason }: ProjectPanelProps) => {
    // Variables ==============================================================
    // Reporter detail
    const [reporter, setReporter] = useState<UserDetail>();

    // Open state
    const [messageBoxOpen, setMessageBoxOpen] = useState<boolean>(false);

    // Message holders
    const subject = useRef<HTMLInputElement>(null);
    const message = useRef<HTMLTextAreaElement>(null);

    // Loaders ================================================================
    /**
     * Gets the reporter's detail
     */
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

    // Load profile image
    const imageSrc = usePreloadedImage(
        reporter?.profileImage ?? profilePicture,
        profilePicture,
    );

    useEffect(() => {
        getReporter();
    }, [reporterId]);

    // Helper Methods =========================================================
    /**
     * Sends the notification to the reporter and refresh page upon success
     * TODO: Probably a different feedback than refresh but this for now
     */
    const sendMessage = async () => {
        try {
            const res = await sendModeratorNotification({
                modUserId: modUserId,
                receiverId: reporterId,
                subjectLine: subject.current?.value ?? '',
                message: message.current?.value ?? '',
                type: "General",
            });

            if (res.status === 201) {
                // refresh page
                window.location.reload();
            }
        } catch (e) {
            console.error('Error in sendMessage ', e);
        }
    };

    // Content ================================================================
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
                                ref={subject}
                            ></input>
                            <textarea
                                placeholder="Write your message here..."
                                className="input input-multiline"
                                ref={message}
                            ></textarea>
                            <div className="message-actions">
                                <button className="cancel-btn" onClick={() => setMessageBoxOpen(false)}>Cancel</button>
                                <button className="confirm-btn" onClick={() => sendMessage()}>Send</button>
                            </div>
                        </div>
                    )}
                </div>
                <p style={{ whiteSpace: "pre-wrap" }}>Reason: {reason}</p>
            </div>
        </>;
    } else {
        return <>
            <div className='placeholder-spacing'>
                <div className='spinning-loader'></div>
            </div>
        </>;
    }
};

export default Reporter;