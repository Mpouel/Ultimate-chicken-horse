var gamea = {
    canvas: null,
    ctx: null,

    setup: function () {
        this.canvas = document.querySelector("canvas#gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 1000;
        this.canvas.height = 562.5;
    },

    create: {
        ctx: gamea.ctx,
        rec: function(x, y, width, height, fill = "#ff0000") {
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        circle: function(x, y, radius, fill = "#ff0000") {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        line: function(x1, y1, x2, y2, width = 1, color = "#ff0000") {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
            ctx.closePath();
        },

        triangle: function(x1, y1, x2, y2, x3, y3, fill = "#ff0000") {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        },

        ellipse: function(x, y, radiusX, radiusY, rotation = 0, fill = "#0000ff") {
            ctx.beginPath();
            ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.closePath();
        },

        polygon: function(points = [], fill = "#ff00ff") {
            if (points.length < 3) return;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        }
    }
};
console.log("caca")
gamea.setup();
gamea.create.rec(100, 100, 20, 20)