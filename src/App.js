import './App.css';
import { useState, useEffect, useRef } from 'react';
import { createApi } from 'unsplash-js'; 
import { debounce } from 'lodash';
const unsplash = createApi({
  accessKey: 'lPlQEhbj1mYetkyvFJSHDPv926NvT6saoQ09JDSA-5E',
});
function App() {
  const [phrase, setPhrase] = useState('');  
  const [images, setImages] = useState([]);  
  const [fetching, setFetching] = useState(false);  
  const [page, setPage] = useState(1);  
  const phraseRef = useRef(phrase);
  const imagesRef = useRef(images);
  const fetchingRef = useRef(fetching);
  const getUnsplashImages = async (query, pageNumber = 1) => {
    setFetching(true);
    fetchingRef.current = true;
    try {
      const result = await unsplash.search.getPhotos({
        query,
        page: pageNumber,
        perPage: 5,
      });
      if (result.errors) {
        throw new Error(result.errors.join(", ")); 
      }
      return result.response.results.map(image => image.urls.regular);
    } catch (error) { 
      return [];
    } finally {
      setFetching(false);
      fetchingRef.current = false;
    }
  };
  useEffect(() => {
    phraseRef.current = phrase; 
    const debouncedFetch = debounce(async () => {
      setImages([]);  
      setPage(1);     
      if (phrase !== '') {
        const fetchedImages = await getUnsplashImages(phrase, 1);
        setImages(fetchedImages);
        imagesRef.current = fetchedImages; 
      }
    }, 1000); 
    debouncedFetch();  
    return () => {
      debouncedFetch.cancel();  
    };
  }, [phrase]);  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 2;
      if (isBottom && !fetchingRef.current && phrase !== '') {
        setPage(prevPage => prevPage + 1);  
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);  
  }, [phrase]);  
  useEffect(() => {
    const fetchMoreImages = async () => {
      if (page > 1) {
        const newImages = await getUnsplashImages(phraseRef.current, page);
        imagesRef.current = [...imagesRef.current, ...newImages];
        setImages(imagesRef.current);  
      }
    };
    fetchMoreImages();
  }, [page, phrase]); 
  return (
    <div>
      <input 
        type="text" 
        value={phrase} 
        onChange={e => setPhrase(e.target.value)} 
        placeholder="Search images..." 
        style={{ display: 'block', margin: '40px auto', width: '80%', padding: '10px' }} 
      />
      <div>
        {fetching && <div style={{ textAlign: 'center' }}>Fetching images...</div>}
      </div>
      <div className="image-grid">
        {images.length > 0 && images.map((url, index) => (
          <img key={index} src={url} alt="" className='image-item' />
        ))}
      </div>
    </div>
  );
}
export default App;
