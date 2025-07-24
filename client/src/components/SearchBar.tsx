import { memo, FC, ChangeEvent, useState, useLayoutEffect } from 'react';
// import { ProjectCard } from './ProjectCard';

interface Person {
  name: string;
  age: number;
  email?: string;
}

interface DataSet {
  data: (string | Person)[];
}


interface SearchBarProps {
  dataSets: DataSet[];
  onSearch: (results: (string | Person)[][]) => void;
  // Optional value & onChange for different searchbar behaviors (adding team member names)
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Search bar component for filtering data in Discover and Meet pages
// Component is memoized to prevent unnecessary re-renders
//FIXME: create way to update results if a new dataset is provided: discover page filter and project editor tag filters do not save search state
export const SearchBar: FC<SearchBarProps> = memo(({ dataSets, onSearch, value, onChange }) => {
  const [internalQuery, setInternalQuery] = useState('');
  const query = value ?? internalQuery;

  // Filter the data based on the query
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

const handleSearch = (searchQuery: string) => {
  const filteredResults = dataSets.map((dataSet) =>
    dataSet.data.filter((item) => {
     if (typeof item === 'object') {
      // ONLY return fields we want to match, this avoids unintended searchbar behavior
       return (
        (item.name && item.name.toLowerCase().includes(searchQuery)) ||
        (item.role && item.role.toLowerCase().includes(searchQuery)) ||
        (item.label && item.label.toLowerCase().includes(searchQuery)) || 
        (item.first_name && item.first_name.toLowerCase().includes(searchQuery)) ||
        (item.last_name && item.last_name.toLowerCase().includes(searchQuery))
       )
     }
     else {
        String(item).toLowerCase().includes(searchQuery)
     }
    }
    )
  );

  onSearch(filteredResults);
};


  useLayoutEffect(() => {
    if (query !== '') {
      handleSearch(query);
    }
  }, [dataSets]);

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
// import { ProjectCard } from './ProjectCard';

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
