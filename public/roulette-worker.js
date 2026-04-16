// Roulette Background Worker
let timer = null;

self.onmessage = function(e) {
  const { action, delay } = e.data;

  if (action === "startTimer") {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      self.postMessage({ action: "timerExpired" });
    }, delay || 4000); // Default 4s for animation
  }

  if (action === "stopTimer") {
    if (timer) clearTimeout(timer);
    timer = null;
  }
};
