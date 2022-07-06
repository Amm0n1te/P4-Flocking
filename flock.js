let flock;
let spritesheet;
let animation = [];
let food = [-1, -1, 10];   //food[x position,  y position,  pellet radius]
let drawFood = false;
let clicked = false;

function preload() {
  //frameRate(5);
  spritesheet = loadImage("fish_spritesheet.png");
  spritesheet.resize(5, 10);
  //spritedata = loadJSON("fish.json");
}


function setup() {
  createCanvas(640, 360);
  createP("Click within the tank to place food pellets (pellets will be placed under the hand).<br>Fish want to eat the food pellets, but are afraid of the cursor if the cursor is in the tank.");
  animation.push(spritesheet.get(0, 0, 100, 200));
  animation.push(spritesheet.get(100, 0, 100, 200));

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

let animIndex = 0;
let tankproportion = 8;
let tankup;
let tankdown;
let tankleft;
let tankight;
let animspeed = 0.1;
let borderbuffer = 20;
function draw() {
  background(133, 133, 133);
  fill(0, 102, 133);
  tankup = height/tankproportion;
  tankdown = height-(height/tankproportion);
  tankleft = width/tankproportion;
  tankright = width-(width/tankproportion);
  stroke(0, 0, 0);
  rect(width/tankproportion, height/tankproportion, width-2*(width/tankproportion), height-2*(height/tankproportion));
  fill(82, 48, 2);
  noStroke();
  if (drawFood) circle(food[0], food[1], food[2]);
  animIndex+= animspeed;
  if (animIndex >= 2) animIndex = 0;
  flock.run();
  if (mouseX < width && mouseY < height) drawhand(mouseX, mouseY);
  clicked = false;
  //image(spritesheet.get(100, 0, 100, 200), 0, 0);
}

function drawhand(x, y) {
  console.log("GIANT HAND! SWIM FOR YOUR LIVES!");
  push();

  let shorten = 1;
  if (clicked) shorten = 4;
  stroke(0, 0, 0);
  fill(0,0,0);
  rect(x-20, y-10, 40);
  rect(x-20, y-45, 8, 35/shorten);
  rect(x-10, y-50, 8, 40/shorten);
  rect(x, y-45, 8, 35/shorten);
  rect(x+10, y-38, 8, 28/shorten);
  rect(x-43, y+5, 23, 11/shorten);

  pop();
}





// Add a new boid into the System
function mouseDragged() {
  //flock.addBoid(new Boid(mouseX, mouseY));
}

function mouseClicked() {
  console.log("plop");
  if (mouseX > tankleft+borderbuffer && mouseX < tankright-borderbuffer && mouseY > tankup+borderbuffer && mouseY < tankdown-borderbuffer) {
    clicked = true;
    drawFood = true;
    food[0] = mouseX;
    food[1] = mouseY;
  }
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
    //translate(width/2, height/2);
    //line(0, 0, this.boids[0].velocity.x*20, this.boids[0].velocity.y*20);
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
    this.gotkonstant = false;
    this.konstant = 1;
    this.oldopposite = 1;
    this.oldadjacent = 1;
  }

  run(boids) {
    this.flock(boids);
    //circle(450, height/2, 30);
    //this.applyForce(this.seek( (createVector(150, height/2)).mult(10) ));
    if (mouseX > tankleft && mouseX < tankright && mouseY > tankup && mouseY < tankdown) this.applyForce(this.flee( createVector(mouseX, mouseY) ));
    this.avoid(boids);
    if (drawFood) {  
      this.update();
      this.render();
      this.applyForce(this.seek( createVector(food[0], food[1]) ));
      //wrote this massive block of code because seek wasn't working properly, but now it magically works.  I'm afraid to delete all this effort now, even with github
      /*push();
      translate(this.position.x, this.position.y);
      let rotateval = 0;
      let seekspeed = 2; //applied as a multiplier to default speed 1
      let opposite = Math.abs(this.position.x - food[0]);
      let adjacent = Math.abs(this.position.y - food[1]);
      if (!this.gotkonstant || clicked) {
        this.konstant = Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));
        this.oldopposite = Math.abs(this.position.x - food[0]);
        this.oldadjacent = Math.abs(this.position.y - food[1]);
        this.gotkonstant = true;
        animspeed = 0.3;
      }

      if (food[0] > this.position.x && food[1] < this.position.y) { //case 1: food top right
        rotateval = Math.atan( opposite/adjacent );
        this.position.x += (this.oldopposite/this.konstant) * seekspeed; 
        this.position.y -= (this.oldadjacent/this.konstant) * seekspeed;
        //console.log("case 1");
      }  
      else if (food[0] > this.position.x && food[1] > this.position.y) { //case 2: food bottom right
        rotateval = Math.atan( adjacent/opposite );
        //console.log("case 2");
        rotateval += Math.PI/2;
        this.position.x += (this.oldopposite/this.konstant) * seekspeed; 
        this.position.y += (this.oldadjacent/this.konstant) * seekspeed;
      }
      else if (food[0] < this.position.x && food[1] > this.position.y) { //case 3: food bottom left
        rotateval = Math.atan( opposite/adjacent );
        //console.log("case 3");
        rotateval += Math.PI;
        this.position.x -= (this.oldopposite/this.konstant) * seekspeed; 
        this.position.y += (this.oldadjacent/this.konstant) * seekspeed; 
      } 
      else if (food[0] < this.position.x && food[1] < this.position.y) { //case 4: food top left
        //console.log("case 4");
        rotateval = Math.atan( adjacent/opposite );
        rotateval += 3*Math.PI/2;
        this.position.x -= (this.oldopposite/this.konstant) * seekspeed; 
        this.position.y -= (this.oldadjacent/this.konstant) * seekspeed; 
      }
      rotate(rotateval);
      image(animation[floor(animIndex)], 0, 0)
      pop();*/
    }
    else {
      this.update();
      this.render();
    }
    let collisionRadius = 10;
    if (this.position.x < food[0]+collisionRadius && this.position.x > food[0]-collisionRadius && 
      this.position.y < food[1]+collisionRadius && this.position.y > food[1]-collisionRadius && drawFood == true) {
        drawFood = false;
        console.log("chomp");
        animspeed = 0.1;
    }
    if (drawFood == false) this.gotkonstant = false;
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
    if (!this.drawFood) this.applyForce(sep);
    if (!this.drawFood)this.applyForce(ali);
    if (!this.drawFood)this.applyForce(coh);
    if (!this.drawFood)this.applyForce(avo);
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
    
    //uncomment to see desired trajectory lines
    /*
    push();
    translate(width/2, height/2);
    line(0, 0, desired.x*5, desired.y*5);
    pop();
    */
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }

  flee(target) {
    let desired = p5.Vector.sub(target, this.position);
    /*push();
    stroke(255, 255, 255);
    translate(width/2, height/2);
    line(0, 0, desired.x/8, desired.y/8);
    pop();*/
    desired.normalize();
    desired.mult(-this.maxspeed);
    let steer = p5.Vector.add(desired, this.velocity);
    steer.limit(this.maxspeed);
    if (steer.mag < -this.maxspeed) steer.mag = -this.maxspeed;
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
    if (this.position.x <= tankleft+borderbuffer) {
      steer.add(createVector(1, 0));
    }
    if (this.position.x > tankright-borderbuffer) {
      steer.add(createVector(-1, 0));
    }
    if (this.position.y < tankup+borderbuffer) {
      steer.add(createVector(0, 1));
    }
    if (this.position.y > tankdown-borderbuffer) { 
      steer.add(createVector(0, -1));
    }
    return steer;
  }
}
