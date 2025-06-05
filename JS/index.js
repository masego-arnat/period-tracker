// // main.js
// if (typeof(Worker) !== 'undefined') {
//     // Create a new web worker
//     const worker = new Worker('./JS/worker.js');

//     // Listen for messages from the worker
//     worker.addEventListener('message', function(event) {
//       if (event.data === 'Bad internet connection') {
//         alert('Your internet connection is currently bad. Some features may not work as expected.');
//       } else {
//         console.log('Internet connection is good!');
//       }
//     });

//     // Send a message to the worker to start the check
//     worker.postMessage('check connection');
//   } else {
//     console.log('Web Workers are not supported in this browser.');
//   }

 // index.js
if (typeof(Worker) !== 'undefined') {
    // Create a new web worker
    const worker = new Worker('./JS/worker.js');
  
    // Listen for messages from the worker
    worker.addEventListener('message', function(event) {
      if (event.data === 'Bad connection') {
        alert('Your internet connection is currently bad. Some features may not work as expected.');
      } else if (event.data === 'Low internet speed') {
        alert('Your internet speed is currently low. Some features may not work as expected.');
      } else if (event.data === 'Good connection') {
        console.log('Internet connection is good!');
      } else {
        console.log('Unable to determine internet speed');
      }
    });
  
    // Send a message to the worker to start the check
    worker.postMessage('check connection');
  } else {
    console.log('Web Workers are not supported in this browser.');
  }