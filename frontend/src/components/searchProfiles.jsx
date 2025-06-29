import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const SearchProfiles = () => {
    const [results, setResults] = useState('');
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    const fetchData = async () =>{
        try {
            const response = await fetch(`http://localhost:5000/search_profiles?q=${query}`);
            if (response.ok) {
                const data = await response.json()
                setResults(data.profiles)
            }
        }catch (error) {
            console.error('Error fetching search results:', error);
        }
    }
useEffect(() => {
    if (query) {
    fetchData();}
}, [query])
    return (
<div className="search-profile-page">
            <h2>Search Results for "{query}"</h2>
            <div className="search-results">
                {results.length > 0 ? (
                    results.map((profile, index) => (
                        <div key={index} className="search-result">
                            <p>{profile.username} {profile.profile_pic && (
                                <img src={`http://localhost:5000/uploads/${profile.profile_pic}`} alt="Profile" height={50}/>
                            )}</p>
                            </div>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );

}

export default SearchProfiles;