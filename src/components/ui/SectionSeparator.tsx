export default function SectionSeparator() {
  return (
    <div className="py-[12px] flex justify-center">
      <div 
        className="h-px"
        style={{ 
          background: 'rgba(217, 217, 217, 0.08)',
          maxWidth: '1720px',
          width: '100%'
        }}
      />
    </div>
  );
}
