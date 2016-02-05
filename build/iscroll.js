"use strict";

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
            }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, f, f.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {
        //     Underscore.js 1.8.3
        //     http://underscorejs.org
        //     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
        //     Underscore may be freely distributed under the MIT license.

        (function () {

            // Baseline setup
            // --------------

            // Establish the root object, `window` in the browser, or `exports` on the server.
            var root = this;

            // Save the previous value of the `_` variable.
            var previousUnderscore = root._;

            // Save bytes in the minified (but not gzipped) version:
            var ArrayProto = Array.prototype,
                ObjProto = Object.prototype,
                FuncProto = Function.prototype;

            // Create quick reference variables for speed access to core prototypes.
            var push = ArrayProto.push,
                slice = ArrayProto.slice,
                toString = ObjProto.toString,
                hasOwnProperty = ObjProto.hasOwnProperty;

            // All **ECMAScript 5** native function implementations that we hope to use
            // are declared here.
            var nativeIsArray = Array.isArray,
                nativeKeys = Object.keys,
                nativeBind = FuncProto.bind,
                nativeCreate = Object.create;

            // Naked function reference for surrogate-prototype-swapping.
            var Ctor = function Ctor() {};

            // Create a safe reference to the Underscore object for use below.
            var _ = function _(obj) {
                if (obj instanceof _) return obj;
                if (!(this instanceof _)) return new _(obj);
                this._wrapped = obj;
            };

            // Export the Underscore object for **Node.js**, with
            // backwards-compatibility for the old `require()` API. If we're in
            // the browser, add `_` as a global object.
            if (typeof exports !== 'undefined') {
                if (typeof module !== 'undefined' && module.exports) {
                    exports = module.exports = _;
                }
                exports._ = _;
            } else {
                root._ = _;
            }

            // Current version.
            _.VERSION = '1.8.3';

            // Internal function that returns an efficient (for current engines) version
            // of the passed-in callback, to be repeatedly applied in other Underscore
            // functions.
            var optimizeCb = function optimizeCb(func, context, argCount) {
                if (context === void 0) return func;
                switch (argCount == null ? 3 : argCount) {
                    case 1:
                        return function (value) {
                            return func.call(context, value);
                        };
                    case 2:
                        return function (value, other) {
                            return func.call(context, value, other);
                        };
                    case 3:
                        return function (value, index, collection) {
                            return func.call(context, value, index, collection);
                        };
                    case 4:
                        return function (accumulator, value, index, collection) {
                            return func.call(context, accumulator, value, index, collection);
                        };
                }
                return function () {
                    return func.apply(context, arguments);
                };
            };

            // A mostly-internal function to generate callbacks that can be applied
            // to each element in a collection, returning the desired result — either
            // identity, an arbitrary callback, a property matcher, or a property accessor.
            var cb = function cb(value, context, argCount) {
                if (value == null) return _.identity;
                if (_.isFunction(value)) return optimizeCb(value, context, argCount);
                if (_.isObject(value)) return _.matcher(value);
                return _.property(value);
            };
            _.iteratee = function (value, context) {
                return cb(value, context, Infinity);
            };

            // An internal function for creating assigner functions.
            var createAssigner = function createAssigner(keysFunc, undefinedOnly) {
                return function (obj) {
                    var length = arguments.length;
                    if (length < 2 || obj == null) return obj;
                    for (var index = 1; index < length; index++) {
                        var source = arguments[index],
                            keys = keysFunc(source),
                            l = keys.length;
                        for (var i = 0; i < l; i++) {
                            var key = keys[i];
                            if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
                        }
                    }
                    return obj;
                };
            };

            // An internal function for creating a new object that inherits from another.
            var baseCreate = function baseCreate(prototype) {
                if (!_.isObject(prototype)) return {};
                if (nativeCreate) return nativeCreate(prototype);
                Ctor.prototype = prototype;
                var result = new Ctor();
                Ctor.prototype = null;
                return result;
            };

            var property = function property(key) {
                return function (obj) {
                    return obj == null ? void 0 : obj[key];
                };
            };

            // Helper for collection methods to determine whether a collection
            // should be iterated as an array or as an object
            // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
            // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
            var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
            var getLength = property('length');
            var isArrayLike = function isArrayLike(collection) {
                var length = getLength(collection);
                return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
            };

            // Collection Functions
            // --------------------

            // The cornerstone, an `each` implementation, aka `forEach`.
            // Handles raw objects in addition to array-likes. Treats all
            // sparse array-likes as if they were dense.
            _.each = _.forEach = function (obj, iteratee, context) {
                iteratee = optimizeCb(iteratee, context);
                var i, length;
                if (isArrayLike(obj)) {
                    for (i = 0, length = obj.length; i < length; i++) {
                        iteratee(obj[i], i, obj);
                    }
                } else {
                    var keys = _.keys(obj);
                    for (i = 0, length = keys.length; i < length; i++) {
                        iteratee(obj[keys[i]], keys[i], obj);
                    }
                }
                return obj;
            };

            // Return the results of applying the iteratee to each element.
            _.map = _.collect = function (obj, iteratee, context) {
                iteratee = cb(iteratee, context);
                var keys = !isArrayLike(obj) && _.keys(obj),
                    length = (keys || obj).length,
                    results = Array(length);
                for (var index = 0; index < length; index++) {
                    var currentKey = keys ? keys[index] : index;
                    results[index] = iteratee(obj[currentKey], currentKey, obj);
                }
                return results;
            };

            // Create a reducing function iterating left or right.
            function createReduce(dir) {
                // Optimized iterator function as using arguments.length
                // in the main function will deoptimize the, see #1991.
                function iterator(obj, iteratee, memo, keys, index, length) {
                    for (; index >= 0 && index < length; index += dir) {
                        var currentKey = keys ? keys[index] : index;
                        memo = iteratee(memo, obj[currentKey], currentKey, obj);
                    }
                    return memo;
                }

                return function (obj, iteratee, memo, context) {
                    iteratee = optimizeCb(iteratee, context, 4);
                    var keys = !isArrayLike(obj) && _.keys(obj),
                        length = (keys || obj).length,
                        index = dir > 0 ? 0 : length - 1;
                    // Determine the initial value if none is provided.
                    if (arguments.length < 3) {
                        memo = obj[keys ? keys[index] : index];
                        index += dir;
                    }
                    return iterator(obj, iteratee, memo, keys, index, length);
                };
            }

            // **Reduce** builds up a single result from a list of values, aka `inject`,
            // or `foldl`.
            _.reduce = _.foldl = _.inject = createReduce(1);

            // The right-associative version of reduce, also known as `foldr`.
            _.reduceRight = _.foldr = createReduce(-1);

            // Return the first value which passes a truth test. Aliased as `detect`.
            _.find = _.detect = function (obj, predicate, context) {
                var key;
                if (isArrayLike(obj)) {
                    key = _.findIndex(obj, predicate, context);
                } else {
                    key = _.findKey(obj, predicate, context);
                }
                if (key !== void 0 && key !== -1) return obj[key];
            };

            // Return all the elements that pass a truth test.
            // Aliased as `select`.
            _.filter = _.select = function (obj, predicate, context) {
                var results = [];
                predicate = cb(predicate, context);
                _.each(obj, function (value, index, list) {
                    if (predicate(value, index, list)) results.push(value);
                });
                return results;
            };

            // Return all the elements for which a truth test fails.
            _.reject = function (obj, predicate, context) {
                return _.filter(obj, _.negate(cb(predicate)), context);
            };

            // Determine whether all of the elements match a truth test.
            // Aliased as `all`.
            _.every = _.all = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var keys = !isArrayLike(obj) && _.keys(obj),
                    length = (keys || obj).length;
                for (var index = 0; index < length; index++) {
                    var currentKey = keys ? keys[index] : index;
                    if (!predicate(obj[currentKey], currentKey, obj)) return false;
                }
                return true;
            };

            // Determine if at least one element in the object matches a truth test.
            // Aliased as `any`.
            _.some = _.any = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var keys = !isArrayLike(obj) && _.keys(obj),
                    length = (keys || obj).length;
                for (var index = 0; index < length; index++) {
                    var currentKey = keys ? keys[index] : index;
                    if (predicate(obj[currentKey], currentKey, obj)) return true;
                }
                return false;
            };

            // Determine if the array or object contains a given item (using `===`).
            // Aliased as `includes` and `include`.
            _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
                if (!isArrayLike(obj)) obj = _.values(obj);
                if (typeof fromIndex != 'number' || guard) fromIndex = 0;
                return _.indexOf(obj, item, fromIndex) >= 0;
            };

            // Invoke a method (with arguments) on every item in a collection.
            _.invoke = function (obj, method) {
                var args = slice.call(arguments, 2);
                var isFunc = _.isFunction(method);
                return _.map(obj, function (value) {
                    var func = isFunc ? method : value[method];
                    return func == null ? func : func.apply(value, args);
                });
            };

            // Convenience version of a common use case of `map`: fetching a property.
            _.pluck = function (obj, key) {
                return _.map(obj, _.property(key));
            };

            // Convenience version of a common use case of `filter`: selecting only objects
            // containing specific `key:value` pairs.
            _.where = function (obj, attrs) {
                return _.filter(obj, _.matcher(attrs));
            };

            // Convenience version of a common use case of `find`: getting the first object
            // containing specific `key:value` pairs.
            _.findWhere = function (obj, attrs) {
                return _.find(obj, _.matcher(attrs));
            };

            // Return the maximum element (or element-based computation).
            _.max = function (obj, iteratee, context) {
                var result = -Infinity,
                    lastComputed = -Infinity,
                    value,
                    computed;
                if (iteratee == null && obj != null) {
                    obj = isArrayLike(obj) ? obj : _.values(obj);
                    for (var i = 0, length = obj.length; i < length; i++) {
                        value = obj[i];
                        if (value > result) {
                            result = value;
                        }
                    }
                } else {
                    iteratee = cb(iteratee, context);
                    _.each(obj, function (value, index, list) {
                        computed = iteratee(value, index, list);
                        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                            result = value;
                            lastComputed = computed;
                        }
                    });
                }
                return result;
            };

            // Return the minimum element (or element-based computation).
            _.min = function (obj, iteratee, context) {
                var result = Infinity,
                    lastComputed = Infinity,
                    value,
                    computed;
                if (iteratee == null && obj != null) {
                    obj = isArrayLike(obj) ? obj : _.values(obj);
                    for (var i = 0, length = obj.length; i < length; i++) {
                        value = obj[i];
                        if (value < result) {
                            result = value;
                        }
                    }
                } else {
                    iteratee = cb(iteratee, context);
                    _.each(obj, function (value, index, list) {
                        computed = iteratee(value, index, list);
                        if (computed < lastComputed || computed === Infinity && result === Infinity) {
                            result = value;
                            lastComputed = computed;
                        }
                    });
                }
                return result;
            };

            // Shuffle a collection, using the modern version of the
            // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
            _.shuffle = function (obj) {
                var set = isArrayLike(obj) ? obj : _.values(obj);
                var length = set.length;
                var shuffled = Array(length);
                for (var index = 0, rand; index < length; index++) {
                    rand = _.random(0, index);
                    if (rand !== index) shuffled[index] = shuffled[rand];
                    shuffled[rand] = set[index];
                }
                return shuffled;
            };

            // Sample **n** random values from a collection.
            // If **n** is not specified, returns a single random element.
            // The internal `guard` argument allows it to work with `map`.
            _.sample = function (obj, n, guard) {
                if (n == null || guard) {
                    if (!isArrayLike(obj)) obj = _.values(obj);
                    return obj[_.random(obj.length - 1)];
                }
                return _.shuffle(obj).slice(0, Math.max(0, n));
            };

            // Sort the object's values by a criterion produced by an iteratee.
            _.sortBy = function (obj, iteratee, context) {
                iteratee = cb(iteratee, context);
                return _.pluck(_.map(obj, function (value, index, list) {
                    return {
                        value: value,
                        index: index,
                        criteria: iteratee(value, index, list)
                    };
                }).sort(function (left, right) {
                    var a = left.criteria;
                    var b = right.criteria;
                    if (a !== b) {
                        if (a > b || a === void 0) return 1;
                        if (a < b || b === void 0) return -1;
                    }
                    return left.index - right.index;
                }), 'value');
            };

            // An internal function used for aggregate "group by" operations.
            var group = function group(behavior) {
                return function (obj, iteratee, context) {
                    var result = {};
                    iteratee = cb(iteratee, context);
                    _.each(obj, function (value, index) {
                        var key = iteratee(value, index, obj);
                        behavior(result, value, key);
                    });
                    return result;
                };
            };

            // Groups the object's values by a criterion. Pass either a string attribute
            // to group by, or a function that returns the criterion.
            _.groupBy = group(function (result, value, key) {
                if (_.has(result, key)) result[key].push(value);else result[key] = [value];
            });

            // Indexes the object's values by a criterion, similar to `groupBy`, but for
            // when you know that your index values will be unique.
            _.indexBy = group(function (result, value, key) {
                result[key] = value;
            });

            // Counts instances of an object that group by a certain criterion. Pass
            // either a string attribute to count by, or a function that returns the
            // criterion.
            _.countBy = group(function (result, value, key) {
                if (_.has(result, key)) result[key]++;else result[key] = 1;
            });

            // Safely create a real, live array from anything iterable.
            _.toArray = function (obj) {
                if (!obj) return [];
                if (_.isArray(obj)) return slice.call(obj);
                if (isArrayLike(obj)) return _.map(obj, _.identity);
                return _.values(obj);
            };

            // Return the number of elements in an object.
            _.size = function (obj) {
                if (obj == null) return 0;
                return isArrayLike(obj) ? obj.length : _.keys(obj).length;
            };

            // Split a collection into two arrays: one whose elements all satisfy the given
            // predicate, and one whose elements all do not satisfy the predicate.
            _.partition = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var pass = [],
                    fail = [];
                _.each(obj, function (value, key, obj) {
                    (predicate(value, key, obj) ? pass : fail).push(value);
                });
                return [pass, fail];
            };

            // Array Functions
            // ---------------

            // Get the first element of an array. Passing **n** will return the first N
            // values in the array. Aliased as `head` and `take`. The **guard** check
            // allows it to work with `_.map`.
            _.first = _.head = _.take = function (array, n, guard) {
                if (array == null) return void 0;
                if (n == null || guard) return array[0];
                return _.initial(array, array.length - n);
            };

            // Returns everything but the last entry of the array. Especially useful on
            // the arguments object. Passing **n** will return all the values in
            // the array, excluding the last N.
            _.initial = function (array, n, guard) {
                return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
            };

            // Get the last element of an array. Passing **n** will return the last N
            // values in the array.
            _.last = function (array, n, guard) {
                if (array == null) return void 0;
                if (n == null || guard) return array[array.length - 1];
                return _.rest(array, Math.max(0, array.length - n));
            };

            // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
            // Especially useful on the arguments object. Passing an **n** will return
            // the rest N values in the array.
            _.rest = _.tail = _.drop = function (array, n, guard) {
                return slice.call(array, n == null || guard ? 1 : n);
            };

            // Trim out all falsy values from an array.
            _.compact = function (array) {
                return _.filter(array, _.identity);
            };

            // Internal implementation of a recursive `flatten` function.
            var flatten = function flatten(input, shallow, strict, startIndex) {
                var output = [],
                    idx = 0;
                for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
                    var value = input[i];
                    if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                        //flatten current level of array or arguments object
                        if (!shallow) value = flatten(value, shallow, strict);
                        var j = 0,
                            len = value.length;
                        output.length += len;
                        while (j < len) {
                            output[idx++] = value[j++];
                        }
                    } else if (!strict) {
                        output[idx++] = value;
                    }
                }
                return output;
            };

            // Flatten out an array, either recursively (by default), or just one level.
            _.flatten = function (array, shallow) {
                return flatten(array, shallow, false);
            };

            // Return a version of the array that does not contain the specified value(s).
            _.without = function (array) {
                return _.difference(array, slice.call(arguments, 1));
            };

            // Produce a duplicate-free version of the array. If the array has already
            // been sorted, you have the option of using a faster algorithm.
            // Aliased as `unique`.
            _.uniq = _.unique = function (array, isSorted, iteratee, context) {
                if (!_.isBoolean(isSorted)) {
                    context = iteratee;
                    iteratee = isSorted;
                    isSorted = false;
                }
                if (iteratee != null) iteratee = cb(iteratee, context);
                var result = [];
                var seen = [];
                for (var i = 0, length = getLength(array); i < length; i++) {
                    var value = array[i],
                        computed = iteratee ? iteratee(value, i, array) : value;
                    if (isSorted) {
                        if (!i || seen !== computed) result.push(value);
                        seen = computed;
                    } else if (iteratee) {
                        if (!_.contains(seen, computed)) {
                            seen.push(computed);
                            result.push(value);
                        }
                    } else if (!_.contains(result, value)) {
                        result.push(value);
                    }
                }
                return result;
            };

            // Produce an array that contains the union: each distinct element from all of
            // the passed-in arrays.
            _.union = function () {
                return _.uniq(flatten(arguments, true, true));
            };

            // Produce an array that contains every item shared between all the
            // passed-in arrays.
            _.intersection = function (array) {
                var result = [];
                var argsLength = arguments.length;
                for (var i = 0, length = getLength(array); i < length; i++) {
                    var item = array[i];
                    if (_.contains(result, item)) continue;
                    for (var j = 1; j < argsLength; j++) {
                        if (!_.contains(arguments[j], item)) break;
                    }
                    if (j === argsLength) result.push(item);
                }
                return result;
            };

            // Take the difference between one array and a number of other arrays.
            // Only the elements present in just the first array will remain.
            _.difference = function (array) {
                var rest = flatten(arguments, true, true, 1);
                return _.filter(array, function (value) {
                    return !_.contains(rest, value);
                });
            };

            // Zip together multiple lists into a single array -- elements that share
            // an index go together.
            _.zip = function () {
                return _.unzip(arguments);
            };

            // Complement of _.zip. Unzip accepts an array of arrays and groups
            // each array's elements on shared indices
            _.unzip = function (array) {
                var length = array && _.max(array, getLength).length || 0;
                var result = Array(length);

                for (var index = 0; index < length; index++) {
                    result[index] = _.pluck(array, index);
                }
                return result;
            };

            // Converts lists into objects. Pass either a single array of `[key, value]`
            // pairs, or two parallel arrays of the same length -- one of keys, and one of
            // the corresponding values.
            _.object = function (list, values) {
                var result = {};
                for (var i = 0, length = getLength(list); i < length; i++) {
                    if (values) {
                        result[list[i]] = values[i];
                    } else {
                        result[list[i][0]] = list[i][1];
                    }
                }
                return result;
            };

            // Generator function to create the findIndex and findLastIndex functions
            function createPredicateIndexFinder(dir) {
                return function (array, predicate, context) {
                    predicate = cb(predicate, context);
                    var length = getLength(array);
                    var index = dir > 0 ? 0 : length - 1;
                    for (; index >= 0 && index < length; index += dir) {
                        if (predicate(array[index], index, array)) return index;
                    }
                    return -1;
                };
            }

            // Returns the first index on an array-like that passes a predicate test
            _.findIndex = createPredicateIndexFinder(1);
            _.findLastIndex = createPredicateIndexFinder(-1);

            // Use a comparator function to figure out the smallest index at which
            // an object should be inserted so as to maintain order. Uses binary search.
            _.sortedIndex = function (array, obj, iteratee, context) {
                iteratee = cb(iteratee, context, 1);
                var value = iteratee(obj);
                var low = 0,
                    high = getLength(array);
                while (low < high) {
                    var mid = Math.floor((low + high) / 2);
                    if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
                }
                return low;
            };

            // Generator function to create the indexOf and lastIndexOf functions
            function createIndexFinder(dir, predicateFind, sortedIndex) {
                return function (array, item, idx) {
                    var i = 0,
                        length = getLength(array);
                    if (typeof idx == 'number') {
                        if (dir > 0) {
                            i = idx >= 0 ? idx : Math.max(idx + length, i);
                        } else {
                            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                        }
                    } else if (sortedIndex && idx && length) {
                        idx = sortedIndex(array, item);
                        return array[idx] === item ? idx : -1;
                    }
                    if (item !== item) {
                        idx = predicateFind(slice.call(array, i, length), _.isNaN);
                        return idx >= 0 ? idx + i : -1;
                    }
                    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                        if (array[idx] === item) return idx;
                    }
                    return -1;
                };
            }

            // Return the position of the first occurrence of an item in an array,
            // or -1 if the item is not included in the array.
            // If the array is large and already in sort order, pass `true`
            // for **isSorted** to use binary search.
            _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
            _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

            // Generate an integer Array containing an arithmetic progression. A port of
            // the native Python `range()` function. See
            // [the Python documentation](http://docs.python.org/library/functions.html#range).
            _.range = function (start, stop, step) {
                if (stop == null) {
                    stop = start || 0;
                    start = 0;
                }
                step = step || 1;

                var length = Math.max(Math.ceil((stop - start) / step), 0);
                var range = Array(length);

                for (var idx = 0; idx < length; idx++, start += step) {
                    range[idx] = start;
                }

                return range;
            };

            // Function (ahem) Functions
            // ------------------

            // Determines whether to execute a function as a constructor
            // or a normal function with the provided arguments
            var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
                if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
                var self = baseCreate(sourceFunc.prototype);
                var result = sourceFunc.apply(self, args);
                if (_.isObject(result)) return result;
                return self;
            };

            // Create a function bound to a given object (assigning `this`, and arguments,
            // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
            // available.
            _.bind = function (func, context) {
                if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
                if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
                var args = slice.call(arguments, 2);
                var bound = function bound() {
                    return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
                };
                return bound;
            };

            // Partially apply a function by creating a version that has had some of its
            // arguments pre-filled, without changing its dynamic `this` context. _ acts
            // as a placeholder, allowing any combination of arguments to be pre-filled.
            _.partial = function (func) {
                var boundArgs = slice.call(arguments, 1);
                var bound = function bound() {
                    var position = 0,
                        length = boundArgs.length;
                    var args = Array(length);
                    for (var i = 0; i < length; i++) {
                        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
                    }
                    while (position < arguments.length) {
                        args.push(arguments[position++]);
                    }return executeBound(func, bound, this, this, args);
                };
                return bound;
            };

            // Bind a number of an object's methods to that object. Remaining arguments
            // are the method names to be bound. Useful for ensuring that all callbacks
            // defined on an object belong to it.
            _.bindAll = function (obj) {
                var i,
                    length = arguments.length,
                    key;
                if (length <= 1) throw new Error('bindAll must be passed function names');
                for (i = 1; i < length; i++) {
                    key = arguments[i];
                    obj[key] = _.bind(obj[key], obj);
                }
                return obj;
            };

            // Memoize an expensive function by storing its results.
            _.memoize = function (func, hasher) {
                var memoize = function memoize(key) {
                    var cache = memoize.cache;
                    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
                    if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
                    return cache[address];
                };
                memoize.cache = {};
                return memoize;
            };

            // Delays a function for the given number of milliseconds, and then calls
            // it with the arguments supplied.
            _.delay = function (func, wait) {
                var args = slice.call(arguments, 2);
                return setTimeout(function () {
                    return func.apply(null, args);
                }, wait);
            };

            // Defers a function, scheduling it to run after the current call stack has
            // cleared.
            _.defer = _.partial(_.delay, _, 1);

            // Returns a function, that, when invoked, will only be triggered at most once
            // during a given window of time. Normally, the throttled function will run
            // as much as it can, without ever going more than once per `wait` duration;
            // but if you'd like to disable the execution on the leading edge, pass
            // `{leading: false}`. To disable execution on the trailing edge, ditto.
            _.throttle = function (func, wait, options) {
                var context, args, result;
                var timeout = null;
                var previous = 0;
                if (!options) options = {};
                var later = function later() {
                    previous = options.leading === false ? 0 : _.now();
                    timeout = null;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                };
                return function () {
                    var now = _.now();
                    if (!previous && options.leading === false) previous = now;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0 || remaining > wait) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        previous = now;
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    } else if (!timeout && options.trailing !== false) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            };

            // Returns a function, that, as long as it continues to be invoked, will not
            // be triggered. The function will be called after it stops being called for
            // N milliseconds. If `immediate` is passed, trigger the function on the
            // leading edge, instead of the trailing.
            _.debounce = function (func, wait, immediate) {
                var timeout, args, context, timestamp, result;

                var later = function later() {
                    var last = _.now() - timestamp;

                    if (last < wait && last >= 0) {
                        timeout = setTimeout(later, wait - last);
                    } else {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                            if (!timeout) context = args = null;
                        }
                    }
                };

                return function () {
                    context = this;
                    args = arguments;
                    timestamp = _.now();
                    var callNow = immediate && !timeout;
                    if (!timeout) timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                        context = args = null;
                    }

                    return result;
                };
            };

            // Returns the first function passed as an argument to the second,
            // allowing you to adjust arguments, run code before and after, and
            // conditionally execute the original function.
            _.wrap = function (func, wrapper) {
                return _.partial(wrapper, func);
            };

            // Returns a negated version of the passed-in predicate.
            _.negate = function (predicate) {
                return function () {
                    return !predicate.apply(this, arguments);
                };
            };

            // Returns a function that is the composition of a list of functions, each
            // consuming the return value of the function that follows.
            _.compose = function () {
                var args = arguments;
                var start = args.length - 1;
                return function () {
                    var i = start;
                    var result = args[start].apply(this, arguments);
                    while (i--) {
                        result = args[i].call(this, result);
                    }return result;
                };
            };

            // Returns a function that will only be executed on and after the Nth call.
            _.after = function (times, func) {
                return function () {
                    if (--times < 1) {
                        return func.apply(this, arguments);
                    }
                };
            };

            // Returns a function that will only be executed up to (but not including) the Nth call.
            _.before = function (times, func) {
                var memo;
                return function () {
                    if (--times > 0) {
                        memo = func.apply(this, arguments);
                    }
                    if (times <= 1) func = null;
                    return memo;
                };
            };

            // Returns a function that will be executed at most one time, no matter how
            // often you call it. Useful for lazy initialization.
            _.once = _.partial(_.before, 2);

            // Object Functions
            // ----------------

            // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
            var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
            var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

            function collectNonEnumProps(obj, keys) {
                var nonEnumIdx = nonEnumerableProps.length;
                var constructor = obj.constructor;
                var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

                // Constructor is a special case.
                var prop = 'constructor';
                if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

                while (nonEnumIdx--) {
                    prop = nonEnumerableProps[nonEnumIdx];
                    if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                        keys.push(prop);
                    }
                }
            }

            // Retrieve the names of an object's own properties.
            // Delegates to **ECMAScript 5**'s native `Object.keys`
            _.keys = function (obj) {
                if (!_.isObject(obj)) return [];
                if (nativeKeys) return nativeKeys(obj);
                var keys = [];
                for (var key in obj) {
                    if (_.has(obj, key)) keys.push(key);
                } // Ahem, IE < 9.
                if (hasEnumBug) collectNonEnumProps(obj, keys);
                return keys;
            };

            // Retrieve all the property names of an object.
            _.allKeys = function (obj) {
                if (!_.isObject(obj)) return [];
                var keys = [];
                for (var key in obj) {
                    keys.push(key);
                } // Ahem, IE < 9.
                if (hasEnumBug) collectNonEnumProps(obj, keys);
                return keys;
            };

            // Retrieve the values of an object's properties.
            _.values = function (obj) {
                var keys = _.keys(obj);
                var length = keys.length;
                var values = Array(length);
                for (var i = 0; i < length; i++) {
                    values[i] = obj[keys[i]];
                }
                return values;
            };

            // Returns the results of applying the iteratee to each element of the object
            // In contrast to _.map it returns an object
            _.mapObject = function (obj, iteratee, context) {
                iteratee = cb(iteratee, context);
                var keys = _.keys(obj),
                    length = keys.length,
                    results = {},
                    currentKey;
                for (var index = 0; index < length; index++) {
                    currentKey = keys[index];
                    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
                }
                return results;
            };

            // Convert an object into a list of `[key, value]` pairs.
            _.pairs = function (obj) {
                var keys = _.keys(obj);
                var length = keys.length;
                var pairs = Array(length);
                for (var i = 0; i < length; i++) {
                    pairs[i] = [keys[i], obj[keys[i]]];
                }
                return pairs;
            };

            // Invert the keys and values of an object. The values must be serializable.
            _.invert = function (obj) {
                var result = {};
                var keys = _.keys(obj);
                for (var i = 0, length = keys.length; i < length; i++) {
                    result[obj[keys[i]]] = keys[i];
                }
                return result;
            };

            // Return a sorted list of the function names available on the object.
            // Aliased as `methods`
            _.functions = _.methods = function (obj) {
                var names = [];
                for (var key in obj) {
                    if (_.isFunction(obj[key])) names.push(key);
                }
                return names.sort();
            };

            // Extend a given object with all the properties in passed-in object(s).
            _.extend = createAssigner(_.allKeys);

            // Assigns a given object with all the own properties in the passed-in object(s)
            // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
            _.extendOwn = _.assign = createAssigner(_.keys);

            // Returns the first key on an object that passes a predicate test
            _.findKey = function (obj, predicate, context) {
                predicate = cb(predicate, context);
                var keys = _.keys(obj),
                    key;
                for (var i = 0, length = keys.length; i < length; i++) {
                    key = keys[i];
                    if (predicate(obj[key], key, obj)) return key;
                }
            };

            // Return a copy of the object only containing the whitelisted properties.
            _.pick = function (object, oiteratee, context) {
                var result = {},
                    obj = object,
                    iteratee,
                    keys;
                if (obj == null) return result;
                if (_.isFunction(oiteratee)) {
                    keys = _.allKeys(obj);
                    iteratee = optimizeCb(oiteratee, context);
                } else {
                    keys = flatten(arguments, false, false, 1);
                    iteratee = function iteratee(value, key, obj) {
                        return key in obj;
                    };
                    obj = Object(obj);
                }
                for (var i = 0, length = keys.length; i < length; i++) {
                    var key = keys[i];
                    var value = obj[key];
                    if (iteratee(value, key, obj)) result[key] = value;
                }
                return result;
            };

            // Return a copy of the object without the blacklisted properties.
            _.omit = function (obj, iteratee, context) {
                if (_.isFunction(iteratee)) {
                    iteratee = _.negate(iteratee);
                } else {
                    var keys = _.map(flatten(arguments, false, false, 1), String);
                    iteratee = function iteratee(value, key) {
                        return !_.contains(keys, key);
                    };
                }
                return _.pick(obj, iteratee, context);
            };

            // Fill in a given object with default properties.
            _.defaults = createAssigner(_.allKeys, true);

            // Creates an object that inherits from the given prototype object.
            // If additional properties are provided then they will be added to the
            // created object.
            _.create = function (prototype, props) {
                var result = baseCreate(prototype);
                if (props) _.extendOwn(result, props);
                return result;
            };

            // Create a (shallow-cloned) duplicate of an object.
            _.clone = function (obj) {
                if (!_.isObject(obj)) return obj;
                return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
            };

            // Invokes interceptor with the obj, and then returns obj.
            // The primary purpose of this method is to "tap into" a method chain, in
            // order to perform operations on intermediate results within the chain.
            _.tap = function (obj, interceptor) {
                interceptor(obj);
                return obj;
            };

            // Returns whether an object has a given set of `key:value` pairs.
            _.isMatch = function (object, attrs) {
                var keys = _.keys(attrs),
                    length = keys.length;
                if (object == null) return !length;
                var obj = Object(object);
                for (var i = 0; i < length; i++) {
                    var key = keys[i];
                    if (attrs[key] !== obj[key] || !(key in obj)) return false;
                }
                return true;
            };

            // Internal recursive comparison function for `isEqual`.
            var eq = function eq(a, b, aStack, bStack) {
                // Identical objects are equal. `0 === -0`, but they aren't identical.
                // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
                if (a === b) return a !== 0 || 1 / a === 1 / b;
                // A strict comparison is necessary because `null == undefined`.
                if (a == null || b == null) return a === b;
                // Unwrap any wrapped objects.
                if (a instanceof _) a = a._wrapped;
                if (b instanceof _) b = b._wrapped;
                // Compare `[[Class]]` names.
                var className = toString.call(a);
                if (className !== toString.call(b)) return false;
                switch (className) {
                    // Strings, numbers, regular expressions, dates, and booleans are compared by value.
                    case '[object RegExp]':
                    // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
                    case '[object String]':
                        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                        // equivalent to `new String("5")`.
                        return '' + a === '' + b;
                    case '[object Number]':
                        // `NaN`s are equivalent, but non-reflexive.
                        // Object(NaN) is equivalent to NaN
                        if (+a !== +a) return +b !== +b;
                        // An `egal` comparison is performed for other numeric values.
                        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
                    case '[object Date]':
                    case '[object Boolean]':
                        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                        // millisecond representations. Note that invalid dates with millisecond representations
                        // of `NaN` are not equivalent.
                        return +a === +b;
                }

                var areArrays = className === '[object Array]';
                if (!areArrays) {
                    if ((typeof a === "undefined" ? "undefined" : _typeof(a)) != 'object' || (typeof b === "undefined" ? "undefined" : _typeof(b)) != 'object') return false;

                    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
                    // from different frames are.
                    var aCtor = a.constructor,
                        bCtor = b.constructor;
                    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
                        return false;
                    }
                }
                // Assume equality for cyclic structures. The algorithm for detecting cyclic
                // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

                // Initializing stack of traversed objects.
                // It's done here since we only need them for objects and arrays comparison.
                aStack = aStack || [];
                bStack = bStack || [];
                var length = aStack.length;
                while (length--) {
                    // Linear search. Performance is inversely proportional to the number of
                    // unique nested structures.
                    if (aStack[length] === a) return bStack[length] === b;
                }

                // Add the first object to the stack of traversed objects.
                aStack.push(a);
                bStack.push(b);

                // Recursively compare objects and arrays.
                if (areArrays) {
                    // Compare array lengths to determine if a deep comparison is necessary.
                    length = a.length;
                    if (length !== b.length) return false;
                    // Deep compare the contents, ignoring non-numeric properties.
                    while (length--) {
                        if (!eq(a[length], b[length], aStack, bStack)) return false;
                    }
                } else {
                    // Deep compare objects.
                    var keys = _.keys(a),
                        key;
                    length = keys.length;
                    // Ensure that both objects contain the same number of properties before comparing deep equality.
                    if (_.keys(b).length !== length) return false;
                    while (length--) {
                        // Deep compare each member
                        key = keys[length];
                        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
                    }
                }
                // Remove the first object from the stack of traversed objects.
                aStack.pop();
                bStack.pop();
                return true;
            };

            // Perform a deep comparison to check if two objects are equal.
            _.isEqual = function (a, b) {
                return eq(a, b);
            };

            // Is a given array, string, or object empty?
            // An "empty" object has no enumerable own-properties.
            _.isEmpty = function (obj) {
                if (obj == null) return true;
                if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
                return _.keys(obj).length === 0;
            };

            // Is a given value a DOM element?
            _.isElement = function (obj) {
                return !!(obj && obj.nodeType === 1);
            };

            // Is a given value an array?
            // Delegates to ECMA5's native Array.isArray
            _.isArray = nativeIsArray || function (obj) {
                return toString.call(obj) === '[object Array]';
            };

            // Is a given variable an object?
            _.isObject = function (obj) {
                var type = typeof obj === "undefined" ? "undefined" : _typeof(obj);
                return type === 'function' || type === 'object' && !!obj;
            };

            // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
            _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
                _['is' + name] = function (obj) {
                    return toString.call(obj) === '[object ' + name + ']';
                };
            });

            // Define a fallback version of the method in browsers (ahem, IE < 9), where
            // there isn't any inspectable "Arguments" type.
            if (!_.isArguments(arguments)) {
                _.isArguments = function (obj) {
                    return _.has(obj, 'callee');
                };
            }

            // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
            // IE 11 (#1621), and in Safari 8 (#1929).
            if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object') {
                _.isFunction = function (obj) {
                    return typeof obj == 'function' || false;
                };
            }

            // Is a given object a finite number?
            _.isFinite = function (obj) {
                return isFinite(obj) && !isNaN(parseFloat(obj));
            };

            // Is the given value `NaN`? (NaN is the only number which does not equal itself).
            _.isNaN = function (obj) {
                return _.isNumber(obj) && obj !== +obj;
            };

            // Is a given value a boolean?
            _.isBoolean = function (obj) {
                return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
            };

            // Is a given value equal to null?
            _.isNull = function (obj) {
                return obj === null;
            };

            // Is a given variable undefined?
            _.isUndefined = function (obj) {
                return obj === void 0;
            };

            // Shortcut function for checking if an object has a given property directly
            // on itself (in other words, not on a prototype).
            _.has = function (obj, key) {
                return obj != null && hasOwnProperty.call(obj, key);
            };

            // Utility Functions
            // -----------------

            // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
            // previous owner. Returns a reference to the Underscore object.
            _.noConflict = function () {
                root._ = previousUnderscore;
                return this;
            };

            // Keep the identity function around for default iteratees.
            _.identity = function (value) {
                return value;
            };

            // Predicate-generating functions. Often useful outside of Underscore.
            _.constant = function (value) {
                return function () {
                    return value;
                };
            };

            _.noop = function () {};

            _.property = property;

            // Generates a function for a given object that returns a given property.
            _.propertyOf = function (obj) {
                return obj == null ? function () {} : function (key) {
                    return obj[key];
                };
            };

            // Returns a predicate for checking whether an object has a given set of
            // `key:value` pairs.
            _.matcher = _.matches = function (attrs) {
                attrs = _.extendOwn({}, attrs);
                return function (obj) {
                    return _.isMatch(obj, attrs);
                };
            };

            // Run a function **n** times.
            _.times = function (n, iteratee, context) {
                var accum = Array(Math.max(0, n));
                iteratee = optimizeCb(iteratee, context, 1);
                for (var i = 0; i < n; i++) {
                    accum[i] = iteratee(i);
                }return accum;
            };

            // Return a random integer between min and max (inclusive).
            _.random = function (min, max) {
                if (max == null) {
                    max = min;
                    min = 0;
                }
                return min + Math.floor(Math.random() * (max - min + 1));
            };

            // A (possibly faster) way to get the current timestamp as an integer.
            _.now = Date.now || function () {
                return new Date().getTime();
            };

            // List of HTML entities for escaping.
            var escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '`': '&#x60;'
            };
            var unescapeMap = _.invert(escapeMap);

            // Functions for escaping and unescaping strings to/from HTML interpolation.
            var createEscaper = function createEscaper(map) {
                var escaper = function escaper(match) {
                    return map[match];
                };
                // Regexes for identifying a key that needs to be escaped
                var source = '(?:' + _.keys(map).join('|') + ')';
                var testRegexp = RegExp(source);
                var replaceRegexp = RegExp(source, 'g');
                return function (string) {
                    string = string == null ? '' : '' + string;
                    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
                };
            };
            _.escape = createEscaper(escapeMap);
            _.unescape = createEscaper(unescapeMap);

            // If the value of the named `property` is a function then invoke it with the
            // `object` as context; otherwise, return it.
            _.result = function (object, property, fallback) {
                var value = object == null ? void 0 : object[property];
                if (value === void 0) {
                    value = fallback;
                }
                return _.isFunction(value) ? value.call(object) : value;
            };

            // Generate a unique integer id (unique within the entire client session).
            // Useful for temporary DOM ids.
            var idCounter = 0;
            _.uniqueId = function (prefix) {
                var id = ++idCounter + '';
                return prefix ? prefix + id : id;
            };

            // By default, Underscore uses ERB-style template delimiters, change the
            // following template settings to use alternative delimiters.
            _.templateSettings = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /<%=([\s\S]+?)%>/g,
                escape: /<%-([\s\S]+?)%>/g
            };

            // When customizing `templateSettings`, if you don't want to define an
            // interpolation, evaluation or escaping regex, we need one that is
            // guaranteed not to match.
            var noMatch = /(.)^/;

            // Certain characters need to be escaped so that they can be put into a
            // string literal.
            var escapes = {
                "'": "'",
                '\\': '\\',
                '\r': 'r',
                '\n': 'n',
                "\u2028": 'u2028',
                "\u2029": 'u2029'
            };

            var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

            var escapeChar = function escapeChar(match) {
                return '\\' + escapes[match];
            };

            // JavaScript micro-templating, similar to John Resig's implementation.
            // Underscore templating handles arbitrary delimiters, preserves whitespace,
            // and correctly escapes quotes within interpolated code.
            // NB: `oldSettings` only exists for backwards compatibility.
            _.template = function (text, settings, oldSettings) {
                if (!settings && oldSettings) settings = oldSettings;
                settings = _.defaults({}, settings, _.templateSettings);

                // Combine delimiters into one regular expression via alternation.
                var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

                // Compile the template source, escaping string literals appropriately.
                var index = 0;
                var source = "__p+='";
                text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                    source += text.slice(index, offset).replace(escaper, escapeChar);
                    index = offset + match.length;

                    if (escape) {
                        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                    } else if (interpolate) {
                        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                    } else if (evaluate) {
                        source += "';\n" + evaluate + "\n__p+='";
                    }

                    // Adobe VMs need the match returned to produce the correct offest.
                    return match;
                });
                source += "';\n";

                // If a variable is not specified, place data values in local scope.
                if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

                source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

                try {
                    var render = new Function(settings.variable || 'obj', '_', source);
                } catch (e) {
                    e.source = source;
                    throw e;
                }

                var template = function template(data) {
                    return render.call(this, data, _);
                };

                // Provide the compiled source as a convenience for precompilation.
                var argument = settings.variable || 'obj';
                template.source = 'function(' + argument + '){\n' + source + '}';

                return template;
            };

            // Add a "chain" function. Start chaining a wrapped Underscore object.
            _.chain = function (obj) {
                var instance = _(obj);
                instance._chain = true;
                return instance;
            };

            // OOP
            // ---------------
            // If Underscore is called as a function, it returns a wrapped object that
            // can be used OO-style. This wrapper holds altered versions of all the
            // underscore functions. Wrapped objects may be chained.

            // Helper function to continue chaining intermediate results.
            var result = function result(instance, obj) {
                return instance._chain ? _(obj).chain() : obj;
            };

            // Add your own custom functions to the Underscore object.
            _.mixin = function (obj) {
                _.each(_.functions(obj), function (name) {
                    var func = _[name] = obj[name];
                    _.prototype[name] = function () {
                        var args = [this._wrapped];
                        push.apply(args, arguments);
                        return result(this, func.apply(_, args));
                    };
                });
            };

            // Add all of the Underscore functions to the wrapper object.
            _.mixin(_);

            // Add all mutator Array functions to the wrapper.
            _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
                var method = ArrayProto[name];
                _.prototype[name] = function () {
                    var obj = this._wrapped;
                    method.apply(obj, arguments);
                    if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
                    return result(this, obj);
                };
            });

            // Add all accessor Array functions to the wrapper.
            _.each(['concat', 'join', 'slice'], function (name) {
                var method = ArrayProto[name];
                _.prototype[name] = function () {
                    return result(this, method.apply(this._wrapped, arguments));
                };
            });

            // Extracts the result from a wrapped and chained object.
            _.prototype.value = function () {
                return this._wrapped;
            };

            // Provide unwrapping proxy for some methods used in engine operations
            // such as arithmetic and JSON stringification.
            _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

            _.prototype.toString = function () {
                return '' + this._wrapped;
            };

            // AMD registration happens at the end for compatibility with AMD loaders
            // that may not enforce next-turn semantics on modules. Even though general
            // practice for AMD registration is to be anonymous, underscore registers
            // as a named module because, like jQuery, it is a base library that is
            // popular enough to be bundled in a third party lib, but not be part of
            // an AMD load request. Those cases could generate an error when an
            // anonymous define() is called outside of a loader request.
            if (typeof define === 'function' && define.amd) {
                define('underscore', [], function () {
                    return _;
                });
            }
        }).call(this);
    }, {}], 2: [function (require, module, exports) {
        var _require = require('./utils');

        var rAF = _require.rAF;
        var utils = _require.utils;

        var IScroll = function () {
            function IScroll(el, options) {
                _classCallCheck(this, IScroll);

                this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
                this.scroller = this.wrapper.children[0];
                this.scrollerStyle = this.scroller.style; // cache style for better performance

                this.options = {
                    startX: 0,
                    startY: 0,
                    scrollY: true,
                    directionLockThreshold: 5,
                    momentum: true,

                    bounce: true,
                    bounceTime: 600,
                    bounceEasing: '',

                    preventDefault: true,
                    preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

                    HWCompositing: true,
                    useTransition: true,
                    useTransform: true
                };

                for (var i in options) {
                    this.options[i] = options[i];
                }

                // Normalize options
                this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

                this.options.useTransition = utils.hasTransition && this.options.useTransition;
                this.options.useTransform = utils.hasTransform && this.options.useTransform;

                this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
                this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

                // If you want eventPassthrough I have to lock one of the axes
                this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
                this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

                // With eventPassthrough we also need lockDirection mechanism
                this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
                this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

                this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

                this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

                if (this.options.tap === true) {
                    this.options.tap = 'tap';
                }

                this._normalize();

                // Some defaults
                this.x = 0;
                this.y = 0;
                this.directionX = 0;
                this.directionY = 0;
                this._events = {};

                this._insert_point();

                this._init();
                this.refresh();

                this.scrollTo(this.options.startX, this.options.startY);
                this.enable();

                this.version = '5.1.3';
            }

            _createClass(IScroll, [{
                key: "_init",
                value: function _init() {
                    this._initEvents();
                }
            }, {
                key: "destroy",
                value: function destroy() {
                    this._initEvents(true);

                    this._execEvent('destroy');
                }
            }, {
                key: "_transitionEnd",
                value: function _transitionEnd(e) {
                    if (e.target != this.scroller || !this.isInTransition) {
                        return;
                    }

                    this._transitionTime();
                    if (!this.resetPosition(this.options.bounceTime)) {
                        this.isInTransition = false;
                        this._execEvent('scrollEnd');
                    }
                }
            }, {
                key: "_start",
                value: function _start(e) {
                    // React to left mouse button only
                    if (utils.eventType[e.type] != 1) {
                        if (e.button !== 0) {
                            return;
                        }
                    }

                    if (!this.enabled || this.initiated && utils.eventType[e.type] !== this.initiated) {
                        return;
                    }

                    if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                        e.preventDefault();
                    }

                    var point = e.touches ? e.touches[0] : e,
                        pos;

                    this.initiated = utils.eventType[e.type];
                    this.moved = false;
                    this.distX = 0;
                    this.distY = 0;
                    this.directionX = 0;
                    this.directionY = 0;
                    this.directionLocked = 0;

                    this._transitionTime();

                    this.startTime = utils.getTime();

                    if (this.options.useTransition && this.isInTransition) {
                        this.isInTransition = false;
                        pos = this.getComputedPosition();
                        this._translate(Math.round(pos.x), Math.round(pos.y));
                        this._execEvent('scrollEnd');
                    } else if (!this.options.useTransition && this.isAnimating) {
                        this.isAnimating = false;
                        this._execEvent('scrollEnd');
                    }

                    this.startX = this.x;
                    this.startY = this.y;
                    this.absStartX = this.x;
                    this.absStartY = this.y;
                    this.pointX = point.pageX;
                    this.pointY = point.pageY;

                    this._execEvent('beforeScrollStart');
                }
            }, {
                key: "_move",
                value: function _move(e) {
                    if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                        return;
                    }

                    if (this.options.preventDefault) {
                        // increases performance on Android? TODO: check!
                        e.preventDefault();
                    }

                    var point = e.touches ? e.touches[0] : e,
                        deltaX = point.pageX - this.pointX,
                        deltaY = point.pageY - this.pointY,
                        timestamp = utils.getTime(),
                        newX,
                        newY,
                        absDistX,
                        absDistY;

                    this.pointX = point.pageX;
                    this.pointY = point.pageY;

                    this.distX += deltaX;
                    this.distY += deltaY;
                    absDistX = Math.abs(this.distX);
                    absDistY = Math.abs(this.distY);

                    // We need to move at least 10 pixels for the scrolling to initiate
                    if (timestamp - this.endTime > 300 && absDistX < 10 && absDistY < 10) {
                        return;
                    }

                    // If you are scrolling in one direction lock the other
                    if (!this.directionLocked && !this.options.freeScroll) {
                        if (absDistX > absDistY + this.options.directionLockThreshold) {
                            this.directionLocked = 'h'; // lock horizontally
                        } else if (absDistY >= absDistX + this.options.directionLockThreshold) {
                                this.directionLocked = 'v'; // lock vertically
                            } else {
                                    this.directionLocked = 'n'; // no lock
                                }
                    }

                    if (this.directionLocked == 'h') {
                        if (this.options.eventPassthrough == 'vertical') {
                            e.preventDefault();
                        } else if (this.options.eventPassthrough == 'horizontal') {
                            this.initiated = false;
                            return;
                        }

                        deltaY = 0;
                    } else if (this.directionLocked == 'v') {
                        if (this.options.eventPassthrough == 'horizontal') {
                            e.preventDefault();
                        } else if (this.options.eventPassthrough == 'vertical') {
                            this.initiated = false;
                            return;
                        }

                        deltaX = 0;
                    }

                    deltaX = this.hasHorizontalScroll ? deltaX : 0;
                    deltaY = this.hasVerticalScroll ? deltaY : 0;

                    newX = this.x + deltaX;
                    newY = this.y + deltaY;

                    // Slow down if outside of the boundaries
                    if (newX > 0 || newX < this.maxScrollX) {
                        newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
                    }
                    if (newY > 0 || newY < this.maxScrollY) {
                        newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
                    }

                    this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
                    this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

                    if (!this.moved) {
                        this._execEvent('scrollStart');
                    }

                    this.moved = true;

                    this._translate(newX, newY);

                    /* REPLACE START: _move */

                    if (timestamp - this.startTime > 300) {
                        this.startTime = timestamp;
                        this.startX = this.x;
                        this.startY = this.y;
                    }

                    /* REPLACE END: _move */
                }
            }, {
                key: "_end",
                value: function _end(e) {
                    if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                        return;
                    }

                    if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                        e.preventDefault();
                    }

                    var point = e.changedTouches ? e.changedTouches[0] : e,
                        momentumX,
                        momentumY,
                        duration = utils.getTime() - this.startTime,
                        newX = Math.round(this.x),
                        newY = Math.round(this.y),
                        distanceX = Math.abs(newX - this.startX),
                        distanceY = Math.abs(newY - this.startY),
                        time = 0,
                        easing = '';

                    this.isInTransition = 0;
                    this.initiated = 0;
                    this.endTime = utils.getTime();

                    // reset if we are outside of the boundaries
                    if (this.resetPosition(this.options.bounceTime)) {
                        return;
                    }

                    this.scrollTo(newX, newY); // ensures that the last position is rounded

                    // we scrolled less than 10 pixels
                    if (!this.moved) {
                        if (this.options.tap) {
                            utils.tap(e, this.options.tap);
                        }

                        if (this.options.click) {
                            utils.click(e);
                        }

                        this._execEvent('scrollCancel');
                        return;
                    }

                    if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
                        this._execEvent('flick');
                        return;
                    }

                    // start momentum animation if needed
                    if (this.options.momentum && duration < 300) {
                        momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
                            destination: newX,
                            duration: 0
                        };
                        momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
                            destination: newY,
                            duration: 0
                        };
                        newX = momentumX.destination;
                        newY = momentumY.destination;
                        time = Math.max(momentumX.duration, momentumY.duration);
                        this.isInTransition = 1;
                    }

                    var _end2 = this.__end(newX, newY, time, easing);

                    var _newX = _end2.newX;
                    var _newY = _end2.newY;
                    var _time = _end2.time;
                    var _easing = _end2.easing;

                    newX = _newX;
                    newY = _newY;
                    time = _time;
                    easing = _easing;

                    if (newX != this.x || newY != this.y) {
                        // change easing function when scroller goes out of the boundaries
                        if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
                            easing = utils.ease.quadratic;
                        }

                        this.scrollTo(newX, newY, time, easing);
                        return;
                    }

                    this._execEvent('scrollEnd');
                }
            }, {
                key: "_resize",
                value: function _resize() {
                    var that = this;

                    clearTimeout(this.resizeTimeout);

                    this.resizeTimeout = setTimeout(function () {
                        that.refresh();
                    }, this.options.resizePolling);
                }
            }, {
                key: "resetPosition",
                value: function resetPosition(time) {
                    var x = this.x,
                        y = this.y;

                    time = time || 0;

                    if (!this.hasHorizontalScroll || this.x > 0) {
                        x = 0;
                    } else if (this.x < this.maxScrollX) {
                        x = this.maxScrollX;
                    }

                    if (!this.hasVerticalScroll || this.y > 0) {
                        y = 0;
                    } else if (this.y < this.maxScrollY) {
                        y = this.maxScrollY;
                    }

                    if (x == this.x && y == this.y) {
                        return false;
                    }

                    this.scrollTo(x, y, time, this.options.bounceEasing);

                    return true;
                }
            }, {
                key: "disable",
                value: function disable() {
                    this.enabled = false;
                }
            }, {
                key: "enable",
                value: function enable() {
                    this.enabled = true;
                }
            }, {
                key: "refresh",
                value: function refresh() {
                    var rf = this.wrapper.offsetHeight; // Force reflow

                    this.wrapperWidth = this.wrapper.clientWidth;
                    this.wrapperHeight = this.wrapper.clientHeight;

                    /* REPLACE START: refresh */

                    this.scrollerWidth = this.scroller.offsetWidth;
                    this.scrollerHeight = this.scroller.offsetHeight;

                    this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
                    this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

                    /* REPLACE END: refresh */

                    this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
                    this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;

                    if (!this.hasHorizontalScroll) {
                        this.maxScrollX = 0;
                        this.scrollerWidth = this.wrapperWidth;
                    }

                    if (!this.hasVerticalScroll) {
                        this.maxScrollY = 0;
                        this.scrollerHeight = this.wrapperHeight;
                    }

                    this.endTime = 0;
                    this.directionX = 0;
                    this.directionY = 0;

                    this.wrapperOffset = utils.offset(this.wrapper);

                    this._execEvent('refresh');

                    this.resetPosition();
                }
            }, {
                key: "on",
                value: function on(type, fn) {
                    if (!this._events[type]) {
                        this._events[type] = [];
                    }

                    this._events[type].push(fn);
                }
            }, {
                key: "off",
                value: function off(type, fn) {
                    if (!this._events[type]) {
                        return;
                    }

                    var index = this._events[type].indexOf(fn);

                    if (index > -1) {
                        this._events[type].splice(index, 1);
                    }
                }
            }, {
                key: "_execEvent",
                value: function _execEvent(type) {
                    if (!this._events[type]) {
                        return;
                    }

                    var i = 0,
                        l = this._events[type].length;

                    if (!l) {
                        return;
                    }

                    for (; i < l; i++) {
                        this._events[type][i].apply(this, [].slice.call(arguments, 1));
                    }
                }
            }, {
                key: "scrollBy",
                value: function scrollBy(x, y, time, easing) {
                    x = this.x + x;
                    y = this.y + y;
                    time = time || 0;

                    this.scrollTo(x, y, time, easing);
                }
            }, {
                key: "scrollTo",
                value: function scrollTo(x, y, time, easing) {
                    easing = easing || utils.ease.circular;

                    this.isInTransition = this.options.useTransition && time > 0;

                    if (!time || this.options.useTransition && easing.style) {
                        this._transitionTimingFunction(easing.style);
                        this._transitionTime(time);
                        this._translate(x, y);
                    } else {
                        this._animate(x, y, time, easing.fn);
                    }
                }
            }, {
                key: "scrollToElement",
                value: function scrollToElement(el, time, offsetX, offsetY, easing) {
                    el = el.nodeType ? el : this.scroller.querySelector(el);

                    if (!el) {
                        return;
                    }

                    var pos = utils.offset(el);

                    pos.left -= this.wrapperOffset.left;
                    pos.top -= this.wrapperOffset.top;

                    // if offsetX/Y are true we center the element to the screen
                    if (offsetX === true) {
                        offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
                    }
                    if (offsetY === true) {
                        offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
                    }

                    pos.left -= offsetX || 0;
                    pos.top -= offsetY || 0;

                    pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
                    pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;

                    time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;

                    this.scrollTo(pos.left, pos.top, time, easing);
                }

                /**
                 * Call this first when extending.
                 * @param time
                 * @private
                 */

            }, {
                key: "_transitionTime",
                value: function _transitionTime(time) {
                    time = time || 0;

                    this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

                    if (!time && utils.isBadAndroid) {
                        this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
                    }
                }

                /**
                 * Call this first when extending.
                 * @param easing
                 * @private
                 */

            }, {
                key: "_transitionTimingFunction",
                value: function _transitionTimingFunction(easing) {
                    this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
                }
            }, {
                key: "_translate",
                value: function _translate(x, y) {
                    if (this.options.useTransform) {

                        /* REPLACE START: _translate */

                        this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

                        /* REPLACE END: _translate */
                    } else {
                            x = Math.round(x);
                            y = Math.round(y);
                            this.scrollerStyle.left = x + 'px';
                            this.scrollerStyle.top = y + 'px';
                        }

                    this.x = x;
                    this.y = y;
                }
            }, {
                key: "_initEvents",
                value: function _initEvents(remove) {
                    var eventType = remove ? utils.removeEvent : utils.addEvent,
                        target = this.options.bindToWrapper ? this.wrapper : window;

                    eventType(window, 'orientationchange', this);
                    eventType(window, 'resize', this);

                    if (this.options.click) {
                        eventType(this.wrapper, 'click', this, true);
                    }

                    if (!this.options.disableMouse) {
                        eventType(this.wrapper, 'mousedown', this);
                        eventType(target, 'mousemove', this);
                        eventType(target, 'mousecancel', this);
                        eventType(target, 'mouseup', this);
                    }

                    if (utils.hasPointer && !this.options.disablePointer) {
                        eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
                        eventType(target, utils.prefixPointerEvent('pointermove'), this);
                        eventType(target, utils.prefixPointerEvent('pointercancel'), this);
                        eventType(target, utils.prefixPointerEvent('pointerup'), this);
                    }

                    if (utils.hasTouch && !this.options.disableTouch) {
                        eventType(this.wrapper, 'touchstart', this);
                        eventType(target, 'touchmove', this);
                        eventType(target, 'touchcancel', this);
                        eventType(target, 'touchend', this);
                    }

                    eventType(this.scroller, 'transitionend', this);
                    eventType(this.scroller, 'webkitTransitionEnd', this);
                    eventType(this.scroller, 'oTransitionEnd', this);
                    eventType(this.scroller, 'MSTransitionEnd', this);
                }
            }, {
                key: "getComputedPosition",
                value: function getComputedPosition() {
                    var matrix = window.getComputedStyle(this.scroller, null),
                        x,
                        y;

                    if (this.options.useTransform) {
                        matrix = matrix[utils.style.transform].split(')')[0].split(', ');
                        x = +(matrix[12] || matrix[4]);
                        y = +(matrix[13] || matrix[5]);
                    } else {
                        x = +matrix.left.replace(/[^-\d.]/g, '');
                        y = +matrix.top.replace(/[^-\d.]/g, '');
                    }

                    return { x: x, y: y };
                }
            }, {
                key: "_normalize",
                value: function _normalize() {}
            }, {
                key: "_insert_point",
                value: function _insert_point() {}
            }, {
                key: "__end",
                value: function __end(newX, newY, time, easing) {
                    return { newX: newX, newY: newY, time: time, easing: easing };
                }
            }]);

            return IScroll;
        }();

        IScroll.utils = utils;

        module.exports = IScroll;
    }, { "./utils": 15 }], 3: [function (require, module, exports) {
        module.exports = {
            _animate: function _animate(destX, destY, duration, easingFn) {
                var that = this,
                    startX = this.x,
                    startY = this.y,
                    startTime = utils.getTime(),
                    destTime = startTime + duration;

                function step() {
                    var now = utils.getTime(),
                        newX,
                        newY,
                        easing;

                    if (now >= destTime) {
                        that.isAnimating = false;
                        that._translate(destX, destY);

                        if (!that.resetPosition(that.options.bounceTime)) {
                            that._execEvent('scrollEnd');
                        }

                        return;
                    }

                    now = (now - startTime) / duration;
                    easing = easingFn(now);
                    newX = (destX - startX) * easing + startX;
                    newY = (destY - startY) * easing + startY;
                    that._translate(newX, newY);

                    if (that.isAnimating) {
                        rAF(step);
                    }
                }

                this.isAnimating = true;
                step();
            }
        };
    }, {}], 4: [function (require, module, exports) {
        module.exports = {
            handleEvent: function handleEvent(e) {
                switch (e.type) {
                    case 'touchstart':
                    case 'pointerdown':
                    case 'MSPointerDown':
                    case 'mousedown':
                        this._start(e);
                        break;
                    case 'touchmove':
                    case 'pointermove':
                    case 'MSPointerMove':
                    case 'mousemove':
                        this._move(e);
                        break;
                    case 'touchend':
                    case 'pointerup':
                    case 'MSPointerUp':
                    case 'mouseup':
                    case 'touchcancel':
                    case 'pointercancel':
                    case 'MSPointerCancel':
                    case 'mousecancel':
                        this._end(e);
                        break;
                    case 'orientationchange':
                    case 'resize':
                        this._resize();
                        break;
                    case 'transitionend':
                    case 'webkitTransitionEnd':
                    case 'oTransitionEnd':
                    case 'MSTransitionEnd':
                        this._transitionEnd(e);
                        break;
                    case 'wheel':
                    case 'DOMMouseScroll':
                    case 'mousewheel':
                        this._wheel(e);
                        break;
                    case 'keydown':
                        this._key(e);
                        break;
                    case 'click':
                        if (!e._constructed) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        break;
                }
            }
        };
    }, {}], 5: [function (require, module, exports) {
        var _IScroll = require('./core');
        var _ = require('underscore');

        var IScroll = function (_IScroll2) {
            _inherits(IScroll, _IScroll2);

            function IScroll(el, options) {
                _classCallCheck(this, IScroll);

                options = _.extend(options, {
                    resizeScrollbars: true,
                    mouseWheelSpeed: 20,
                    snapThreshold: 0.334
                });
                return _possibleConstructorReturn(this, Object.getPrototypeOf(IScroll).call(this, el, options));
            }

            _createClass(IScroll, [{
                key: "refresh",
                value: function refresh() {
                    _get(Object.getPrototypeOf(IScroll.prototype), "refresh", this).call(this);
                    require('./snap/refresh').call(this);
                }
            }, {
                key: "_init",
                value: function _init() {
                    _get(Object.getPrototypeOf(IScroll.prototype), "_init", this).call(this);
                    if (this.options.scrollbars || this.options.indicators) {
                        this._initIndicators();
                    }
                    if (this.options.mouseWheel) {
                        this._initWheel();
                    }
                    if (this.options.snap) {
                        this._initSnap();
                    }
                    if (this.options.keyBindings) {
                        this._initKeys();
                    }
                }
            }, {
                key: "_transitionTime",
                value: function _transitionTime(time) {
                    _get(Object.getPrototypeOf(IScroll.prototype), "_transitionTime", this).call(this, time);
                    return require('./indicator/_transitionTime').call(this, time);
                }
            }, {
                key: "_transitionTimingFunction",
                value: function _transitionTimingFunction(easing) {
                    _get(Object.getPrototypeOf(IScroll.prototype), "_transitionTimingFunction", this).call(this, easing);
                    return require('./indicator/_transitionTimingFunction').call(this, easing);
                }
            }, {
                key: "_translate",
                value: function _translate(x, y) {
                    _get(Object.getPrototypeOf(IScroll.prototype), "_translate", this).call(this, x, y);
                    return require('./indicator/_translate').call(this, x, y);
                }
            }, {
                key: "_normalize",
                value: function _normalize() {
                    if (this.options.shrinkScrollbars == 'scale') {
                        this.options.useTransition = false;
                    }
                    this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;
                    _get(Object.getPrototypeOf(IScroll.prototype), "_normalize", this).call(this);
                }
            }, {
                key: "_initIndicators",
                value: function _initIndicators() {
                    return require('./indicator/_initIndicators').call(this);
                }
            }]);

            return IScroll;
        }(_IScroll);

        _.extend(IScroll.prototype, require('./wheel/wheel'));
        _.extend(IScroll.prototype, require('./snap/snap'));
        _.extend(IScroll.prototype, require('./snap/_end'));
        _.extend(IScroll.prototype, require('./keys/keys'));
        _.extend(IScroll.prototype, require('./default/_animate'));
        _.extend(IScroll.prototype, require('./default/handleEvent'));
        _.extend(IScroll.prototype, require('./indicator/indicator'));

        (function (window, document, Math) {
            if (typeof window !== 'undefined' && !window.IScroll) {
                window.IScroll = IScroll;
            }
        })(window, document, Math);
    }, { "./core": 2, "./default/_animate": 3, "./default/handleEvent": 4, "./indicator/_initIndicators": 6, "./indicator/_transitionTime": 7, "./indicator/_transitionTimingFunction": 8, "./indicator/_translate": 9, "./indicator/indicator": 10, "./keys/keys": 11, "./snap/_end": 12, "./snap/refresh": 13, "./snap/snap": 14, "./wheel/wheel": 16, "underscore": 1 }], 6: [function (require, module, exports) {
        module.exports = function () {
            var interactive = this.options.interactiveScrollbars,
                customStyle = typeof this.options.scrollbars != 'string',
                indicators = [],
                indicator;

            var that = this;

            this.indicators = [];

            if (this.options.scrollbars) {
                // Vertical scrollbar
                if (this.options.scrollY) {
                    indicator = {
                        el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenX: false
                    };

                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }

                // Horizontal scrollbar
                if (this.options.scrollX) {
                    indicator = {
                        el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenY: false
                    };

                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }
            }

            if (this.options.indicators) {
                // TODO: check concat compatibility
                indicators = indicators.concat(this.options.indicators);
            }

            for (var i = indicators.length; i--;) {
                this.indicators.push(new Indicator(this, indicators[i]));
            }

            // TODO: check if we can use array.map (wide compatibility and performance issues)
            function _indicatorsMap(fn) {
                for (var i = that.indicators.length; i--;) {
                    fn.call(that.indicators[i]);
                }
            }

            if (this.options.fadeScrollbars) {
                this.on('scrollEnd', function () {
                    _indicatorsMap(function () {
                        this.fade();
                    });
                });

                this.on('scrollCancel', function () {
                    _indicatorsMap(function () {
                        this.fade();
                    });
                });

                this.on('scrollStart', function () {
                    _indicatorsMap(function () {
                        this.fade(1);
                    });
                });

                this.on('beforeScrollStart', function () {
                    _indicatorsMap(function () {
                        this.fade(1, true);
                    });
                });
            }

            this.on('refresh', function () {
                _indicatorsMap(function () {
                    this.refresh();
                });
            });

            this.on('destroy', function () {
                _indicatorsMap(function () {
                    this.destroy();
                });

                delete this.indicators;
            });
        };
    }, {}], 7: [function (require, module, exports) {
        module.exports = function (time) {
            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].transitionTime(time);
                }
            }
        };
    }, {}], 8: [function (require, module, exports) {
        module.exports = function (easing) {
            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].transitionTimingFunction(easing);
                }
            }
        };
    }, {}], 9: [function (require, module, exports) {
        module.exports = function (x, y) {
            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].updatePosition();
                }
            }
        };
    }, {}], 10: [function (require, module, exports) {
        function createDefaultScrollbar(direction, interactive, type) {
            var scrollbar = document.createElement('div'),
                indicator = document.createElement('div');

            if (type === true) {
                scrollbar.style.cssText = 'position:absolute;z-index:9999';
                indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
            }

            indicator.className = 'iScrollIndicator';

            if (direction == 'h') {
                if (type === true) {
                    scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
                    indicator.style.height = '100%';
                }
                scrollbar.className = 'iScrollHorizontalScrollbar';
            } else {
                if (type === true) {
                    scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
                    indicator.style.width = '100%';
                }
                scrollbar.className = 'iScrollVerticalScrollbar';
            }

            scrollbar.style.cssText += ';overflow:hidden';

            if (!interactive) {
                scrollbar.style.pointerEvents = 'none';
            }

            scrollbar.appendChild(indicator);

            return scrollbar;
        }

        var Indicator = function () {
            function Indicator(scroller, options) {
                _classCallCheck(this, Indicator);

                this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
                this.wrapperStyle = this.wrapper.style;
                this.indicator = this.wrapper.children[0];
                this.indicatorStyle = this.indicator.style;
                this.scroller = scroller;

                this.options = {
                    listenX: true,
                    listenY: true,
                    interactive: false,
                    resize: true,
                    defaultScrollbars: false,
                    shrink: false,
                    fade: false,
                    speedRatioX: 0,
                    speedRatioY: 0
                };

                for (var i in options) {
                    this.options[i] = options[i];
                }

                this.sizeRatioX = 1;
                this.sizeRatioY = 1;
                this.maxPosX = 0;
                this.maxPosY = 0;

                if (this.options.interactive) {
                    if (!this.options.disableTouch) {
                        utils.addEvent(this.indicator, 'touchstart', this);
                        utils.addEvent(window, 'touchend', this);
                    }
                    if (!this.options.disablePointer) {
                        utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                        utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
                    }
                    if (!this.options.disableMouse) {
                        utils.addEvent(this.indicator, 'mousedown', this);
                        utils.addEvent(window, 'mouseup', this);
                    }
                }

                if (this.options.fade) {
                    this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
                    this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
                    this.wrapperStyle.opacity = '0';
                }
            }

            _createClass(Indicator, [{
                key: "handleEvent",
                value: function handleEvent(e) {
                    switch (e.type) {
                        case 'touchstart':
                        case 'pointerdown':
                        case 'MSPointerDown':
                        case 'mousedown':
                            this._start(e);
                            break;
                        case 'touchmove':
                        case 'pointermove':
                        case 'MSPointerMove':
                        case 'mousemove':
                            this._move(e);
                            break;
                        case 'touchend':
                        case 'pointerup':
                        case 'MSPointerUp':
                        case 'mouseup':
                        case 'touchcancel':
                        case 'pointercancel':
                        case 'MSPointerCancel':
                        case 'mousecancel':
                            this._end(e);
                            break;
                    }
                }
            }, {
                key: "destroy",
                value: function destroy() {
                    if (this.options.interactive) {
                        utils.removeEvent(this.indicator, 'touchstart', this);
                        utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                        utils.removeEvent(this.indicator, 'mousedown', this);

                        utils.removeEvent(window, 'touchmove', this);
                        utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                        utils.removeEvent(window, 'mousemove', this);

                        utils.removeEvent(window, 'touchend', this);
                        utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
                        utils.removeEvent(window, 'mouseup', this);
                    }

                    if (this.options.defaultScrollbars) {
                        this.wrapper.parentNode.removeChild(this.wrapper);
                    }
                }
            }, {
                key: "_start",
                value: function _start(e) {
                    var point = e.touches ? e.touches[0] : e;

                    e.preventDefault();
                    e.stopPropagation();

                    this.transitionTime();

                    this.initiated = true;
                    this.moved = false;
                    this.lastPointX = point.pageX;
                    this.lastPointY = point.pageY;

                    this.startTime = utils.getTime();

                    if (!this.options.disableTouch) {
                        utils.addEvent(window, 'touchmove', this);
                    }
                    if (!this.options.disablePointer) {
                        utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
                    }
                    if (!this.options.disableMouse) {
                        utils.addEvent(window, 'mousemove', this);
                    }

                    this.scroller._execEvent('beforeScrollStart');
                }
            }, {
                key: "_move",
                value: function _move(e) {
                    var point = e.touches ? e.touches[0] : e,
                        deltaX,
                        deltaY,
                        newX,
                        newY,
                        timestamp = utils.getTime();

                    if (!this.moved) {
                        this.scroller._execEvent('scrollStart');
                    }

                    this.moved = true;

                    deltaX = point.pageX - this.lastPointX;
                    this.lastPointX = point.pageX;

                    deltaY = point.pageY - this.lastPointY;
                    this.lastPointY = point.pageY;

                    newX = this.x + deltaX;
                    newY = this.y + deltaY;

                    this._pos(newX, newY);

                    // INSERT POINT: indicator._move

                    e.preventDefault();
                    e.stopPropagation();
                }
            }, {
                key: "_end",
                value: function _end(e) {
                    if (!this.initiated) {
                        return;
                    }

                    this.initiated = false;

                    e.preventDefault();
                    e.stopPropagation();

                    utils.removeEvent(window, 'touchmove', this);
                    utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                    utils.removeEvent(window, 'mousemove', this);

                    if (this.scroller.options.snap) {
                        var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

                        var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.scroller.x - snap.x), 1000), Math.min(Math.abs(this.scroller.y - snap.y), 1000)), 300);

                        if (this.scroller.x != snap.x || this.scroller.y != snap.y) {
                            this.scroller.directionX = 0;
                            this.scroller.directionY = 0;
                            this.scroller.currentPage = snap;
                            this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
                        }
                    }

                    if (this.moved) {
                        this.scroller._execEvent('scrollEnd');
                    }
                }
            }, {
                key: "transitionTime",
                value: function transitionTime(time) {
                    time = time || 0;
                    this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

                    if (!time && utils.isBadAndroid) {
                        this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
                    }
                }
            }, {
                key: "transitionTimingFunction",
                value: function transitionTimingFunction(easing) {
                    this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
                }
            }, {
                key: "refresh",
                value: function refresh() {
                    this.transitionTime();

                    if (this.options.listenX && !this.options.listenY) {
                        this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
                    } else if (this.options.listenY && !this.options.listenX) {
                        this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
                    } else {
                        this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
                    }

                    if (this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll) {
                        utils.addClass(this.wrapper, 'iScrollBothScrollbars');
                        utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

                        if (this.options.defaultScrollbars && this.options.customStyle) {
                            if (this.options.listenX) {
                                this.wrapper.style.right = '8px';
                            } else {
                                this.wrapper.style.bottom = '8px';
                            }
                        }
                    } else {
                        utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
                        utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

                        if (this.options.defaultScrollbars && this.options.customStyle) {
                            if (this.options.listenX) {
                                this.wrapper.style.right = '2px';
                            } else {
                                this.wrapper.style.bottom = '2px';
                            }
                        }
                    }

                    var r = this.wrapper.offsetHeight; // force refresh

                    if (this.options.listenX) {
                        this.wrapperWidth = this.wrapper.clientWidth;
                        if (this.options.resize) {
                            this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
                            this.indicatorStyle.width = this.indicatorWidth + 'px';
                        } else {
                            this.indicatorWidth = this.indicator.clientWidth;
                        }

                        this.maxPosX = this.wrapperWidth - this.indicatorWidth;

                        if (this.options.shrink == 'clip') {
                            this.minBoundaryX = -this.indicatorWidth + 8;
                            this.maxBoundaryX = this.wrapperWidth - 8;
                        } else {
                            this.minBoundaryX = 0;
                            this.maxBoundaryX = this.maxPosX;
                        }

                        this.sizeRatioX = this.options.speedRatioX || this.scroller.maxScrollX && this.maxPosX / this.scroller.maxScrollX;
                    }

                    if (this.options.listenY) {
                        this.wrapperHeight = this.wrapper.clientHeight;
                        if (this.options.resize) {
                            this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
                            this.indicatorStyle.height = this.indicatorHeight + 'px';
                        } else {
                            this.indicatorHeight = this.indicator.clientHeight;
                        }

                        this.maxPosY = this.wrapperHeight - this.indicatorHeight;

                        if (this.options.shrink == 'clip') {
                            this.minBoundaryY = -this.indicatorHeight + 8;
                            this.maxBoundaryY = this.wrapperHeight - 8;
                        } else {
                            this.minBoundaryY = 0;
                            this.maxBoundaryY = this.maxPosY;
                        }

                        this.maxPosY = this.wrapperHeight - this.indicatorHeight;
                        this.sizeRatioY = this.options.speedRatioY || this.scroller.maxScrollY && this.maxPosY / this.scroller.maxScrollY;
                    }

                    this.updatePosition();
                }
            }, {
                key: "updatePosition",
                value: function updatePosition() {
                    var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
                        y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

                    if (!this.options.ignoreBoundaries) {
                        if (x < this.minBoundaryX) {
                            if (this.options.shrink == 'scale') {
                                this.width = Math.max(this.indicatorWidth + x, 8);
                                this.indicatorStyle.width = this.width + 'px';
                            }
                            x = this.minBoundaryX;
                        } else if (x > this.maxBoundaryX) {
                            if (this.options.shrink == 'scale') {
                                this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
                                this.indicatorStyle.width = this.width + 'px';
                                x = this.maxPosX + this.indicatorWidth - this.width;
                            } else {
                                x = this.maxBoundaryX;
                            }
                        } else if (this.options.shrink == 'scale' && this.width != this.indicatorWidth) {
                            this.width = this.indicatorWidth;
                            this.indicatorStyle.width = this.width + 'px';
                        }

                        if (y < this.minBoundaryY) {
                            if (this.options.shrink == 'scale') {
                                this.height = Math.max(this.indicatorHeight + y * 3, 8);
                                this.indicatorStyle.height = this.height + 'px';
                            }
                            y = this.minBoundaryY;
                        } else if (y > this.maxBoundaryY) {
                            if (this.options.shrink == 'scale') {
                                this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
                                this.indicatorStyle.height = this.height + 'px';
                                y = this.maxPosY + this.indicatorHeight - this.height;
                            } else {
                                y = this.maxBoundaryY;
                            }
                        } else if (this.options.shrink == 'scale' && this.height != this.indicatorHeight) {
                            this.height = this.indicatorHeight;
                            this.indicatorStyle.height = this.height + 'px';
                        }
                    }

                    this.x = x;
                    this.y = y;

                    if (this.scroller.options.useTransform) {
                        this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
                    } else {
                        this.indicatorStyle.left = x + 'px';
                        this.indicatorStyle.top = y + 'px';
                    }
                }
            }, {
                key: "_pos",
                value: function _pos(x, y) {
                    if (x < 0) {
                        x = 0;
                    } else if (x > this.maxPosX) {
                        x = this.maxPosX;
                    }

                    if (y < 0) {
                        y = 0;
                    } else if (y > this.maxPosY) {
                        y = this.maxPosY;
                    }

                    x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
                    y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

                    this.scroller.scrollTo(x, y);
                }
            }, {
                key: "fade",
                value: function fade(val, hold) {
                    if (hold && !this.visible) {
                        return;
                    }

                    clearTimeout(this.fadeTimeout);
                    this.fadeTimeout = null;

                    var time = val ? 250 : 500,
                        delay = val ? 0 : 300;

                    val = val ? '1' : '0';

                    this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

                    this.fadeTimeout = setTimeout(function (val) {
                        this.wrapperStyle.opacity = val;
                        this.visible = +val;
                    }.bind(this, val), delay);
                }
            }]);

            return Indicator;
        }();

        ;
    }, {}], 11: [function (require, module, exports) {
        module.exports = {
            _initKeys: function _initKeys(e) {
                // default key bindings
                var keys = {
                    pageUp: 33,
                    pageDown: 34,
                    end: 35,
                    home: 36,
                    left: 37,
                    up: 38,
                    right: 39,
                    down: 40
                };
                var i;

                // if you give me characters I give you keycode
                if (_typeof(this.options.keyBindings) == 'object') {
                    for (i in this.options.keyBindings) {
                        if (typeof this.options.keyBindings[i] == 'string') {
                            this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
                        }
                    }
                } else {
                    this.options.keyBindings = {};
                }

                for (i in keys) {
                    this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
                }

                utils.addEvent(window, 'keydown', this);

                this.on('destroy', function () {
                    utils.removeEvent(window, 'keydown', this);
                });
            },

            _key: function _key(e) {
                if (!this.enabled) {
                    return;
                }

                var snap = this.options.snap,
                    // we are using this alot, better to cache it
                newX = snap ? this.currentPage.pageX : this.x,
                    newY = snap ? this.currentPage.pageY : this.y,
                    now = utils.getTime(),
                    prevTime = this.keyTime || 0,
                    acceleration = 0.250,
                    pos;

                if (this.options.useTransition && this.isInTransition) {
                    pos = this.getComputedPosition();

                    this._translate(Math.round(pos.x), Math.round(pos.y));
                    this.isInTransition = false;
                }

                this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

                switch (e.keyCode) {
                    case this.options.keyBindings.pageUp:
                        if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                            newX += snap ? 1 : this.wrapperWidth;
                        } else {
                            newY += snap ? 1 : this.wrapperHeight;
                        }
                        break;
                    case this.options.keyBindings.pageDown:
                        if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                            newX -= snap ? 1 : this.wrapperWidth;
                        } else {
                            newY -= snap ? 1 : this.wrapperHeight;
                        }
                        break;
                    case this.options.keyBindings.end:
                        newX = snap ? this.pages.length - 1 : this.maxScrollX;
                        newY = snap ? this.pages[0].length - 1 : this.maxScrollY;
                        break;
                    case this.options.keyBindings.home:
                        newX = 0;
                        newY = 0;
                        break;
                    case this.options.keyBindings.left:
                        newX += snap ? -1 : 5 + this.keyAcceleration >> 0;
                        break;
                    case this.options.keyBindings.up:
                        newY += snap ? 1 : 5 + this.keyAcceleration >> 0;
                        break;
                    case this.options.keyBindings.right:
                        newX -= snap ? -1 : 5 + this.keyAcceleration >> 0;
                        break;
                    case this.options.keyBindings.down:
                        newY -= snap ? 1 : 5 + this.keyAcceleration >> 0;
                        break;
                    default:
                        return;
                }

                if (snap) {
                    this.goToPage(newX, newY);
                    return;
                }

                if (newX > 0) {
                    newX = 0;
                    this.keyAcceleration = 0;
                } else if (newX < this.maxScrollX) {
                    newX = this.maxScrollX;
                    this.keyAcceleration = 0;
                }

                if (newY > 0) {
                    newY = 0;
                    this.keyAcceleration = 0;
                } else if (newY < this.maxScrollY) {
                    newY = this.maxScrollY;
                    this.keyAcceleration = 0;
                }

                this.scrollTo(newX, newY, 0);

                this.keyTime = now;
            }
        };
    }, {}], 12: [function (require, module, exports) {
        module.exports = {
            __end: function __end(newX, newY, time, easing) {
                if (this.options.snap) {
                    var snap = this._nearestSnap(newX, newY);
                    this.currentPage = snap;
                    time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(newX - snap.x), 1000), Math.min(Math.abs(newY - snap.y), 1000)), 300);
                    newX = snap.x;
                    newY = snap.y;

                    this.directionX = 0;
                    this.directionY = 0;
                    easing = this.options.bounceEasing;
                }

                return { newX: newX, newY: newY, time: time, easing: easing };
            }
        };
    }, {}], 13: [function (require, module, exports) {
        module.exports = function () {
            if (this.options.snap) {
                var snap = this._nearestSnap(this.x, this.y);
                if (this.x == snap.x && this.y == snap.y) {
                    return;
                }

                this.currentPage = snap;
                this.scrollTo(snap.x, snap.y);
            }
        };
    }, {}], 14: [function (require, module, exports) {
        module.exports = {
            _initSnap: function _initSnap() {
                this.currentPage = {};

                if (typeof this.options.snap == 'string') {
                    this.options.snap = this.scroller.querySelectorAll(this.options.snap);
                }

                this.on('refresh', function () {
                    var i = 0,
                        l,
                        m = 0,
                        n,
                        cx,
                        cy,
                        x = 0,
                        y,
                        stepX = this.options.snapStepX || this.wrapperWidth,
                        stepY = this.options.snapStepY || this.wrapperHeight,
                        el;

                    this.pages = [];

                    if (!this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight) {
                        return;
                    }

                    if (this.options.snap === true) {
                        cx = Math.round(stepX / 2);
                        cy = Math.round(stepY / 2);

                        while (x > -this.scrollerWidth) {
                            this.pages[i] = [];
                            l = 0;
                            y = 0;

                            while (y > -this.scrollerHeight) {
                                this.pages[i][l] = {
                                    x: Math.max(x, this.maxScrollX),
                                    y: Math.max(y, this.maxScrollY),
                                    width: stepX,
                                    height: stepY,
                                    cx: x - cx,
                                    cy: y - cy
                                };

                                y -= stepY;
                                l++;
                            }

                            x -= stepX;
                            i++;
                        }
                    } else {
                        el = this.options.snap;
                        l = el.length;
                        n = -1;

                        for (; i < l; i++) {
                            if (i === 0 || el[i].offsetLeft <= el[i - 1].offsetLeft) {
                                m = 0;
                                n++;
                            }

                            if (!this.pages[m]) {
                                this.pages[m] = [];
                            }

                            x = Math.max(-el[i].offsetLeft, this.maxScrollX);
                            y = Math.max(-el[i].offsetTop, this.maxScrollY);
                            cx = x - Math.round(el[i].offsetWidth / 2);
                            cy = y - Math.round(el[i].offsetHeight / 2);

                            this.pages[m][n] = {
                                x: x,
                                y: y,
                                width: el[i].offsetWidth,
                                height: el[i].offsetHeight,
                                cx: cx,
                                cy: cy
                            };

                            if (x > this.maxScrollX) {
                                m++;
                            }
                        }
                    }

                    this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

                    // Update snap threshold if needed
                    if (this.options.snapThreshold % 1 === 0) {
                        this.snapThresholdX = this.options.snapThreshold;
                        this.snapThresholdY = this.options.snapThreshold;
                    } else {
                        this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
                        this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
                    }
                });

                this.on('flick', function () {
                    var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.x - this.startX), 1000), Math.min(Math.abs(this.y - this.startY), 1000)), 300);

                    this.goToPage(this.currentPage.pageX + this.directionX, this.currentPage.pageY + this.directionY, time);
                });
            },

            _nearestSnap: function _nearestSnap(x, y) {
                if (!this.pages.length) {
                    return { x: 0, y: 0, pageX: 0, pageY: 0 };
                }

                var i = 0,
                    l = this.pages.length,
                    m = 0;

                // Check if we exceeded the snap threshold
                if (Math.abs(x - this.absStartX) < this.snapThresholdX && Math.abs(y - this.absStartY) < this.snapThresholdY) {
                    return this.currentPage;
                }

                if (x > 0) {
                    x = 0;
                } else if (x < this.maxScrollX) {
                    x = this.maxScrollX;
                }

                if (y > 0) {
                    y = 0;
                } else if (y < this.maxScrollY) {
                    y = this.maxScrollY;
                }

                for (; i < l; i++) {
                    if (x >= this.pages[i][0].cx) {
                        x = this.pages[i][0].x;
                        break;
                    }
                }

                l = this.pages[i].length;

                for (; m < l; m++) {
                    if (y >= this.pages[0][m].cy) {
                        y = this.pages[0][m].y;
                        break;
                    }
                }

                if (i == this.currentPage.pageX) {
                    i += this.directionX;

                    if (i < 0) {
                        i = 0;
                    } else if (i >= this.pages.length) {
                        i = this.pages.length - 1;
                    }

                    x = this.pages[i][0].x;
                }

                if (m == this.currentPage.pageY) {
                    m += this.directionY;

                    if (m < 0) {
                        m = 0;
                    } else if (m >= this.pages[0].length) {
                        m = this.pages[0].length - 1;
                    }

                    y = this.pages[0][m].y;
                }

                return {
                    x: x,
                    y: y,
                    pageX: i,
                    pageY: m
                };
            },

            goToPage: function goToPage(x, y, time, easing) {
                easing = easing || this.options.bounceEasing;

                if (x >= this.pages.length) {
                    x = this.pages.length - 1;
                } else if (x < 0) {
                    x = 0;
                }

                if (y >= this.pages[x].length) {
                    y = this.pages[x].length - 1;
                } else if (y < 0) {
                    y = 0;
                }

                var posX = this.pages[x][y].x,
                    posY = this.pages[x][y].y;

                time = time === undefined ? this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(posX - this.x), 1000), Math.min(Math.abs(posY - this.y), 1000)), 300) : time;

                this.currentPage = {
                    x: posX,
                    y: posY,
                    pageX: x,
                    pageY: y
                };

                this.scrollTo(posX, posY, time, easing);
            },

            next: function next(time, easing) {
                var x = this.currentPage.pageX,
                    y = this.currentPage.pageY;

                x++;

                if (x >= this.pages.length && this.hasVerticalScroll) {
                    x = 0;
                    y++;
                }

                this.goToPage(x, y, time, easing);
            },

            prev: function prev(time, easing) {
                var x = this.currentPage.pageX,
                    y = this.currentPage.pageY;

                x--;

                if (x < 0 && this.hasVerticalScroll) {
                    x = 0;
                    y--;
                }

                this.goToPage(x, y, time, easing);
            }
        };
    }, {}], 15: [function (require, module, exports) {
        module.exports = {
            rAF: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            },

            utils: function () {
                var me = {};

                var _elementStyle = document.createElement('div').style;
                var _vendor = function () {
                    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                        transform,
                        i = 0,
                        l = vendors.length;

                    for (; i < l; i++) {
                        transform = vendors[i] + 'ransform';
                        if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
                    }

                    return false;
                }();

                function _prefixStyle(style) {
                    if (_vendor === false) return false;
                    if (_vendor === '') return style;
                    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
                }

                me.getTime = Date.now || function getTime() {
                    return new Date().getTime();
                };

                me.extend = function (target, obj) {
                    for (var i in obj) {
                        target[i] = obj[i];
                    }
                };

                me.addEvent = function (el, type, fn, capture) {
                    el.addEventListener(type, fn, !!capture);
                };

                me.removeEvent = function (el, type, fn, capture) {
                    el.removeEventListener(type, fn, !!capture);
                };

                me.prefixPointerEvent = function (pointerEvent) {
                    return window.MSPointerEvent ? 'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10) : pointerEvent;
                };

                me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
                    var distance = current - start,
                        speed = Math.abs(distance) / time,
                        destination,
                        duration;

                    deceleration = deceleration === undefined ? 0.0006 : deceleration;

                    destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
                    duration = speed / deceleration;

                    if (destination < lowerMargin) {
                        destination = wrapperSize ? lowerMargin - wrapperSize / 2.5 * (speed / 8) : lowerMargin;
                        distance = Math.abs(destination - current);
                        duration = distance / speed;
                    } else if (destination > 0) {
                        destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                        distance = Math.abs(current) + destination;
                        duration = distance / speed;
                    }

                    return {
                        destination: Math.round(destination),
                        duration: duration
                    };
                };

                var _transform = _prefixStyle('transform');

                me.extend(me, {
                    hasTransform: _transform !== false,
                    hasPerspective: _prefixStyle('perspective') in _elementStyle,
                    hasTouch: 'ontouchstart' in window,
                    hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
                    hasTransition: _prefixStyle('transition') in _elementStyle
                });

                // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
                me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !/Chrome\/\d/.test(window.navigator.appVersion);

                me.extend(me.style = {}, {
                    transform: _transform,
                    transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
                    transitionDuration: _prefixStyle('transitionDuration'),
                    transitionDelay: _prefixStyle('transitionDelay'),
                    transformOrigin: _prefixStyle('transformOrigin')
                });

                me.hasClass = function (e, c) {
                    var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
                    return re.test(e.className);
                };

                me.addClass = function (e, c) {
                    if (me.hasClass(e, c)) {
                        return;
                    }

                    var newclass = e.className.split(' ');
                    newclass.push(c);
                    e.className = newclass.join(' ');
                };

                me.removeClass = function (e, c) {
                    if (!me.hasClass(e, c)) {
                        return;
                    }

                    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
                    e.className = e.className.replace(re, ' ');
                };

                me.offset = function (el) {
                    var left = -el.offsetLeft,
                        top = -el.offsetTop;

                    // jshint -W084
                    while (el = el.offsetParent) {
                        left -= el.offsetLeft;
                        top -= el.offsetTop;
                    }
                    // jshint +W084

                    return {
                        left: left,
                        top: top
                    };
                };

                me.preventDefaultException = function (el, exceptions) {
                    for (var i in exceptions) {
                        if (exceptions[i].test(el[i])) {
                            return true;
                        }
                    }

                    return false;
                };

                me.extend(me.eventType = {}, {
                    touchstart: 1,
                    touchmove: 1,
                    touchend: 1,

                    mousedown: 2,
                    mousemove: 2,
                    mouseup: 2,

                    pointerdown: 3,
                    pointermove: 3,
                    pointerup: 3,

                    MSPointerDown: 3,
                    MSPointerMove: 3,
                    MSPointerUp: 3
                });

                me.extend(me.ease = {}, {
                    quadratic: {
                        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fn: function fn(k) {
                            return k * (2 - k);
                        }
                    },
                    circular: {
                        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                        fn: function fn(k) {
                            return Math.sqrt(1 - --k * k);
                        }
                    },
                    back: {
                        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        fn: function fn(k) {
                            var b = 4;
                            return (k = k - 1) * k * ((b + 1) * k + b) + 1;
                        }
                    },
                    bounce: {
                        style: '',
                        fn: function fn(k) {
                            if ((k /= 1) < 1 / 2.75) {
                                return 7.5625 * k * k;
                            } else if (k < 2 / 2.75) {
                                return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
                            } else if (k < 2.5 / 2.75) {
                                return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
                            } else {
                                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
                            }
                        }
                    },
                    elastic: {
                        style: '',
                        fn: function fn(k) {
                            var f = 0.22,
                                e = 0.4;

                            if (k === 0) {
                                return 0;
                            }
                            if (k == 1) {
                                return 1;
                            }

                            return e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1;
                        }
                    }
                });

                me.tap = function (e, eventName) {
                    var ev = document.createEvent('Event');
                    ev.initEvent(eventName, true, true);
                    ev.pageX = e.pageX;
                    ev.pageY = e.pageY;
                    e.target.dispatchEvent(ev);
                };

                me.click = function (e) {
                    var target = e.target,
                        ev;

                    if (!/(SELECT|INPUT|TEXTAREA)/i.test(target.tagName)) {
                        ev = document.createEvent('MouseEvents');
                        ev.initMouseEvent('click', true, true, e.view, 1, target.screenX, target.screenY, target.clientX, target.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);

                        ev._constructed = true;
                        target.dispatchEvent(ev);
                    }
                };

                return me;
            }()
        };
    }, {}], 16: [function (require, module, exports) {
        module.exports = {
            _initWheel: function _initWheel() {
                utils.addEvent(this.wrapper, 'wheel', this);
                utils.addEvent(this.wrapper, 'mousewheel', this);
                utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

                this.on('destroy', function () {
                    utils.removeEvent(this.wrapper, 'wheel', this);
                    utils.removeEvent(this.wrapper, 'mousewheel', this);
                    utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
                });
            },

            _wheel: function _wheel(e) {
                if (!this.enabled) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                var wheelDeltaX,
                    wheelDeltaY,
                    newX,
                    newY,
                    that = this;

                if (this.wheelTimeout === undefined) {
                    that._execEvent('scrollStart');
                }

                // Execute the scrollEnd event after 400ms the wheel stopped scrolling
                clearTimeout(this.wheelTimeout);
                this.wheelTimeout = setTimeout(function () {
                    that._execEvent('scrollEnd');
                    that.wheelTimeout = undefined;
                }, 400);

                if ('deltaX' in e) {
                    if (e.deltaMode === 1) {
                        wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
                        wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
                    } else {
                        wheelDeltaX = -e.deltaX;
                        wheelDeltaY = -e.deltaY;
                    }
                } else if ('wheelDeltaX' in e) {
                    wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
                    wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
                } else if ('wheelDelta' in e) {
                    wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
                } else if ('detail' in e) {
                    wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
                } else {
                    return;
                }

                wheelDeltaX *= this.options.invertWheelDirection;
                wheelDeltaY *= this.options.invertWheelDirection;

                if (!this.hasVerticalScroll) {
                    wheelDeltaX = wheelDeltaY;
                    wheelDeltaY = 0;
                }

                if (this.options.snap) {
                    newX = this.currentPage.pageX;
                    newY = this.currentPage.pageY;

                    if (wheelDeltaX > 0) {
                        newX--;
                    } else if (wheelDeltaX < 0) {
                        newX++;
                    }

                    if (wheelDeltaY > 0) {
                        newY--;
                    } else if (wheelDeltaY < 0) {
                        newY++;
                    }

                    this.goToPage(newX, newY);

                    return;
                }

                newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
                newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

                if (newX > 0) {
                    newX = 0;
                } else if (newX < this.maxScrollX) {
                    newX = this.maxScrollX;
                }

                if (newY > 0) {
                    newY = 0;
                } else if (newY < this.maxScrollY) {
                    newY = this.maxScrollY;
                }

                this.scrollTo(newX, newY, 0);

                // INSERT POINT: _wheel
            }
        };
    }, {}] }, {}, [5]);