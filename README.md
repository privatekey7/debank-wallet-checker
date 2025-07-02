# 🔎 DeBank Wallet Checker

<div align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow.svg" alt="JavaScript ES6+"/>
  <img src="https://img.shields.io/badge/Node.js-14+-green.svg" alt="Node.js 14+"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT"/>
</div>

## 📋 Описание

DeBank Wallet Checker - это мощный инструмент для анализа криптовалютных кошельков через DeBank API. Программа позволяет получать подробную информацию о балансах, токенах, NFT, истории транзакций и DeFi активностях кошельков в различных блокчейнах.

## ✨ Возможности

- ✅ Проверка балансов в более чем 40+ блокчейнах
- ✅ Отслеживание DeFi позиций (фарминг, стейкинг, ликвидность)
- ✅ Анализ истории транзакций
- ✅ Мониторинг NFT коллекций
- ✅ Оценка стоимости портфеля в реальном времени
- ✅ Поддержка массовой проверки кошельков
- ✅ Экспорт данных в различные форматы (CSV, JSON, Excel)

## 🚀 Установка

```bash
# Клонирование репозитория
git clone https://github.com/privatekey7/debank-wallet-checker.git

# Переход в директорию проекта
cd debank-wallet-checker

# Установка зависимостей
npm install
```

## 🔑 Настройка

Создайте файл `.env` в корневой директории проекта и добавьте свой DeBank API ключ:

```
DEBANK_API_KEY=ваш_api_ключ
```

## 💻 Использование

### Проверка одного кошелька:

```javascript
const { checkWallet } = require('./debank-checker');

async function main() {
  const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Пример адреса
  const walletInfo = await checkWallet(address);
  console.log(walletInfo);
}

main();
```

### Проверка нескольких кошельков:

```bash
node bulk-check.js --file wallets.txt --output json
```

### Параметры:

- `--file` - файл со списком адресов кошельков (по одному на строку)
- `--output` - формат вывода результатов (csv, json, excel)
- `--chains` - список блокчейнов для проверки (eth,bsc,polygon,...)
- `--protocols` - фильтр по DeFi протоколам
- `--min-value` - минимальная стоимость портфеля для включения в отчет

## 📊 Пример вывода

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "totalValueUsd": 12345.67,
  "chains": {
    "eth": {
      "usdValue": 8765.43,
      "tokens": [
        {
          "symbol": "ETH",
          "amount": 2.5,
          "usdValue": 7500.0
        },
        {
          "symbol": "USDC",
          "amount": 1265.43,
          "usdValue": 1265.43
        }
      ]
    },
    "polygon": {
      "usdValue": 3580.24,
      "tokens": [
        {
          "symbol": "MATIC",
          "amount": 1500,
          "usdValue": 1200.0
        },
        {
          "symbol": "AAVE",
          "amount": 15.5,
          "usdValue": 2380.24
        }
      ]
    }
  },
  "defiPositions": [
    {
      "protocol": "Aave",
      "chain": "eth",
      "type": "lending",
      "usdValue": 3500.0
    },
    {
      "protocol": "Uniswap",
      "chain": "eth",
      "type": "liquidity",
      "usdValue": 2800.0
    }
  ],
  "lastUpdated": "2025-07-02T12:59:00Z"
}
```

## 📝 Лицензия

Распространяется под лицензией MIT. См. файл `LICENSE` для получения дополнительной информации.

## 📬 Контакты

Если у вас есть вопросы или предложения, свяжитесь со мной через:
- Telegram: [@privatekey7](https://t.me/privatekey7)
- GitHub: [Issues](https://github.com/privatekey7/debank-wallet-checker/issues)