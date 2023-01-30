/*

Author: 
Supreet Tadeparti

Description:
A rubiks cube visualizer and solver.
Instead of literally rotating sides, this cube swaps the colors with the corresponding sides.
Play around and have fun!
Due to lack of time, and another project, this rubiks cube solver doesn't find the optimal solution.

Note:
Originally built for a Codingal Hackathon

*/

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scrambleBtn = document.querySelector(".scramble");
const solveBtn = document.querySelector(".solve");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 5, 5);
controls.update();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class RubiksCube {
  constructor() {
    this.sides = [
      new Side("white"),
      new Side("red"),
      new Side("green"),
      new Side("orange"),
      new Side("blue"),
      new Side("yellow"),
    ];

    this.sidesY = [this.sides[1], this.sides[2], this.sides[3], this.sides[4]];
    this.sidesX = [this.sides[0], this.sides[4], this.sides[5], this.sides[2]];
    this.sidesZ = [this.sides[0], this.sides[1], this.sides[5], this.sides[3]];

    this.rotations = [
      "U",
      "R",
      "L",
      "D",
      "F",
      "B",
      "U'",
      "R'",
      "L'",
      "D'",
      "F'",
      "B'",
    ];
  }

  #getRotObj(arr) {
    let x = [];
    for (let i = 0; i < arr.length; i++)
      x.push({ side: arr[i].side, color: arr[i].mesh.material.color });
    return x;
  }

  #rotateU() {
    let redTopTemp = this.#getRotObj(this.sidesY[0].top);

    for (let i = 0; i < 3; i++) {
      this.sidesY[i].rotateTop(this.#getRotObj(this.sidesY[i + 1].top));
    }

    this.sidesY[3].rotateTop(redTopTemp);

    this.sides[0].rotateSide();
  }

  #rotateD() {
    let blueBottomTemp = this.#getRotObj(this.sidesY[3].bottom);

    for (let i = 3; i > 0; i--) {
      this.sidesY[i].rotateBottom(this.#getRotObj(this.sidesY[i - 1].bottom));
    }

    this.sidesY[0].rotateBottom(blueBottomTemp);

    this.sides[5].rotateSide();
    this.sides[5].rotateSide();
    this.sides[5].rotateSide();
  }

  #rotateR() {
    let whiteRightTemp = this.#getRotObj(this.sidesX[0].right);

    for (let i = 0; i < 3; i++) {
      this.sidesX[i].rotateRight(this.#getRotObj(this.sidesX[i + 1].right));
    }

    this.sidesX[3].rotateRight(whiteRightTemp);

    this.sides[1].rotateSide();
  }

  #rotateL() {
    let greenLeftTemp = this.#getRotObj(this.sidesX[3].left);

    for (let i = 3; i > 0; i--) {
      this.sidesX[i].rotateLeft(this.#getRotObj(this.sidesX[i - 1].left));
    }

    this.sidesX[0].rotateLeft(greenLeftTemp);

    this.sides[3].rotateSide();
    this.sides[3].rotateSide();
    this.sides[3].rotateSide();
  }

  #rotateF() {
    let orangeFrontTemp = this.#getRotObj(this.sidesZ[3].face);

    for (let i = 3; i > 0; i--) {
      this.sidesZ[i].rotateFace(this.#getRotObj(this.sidesZ[i - 1].face));
    }

    this.sidesZ[0].rotateFace(orangeFrontTemp);

    this.sides[4].rotateSide();
    this.sides[4].rotateSide();
    this.sides[4].rotateSide();
  }

  #rotateB() {
    let whiteBackTemp = this.#getRotObj(this.sidesZ[0].back);

    for (let i = 0; i < 3; i++) {
      this.sidesZ[i].rotateBack(this.#getRotObj(this.sidesZ[i + 1].back));
    }

    this.sidesZ[3].rotateBack(whiteBackTemp);

    this.sides[2].rotateSide();
  }

  rotate(notation) {
    switch (notation) {
      case "U":
        this.#rotateU();
        break;
      case "U'":
        this.#rotateU();
        this.#rotateU();
        this.#rotateU();
        break;
      case "D":
        this.#rotateD();
        break;
      case "D'":
        this.#rotateD();
        this.#rotateD();
        this.#rotateD();
        break;
      case "R":
        this.#rotateR();
        break;
      case "R'":
        this.#rotateR();
        this.#rotateR();
        this.#rotateR();
        break;
      case "L":
        this.#rotateL();
        break;
      case "L'":
        this.#rotateL();
        this.#rotateL();
        this.#rotateL();
        break;
      case "F":
        this.#rotateF();
        break;
      case "F'":
        this.#rotateF();
        this.#rotateF();
        this.#rotateF();
        break;
      case "B":
        this.#rotateB();
        break;
      case "B'":
        this.#rotateB();
        this.#rotateB();
        this.#rotateB();
        break;
    }
  }

  async scramble() {
    for (let i = 0; i < 20; i++) {
      this.rotate(
        this.rotations[Math.floor(Math.random() * this.rotations.length)]
      );
      await sleep(100);
    }
  }

  #swap(a, i, j) {
    [a[i], a[j]] = [a[j], a[i]];
  }

  async #solve_Cross() {
    const whiteEdges = [...this.sides[0].edges];
    this.#swap(whiteEdges, 0, 1);
    const sidesZ = [...this.sidesZ];
    this.#swap(sidesZ, 1, 3);
    let sidesY = [...this.sidesY];
    let el = sidesY.shift();
    sidesY.push(el);
    let rots = ["B", "L", "F", "R"];
    let sides = ["red", "blue", "orange", "green"];

    for (let i = 0; i < 4; i++) {
      let side = sidesY[i];
      let topCenter = side.pieces[1][2];

      if (whiteEdges[i].side === "white" && topCenter.side === side.side)
        continue;
      // if (whiteEdges[i].side === "white" && topCenter.side !== side.side) {
      //   let dif = sides.indexOf(topCenter.side) - sides.indexOf(side.side);
      //   this.rotate(rots[i]);
      //   await sleep(500);
      //   if (Math.abs(dif) === 1) {
      //     if (dif > 0) {
      //       this.rotate("U'");
      //     } else {
      //       this.rotate("U");
      //     }
      //     await sleep(500);
      //   } else {
      //     this.rotate("U");
      //     await sleep(500);
      //     this.rotate("U");
      //     await sleep(500);
      //   }
      //   this.rotate(rots[i] + "'");
      //   await sleep(500);
      //   if (Math.abs(dif) === 1) {
      //     if (dif > 0) {
      //       this.rotate("U");
      //     } else {
      //       this.rotate("U'");
      //     }
      //   } else {
      //     this.rotate("U");
      //     await sleep(500);
      //     this.rotate("U");
      //     await sleep(500);
      //   }
      // }
      if (whiteEdges[i].side !== "white") {
        for (const s of this.sides) {
          if (s.side === "yellow") {
            for (let j = 0; j < 4; j++) {
              if (s.edges[j].side === "white") {
                let goalSide = this.sidesY[j].edges[1].side;

                let k = j;

                while (this.sidesY[k].side !== goalSide) {
                  if (++k === 4) k = 0;
                  this.rotate("D");
                  await sleep(500);
                }

                this.rotate(rots[i]);
                await sleep(500);
                this.rotate(rots[i]);
                await sleep(500);
              }
            }
          }
        }
      }
    }
  }

  #solve_F2L() {}
  #solve_OLL() {}
  #solve_PLL() {}

  async solve() {
    // solving each step
    this.#solve_Cross();
    this.#solve_F2L();
    this.#solve_OLL();
    this.#solve_PLL();
  }
}

