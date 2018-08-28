import { setAttributes, isChange } from "../tcaer-dom/utils";
import {genDOM} from "../tcaer-dom";

const Type = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  REPLACE: 'REPLACE',
  REMOVE: 'REMOVE',
};

function diffChildren(parent, nextVnode, prevVnode) {
  const prevChildren = prevVnode.children || prevVnode;
  const nextChildren = nextVnode.children || nextVnode;
  const patches = [];
  const maxLen = Math.max(prevChildren.length, nextChildren.length);
  for(let i = 0; i < maxLen; i++) {
    patches.push(diffNode(
      parent,
      nextChildren[i],
      prevChildren[i],
    ))
  }
  return patches;
}

function diffNode(parent, newNode, oldNode) {
  if (typeof newNode === 'number') newNode = String(newNode);
  if (typeof oldNode === 'number') oldNode = String(oldNode);
  
  if (!newNode && !oldNode) return;
  
  if (!oldNode) {
    return {
      type: Type.CREATE,
      newNode,
    }
  }
  if (!newNode) {
    return { type: Type.REMOVE }
  }
  
  if (isChange(newNode, oldNode)) {
    return {
      type: Type.REPLACE,
      newNode
    }
  }
  // console.log(newNode.type, '---newNode');
  
  if (newNode.type) {
    // console.log(newNode, '---newNode');
    if (typeof newNode.type === 'function') {
      const prevComponent = oldNode.type(oldNode.attrs || {});
      const nextComponent = newNode.type(newNode.attrs || {});
      const prevVnode = prevComponent.render ? prevComponent.render() : prevComponent;
      const nextVnode = nextComponent.render ? nextComponent.render() : nextComponent;
      return diffNode(parent, nextVnode, prevVnode);
    } else {
      return {
        type: Type.UPDATE,
        tag: newNode.type,
        children: diffChildren(parent, newNode, oldNode)
      }
    }
  } else if (Array.isArray(newNode)) {
    const maxLen = Math.max(newNode.length, oldNode.length);
    const patches = [];
    for (let i = 0; i < maxLen; i++) {
      patches.push(diffNode(parent, newNode[i], oldNode[i]))
    }
    return patches;
  }
  
}

function updateDOM(parent, patches, isParent) {
  // console.log(parent);
  if (!patches) return;
  
  switch (patches.type) {
    case Type.CREATE: {
      const { newNode } = patches;
      const newEl = genDOM(newNode, parent);
      if (isParent) {
        return parent.appendChild(newEl);
      }
      return parent.parentNode.appendChild(newEl);
    }
    case Type.REMOVE: {
      return parent.parentNode.removeChild(parent);
    }
    case Type.REPLACE: {
      const { newNode } = patches;
      const newEl = genDOM(newNode, parent);
      return parent.parentNode.replaceChild(newEl, parent);
    }
    case Type.UPDATE: {
      const { children } = patches;
      const childrenLen = children.length;
      for(let i = 0; i < childrenLen; i++) {
        const childNodes = parent.childNodes;
        const needUpdateChild = children[i];
        if (Array.isArray(needUpdateChild)) {
         for (let i = 0; i < needUpdateChild.length; i++) {
           const patches = needUpdateChild[i];
           let node = childNodes[i];
           if (node) {
             updateDOM(node, patches);
           } else {
             updateDOM(parent, patches, true);
           }
         }
        } else {
          let node = childNodes[i];
          if (needUpdateChild) {
            // if (needUpdateChild.type === Type.REMOVE) {
            //   children.splice(i, 1);
            // }
            updateDOM(node, needUpdateChild);
          }
        }
      }
    }
  }
}

function update(parent, nextVnode, prevVnode) {
  console.log(nextVnode, prevVnode);
  const patches = diffNode(parent, nextVnode, prevVnode);
  console.log(patches, '----patches');
  updateDOM(parent, patches);
}

export {
  update,
}
