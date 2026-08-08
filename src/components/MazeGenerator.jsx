import React, { useMemo } from 'react';

const MazeGenerator = ({ width = 10, height = 10 }) => {
  const mazeData = useMemo(() => {
    // Generar un laberinto usando DFS
    const grid = Array(height).fill().map(() => Array(width).fill({ visited: false, walls: [true, true, true, true] })); // Top, Right, Bottom, Left
    const stack = [];
    let current = { x: 0, y: 0 };
    
    // Clonamos la grid para mutarla
    const mutableGrid = JSON.parse(JSON.stringify(grid));
    mutableGrid[0][0].visited = true;
    
    let unvisitedCount = width * height - 1;
    
    while (unvisitedCount > 0) {
      const neighbors = [];
      const { x, y } = current;
      
      // Top
      if (y > 0 && !mutableGrid[y - 1][x].visited) neighbors.push({ x, y: y - 1, dir: 0 });
      // Right
      if (x < width - 1 && !mutableGrid[y][x + 1].visited) neighbors.push({ x: x + 1, y, dir: 1 });
      // Bottom
      if (y < height - 1 && !mutableGrid[y + 1][x].visited) neighbors.push({ x, y: y + 1, dir: 2 });
      // Left
      if (x > 0 && !mutableGrid[y][x - 1].visited) neighbors.push({ x: x - 1, y, dir: 3 });
      
      if (neighbors.length > 0) {
        stack.push(current);
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Romper paredes
        if (next.dir === 0) { mutableGrid[y][x].walls[0] = false; mutableGrid[next.y][next.x].walls[2] = false; }
        else if (next.dir === 1) { mutableGrid[y][x].walls[1] = false; mutableGrid[next.y][next.x].walls[3] = false; }
        else if (next.dir === 2) { mutableGrid[y][x].walls[2] = false; mutableGrid[next.y][next.x].walls[0] = false; }
        else if (next.dir === 3) { mutableGrid[y][x].walls[3] = false; mutableGrid[next.y][next.x].walls[1] = false; }
        
        mutableGrid[next.y][next.x].visited = true;
        current = { x: next.x, y: next.y };
        unvisitedCount--;
      } else if (stack.length > 0) {
        current = stack.pop();
      }
    }
    
    // Abrir entrada y salida
    mutableGrid[0][0].walls[3] = false; // Left entrada
    mutableGrid[height - 1][width - 1].walls[1] = false; // Right salida
    
    return mutableGrid;
  }, [width, height]);

  const cellSize = 20;
  const strokeWidth = 2;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <svg 
        width={width * cellSize + strokeWidth} 
        height={height * cellSize + strokeWidth}
        style={{ background: '#fff', border: '2px solid #333' }}
      >
        <rect x="0" y="0" width={width * cellSize} height={height * cellSize} fill="#e5f5e0" />
        
        {/* Entrance / Exit markers */}
        <text x="-5" y="15" fontSize="10" fill="green" fontWeight="bold">Entrada ➔</text>
        <text x={(width * cellSize) - 20} y={(height * cellSize) - 5} fontSize="10" fill="red" fontWeight="bold">➔ Salida</text>

        {mazeData.map((row, y) => 
          row.map((cell, x) => (
            <g key={`${x}-${y}`}>
              {/* Top */}
              {cell.walls[0] && <line x1={x * cellSize} y1={y * cellSize} x2={(x + 1) * cellSize} y2={y * cellSize} stroke="#333" strokeWidth={strokeWidth} strokeLinecap="square" />}
              {/* Right */}
              {cell.walls[1] && <line x1={(x + 1) * cellSize} y1={y * cellSize} x2={(x + 1) * cellSize} y2={(y + 1) * cellSize} stroke="#333" strokeWidth={strokeWidth} strokeLinecap="square" />}
              {/* Bottom */}
              {cell.walls[2] && <line x1={x * cellSize} y1={(y + 1) * cellSize} x2={(x + 1) * cellSize} y2={(y + 1) * cellSize} stroke="#333" strokeWidth={strokeWidth} strokeLinecap="square" />}
              {/* Left */}
              {cell.walls[3] && <line x1={x * cellSize} y1={y * cellSize} x2={x * cellSize} y2={(y + 1) * cellSize} stroke="#333" strokeWidth={strokeWidth} strokeLinecap="square" />}
            </g>
          ))
        )}
      </svg>
    </div>
  );
};

export default MazeGenerator;
