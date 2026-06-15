import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Header } from '../Header';
import { members } from '../../constants/lfgmembers';
import '../Styles/pages.css';
import AboutFooter from '../AboutFooter';
import { ThemeIcon } from '../ThemeIcon';
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
            <Header
                dataSets={dataSet}
                onSearch={searchMembers}
                value={searchQuery}
                onChange={handleSearchChange}
                hideSearchBar={true}
                hideBackButton={false}
            />

            <main id="main" tabIndex={-1} aria-labelledby='about-header'>
                <section className="about-container" tabIndex={-1} style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="about-header">About Looking For Group</h1>

                    <section className="about-section">
                        <h2>Our Purpose</h2>
                        <p>
                            Looking For Group (LFG) is a platform designed to help connect developers and designers. Whether you are trying to bring a passion project to life or looking for a team to join, LFG provides the tools you need to connect and collaborate together.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2>What We Offer</h2>
                        <ul className="features-list">
                            <li>
                                <strong>Discover & Meet:</strong> Browse through a feed of active projects looking for contributors, or seek out individuals who match the skill sets your team needs.
                            </li>
                            <li>
                                <strong>Project Creation:</strong> Easily pitch your ideas to the community by creating detailed project pages that outline your goals, required roles, and current progress.
                            </li>
                            <li>
                                <strong>Project Management:</strong> Keep track of the teams you've joined and the projects you lead through the "My Projects" dashboard.
                            </li>
                            <li>
                                <strong>Professional Profiles:</strong> Showcase your unique talents, background, and previous work through customizable user profiles so others can find exactly what you bring to the table.
                            </li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2>User Guidelines</h2>
                        <p>The following guidelines below help keep LFG a friendly, encouraging, and creative community for everyone to enjoy.
                            If you see anyone or anything that violates these guidelines, please use our report feature to notify a moderator. </p>

                            <h3>User Eligibility</h3>

                            <ul className="features-list">
                            <li>
                                 Users must be either presently affiliated with RIT (Student or Staff) or formerly affiliated with RIT (Alumni). This is so we can focus on RIT students getting the help they need to get co-ops, internships, or future jobs
                            </li>
                            </ul>

                            <h3>Copyright</h3>
                            <ul className="features-list">
                            <li>
                                Users are responsible for following general U.S. copyright law (found <a href="https://www.copyright.gov/title17/">here</a>)
                            </li>
                            <li>
                                <strong>Theft Is Not Tolerated. </strong>Projects found using stolen material will be taken down and should be reported.
                                <ul>
                                    <li>If a project uses a work without permission the user will be asked to remove the stolen work or else the project will be deleted</li>
                                </ul>
                            </li>
                            <li>
                                Projects falling under Fair Use Guidelines (<a href="https://www.copyright.gov/fair-use/">U.S. Copyright Office Fair Use Index</a>) will not be taken down, however, Fair Use is never guaranteed in every case.
                            </li>
                        </ul>
                         <h3>Banned Content</h3>
                         <ul className="features-list">
                            <li>Content promoting/inciting hate, harassment, or discrimination are not tolerated on LFG. As well as selling the project/products on the site. Such content will be taken down and will result in bans.
                                <ul>
                                    <li>
                                        We do not carry any responsibilities involving payment for hiring if complications occur.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Sensitive content such as Suicide, real or disturbing depictions of violence, content that exploits children in any way and sexually explicit content should be tagged with the appropriate filters and should not be displayed in promotional images/videos. 
                                <ul>
                                    <li>
                                        Refer to <a href="https://www.esrb.org/ratings-guide/">ESRB Rating Guides on how to tag your project.</a>
                                    </li>
                                </ul>
                            </li>
                         </ul>
                         <h3>Ai Content</h3>
                         <ul className="features-list">
                            <li>Projects must disclose use of AI</li>
                            <li>AI used maliciously to violate copyright laws is strictly prohibited and will result in the project taken down and potential bans.</li>
                            <li>All other rules on this website applies to AI generated content.</li>
                         </ul>
                    </section>
                    <section className="about-section">
                        <h2>Data Protection and Security</h2>
                        <p>We do not use cookies to store your data.</p></section>
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
            </main>
        </div>
    );
}

export default AboutPage;