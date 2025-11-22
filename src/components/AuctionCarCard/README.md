# AuctionCarCard Component

Современный React + TypeScript компонент для отображения карточек аукционных автомобилей.

## Архитектура

Компонент использует **Zustand store** и **кастомный хук** вместо пропсов, что соответствует современным практикам React.

### Структура

- `AuctionCarCard.tsx` - основной компонент
- `useAuctionCar.ts` - кастомный хук для получения данных
- `auctionStore.ts` - Zustand store для управления состоянием

## Использование

### Базовое использование

```tsx
import AuctionCarCard from '@/components/AuctionCarCard';

// Использует выбранный аукцион из store
<AuctionCarCard />
```

### С указанием конкретного аукциона

```tsx
// Отображает конкретный аукцион по ID
<AuctionCarCard auctionId="2" />
```

### Управление состоянием

```tsx
import { useAuctionStore } from '@/store/auctionStore';
import { useAuctionCar } from '@/hooks/useAuctionCar';

function MyComponent() {
  const { setSelectedAuction } = useAuctionStore();
  const { auction } = useAuctionCar();

  const handleSelectAuction = (id: string) => {
    setSelectedAuction(id);
  };

  return (
    <div>
      <button onClick={() => handleSelectAuction('1')}>
        Select Auction 1
      </button>
      <AuctionCarCard />
    </div>
  );
}
```

## Store API

```tsx
const {
  selectedAuctionId,    // ID выбранного аукциона
  auctions,            // Массив всех аукционов
  setSelectedAuction, // Функция для выбора аукциона
  updateAuction,       // Обновить данные аукциона
  addAuction,          // Добавить новый аукцион
} = useAuctionStore();
```

## Преимущества подхода

✅ **Нет пропс-дриллинга** - данные берутся напрямую из store  
✅ **Централизованное состояние** - все данные в одном месте  
✅ **Легкое тестирование** - можно мокать store  
✅ **Реактивность** - компонент автоматически обновляется при изменении store  
✅ **Типобезопасность** - полная поддержка TypeScript  

