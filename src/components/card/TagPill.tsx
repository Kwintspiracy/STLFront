type TagPillProps = {
  tag: string;
};

const TagPill = ({ tag = 'test' }: TagPillProps) => {
  return (
    
        <div className="flex items-center justify-center text-[#C3C3C3] rounded border-1 border-[#C3C3C3] px-1.5 py-0.5">
          {tag}
        </div>

    
  );
};

export default TagPill;
