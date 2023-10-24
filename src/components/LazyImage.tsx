import { useState } from 'react';


// Define the type for component props
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder: string;
  customClass?: string;
}


const LazyImage = ({ src, alt, placeholder, customClass }: LazyImageProps): JSX.Element => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const handleImageLoad = () => { setIsLoaded(true); };

  return (
    <div className={customClass || "image-container"}>
      <img src={placeholder} alt={alt} style={{ display: isLoaded ? "none" : "block" }} />
      <img src={src} alt={alt} style={{ display: isLoaded ? "block" : "none" }} onLoad={handleImageLoad} />
    </div>
  );
};

export default LazyImage;
