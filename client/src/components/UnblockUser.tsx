import { useEffect, useState } from "react";
import profilePicture from "../images/lfrog.png";
import { ThemeIcon } from "./ThemeIcon";
import usePreloadedImage from "../functions/imageLoad";
import { routes } from "../constants/routes";
import { unblockUser } from "../api/users";
import { UserPreview } from "@looking-for-group/shared";

interface UnblockUserProps {
    user: UserPreview;
}

const UnblockUser = ({ user }: UnblockUserProps) => {
    // Hooks ==================================================================


    // Helper Methods =========================================================
    // Load profile image
    const imageSrc = usePreloadedImage(
        user.profileImage ?? profilePicture,
        profilePicture,
    );

    // Final Component ================================================================
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
            <button className="remove-blocklist-btn">
                <ThemeIcon id={'trash'} width={25} height={25} className={'color-fill'} ariaLabel={'remove from blocklist'} />
                Remove
            </button>
        </div>
    </>;
};

export default UnblockUser;