window.onload = function () {
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
  const prev = {};

  let isDrawing = false;

  const colorPicker = document.querySelector(".color-picker");
  const stroke = document.querySelector(".stroke");
  const clear = document.querySelector(".clear");
  const ctx = canvas.getContext("2d");

  const currentSettings = {
    strokeStyle: "black",
    lineWidth: 7,
  };

  const sideBarWidth = document.querySelector(".settings").offsetWidth;

  canvas.width = window.innerWidth - sideBarWidth;
  canvas.height = window.innerHeight;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.lineWidth = 7;
  ctx.strokeStyle = "black";

  colorPicker.addEventListener("change", (e) => {
    currentSettings.strokeStyle = e.target.value;
    ctx.strokeStyle = e.target.value;
  });

  stroke.addEventListener("change", (e) => {
    currentSettings.lineWidth = e.target.value;
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
        id: id,
        x: e.offsetX,
        y: e.offsetY,
        settings: {
          strokeStyle: currentSettings.strokeStyle,
          lineWidth: currentSettings.lineWidth,
          isDrawing,
        },
      });
      lastEmit = Date.now();
    }

    if (isDrawing) {
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
  socket.emit("newUser", { id });

  socket.on("disconnected", (id) => {
    const cursor = document.getElementById(id);
    if (!cursor) return;
    cursor.remove();
  });

  socket.on("moving", function (data) {
    let newCursor;
    if (!(data.id in clients)) {
      // a new user has come online. create a cursor for them
      const cursors = document.querySelector("#cursors");
      newCursor = document.createElement("div");
      newCursor.classList.add("cursor");
      newCursor.setAttribute("id", data.id);

      cursors[data.id] = newCursor.innerHTML;
      cursors.appendChild(newCursor);
    }

    const cursor = document.getElementById(data.id);
    console.log("data.settings.strokeStyle", data.settings.lineWidth);
    cursor.style.left = `${data.x + sideBarWidth}px`;
    cursor.style.top = `${data.y}px`;
    cursor.style.position = "absolute";
    cursor.style.width = data.settings.lineWidth + "px";
    cursor.style.height = data.settings.lineWidth + "px";
    cursor.style.background = "orange";
    cursor.style.borderRadius = "50%";
    cursor.style.transform = "translate(-50%, -50%)";

    // Is the user drawing?
    if (data.settings.isDrawing && clients[data.id]) {
      // Draw a line on the canvas. clients[data.id] holds
      // the previous position of this user's mouse pointer

      draw({
        fromX: clients[data.id].x,
        fromY: clients[data.id].y,
        toX: data.x,
        toY: data.y,
        strokeStyle: data.settings.strokeStyle,
        lineWidth: data.settings.lineWidth,
      });

      // reset the settings to its active current user
      ctx.strokeStyle = currentSettings.strokeStyle;
      ctx.lineWidth = currentSettings.lineWidth;
    }

    // Saving the current client state
    clients[data.id] = data;
    clients[data.id].updated = Date.now();
  });
};
