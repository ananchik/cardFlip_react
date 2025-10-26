import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Card from "./Card";
import cardsData from "@/data/cards_copy.json";

// // Import card images
// import card1 from "@/assets/cards/00_Fool.jpg";
// import card2 from "@/assets/cards/01_Magician.jpg";
// import card3 from "@/assets/cards/02_High_Priestess.jpg";
// import card4 from "@/assets/cards/03_Empress.jpg";
// import card5 from "@/assets/cards/04_Emperor.jpg";
// import card6 from "@/assets/cards/05_Hierophant.jpg";
// import card7 from "@/assets/cards/06_Lovers.jpg";
// import card8 from "@/assets/cards/07_Chariot.jpg";
// import card9 from "@/assets/cards/08_Strength.jpg";
// import card10 from "@/assets/cards/09_Hermit.jpg";

// const cardImages: Record<number, string> = {
//   1: card1,
//   2: card2,
//   3: card3,
//   4: card4,
//   5: card5,
//   6: card6,
//   7: card7,
//   8: card8,
//   9: card9,
//   10: card10,
// };

const modules = import.meta.glob('@/assets/cards/*.*', {
  eager: true,
  query: '?url'
});

const cardImages: Record<number, string> = {};

// Сортируем файлы по имени для консистентности
const sortedFilePaths = Object.keys(modules).sort();

sortedFilePaths.forEach((filePath, index) => {
  cardImages[index + 1] = (modules[filePath] as any).default;
});

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        sendData: (data: string) => void;
        MainButton: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

const CardGame = () => {
  // console.log("Loaded cards data:", cardsData);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [canSend, setCanSend] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<typeof cardsData.cards>([]);

  // Shuffle cards on mount
  useEffect(() => {
    const shuffled = [...cardsData.cards].sort(() => Math.random() - 0.5).slice(0, 6);
    setShuffledCards(shuffled);
  }, []);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  useEffect(() => {
    if (selectedCards.length === 2 && !isComplete) {
      setIsComplete(true);
      // Задержка для завершения анимации переворота (700ms) + небольшой буфер
      setTimeout(() => {
        setCanSend(true);
      }, 800);
    }
  }, [selectedCards, isComplete]);

  const handleCardSelect = (cardId: number) => {
    if (selectedCards.length >= 2 || selectedCards.includes(cardId)) {
      return;
    }

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);
    setFlippedCards([...flippedCards, cardId]);
  };

  const handleSendData = () => {
    if (selectedCards.length === 2) {
      const selectedCardNames = selectedCards.map(
        (id) => cardsData.cards.find((card) => card.id === id)?.card_name
      );

      const data = JSON.stringify({
        cards: selectedCardNames,
      });

      // if (window.Telegram?.WebApp) {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(data);
        window.Telegram.WebApp.close();
      } else {
        // For testing without Telegram
        console.warn("Telegram WebApp object not available.");
        console.log("Selected cards:", selectedCardNames);
        alert(`Выбранные карты: ${selectedCardNames.join(", ")}`);
      }
    }
  };

  const handleReset = () => {
    setSelectedCards([]);
    setFlippedCards([]);
    setIsComplete(false);
    setCanSend(false);
    // Reshuffle cards on reset
    const shuffled = [...cardsData.cards].sort(() => Math.random() - 0.5).slice(0, 6);
    setShuffledCards(shuffled);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            {selectedCards.length === 0 && "Коснитесь карт, чтобы выбрать"}
            {selectedCards.length === 1 && "Выберите ещё одну карту"}
            {selectedCards.length === 2 && !canSend && "Карты переворачиваются..."}
            {selectedCards.length === 2 && canSend && "Карты выбраны! Отправьте результат"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {shuffledCards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              name={card.card_name}
              imageUrl={cardImages[card.id]}
              isFlipped={flippedCards.includes(card.id)}
              isSelected={selectedCards.includes(card.id)}
              onSelect={() => handleCardSelect(card.id)}
              disabled={selectedCards.length >= 2 && !selectedCards.includes(card.id)}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSendData}
            disabled={!canSend}
            className="flex-1 bg-gradient-mystic hover:opacity-90 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!canSend && selectedCards.length === 2 ? "Переворот карт..." : "Отправить выбор"}
          </Button>
          {selectedCards.length > 0 && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="px-6 py-6"
            >
              Сбросить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGame;
