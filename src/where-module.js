import pipeline from 'tuberia-core';

let condPipe = function (requireFn, selector, ...mods) {
  if (typeof selector !== 'function' && requireFn) {
    throw new Error('where module takes a function as first parameter');
  } else if (typeof selector === 'object' && !requireFn) {
    mods.unshift(selector);
    selector = () => true;
  }

  if (!mods.length) {
    throw new Error((requireFn ? 'where module' : 'otherwise function') + ' should have at least one module to operate on');
  }
  let pipe = pipeline(...mods);
  this.routes.push({selector, pipe});
  return this;
};

class WhereModule {
  constructor(selector, mods) {
    this.routes = [];
  }

  otherwise(...args) {
    return condPipe.call(this, false, ...args);
  }

  execute(docs, ctx) {
    let remaining = docs.slice();
    for (let route of this.routes) {
      let notIt = [];
      route.docs = [];
      for (let doc of remaining) {
        if (route.selector(doc, ctx)) {
          route.docs.push(doc);
        } else {
          notIt.push(doc);
        }
      }
      remaining = notIt;
    }
    return Promise.all(this.routes.map(route => {
      if (route.docs.length) {
        return route.pipe.run(ctx, {docs: route.docs});
      }
      return [];
    })).then(pipes => remaining.concat(...pipes));
  }
}

export default function where(...args) {
  let mod = new WhereModule();
  return condPipe.call(mod, true, ...args);
}