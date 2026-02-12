import { MouseEventHandler, ReactNode } from "react";

interface TagsProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: string;
  selected?: boolean;
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
export const Tag = ({ children, className = '', type = "", onClick, selected = false }: TagsProps) => {
  let color = "grey";
  switch (type) {
    case "medium":
      color = "blue";
      break;
    
    // The genre type is very split
    case "creative":
    case "technical":
    case "games":
    case "multimedia":
    case "music":
    case "other":
      color = "green";
      break;
    
    case "developer skill":
      color = "yellow";
      break;
    case "designer skill":
      color = "red";
      break;
    case "soft skill":
      color = "purple";
      break;
    
    default:
      if (type == "") break;

      color = type;
      break;
  }

  let tag_extra_classes = "";
  if (!selected) {
    tag_extra_classes += "tag-unselected";
  }


  if (onClick != undefined) {
    return (
    <button className={"tag-button tag-" + color + " " + className + " " + tag_extra_classes} onClick={onClick} >
      {children}
    </button>
    );
  }
  
  return (
    <div className={"tag-button tag-label tag-" + color + " " + className + " " + tag_extra_classes} >
      {children}
    </div>
    );
};