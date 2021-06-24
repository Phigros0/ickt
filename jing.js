//能力检测
function getStyle(obj, key) {
    if (window.getComputedStyle) {
        return getComputedStyle(obj)[key];
    }else {
        var style = obj.currentStyle;
        if (style) {
            key = key.replace(/-([a-z])?/g, function(match, $1) {
                return $1.toUpperCase();
            })
            return style[key];
        } else {
            alert('你的浏览器不支持获取计算样式功能')
        }
    }
}

//解决兼容问题，不含换行符
function getNodes(dom) {
    var arr = [];
    var reg = /^\s+$/;//可能不止一个换行符
    for (var i = 0;i < dom.childNodes.length;i++) {
        //过滤换行符
        if (dom.childNodes[i].nodeType === 3) {
            if (!reg.test(dom.childNodes[i].data)) {
                arr.push(dom.childNodes[i]);
            }
        }else {
            arr.push(dom.childNodes[i]);
        }
    }
    return arr;
}

// 封装防抖(节流)函数
function stop(fn) {
    clearTimeout(fn.__timebar);
    //函数也属于对象，因此可以添加属性  
    fn.__timebar = setTimeout(fn,200);
}

/**
 * 元素后面插入元素 
 * @parent     父元素
 * @child      插入的子元素
 * @next       参考元素
**/
function insertAfter(parent, child, next) {
    return parent.insertBefore(child, next.nextSibling);
}

/**
 * 在所有子元素前面插入元素
 * @parent     父元素
 * @child      插入的元素
**/
function prependChild(parent, child) {
    return parent.insertBefore(child, parent.firstChild);
}

//dom2的前面插入dom1
function before(dom1, dom2) {
    dom2.parentNode.insertBefore(dom1, dom2);
}

//dom2的后面插入dom1
function after(dom1, dom2) {
    dom2.parentNode.insertBefore(dom1, dom2.nextSibling);
}

function p(key) {
    return key === 'opacity' ? '' : 'px';
}

/**
 * 实现animate
 * @dom             操作的元素
 * @obj             样式对象
 * @time            移动的时间
 * @callback        动画执行完毕执行的回调函数
 */
function animate(dom, obj, time, callback) {
    var count = 0;
    var total = parseInt((time || 1000) / 30);
    var style = {};
    for (var key in obj) {
        style[key] = parseInt(getStyle(dom, key));
    }
    var step = {};
    for (var key in obj) {
        step[key] = (parseInt(obj[key]) - style[key]) / total;
    }
    var timebar;
    timebar = setInterval(function() {
        count++;
        for (var key in step) {
            dom.style[key] = style[key] + step[key] * count + p(key);
        }
        if (count >= total) {
            for (var key in obj) {
                dom.style[key] = typeof obj[key] === 'string' ? obj[key] : obj[key] + p(key);
            }
            clearInterval(timebar);
            callback && callback();
        }
    }, 30)
}


/**
 * 兼容各种方式绑定事件
 * @param {*} dom    绑定事件的元素
 * @param {*} type   事件类型
 * @param {*} fn     执行的函数
 */
function bindEvent(dom, type, fn) {
    if (type === 'mousewheel' && /firefox/i.test(navigator.userAgent)) {
        type = 'DOMMouseScroll';
    }
    if (dom.addEventListener) {
        dom.addEventListener(type, fn);
    } else if (dom.attachEvent) {
        dom.attachEvent('on' + type, function(e) {
            //兼容性
            e.target = e.srcElement;
            e.currentTarget = this;
            fn.call(dom, e);
        });
    } else {
        var oldFn = dom['on' + type];
        dom['on' + type] = function(e) {
            oldFn && oldFn(e || window.event);
            fn(e || window.event);
        };
    }
}

//移除事件
function removeEvent(dom, type, fn) {
    if (type === 'mousewheel' && /firefox/i.test(navigator.userAgent)) {
        type = 'DOMMouseScroll';
    }
    if (dom.removeEventListener) {
        dom.removeEventListener(type, fn);
    } else if (dom.detachEvent) {
        dom.detachEvent('on' + type, fn);
    } else {
        dom['on' + type] = null;
    }
}

