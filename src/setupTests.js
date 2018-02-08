class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return new Promise((resolve, reject) => {
      resolve(this.store[key] || null);
    });
  }
  setItem(key, value) {
    return new Promise(resolve => {
      this.store[key] = value;
      resolve();
    });
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      delete this.store[key];
      resolve();
    });
  }
}

global.localStorage = new LocalStorageMock();
