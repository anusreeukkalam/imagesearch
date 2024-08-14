import './App.css';
import { useState, useEffect } from 'react';
import { createApi } from 'unsplash-js'; 
import { debounce } from 'lodash';
import { BounceLoader } from 'react-spinners';

const unsplash = createApi({
  accessKey: 'lPlQEhbj1mYetkyvFJSHDPv926NvT6saoQ09JDSA-5E',
});

function App() {
  const [phrase, setPhrase] = useState('');
  const [images, setImages] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);

  const fetchImages = async (query, page = 1) => {
    setFetching(true);
    try
    {
      const result = await unsplash.search.getPhotos({
        query,
        page,
        perPage: 5,
      });
      const newImages = result.response.results.map(result => result.urls.regular);
      setImages(prevImages => (page === 1 ? newImages : [...prevImages, ...newImages]));
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (phrase) {
      const debouncedFetch = debounce(() => {
        setImages([]);
        fetchImages(phrase, 1);
      }, 1000);
      debouncedFetch();
    }
  }, [phrase]);

  useEffect(() => {
    if (page > 1) {
      fetchImages(phrase, page);
    }
  }, [phrase,page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        !fetching &&
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      ) {
        setPage(prevPage => prevPage + 1);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetching]);

  return (
    <div className="container">
      <input
        type="text"
        className="search-box"
        value={phrase}
        onChange={e => setPhrase(e.target.value)}
        placeholder="Search images..."
      />
      <br />
      <div>
        {fetching && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <BounceLoader speedMultiplier={5} color={'#000000'} />
          </div>
        )}
      </div>
      <div className="image-grid">
        {images.length > 0 &&
          images.map((url, index) => (
            <img key={index} src={url} alt="" className="image-item" />
          ))}
      </div>
    </div>
  );
}

export default App;
