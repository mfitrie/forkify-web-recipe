import { async } from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config.js";

const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      }, s * 1000);
    });
};

export const AJAX = async function(url, uploadData = undefined){
  try {
  const fetchPro = uploadData ? fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Tells the API that the data we gonna send is JSON format
    },
    body: JSON.stringify(uploadData),
  }) : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); 
    const data = await res.json();

    if(!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;

  } catch (err) {
      // console.log(err);
      throw err; // the promise return from getJSON will actually reject, rethrow the error
  }
}

/*
export const getJSON = async function(url){
    try {
        const fetchPro = fetch(url);
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); 
        const data = await res.json();

        if(!res.ok) throw new Error(`${data.message} (${res.status})`);
        return data;

    } catch (err) {
        // console.log(err);
        throw err; // the promise return from getJSON will actually reject, rethrow the error
    }
    
};

export const sendJSON = async function(url, uploadData){
  try {
      // Send the data to API
      const fetchPro = fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Tells the API that the data we gonna send is JSON format
        },
        body: JSON.stringify(uploadData),
      });

      const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); // Specify the timeout using Promise

      const data = await res.json();

      if(!res.ok) throw new Error(`${data.message} (${res.status})`);
      return data;

  } catch (err) {
      // console.log(err);
      throw err; // the promise return from getJSON will actually reject, rethrow the error
  }
  
};

*/