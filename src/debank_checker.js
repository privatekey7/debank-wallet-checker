const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ExcelJS = require('exceljs');
const cliProgress = require('cli-progress');
const colors = require('colors');

class DeBankChecker {
  constructor() {
    this.results = [];
    this.browsers = [];
    this.progressBar = null;
    this.startTime = null;
    
    // Домены для блокировки трекеров
    this.blockedDomains = [
      '*google-analytics.com*',
      '*googletagmanager.com*',
      '*facebook.com*',
      '*facebook.net*',
      '*doubleclick.net*',
      '*googlesyndication.com*',
      '*googleadservices.com*',
      '*hotjar.com*',
      '*mixpanel.com*',
      '*segment.com*',
      '*amplitude.com*',
      '*intercom.io*',
      '*fullstory.com*',
      '*logrocket.com*',
      '*bugsnag.com*',
      '*sentry.io*'
    ];
  }

  // Красивая ANSI заставка
  showLogo() {
    console.clear(); // Очищаем экран
    
    const logo = `
${colors.cyan('╔══════════════════════════════════════════════════════════════════════════════╗')}
${colors.cyan('║')}                                                                              ${colors.cyan('║')}
${colors.cyan('║')}             ${colors.green.bold('██████╗ ███████╗██████╗  █████╗ ███╗   ██╗██╗  ██╗')}               ${colors.cyan('║')}
${colors.cyan('║')}             ${colors.green.bold('██╔══██╗██╔════╝██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝')}               ${colors.cyan('║')}
${colors.cyan('║')}             ${colors.green.bold('██║  ██║█████╗  ██████╔╝███████║██╔██╗ ██║█████╔╝')}                ${colors.cyan('║')}
${colors.cyan('║')}             ${colors.green.bold('██║  ██║██╔══╝  ██╔══██╗██╔══██║██║╚██╗██║██╔═██╗')}                ${colors.cyan('║')}
${colors.cyan('║')}             ${colors.green.bold('██████╔╝███████╗██████╔╝██║  ██║██║ ╚████║██║  ██╗')}               ${colors.cyan('║')}
${colors.cyan('║')}             ${colors.green.bold('╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝')}               ${colors.cyan('║')}
${colors.cyan('║')}                                                                              ${colors.cyan('║')}
${colors.cyan('║')}           ${colors.yellow.bold('██████╗ ██╗  ██╗███████╗ ██████╗██╗  ██╗███████╗██████╗')}            ${colors.cyan('║')}
${colors.cyan('║')}           ${colors.yellow.bold('██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝██╔════╝██╔══██╗')}           ${colors.cyan('║')}
${colors.cyan('║')}           ${colors.yellow.bold('██║     ███████║█████╗  ██║     █████╔╝ █████╗  ██████╔╝')}           ${colors.cyan('║')}
${colors.cyan('║')}           ${colors.yellow.bold('██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ ██╔══╝  ██╔══██╗')}           ${colors.cyan('║')}
${colors.cyan('║')}           ${colors.yellow.bold('╚██████╗██║  ██║███████╗╚██████╗██║  ██╗███████╗██║  ██║')}           ${colors.cyan('║')}
${colors.cyan('║')}           ${colors.yellow.bold(' ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝')}           ${colors.cyan('║')}
${colors.cyan('║')}                                                                              ${colors.cyan('║')}
${colors.cyan('║')}                    ${colors.gray('💎 Автор: ')}${colors.blue('https://t.me/privatekey7')}${colors.gray('💎')}                      ${colors.cyan('║')}
${colors.cyan('║')}                                                                              ${colors.cyan('║')}
${colors.cyan('╚══════════════════════════════════════════════════════════════════════════════╝')}
`;

    console.log(logo);
    console.log(''); // Пустая строка после логотипа
  }

  // Проверка наличия прокси
  checkProxies() {
    const proxyFile = 'config/proxies.txt';
    
    if (!fs.existsSync(proxyFile)) {
      return { hasProxies: false, proxies: [] };
    }

    try {
      const content = fs.readFileSync(proxyFile, 'utf8');
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

      const validProxies = [];
      
      for (const line of lines) {
        const proxy = this.parseProxyString(line);
        if (proxy) {
          validProxies.push(proxy);
        }
      }

      return {
        hasProxies: validProxies.length > 0,
        proxies: validProxies
      };
    } catch (error) {
      console.log(colors.yellow(`⚠️ Ошибка чтения файла прокси: ${error.message}`));
      return { hasProxies: false, proxies: [] };
    }
  }

