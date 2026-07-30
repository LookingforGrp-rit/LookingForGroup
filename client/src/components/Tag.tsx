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
    case "project type":
    case "medium":
    case "major":
      color = "blue";
      break;

    case "genre":
      color = "green";
      break;

    case "style":
      color = "pink"
      break;

    case "positions":
      color = "purple";
      break;

    case "game engine":
      color = "yellow"
      break;

    case 'other':
    case 'context': //SORTORAMA: add proper tag color for context
      color = 'grey';
      break;

    case 'purpose': //SORTORAMA: add proper tag color for purpose, unless this orange is fine enough
    case 'role': //SORTORAMA: we should add a proper tag color for role too, since it will show up on the site and probably shouldn't just be gray right
      color = 'orange';
      break;

    case "developer skill":
    case "developer":
      color = "yellow";
      break;

    case "designer skill":
    case "designer":
    case 'content warning': //SORTORAMA: add proper tag color for content warning, preferably a different red
      color = "red";
      break;

    case "soft skill":
    case "soft":
      color = "purple";
      break;

    case "audio skill":
    case "audio":
      color = "periwinkle";
      break;

    case "engineer skill":
    case "engineer":
      color = "cyan";
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