//获取定位元素在页面中的位置
function offset(dom) {
    var result = {
        left: dom.offsetLeft,
        top: dom.offsetTop
    }
    while(dom != document.body) {
        dom = dom.offsetParent;
        result.left += dom.offsetLeft + dom.clientLeft;
        result.top += dom.offsetTop + dom.clientTop;
    }
    return result;
}

//节流基于事件
function stopEvent(fn, time) {
    if (fn.__lock) {
        return;
    }
    fn.__lock = true;
    fn();
    setTimeout(function() {
        fn.__lock = false;
    },time || 1000)//1s后打开锁
}

//封装一个设置样式方法
//两种用法 css(dom, width, '200px') css(dom, { color: 'red', width: '200px'})
function css(dom, key, value) {
    if (typeof key === 'string') {
        dom.style[key] = value;
    } else {
        for (var name in key) {
            css(dom, name, key[name])
        }
    }
}

/**
 * 放大镜
 * @param {结点} dom 
 * @param {图片地址} url 
 * @param {图片宽度} width 
 * @param {图片高度} height 
 */
function bigger(dom, url, width, height) {
    var mask = document.createElement('div');
    var big = document.createElement('div');
    dom.appendChild(mask);
    dom.appendChild(big);
    css(app, {
        width: width + 'px',
        height: height + 'px',
        position: 'relative',
        backgroundImage: 'url(' + url + ')',
        backgroundSize: 'cover'
    })
    css(mask, {
        width: width / 2 + 'px',
        height: height / 2 + 'px',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'yellow',
        opacity: 0.3,
        cursor: 'move',
        display: 'none'
    })
    css(big, {
        width: width + 'px',
        height: height + 'px',
        position: 'absolute',
        backgroundImage: 'url(big' + url + ')',
        left: '100%',
        top: 0,
        border: '1px solid #000',
        display: 'none'
    })
    function changeMaskStyle(x, y) {
        css(mask, {
            left: x + 'px',
            top: y + 'px'
        })
    }
    bindEvent(dom, 'mouseenter', function(e) {
        var dom_x = e.offsetX;
        var dom_y = e.offsetY;
        if (dom_x <= width / 4) {
            dom_x = width / 4;
        } else if (dom_x >= width *3 / 4) {
            dom_x = width *3 / 4;
        }
        if (dom_y <= height / 4) {
            dom_y = height / 4;
        } else if (dom_y >= height *3 / 4) {
            dom_y = height *3 / 4;
        }
        var left = dom_x - width / 4;
        var top = dom_y - height / 4;
        css(mask, {
            top: top + 'px',
            left: left + 'px',
            display: 'block'
        })
        bindEvent(mask, 'mousemove', function(e) {
            var dom_x = e.offsetX + left;
            var dom_y = e.offsetY + top;
            if (dom_x <= width / 4) {
                dom_x = width / 4;
            } else if (dom_x >= width *3 / 4) {
                dom_x = width *3 / 4;
            }
            if (dom_y <= height / 4) {
                dom_y = height / 4;
            } else if (dom_y >= height *3 / 4) {
                dom_y = height *3 / 4;
            }
            left = dom_x - width / 4;
            top = dom_y - height / 4;
            stopEvent(function() {
                changeMaskStyle(left, top);
                css(big, {
                    display: 'block',
                    // backgroundSize: 'cover',
                    backgroundPositionX: -left * 2+ 'px',
                    backgroundPositionY: -top * 2+ 'px',
                })
            })
        })
        bindEvent(dom, 'mouseleave',function(e) {
            css(mask, 'display', 'none')
            css(big, 'display', 'none')
        })
        bindEvent(big, 'mouseenter',function(e) {
            css(mask, 'display', 'none')
            css(big, 'display', 'none')
        })
    })
}

/**
 * 
 * @param {节点}} dom 
 * @param {图片地址} url 
 * @param {图片宽度} width 
 * @param {图片高度} height 
 */
