import { useCallback, useEffect, useRef } from 'react';
//import { sendPost } from '../functions/fetch'; //Not fixing, is this something to be implemented later?

interface ImageUploaderProps {
  initialImageUrl?: string;
  keepImage?: boolean;
  onFileSelected?: (file: File) => void;
  type?: 'profile' | 'project';
}

// Two instances where uploader is needed:
// 1. Profile image = About tab of Edit Profile
// 2. Project images = Media tab of Edit/Create Project
// Both components have the same logic, just appear different to match intended styles.

const ProfileImageUploader = (props: ImageUploaderProps) => {
  return <ImageUploader {...props} type='profile' />;
};

const ProjectImageUploader = (props: ImageUploaderProps) => {
  return <ImageUploader {...props} type='project' />;
};

const ImageUploader = ({
  keepImage = true,
  onFileSelected = () => {},
  type
}: ImageUploaderProps) => {
  // Ref for reading selected files
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Validate file type and handle image input change
  const handleImgChange = useCallback(() => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    if (keepImage && (file.type === "image/png" || file.type === "image/jpeg")) {
      onFileSelected(file);
    } else {
      alert("File type not supported: Please use .PNG or .JPG");
    }
  }, [keepImage, onFileSelected]);

  // On file input change, handle image selection 
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    return () => input.removeEventListener('change', handleImgChange);
  }, [handleImgChange]);

  const profileVariant = (
    <></>
  );

  const projectVariant = (
    <label htmlFor="image-uploader" id="drop-area">
      <input
        type="file"
        name="image"
        id="image-uploader"
        multiple accept=".png, .jpg"
        ref={inputRef}
        onChange={handleImgChange}
        hidden
      />
      <div id="img-view" className="project-uploader">
        {/* Color style of SVG handled by fill property */}
        <svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7139 0.25C20.0322 0.250195 20.3464 0.320501 20.6333 0.455724C20.9202 0.590947 21.1724 0.787632 21.3714 1.03125L29.8714 11.4479C30.0562 11.6601 30.1957 11.9066 30.2815 12.1727C30.3673 12.4388 30.3977 12.719 30.3709 12.9969C30.3441 13.2747 30.2607 13.5444 30.1255 13.79C29.9904 14.0356 29.8063 14.2521 29.5841 14.4266C29.362 14.6011 29.1064 14.73 28.8324 14.8058C28.5585 14.8816 28.2718 14.9026 27.9894 14.8677C27.707 14.8328 27.4346 14.7426 27.1884 14.6025C26.9423 14.4624 26.7273 14.2752 26.5564 14.0521L21.8389 8.27083V23.1667C21.8389 23.7192 21.615 24.2491 21.2165 24.6398C20.818 25.0305 20.2775 25.25 19.7139 25.25C19.1503 25.25 18.6098 25.0305 18.2113 24.6398C17.8128 24.2491 17.5889 23.7192 17.5889 23.1667V8.27083L12.8714 14.0542C12.7004 14.2773 12.4855 14.4645 12.2393 14.6046C11.9931 14.7447 11.7208 14.8349 11.4383 14.8698C11.1559 14.9047 10.8693 14.8837 10.5953 14.8079C10.3214 14.7321 10.0657 14.6031 9.8436 14.4286C9.62147 14.2541 9.43736 14.0377 9.30221 13.7921C9.16705 13.5465 9.0836 13.2768 9.05681 12.9989C9.03002 12.7211 9.06043 12.4408 9.14625 12.1748C9.23206 11.9087 9.37153 11.6622 9.55637 11.45L18.0564 1.03333C18.2551 0.789333 18.5073 0.592252 18.7942 0.456663C19.0811 0.321074 19.3954 0.250445 19.7139 0.25ZM13.3389 23.1667V21.0833H4.83887C3.7117 21.0833 2.63069 21.5223 1.83366 22.3037C1.03663 23.0851 0.588867 24.1449 0.588867 25.25V33.5833C0.588867 34.6884 1.03663 35.7482 1.83366 36.5296C2.63069 37.311 3.7117 37.75 4.83887 37.75H34.5889C35.716 37.75 36.797 37.311 37.5941 36.5296C38.3911 35.7482 38.8389 34.6884 38.8389 33.5833V25.25C38.8389 24.1449 38.3911 23.0851 37.5941 22.3037C36.797 21.5223 35.716 21.0833 34.5889 21.0833H26.0889V23.1667C26.0889 24.8243 25.4172 26.414 24.2217 27.5861C23.0261 28.7582 21.4046 29.4167 19.7139 29.4167C18.0231 29.4167 16.4016 28.7582 15.2061 27.5861C14.0105 26.414 13.3389 24.8243 13.3389 23.1667ZM30.3389 27.3333C29.7753 27.3333 29.2348 27.5528 28.8363 27.9435C28.4377 28.3342 28.2139 28.8641 28.2139 29.4167C28.2139 29.9692 28.4377 30.4991 28.8363 30.8898C29.2348 31.2805 29.7753 31.5 30.3389 31.5H30.3601C30.9237 31.5 31.4642 31.2805 31.8627 30.8898C32.2612 30.4991 32.4851 29.9692 32.4851 29.4167C32.4851 28.8641 32.2612 28.3342 31.8627 27.9435C31.4642 27.5528 30.9237 27.3333 30.3601 27.3333H30.3389Z" fill='var(--neutral-gray)'/>
        </svg>
        <p className="project-editor-extra-info">Drop your image here, or <span id="browse-link">browse</span></p>
        <p className="project-editor-extra-info">Supports: JPEG, PNG</p>
      </div>
    </label>
  );

  return type === 'profile' ? profileVariant : projectVariant;
};

export { ProfileImageUploader, ProjectImageUploader };