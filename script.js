// index.js
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const startButton = document.getElementById('startButton');
    const stepButton = document.getElementById('stepButton');
    const resetButton = document.getElementById('resetButton');
    const algorithmSelect = document.getElementById('algorithmSelect');
    const speedControl = document.getElementById('speedControl');
    const saveButton = document.getElementById('saveButton');
    const loadButton = document.getElementById('loadButton');
    const themeToggle = document.getElementById('themeToggle');

    const rows = 20;
    const cols = 40;
    let gridArray = [];
    let algorithm; // Instance of Algorithm class

    // Initialize grid
    function initializeGrid() {
        gridArray = [];
        grid.innerHTML = '';
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                grid.appendChild(cell);
                row.push(cell);
            }
            gridArray.push(row);
        }
    }

    initializeGrid();

    startButton.addEventListener('click', () => {
        if (algorithmSelect.value) {
            algorithm = new Algorithm(gridArray, speedControl.value, algorithmSelect.value);
            algorithm.start();
        }
    });

    stepButton.addEventListener('click', () => {
        if (algorithm) {
            algorithm.step();
        }
    });

    resetButton.addEventListener('click', () => {
        initializeGrid();
    });

    saveButton.addEventListener('click', () => {
        const gridState = gridArray.map(row => row.map(cell => cell.className));
        localStorage.setItem('gridState', JSON.stringify(gridState));
    });

    loadButton.addEventListener('click', () => {
        const gridState = JSON.parse(localStorage.getItem('gridState'));
        if (gridState) {
            gridArray.forEach((row, r) => {
                row.forEach((cell, c) => {
                    cell.className = gridState[r][c];
                });
            });
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    grid.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        if (activeElement.classList.contains('grid-cell')) {
            let { row, col } = activeElement.dataset;
            row = parseInt(row);
            col = parseInt(col);

            switch (event.key) {
                case 'ArrowUp':
                    if (row > 0) gridArray[row - 1][col].focus();
                    break;
                case 'ArrowDown':
                    if (row < rows - 1) gridArray[row + 1][col].focus();
                    break;
                case 'ArrowLeft':
                    if (col > 0) gridArray[row][col - 1].focus();
                    break;
                case 'ArrowRight':
                    if (col < cols - 1) gridArray[row][col + 1].focus();
                    break;
                case 'Enter':
                    toggleWall(activeElement);
                    break;
                default:
                    break;
            }
        }
    });

    grid.addEventListener('click', (event) => {
        const cell = event.target;
        if (cell.classList.contains('grid-cell')) {
            toggleWall(cell);
        }
    });

    function toggleWall(cell) {
        if (cell.classList.contains('wall')) {
            cell.classList.remove('wall');
        } else {
            cell.classList.add('wall');
        }
    }

    class Algorithm {
        constructor(grid, speed, algorithmType) {
            this.grid = grid;
            this.speed = speed;
            this.algorithmType = algorithmType;
            this.visitedNodes = [];
            this.unvisitedNodes = [];
            this.startNode = this.grid[10][10]; // Example start point
            this.endNode = this.grid[10][30];   // Example end point
            this.initGrid();

            // Initialize start and end nodes
            this.startNode.classList.add('start');
            this.endNode.classList.add('end');
        }

        initGrid() {
            for (let row of this.grid) {
                for (let node of row) {
                    node.distance = Infinity;
                    node.previousNode = null;
                    if (!node.classList.contains('wall')) {
                        this.unvisitedNodes.push(node);
                    }
                }
            }
            this.startNode.distance = 0;
        }

        getNeighbors(node) {
            const { row, col } = node.dataset;
            const neighbors = [];
            if (row > 0) neighbors.push(this.grid[row - 1][col]);
            if (row < this.grid.length - 1) neighbors.push(this.grid[+row + 1][col]);
            if (col > 0) neighbors.push(this.grid[row][col - 1]);
            if (col < this.grid[0].length - 1) neighbors.push(this.grid[row][+col + 1]);
            return neighbors.filter(neighbor => !neighbor.classList.contains('wall'));
        }

        start() {
            if (this.visitedNodes.length === 0) {
                if (this.algorithmType === 'Dijkstra') {
                    this.dijkstra();
                } else if (this.algorithmType === 'DFS') {
                    this.dfs(this.startNode);
                } else if (this.algorithmType === 'BFS') {
                    this.bfs();
                }
            }
        }

        dijkstra() {
            if (this.unvisitedNodes.length) {
                this.unvisitedNodes.sort((a, b) => a.distance - b.distance);
                const closestNode = this.unvisitedNodes.shift();
                if (closestNode.distance === Infinity) return;
                this.visitedNodes.push(closestNode);

                closestNode.classList.add('visited');
                if (closestNode === this.endNode) {
                    this.tracePath();
                    return;
                }
                const neighbors = this.getNeighbors(closestNode);
                for (const neighbor of neighbors) {
                    const distance = closestNode.distance + 1;
                    if (distance < neighbor.distance) {
                        neighbor.distance = distance;
                        neighbor.previousNode = closestNode;
                    }
                }
                setTimeout(() => this.dijkstra(), 1000 / this.speed);
            }
        }

        dfs(node) {
            if (node === this.endNode) {
                this.tracePath();
                return;
            }
            node.classList.add('visited');
            this.visitedNodes.push(node);
            const neighbors = this.getNeighbors(node);
            for (const neighbor of neighbors) {
                if (!this.visitedNodes.includes(neighbor)) {
                    neighbor.previousNode = node;
                    this.dfs(neighbor);
                }
            }
        }

        bfs() {
            const queue = [this.startNode];
            while (queue.length) {
                const currentNode = queue.shift();
                if (currentNode === this.endNode) {
                    this.tracePath();
                    return;
                }
                currentNode.classList.add('visited');
                this.visitedNodes.push(currentNode);
                const neighbors = this.getNeighbors(currentNode);
                for (const neighbor of neighbors) {
                    if (!this.visitedNodes.includes(neighbor) && !queue.includes(neighbor)) {
                        neighbor.previousNode = currentNode;
                        queue.push(neighbor);
                    }
                }
            }
        }

        step() {
            if (this.visitedNodes.length === 0) {
                this.start();
            } else {
                if (this.algorithmType === 'Dijkstra' && this.unvisitedNodes.length) {
                    this.dijkstra();
                }
            }
        }

        tracePath() {
            let currentNode = this.endNode;
            while (currentNode !== null) {
                currentNode.classList.add('path');
                currentNode = currentNode.previousNode;
            }
        }
    }
});