  // Парсинг строки прокси (поддержка 4 форматов)
  parseProxyString(proxyString) {
    try {
      let protocol = 'http';
      let server = '';
      let username = '';
      let password = '';
      let host = '';
      let port = '';

      const cleanProxy = proxyString.trim();

      // Формат IP:PORT:LOGIN:PASS
      const colonParts = cleanProxy.split(':');
      if (colonParts.length === 4 && !cleanProxy.includes('://') && !cleanProxy.includes('@')) {
        host = colonParts[0];
        port = colonParts[1];
        username = colonParts[2];
        password = colonParts[3];
        protocol = 'http';
        server = `${host}:${port}`;
      } else {
        // Стандартные форматы с протоколом или @
        if (cleanProxy.startsWith('http://')) {
          protocol = 'http';
          server = cleanProxy.replace('http://', '');
        } else if (cleanProxy.startsWith('https://')) {
          protocol = 'https';
          server = cleanProxy.replace('https://', '');
        } else if (cleanProxy.startsWith('socks5://')) {
          protocol = 'socks5';
          server = cleanProxy.replace('socks5://', '');
        } else if (cleanProxy.startsWith('socks4://')) {
          protocol = 'socks4';
          server = cleanProxy.replace('socks4://', '');
        } else {
          protocol = 'http';
          server = cleanProxy;
        }

        // Парсим авторизацию если есть
        if (server.includes('@')) {
          const parts = server.split('@');
          if (parts.length === 2) {
            const authPart = parts[0];
            server = parts[1];
            
            if (authPart.includes(':')) {
              const authParts = authPart.split(':');
              username = authParts[0];
              password = authParts[1];
            }
          }
        }

        // Извлекаем host и port
        if (server.includes(':')) {
          const serverParts = server.split(':');
          host = serverParts[0];
          port = serverParts[1];
        }
      }

      // Валидация - прокси должен иметь авторизацию
      if (!username || !password) {
        return null;
      }

      // Базовая валидация
      if (!host || !port || isNaN(port)) {
        return null;
      }

      return {
        server: `${protocol}://${server}`,
        protocol: protocol,
        host: host,
        port: parseInt(port),
        username: username,
        password: password
      };
    } catch (error) {
      return null;
    }
  }