class Side {
  constructor(side) {
    this.side = side;
    this.pieces = [];
    this.top = [];
    this.bottom = [];
    this.right = [];
    this.left = [];
    this.face = [];
    this.back = [];
    this.edges = [];
    for (let i = -1; i < 2; i++) {
      this.pieces.push([]);
      for (let j = -1; j < 2; j++) {
        const piece = new Piece(this.side, i, j);
        this.pieces[i + 1].push(piece);
        if ((i === 0) ^ (j === 0)) this.edges.push(piece);
        if (piece.y > 0) this.top.push(piece);
        if (piece.y < 0) this.bottom.push(piece);
        if (piece.x > 0) this.right.push(piece);
        if (piece.x < 0) this.left.push(piece);
        if (piece.z > 0) this.face.push(piece);
        if (piece.z < 0) this.back.push(piece);
      }
    }
  }

  getColors(pieces) {
    let clrs = [];
    for (const piece of pieces) clrs.push(piece.mesh.material.color);
    return clrs;
  }

  rotateTop(leftTop) {
    if (this.side === "blue" || this.side === "green") leftTop.reverse();
    for (let i = 0; i < 3; i++) {
      this.top[i].mesh.material.color = leftTop[i].color;
      this.top[i].side = leftTop[i].side;
    }
  }

  rotateBottom(rightBottom) {
    if (this.side === "red" || this.side === "orange") rightBottom.reverse();
    for (let i = 0; i < 3; i++) {
      this.bottom[i].mesh.material.color = rightBottom[i].color;
      this.bottom[i].side = rightBottom[i].side;
    }
  }

  rotateRight(bottomRight) {
    if (this.side === "white" || this.side === "yellow") bottomRight.reverse();
    for (let i = 0; i < 3; i++) {
      this.right[i].mesh.material.color = bottomRight[i].color;
      this.right[i].side = bottomRight[i].side;
    }
  }

  rotateLeft(topLeft) {
    if (this.side === "blue" || this.side === "green") topLeft.reverse();
    for (let i = 0; i < 3; i++) {
      this.left[i].mesh.material.color = topLeft[i].color;
      this.left[i].side = topLeft[i].side;
    }
  }

