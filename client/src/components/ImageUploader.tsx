import './Styles/general.css';
import './Styles/imageUploader.css';
import { useEffect, useRef } from 'react';
import { sendPost } from '../functions/fetch'; //Not fixing, is this something to be implemented later?

interface ImageUploaderProps {
  initialImageUrl?: string;
  keepImage?: boolean;
  onFileSelected?: (file: File) => void;
}

export const ImageUploader = ({
  initialImageUrl = '',
  keepImage = true,
  onFileSelected = () => {},
}: ImageUploaderProps) => {
  // Ref for reading selected files
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Validate file type and handle image input change
  const handleImgChange = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    if (keepImage && (file.type === "image/png" || file.type === "image/jpeg")) {
      onFileSelected(file);
    } else {
      alert("File type not supported: Please use .PNG or .JPG");
    }
  };

  // On file input change, handle image selection 
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.addEventListener('change', handleImgChange);
    return () => input.removeEventListener('change', handleImgChange);
  }, [keepImage, onFileSelected]);

  return (
    <label htmlFor="image-uploader" id="drop-area">
      <input
        type="file"
        name="image"
        id="image-uploader"
        multiple accept=".png, .jpg"
        ref={inputRef}
        hidden
      />
      <div id="img-view">
        {initialImageUrl ? (
          <>
          <img src={initialImageUrl}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
          <img src="assets/white/upload_image.png" className="bottom-right"/>
          </>
        ) : (
        <>
        <img src="assets/white/upload_image.png" />
        <p className="project-editor-extra-info">Drop your image here, or browse</p>
        <span className="project-editor-extra-info">Supports: JPEG, PNG</span>
        </>
        )}
      </div>
    </label>
  );
};