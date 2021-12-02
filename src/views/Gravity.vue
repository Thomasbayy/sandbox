<template>
  <div>
    <div>Gravity</div>
    <canvas height="500" width="500" id="canvas" ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      balls: [],
      count: 0,
      drawInterval: null,
    };
  },
  mounted() {
    this.drawInterval = setInterval(() => {
      if (this.$refs?.canvas?.getContext('2d')) {
        const context = this.$refs.canvas.getContext('2d');
        context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);

        context.fillStyle = 'rgba(200, 0, 0)';
        const cleanUpIndexes = [];
        this.balls.forEach((ball, index) => {
          if (ball.y > this.$refs.canvas.height) {
            cleanUpIndexes.push(index);
          } else {
            context.beginPath();
            context.arc(ball.x, ball.y, 25, 0, 2 * Math.PI, true);
            context.closePath();
            context.fill();

            const acceleration = 1;
            let bounceBack = false;
            if (ball.y + ball.velocity > this.$refs.canvas.height - 25) {
              this.balls[index].y = this.$refs.canvas.height - 25;
              if (ball.velocity > 0.1) {
                bounceBack = true;
              } else {
                this.balls[index].velocity = 0;
              }
            } else {
              this.balls[index].y = ball.y + ball.velocity;
            }

            if (ball.velocity === null) {
              this.balls[index].velocity = acceleration;
            } else if (bounceBack) {
              if (ball.velocity > 1) {
                this.balls[index].velocity = 0 - (ball.velocity / 2);
              } else {
                this.balls[index].velocity = 0;
              }
            } else {
              const maxSpeed = 20;
              let newSpeed = ball.velocity + acceleration;
              if (newSpeed > maxSpeed) {
                newSpeed = maxSpeed;
              }
              this.balls[index].velocity = newSpeed;
            }
          }
        });

        cleanUpIndexes.reverse().forEach((index) => {
          this.balls.splice(index, 1);
        });
      }
    }, 16);

    this.$refs.canvas.addEventListener('click', (e) => {
      this.balls.push({
        x: e.layerX,
        y: e.layerY,
        velocity: null,
      });
    });
  },
  beforeDestroy() {
    clearInterval(this.drawInterval);
  },
};
</script>

<style scoped>
  #canvas {
    border: 1px solid #ccc;
  }
</style>
