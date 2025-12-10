import React, { useState, useEffect } from 'react';

/**
 * This component allows the user to toggle what is shown on their user profile. 
 * The current toggles are: view profile, view following list, view favorites, and view activity.
 * FUNCTIONALITY NOT CURRENTLY IMPLEMENTED.
 * @returns JSX - renders the UI for managing user's profile settings.
 */
const ProfileVisibilitySetting = () => {
  return (
    <div className="setting-in-page">
      <h3>
        Profile Visibility
        <br></br>
        <span>Manage what others can view on your profile</span>
      </h3>
      <div className="setting-content">
        <div className="column">
          <div className="row">
            <p className="text">View Profile</p>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="row">
            <p className="text">View Following</p>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="row">
            <p className="text">View Favorites</p>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="row">
            <p className="text">View Activity</p>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisibilitySetting;
