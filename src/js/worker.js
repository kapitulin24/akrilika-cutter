import {cutter} from "./cutter";

// Обработчик сообщений из главного потока
self.onmessage = function(event) {
  const param = event.data;

  // Выполняем вычисление факториала
  const result = cutter(param);

  // Отправляем результат обратно в главный поток
  self.postMessage(result);
};