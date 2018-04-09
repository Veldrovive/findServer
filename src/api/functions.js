import request from 'request';
import findIndex from 'lodash.findindex';
import union from 'lodash.union';

export function allParse (json) {
  if(json !== null && typeof json === 'object'){
    return json;
  }else if(typeof json === 'string'){
    return JSON.parse(json);
  }else{
    return json;
  }
};

//Queries find3 api to get all devices for a family
export const getDeviceList = (family) => {
  return new Promise(resolve => {
    request("https://cloud.internalpositioning.com/api/v1/devices/"+family, function(err, resp, body){
      body = allParse(body);
      if(body.success === false){
        resolve(false);
      }else{
        resolve({devices: body.devices})
      }
    })
  })
};

//Queries find3 api to get prob data for a device
export const getDevice = (family, name) => {
  return new Promise((resolve, reject) => {
    if(name !== undefined){
      request("https://cloud.internalpositioning.com/api/v1/location/"+family+"/"+name, function(err, resp, body){
        body = allParse(body);
        if(body.success === false){
          reject(false);
        }else{
          resolve(body.analysis.guesses);
        }
      })
    }else{
      request("https://cloud.internalpositioning.com/api/v1/locations/"+family, function(err, resp, body){
        body = allParse(body);
        if(body.success === false){
          reject(false);
        }else{
          resolve(body.locations);
        }
      })
    }
  })
}

export default class familyIterator {
  constructor(family, db, interTime){
    this.db = db;
    this.family = family || "aidantest2";
    this.interTime = interTime || 60000;
    this.interTime = this.interTime < 9999 ? 10000 : this.interTime;

    this.locationList = [];

    this.interList = [];

    //Format: {name: "pi", probs: [{loc: "lc1", prob: 82}, loc: "lc2", prob: 2]}
    this.deviceList = [];


    this.recall()
      .then(oldData => {
        this.deviceList = oldData[0].devices || [];
        this.locationList = oldData[0].locations || [];
      })
      .catch(err => {})

    this.getDevices()
      .then(() => {
        this.getProb()
          .then(() => this.startInter());
      })
      .catch(err => console.log(err));
    return;
  }

  save(){
    return new Promise((resolve, reject) => {
      const family = {
        type: 0,
        name: this.family,
        devices: this.deviceList,
        locations: this.locationList,
      }
      this.db.count({name: this.family, type: 0}, (err, count) => {
        if(count === 0){
          this.db.insert(family, (err, newDocs) => {
            if(err) return reject(err);
            this.db.persistence.compactDatafile()
            return resolve(newDocs);
          })
        }else{
          this.db.update({name: this.family, type: 0}, family, {}, (err, num) => {
            if(err) return reject(err);
            this.db.persistence.compactDatafile()
            return resolve(num);
          })
        }
      })
    })
  }

  getFamily(){
    return {
      name: this.family,
      devices: this.deviceList,
      locations: this.locationList
    }
  }

  addLocations(locArray){
    this.locationList = union(this.locationList, locArray);
    this.save();
    return this.locationList;
  }

  recall(){
    return new Promise((resolve, reject) => {
      this.db.find({name: this.family, type: 0}, (err, docs) => {
        if(err) return reject();
        if(docs.length === 0) return reject();
        return resolve(docs);
      })
    })
  }

  startInter(){
    this.interList.push(setInterval(() => {
      this.getProb();
      this.save();
    }, this.interTime));
  }

  stopInter(){
    this.interList.forEach(inter => {
      clearInterval(inter);
    })
  }

  returnDevices(){
    return this.deviceList.map(o => o.name);
  }

  returnDevice(name){
    return new Promise((resolve, reject) => {
      const index = findIndex(this.deviceList, o => o.name === name);
      if(index === -1) return resolve({data: undefined, err: "Device does not exist", success: false});
      return resolve({data: this.deviceList[index], err: '', success: true});
    })
  }

  getDevices(){
    return new Promise(async (resolve, reject) => {
      let deviceList = await getDeviceList(this.family);
      if(deviceList === false) return reject(false);
      deviceList = deviceList.devices;
      deviceList.forEach(device => {
        if(findIndex(this.deviceList, o => {return o.name === device}) === -1){
          this.deviceList.push({name: device, probs: []});
        }
      })
      return resolve(this.deviceList);
    })
  }

  getProb(devName){
    return new Promise(async (resolve, reject) => {
      if (devName === undefined) {
        const devicesProbs = await getDevice(this.family);
        devicesProbs.forEach(async device => {
          const name = device.device;
          const probs = device.analysis.guesses;
          let deviceIndex = findIndex(this.deviceList, o => {return o.name === name});
          if(findIndex === -1){
            await this.getDevices()
              .catch(err => {console.log(err)});
            deviceIndex = findIndex(this.deviceList, o => {return o.name === name});
          }
          const currentDevice = this.deviceList[deviceIndex];
          probs.forEach(prob => {
            const locIndex = findIndex(currentDevice.probs, o => {return o.loc === prob.location});
            if (locIndex != -1) {
              currentDevice.probs[locIndex].prob = prob.probability || 0;
            } else {
              currentDevice.probs.push({loc: prob.location, prob: prob.probability || 0});
            }
          })
          return resolve({success: true, err: ''})
        })
      } else {
        const deviceIndex = findIndex(this.deviceList, o => {return o.name === devName});
        if(deviceIndex == -1) return reject({success: false, err: 'Device does not exist'});
        const device = this.deviceList[deviceIndex];
        const probs = await getDevice(this.family, devName);
        probs.forEach(prob => {
          const locIndex = findIndex(device.probs, o => {return o.loc === prob.location})
          if (locIndex != -1) {
            device.probs[locIndex].prob = prob.probability || 0;
          } else {
            device.probs.push({loc: prob.location, prob: prob.probability || 0});
          }
        })
        return resolve({success: true, err: ''})
      }
    })
  }
}
