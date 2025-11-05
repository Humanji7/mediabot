import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Генерируем WebP версию пути
  const getWebPSrc = (originalSrc: string) => {
    const extension = originalSrc.split(".").pop();
    if (extension && ["png", "jpg", "jpeg"].includes(extension.toLowerCase())) {
      return originalSrc.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    }
    return originalSrc;
  };

  const webpSrc = getWebPSrc(src);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}

      <picture>
        {/* WebP версия для современных браузеров */}
        {webpSrc !== src && (
          <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
        )}

        {/* Fallback для старых браузеров */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            hasError && "opacity-50",
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          sizes={sizes}
        />
      </picture>

      {/* Fallback для случаев ошибки загрузки */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Изображение недоступно
        </div>
      )}
    </div>
  );
};
