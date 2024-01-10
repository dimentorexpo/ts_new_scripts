// Функция для вывода информации о сетевых запросах на странице
function logRequest(details) {
	if ((details.statusCode >= 400) && (details.statusCode < 505)){
    console.log('%cСетевой запрос: ' + details.url + ' Метод: ' + details.method + ' Status Code: ' + details.statusCode  + ' IP: ' + details.ip, 'background: rgba(255, 0, 0, 0.5); color: white; padding: 2px 5px; border-radius: 2px;');
	}
}

// Отправляем сообщение в фоновый скрипт при завершении загрузки страницы
chrome.runtime.sendMessage({ message: 'pageLoaded' });

// Подписываемся на сообщения от фонового скрипта для вывода информации о сетевых запросах на страницу
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'logRequest') {
    logRequest(request.details);
  }
});
