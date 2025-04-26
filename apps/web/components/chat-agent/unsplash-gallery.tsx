import { UnsplashImage } from "@/lib/snippets/unsplash";

interface UnsplashGalleryProps {
  images: UnsplashImage[];
}

export function UnsplashGallery({ images }: UnsplashGalleryProps) {
  if (!images.length) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Images:</h1>
      <div className="grid grid-cols-2 gap-2">
        {images.map((image, index) => (
          <div className="relative aspect-square" key={index}>
            <img
              src={image.imageUrl}
              alt={image.description}
              className="object-cover absolute inset-0 w-full h-full rounded-lg"
            />
            <div className="absolute bottom-0 left-0 bg-black/30 hover:bg-black/60 transition-all text-white p-2">
              {image.authorName && (
                <a
                  href={image.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                >
                  {image.authorName}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
