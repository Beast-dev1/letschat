interface SectionTitleProps {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function SectionTitle({
  title,
  description,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}: SectionTitleProps) {
  return (
    <div className={`text-center mt-6 text-gray-700 ${className}`}>
      <h2 className={`text-3xl sm:text-4xl font-medium ${titleClassName}`}>
        {title}
      </h2>
      <p className={`max-w-2xl mt-4 text-gray-500 mx-auto ${descriptionClassName}`}>
        {description}
      </p>
    </div>
  );
}

