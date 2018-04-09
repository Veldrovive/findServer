import request from 'request';
import $ from 'jquery';
import maxBy from 'lodash.maxby';

function allParse (json) {
  if(json !== null && typeof json === 'object'){
    return json;
  }else if(typeof json === 'string'){
    return JSON.parse(json);
  }else{
    return json;
  }
};
let loc;
$(document).ready(() => {
  loc = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
  main(loc);
})

const main = (loc) => {
  console.log("Hello World, I'm doing well thank you",loc);
  $(".infoHolder").hide();
  populateDeviceList();
}

const populateDeviceInfo = (name) => {
  name = name.target.innerHTML;
  request(loc+"/api/device/"+name, (err, resp, body) => {
    body = allParse(body);
    if(body.success){
      const info = body.data;
      $('.deviceInfoName').html(info.name);
      $('.deviceLocationsList').html('');
      info.probs.sort((a, b) => a.prob-b.prob);
      info.probs.forEach(prob => {
        if(info.probs[info.probs.length-1].prob-prob.prob < .3){
          $('<li><span>'+prob.loc+'</span> - <span>Probability</span>: <span>'+Math.round(prob.prob*100)+'</span>%</li>').prependTo('.deviceLocationsList');
        }
      })
      $(".infoHolder").show();
    }
  })
}

const populateDeviceList = () => {
  request(loc+"/api/deviceList", (err, resp, body) => {
    body = allParse(body);
    if(body.success){
      const devices = body.devices;
      devices.forEach(elem => {
        $('<li class="deviceName">'+elem+'</li>').prependTo('.deviceHolderList');
      })
      $(".deviceName").click(populateDeviceInfo)
    }
  })
}
