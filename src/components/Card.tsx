import { useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  id: number;
  name: string;
  imageUrl: string;
  isFlipped: boolean;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

const Card = ({ name, imageUrl, isFlipped, isSelected, onSelect, disabled }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full aspect-[2/3] cursor-pointer transition-all duration-300",
        isHovered && !disabled && "scale-105",
        disabled && "cursor-not-allowed opacity-60"
      )}
      onClick={() => !disabled && onSelect()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back */}
        <div
          className={cn(
            "absolute w-full h-full backface-hidden rounded-lg",
            "bg-gradient-to-br from-secondary to-card",
            "border-2 flex items-center justify-center",
            isSelected ? "border-primary shadow-glow" : "border-border"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-6xl opacity-30">🌙</div>
        </div>

        {/* Card Front */}
        <div
          className="absolute w-full h-full backface-hidden rounded-lg overflow-hidden border-2 border-accent rotate-y-180"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-3">
            <h3 className="text-accent text-lg font-bold text-center">{name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
