class Controls {
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;
    this.break = false;

    switch (type) {
      case "MANUAL":
      case "AI":
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = true;
        break;
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
          this.left = true;
          break;
        case "ArrowRight":
        case "d":
          this.right = true;
          break;
        case "ArrowUp":
        case "w":
          this.forward = true;
          break;
        case "ArrowDown":
        case "s":
          this.reverse = true;
          break;
        case " ":
          this.break = true;
          break;
      }
    };
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
          this.left = false;
          break;
        case "ArrowRight":
        case "d":
          this.right = false;
          break;
        case "ArrowUp":
        case "w":
          this.forward = false;
          break;
        case "ArrowDown":
        case "s":
          this.reverse = false;
          break;
        case " ":
          this.break = false;
          break;
      }
    };
  }
}
