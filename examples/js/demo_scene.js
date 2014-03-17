var DemoScene = function() {
  var div = document.createElement('div');
  div.id = 'physics-stats';
  div.style['z-index']  = 50;
  div.style['color'] = '#fff';
  div.style['position'] = 'absolute';
  div.style['bottom'] = '0px';
  div.style['right'] = '0px';
  div.style['padding'] = '5px';
  div.style['font-family'] = 'tahoma, verdana, sans-serif';
  div.style['font-size'] = '12pt';
  document.body.appendChild(div);
  this.statsEl = document.getElementById('physics-stats');
};

DemoScene.prototype.init = function() {
  this._initProxy();
  this.proxy.setStep(1/60);
  this.proxy.setIterations(3);

  setInterval(function() {
    this.proxy.getStats().
      then(function(stats) {
        this.statsEl.innerHTML = stats.fps + '(' + stats.buffersReady + ')';
      }.bind(this));
  }.bind(this), 500);

  window.addEventListener('blur', function() {
    this.proxy.stopSimulation();
  }.bind(this));

  window.addEventListener('focus', function() {
    this.proxy.startSimulation();
  }.bind(this));
};

DemoScene.prototype._initProxy = function() {
  this.proxy = new AmmoProxy();

  this.proxy.on('ready', function() {
    this._initScene();
  }.bind(this));
};

DemoScene.prototype._initScene = function() {
  var stats = this.stats = new Stats();
  stats.setMode(0);

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.bottom = '0px';

  document.body.appendChild(stats.domElement);

  // set the scene size
  var WIDTH = document.body.clientWidth,
      HEIGHT = document.body.clientHeight;

  // set some camera attributes
  var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.01,
      FAR = 1000;

  // get the DOM element to attach to
  // - assume we've got jQuery to hand
  var container = document.getElementById('container');

  // create a WebGL renderer, camera
  // and a scene
  var renderer = this.renderer = new THREE.WebGLRenderer();
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  renderer.physicallyBasedShading = true;
  var camera = this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  var scene = this.scene = new THREE.Scene();

  // the camera starts at 0,0,0 so pull it back
  camera.position.z = 50;
  camera.position.y = 10;
  camera.position.x = 10;
  camera.lookAt(new THREE.Vector3(0,2.5,0));

  var controls = this.controls = new THREE.OrbitControls(camera, renderer.domElement);

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  container.appendChild(renderer.domElement);

  var groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x666666
  });

  var ground = new THREE.Mesh(new THREE.BoxGeometry(1000,0.01,1000, 1, 1, 1),groundMaterial);
  //ground.quaternion.setFromAxisAngle({ x: 1, y: 0, z: 0 }, -Math.PI/2);
  ground.receiveShadow = true;
  ground.position.y = 0;
  scene.add(ground);
  scene.updateMatrixWorld();

  /*
  this.proxy.createCollisionObjectFromObject(ground, { 'shape': 'auto', 'strategy': 'bvh_triangle_mesh'})
    .then(_.bind(function(collisionObject) {
      collisionObject.setFriction(0.5);
      collisionObject.addToWorld(1,255);
      this.groundBody = collisionObject;
    }, this));
  */

  this.proxy.adapter.createRigidBodyFromObject(ground, 1000000, { 'shape': 'auto', 'strategy': 'bvh_triangle_mesh'})
    .then(_.bind(function(rigidBody) {
      rigidBody.setType('static');
      rigidBody.setFriction(0.5);
      rigidBody.addToWorld(1,255);

      this.groundBody = rigidBody;
    }, this));

  scene.add(camera);

  var light = new THREE.DirectionalLight( 0xCCCCCC );
  light.position.set( 100, 200, 0 );
  light.target.position.copy( scene.position );
  light.castShadow = true;
  light.shadowCameraNear = 10;
  light.shadowCameraFar = 500;
  light.shadowMapHeight = 2048;
  light.shadowMapWidth = 2048;
  light.shadowBias = 0.1;
  scene.add(light);

  if (typeof this.initDemo === 'function') {
    this.initDemo();
  }

  this.proxy.startSimulation();

  this.update = this.update.bind(this);
  requestAnimationFrame(this.update);
};

DemoScene.prototype.update = function(delta) {
  var dt = delta - this.last;
  this.last = delta;
  this.stats.begin();

  if (this.groundBody) {
    this.groundBody.update();
  }

  if (typeof this.preUpdate === 'function') {
    this.preUpdate(dt);
  }

  this.controls.update();
  this.renderer.render(this.scene, this.camera);

  if (typeof this.postUpdate === 'function') {
    this.postUpdate(dt);
  }

  if (this.proxy && this.proxy.swap) {
    this.proxy.swap();
  }

  this.stats.end();

  requestAnimationFrame(this.update);
};
