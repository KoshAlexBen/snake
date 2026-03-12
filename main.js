// Конфигурация — замените эти ссылки и текст на свои реальные данные
const CONFIG = {
  nextGame: {
    text: "15 марта, 19:00 — Квиз в баре «Пример» (ул. Примерная, 1)",
    // Например, ссылка на пост с описанием игры или форму регистрации
    url: "https://t.me/your_channel/1",
  },
  onlineClubsUrl: "https://t.me/your_channel/online_clubs",
  // Замените YOUR_BOT_USERNAME на реальный ник вашего бота без @
  botUsername: "YOUR_BOT_USERNAME",
};

const STORAGE_KEYS = {
  username: "benbot_username",
};

function initTelegramTheme() {
  if (!window.Telegram || !window.Telegram.WebApp) return;

  const tg = window.Telegram.WebApp;
  tg.ready();

  // Попробуем использовать имя пользователя в приветствии
  const greetingEl = document.getElementById("greeting");
  const user = tg.initDataUnsafe?.user;

  if (user && greetingEl) {
    const firstName = user.first_name || "игрок";
    greetingEl.textContent = `Привет, ${firstName}!`;

    // Сохраним имя локально, чтобы при следующем открытии вне Telegram
    // можно было показать то же имя
    try {
      localStorage.setItem(STORAGE_KEYS.username, firstName);
    } catch (e) {
      // игнорируем ошибки доступа к localStorage
    }
  }

  // Адаптация под тему Telegram
  document.body.style.backgroundColor = tg.backgroundColor || "transparent";
}

function initContent() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  const nextGameTextEl = document.getElementById("next-game-text");
  if (nextGameTextEl) {
    nextGameTextEl.textContent = CONFIG.nextGame.text;
  }

  const btnNextGame = document.getElementById("btn-next-game");
  const btnOnlineClubs = document.getElementById("btn-online-clubs");
  const btnOpenTelegram = document.getElementById("btn-open-telegram");
  const authCard = document.getElementById("auth-card");
  const greetingEl = document.getElementById("greeting");

  // Если мы НЕ в Telegram WebApp, попытаемся взять имя из localStorage
  const isInTelegram = Boolean(window.Telegram && window.Telegram.WebApp);
  if (!isInTelegram && greetingEl) {
    let savedName = null;
    try {
      savedName = localStorage.getItem(STORAGE_KEYS.username);
    } catch (e) {
      savedName = null;
    }

    if (savedName) {
      greetingEl.textContent = `Привет, ${savedName}!`;
    } else if (authCard) {
      // Имени нет — покажем карточку с предложением авторизоваться через Telegram
      authCard.style.display = "block";
    }
  }

  if (btnNextGame) {
    btnNextGame.addEventListener("click", () => {
      if (window.Telegram?.WebApp?.openLink && CONFIG.nextGame.url) {
        window.Telegram.WebApp.openLink(CONFIG.nextGame.url);
      } else if (CONFIG.nextGame.url) {
        window.open(CONFIG.nextGame.url, "_blank");
      }
    });
  }

  if (btnOnlineClubs) {
    btnOnlineClubs.addEventListener("click", () => {
      if (window.Telegram?.WebApp?.openLink && CONFIG.onlineClubsUrl) {
        window.Telegram.WebApp.openLink(CONFIG.onlineClubsUrl);
      } else if (CONFIG.onlineClubsUrl) {
        window.open(CONFIG.onlineClubsUrl, "_blank");
      }
    });
  }

  if (btnOpenTelegram && CONFIG.botUsername) {
    btnOpenTelegram.addEventListener("click", () => {
      const url = `https://t.me/${CONFIG.botUsername}?start=miniapp`;
      window.open(url, "_blank");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTelegramTheme();
  initContent();
});

