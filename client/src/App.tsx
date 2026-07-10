// Styles
import './components/Styles/master.css';
// Components and pages
import { Route, Routes, useLocation } from 'react-router-dom';
import * as paths from './constants/routes';
import { useState } from 'react';
import SignUp from './components/pages/Signup';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
// import Messages from './components/pages/Messages';
import MyProjects from './components/pages/MyProjects';
import Profile from './components/pages/Profile';
import Project from './components/pages/Project';
// import ProjectPostPage from './components/pages/ProjectPostPage';
import {DiscoverPage} from './components/pages/Discover';
import {ProfileMeetPage} from './components/pages/Meet';
//import Settings from './components/pages/Settings'; -- Commented in clean up 26-20-01 
import NewSettings from './components/pages/NewSettings';
import NotFound from './components/pages/NotFound';
import SideBar from './components/Sidebar';
// import MessageHistory from './components/pages/MessageHistory';
import CreateProject from './components/pages/CreateProject';
import AcceptInvitation from './components/pages/AcceptInvitation';
import AcceptApplication from './components/pages/AcceptApplication';
//import CreditsFooter from './components/CreditsFooter';  -- Commented in clean up 26-20-01 
import Credits from './components/pages/CreditsPage';
import AccountActivation from './components/pages/AccountActivation';
import { ThemeContext } from './contexts/ThemeContext';
import AboutPage from './components/pages/About';

import { useLocalStorage } from 'usehooks-ts';
import ModeratorPage from './components/pages/ModeratorPage';

function App() {
  //const [avatarImage, setAvatarImage] = useState('/images/tempProfilePic.png'); -- Commented in clean up 26-20-01 
  const [profileImage, setProfileImage] = useState<File>();

  // https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');

  const location = useLocation();
  const sidebarlessPages = ['/login', '/signup', '/forgotPassword'];
  const hideSidebar = sidebarlessPages.includes(location.pathname);

  // const [currentUser, setUser] = useState<number | undefined>();

  // useEffect(() => {
  //   const test = async() => {
  //     const temp = await getCurrentAccount();
  //     setUser(temp.data?.userId);
  //     return;
  //   }
  //   test();
  // },[]);

  // console.log(currentUser);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="App" data-theme={theme}>
        {!hideSidebar && <SideBar /*avatarImage={avatarImage} setAvatarImage={setAvatarImage} theme={theme}  -- Commented in clean up 26-20-01 */ />}
        <Routes>
          <Route path={paths.routes.DEFAULT} element={<DiscoverPage />} />
          {/* Google OAuth is the only auth method, so login and signup are a single
              unified flow. Both routes render the same page: it logs in existing
              users and starts the signup flow for new ones. */}
          <Route
            path={paths.routes.LOGIN}
            element={
              <SignUp
                profileImage={profileImage as File}
                setProfileImage={setProfileImage as React.Dispatch<React.SetStateAction<File>>}
              />
            }
          />
          <Route
            path={paths.routes.SIGNUP}
            element={
              <SignUp
                // avatarImage={avatarImage}
                // setAvatarImage={setAvatarImage}
                profileImage={profileImage as File}
                setProfileImage={setProfileImage as React.Dispatch<React.SetStateAction<File>>}
              />
            }
          />
          <Route path={paths.routes.FORGOTPASSWORD} element={<ForgotPassword />} />
          <Route path={paths.routes.RESETPASSWORD} element={<ResetPassword />} />

          <Route path={paths.routes.HOME} element={<DiscoverPage  />} />
          <Route path={paths.routes.MEET} element={<ProfileMeetPage />} />
          {/* <Route path={paths.routes.MESSAGES} element={<Messages />} /> */}
          <Route path={paths.routes.MYPROJECTS} element={<MyProjects  />} />
          <Route path={paths.routes.PROFILE} element={<Profile  />} />
          <Route path={paths.routes.PROJECT} element={<Project  />} />
          <Route path={paths.routes.CREATEPROJECT} element={<CreateProject />} />
          <Route path={paths.routes.ACCEPTINVITATION} element={<AcceptInvitation />} />
          <Route path={paths.routes.ACCEPTAPPLICATION} element={<AcceptApplication />} />
          {/* <Route path={paths.routes.PROJECTPOST} element={<ProjectPostPage />} /> */}
          {/* <Route
            path={paths.routes.SETTINGS}
            element={
              <Settings
                avatarImage={avatarImage}
                setAvatarImage={setAvatarImage}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />
            }
          /> */}
          <Route path={paths.routes.SETTINGS} element={<NewSettings  />} />
          <Route path={paths.routes.NOTFOUND} element={<NotFound />} />
          {/* <Route path={paths.routes.MESSAGEHISTORY} element={<MessageHistory />} /> */}
          <Route path={paths.routes.CREDITS} element={<Credits />} />
          <Route path={paths.routes.ABOUT} element={<AboutPage />} />
          <Route path={paths.routes.ACCOUNTACTIVATE} element={<AccountActivation />} />
          <Route path={paths.routes.MODERATION} element={<ModeratorPage />}/>
        </Routes>
        {/* <CreditsFooter /> */}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
