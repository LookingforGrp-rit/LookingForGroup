import { useState, FC, ReactNode } from "react";
import { ThemeIcon } from "./ThemeIcon";

interface ShareButtonProps {
  children?: ReactNode;
}

export const ShareButton : FC<ShareButtonProps> = ({children = undefined}) => {
  const [responseVisible, setResponseVisible] = useState<boolean>(false);

  let contents : ReactNode = <>
    <ThemeIcon id={'share'} width={27} height={27} className={'mono-fill'} ariaLabel={'Share'}/>
    Share
  </>;

  if (children != undefined) {
    contents = children;
  }

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
      {contents}
    </button>
  </>
}