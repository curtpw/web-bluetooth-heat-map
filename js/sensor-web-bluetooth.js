/**
* @author Charlie Gerard / http://charliegerard.github.io
*/

const services = {
  controlService: {
    name: 'control service',
    uuid: '0000a009-0000-1000-8000-00805f9b34fb'
  }
}

const characteristics = {
  commandReadCharacteristic: {
    name: 'command read characteristic',
    uuid: '0000a001-0000-1000-8000-00805f9b34fb'
  },
  commandWriteCharacteristic: {
    name: 'command write characteristic',
    uuid: '0000a002-0000-1000-8000-00805f9b34fb'
  },
  imuDataCharacteristic: {
    name: 'imu data characteristic',
    uuid: '0000a003-0000-1000-8000-00805f9b34fb'
  }
}

var _this;
var state = {};
var previousPose;

class ControllerWebBluetooth{
  constructor(name){
    _this = this;
    this.name = name;
    this.services = services;
    this.characteristics = characteristics;

    this.standardServer;
  }

  connect(){
    return navigator.bluetooth.requestDevice({
      filters: [
        {name: this.name},
        {
          services: [ services.controlService.uuid]
        }
      ]
    })
    .then(device => {
      console.log('Device discovered', device.name);
      return device.gatt.connect();
    })
    .then(server => {
      console.log('server device: '+ Object.keys(server.device));

      this.getServices([services.controlService,], [characteristics.commandReadCharacteristic, characteristics.commandWriteCharacteristic, characteristics.imuDataCharacteristic], server);
    })
    .catch(error => {console.log('error',error)})
  }

  getServices(requestedServices, requestedCharacteristics, server){
    this.standardServer = server;

    requestedServices.filter((service) => {
      if(service.uuid == services.controlService.uuid){
        _this.getControlService(requestedServices, requestedCharacteristics, this.standardServer);
      }
    })
  }