function cutImage(dom, url, width,height) {
    var cut = document.createElement('div');
    var dot = document.createElement('div');
    dom.appendChild(cut);
    dom.appendChild(dot);
    var dom_clientx;
    var dom_clienty;
    css(dom, {
        width: width + 'px',
        height: height + 'px',
        backgroundImage: 'url(' + url + ')',
        border: '1px solid #000',
        position: 'relative'
    })
    css(cut, {
        width: width / 2 - 6 + 'px',
        height: height / 2 - 6 + 'px',
        border: '3px dotted #000',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        cursor: 'move'
    })
    css(dot, {
        width: '9px',
        height: '9px',
        position: 'absolute',
        top: height / 2 - 6 + 'px',
        left: width / 2 - 6 + 'px',
        backgroundColor: 'red',
        'border-radius': '50%'
    })
    function drag(e) {
        var move_clientx = e.clientX;
        var move_clienty = e.clientY;
        var top = move_clienty - dom_clienty + parseInt(getStyle(cut, 'top'));
        var left = move_clientx - dom_clientx + parseInt(getStyle(cut, 'left'));
        dom_clientx = move_clientx;
        dom_clienty = move_clienty;
        console.log('top',top,'left', left,'move_clientx',move_clientx,'move_clienty',move_clienty)
        if (top <= 0) {
            top = 0;
        } else if(top >= height - parseInt(getStyle(cut, 'height')) - 7) {
            top = height - parseInt(getStyle(cut, 'height')) - 7;
        }
        if (left <= 0) {
            left = 0;
        } else if(left >= width - parseInt(getStyle(cut, 'width')) - 7) {
            left = width - parseInt(getStyle(cut, 'width')) - 7;
        }
        css(cut, {
            left: left + 'px',
            top: top + 'px'
        })
        css(dot, {
            left: left + parseInt(getStyle(cut, 'width')) + 'px',
            top: top + parseInt(getStyle(cut, 'height')) + 'px'
        })
    }
    function dragStop(e) {
        stop(drag(e))
    }
    function dragDot(e) {
        var dotmove_clientx = e.clientX;
        var dotmove_clienty = e.clientY;
        var top = dotmove_clienty - dom_clienty + parseInt(getStyle(dot, 'top'));
        var left = dotmove_clientx - dom_clientx + parseInt(getStyle(dot, 'left'));
        dom_clientx = dotmove_clientx;
        dom_clienty = dotmove_clienty;
        if (top <= 0) {
            top = 0;
        } else if(top >= height - 6) {
            top = height - 6;
        }
        if (left <= 0) {
            left = 0;
        } else if(left >= width - 6) {
            left = width - 6;
        }
        if (left < parseInt(getStyle(cut, 'left')) + 3) {
            left = parseInt(getStyle(cut, 'left')) + 3;
        }
        if (top < parseInt(getStyle(cut, 'top')) + 3) {
            top = parseInt(getStyle(cut, 'top')) + 3;
        }
        css(dot, {
            left: left + 'px',
            top: top + 'px'
        })
        css(cut, {
            width: left - parseInt(getStyle(cut, 'left')) + 'px',
            height: top - parseInt(getStyle(cut, 'top')) + 'px',
        })
    }
    function dragStopDot(e) {
        stop(dragDot(e))
    }
    bindEvent(dom, 'mousedown', function(e) {
        var dom_x = e.offsetX;
        var dom_y = e.offsetY;
        dom_clientx = e.clientX;
        dom_clienty = e.clientY;
        if (dom_x < width / 2 - 9 && dom_y < height / 2 - 9 && dom_x > 9 && dom_y > 9) {
            bindEvent(dom, 'mousemove', dragStop);
        } else {
            bindEvent(dom, 'mousemove', dragStopDot)
        }
    bindEvent(dom, 'mouseup', function(e) {
        removeEvent(dom, 'mousemove', dragStop);
        removeEvent(dom, 'mousemove', dragStopDot);
    })
    })
}