// no se usará MVC porque el proyecto es relativamente sencillo
class App {
  #form;
  #timeSelect;
  #timer;
  constructor() {
    this.#form = document.querySelector("form");
    this.#timeSelect = document.querySelector("select");

    this.#form.addEventListener("submit", this.startPomodoro.bind(this));
  }
  startPomodoro(e) {
    e.preventDefault();
    const selectedTime = Number.parseInt(this.#timeSelect.value);
    this.#timer = new PomodoroTimer(selectedTime);
    this.#timer.start();
  }
}

class PomodoroTimer {
  #workTime;
  #breakTime;
  #timerID;
  #timerEl;
  #pomodoros;

  constructor(time) {
    this.#timerEl = document.querySelector(".timer-container");
    this.#timerEl.querySelector('.timer-stop').addEventListener('click', this.#stop.bind(this));
    this.#timerEl.querySelector('.timer-pause').addEventListener('click', this.#pause);
    this.#pomodoros = 2 * time;

    //1 pom = 30 min = 1800 seg
  }

  start() {
    this.#startPomodoro();
  }

  #startPomodoro() {
    if (!this.#pomodoros) return console.log("finished all pomodoros");

    this.#resetPomodoroTimes();
    this.#pomodoros--;
    this.#startTicking();
  }

  #finishPomodoro() {
    console.log("terminó uno");
    clearInterval(this.#timerID);
    this.#startPomodoro();
  }

  #resetPomodoroTimes() {
    this.#workTime = 1500;
    this.#breakTime = 300;
  }

  #startTicking() {
    this.#timerID = setInterval(this.tick, 1);
  }

  #stop(){
    console.log('forced stop!');
    clearInterval(this.#timerID);
    this.#resetPomodoroTimes();

    // cuando se para el timer de manera forzosa debería mostrarse nuevamente el formulario para elegir tiempo
    // usar el patron de ballbacks
  }

  #pause = () => {
    clearInterval(this.#timerID);

    this.#timerEl.querySelector('.timer-pause').removeEventListener('click', this.#pause);
    this.#timerEl.querySelector('.timer-pause').addEventListener('click', this.#resume);
  }

  #resume = () => {
    this.#timerID = setInterval(this.tick, 1);

    this.#timerEl.querySelector('.timer-pause').removeEventListener('click', this.#resume);
    this.#timerEl.querySelector('.timer-pause').addEventListener('click', this.#pause);
  }

  //this is automatically set to instance and method is too since...
  tick = () => {
    if (this.#workTime > 1) {
      this.#workTime--;
      console.log(this.#workTime);
      return;
    }

    if (this.#breakTime <= 0) {
      console.log("finished break time");
      this.#finishPomodoro();
      return;
    }

    this.#breakTime--;
    console.log(this.#breakTime);
  };
}

new App();
