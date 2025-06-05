//   // worker.js
//   self.addEventListener('message', function(event) {
//     // Check if the internet connection is bad
//     if (!navigator.onLine) {
//       self.postMessage('Bad internet connection');
//     } else {
//       self.postMessage('Good internet connection');
//     }
//   });

// worker.js
 // worker.js
self.addEventListener('message', function(event) {
    if (event.data === 'check connection') {
      // Check network connectivity
      if (!navigator.onLine) {
        self.postMessage('Bad connection');
        return;
      }
  
      // Check internet speed
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const downlink = connection.downlink; // Estimated downlink bandwidth (Mbps)
        if (downlink < 1) { // 1 Mbps threshold
          self.postMessage('Low internet speed');
        } else {
          self.postMessage('Good connection');
        }
      } else {
        self.postMessage('Unable to determine internet speed');
      }
    }
  });