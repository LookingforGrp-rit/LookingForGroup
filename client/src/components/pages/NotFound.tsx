import '../Styles/pages.css';
import '../Styles/general.css';
import '../Styles/NotFound.css';
import * as paths from "../../constants/routes";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '../Header';
import { ThemeIcon, ThemeImage } from '../ThemeIcon';



const NotFoundPage = () => {
    const [projectsList, setProjectsList] = useState();
    const [currentSearch, setCurrentSearch] = useState('');
    const navigate = useNavigate();
    return (
        <div className="page">
            <Header dataSets={[{ projectsList }]} onSearch={setCurrentSearch} />
            <div className="error-box">
                <ThemeImage
                    lightSrc={'assets/bannerImages/404_light.png'}
                    darkSrc={'assets/bannerImages/404_dark.png'}
                    id={'error-image'}
                    alt={'404 Not Found'}
                />
                <h2 className='error-header'>Oops! Seems like this page is missing or moved.</h2>
                <div className="error-button-container">
                    {/*
                        This is the Home button, because it will return users home once the Home page is up. It currently returns to Discover page
                    */}
                    <button className="" onClick={() => navigate(paths.routes.HOME)}>
                        <ThemeIcon id={'compass'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'discover'} /> {/*Home Button Icon*/}
                        Home
                    </button>

                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;