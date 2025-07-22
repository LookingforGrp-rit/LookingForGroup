import { useState, useEffect } from "react";
import { getUsersById, getUsers } from "../../api/users";
import "../Styles/profileContactTab.css";

interface LinkData {
  id: Number;
  url: String;
}

const ProfileContactTab = (userID: number) => {
  let links = [] as LinkData[];
  const [socials, setSocials] = useState([]);

  let linksTSX;
  const [firstName, setFirstName] = useState("Joe");
  const [lastName, setLastName] = useState("Bob");
  const [email, setEmail] = useState("dummy@gmail.com");
  const [phone, setPhone] = useState("1-431-dummy");

  // copied over from Profile.tsx to get social links
  useEffect(() => {
    const loadSocials = async () => {
      try {
        const response = await getUsersById(1); // Currently still testing, grabs id #!
        const user = response.data;
        console.log("Response: ", response.status);
        if (response.status === 200) {
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setSocials(user.socials);
          setEmail(user.data.email); // Not Yet Exists
          setPhone(user.data.phone); // Not Yet Exists
          console.log("success!");
        }

        console.log("response data:" + response);

        // Setup links

        if (socials) {
          links = socials.map((s: any) => {
            return {
              id: s.id,
              url: s.url,
            };
          });
        }

        if (links) {
          linksTSX = links.map((link) => {
            if (link.url.includes("linkedin.com"))
              return (
                <p key={link.id} className="linkedin-social-link">
                  <a href={link.url.toString()}>{link.url}</a>
                </p>
              );
            else if (link.url.includes("instagram.com"))
              return (
                <p key={link.id} className="instagram-social-link">
                  <a href={link.url.toString()}>{link.url}</a>
                </p>
              );
            else
              return (
                <p className="other-social-link">
                  {" "}
                  <a key={link.id} href={link.url.toString()}>
                    {link.url}
                  </a>
                </p>
              );
          });
        }
      } catch (err) {
        console.log("failed to load socials", err);
      }
    };
    loadSocials();
  }, []);

  return (
    <div className="profile-contact-tab">
      <h1>Contact Info</h1>
      <div className="contact-info-list">
        {firstName && (
          <div className="name">
            <p>Name: {firstName + " " + lastName}</p>
          </div>
        )}

        {email && (
          <div className="email-links">
            <p>Email: {email}</p>
          </div>
        )}

        {phone && (
          <div className="phone-link">
            <p>
              Phone Number: <a href={phone}>{phone}</a>
            </p>
          </div>
        )}
        {links && <div className="links">{linksTSX}</div>}
      </div>
    </div>
  );
};

export default ProfileContactTab;