  // Загрузка кошельков
  loadWallets() {
    const walletFile = 'config/wallets.txt';
    
    if (!fs.existsSync(walletFile)) {
      throw new Error(`Файл ${walletFile} не найден`);
    }

    try {
      const content = fs.readFileSync(walletFile, 'utf8');
      const addresses = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .filter(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));

      if (addresses.length === 0) {
        throw new Error('Не найдено валидных адресов кошельков');
      }

      return addresses;
    } catch (error) {
      throw new Error(`Ошибка загрузки кошельков: ${error.message}`);
    }
  }

  // Создание браузера
  async createBrowser(proxy = null) {
    const launchOptions = {
      headless: true,
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins'
      ]
    };

    // Добавление прокси если есть
    if (proxy) {
      launchOptions.proxy = {
        server: proxy.server,
        username: proxy.username,
        password: proxy.password
      };
    }

    const browser = await chromium.launch(launchOptions);
    this.browsers.push(browser);
    return browser;
  }

  // Создание защищенного контекста
  async createProtectedContext(browser) {
    const context = await browser.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1280, height: 720 },
      extraHTTPHeaders: {
        'Accept-Language': 'ru-ru,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    // Блокировка трекеров
    await context.route('**/*', async (route) => {
      const url = route.request().url();
      const shouldBlock = this.blockedDomains.some(domain => {
        const pattern = domain.replace(/\*/g, '.*');
        return new RegExp(pattern).test(url);
      });

      if (shouldBlock) {
        await route.abort();
      } else {
        await route.continue();
      }
    });

    return context;
  }

  // Получение случайного User-Agent
  getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Анализ одного кошелька
  async analyzeWallet(address, browser) {
    let totalValue = 0;
    let error = null;
    let context = null;
    let page = null;

    try {
      context = await this.createProtectedContext(browser);
      page = await context.newPage();

      const profileUrl = `https://debank.com/profile/${address}`;
      await page.goto(profileUrl, { 
        waitUntil: 'networkidle', 
        timeout: 60000 
      });

      // Ждем загрузки данных
      await page.waitForTimeout(5000);

      // Попытка найти общий баланс
      const selectors = [
        '[data-testid="total-balance"]',
        '.HeaderInfo_totalAssetInner__HyrdC',
        '.TotalAssetCard_totalAssetInner__VVZFX',
        'div[class*="totalAsset"] span[class*="totalAssetInner"]',
        'div[class*="TotalAsset"] span',
        'span[class*="totalAssetInner"]'
      ];

      let balanceText = null;
      for (const selector of selectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            balanceText = await element.textContent();
            if (balanceText && balanceText.includes('$')) {
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (balanceText) {
        const match = balanceText.match(/\$([0-9,]+\.?[0-9]*)/);
        if (match) {
          totalValue = parseFloat(match[1].replace(/,/g, ''));
        }
      }

    } catch (err) {
      error = err.message;
    } finally {
      if (page) await page.close();
      if (context) await context.close();
    }

    return {
      address,
      balance: totalValue,
      status: error ? 'Ошибка' : 'Успешно',
      error: error
    };
  }

  // Медленный режим (последовательный)
  async runSlowMode(wallets) {
    console.log(colors.yellow('🐌 МЕДЛЕННЫЙ РЕЖИМ: Последовательная проверка без прокси'));
    console.log(colors.gray(`⏱️ Ожидаемое время: ~${Math.round(wallets.length * 24)} секунд`));
    
    const browser = await this.createBrowser();
    
    this.progressBar = new cliProgress.SingleBar({
      format: colors.cyan('💰 Анализ кошельков') + ' |' + colors.green('{bar}') + '| {percentage}% | {value}/{total} | ' + colors.yellow('Осталось: {eta}s') + ' | ' + colors.green('{status}'),
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.progressBar.start(wallets.length, 0, { status: 'Запуск...', eta: 0 });

    // Инициализируем массив результатов
    this.results = [];

    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i];
      const result = await this.analyzeWallet(wallet, browser);
      this.results.push(result);
      
      const shortAddr = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
      const status = result.status === 'Успешно' ? 
        colors.green(`✅ ${shortAddr}`) : 
        colors.red(`❌ ${shortAddr}`);
      
      this.progressBar.update(i + 1, { 
        status: status,
        eta: Math.round((wallets.length - i - 1) * 24)
      });

      // Пауза между запросами
      if (i < wallets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    this.progressBar.stop();
    await browser.close();
  }

  // Быстрый режим (параллельный с прокси)
  async runFastMode(wallets, proxies) {
    const maxConcurrent = Math.min(proxies.length, 10); // Максимум 5 браузеров
    const batchSize = Math.min(wallets.length, 20);
    
    console.log(colors.green('🚀 БЫСТРЫЙ РЕЖИМ: Параллельная проверка с прокси'));
    console.log(colors.gray(`🌐 Прокси: ${proxies.length}, Браузеров: ${maxConcurrent}, Батч: ${batchSize}`));
    console.log(colors.gray(`⏱️ Ожидаемое время: ~${Math.round(wallets.length / maxConcurrent * 8)} секунд`));

    this.progressBar = new cliProgress.SingleBar({
      format: colors.cyan('🚀 Параллельный анализ') + ' |' + colors.green('{bar}') + '| {percentage}% | {value}/{total} | ' + colors.yellow('ETA: {eta}s') + ' | ' + colors.blue('Активных: {active}') + ' | ' + colors.magenta('{status}'),
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.progressBar.start(wallets.length, 0, { 
      status: 'Запуск...', 
      eta: 0,
      active: 0
    });

    // Создаем массив для результатов с сохранением порядка
    const tempResults = new Array(wallets.length);
    
    // Создаем браузеры с прокси
    const browsers = [];
    for (let i = 0; i < maxConcurrent; i++) {
      const proxy = proxies[i % proxies.length];
      const browser = await this.createBrowser(proxy);
      browsers.push(browser);
    }

    // Создаем индексированные кошельки для сохранения порядка
    const indexedWallets = wallets.map((wallet, index) => ({ wallet, originalIndex: index }));

    // Обрабатываем кошельки батчами
    const batches = [];
    for (let i = 0; i < indexedWallets.length; i += batchSize) {
      batches.push(indexedWallets.slice(i, i + batchSize));
    }

    let completed = 0;
    let activeCount = 0;

    for (const batch of batches) {
      const promises = batch.map(async (walletData, index) => {
        const { wallet, originalIndex } = walletData;
        const browserIndex = index % browsers.length;
        const browser = browsers[browserIndex];
        
        activeCount++;
        this.progressBar.update(completed, { 
          active: activeCount,
          status: 'Обработка...'
        });

        try {
          const result = await this.analyzeWallet(wallet, browser);
          // Записываем результат в правильную позицию
          tempResults[originalIndex] = result;
          
          completed++;
          activeCount--;
          
          const shortAddr = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
          const status = result.status === 'Успешно' ? 
            colors.green(`✅ ${shortAddr}`) : 
            colors.red(`❌ ${shortAddr}`);
          
          this.progressBar.update(completed, { 
            active: activeCount,
            status: status,
            eta: Math.round((wallets.length - completed) / maxConcurrent * 8)
          });
          
          return result;
        } catch (error) {
          activeCount--;
          completed++;
          
          const result = {
            address: wallet,
            balance: 0,
            status: 'Ошибка',
            error: error.message
          };
          // Записываем результат в правильную позицию
          tempResults[originalIndex] = result;
          
          this.progressBar.update(completed, { 
            active: activeCount,
            status: colors.red(`❌ ${wallet.slice(0, 6)}...${wallet.slice(-4)}`),
            eta: Math.round((wallets.length - completed) / maxConcurrent * 8)
          });
          
          return result;
        }
      });

      await Promise.all(promises);
      
      // Пауза между батчами
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Копируем результаты в правильном порядке
    this.results = tempResults;

    this.progressBar.stop();
    
    // Закрываем браузеры
    for (const browser of browsers) {
      await browser.close();
    }
  }

  // Создание прогресс-бара
  createProgressBar(total) {
    return new cliProgress.SingleBar({
      format: colors.cyan('💰 Анализ кошельков') + ' |' + colors.green('{bar}') + '| {percentage}% | {value}/{total} | ' + colors.yellow('Осталось: {eta}s') + ' | {status}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
  }

  // Экспорт в Excel
  async exportToExcel(filename = 'wallet-results.xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Результаты');

    // Добавляем заголовки
    worksheet.addRow(['Адрес кошелька', 'Баланс (USD)', 'Статус', 'Ошибка']);

    // Добавляем данные
    this.results.forEach(result => {
      worksheet.addRow([
        result.address,
        result.balance,
        result.status,
        result.error || ''
      ]);
    });

    // Вычисляем общий баланс
    const totalBalance = this.results.reduce((sum, r) => sum + r.balance, 0);
    
    // Добавляем пустую строку и строку с общим балансом
    worksheet.addRow(['', '', '', '']);
    const totalRow = worksheet.addRow(['ОБЩИЙ БАЛАНС:', totalBalance, '', '']);

    // Настройка ширины колонок
    worksheet.columns = [
      { header: 'Адрес кошелька', key: 'address', width: 45 },
      { header: 'Баланс (USD)', key: 'balance', width: 15 },
      { header: 'Статус', key: 'status', width: 10 },
      { header: 'Ошибка', key: 'error', width: 30 }
    ];

    // Стилизация заголовка
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Стилизация строки с общим балансом
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }
    };
    totalRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Центрирование всех ячеек
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (!cell.alignment) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
    });

    // Создаем папку result если не существует
    if (!fs.existsSync('result')) {
      fs.mkdirSync('result');
    }

    const filepath = `result/${filename}`;
    await workbook.xlsx.writeFile(filepath);

    return filepath;
  }

  // Главный метод запуска
  async run() {
    try {
      // Показываем логотип
      this.showLogo();
      
      this.startTime = Date.now();

      // Инициализируем массив результатов
      this.results = [];

      // Загружаем кошельки
      const wallets = this.loadWallets();
      console.log(colors.green(`📂 Загружено ${wallets.length} кошельков`));

      // Проверяем прокси
      const proxyCheck = this.checkProxies();
      
      if (proxyCheck.hasProxies) {
        console.log(colors.green(`🌐 Найдено ${proxyCheck.proxies.length} рабочих прокси`));
        await this.runFastMode(wallets, proxyCheck.proxies);
      } else {
        console.log(colors.yellow('⚠️ Прокси не найдены, переключение на медленный режим'));
        await this.runSlowMode(wallets);
      }

      // Подсчет результатов
      const totalBalance = this.results.reduce((sum, r) => sum + r.balance, 0);
      const successful = this.results.filter(r => r.status === 'Успешно').length;
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);

      // Финальный отчет
      console.log('\n' + colors.green('🎉 Анализ завершен за ' + duration + ' секунд!'));
      console.log(colors.yellow('💰 Общий баланс: $' + totalBalance.toLocaleString()));
      console.log(colors.green(`✅ Успешно: ${successful}/${wallets.length} кошельков`));

      // Экспорт в Excel
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const excelFile = await this.exportToExcel(`debank-results-${timestamp}.xlsx`);
      console.log(colors.blue('📊 Excel отчет: ' + excelFile));

    } catch (error) {
      console.error(colors.red('❌ Ошибка: ' + error.message));
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  // Очистка ресурсов
  async cleanup() {
    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (e) {
        // Игнорируем ошибки при закрытии
      }
    }
    this.browsers = [];
  }
}

module.exports = DeBankChecker; 