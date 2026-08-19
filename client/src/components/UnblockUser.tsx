import profilePicture from "../images/lfrog.png";
import { ThemeIcon } from "./ThemeIcon";
import usePreloadedImage from "../functions/imageLoad";
import { routes } from "../constants/routes";
import { unblockUser as unblockUserAPI } from "../api/users";
import { UserPreview } from "@looking-for-group/shared";

interface UnblockUserProps {
    user: UserPreview;
    onUnblock: CallableFunction;
}

const UnblockUser = ({ user, onUnblock }: UnblockUserProps) => {
    // Hooks ==================================================================

    // Helper Methods =========================================================
    // Load profile image
    const imageSrc = usePreloadedImage(
        user.profileImage ?? profilePicture,
        profilePicture,
    );

    /**
     * Unblocks user and remove from rendered list by using the callback once
     * unblock is successful
     * @param userId User Id
     */
    const unblockUser = async (userId: number) => {
        const res = await unblockUserAPI(userId);
        if (res.status === 204) {
            onUnblock(userId);
        } else {
            console.error('Error in unblockUser', res.error);
        }
    }

    // Final Component ========================================================
    return <>
        <div className="blocked-user">
            <a href={`${routes.PROFILE}?userID=${user.userId}`}>
                <img
                    className="blocked-user-profile"
                    src={imageSrc}
                    alt={`${user.firstName} ${user.lastName}'s profile picture`}
                    onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profilePicture;
                    }}
                ></img>
                <p>{user.firstName} {user.lastName}</p>
            </a>
            <button className="remove-blocklist-btn" onClick={() => unblockUser(user.userId)}>
                <ThemeIcon id={'trash'} width={25} height={25} className={'mono-fill'} ariaLabel={'remove from blocklist'} />
                Remove
            </button>
        </div>
    </>;
};

export default UnblockUser;