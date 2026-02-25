import { useState } from "react";
import { ThemeIcon } from "./ThemeIcon";


export const ShareButton = () => {
  const [responseVisible, setResponseVisible] = useState<boolean>(false);

  return <>
    <button 
        className="share-button"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setResponseVisible(true);
        }}
        onMouseLeave={() => setResponseVisible(false)}
        >
      <div className={"share-response-popup" + (responseVisible ? "" : " hidden")}>
        Copied!
      </div>
      <ThemeIcon id={'share'} width={27} height={27} className={'mono-fill'} ariaLabel={'Share'}/>
      Share
    </button>
  </>
}