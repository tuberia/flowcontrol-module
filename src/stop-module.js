class StopModule {
  constructor(msg) {
    this.msg = msg;
  }

  when(fn) {
    this.condition = fn;
  }

  execute(docs, ctx) {
    if (!this.condition || docs.some(d => this.condition(d, ctx))) {
      return Promise.reject(this.msg);
    } else {
      return docs;
    }
  }
}

export default function stop(msg) {
  return new StopModule(msg);
}