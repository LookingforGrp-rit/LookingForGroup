import { useState } from 'react';
import { Header } from '../Header';
import { DataSet } from '../SearchBar';
import '../Styles/pages.css';

/**
 * About page detailing the purpose and features of LFG
 * @returns JSX Element containing platform information
 */
const AboutPage = () => {
    const [projectsList, _setProjectsList] = useState([] as DataSet[]);
    const currentSearch = (_results: unknown[][]) => void {};

    return (
        <div className="page">
            <Header dataSets={projectsList} onSearch={currentSearch} />
            
            <div className="about-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
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
            </div>
        </div>
    );
}

export default AboutPage;