import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import Results from './search/Results';
import useApiFetch from './hooks/useApiFetch';

const Home = () => {
  const [query, setQuery] = useState('');
  const { data, loading, error, fetchData } = useApiFetch();
  const [currentPage, setCurrentPage] = useState(1);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fetchData(
      `https://api.themoviedb.org/3/search/movie?query=${query}&page=1`
    );
  };

  useEffect(() => {
    if (query) {
      fetchData(
        `https://api.themoviedb.org/3/search/movie?query=${query}&page=${currentPage}`
      );
    }
  }, [currentPage]);

  return (
    <Container fluid>
      <div className='d-flex justify-content-center'>
        <form onSubmit={onSubmit} className='mb-3'>
          <input
            type='text'
            placeholder='Search...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type='submit'>Search</button>
        </form>
      </div>
      <Results data={data} loading={loading} error={error} />
      {data && (
        <div className='d-flex justify-content-center gap-2'>
          <Button
            variant='primary'
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            {'<'}
          </Button>
          <Button
            variant='primary'
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            {'>'}
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Home;
