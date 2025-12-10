import { memo, FC, ChangeEvent, useState, useCallback, useEffect } from 'react';

interface DataSet {
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
}

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
export const SearchBar: FC<SearchBarProps> = memo(({ dataSets, onSearch, value, onChange }) => {
  // Internal query state for uncontrolled mode
  const [internalQuery, setInternalQuery] = useState('');
  const query = value ?? internalQuery;

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
    } else {
      setInternalQuery(newQuery);
    }
    handleSearch(newQuery);
  };

  /**
   * Performs filtering across all datasets based on the query.
   * - Recursively checks object values and arrays for matching strings
   * - Filters primitive types directly
   *
   * @param searchQuery - lowercased search string
   */
  const handleSearch = useCallback((searchQuery: string) => {
    const filteredResults = dataSets.map((dataSet) =>
      dataSet.data.filter((item) => {
      if (typeof item === 'object') {
        // ONLY return fields we want to match, this avoids unintended searchbar behavior
        // Search using all string props on the item
        const includesInValue = (val: unknown): boolean => {
          if (typeof val === 'string') {
            return val.toLowerCase().includes(searchQuery);
          }
          if (Array.isArray(val)) {
            return val.some((el) => typeof el === 'string' && el.toLowerCase().includes(searchQuery));
          }
          if (val && typeof val === 'object') {
            return Object.values(val).some(includesInValue);
          }
          return false;
        };

        if (item === null) return false;
        return Object.values(item).some(includesInValue);
      }
      else {
          return String(item).toLowerCase().includes(searchQuery)
      }
      })
    );

    onSearch(filteredResults);
  }, [dataSets, onSearch]);

  useEffect(() => {
    handleSearch(query.toLowerCase());
  }, [dataSets, query]);

  return (
    <div className="search-wrapper">
      {/* Prevent form submission from refreshing the page */}
      <div className="search-bar">
        <div role="button" className="search-button" aria-label="Search" tabIndex={1}>
          <i className="fa fa-search" aria-hidden="true"></i>
        </div>
        {/* Input field for search query */}
        <input
          className="search-input"
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => {
            {/* Prevent odd popup behavior on enter click */}
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          autoComplete="searchbar-off"
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
