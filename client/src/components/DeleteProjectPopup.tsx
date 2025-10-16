import { PagePopup } from './PagePopup';

const DeleteProjectPopup = ({ show, setShow }) => {
  return (
    <PagePopup
      width="300px"
      height="200px"
      popupId="deleteProject"
      zIndex={1000}
      show={show}
      setShow={setShow}
    >
      <div className="delete-popup-content">
        <h2>Delete Project</h2>
        <p>Are you sure you want to delete this project? This action cannot be undone.</p>
        <div className="delete-popup-actions">
          <button className="project-delete-final">Delete</button>
          <button className="project-delete-cancel" onClick={() => setShow(false)}>
            Cancel
          </button>
        </div>
      </div>
    </PagePopup>
  );
};

export default DeleteProjectPopup;
