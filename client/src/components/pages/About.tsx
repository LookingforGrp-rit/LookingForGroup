import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Header } from '../Header';
import { members } from '../../constants/lfgmembers';
import '../Styles/pages.css';
import AboutFooter from '../AboutFooter';

/**
 * About page detailing the purpose and features of LFG
 * @returns JSX Element containing platform information
 */
const AboutPage = () => {
    const [filteredMembersList, setFilteredMembersList] = useState(members);
    const [searchQuery, setSearchQuery] = useState('');

    // Format data for use with SearchBar, which requires it to be: [{ data: }]
    const dataSet = useMemo(() => [{ data: members }], []);

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