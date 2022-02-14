import './modal.js';
class App {
  #form;
  #timeSelect;
  #initialMenuEl;
  #timer;
  #timerContainerEl;
  constructor() {
    this.#form = document.querySelector(".time-selection-form");
    this.#timeSelect = document.querySelector(".time-select");
    this.#initialMenuEl = document.querySelector(".initial-menu");
    this.#timerContainerEl = document.querySelector(".timer-container");
    this.#timer = new PomodoroTimer({
      onStop: this.onStopPomodoro.bind(this),
      onWorkStart: this.changeToWork.bind(this),
      onBreakStart: this.changeToBreak.bind(this),
      onFinish: this.finishSession.bind(this),
    });

    this.#form.addEventListener("submit", this.startPomodoro.bind(this));

    this.#hideElement(this.#timerContainerEl, 0);
  }
  startPomodoro(e) {
    // show first animation
    this.changeToWork();
    /*     this.#playStateAnimation('work'); */
    e.preventDefault();

    this.#hideElement(this.#initialMenuEl, 0.5);
    this.#showElement(this.#timerContainerEl, 0.5);
    const selectedTime = Number.parseInt(this.#timeSelect.value);
    this.#timer.start(selectedTime);
  }

  onStopPomodoro() {
    this.#showGradient();
    this.#showElement(this.#initialMenuEl, 0.5);
    this.#hideElement(this.#timerContainerEl, 0);
  }
  #hideElement(el, s) {
    //temporal, mirar video de jonas
    el.style.transitionDuration = `${s}s`;
    el.style.opacity = "0%";
    el.style.pointerEvents = 'none';
/*     new Promise(function (resolve) {
      setTimeout(resolve, s * 1000);
    }).then(() => (el.style.display = "none")); */
  }

  #showElement(el, s) {
    el.style.display = "block";
    el.style.pointerEvents = 'initial';
    el.style.transitionDuration = `${s}s`;

    // this forces rendering
    // el.offsetWidth
    el.style.opacity = '100%';

    new Promise(function (resolve) {
      setTimeout(resolve, 0);
    }).then(() => {
      el.style.opacity = "100%";
    });
  }

  #showGradient(gradientName = "work") {
    document
      .querySelectorAll('[class$="-gradient"]')
      .forEach((el) => (el.style.opacity = "0"));
    document.querySelector(`.${gradientName}-gradient`).style.opacity = "1";
  }

  changeToWork() {
    this.#playStateAnimation("Time to work!");
    //animation work
    this.#showGradient("work");
  }
  changeToBreak() {
    this.#playStateAnimation("Take a break!");
    //animation break
    this.#showGradient("break");
  }

  finishSession() {
    console.log("finally");
    this.#playStateAnimation("Session Finished!");
  }

  #playStateAnimation(stateMessage) {
    const stateEl = document.querySelector(".state-indicator");
    stateEl.textContent = stateMessage;
    // trick
    stateEl.classList.remove("state-indicator--anim");
    stateEl.offsetWidth;
    stateEl.classList.add("state-indicator--anim");
  }
}

class PomodoroTimer {
  #workTime;
  #breakTime;
  #timerID;
  #timerEl;
  #currentPomodoro;
  #pomodorosCount;
  #callbacks;
  #currentMode;
  #paused;

