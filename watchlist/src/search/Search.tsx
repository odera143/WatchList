import { useState } from 'react';
import { useNavigate } from 'react-router';

const Search = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/searchResults?query=' + query);
  };
  return (
    <form className='d-flex' role='search' onSubmit={onSubmit}>
      <input
        className='form-control me-2'
        type='search'
        placeholder='Search for a movie...'
        aria-label='Search'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className='btn btn-outline-success' type='submit'>
        Search
      </button>
    </form>
  );
};
export default Search;
