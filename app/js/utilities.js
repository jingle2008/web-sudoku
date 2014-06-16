"use strict";

/*===================================
=            Inheritance            =
===================================*/

Function.prototype.inheritsFrom = function(parent) {
    if (parent.constructor == Function) {
        //Normal Inheritance 
        this.prototype = Object.create(parent.prototype);
        this.prototype.constructor = this;
        this.prototype.parent = parent.prototype;
    } else {
        //Pure Virtual Inheritance 
        this.prototype = parent;
        this.prototype.constructor = this;
        this.prototype.parent = parent;
    }

    return this;
};

/*-----  End of Inheritance  ------*/

function assert(condition, message) {
    if (!condition) {
        throw message || 'Assertion failed';
    }
}