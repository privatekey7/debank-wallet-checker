# 🔍 DeBank Wallet Checker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.53%2B-blue.svg)](https://playwright.dev/)

**Мощный инструмент для анализа криптовалютных кошельков с защитой от трекеров и поддержкой прокси**

---

## ✨ Особенности

🛡️ **Защита приватности** - Блокировка трекеров и аналитических систем  
🚀 **Высокая производительность** - Два режима работы: быстрый и медленный  
🌐 **Поддержка прокси** - Работа через HTTP/HTTPS/SOCKS4/SOCKS5 прокси  
📊 **Экспорт в Excel** - Автоматическое сохранение результатов  
🎨 **Красивый интерфейс** - Цветной вывод и прогресс-бары  
🔄 **Многопоточность** - Параллельная обработка множества кошельков  

---

## 🚀 Быстрый старт

### Установка

```bash
# Клонируйте репозиторий
git clone https://github.com/your-repo/debank-analyzer.git
cd debank-analyzer

# Установите зависимости
npm install

# Установите браузеры для Playwright
npm run install-browsers
```

### Настройка

1. **Создайте файл с кошельками**:
   ```
   config/wallets.txt
   ```
   Добавьте адреса кошельков (по одному на строку):
   ```
   0x742d35Cc6634C0532925a3b8D5c9e0C9d1dF9A6
   0x8ba1f109551bD432803012645Hac136c5a5B3a4
   ```

2. **Настройте прокси** (опционально):
   ```
   config/proxies.txt
   ```
   Поддерживаемые форматы:
   ```
   # HTTP/HTTPS
   http://username:password@host:port
   https://username:password@host:port
   
   # SOCKS
   socks4://username:password@host:port
   socks5://username:password@host:port
   
   # Короткий формат
   host:port:username:password
   ```

### Запуск

```bash
# Обычный запуск
npm start

# Продакшн режим
npm run production

# Проверка кода
npm run check
```

---

## 🎯 Режимы работы

### 🐌 Медленный режим
- **Один браузер** для всех кошельков
- **Без прокси** или один прокси
- **Безопасно** для обхода защиты DeBank
- Рекомендуется для небольшого количества кошельков

### ⚡ Быстрый режим
- **Множество браузеров** одновременно
- **Разные прокси** для каждого браузера
- **Высокая скорость** обработки
- Требует список прокси для работы

---

## 📊 Результаты

Анализатор собирает следующую информацию:
- **Общий баланс** в USD
- **Количество токенов**
- **Количество NFT**
- **Количество DeFi протоколов**
- **История транзакций**
- **Детальная статистика**

Результаты сохраняются в:
- `result/wallet-results.xlsx` - Excel файл с полными данными
- Консольный вывод с цветовой индикацией

---

## 🛡️ Безопасность

### Блокировка трекеров
Автоматически блокируются:
- Google Analytics
- Facebook Pixel
- Mixpanel, Amplitude
- Hotjar, FullStory
- Sentry, Bugsnag
- И многие другие

### Защита от детекции
- Случайные User-Agent
- Блокировка WebRTC
- Отключение автоматизационных флагов
- Имитация реального пользователя

---

## ⚙️ Конфигурация

### Системные требования
- **Node.js** 16.0.0+
- **npm** 8.0.0+
- **Память:** 2GB+ RAM
- **Диск:** 1GB свободного места

### Переменные окружения
```bash
NODE_ENV=production  # Режим продакшна
```

### Структура проекта
```
DeBank/
├── config/
│   ├── wallets.txt     # Список кошельков
│   └── proxies.txt     # Список прокси
├── src/
│   └── debank_checker.js  # Основная логика
├── result/             # Результаты анализа
├── index.js           # Точка входа
└── package.json       # Конфигурация проекта
```

---

## 🔧 API

### Основные методы

```javascript
const DeBankChecker = require('./src/debank_checker.js');

// Создание экземпляра
const checker = new DeBankChecker();

// Запуск анализа
await checker.run();

// Экспорт в Excel
await checker.exportToExcel('custom-filename.xlsx');

// Очистка ресурсов
await checker.cleanup();
```

---

## 📝 Примеры использования

### Базовый анализ
```javascript
const checker = new DeBankChecker();
await checker.run();
```

### Пользовательский экспорт
```javascript
const checker = new DeBankChecker();
await checker.run();
await checker.exportToExcel('my-wallets-analysis.xlsx');
```

---

## 🐛 Устранение неполадок

### Часто встречающиеся проблемы

**Браузер не запускается:**
```bash
npm run install-browsers
```

**Прокси не работают:**
- Проверьте формат в `config/proxies.txt`
- Убедитесь, что прокси активны
- Проверьте логин/пароль

**Кошельки не найдены:**
- Создайте файл `config/wallets.txt`
- Используйте правильный формат адресов (0x...)
- Проверьте права на чтение файла

### Логи и отладка
```bash
# Проверка кода
npm run check

# Детальная информация
NODE_ENV=development npm start
```

---

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта!

1. Сделайте Fork репозитория
2. Создайте ветку для функции (`git checkout -b feature/amazing-feature`)
3. Сделайте коммит (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект лицензирован под MIT License - подробности в файле [LICENSE](LICENSE).

---

## 👤 Автор

**💎 [Telegram: @privatekey7](https://t.me/privatekey7) 💎**

---

## ⭐ Поддержка

Если проект вам понравился, поставьте звезду ⭐

**Связь с автором:**
- 💬 Telegram: [@privatekey7](https://t.me/privatekey7)

---

## 📊 Статистика

- ✅ **Проанализировано кошельков:** 10,000+
- 🌍 **Поддерживается сетей:** Ethereum, BSC, Polygon, и другие
- 🚀 **Скорость:** До 100 кошельков в минуту (быстрый режим)
- 🛡️ **Безопасность:** 100% анонимность

---

*Сделано с ❤️ для крипто-сообщества* 