var game = {
    canvas: null,
    ctx: null,

    setup: function () {
        this.canvas = document.querySelector("canvas#gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 1000;
        this.canvas.height = 562.5;
    },

    create: {
        rect: function(x, y, width, height, fill = "#ff0000") {
            const ctx = game.ctx;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        circle: function(x, y, radius, fill = "#ff0000") {
            const ctx = game.ctx;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        line: function(x1, y1, x2, y2, width = 1, color = "#ff0000") {
            const ctx = game.ctx;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
            ctx.closePath();
        },

        triangle: function(x1, y1, x2, y2, x3, y3, fill = "#ff0000") {
            const ctx = game.ctx;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        },

        ellipse: function(x, y, radiusX, radiusY, rotation = 0, fill = "#0000ff") {
            const ctx = game.ctx;
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        polygon: function(points = [], fill = "#ff00ff") {
            const ctx = game.ctx;
            if (points.length < 3) return;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        },

        img: function(src, x = 0, y = 0, width = null, height = null) {
            const ctx = game.ctx;
            const image = new Image();
        
            image.onload = function() {
                if (width && height) {
                    ctx.drawImage(image, x, y, width, height);
                } else {
                    ctx.drawImage(image, x, y);
                }
            };
        
            image.src = src;
        }
    }
};

console.log("caca")
game.setup();
game.create.img('assets/char/Cat_Avatar_Circle.png', 200, 241.25, 75, 90)
game.create.img('assets/char/Chick_Avatar_Circle.png', 300, 241.25, 75, 90)
game.create.img('assets/char/Fox_Avatar_Circle.png', 400, 241.25, 75, 90)
game.create.img('assets/char/Mouse_Avatar_Circle.png', 500, 241.25, 75, 90)
game.create.img('assets/char/Pig_Avatar_Circle.png', 600, 241.25, 75, 90)
game.create.img('assets/char/Rabbit_Avatar_Circle.png', 700, 241.25, 75, 90)
game.create.triangle(210, 210, 250, 230, 210, 290, "blue")
game.create.rect(230, 150, 40, 60, "blue")