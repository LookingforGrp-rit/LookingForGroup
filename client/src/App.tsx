// Styles
import './components/Styles/master.css';
// Components and pages
import { Route, Routes, useLocation } from 'react-router-dom';
import * as paths from './constants/routes';
import { useMemo, useState } from 'react';
import Login from './components/pages/Login';
import SignUp from './components/pages/Signup';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
// import Messages from './components/pages/Messages';
import MyProjects from './components/pages/MyProjects';
import Profile from './components/pages/Profile';
import Project from './components/pages/Project';
// import ProjectPostPage from './components/pages/ProjectPostPage';
import { Discover, Meet } from './components/pages/DiscoverAndMeet';
//import Settings from './components/pages/Settings'; -- Commented in clean up 26-20-01 
import NewSettings from './components/pages/NewSettings';
import NotFound from './components/pages/NotFound';
import SideBar from './components/Sidebar';
// import MessageHistory from './components/pages/MessageHistory';
import CreateProject from './components/pages/CreateProject';
//import CreditsFooter from './components/CreditsFooter';  -- Commented in clean up 26-20-01 
import Credits from './components/pages/CreditsPage';
import AccountActivation from './components/pages/AccountActivation';
import { ThemeContext } from './contexts/ThemeContext';
import AboutPage from './components/pages/About';
import { getCurrentAccount } from './api/users';

import uselocalstorage from 'use-local-storage';

function App() {
  //const [avatarImage, setAvatarImage] = useState('/images/tempProfilePic.png'); -- Commented in clean up 26-20-01 
  const [profileImage, setProfileImage] = useState('');

  // https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = uselocalstorage('theme', defaultDark ? 'dark' : 'light');

  const location = useLocation();
  const sidebarlessPages = ['/login', '/signup', '/forgotPassword'];
  const hideSidebar = sidebarlessPages.includes(location.pathname);

  //tries to get the current user and allows to be inputted into other react elements
  const currentUser = useMemo(async () => {
    //tries to see if it can get a user if it can't it returns a temp MePreview
    //to pass stuff down the line as a guest
    const userResp = await getCurrentAccount();
    if (userResp.status === 404) {
      const temp = {
        username: 'guest',
      }
      return temp;
    }
    return userResp;
  }, [])

  //console.log(currentUser);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="App" data-theme={theme}>
        <a
          href="#main"
          className="skip-link"
          tabIndex={1}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main')?.focus();
          }}
        >
          Skip to main content
        </a>
        {!hideSidebar && <SideBar /*avatarImage={avatarImage} setAvatarImage={setAvatarImage} theme={theme}  -- Commented in clean up 26-20-01 */ />}
        <Routes>
          <Route path={paths.routes.DEFAULT} element={<Discover userProfile={currentUser} />} />
          <Route path={paths.routes.LOGIN} element={<Login />} />
          <Route
            path={paths.routes.SIGNUP}
            element={
              <SignUp
                // avatarImage={avatarImage}
                // setAvatarImage={setAvatarImage}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />
            }
          />
          <Route path={paths.routes.FORGOTPASSWORD} element={<ForgotPassword />} />
          <Route path={paths.routes.RESETPASSWORD} element={<ResetPassword />} />

          <Route path={paths.routes.HOME} element={<Discover userProfile={currentUser} />} />
          <Route path={paths.routes.MEET} element={<Meet userProfile={currentUser} />} />
          {/* <Route path={paths.routes.MESSAGES} element={<Messages />} /> */}
          <Route path={paths.routes.MYPROJECTS} element={<MyProjects userProfile={currentUser} />} />
          <Route path={paths.routes.PROFILE} element={<Profile userProfile={currentUser} />} />
          <Route path={paths.routes.PROJECT} element={<Project userProfile={currentUser} />} />
          <Route path={paths.routes.CREATEPROJECT} element={<CreateProject />} />
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
          <Route path={paths.routes.SETTINGS} element={<NewSettings userProfile={currentUser} />} />
          <Route path={paths.routes.NOTFOUND} element={<NotFound />} />
          {/* <Route path={paths.routes.MESSAGEHISTORY} element={<MessageHistory />} /> */}
          <Route path={paths.routes.CREDITS} element={<Credits />} />
          <Route path={paths.routes.ACCOUNTACTIVATE} element={<AccountActivation />} />
          <Route path={paths.routes.ABOUT} element={<AboutPage userProfile={currentUser} />} />
        </Routes>
        {/* <CreditsFooter /> */}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
