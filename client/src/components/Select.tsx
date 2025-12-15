import { createContext, ReactElement, useContext, useEffect, useState, useRef } from "react";
import { ThemeIcon } from "./ThemeIcon";

// --------------------
// Interfaces
// --------------------
type SelectContextProps = {
    open: boolean; // Whether the dropdown is currently open
    value: ReactElement | null; // Currently selected value (JSX element)
    setOpen: (open: boolean) => void; // Setter for open state
    setValue: (value: ReactElement) => void; // Setter for selected value
    type: 'input' | 'dropdown'; // Type of select for styling purposes
}

type SelectButtonProps = {
    placeholder: string; // Text to show when no value is selected
    initialVal?: string | boolean; // Default value if none selected
    buttonId?: string; // Optional HTML id
    className?: string; // Optional additional CSS classes
    type: 'input' | 'dropdown'; // Determines button style
    callback?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Optional onClick
}

type SelectOptions = {
    markup: ReactElement; // JSX content to display for this option
    value: string; // Internal value identifier
    disabled: boolean; // Whether option is clickable
}

type SelectOptionsProps = {
    options: Array<SelectOptions>; // List of dropdown options
    className?: string; // Optional additional CSS classes
    rightAlign?: boolean; // If true, dropdown aligns to the right
    callback?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Optional option click callback
}

type SelectProps = {
    children: React.ReactNode; // Usually a SelectButton and SelectOptions
};

// --------------------
// Context
// --------------------
export const SelectContext = createContext<SelectContextProps>({
    open: false,
    value: null,
    setOpen: () => { },
    setValue: () => { },
    type: 'input',
});

// --------------------
// Components
// --------------------
/**
 * SelectButton
 * Button that displays the current selected value or placeholder.
 * Toggles the dropdown open/closed on click.
 * 
 * @param placeholder: Text shown when no value is selected
 * @param initialVal: Default value if no selection has been made
 * @param buttonId: Optional HTML id for the button
 * @param className: Additional classes for styling
 * @param type: 'input' | 'dropdown' to style button appropriately
 * @param callback: Optional function triggered on click
 * @returns JSX button element for selecting a value
 */
export const SelectButton: React.FC<SelectButtonProps> = ({
    placeholder = '',
    initialVal = '',
    buttonId = '',
    className = '',
    type = 'input' ,
    callback = () => { }
}) => {
    const { open, value, setOpen } = useContext(SelectContext);

    const toggleOpen = () => {
        setOpen(!open);
    }

    return (
        <button
            id={buttonId}
            className={`${className} select select-button-${type}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                callback(e);
                toggleOpen();
            }}
        >
            {(value || initialVal) ? (
                <div className='value'>{(value) ? value : initialVal}</div>
            ) : (
                <span className='placeholder'>{placeholder}</span>
            )}
            <ThemeIcon
              id={'dropdown-arrow'}
              width={15}
              height={12}
              className={`color-fill select-button-arrow ${open && 'opened'}`}
              ariaLabel={'dropdown arrow'}/>
        </button>
    );
};

/**
 * SelectOptions
 * Renders the dropdown options when the select is open.
 * Clicking an option sets the selected value and closes the dropdown.
 * 
 * @param options: Array of objects containing markup, value, and disabled state
 * @param className: Optional additional CSS classes
 * @param rightAlign: Boolean to right-align the dropdown
 * @param callback: Optional function triggered when an option is clicked
 * @returns JSX element containing the list of selectable options (or empty fragment if closed)
 */
export const SelectOptions: React.FC<SelectOptionsProps> = ({
    options,
    className = '',
    rightAlign = false,
    callback = () => { }
}) => {
    const { open, setOpen, setValue } = useContext(SelectContext);

    if (open) {
        return (
            <div
                className='select-options'
                style={rightAlign ? { right: 0 } : {}}
            >
                {/* Using index as key is usually bad, but order is not changing here */}
                {options.map((option, index) =>
                    <button
                        key={`${index}-${option.value}`} // Safe key because options order is static
                        value={option.value}
                        disabled={option.disabled}
                        className={
                            `${className} 
                            select-option 
                            ${(index === 0) ? 'top' : (index === (options.length - 1)) ? 'bottom' : ''}`
                        }
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            setValue(option.markup);
                            callback(e);
                            setOpen(false);
                        }}
                    >{option.markup}</button>
                )}
            </div>
        )
    }

    return <></>;
}

/**
 * Select
 * Wrapper component that provides context for dropdowns or input-style selects.
 * Handles open/close state and clicks outside the component to close the dropdown.
 * 
 * @param children: React nodes, usually a SelectButton and SelectOptions
 * @returns JSX element containing the select context provider and children
 */
export const Select: React.FC<SelectProps> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [value, setValue] = useState<ReactElement | null>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            window.addEventListener('click', close);
        }

        return () => {
            window.removeEventListener('click', close);
        };
    }, [open]);

    return (
        <SelectContext.Provider value={{ open, value, setOpen, setValue, type: 'input' }}>
            <div className='select-container' ref={selectRef}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}