  rotateFace(frontLeft) {
    if (this.side === "red" || this.side === "orange") frontLeft.reverse();
    for (let i = 0; i < 3; i++) {
      this.face[i].mesh.material.color = frontLeft[i].color;
      this.face[i].side = frontLeft[i].side;
    }
  }

  rotateBack(backRight) {
    if (this.side === "white" || this.side === "yellow") backRight.reverse();
    for (let i = 0; i < 3; i++) {
      this.back[i].mesh.material.color = backRight[i].color;
      this.back[i].side = backRight[i].side;
    }
  }

  rotateSide() {
    let topS = this.pieces[0][1].side;
    let leftS = this.pieces[1][0].side;
    let rightS = this.pieces[1][2].side;
    let bottomS = this.pieces[2][1].side;
    let topLeftS = this.pieces[0][0].side;
    let topRightS = this.pieces[0][2].side;
    let bottomLeftS = this.pieces[2][0].side;
    let bottomRightS = this.pieces[2][2].side;
    let top = this.pieces[0][1].mesh.material.color;
    let left = this.pieces[1][0].mesh.material.color;
    let right = this.pieces[1][2].mesh.material.color;
    let bottom = this.pieces[2][1].mesh.material.color;
    let topLeft = this.pieces[0][0].mesh.material.color;
    let topRight = this.pieces[0][2].mesh.material.color;
    let bottomLeft = this.pieces[2][0].mesh.material.color;
    let bottomRight = this.pieces[2][2].mesh.material.color;
    this.pieces[1][0].side = topS;
    this.pieces[2][1].side = leftS;
    this.pieces[0][1].side = rightS;
    this.pieces[1][2].side = bottomS;
    this.pieces[2][0].side = topLeftS;
    this.pieces[0][0].side = topRightS;
    this.pieces[2][2].side = bottomLeftS;
    this.pieces[0][2].side = bottomRightS;
    this.pieces[1][0].mesh.material.color = top;
    this.pieces[2][1].mesh.material.color = left;
    this.pieces[0][1].mesh.material.color = right;
    this.pieces[1][2].mesh.material.color = bottom;
    this.pieces[2][0].mesh.material.color = topLeft;
    this.pieces[0][0].mesh.material.color = topRight;
    this.pieces[2][2].mesh.material.color = bottomLeft;
    this.pieces[0][2].mesh.material.color = bottomRight;
  }
}

class Piece {
  constructor(side, i, j) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.side = side;
    const geometry = new THREE.BoxGeometry(1, 1, 0);

    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color:
          this.side === "orange"
            ? 0xf77400
            : this.side === "green"
            ? 0x008c38
            : this.side === "blue"
            ? 0x1c5cbe
            : this.side === "red"
            ? 0xe33e3a
            : this.side === "yellow"
            ? 0xfef044
            : this.side,
      })
    );
    const line = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 1),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    const offset = 0.01;
    switch (this.side) {
      case "white":
        line.position.y += offset;
        this.mesh.position.y += 3 / 2;
        this.mesh.rotation.x = Math.PI / 2;
        this.x += i;
        this.z += j;
        this.mesh.position.x += i;
        this.mesh.position.z += j;
        break;
      case "yellow":
        line.position.y -= offset;
        this.mesh.position.y -= 3 / 2;
        this.mesh.rotation.x = Math.PI / 2;
        this.x += i;
        this.z += j;
        this.mesh.position.x += i;
        this.mesh.position.z += j;
        break;
      case "blue":
        line.position.z += offset;
        this.mesh.position.z += 3 / 2;
        this.x += i;
        this.y += j;
        this.mesh.position.x += i;
        this.mesh.position.y += j;
        break;
      case "green":
        line.position.z -= offset;
        this.mesh.position.z -= 3 / 2;
        this.x += i;
        this.y += j;
        this.mesh.position.x += i;
        this.mesh.position.y += j;
        break;
      case "red":
        line.position.x += offset;
        this.mesh.rotation.y = Math.PI / 2;
        this.mesh.position.x += 3 / 2;
        this.z += i;
        this.y += j;
        this.mesh.position.z += i;
        this.mesh.position.y += j;
        break;
      case "orange":
        line.position.x -= offset;
        this.mesh.rotation.y = Math.PI / 2;
        this.mesh.position.x -= 3 / 2;
        this.z += i;
        this.y += j;
        this.mesh.position.z += i;
        this.mesh.position.y += j;
        break;
    }
    line.position.x += this.mesh.position.x;
    line.position.y += this.mesh.position.y;
    line.position.z += this.mesh.position.z;
    line.rotation.x += this.mesh.rotation.x;
    line.rotation.y += this.mesh.rotation.y;
    line.rotation.z += this.mesh.rotation.z;
    scene.add(this.mesh);
    scene.add(line);
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  let rot = e.key.toUpperCase();
  if (e.shiftKey) rot += "'";
  cube.rotate(rot);
});

scrambleBtn.addEventListener("click", () => cube.scramble());
solveBtn.addEventListener("click", () => cube.solve());

const cube = new RubiksCube();
animate();
