function func1() {
  try {
    func2()  
  } catch (error) {
    throw error
  }
}

async function func2() {
  try {
    await func2()  
  } catch (error) {
    throw error
  }  
}

function func3() {
  return new Promise(function (resolve, reject) {
    const r = Math.random();
    if(r<0.5) {
      reject('error')
    }
  })
}