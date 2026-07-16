import { useNavigate } from "react-router-dom";
import { Popup, PopupButton, PopupContent } from "../Popup";
import { deleteUser } from "../../api/users";
import * as paths from "../../constants/routes";

/**
 * Red "Delete Account" button shown next to "Save Changes" in the profile
 * editor. Opens a confirmation popup before permanently deleting the current
 * user's account, then returns them to the home page (where the now-invalid
 * session redirects to login).
 *
 * Modeled on DeleteProjectButton in the project editor.
 */
export const DeleteAccountButton = () => {
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    const res = await deleteUser();
    if (res.status === 200) {
      navigate(paths.routes.HOME);
      window.location.reload();
    } else {
      console.error("Error deleting account:", res.error);
    }
  };

  return (
    <Popup>
      <PopupButton buttonId="project-editor-delete">Delete Account</PopupButton>
      <PopupContent useClose={false}>
        <div className="small-popup">
          <h3>Delete Account</h3>
          <p className="confirm-msg">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="confirm-deny-btns">
            <PopupButton
              className="confirm-btn delete-button"
              callback={handleDeleteAccount}
            >
              Delete
            </PopupButton>
            <PopupButton className="deny-btn">Cancel</PopupButton>
          </div>
        </div>
      </PopupContent>
    </Popup>
  );
};
