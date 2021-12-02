<template>
  <div class="page">
    <div>Path finder</div>
    <button @click="resetPathfinding">Reset pathfinding</button>
    <button @click="startPathfinding">Start pathfinding</button>
    <button @click="stopPathfinding">Stop pathfinding</button>
    <div class="grid">
      <div v-for="(row, rowIndex) in rows" class="row" :key="rowIndex">
        <div
          v-for="(cell, cellIndex) in row"
          class="cell"
          :key="cellIndex"
          :class="calculateCellClass(rowIndex, cellIndex)"
          @mousedown.prevent="toggleWall(rowIndex, cellIndex)"
          @mouseenter.prevent="mouseEnterPaint($event, rowIndex, cellIndex)"
        >

        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pathfinder',
  data() {
    return {
      rows: [],
      startingPoint: [0, 0],
      walls: [],
      goal: [7, 7],
      goalPath: null,
      pathfinderInterval: null,
      paths: [],
      paintType: null,
    };
  },
  beforeDestroy() {
    this.stopPathfinding();
  },
  created() {
    this.generateMaze();
  },
  methods: {
    mouseEnterPaint(event, row, col) {
      // mouse 1 is held
      if (event.buttons === 1) {
        this.toggleWall(row, col, true);
      }
    },
    generateMaze() {
      const size = 15;

      this.rows = [];

      for (let i = 0; i < size; i += 1) {
        const row = [];
        for (let i2 = 0; i2 < size; i2 += 1) {
          row.push({
            type: 'empty',
            status: 'unexplored',
          });
        }
        this.rows.push(row);
      }
    },
    calculateCellClass(rowIndex, colIndex) {
      if (rowIndex === this.startingPoint[0] && colIndex === this.startingPoint[1]) {
        return 'starting-point';
      }

      if (rowIndex === this.goal[0] && colIndex === this.goal[1]) {
        return 'goal';
      }

      const isWall = this.walls.find((wall) => wall[0] === rowIndex && wall[1] === colIndex);
      if (isWall) {
        return 'wall';
      }

      if (this.goalPath) {
        if (this.goalPath.find((coordinate) => coordinate[0] === rowIndex
          && coordinate[1] === colIndex)) {
          return 'goal-path';
        }
      }

      const explored = this.paths.find((cell) => cell.coordinates[0] === rowIndex
        && cell.coordinates[1] === colIndex);

      if (explored) {
        return 'explored';
      }

      return 'empty';
    },
    toggleWall(rowIndex, colIndex, paint = false) {
      // if hitting starting point
      if ((rowIndex === this.startingPoint[0] && colIndex === this.startingPoint[1])) {
        return;
      }
      // if hitting goal
      if ((rowIndex === this.goal[0] && colIndex === this.goal[1])) {
        return;
      }

      const wallIndex = this.walls
        .findIndex((wall) => wall[0] === rowIndex && wall[1] === colIndex);

      if (paint) {
        if (this.paintType === 'clear' && wallIndex >= 0) {
          this.walls = this.walls.filter((wall) => !(wall[0] === rowIndex && wall[1] === colIndex));
        } else if (this.paintType === 'fill') {
          this.walls.push([rowIndex, colIndex]);
        }
      } else if (wallIndex >= 0) {
        this.paintType = 'clear';
        this.walls.splice(wallIndex, 1);
      } else {
        this.paintType = 'fill';
        this.walls.push([rowIndex, colIndex]);
      }
    },
    resetPathfinding() {
      this.stopPathfinding();
      this.paths = [];
      this.goalPath = null;
    },
    startPathfinding() {
      this.stopPathfinding();
      this.goalPath = null;

      this.paths = [{
        identifier: `${this.startingPoint[0]}-${this.startingPoint[1]}`,
        coordinates: [this.startingPoint[0], this.startingPoint[1]],
        explored: false,
        history: [],
      }];

      this.pathfinderInterval = setInterval(() => {
        this.search();
      }, 200);
    },
    stopPathfinding() {
      if (this.pathfinderInterval) {
        clearInterval(this.pathfinderInterval);
      }
    },
    isCellSearchable(row, col) {
      if (this.rows[row] && this.rows[row][col]) {
        const existingPath = this.paths.find((path) => path.coordinates[0] === row
          && path.coordinates[1] === col);

        if (!existingPath || (existingPath && !existingPath.explored)) {
          const isWall = this.walls.find((wall) => wall[0] === row && wall[1] === col);

          if (!isWall) {
            return true;
          }
        }
      }
      return false;
    },
    getCellDirections(cell) {
      return {
        up: [cell.coordinates[0] - 1, cell.coordinates[1]],
        down: [cell.coordinates[0] + 1, cell.coordinates[1]],
        left: [cell.coordinates[0], cell.coordinates[1] - 1],
        right: [cell.coordinates[0], cell.coordinates[1] + 1],
      };
    },
    search() {
      const unexplored = this.paths.filter((path) => !path.explored);
      if (!unexplored.length) {
        this.stopPathfinding();
        alert('No path to goal found! 😱');
        return;
      }
      const newPaths = [...this.paths];

      unexplored.forEach((cell) => {
        const directions = this.getCellDirections(cell);
        if (this.isCellSearchable(...directions.up)) {
          const newId = `${directions.up[0]}-${directions.up[1]}`;
          if (!newPaths.find((path) => path.identifier === newId)) {
            newPaths.push({
              coordinates: [...directions.up],
              explored: false,
              history: [...cell.history, [...cell.coordinates]],
              identifier: newId,
            });
          }
        }

        if (this.isCellSearchable(...directions.down)) {
          const newId = `${directions.down[0]}-${directions.down[1]}`;
          if (!newPaths.find((path) => path.identifier === newId)) {
            newPaths.push({
              coordinates: [...directions.down],
              explored: false,
              history: [...cell.history, [...cell.coordinates]],
              identifier: newId,
            });
          }
        }

        if (this.isCellSearchable(...directions.left)) {
          const newId = `${directions.left[0]}-${directions.left[1]}`;
          if (!newPaths.find((path) => path.identifier === newId)) {
            newPaths.push({
              coordinates: [...directions.left],
              explored: false,
              history: [...cell.history, [...cell.coordinates]],
              identifier: newId,
            });
          }
        }

        if (this.isCellSearchable(...directions.right)) {
          const newId = `${directions.right[0]}-${directions.right[1]}`;
          if (!newPaths.find((path) => path.identifier === newId)) {
            newPaths.push({
              coordinates: [...directions.right],
              explored: false,
              history: [...cell.history, [...cell.coordinates]],
              identifier: newId,
            });
          }
        }

        const pathIndex = newPaths
          .findIndex((path) => path.coordinates[0] === cell.coordinates[0]
          && path.coordinates[1] === cell.coordinates[1]);

        newPaths[pathIndex].explored = true;
      });

      const goalPath = newPaths.find((path) => path.coordinates[0] === this.goal[0]
        && path.coordinates[1] === this.goal[1]);

      if (goalPath) {
        // goal found
        this.stopPathfinding();
        this.goalPath = goalPath.history;
      }

      this.paths = newPaths;
    },
  },
};
</script>

<style scoped>

.page {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.grid {
  margin-top: 16px;
}

.row {
  display: flex;
}

.cell {
    height: 30px;
    width: 30px;
    border: 1px solid #000;
  }

.starting-point {
  background-color: green;
}

.wall {
  background-color: #191919;
}

.empty {
  background-color: #f4f4f4;
}

.goal {
  background-color: gold;
}

.explored {
  background-color: #42b983;
}

.goal-path {
  background-color: aquamarine;
}

</style>
