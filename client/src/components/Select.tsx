import { createContext, ReactElement, useContext, useEffect, useState, useRef } from "react";
import { ThemeIcon } from "./ThemeIcon";

// --------------------
// Interfaces
// --------------------
type SelectContextProps = {
    open: boolean;
    value: ReactElement | null;
    setOpen: (open: boolean) => void;
    setValue: (value: ReactElement) => void;
}

type SelectButtonProps = {
    placeholder: string;
    initialVal: any;
    buttonId?: string;
    callback?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

type SelectOptions = {
    markup: ReactElement;
    value: string;
    disabled: boolean;
}

type SelectOptionsProps = {
    options: Array<SelectOptions>;
    className?: string;
    rightAlign?: boolean;
    callback?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

type SelectProps = {
    children: React.ReactNode;
};

// --------------------
// Context
// --------------------
export const SelectContext = createContext<SelectContextProps>({
    open: false,
    value: null,
    setOpen: () => { },
    setValue: () => { },
});

// --------------------
// Components
// --------------------
// Button component
export const SelectButton: React.FC<SelectButtonProps> = ({
    placeholder = '',
    initialVal = '',
    buttonId = '',
    className = '',
    callback = () => { }
}) => {
    const { open, value, setOpen } = useContext(SelectContext);

    const toggleOpen = () => {
        setOpen(!open);
    }

    return (
        <button
            id={buttonId}
            className={`${className} select-button`}
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
                light={'/assets/dropdown_light.png'}
                dark={'/assets/dropdown_dark.png'}
                addClass={`select-button-arrow ${(open) ? 'opened' : ''}`}
            />
        </button>
    );
};

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
                className='select'
                style={rightAlign ? { right: 0 } : {}}
            >
                {/* Using index as key is usually bad, but order is not changing here */}
                {options.map((option, index) =>
                    <button
                        key={`${index}-${option.value}`}
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
        <SelectContext.Provider value={{ open, value, setOpen, setValue }}>
            <div className='select-container' ref={selectRef}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}
