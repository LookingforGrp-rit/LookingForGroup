import postImagePlaceholder from '../../icons/AhomeIcon.png';
import { useNavigate } from 'react-router-dom';
import { posts } from '../../constants/fakeData'; // FIXME: use data in db
import * as paths from '../../constants/routes';

//This component is used in the Project page of the site
//Should contain a preview of the post itself, as well as it's title & post date
//Clicking on this component should redirect the user to the Project Post page & render the relevant post data
//The button within this component was likely meant to be a sharing feature, but few details were given
//Currently, clicking the post overrides whatever click function the button element contains

//Takes in a title and date as props, which should be the post's title and post date
//Will likely need include post text and images in later versions

export const ProjectPost = (props) => {
  const navigate = useNavigate();

  let thisPost = posts.find((p) => p._id === props.postID);
  if (thisPost === undefined) {
    thisPost = posts[0];
  }

  const pathQuery = `?postID=${thisPost._id}`;

  return (
    <div className="project-post" onClick={() => navigate(paths.routes.PROJECTPOST + pathQuery)}>
      <img src={postImagePlaceholder} alt="post image" />
      <div className="post-content">
        <div className="post-info">
          <h3 className="post-title">{thisPost.title}</h3>
          <div className="post-date">{thisPost.createdDate}</div>
        </div>

        <button className="white-button">share</button>
      </div>
    </div>
  );
};
