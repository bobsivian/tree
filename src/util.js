/* eslint no-loop-func: 0*/

import React from 'react';

export function getOffset(ele) {
  if (!ele.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  const rect = ele.getBoundingClientRect();

  if (rect.width || rect.height) {
    const doc = ele.ownerDocument;
    const win = doc.defaultView;
    const docElem = doc.documentElement;

    return {
      top: rect.top + win.pageYOffset - docElem.clientTop,
      left: rect.left + win.pageXOffset - docElem.clientLeft,
    };
  }

  return rect;
}

function getChildrenlength(children) {
  let len = 1;
  if (Array.isArray(children)) {
    len = children.length;
  }
  return len;
}

function getSiblingPosition(index, len, siblingPosition) {
  if (len === 1) {
    siblingPosition.first = true;
    siblingPosition.last = true;
  } else {
    siblingPosition.first = index === 0;
    siblingPosition.last = index === len - 1;
  }
  return siblingPosition;
}

export function loopAllChildren(childs, callback) {
  const loop = (children, level, parentsChildrenPos, parentPos) => {
    const len = getChildrenlength(children);
    React.Children.forEach(children, (item, index) => {
      const pos = `${level}-${index}`;
      parentsChildrenPos.push(pos);
      const childrenPos = [];
      if (item.props.children && item.type && item.type.isTreeNode) {
        loop(item.props.children, pos, childrenPos, pos);
      }
      callback(item, index, pos, item.key || pos,
        getSiblingPosition(index, len, {}), childrenPos, parentPos);
    });
  };
  loop(childs, 0, []);
}

export function isInclude(smallArray, bigArray) {
  return smallArray.every((ii, i) => {
    return ii === bigArray[i];
  });
}
// console.log(isInclude(['0', '1'], ['0', '10', '1']));

export function handleCheckState(obj, checkedPosition, checkIt) {
  const childrenLoop = (parentObj) => {
    parentObj.childrenPos.forEach(childPos => {
      const childObj = obj[childPos];
      childObj.halfChecked = false;
      childObj.checked = checkIt;
      childrenLoop(childObj);
    });
  };

  childrenLoop(obj[checkedPosition]);

  const parentLoop = (childObj) => {
    if (!childObj.parentPos) return;
    const parentObj = obj[childObj.parentPos];

    const childrenCount = parentObj.childrenPos.length;

    let checkedChildrenCount = 0;
    parentObj.childrenPos.forEach(childPos => {
      if (obj[childPos].checked === true) checkedChildrenCount++;
      else if (obj[childPos].halfChecked === true) checkedChildrenCount += 0.5;
    });

    if (checkedChildrenCount === childrenCount) {
      parentObj.checked = true;
      parentObj.halfChecked = false;
    } else if (checkedChildrenCount > 0) {
      parentObj.halfChecked = true;
      parentObj.checked = false;
    } else {
      parentObj.checked = false;
      parentObj.halfChecked = false;
    }
    parentLoop(parentObj);
  };

  parentLoop(obj[checkedPosition]);
}

export function getCheck(treeNodesStates) {
  const halfCheckedKeys = [];
  const checkedKeys = [];
  const checkedNodes = [];
  const checkedNodesPositions = [];
  Object.keys(treeNodesStates).forEach((item) => {
    const itemObj = treeNodesStates[item];
    if (itemObj.checked) {
      checkedKeys.push(itemObj.key);
      checkedNodes.push(itemObj.node);
      checkedNodesPositions.push({ node: itemObj.node, pos: item });
    } else if (itemObj.halfChecked) {
      halfCheckedKeys.push(itemObj.key);
    }
  });
  return {
    halfCheckedKeys, checkedKeys, checkedNodes, checkedNodesPositions, treeNodesStates,
  };
}

export function getStrictlyValue(checkedKeys, halfChecked) {
  if (halfChecked) {
    return { checked: checkedKeys, halfChecked };
  }
  return checkedKeys;
}

export function arraysEqual(a, b) {
  if (a === b) return true;
  if (a === null || typeof a === 'undefined' || b === null || typeof b === 'undefined') {
    return false;
  }
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
