/*component used for things like project tags or user skills */
/*can send in an extra classname for extra customizability*/


interface TagsProps {
  children: string;
  className?: string;
}

/**
 * Component used to display a single tag or skill.
 * Can receive an optional className for additional styling.
 * 
 * @param children - The text to display inside the tag
 * @param className - Optional additional CSS classes
 * @returns JSX element representing a styled tag
 */
export const Tags = ({ children, className = '' }: TagsProps) => {
  return (
    <div className={'tag' + ' ' + className}>
      <p className="tag-name">{children}</p>
    </div>
  );
};