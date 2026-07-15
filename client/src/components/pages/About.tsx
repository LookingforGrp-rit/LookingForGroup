import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Header } from '../Header';
import { members } from '../../constants/lfgmembers';
import '../Styles/pages.css';
import AboutFooter from '../AboutFooter';
import ToTopButton from '../ToTopButton';
import { ThemeImage } from '../ThemeIcon';
import { useNavigate } from 'react-router-dom';

/**
 * About page detailing the purpose and features of LFG
 * @returns JSX Element containing platform information
 */
const AboutPage = () => {
    const [filteredMembersList, setFilteredMembersList] = useState(members);
    const [searchQuery, setSearchQuery] = useState('');

    // Format data for use with SearchBar, which requires it to be: [{ data: }]
    const dataSet = useMemo(() => [{ data: members }], []);

    const navigate = useNavigate(); // Hook for navigation

    // Allows for the variable to update and display to the user
    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    // Updates filtered members list with new search info
    const searchMembers = useCallback((searchResults: any[][]) => {
        if (!searchResults || !Array.isArray(searchResults)) return;

        // Flatten the nested arrays
        const flattened = searchResults.flat();

        // Prevent unnecessary state updates if results haven't changed
        setFilteredMembersList((prev) => {
            const prevNames = prev.map((m) => m.name).join(',');
            const newNames = flattened.map((m) => m.name).join(',');
            if (prevNames === newNames) return prev;
            return flattened;
        });
    }, []);

    // Sort the credits, prioritizing role and then moving to name
    const sortedMembersList = useMemo(() => {
        // shallow coppy
        return [...filteredMembersList].sort((a, b) => {
            // Compare roles
            const roleComparison = a.role.localeCompare(b.role);
            if (roleComparison !== 0)
                return roleComparison;

            // If roles match, compare names
            return a.name.localeCompare(b.name);
        });
    }, [filteredMembersList]);

    return (
        <div className="page">
            <aside aria-label='header'>
                <Header
                    dataSets={dataSet}
                    onSearch={searchMembers}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    hideSearchBar={true}
                    hideBackButton={false}
                />
            </aside>

            <main className="about-main" id="main" tabIndex={-1} aria-labelledby='about-page-header'>
                <section className="about-container" tabIndex={-1} style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 id="about-page-header" className="about-header">About Looking For Group</h1>

                    <section className="about-section" id="about-purpose">
                        <h2 className="about-header-two">Our Purpose</h2>
                        <p className="about-text about-text-purpose">
                            Looking For Group (LFG) is a platform designed to help connect developers and designers. Whether you are trying to bring a passion project to life or looking for a team to join, LFG provides the tools you need to connect and collaborate together.
                        </p>
                    </section>

                    <section className="about-section" id="features-section">
                        <h2 className="about-header-two">What We Offer</h2>
                        <section className="features-list">
                            <section className="about-box" id="purpose-box">
                                <div className="heading-text-pair">
                                    <div className="heading-image-pair">
                                        <h3 className="about-header-three">
                                            Discover & Meet
                                        </h3>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about1b_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about1b_dark.png'}
                                            id={'about-img-1b'}
                                            className={'about-img-b'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                    <div className="text-image-pair">
                                        <p className="about-text">
                                            Browse through a feed of active projects looking for contributors, or seek out individuals who match the skill sets your team needs.
                                        </p>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about1c_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about1c_dark.png'}
                                            id={'about-img-1c'}
                                            className={'about-img-c'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                </div>
                                <ThemeImage
                                    lightSrc={'/assets/bannerImages/aboutImages/about1_light.png'}
                                    darkSrc={'/assets/bannerImages/aboutImages/about1_dark.png'}
                                    id={'about-img-1'}
                                    className={'about-img-a'}
                                    alt={'banner image'}
                                />
                            </section>
                            <section className="about-box" id="creation-box">
                                <div className="heading-text-pair">
                                    <div className="heading-image-pair">
                                        <h3 className="about-header-three">
                                            Project Creation
                                        </h3>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about2b_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about2b_dark.png'}
                                            id={'about-img-2b'}
                                            className={'about-img-b'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                    <div className="text-image-pair">
                                        <p className="about-text">
                                            Easily pitch your ideas to the community by creating detailed project pages that outline your goals, required roles, and current progress.
                                        </p>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about2c_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about2c_dark.png'}
                                            id={'about-img-2c'}
                                            className={'about-img-c'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                </div>
                                <ThemeImage
                                    lightSrc={'/assets/bannerImages/aboutImages/about2_light.png'}
                                    darkSrc={'/assets/bannerImages/aboutImages/about2_dark.png'}
                                    id={'about-img-2'}
                                    className={'about-img-a'}
                                    alt={'banner image'}
                                />
                            </section>
                            <section className="about-box" id="management-box">
                                <div className="heading-text-pair">
                                    <div className="heading-image-pair">
                                        <h3 className="about-header-three">
                                            Project Management
                                        </h3>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about3b_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about3b_dark.png'}
                                            id={'about-img-3b'}
                                            className={'about-img-b'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                    <div className="text-image-pair">
                                        <p className="about-text">
                                            Keep track of the teams you've joined and the projects you lead through the "My Projects" dashboard.
                                        </p>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about3c_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about3c_dark.png'}
                                            id={'about-img-3c'}
                                            className={'about-img-c'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                </div>
                                <ThemeImage
                                    lightSrc={'/assets/bannerImages/aboutImages/about3_light.png'}
                                    darkSrc={'/assets/bannerImages/aboutImages/about3_dark.png'}
                                    id={'about-img-3'}
                                    className={'about-img-a'}
                                    alt={'banner image'}
                                />
                            </section>
                            <section className="about-box" id="profile-box">
                                <div className="heading-text-pair">
                                    <div className="heading-image-pair">
                                        <h3 className="about-header-three">
                                            Professional Profiles
                                        </h3>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about4b_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about4b_dark.png'}
                                            id={'about-img-4b'}
                                            className={'about-img-b'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                    <div className="text-image-pair">
                                        <p className="about-text">
                                            Showcase your unique talents, background, and previous work through customizable user profiles so others can find exactly what you bring to the table.
                                        </p>
                                        <ThemeImage
                                            lightSrc={'/assets/bannerImages/aboutImages/about4c_light.png'}
                                            darkSrc={'/assets/bannerImages/aboutImages/about4c_dark.png'}
                                            id={'about-img-4c'}
                                            className={'about-img-c'}
                                            alt={'banner image'}
                                        />
                                    </div>
                                </div>
                                <ThemeImage
                                    lightSrc={'/assets/bannerImages/aboutImages/about4_light.png'}
                                    darkSrc={'/assets/bannerImages/aboutImages/about4_dark.png'}
                                    id={'about-img-4'}
                                    className={'about-img-a'}
                                    alt={'banner image'}
                                />
                            </section>
                        </section>
                    </section>

                    <section className="about-section">
                        <h2 className="about-header-two">User Guidelines</h2>
                        <p className="about-text">The following guidelines below help keep LFG a friendly, encouraging, and creative community for everyone to enjoy.
                            If you see anyone or anything that violates these guidelines, please use our report feature to notify a moderator. </p>

                            <h3 className="about-header-three">User Eligibility</h3>

                            <ul className="guidelines-list">
                            <li className="about-text">
                                 Users must be either presently affiliated with RIT (Student or Staff) or formerly affiliated with RIT (Alumni). This is so we can focus on RIT students getting the help they need to get co-ops, internships, or future jobs
                            </li>
                            </ul>

                            <h3 className="about-header-three">Copyright</h3>
                            <ul className="guidelines-list">
                            <li className="about-text">
                                Users are responsible for following general U.S. copyright law (found <a href="https://www.copyright.gov/title17/">here</a>)
                            </li>
                            <li className="about-text">
                                <strong>Theft Is Not Tolerated. </strong>Projects found using stolen material will be taken down and should be reported.
                                <ul>
                                    <li>If a project uses a work without permission the user will be asked to remove the stolen work or else the project will be deleted</li>
                                </ul>
                            </li>
                            <li className="about-text">
                                Projects falling under Fair Use Guidelines (<a href="https://www.copyright.gov/fair-use/">U.S. Copyright Office Fair Use Index</a>) will not be taken down, however, Fair Use is never guaranteed in every case.
                            </li>
                        </ul>
                         <h3 className="about-header-three">Banned Content</h3>
                         <ul className="guidelines-list">
                            <li className="about-text">Content promoting/inciting hate, harassment, or discrimination are not tolerated on LFG. As well as selling the project/products on the site. Such content will be taken down and will result in bans.
                                <ul>
                                    <li>
                                        We do not carry any responsibilities involving payment for hiring if complications occur.
                                    </li>
                                </ul>
                            </li>
                            <li className="about-text">
                                Sensitive content such as Suicide, real or disturbing depictions of violence, content that exploits children in any way and sexually explicit content should not be displayed in promotional images/videos.  
                            </li>
                         </ul>
                         <h3 className="about-header-three">Ai Content</h3>
                         <ul className="guidelines-list">
                            <li className="about-text">Projects must disclose use of AI</li>
                            <li className="about-text">AI used maliciously to violate copyright laws is strictly prohibited and will result in the project taken down and potential bans.</li>
                            <li className="about-text">All other rules on this website applies to AI generated content.</li>
                         </ul>
                    </section>
                    <section className="about-section">
                        <h2 className="about-header-two">Data Protection and Security</h2>
                        <ul className="guidelines-list">
                          <li className="about-text">We do not use cookies to store your data.</li>
                          <li className="about-text">Any projects along with assets placed upon the site belong to the owner. LFG does not claim ownership.</li>
                        </ul>

                        <h3 className="about-header-three">Data Collection</h3>
                        <p className="about-text">We store:</p>
                        <ul className="guidelines-list">
                          <li className="about-text">RIT Email</li>
                          <li className="about-text">{"Full Name (first/preferred, last)"}</li>
                          <li className="about-text">Major</li>
                          <li className="about-text">Year</li>
                          <li className="about-text">{"Phone Number (optional)"}</li>
                        </ul>
                    </section>
                    <section id="credits" tabIndex={-1} aria-labelledby='credits-title'>
                        <h1 id="credits-title">Meet The LFG Team</h1>
                        <div className="sr-only" aria-live="polite" aria-atomic="true">
                            {`Showing ${sortedMembersList.length} team ${sortedMembersList.length === 1 ? 'member' : 'members'}.`}
                        </div>

                        <ul id="credit-members-container">
                            {sortedMembersList.map(member => (
                                <li className="lfg-contributor" key={member.name}>
                                    <img
                                        className="project-contributor-profile"
                                        src={member.photo}
                                        alt={`Profile photo of ${member.name}`}
                                    />
                                    <div className="project-contributor-info">
                                        <h2 className="team-member-name">{member.name}</h2>
                                        <p className="team-member-role">{member.role}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {sortedMembersList.length === 0 && (
                            <p className='no-members'>No team members found matching your search.</p>
                        )}
                    </section>
                </section>
            </main>
            <ToTopButton />
        </div>
    );
}

export default AboutPage;