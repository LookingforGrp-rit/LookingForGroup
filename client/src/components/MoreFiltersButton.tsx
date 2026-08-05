import { ThemeIcon } from './ThemeIcon';

const MoreFiltersButton = () => {

    return (
        <>
            <div id="more-filters-button">
                <p id="more-filters-text">More Filters</p>
                <ThemeIcon id={'filter'} width={30} height={30} className={'color-fill'} ariaLabel={'more filters'} />
            </div></>)
}

export default MoreFiltersButton;