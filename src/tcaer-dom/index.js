// import { setAttributes } from './utils';

function genDOM(vnode) {
  
  if (typeof vnode === 'number') vnode = String(vnode); // 这行
  
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }
  
  const parentDOM = document.createElement(vnode.tag);
  
  if (vnode.attrs) {
    // Object.keys(vnode.attrs).forEach((item) => {
    //   setAttributes(parentDOM, item, vnode.attrs[item]);
    // });
  }
  // console.log(vnode); // 这行
  vnode.children.length && vnode.children.forEach((child) => {
    // if (Array.isArray(child)) { // 这块
    //   child.forEach((item) => {
    //     parentDOM.appendChild(genDOM(item));
    //   });
    //   return;
    // }
    parentDOM.appendChild(genDOM(child));
  });
  
  return parentDOM;
}

const TcaerDom = {
  render(vnode, container, callback) {
    container.innerHTML = '';
    const frag = document.createDocumentFragment();
    container.appendChild(genDOM(vnode, frag));
    callback && callback();
  },
};

export default TcaerDom;
