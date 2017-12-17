function Star(x, y, s) {
    this.x = x;
    this.y = y;
    this.s = s; // size
    this.vx = 0; // velocity x
    this.vy = 0; // velocity y
    this.a = Math.random(); // alpha
    // drawing the stars and setting the fillstyle is expensive
    // only do it once per star and cache it.
    this.img = document.createElement('canvas');
    var context = this.img.getContext('2d');
    this.img.height = this.img.width = this.s;
    var grad = context.createRadialGradient(this.s / 2, this.s / 2, 1, this.s / 2, this.s / 2, this.s / 2);
    grad.addColorStop(0, 'rgba(255,255,255,.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    context.beginPath();
    context.fillStyle = grad;
    context.arc(this.s / 2, this.s / 2, this.s, 0, Math.PI * 2, true);
    context.fill();
    context.closePath();
}
Star.prototype = {
    constructor: Star,
    update: function () {
        // move by velocity
        this.x += this.vx;
        this.y += this.vy;
        // increase alpha by 0.005 (remember this happens 30 times a second)
        this.a += 5e-3;
        if (this.a >= .9) { // this is the slight flicker
            this.a -= .15;
        }
    },
    render: function (context) {
        context.globalAlpha = this.a;
        context.drawImage(this.img, this.x, this.y);
    }
};

function Sky(amount, min, max, fp) {
    this.a = amount;
    this.mi = min; // min star size
    this.ma = max; // max star size
    this.fp = fp; // fall percent? I really didn't know what to call this
    this.s = []; // stars array
    for (var i = 0; i < amount; i++) {
        this.s.push(new Star(Math.random() * width, Math.random() * height, Math.random() * (max - min) + min));
    }
}
Sky.prototype = {
    constructor: Sky,
    update: function () {
        var f = false; // found a star to fall
        // we use this so only one star per pass can fall 
        for (var i = 0; i < this.a; i++) {
            this.s[i].update(); // update the stars position and alpha
            if (this.s[i].y > height) { // if the star is off screen reset it
                this.s[i].a = 0;
                this.s[i].x = Math.random() * width;
                this.s[i].y = Math.random() * height;
                this.s[i].vx = 0;
                this.s[i].vy = 0;
            }
            if( f ) { // if a star has already fallen continue to the next star
                continue;
            }
            // if rand is less than the very small number and alpha is greater than 80% trigger a fall
            if( Math.random() < this.fp && this.s[i].a >= .8 ) { 
                this.s[i].vx = Math.random() * 1 + 1;
                this.s[i].vy = Math.random() * 2 + 8;
                f = true; // remember to set found to true
            }
        }
    },
    render: function (context) {
        context.shadowBlur = Math.random() * 15 + 5;
        context.shadowColor = '#fff';
        // render the stars
        for (var i = 0; i < this.a; i++) {
            this.s[i].render(context);
        }
    }
};
var canvas, context, height, width, sky;
// codepen bug, you need this otherwise height/width are messed up
setTimeout(init, 10);
// and the rest.
function init() {
    canvas = document.getElementById('sky');
    context = canvas.getContext('2d');
    resize();
    sky = new Sky(500, 1, 4, 1e-5 /* 0.00001 , this is that very small random chance value for the fall check */ );
    update();
    render();
    window.onresize = resize;
}

function update() {
    sky.update();
    setTimeout(update, 1000 / 30);
}

function render() {
    context.clearRect(0, 0, width, height);
    sky.render(context);
    requestAnimationFrame(render);
}

function resize() {
    height = canvas.height = document.body.offsetHeight;
    width = canvas.width = document.body.offsetWidth;
}

	