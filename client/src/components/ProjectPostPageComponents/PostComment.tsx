//Styles
import '../Styles/credits.css';
import '../Styles/discoverMeet.css';
import '../Styles/emailConfirmation.css';
import '../Styles/general.css';
import '../Styles/loginSignup.css';
import '../Styles/messages.css';
import '../Styles/notification.css';
import '../Styles/profile.css';
import '../Styles/projects.css';
import '../Styles/settings.css';

import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';
import profilePlaceholder from '../../icons/profile-user.png';
import { profiles, comments } from '../../constants/fakeData'; // FIXME: use data in db

//This component is used in the Project Post page, and contains code for structuring the full length of a comment
//  This includes the comment itself, as well as any replies the comment has.
//  Comprised of 2 different components that are repeatedly used to fully construct a full comment
//Similarly to ProjectPostPage.tsx, any profile names can be clicked to navigate to that user's profile page

let i = 0;

//A function that allows for the hiding/showing of a comment's replies
//i - the current ID of the comment element this is being made for
const showRepliesToggle = (i) => {
  const currentId = i;
  //Get reply set with currently selected ID. If it exists, show/hide the replies in the set
  const currentButton = document.getElementById(currentId);
  if (currentButton !== null) {
    currentButton.classList.toggle('show');
  }
};

//Component used in conjuction with 'PostComment', which creates a set of replies for the comment
//Contains a button that shows/hides the replies, as well as the full list of replies
//  Each reply is rendered with another 'PostComment' component,
//  causing it to loop until all subsequent replies & comments are rendered
//If the current comment has no replies, returns an empty element

//A comment value and callback function are passed in through props
//  'comment' contains data on the current comment to reference when constructing
//  the callback function should be the 'changeReplyTarget' function, found in ProjectPostPage.tsx line 32
//    (This is only to pass it onto more 'PostComment' components, it is not directly used here)

// *** Separate component, should be moved into its own file later ***
// Due to how the two components work in tandem, I am rethinking the action to separate them into their own files
const CommentReplies = (props) => {
  if (props.comment.replies.length !== 0) {
    i++;
    let replyKey = 0; //Code doesn't need replyKey, but react will post an error if it isn't used in the .map function later
    const currentId = 'show-reply-set-' + i;
    return (
      <div className="comment-replies">
        <button onClick={() => showRepliesToggle(currentId)}>----- View Replies</button>
        <div id={currentId} className="hide">
          {props.comment.replies.map((reply) => {
            replyKey++;
            return <PostComment commentId={reply} callback={props.callback} key={replyKey} />;
          })}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

//Main component, which is exported from this file
//Used as the base for a post comment, which contains the comment content, author & comment info, and options
//  No functionality added to options yet, requires implementation
//Utilizes 'CommentReplies' component when rendering the replies of the current comment

//A commentId value and a callback funciton are passed in through props
//  commentId represent the current id of the comment being rendered
//  the callback function should be the 'changeReplyTarget' function, found in ProjectPostPage.tsx line 32
export const PostComment = (props) => {
  const navigate = useNavigate();
  const comment = comments.find((c) => c._id === props.commentId) || comments[0];
  return (
    <div className="post-comment" id={props.commentId}>
      {/* Get image of profile and use preloader function in functions/imageLoad.tsx */}
      <img className="comment-profile" src={profilePlaceholder} alt="profile" />
      <div className="comment-header">
        <span
          className="comment-author"
          onClick={() => navigate(paths.routes.PROFILE + `?profID=${comment.author}`)}
        >
          {profiles[comment.author].username}
        </span>
        <span className="comment-date"> {comment.createdDate}</span>
      </div>

      <div className="comment-content">{comment.content}</div>

      <button className="comment-options">...</button>
      <button className="comment-like">like</button>

      <button className="comment-reply" onClick={() => props.callback(props.commentId)}>
        Reply
      </button>

      <CommentReplies comment={comment} callback={props.callback} />
    </div>
  );
};
