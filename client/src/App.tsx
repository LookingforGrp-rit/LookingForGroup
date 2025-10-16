// Styles
import './components/Styles/master.css';
// Components and pages
import { Route, Routes } from 'react-router-dom';
import * as paths from './constants/routes';
import { useState, useEffect } from 'react';
import Login from './components/pages/Login';
import SignUp from './components/pages/Signup';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import Home from './components/pages/Home';
// import Messages from './components/pages/Messages';
import MyProjects from './components/pages/MyProjects';
import Profile from './components/pages/Profile';
import NewProfile from './components/pages/NewProfile';
import Project from './components/pages/Project';
import NewProject from './components/pages/NewProject';
// import ProjectPostPage from './components/pages/ProjectPostPage';
import { Discover, Meet } from './components/pages/DiscoverAndMeet';
import Settings from './components/pages/Settings';
import NewSettings from './components/pages/NewSettings';
import NotFound from './components/pages/NotFound';
import SideBar from './components/Sidebar';
// import MessageHistory from './components/pages/MessageHistory';
import CreateProject from './components/pages/CreateProject';
import CreditsFooter from './components/CreditsFooter';
import Credits from './components/pages/CreditsPage';
import AccountActivation from './components/pages/AccountActivation';
import { ThemeContext } from './contexts/ThemeContext';

import uselocalstorage from 'use-local-storage';

function App() {
  const [avatarImage, setAvatarImage] = useState('images/tempProfilePic.png');
  const [profileImage, setProfileImage] = useState('');

  // https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = uselocalstorage('theme', defaultDark ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="App" data-theme={theme}>
        <SideBar avatarImage={avatarImage} setAvatarImage={setAvatarImage} theme={theme} />
        <Routes>
          <Route path={paths.routes.DEFAULT} element={<Discover />} />
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

          <Route path={paths.routes.HOME} element={<Discover />} />
          <Route path={paths.routes.MEET} element={<Meet />} />
          {/* <Route path={paths.routes.MESSAGES} element={<Messages />} /> */}
          <Route path={paths.routes.MYPROJECTS} element={<MyProjects />} />
          <Route path={paths.routes.PROFILE} element={<NewProfile />} />
          <Route path={paths.routes.NEWPROFILE} element={<NewProfile />} />
          <Route path={paths.routes.PROJECT} element={<Project />} />
          <Route path={paths.routes.NEWPROJECT} element={<NewProject />} />
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
          <Route path={paths.routes.SETTINGS} element={<NewSettings />} />
          <Route path={paths.routes.NOTFOUND} element={<NotFound />} />
          {/* <Route path={paths.routes.MESSAGEHISTORY} element={<MessageHistory />} /> */}
          <Route path={paths.routes.CREDITS} element={<Credits />} />
          <Route path={paths.routes.ACCOUNTACTIVATE} element={<AccountActivation />} />
        </Routes>
        {/* <CreditsFooter /> */}
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