  getControlService(requestedServices, requestedCharacteristics, server){
      let controlService = requestedServices.filter((service) => { return service.uuid == services.controlService.uuid});
      let commandReadChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.commandReadCharacteristic.uuid});
      let commandWriteChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.commandWriteCharacteristic.uuid});

      // Before having access to IMU, EMG and Pose data, we need to indicate to the Myo that we want to receive this data.
      return server.getPrimaryService(controlService[0].uuid)
      .then(service => {
        console.log('getting service: ', controlService[0].name);
        return service.getCharacteristic(commandWriteChar[0].uuid);
      })
      .then(characteristic => {
        console.log('getting characteristic: ', commandWriteChar[0].name);
        // return new Buffer([0x01,3,emg_mode,imu_mode,classifier_mode]);
        // The values passed in the buffer indicate that we want to receive all data without restriction;
        let commandValue = new Uint8Array([0x01,3,0x02,0x03,0x01]);
        characteristic.writeValue(commandValue);
      })
      .then(_ => {

        let IMUDataChar = requestedCharacteristics.filter((char) => {return char.uuid == characteristics.imuDataCharacteristic.uuid});

          console.log('getting service: ', controlService[0].name);
          _this.getIMUData(controlService[0], IMUDataChar[0], server);

      })
      .catch(error =>{
        console.log('error: ', error);
      })
  }


  handleIMUDataChanged(event){
    //byteLength of ImuData DataView object is 20.
    // imuData return {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
    let imuData = event.target.value;

    //add 65 and multiply by 7 to decompress thermopile data
    let objectTemp1 = ( event.target.value.getUint8(0) / 8) + 70;
    let objectTemp2 = ( event.target.value.getUint8(1) / 8) + 70;
    let objectTemp3 = ( event.target.value.getUint8(2) / 8) + 70;
    let objectTemp4 = ( event.target.value.getUint8(3) / 8) + 70;
    let objectTemp5 = ( event.target.value.getUint8(4) / 8) + 70;
    let objectTemp6 = ( event.target.value.getUint8(5) / 8) + 70;
    let objectTemp7 = ( event.target.value.getUint8(6) / 8) + 70;
    let objectTemp8 = ( event.target.value.getUint8(7) / 8) + 70;
    let objectTemp9 = ( event.target.value.getUint8(8) / 8) + 70;
    let objectTemp10 = ( event.target.value.getUint8(9) / 8) + 70;
    let objectTemp11 = ( event.target.value.getUint8(10) / 8) + 70;
    let objectTemp12 = ( event.target.value.getUint8(11) / 8) + 70;
    let objectTemp13 = ( event.target.value.getUint8(12) / 8) + 70;
    let objectTemp14 = ( event.target.value.getUint8(13) / 8) + 70;
    let objectTemp15 = ( event.target.value.getUint8(14) / 8) + 70;
  //  let objectTemp16 = ( event.target.value.getUint8(15) / 7) + 70;

    let ambientAverage = ( event.target.value.getUint8(16) / 8) + 70;

 //   let accelerometerX = (event.target.value.getUint8(17) / 100) - 1;
 //   let accelerometerY = (event.target.value.getUint8(18) / 100) - 1;
 //   let accelerometerZ = (event.target.value.getUint8(19) / 100) - 1;

    let accelerometerX = (event.target.value.getUint8(17) / 200);
    let accelerometerY = (event.target.value.getUint8(18) / 200);
    let accelerometerZ = (event.target.value.getUint8(19) / 200);

    let orientationP = event.target.value.getUint8(0); //dummy
    let orientationX = event.target.value.getUint8(1);
    let orientationY = event.target.value.getUint8(2);
    let orientationZ = event.target.value.getUint8(3);

    var data = {
      accelerometer: {
        x: accelerometerX,
        y: accelerometerY,
        z: accelerometerZ
      },
      objectTemp: {
        a: objectTemp1,
        b: objectTemp2,
        c: objectTemp3,
        d: objectTemp4,
        e: objectTemp5,
        f: objectTemp6,
        g: objectTemp7,
        h: objectTemp8,
        i: objectTemp9,
        j: objectTemp10,
        k: objectTemp11,
        l: objectTemp12,
        m: objectTemp13,
        n: objectTemp14,
        o: objectTemp15,
    //   p: objectTemp16,
      },
      ambientTemp: {
        a: ambientAverage
      },
      orientation: {
        x: orientationX,
        y: orientationY,
        z: orientationZ,
        w: orientationP
      }
    }

    state = {
      orientation: data.orientation,
      accelerometer: data.accelerometer,
      objectTemp: data.objectTemp,
      ambientTemp: data.ambientTemp
    }

    _this.onStateChangeCallback(state);
  }

  onStateChangeCallback() {}

  getIMUData(service, characteristic, server){
    return server.getPrimaryService(service.uuid)
    .then(newService => {
      console.log('getting characteristic: ', characteristic.name);
      return newService.getCharacteristic(characteristic.uuid)
    })
    .then(char => {
      char.startNotifications().then(res => {
        char.addEventListener('characteristicvaluechanged', _this.handleIMUDataChanged);
      })
    })
  }

  handlePoseChanged(event){

    _this.onStateChangeCallback(state);
  }

  eventArmSynced(arm, x_direction){
    armType = (arm == 1) ? 'right' : ((arm == 2) ? 'left' : 'unknown');
    myoDirection = (x_direction == 1) ? 'wrist' : ((x_direction == 2) ? 'elbow' : 'unknown');

    state.armType = armType;
    state.myoDirection = myoDirection;

    _this.onStateChangeCallback(state);
  }

  getPoseEvent(code){
    let pose;
    previousPose = pose;
    switch(code){
      case 1:
        pose = 'fist';
        break;
      case 2:
        pose = 'wave in';
        break;
      case 3:
        pose = 'wave out';
        break;
      case 4:
        pose = 'fingers spread';
        break;
      case 5:
        pose = 'double tap';
        break;
      case 255:
        pose = 'unknown';
        break;
    }

    if(previousPose !== pose){
      state.pose = pose;
      _this.onStateChangeCallback(state);
    }
  }

  onStateChange(callback){
    _this.onStateChangeCallback = callback;
  }
}
