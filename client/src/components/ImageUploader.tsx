import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileImage } from './FileImage';
import { Popup, PopupButton, PopupContent } from './Popup';
import { Select, SelectButton, SelectOptions } from './Select';
import placeholder from "../images/lfrog.png"
import { AspectRatios } from '@looking-for-group/shared/enums';
//import { sendPost } from '../functions/fetch'; //Not fixing, is this something to be implemented later?

interface ImageUploaderProps {
  // URL of an existing image to display initially
  initialImageUrl?: string;
  // Image file to display initially
  initialImageFile?: File;
  // If true, only allow image files
  keepImage?: boolean;
  // Callback triggered when the user selects a valid file
  onFileSelected?: (file: File, altText?: string) => void;
  // Determines styling and behavior
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


/**
 * ImageUploader handles file selection for images.
 *
 * @param initialImageUrl - URL of the initial image to display
 * @param initialImageFile - File object to display initially
 * @param keepImage - whether to accept only certain file types
 * @param onFileSelected - callback for when a file is selected
 * @param type - determines styling
 * @returns Renders the file input and preview interface
 */
const ImageUploader = ({
  initialImageUrl = '',
  initialImageFile,
  keepImage = true,
  onFileSelected = () => {},
  type
}: ImageUploaderProps) => {
  // Ref for reading selected files
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [zoom, setZoom] = useState(100);
  const [dX, setDX] = useState(0);
  const [dY, setDY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPos, setPrevPos] = useState<{x:number, y:number}>({x:0, y:0});

  const [cropFile, setCropFile] = useState<File>();
  const [cropImg, setCropImg] = useState<string>();

  // Files selected together but not yet cropped. They're cropped one at a time
  // through the popup so every image in a multi-select gets added, not just one.
  const pendingFiles = useRef<File[]>([]);

  const tempImage = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inputX = useRef<HTMLInputElement>(null);
  const inputY = useRef<HTMLInputElement>(null);
  const inputZoom = useRef<HTMLInputElement>(null);
  const inputAlt = useRef<HTMLInputElement>(null);
  const fileReader = new FileReader();

  const [aspectRatio, setAspectRatio] = useState<string>('1/1');

  const [labelName, setLabelName] = useState("drop-area");

  const [loadingImage, setLoadingImage] = useState(false);

//mouse dragging for cropping
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      e.preventDefault(); // stop context menu
      setIsDragging(true);
      setPrevPos({ x: e.clientX, y: e.clientY });

    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !tempImage.current || !canvas.current) return;

    const rect = canvas.current.getBoundingClientRect();

    const deltaX = (e.clientX - prevPos.x) * (canvas.current.width / rect.width);
    const deltaY = (e.clientY - prevPos.y) * (canvas.current.height / rect.height);

    const rawDX = dX - deltaX;
    const rawDY = dY -deltaY;

    const newDX = clampDX(rawDX);
    const newDY = clampDY(rawDY);

    setDX(newDX);
    setDY(newDY);

