/*component used for things like project tags or user skills */
/*can send in an extra classname for extra customizability*/


interface TagsProps {
  children: string;
  className?: string;
}

export const Tags = ({ children, className = '' }: TagsProps) => {
  return (
    <div className={'tag' + ' ' + className}>
      <p className="tag-name">{children}</p>
    </div>
  );
};