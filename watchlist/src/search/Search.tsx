import { Button } from 'react-bootstrap';
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
        className='form-control me-2 form-control-sm'
        type='search'
        placeholder='Search for a movie...'
        aria-label='Search'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant='outline-success' size='sm' type='submit'>
        Search
      </Button>
    </form>
  );
};
export default Search;
