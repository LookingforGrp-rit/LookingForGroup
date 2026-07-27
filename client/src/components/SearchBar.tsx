import { memo, FC, ChangeEvent, FocusEvent, useState, useCallback, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
export interface DataSet {
  data: unknown[];
}

interface SearchBarProps {
  /**
   * Array of datasets to filter. Each dataset must have a `data` array.
   * Can be multiple datasets, e.g., for multi-tab search results.
   */
  dataSets: DataSet[];
  /**
   * Callback invoked with filtered results for all datasets.
   * Each element of the outer array corresponds to the filtered results
   * of the matching dataset in `dataSets`.
   */
  onSearch: (results: unknown[][]) => void;
  /**
   * Optional controlled input value for the search query.
   * If provided, the search bar becomes controlled externally.
   */
  value?: string;
  /**
   * Optional change handler for controlled input behavior.
   * If provided, this will be called on every input change instead of
   * updating internal state.
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;

  setValue?: React.Dispatch<React.SetStateAction<string>>;

  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;

  //placeholder text, which should be different based on what page
  //the user is searching on
  placeholderText: string;

  //Shorter placeholder used on mobile, where the full text gets cut off.
  //If omitted, it's derived from placeholderText by dropping the leading
  //"Search by "/"Search for " (e.g. "Search by Project" -> "Project").
  mobilePlaceholderText?: string;
  
  searchBlocks?: string[];
}

//Screens this narrow can't fit the full "Search by ..." placeholder.
const MOBILE_QUERY = '(max-width: 500px)';

//Strips the "Search by "/"Search for " lead-in so the mobile placeholder is
//just the thing being searched (e.g. "Search by Project" -> "Project").
const deriveMobilePlaceholder = (text: string): string =>
  text.replace(/^\s*search\s+(?:by|for)\s+/i, '').trim();

/**
 * SearchBar Component
 * Provides a reusable search input to filter datasets dynamically.
 * Can operate with internal state or use controlled value via props.
 * Supports complex nested objects, arrays of strings, or primitive data types.
 * 
 * @param dataSets - Array of datasets to filter. Each dataset should have a `data` array.
 * @param onSearch - Callback function receiving the filtered results for all datasets.
 * @param value - Optional controlled input value for the search query.
 * @param onChange - Optional change handler for controlled input behavior.
 * @returns JSX element containing a styled search input with icon
 */
//FIXME: create way to update results if a new dataset is provided: discover page filter and project editor tag filters do not save search state
export const SearchBar: FC<SearchBarProps> = memo(({ dataSets, onSearch, value, onChange, setValue, onFocus, placeholderText = "Search by Project", mobilePlaceholderText, searchBlocks = [] }) => {
  // Internal query state for uncontrolled mode
  const [internalQuery, setInternalQuery] = useState('');
  
  // On mobile the full "Search by ..." text overflows, so show just the noun.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const effectivePlaceholder = isMobile
    ? (mobilePlaceholderText ?? deriveMobilePlaceholder(placeholderText))
    : placeholderText;

  /**
   * Handles input changes:
   * - Updates internal state if uncontrolled
   * - Calls external onChange if provided
   * - Triggers search filtering
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Convert the query to lowercase
    const newQuery = event.target.value.toLowerCase();
    // If onChange is passed in, call it
    if (onChange) {
      onChange(event);
    }
    
    if (setValue) 
      setValue(newQuery);
    else {
      setInternalQuery(newQuery);
    }
  };

  useEffect(() => {
    handleSearch(value ?? internalQuery);
  }, [value, internalQuery]);

  /**
   * Performs filtering across all datasets based on the query.
   * - Recursively checks object values and arrays for matching strings
   * - Filters primitive types directly
   *
   * @param searchQuery - lowercased search string
   */
  const handleSearch = useCallback((searchQuery: string) => {
    const splitSearchQuery = searchQuery.trim().split(' ');
    let currentQuery = splitSearchQuery[0];
    const filteredResults = dataSets.map((dataSet) =>
      dataSet.data.filter((item) => {
        if (typeof item === 'object') {
          // ONLY return fields we want to match, this avoids unintended searchbar behavior
          // Search using all string props on the item
          const includesInValue = (val: unknown, key?: string): boolean => {
            if (!val) return false;
            if (typeof val === 'string') {
              if (val.toLowerCase().includes("api")|| 
                  searchBlocks.includes(key ?? "") ||
                  key?.includes("id")) return false;
              return val.toLowerCase().includes(currentQuery);
            }
            if (Array.isArray(val)) {
              return val.some(e => includesInValue(e, key));
            }
            if (val && typeof val === 'object') {
              let keys = Object.keys(val);
              let values = Object.values(val);
              let match = false;
              for (let i = 0; i < values.length; i++) {
                if (includesInValue(values[i], keys[i].toLowerCase()))
                  match = true;
              }
              return match;
            }
            return false;
          };

          if (item === null) return false;
          
          let proccessedItem = item as typeof dataSet.data;

          for (const q of splitSearchQuery) {
            currentQuery = q;
            if (!includesInValue(proccessedItem)) return false;
          }
          return true;
        }
        else {
          for (const q of splitSearchQuery) {
            if (!String(item).toLowerCase().includes(q)) return false;
          }
          return true;
        }
      })
    );

    onSearch(filteredResults);
  }, [dataSets, onSearch]);

  return (
    <div className="search-wrapper">
      {/* Prevent form submission from refreshing the page */}
      <div className="search-bar">
        <div className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
        </div>
        {/* Input field for search query */}
        <input
          className="search-input"
          type="text"
          placeholder={effectivePlaceholder}
          value={value ?? internalQuery}
          onChange={handleChange}
          onFocus={onFocus}
          tabIndex={0}
          onKeyDown={(e) => {
            {/* Prevent odd popup behavior on enter click */ }
            if (e.key === 'Enter') {
              e.preventDefault();
              // Dismiss the mobile keyboard when the user hits Enter/Return.
              e.currentTarget.blur();
            } else if (e.key === ' ') {
              e.currentTarget.value += ' ';
              e.preventDefault();
            }
          }}
          aria-label='Searchbar'
          autoFocus={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
});

// import React, { useState, useCallback } from 'react';
// import { ProjectCard } from './ProjectCard'; // This has been replaced with ProjectPanel

// export const SearchBar = ({ dataSets, onSearch }) => {
//   let result;
//   result = `Search`;

//   // --- Searching ---
//   /*const [query, setQuery] = useState('');

//     useEffect(() => {
//       const filteredResults = dataSets.map(dataSet =>
//         dataSet.data.filter(item =>
//           Object.values(item).some(value =>
//             String(value).toLowerCase().includes(query.toLowerCase())
//           )
//         )
//       );
//       onSearch(filteredResults);
//     }, [query, dataSets, onSearch]);

//     const HandleChange = (event) => {
//         setQuery(event.target.value);
//     }*/

//   const [query, setQuery] = useState('');

//   const HandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const newQuery = event.target.value;
//     setQuery(newQuery);

//     const filteredResults = dataSets.map((dataSet) =>
//       dataSet.data.filter((item) => {
//         // See if it's an array of objects, or just an array of strings
//         if (typeof item === 'object') {
//           return Object.values(item).some((value) =>
//             String(value).toLowerCase().includes(newQuery.toLowerCase())
//           );
//         }

//         return String(item).toLowerCase().includes(newQuery.toLowerCase());
//       })
//     );
//     onSearch(filteredResults);
//   };

//   return (
//     <>
//       <div className="search-wrapper">
//         <form className="search-bar">
//           <button type="submit" className="search-button">
//             <i className="fa fa-search"></i>
//           </button>
//           <input
//             className="search-input"
//             type="text"
//             placeholder={result}
//             onChange={HandleChange}
//           ></input>
//         </form>
//       </div>
//     </>
//   );
// };
