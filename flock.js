let flock;
let spritesheet;
let animation = [];
let food = [-1, -1, 10];
let drawFood = false;

function preload() {
  //frameRate(10);
  spritesheet = loadImage("fish_spritesheet.png");
  spritesheet.resize(5, 10);
  //spritedata = loadJSON("fish.json");
}


function setup() {
  createCanvas(640, 360);
  createP("Drag the mouse to generate new boids.");
  animation.push(spritesheet.get(0, 0, 100, 200));
  animation.push(spritesheet.get(100, 0, 100, 200));

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 20; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

let animIndex = 0;
let tankproportion = 8;
function draw() {
  background(133, 133, 133);
  fill(0, 102, 133);
  rect(width/tankproportion, height/tankproportion, width-2*(width/tankproportion), height-2*(height/tankproportion));
  if (drawFood) circle(food[0], food[1], food[2]);
  animIndex+= 0.2;
  if (animIndex >= 2) animIndex = 0;
  flock.run();
  //image(spritesheet.get(100, 0, 100, 200), 0, 0);
}





// Add a new boid into the System
function mouseDragged() {
  //flock.addBoid(new Boid(mouseX, mouseY));
}

function mouseClicked() {
  drawFood = true;
  food[0] = mouseX;
  food[1] = mouseY;
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids
class Flock {
  constructor() { this.boids = []; }

  run() {
    for (let i = 0; i < this.boids.length; i++) {
      this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }

}




// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added
class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.r = 3.0;
    this.maxspeed = 3;    // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
  }

  run(boids) {
    this.flock(boids);
    //circle(450, height/2, 30);
    //this.applyForce(this.seek( (createVector(150, height/2)).mult(10) ));
    let seekVector = createVector(food[0], food[1]);
    seekVector.mult(100);
    if (drawFood) this.applyForce(this.seek( seekVector ))
    this.update();
    //circle(450, height/2, 30);
    //this.applyForce(this.seek( (createVector(150, height/2)).mult(10) ));
    // this.borders();
    this.render();
    let collisionRadius = 10;
    if (this.position.x < food[0]+collisionRadius && this.position.x > food[0]-collisionRadius && 
      this.position.y < food[1]+collisionRadius && this.position.y > food[1]-collisionRadius && drawFood == true) {
        drawFood = false;
        console.log("chomp");
      }
    //console.log(this.position.x, " vs ", food[0]);
  }

  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  flock(boids) {
    let sep = this.separate(boids);   // Separation
    let ali = this.align(boids);      // Alignment
    let coh = this.cohesion(boids);   // Cohesion
    let avo = this.avoid(boids);      // Avoid walls
    // Arbitrarily weight these forces
    sep.mult(10.0);
    ali.mult(2.0);
    coh.mult(1.0);
    avo.mult(3.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
    this.applyForce(avo);
  }

  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }

  render() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + radians(90);
    fill(127);
    stroke(200);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    animation[floor(animIndex)].resize(15,30);
    let fish = image(animation[floor(animIndex)], 0, 0);
    /*beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);*/
    pop();
  }

  //Wraparound
  borders() {
    if (this.position.x < -this.r)  this.position.x = width + this.r;
    if (this.position.y < -this.r)  this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }

  separate(boids) {
    let desiredseparation = 25.0;
    let steer = createVector(0, 0);
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position,boids[i].position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();     //so we get only the direction
        diff.div(d);          // multiply it by how far away it is from this.  closer applies stronger force, farther applies weaker force
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }
  
    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  align(boids) {
    let neighbordist = 50;
    let sum = createVector(0,0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position,boids[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  cohesion(boids) {
    let neighbordist = 50;
    let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position,boids[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);  // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }


  avoid(boids) {
    let steer = createVector(0, 0);
    if (this.position.x <= 0) {
      steer.add(createVector(1, 0));
    }
    if (this.position.x > 640) { // width of canvas
      steer.add(createVector(-1, 0));
    }
    if (this.position.y <= 0) {
      steer.add(createVector(0, 1));
    }
    if (this.position.y > 360) { // height of canvas
      steer.add(createVector(0, -1));
    }
    return steer;
  }
}
