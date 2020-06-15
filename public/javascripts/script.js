window.onload = function () {
  console.log("ello");

  if (!("getContext" in document.createElement("canvas"))) {
    alert("Sorry, it looks like your browser does not support canvas!");
    return false;
  }

  const canvas = document.getElementById("paper");
  const url = "http://localhost:3000";
  const id = Math.round(Date.now() * Math.random());
  console.log("id", id);
  const socket = io(url);

  const clients = {};
  const cursors = {};
  const prev = {};

  let isDrawing = false;
  socket.on("moving", function (data) {
    if (!(data.id in clients)) {
      // a new user has come online. create a cursor for them
      console.log("csc", $('<div class="cursor">').appendTo("#cursors"));
      const newCursor = document.createElement("div");
      newCursor.classList.add = "cursor";
      console.log("newCursor", newCursor);
      cursors[data.id] = $('<div class="cursor">').appendTo("#cursors");
      console.log(cursors);
    }

    // Move the mouse pointer
    cursors[data.id].css({
      left: data.x,
      top: data.y,
    });

    // Is the user drawing?
    if (data.isDrawing && clients[data.id]) {
      // Draw a line on the canvas. clients[data.id] holds
      // the previous position of this user's mouse pointer
      console.log("clients", JSON.stringify(clients, null, 2));
      console.log("data transmitted", data);

      draw({
        fromX: clients[data.id].x,
        fromY: clients[data.id].y,
        toX: data.x,
        toY: data.y,
        strokeStyle: data.strokeStyle,
        lineWidth: data.lineWidth,
      });
    }

    // Saving the current client state
    clients[data.id] = data;
    clients[data.id].updated = Date.now();
  });

  const colorPicker = document.querySelector(".color-picker");
  const stroke = document.querySelector(".stroke");
  const clear = document.querySelector(".clear");
  const ctx = canvas.getContext("2d");

  const sideBarWidth = document.querySelector(".settings").offsetWidth;

  canvas.width = window.innerWidth - sideBarWidth;
  canvas.height = window.innerHeight;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.lineWidth = 7;
  ctx.strokeStyle = "black";

  colorPicker.addEventListener("change", (e) => {
    ctx.strokeStyle = e.target.value;
  });

  stroke.addEventListener("change", (e) => {
    ctx.lineWidth = e.target.value;
  });

  clear.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  function draw({ fromX, fromY, toX, toY, strokeStyle, lineWidth }) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  }

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    prev.x = e.offsetX;
    prev.y = e.offsetY;
  });

  let lastEmit = Date.now();
  canvas.addEventListener("mousemove", (e) => {
    if (Date.now() - lastEmit > 30) {
      socket.emit("mousemove", {
        x: e.offsetX,
        y: e.offsetY,
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        isDrawing,
        id: id,
      });
      lastEmit = Date.now();
    }

    if (isDrawing) {
      console.log("e.pageX", e.pageX);
      console.log("e.pageX", e.pageY);
      console.log("isDrawing", isDrawing);

      draw({
        fromX: prev.x,
        fromY: prev.y,
        toX: e.offsetX,
        toY: e.offsetY,
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
      });
    }
    prev.x = e.offsetX;
    prev.y = e.offsetY;
    prev.strokeStyle = ctx.strokeStyle;
    prev.lineWidth = ctx.lineWidth;
  });

  canvas.addEventListener("mouseup", () => (isDrawing = false));
  canvas.addEventListener("mouseout", () => (isDrawing = false));
};
