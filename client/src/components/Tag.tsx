import { MouseEventHandler, ReactNode } from "react";

interface TagsProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: string;
}

/**
 * Component used to display a single tag or skill.
 * Can receive an optional className for additional styling.
 * 
 * @param children - Text or elements to put inside the tag.
 * @param className - Optional additional CSS classes.
 * @param type - The type of tag to apply automatic coloring. Also supports 
 * passing in a color directly instead of a type.
 * @param onClick - Click event triggered upon clicking the tag. If provided,
 * turns the tag into a button.
 * 
 * @returns JSX element representing a styled tag
 */
export const Tag = ({ children, className = '', type="", onClick }: TagsProps) => {
  let color = "grey";
  switch (type) {
    case "medium":
      color = "blue";
      break;
    case "genre":
      color = "green";
      break;
    case "developer skills":
      color = "yellow";
      break;
    case "designer skills":
      color = "pink";
      break;
    case "soft skills":
      color = "purple";
      break;
    
    default:
      if (type == "") break;

      color = type;
      break;
  }

  if (onClick != undefined) {
    return (
    <button className={"tag tag-color-" + color + " " + className} onClick={onClick} >
      {children}
    </button>
    );
  }
  
  return (
    <div className={"tag tag-color-" + color + " " + className} >
      {children}
    </div>
    );
};