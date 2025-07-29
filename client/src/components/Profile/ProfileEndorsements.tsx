import { Endorsement } from '../Endorsement';
import edit from '../../icons/edit.png';
import { PagePopup, openClosePopup } from '../PagePopup';
import { useState } from 'react';

// Define types for endorsement and user
interface EndorsementType {
  // Replace with real fields if known
  id: number;
  content: string;
}

interface User {
  _id: number;
  endorsements: EndorsementType[];
}

interface ProfileEndorsementsProps {
  user: User;
}

export const ProfileEndorsements: React.FC<ProfileEndorsementsProps> = ({ user }) => {
  // usestates for the "edit endorsements" popup
  const [showPopup, setShowPopup] = useState(false);

  // make a list of all the endorsements the user has
  let endorsementList;
  if (user.endorsements.length > 0) {
    endorsementList = user.endorsements.map((endorsement: EndorsementType) => (
      <Endorsement
        key={endorsement.id}
        endorsement={endorsement}
        endorsedID={user._id}
      />
    ));
  } else {
    // if the user has no endorsements display a special message
    endorsementList = <p>This user has no endorsements yet.</p>;
  }

  return (
    <section id="profile-endorsements">
      <div className="profile-name-button">
        <h1>Endorsements</h1>
        {/*edit endorsements button*/}
        {/*TODO: only show when a user views their own profile*/}
        <button className="icon-button" onClick={() => openClosePopup(showPopup, setShowPopup)}>
          <img src={edit} />
        </button>
      </div>

      {/*div containing all the endorsements*/}
      <div id="profile-endorseList">{endorsementList}</div>

      {/*edit endorsement popup*/}
      {/*currently nonfunctional*/}
      <PagePopup
        width={'80vw'}
        height={'80vh'}
        popupId={0}
        zIndex={3}
        show={showPopup}
        setShow={setShowPopup}
      >
        <div id="profile-edit-endorsements" className="profile-edit">
          <h1>Edit Endorsements</h1>
          <h3>Select endorsements to be highlighted on your page</h3>
          <h3>My Endorsements: </h3>
          <div id="profile-edit-endorsements-list" className="profile-list">
            {endorsementList}
          </div>
        </div>
      </PagePopup>
    </section>
  );
};
