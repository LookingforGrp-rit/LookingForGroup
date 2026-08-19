import { useEffect, useState } from 'react';
import { Popup, PopupButton, PopupContent } from './Popup';

/**
 * sessionStorage key that ProjectCreatorEditor writes after it finishes
 * creating a project. Shared so the writer and the reader can't drift apart.
 */
export const NEW_PROJECT_NOTICE_KEY = 'newProjectAwaitingReview';

/**
 * Explains, right after a project is created, that creating it did not put it
 * under review, and points at where a review can be requested later.
 *
 * The editor reloads the page as the last step of saving, so this can't be
 * triggered by React state. The editor leaves a flag in sessionStorage instead,
 * and this picks it up once on whichever page the reload lands on.
 *
 * @returns JSX popup shown once after a project is created, otherwise nothing
 */
const NewProjectReviewNotice = () => {
  // null means there is nothing to show. A string (possibly empty, if the
  // title couldn't be read) means the notice should open.
  const [projectTitle, setProjectTitle] = useState<string | null>(null);

  useEffect(() => {
    const title = sessionStorage.getItem(NEW_PROJECT_NOTICE_KEY);
    if (title === null) return;

    // Cleared straight away so the notice can't reappear on a later reload
    sessionStorage.removeItem(NEW_PROJECT_NOTICE_KEY);
    setProjectTitle(title);
  }, []);

  if (projectTitle === null) return null;

  return (
    <Popup startOpen={true}>
      <PopupContent>
        <div className="small-popup">
          <div id="project-request-review">
            <label id="project-request-label">
              {projectTitle
                ? `"${projectTitle}" has been created`
                : 'Your project has been created'}
            </label>
            <div id="project-request-info">
              Creating a project does not submit it for review. It is
              <strong> not under review right now</strong>, and it won't be
              visible to everyone until a moderator approves it.
              <br />
              <br />
              Whenever you feel it's ready, open the options menu on the
              project's card in <strong>My Projects</strong> and choose{' '}
              <strong>Request Review</strong> &mdash; or use{' '}
              <strong>Request Project Review</strong> on the project's own page.
            </div>
            <div id="project-request-buttons">
              <PopupButton buttonId="request-confirm-button">
                Got it
              </PopupButton>
            </div>
          </div>
        </div>
      </PopupContent>
    </Popup>
  );
};

export default NewProjectReviewNotice;
