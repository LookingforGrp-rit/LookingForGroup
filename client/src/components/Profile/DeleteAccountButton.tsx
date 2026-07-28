import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popup, PopupButton, PopupContent } from "../Popup";
import { deleteUser } from "../../api/users";
import * as paths from "../../constants/routes";

/**
 * Red "Delete Account" button shown next to "Save Changes" in the profile
 * editor. Opens a confirmation popup that requires typing "DELETE" (matching the
 * Settings page), then permanently deletes the current user's account and sends
 * them home, where the now-invalid session redirects to login.
 *
 * Modeled on DeleteProjectButton in the project editor.
 */
export const DeleteAccountButton = () => {
  const navigate = useNavigate();

  // Controlled so we can reset it every time the popup opens/closes — a
  // destructive action should always require typing DELETE fresh.
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canDelete = confirmText === "DELETE" && !deleting;

  const handleDeleteAccount = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setErrorMsg(null);

    const res = await deleteUser();
    if (res.status === 200) {
      // Session is now invalid; home will bounce them to login.
      navigate(paths.routes.HOME);
      window.location.reload();
    } else {
      // Keep the popup open and tell the user what happened.
      setErrorMsg(res.error || "Something went wrong deleting your account. Please try again.");
      setDeleting(false);
    }
  };

  // Clear typed text, any error, and the in-progress flag whenever the popup is
  // opened or cancelled.
  const resetConfirm = () => {
    setConfirmText("");
    setErrorMsg(null);
    setDeleting(false);
  };

  return (
    <Popup>
      <PopupButton buttonId="project-editor-delete" callback={resetConfirm}>
        Delete Account
      </PopupButton>
      <PopupContent useClose={false}>
        <div className="small-popup">
          <h3>Delete Account</h3>
          <p className="confirm-msg">
            Are you sure you want to delete your account? This permanently
            removes your profile and cannot be undone.
          </p>
          <label className="profile-delete-confirm-info">
            Type "DELETE" to confirm
            <input
              className="profile-delete-confirm"
              type="text"
              placeholder="DELETE"
              value={confirmText}
              disabled={deleting}
              autoComplete="off"
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </label>
          {errorMsg && <p className="profile-delete-error">{errorMsg}</p>}
          <div className="confirm-deny-btns">
            <PopupButton
              className="confirm-btn delete-button"
              callback={handleDeleteAccount}
              disabled={!canDelete}
              // Don't let the button close the popup: we control that ourselves
              // so an error can stay on screen instead of vanishing.
              doNotClose={() => true}
            >
              {deleting ? "Deleting..." : "Delete"}
            </PopupButton>
            <PopupButton className="deny-btn" callback={resetConfirm}>
              Cancel
            </PopupButton>
          </div>
        </div>
      </PopupContent>
    </Popup>
  );
};
