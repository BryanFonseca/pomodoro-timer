class App {
  #form;
  #timeSelect;
  #initialMenuEl;
  #timer;
  #timerContainerEl;
  constructor() {
    this.#form = document.querySelector(".time-selection-form");
    this.#timeSelect = document.querySelector(".time-select");
    this.#initialMenuEl = document.querySelector('.initial-menu');
    this.#timerContainerEl = document.querySelector('.timer-container');
    this.#timer = new PomodoroTimer({
      onStop: this.onStopPomodoro.bind(this),
    });

    this.#form.addEventListener("submit", this.startPomodoro.bind(this));
  }
  startPomodoro(e) {
    e.preventDefault();
    this.#initialMenuEl.classList.add('initial-menu--hidden');
    const selectedTime = Number.parseInt(this.#timeSelect.value);
    this.#timer.start(selectedTime);
  }

  onStopPomodoro(){
    this.#initialMenuEl.classList.remove('initial-menu--hidden');
  }
}

class PomodoroTimer {
  #workTime;
  #breakTime;
  #timerID;
  #timerEl;
  #currentPomodoro;
  #initialPomodoro;
  #callbacks;

  constructor(callbacks) {
    if(callbacks){
      this.#callbacks = callbacks;
    }

    this.#timerEl = document.querySelector(".timer-container");
    this.#timerEl
      .querySelector(".timer-stop")
      .addEventListener("click", this.#stop);
    this.#timerEl
      .querySelector(".timer-pause")
      .addEventListener("click", this.#pause);

    //1 pom = 30 min = 1800 seg
  }

  start(time) {
//     this.#stop();
    this.#initialPomodoro = this.#currentPomodoro = 2 * time;
    this.#timerEl.querySelector(".pomodoro-count").textContent = `1 / ${this.#initialPomodoro}`;
    this.#startPomodoro();
  }

  #startPomodoro() {
    if (!this.#currentPomodoro) return console.log("finished all pomodoros");

    const pomodoroFraction = `${this.#initialPomodoro - (this.#currentPomodoro - 1)} / ${this.#initialPomodoro}`;
    this.#timerEl.querySelector(".pomodoro-count").textContent = pomodoroFraction;
    this.#resetPomodoroTimes();
    this.#currentPomodoro--;
    this.#startTicking();
  }

  #finishPomodoro() {
    // update pomodoros completed e.g. from 1/4 -> 2/4
    console.log("terminó uno");
    clearInterval(this.#timerID);
    this.#startPomodoro();
  }

  #resetPomodoroTimes() {
    this.#workTime = 1500;
    this.#breakTime = 300;
    this.#updateTimerEl(this.#workTime);
  }

  #startTicking() {
    this.tick();
    this.#timerID = setInterval(this.tick, 1000);
  }

  #stop = () => {
    // reset time in GUI to 25:00
    // reset fraction of pomodoros completed

    if(this.#callbacks.onStop){
      this.#callbacks.onStop();
    }

    console.log("forced stop!");
    clearInterval(this.#timerID);
    this.#resetPomodoroTimes();

    // cuando se para el timer de manera forzosa debería mostrarse nuevamente el formulario para elegir tiempo
    // usar el patron de ballbacks
  };

  #pause = () => {
    clearInterval(this.#timerID);

    this.#timerEl
      .querySelector(".timer-pause")
      .removeEventListener("click", this.#pause);
    this.#timerEl
      .querySelector(".timer-pause")
      .addEventListener("click", this.#resume);
  };

  #resume = () => {
    this.#timerID = setInterval(this.tick, 1000);

    this.#timerEl
      .querySelector(".timer-pause")
      .removeEventListener("click", this.#resume);
    this.#timerEl
      .querySelector(".timer-pause")
      .addEventListener("click", this.#pause);
  };

  //this is automatically set to instance and method is too since...
  tick = () => {
    //update timer in GUI

    if (this.#workTime > 0) {
      this.#updateTimerEl(this.#workTime);
      this.#workTime--;
      console.log(this.#workTime);
      return;
    }

    if (this.#breakTime < 0) {
      console.log("finished break time");
      this.#finishPomodoro();
      return;
    }

    this.#updateTimerEl(this.#breakTime);
    this.#breakTime--;
    console.log(this.#breakTime);
  };

  #updateTimerEl(time) {
    //convert seconds to clock notation
    const clockTime = this.#convertToClockNotation(time);
    this.#timerEl.querySelector(".time").textContent = clockTime;
  }

  #convertToClockNotation(seconds) {
    const min = `${Number.parseInt(seconds / 60)}`.padStart(2, 0);
    const sec = `${seconds % 60}`.padStart(2, 0);
    const time = `${min}:${sec}`;
    return time;
  }
}

new App();

// cuando terminen todos los pomodoros:
// el botón stop podría cambiar a reset y volver al menú inicial
// el botón pause se desactivaría