    setPrevPos({ x: e.clientX, y: e.clientY });
    updateCanvas();
  };

  //image boundaries clamp
  const clampDX = (value: number) => {
    const maxDX = getMaxDX();

    if (value > maxDX) return maxDX;
    if (value < -maxDX) return -maxDX;
    return value;
  };
  const clampDY = (value: number) => {
    const maxDY = getMaxDY();

    if (value > maxDY) return maxDY;
    if (value < -maxDY) return -maxDY;
    return value;
  };
  const getMaxDX = () => {
    if (!tempImage.current || !canvas.current) return 100; // fallback

    const effectiveZoom = Math.max(zoom, 100);
    const w = tempImage.current.width * (effectiveZoom / 100);
    const canvasWidth = canvas.current.width;

    return (w - canvasWidth) / 2;
  };

  const getMaxDY = () => {
    if (!tempImage.current || !canvas.current) return 100;

    const effectiveZoom = Math.max(zoom, 100);
    const h = tempImage.current.height * (effectiveZoom / 100);
    const canvasHeight = canvas.current.height;

    return (h - canvasHeight) / 2;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

//wheel zooming for cropping
  // const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
  //   if(!tempImage.current || !canvas.current) return;

  //   const delta = e.deltaY > 0 ? 0.95 : 1.05;
  //   const newZoom = zoom * delta;

  //   const minZoom = Math.max(
  //     (canvas.current?.width! / tempImage.current?.width!) * 100,
  //     (canvas.current?.height! / tempImage.current?.height!) * 100
  //   );

  //   const clampedZoom = Math.min(500, Math.max(minZoom, newZoom));

  //   const w = tempImage.current.width * (clampedZoom / 100);
  //   const h = tempImage.current.height * (clampedZoom / 100);

  //   const cw = canvas.current.width;
  //   const ch = canvas.current.height;

  //   const maxDX = (w - cw) / 2;
  //   const maxDY = (h - ch) / 2;

  //   const newDX = Math.min(maxDX, Math.max(-maxDX, dX));
  //   const newDY = Math.min(maxDY, Math.max(-maxDY, dY));

  //   setDX(newDX);
  //   setDY(newDY);

  //   setZoom(clampedZoom);
  //   updateCanvas();
  // };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!tempImage.current || !canvas.current) return;

    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    const newZoom = zoom * delta;

    const minZoom = getMinZoom();
    const maxZoom = getMaxZoom();

    const clampedZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));

    setZoom(clampedZoom);

    // Re‑clamp DX/DY after zoom changes
    setDX(clampDX(dX));
    setDY(clampDY(dY));

    updateCanvas();
  };

  const getMinZoom = () => {
    if (!tempImage.current || !canvas.current) return 100;

    return Math.max(
      (canvas.current.width / tempImage.current.width) * 100,
      (canvas.current.height / tempImage.current.height) * 100
    );
  };
  const getMaxZoom = () => 500;





  /**
   * updates the canvas element for cropping images
   */
  const updateCanvas = useCallback(() => {
    const tempCtx = canvas.current;
    if(!tempCtx || !tempImage.current) return;

    const ctx = tempCtx.getContext("2d");
    if(!ctx) return;

    ctx?.clearRect(0, 0, canvas.current?.width as number, canvas.current?.height as number);

    //improve image quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "none";

    if (tempImage.current && canvas.current){
      const w = tempImage.current.width * (zoom / 100);
      const h = tempImage.current.height * (zoom / 100);

      ctx?.drawImage(
        tempImage.current,
        canvas.current.width / 2 - w / 2 - dX,
        canvas.current.height / 2 - h / 2 - dY,
        w,
        h
      );

    }
  }, [tempImage, dX, dY, zoom, canvas]);

  // Reads one file, draws it on the crop canvas, and opens the crop popup.
  // Shared by the initial selection and each queued file.
  const loadFileIntoCrop = useCallback((file: File) => {
    setCropFile(file);
    setDX(0);
    setDY(0);

    // Each image gets its own caption. The popup stays mounted between queued
    // files, so the previous image's caption has to be cleared off both the
    // state and the uncontrolled input or it carries over to this one.
    if (inputAlt.current) inputAlt.current.value = "";

    if ((file.size > 1000000 && type === "profile") || file.size > 2000000) {
      onFileSelected(file, inputAlt.current?.value);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCropImg(result);

      const img = new Image();
      img.onload = () => {
        tempImage.current = img;

        const c = canvas.current;
        if (!c) return;

        // Compute minZoom (same as handlewheel)
        const minZoom = Math.max(
          (c.width / img.width) * 100,
          (c.height / img.height) * 100
        );

        setZoom(minZoom);

        //request animation frame to ensure canvas is updated after image is loaded
        requestAnimationFrame(() => {
          updateCanvas();
        });
        setLoadingImage(false);
      };
      img.src = result;
    };
    reader.onerror = () => setCropImg(placeholder);
    reader.readAsDataURL(file);
  }, [updateCanvas, inputAlt.current]);

  const handleImgChange = useCallback(async () => {
    const input = inputRef.current;
    if(!input) return;

    const files = input.files;
    if (!files || files.length === 0) return;
    

    // Split the selection into supported images and anything we can't use, so a
    // multi-select of several photos all get queued instead of dropping all but one.
    const supported: File[] = [];
    let hadUnsupported = false;
    for (const file of Array.from(files)) {
      if (keepImage && (file.type === "image/png" || file.type === "image/jpeg")) {
        supported.push(file);
      } else {
        hadUnsupported = true;
      }
    }

    //so can open same file and load popup again, otherwise it won't trigger change event if same file is selected
    input.value = "";

    if (hadUnsupported) {
      alert("File type not supported: Please use .PNG or .JPG");
    }
    if (supported.length === 0) return;

    // Crop the first image now; the rest wait in the queue and are loaded one at
    // a time as each crop is confirmed (see sendImg).
    pendingFiles.current = supported.slice(1);
    loadFileIntoCrop(supported[0]);
  }, [keepImage, loadFileIntoCrop]);

  const sendImg = useCallback(
    () => canvas.current?.toBlob(async(blob) => {
      const newFile = new File([blob as Blob], cropFile?.name as string, {type:cropFile?.type});
      onFileSelected(newFile, inputAlt.current?.value);
      if (inputRef.current) inputRef.current.value = "";

      // Move on to the next queued image, or close the popup when the batch is done.
      const next = pendingFiles.current.shift();
      if (next) {
        loadFileIntoCrop(next);
      } else {
        setCropImg(undefined);
      }
    }, cropFile?.type), 
  [onFileSelected, setCropImg, cropFile, canvas, loadFileIntoCrop, inputAlt.current]);

  
  // Effect for cleanup if needed; currently just removes event listeners
  useEffect(() => {
    if (!cropImg) return; // popup is not open, no need to set up canvas

    const c = canvas.current;
    const img = tempImage.current;
    if (!c || !img) return;

    // Set actual drawing resolution to match CSS size
    c.width = c.clientWidth;
    c.height = c.clientHeight;

    // Changing the aspect ratio changes the canvas size, which changes the
    // smallest zoom that still covers it. Without this the image would sit
    // letterboxed inside the new ratio until the user touched the zoom slider.
    const minZoom = Math.max(
      (c.width / img.width) * 100,
      (c.height / img.height) * 100
    );
    const effectiveZoom = Math.max(zoom, minZoom);
    if (effectiveZoom !== zoom) setZoom(effectiveZoom);

    const w = img.width * (effectiveZoom / 100);
    const h = img.height * (effectiveZoom / 100);

    const maxDX = Math.max(0, (w - c.width) / 2);
    const maxDY = Math.max(0, (h - c.height) / 2);

    // Re-clamp drag offsets whenever zoom changes
    setDX(prev => Math.min(maxDX, Math.max(-maxDX, prev)));
    setDY(prev => Math.min(maxDY, Math.max(-maxDY, prev)));

    // Draw AFTER zoom is applied
    requestAnimationFrame(() => updateCanvas());


    fileReader.onerror = () => setCropImg(placeholder);

    const input = inputRef.current;
    if (!input) return;

    input.addEventListener('change', handleImgChange);

    return () => input.removeEventListener('change', handleImgChange);
  }, [handleImgChange, fileReader, placeholder, updateCanvas, inputRef, cropImg, zoom, aspectRatio]);


  useEffect(()=> {
    updateCanvas();
  }, [zoom, dX, dY]);

  const closePopup = useCallback(() => {
    if (!loadingImage) {
      pendingFiles.current = [];
      setCropImg(undefined);
    }
  }, [loadingImage, pendingFiles, setCropImg]);

  const cropPopup = useMemo(
  () => cropImg !== undefined ?
    <Popup startOpen={true}>
      <PopupContent confirmation={true} callback={closePopup}>
        <div className="project-crop">
        <label id="project-crop-header">Crop image for thumbnail usage</label>
        <canvas ref={canvas} id="canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}

          width={
          aspectRatio === "16/9" ? 1600 :
          aspectRatio === "4/3" ? 800 :
          aspectRatio === "1/1" ? 800 :
          aspectRatio === "2/3" ? 600 :
          600}

          height={
          aspectRatio === "16/9" ? 900 :
          aspectRatio === "4/3" ? 600 :
          aspectRatio === "1/1" ? 800 :
          aspectRatio === "2/3" ? 900 :
          1300}

          style={{aspectRatio:aspectRatio}}
        ></canvas>

        {/* <img ref={tempImage} id="refImage" src={cropImg} alt={cropImg} /> */}
        <div id="aspect-row">
          <Select>
          <SelectButton
            placeholder={"Select an aspect Ratio"}
            initialVal={aspectRatio}
            callback={(e) => e.preventDefault()}
            buttonId="aspect-input"
            type={"input"}
            searchable={false}
          />
          <SelectOptions
            callback={(e) => {
            const ratio = (
              e.target as HTMLButtonElement
            ).value;

            // Just record the ratio. Resizing the canvas buffer and redrawing
            // is the effect's job, since it has to wait for the new ratio to
            // actually render before it can read the new client dimensions.
            setAspectRatio(ratio);
            }}
            options={
            Object.values(AspectRatios)
            .filter((ratio) => ratio !== 0 && ratio !== 1 && ratio !== 2 && ratio !== 3 && ratio !== 4)
            .map(
            (ratio) => {
              return {
              value: ratio,
              markup: <>{ratio}</>,
              disabled: false
              };
            }
            )}
          />
          </Select>
        </div>
        <div className="project-crop-mouse-instructions">
          <p>You can also drag the image around the view using the mouse, and zoom in and out with the scroll wheel.</p>
        </div>
        <div id="hide-range-rows">  
          <div id="zoom-row">
            <input
            type="range" ref={inputZoom}
            id="zoom" name="zoom"
            onChange={() => {
              const raw = inputZoom.current?.valueAsNumber ?? zoom;
              const minZoom = getMinZoom();
              const maxZoom = getMaxZoom();

              const clampedZoom = Math.min(maxZoom, Math.max(minZoom, raw));
              setZoom(clampedZoom);

              // Re‑clamp DX/DY after zoom changes
              setDX(clampDX(dX));
              setDY(clampDY(dY));
              updateCanvas();
            }}
            onInput={() => {
              const raw = inputZoom.current?.valueAsNumber ?? zoom;
              const minZoom = getMinZoom();
              const maxZoom = getMaxZoom();

              const clampedZoom = Math.min(maxZoom, Math.max(minZoom, raw));
              setZoom(clampedZoom);

              // Re‑clamp DX/DY after zoom changes
              setDX(clampDX(dX));
              setDY(clampDY(dY));
              updateCanvas();
            }}
            min={getMinZoom()}
            max={getMaxZoom()}
            value={zoom} />
            <label className="slider-text" htmlFor="zoom">Zoom</label>
          </div>
          <div id="xTrans-row">
            <input
            type="range" ref={inputX}
            id="xTrans" name="xTrans"
            onChange={() => {
              const raw = inputX.current?.valueAsNumber ?? 0;
              const clamped = clampDX(raw);
              setDX(clamped);
              updateCanvas();
            }}
            onInput={() => {
              const raw = inputX.current?.valueAsNumber ?? 0;
              const clamped = clampDX(raw);
              setDX(clamped);
              updateCanvas();
            }}
            min={-getMaxDX()}
            max={getMaxDX()}
            value={dX} />
              <label className="slider-text" htmlFor="xtrans">Xpos</label>
          </div>
          <div id="yTrans-row">
            <input
            type="range" ref={inputY}
            id="yTrans" name="yTrans"
            onChange={() => {
              const raw = inputY.current?.valueAsNumber ?? 0;
              const clamped = clampDY(raw);
              setDY(clamped);
              updateCanvas();

            }}
            onInput={() => {
              const raw = inputY.current?.valueAsNumber ?? 0;
              const clamped = clampDY(raw);
              setDY(clamped);
              updateCanvas();
            }}
            min={-getMaxDY()}
            max={getMaxDY()}
            value={dY} />
            <label className="slider-text" htmlFor="yTrans">Ypos</label>
          </div>
          {type === "project" ?
            <div id='alt-text-input'>
              <input
              type='text' ref={inputAlt}
              placeholder='enter the caption/alt text for the image (optional)'
              >
              </input>
            </div> 
          : "" }
        </div>
        <div className="project-crop-extra-info">
          Crop your image to a set ratio that better matches the site.
        </div>
        <div className="confirm-project-crop">
          <PopupButton buttonId="project-crop-save" callback={sendImg} doNotClose={() => true}>Crop Image</PopupButton>
          {/* If the action is canceled, no picture is uploaded */}
          <PopupButton buttonId="project-crop-cancel" callback={closePopup} className="project-info-buttons" doNotClose={() => true}>Cancel</PopupButton>
        </div>
        </div>
      </PopupContent>
    </Popup>
  : "",
  [cropImg, canvas, inputX, inputY, dX, dY, zoom, inputZoom, aspectRatio]);

  const profileVariant = (
    <>
      {cropPopup}
        <label htmlFor="image-uploader" id="profile-image-uploader" className={labelName}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLabelName("drop-area");
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLabelName("drop-area-drag-over");
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLabelName("drop-area");

            const data = e.dataTransfer;
            if(data.files && inputRef.current) {
              // TODO: allow drag and drop from other web images
              inputRef.current.files = data.files;
              handleImgChange();
            }
          }}>
        <input
          type="file"
          name="image"
          id="image-uploader"
          accept=".png, .jpg"
          ref={inputRef}
          onChange={handleImgChange}
          disabled={cropImg !== undefined}
          hidden
        />
        {initialImageFile ?
          <div id="img-view">
            <FileImage
              file={initialImageFile}
              alt="profile picture"
            />
            <img
              src="/assets/upload_image.png"
              alt="upload image"
              className="camera-button"
            />
          </div> :
          initialImageUrl ?
          <div id="img-view">
            <img
              src={initialImageUrl}
              alt="profile picture"
            />
            <img
              src="/assets/upload_image.png"
              alt="upload image"
              className="camera-button"
            />
          </div> :
          <div id="img-view">
            {/* Color style of SVG handled by fill property */}
            <svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M19.7139 0.25C20.0322 0.250195 20.3464 0.320501 20.6333 0.455724C20.9202 0.590947 21.1724 0.787632 21.3714 1.03125L29.8714 11.4479C30.0562 11.6601 30.1957 11.9066 30.2815 12.1727C30.3673 12.4388 30.3977 12.719 30.3709 12.9969C30.3441 13.2747 30.2607 13.5444 30.1255 13.79C29.9904 14.0356 29.8063 14.2521 29.5841 14.4266C29.362 14.6011 29.1064 14.73 28.8324 14.8058C28.5585 14.8816 28.2718 14.9026 27.9894 14.8677C27.707 14.8328 27.4346 14.7426 27.1884 14.6025C26.9423 14.4624 26.7273 14.2752 26.5564 14.0521L21.8389 8.27083V23.1667C21.8389 23.7192 21.615 24.2491 21.2165 24.6398C20.818 25.0305 20.2775 25.25 19.7139 25.25C19.1503 25.25 18.6098 25.0305 18.2113 24.6398C17.8128 24.2491 17.5889 23.7192 17.5889 23.1667V8.27083L12.8714 14.0542C12.7004 14.2773 12.4855 14.4645 12.2393 14.6046C11.9931 14.7447 11.7208 14.8349 11.4383 14.8698C11.1559 14.9047 10.8693 14.8837 10.5953 14.8079C10.3214 14.7321 10.0657 14.6031 9.8436 14.4286C9.62147 14.2541 9.43736 14.0377 9.30221 13.7921C9.16705 13.5465 9.0836 13.2768 9.05681 12.9989C9.03002 12.7211 9.06043 12.4408 9.14625 12.1748C9.23206 11.9087 9.37153 11.6622 9.55637 11.45L18.0564 1.03333C18.2551 0.789333 18.5073 0.592252 18.7942 0.456663C19.0811 0.321074 19.3954 0.250445 19.7139 0.25ZM13.3389 23.1667V21.0833H4.83887C3.7117 21.0833 2.63069 21.5223 1.83366 22.3037C1.03663 23.0851 0.588867 24.1449 0.588867 25.25V33.5833C0.588867 34.6884 1.03663 35.7482 1.83366 36.5296C2.63069 37.311 3.7117 37.75 4.83887 37.75H34.5889C35.716 37.75 36.797 37.311 37.5941 36.5296C38.3911 35.7482 38.8389 34.6884 38.8389 33.5833V25.25C38.8389 24.1449 38.3911 23.0851 37.5941 22.3037C36.797 21.5223 35.716 21.0833 34.5889 21.0833H26.0889V23.1667C26.0889 24.8243 25.4172 26.414 24.2217 27.5861C23.0261 28.7582 21.4046 29.4167 19.7139 29.4167C18.0231 29.4167 16.4016 28.7582 15.2061 27.5861C14.0105 26.414 13.3389 24.8243 13.3389 23.1667ZM30.3389 27.3333C29.7753 27.3333 29.2348 27.5528 28.8363 27.9435C28.4377 28.3342 28.2139 28.8641 28.2139 29.4167C28.2139 29.9692 28.4377 30.4991 28.8363 30.8898C29.2348 31.2805 29.7753 31.5 30.3389 31.5H30.3601C30.9237 31.5 31.4642 31.2805 31.8627 30.8898C32.2612 30.4991 32.4851 29.9692 32.4851 29.4167C32.4851 28.8641 32.2612 28.3342 31.8627 27.9435C31.4642 27.5528 30.9237 27.3333 30.3601 27.3333H30.3389Z" fill='var(--neutral-gray)'/>
            </svg>
            <p className="project-editor-extra-info">Drop your image here, or <span id="browse-link">browse</span></p>
            <span className="project-editor-extra-info">Supports: JPEG, PNG</span>
          </div>
        }
      </label>
    </>
  );

  const projectVariant = (
    <>
      {cropPopup}
      <label htmlFor="image-uploader" id="project-image-uploader" className={labelName}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLabelName("drop-area");
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLabelName("drop-area-drag-over");
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLabelName("drop-area");

            const data = e.dataTransfer;
            if(data.files && inputRef.current) {
              // TODO: allow drag and drop from other web images
              inputRef.current.files = data.files;
              handleImgChange();
            }
          }}>
        <input
          type="file"
          name="image"
          id="image-uploader"
          multiple accept=".png, .jpg"
          ref={inputRef}
          onChange={handleImgChange}
          onClick={() => setLoadingImage(true)}
          disabled={cropImg !== undefined}
          hidden={true}
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
    </>
  );

  return type === 'profile' ? profileVariant : projectVariant;
};

export { ProfileImageUploader, ProjectImageUploader };