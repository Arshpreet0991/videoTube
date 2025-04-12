# Promises

- The promise is an **object**. This is the most important thing to remember.
- This promise object represents a value that we will get later after an async operation.
- used to handle

  - API calls
  - Timers
  - File loading
  - DB calls
  - Anything that takes time

- So whatever data we have in our promise, it is passed to resolve(if promise / async operation is successful).
- If there is an error, it is passed to reject.
- To get access to our data, we use .then and to capture our error we use .catch

```javascript
const promiseOne = new Promise((resolve, reject) => {
  setTimeout(() => {
    let num1 = 20;
    let num2 = 10;
    return resolve(num1 + num2);
  }, 2000);
});

promiseOne.then((sum) => {
  console.log(sum);
});
```

## Promise consumption using async/await

- Here is the code example

```javascript
const delayTimer = function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Timer at 2 sec");
      resolve("Timer finished!");
    }, 2000);
  });
};

async function abc() {
  try {
    const result = await delayTimer();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
abc();
```

- The flow of the steps is as follows:

  1. Inside async function abc(), we call delayTimer()

  2. delayTimer() runs and immediately returns a Promise

  3. delayTimer() is now done — it's out of the picture

  4. await sees the Promise and says, "Okay, I'll pause here"

  5. Meanwhile, the Promise runs the setTimeout for 2 seconds

  6. When the timer finishes, it calls resolve("Timer finished!")

  7. That resolved value is sent back to the await

  8. We store that value in result — otherwise, we’d lose it!

  9. Finally, abc() resumes and finishes its execution