  constructor(callbacks) {
    if (callbacks) {
      this.#callbacks = callbacks;
    }

    this.#timerEl = document.querySelector(".timer-container");
    this.#timerEl
      .querySelector(".timer-stop")
      .addEventListener("click", this.#stop);
    this.#timerEl
      .querySelector(".timer-pause")
      .addEventListener("click", this.#pause);

    this.#timerEl
      .querySelector(".timer-skip")
      .addEventListener("click", this.#skipInterval.bind(this));

    this.#currentMode = "work";

    this.onModeChange = this.#callOnce(this.onModeChange);

    this.#paused = false;
    //1 pom = 30 min = 1800 seg
  }

  #init(){
    this.#timerEl.querySelector(".timer-pause").disabled = false;
    this.#timerEl.querySelector(".timer-skip").disabled = false;
    this.#timerEl.querySelector(".timer-stop").innerHTML = `
      <ion-icon name="stop"></ion-icon>
    `;
  }

  start(time) {
    this.#init();
    //     this.#stop();
    this.#pomodorosCount = this.#currentPomodoro = 2 * time;
    this.#timerEl.querySelector(".pomodoro-count").textContent = `1 / ${
      this.#pomodorosCount
    }`;
    this.#startPomodoro();
  }

  #startPomodoro() {
    if (!this.#currentPomodoro) return console.log("finished all pomodoros");

    const pomodoroFraction = `${
      this.#pomodorosCount - (this.#currentPomodoro - 1)
    } / ${this.#pomodorosCount}`;
    this.#timerEl.querySelector(".pomodoro-count").textContent =
      pomodoroFraction;
    this.#resetPomodoroTimes();
    this.#currentPomodoro--;
    this.#startTicking();
  }

  #skipInterval() {
    console.log(this);
    if (this.#paused) {
      this.#resume();
    }
    if (this.#workTime) {
      this.#workTime = 0;
    } else if (this.#breakTime) {
      if (
        this.#pomodorosCount ===
        this.#pomodorosCount - this.#currentPomodoro
      ) {
        this.#updateTimerEl(0);
      }
      this.#breakTime = -1;
    }
    this.tick();
  }

  #finishAllPomodoros() {
    const pauseButton = this.#timerEl.querySelector(".timer-pause");
    const skipButton = this.#timerEl.querySelector(".timer-skip");
    pauseButton.disabled = true;
    pauseButton.querySelector('ion-icon').style.color = 'inherit';
    skipButton.disabled = true;
    this.#timerEl.querySelector(".timer-stop").innerHTML = `
      <ion-icon name="reload-outline"></ion-icon>
    `;
  }

  #finishPomodoro() {
    // update pomodoros completed e.g. from 1/4 -> 2/4
    if (this.#currentPomodoro === 0) {
      if (this.#callbacks.onFinish) {
        this.#callbacks.onFinish();
      }

      this.#finishAllPomodoros();
    }

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

    if(this.#paused){
      this.#resume();
/*       this.#timerEl.querySelector('.timer-pause').click(); */
    }

    if (this.#callbacks.onStop) {
      this.#callbacks.onStop();
    }

    console.log("forced stop!");
    clearInterval(this.#timerID);
    this.#resetPomodoroTimes();
    this.#updateTimeProgressBar();


    // cuando se para el timer de manera forzosa debería mostrarse nuevamente el formulario para elegir tiempo
    // usar el patron de ballbacks
  };

  #pause = () => {
    this.#paused = true;
    //change button to play

    this.#timerEl.querySelector(".timer-pause").innerHTML = `
      <ion-icon name="play"></ion-icon>
    `;

    clearInterval(this.#timerID);

    this.#timerEl
      .querySelector(".timer-pause")
      .removeEventListener("click", this.#pause);
    this.#timerEl
      .querySelector(".timer-pause")
      .addEventListener("click", this.#resume);
  };

  #resume = () => {
    this.#paused = false;
    this.#timerEl.querySelector(".timer-pause").innerHTML = `
      <ion-icon name="pause"></ion-icon>
    `;

    this.#timerID = setInterval(this.tick, 1000);

    this.#timerEl
      .querySelector(".timer-pause")
      .removeEventListener("click", this.#resume);
    this.#timerEl
      .querySelector(".timer-pause")
      .addEventListener("click", this.#pause);
  };

  onModeChange(mode) {
    if (mode === "work") {
      // gatillarse animación work
      if (this.#callbacks.onWorkStart) {
        this.#callbacks.onWorkStart();
      }
    } else if (mode === "break") {
      // gatillarse animación break
      if (this.#callbacks.onBreakStart) {
        this.#callbacks.onBreakStart();
      }
    }
  }

  #callOnce(func) {
    //decorator
    const localThis = decorated;
    function decorated(...args) {
      if (!localThis.alreadyCalled) {
        localThis.alreadyCalled = true;
        func.call(this, ...args);
      }
      return;
    }
    decorated.resetDecorator = function () {
      localThis.alreadyCalled = false;
    };
    return decorated;
  }

  //this is automatically set to instance and method is too since...
  tick = () => {
    // this code is SHIT but it's working
    if (this.#workTime <= 0) {
      this.onModeChange("break");
    }
    if (this.#breakTime < 0) {
      /*
       this executes only once so I reset the decorator in order to allow the function to execute again, I execute it
       right away and reset it again so that the if above can still make use of the decorator (because the code 
       inside that one is called multiple times)
       */
      /*       if (this.#currentPomodoro !== 0) { */
      this.onModeChange.resetDecorator();
      this.onModeChange("work");
      this.onModeChange.resetDecorator();
      /*       } */
    }

    //update timer in GUI
    this.#updateTimeProgressBar();

    if (this.#workTime > 0) {
      this.#updateTimerEl(this.#workTime);
      this.#workTime--;
      return;
    }

    if (this.#breakTime < 0) {
      /*       console.log("finished break time"); */
      this.#finishPomodoro();
      return;
    }

    this.#updateTimerEl(this.#breakTime);
    this.#breakTime--;
    /*     console.log(this.#breakTime); */
  };

  #updateTimeProgressBar() {
    // gets called every tick
    let percentage;
    if (this.#workTime) {
      percentage = this.#workTime / 1500;
    } else {
      percentage = this.#breakTime / 300;
    }
    percentage = percentage.toFixed(4);
    this.#timerEl.querySelector(
      ".progress__bar__inner"
    ).style.transform = `scaleX(${percentage})`;
  }

  #updateTimerEl(time) {
    //convert seconds to clock notation
    const clockTime = this.#convertToClockNotation(time);
    this.#timerEl.querySelector(".time-text").textContent = clockTime;
  }

  #convertToClockNotation(seconds) {
    const min = `${Number.parseInt(seconds / 60)}`.padStart(2, 0);
    const sec = `${seconds % 60}`.padStart(2, 0);
    const time = `${min}:${sec}`;
    return time;
  }
}

new App();
