/* jshint unused:vars */
define([ 'worker/objects/ammo_object' ], function(AmmoObject) {
  function Wheel(id, ammoData, vehicle) {
    AmmoObject.apply(this, arguments);
    this.type = 'btWheelInfo';
    this.vehicle = vehicle;
    this.index = -1;
    this.force = 0;
  }

  Wheel.prototype = new AmmoObject();

  Wheel.prototype.update = function(data, delta) {
    this.vehicle.ammoData.updateWheelTransform(this.index, true);
    var trans = this.vehicle.ammoData.getWheelTransformWS(this.index);

    data[this.offset + 0] = trans.getOrigin().x();
    data[this.offset + 1] = trans.getOrigin().y();
    data[this.offset + 2] = trans.getOrigin().z();
    data[this.offset + 3] = trans.getRotation().x();
    data[this.offset + 4] = trans.getRotation().y();
    data[this.offset + 5] = trans.getRotation().z();
    data[this.offset + 6] = trans.getRotation().w();

    this.vehicle.ammoData.applyEngineForce(this.force * delta, this.index);
  };

  return Wheel;
});
