import '../Styles/pages.css';
import '../Styles/general.css';
import '../Styles/NotFound.css';
import * as paths from "../../constants/routes";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '../Header';
import { ThemeIcon } from '../ThemeIcon';



const NotFoundPage = () => {
    const [projectsList, setProjectsList] = useState();
    const [currentSearch, setCurrentSearch] = useState('');
    const navigate = useNavigate();
    return(
        <div className = "page">
            <Header dataSets={[{ projectsList }]} onSearch={setCurrentSearch} />
            <div className = "error-box">
                <ThemeIcon
                            light={'/assets/bannerImages/404_light.png'}
                            dark={'/assets/bannerImages/404_dark.png'}
                            alt={'404 Not Found'}
                            id={'error-image'}
                          />
                <h2 className='error-header'>Oops! Seems like this page is missing or moved.</h2>
                <div className = "error-button-container">
                    {/*
                        This is the Home button, because it will return users home once the Home page is up. It currently returns to Discover page
                    */}
                    <button className = "" onClick={ (event: any) => navigate(paths.routes.HOME)}>
                        <ThemeIcon light={'/assets/black/compass.png'} dark={'/assets/white/compass.png'} alt={'discover'} /> {/*Home Button Icon*/}
                        {/*}<img className = 'theme-icon'></img>{*/}
                        Home
                        </button>
                    
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;