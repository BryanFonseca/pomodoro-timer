// no architectural pattern used since the proyect is quite simple
class App {
  #form;
  #timeSelect;
  #timer;
  constructor() {
    this.#form = document.querySelector("form");
    this.#timeSelect = document.querySelector("select");
    this.#timer = new PomodoroTimer();

    this.#form.addEventListener("submit", this.startPomodoro.bind(this));
  }
  startPomodoro(e) {
    e.preventDefault();
    const selectedTime = Number.parseInt(this.#timeSelect.value);
    this.#timer.start(selectedTime);
  }
}

class PomodoroTimer {
  #workTime;
  #breakTime;
  #timerID;
  #timerEl;
  #pomodoros;

  constructor() {
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
    this.#pomodoros = 2 * time;
    this.#startPomodoro();
  }

  #startPomodoro() {
    if (!this.#pomodoros) return console.log("finished all pomodoros");

    this.#resetPomodoroTimes();
    this.#pomodoros--;
    this.#startTicking();
  }

  #finishPomodoro() {
    // update pomodoros completed e.g. from 1/4 -> 2/4
    console.log("terminó uno");
    clearInterval(this.#timerID);
    this.#startPomodoro();
  }

  #resetPomodoroTimes() {
    this.#workTime = 15;
    this.#breakTime = 3;
  }

  #startTicking() {
    this.tick();
    this.#timerID = setInterval(this.tick, 1000);
  }

  #stop = () => {
    // reset time in GUI to 25:00
    // reset fraction of pomodoros completed

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
    this.#timerEl.querySelector('.time').textContent = clockTime;
  }
  
  #convertToClockNotation(seconds){
    const min = `${Number.parseInt(seconds / 60)}`.padStart(2, 0);
    const sec = `${seconds % 60}`.padStart(2, 0);
    const time = `${min}:${sec}`;
    return time;
  }
}

new App();
