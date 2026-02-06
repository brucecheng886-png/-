var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
(function() {
  "use strict";
  var _Matrix_instances, initData_fn, _a, _matrix;
  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  var WILDCARD = "*";
  var EventEmitter = (
    /** @class */
    function() {
      function EventEmitter2() {
        this._events = {};
      }
      EventEmitter2.prototype.on = function(evt, callback, once) {
        if (!this._events[evt]) {
          this._events[evt] = [];
        }
        this._events[evt].push({
          callback,
          once: !!once
        });
        return this;
      };
      EventEmitter2.prototype.once = function(evt, callback) {
        return this.on(evt, callback, true);
      };
      EventEmitter2.prototype.emit = function(evt) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments[_i];
        }
        var events = this._events[evt] || [];
        var wildcardEvents = this._events[WILDCARD] || [];
        var doEmit = function(es) {
          var length = es.length;
          for (var i = 0; i < length; i++) {
            if (!es[i]) {
              continue;
            }
            var _a2 = es[i], callback = _a2.callback, once = _a2.once;
            if (once) {
              es.splice(i, 1);
              if (es.length === 0) {
                delete _this._events[evt];
              }
              length--;
              i--;
            }
            callback.apply(_this, args);
          }
        };
        doEmit(events);
        doEmit(wildcardEvents);
      };
      EventEmitter2.prototype.off = function(evt, callback) {
        if (!evt) {
          this._events = {};
        } else {
          if (!callback) {
            delete this._events[evt];
          } else {
            var events = this._events[evt] || [];
            var length_1 = events.length;
            for (var i = 0; i < length_1; i++) {
              if (events[i].callback === callback) {
                events.splice(i, 1);
                length_1--;
                i--;
              }
            }
            if (events.length === 0) {
              delete this._events[evt];
            }
          }
        }
        return this;
      };
      EventEmitter2.prototype.getEvents = function() {
        return this._events;
      };
      return EventEmitter2;
    }()
  );
  function doBFS(queue, visited, fn, navigator) {
    while (queue.length) {
      const node = queue.shift();
      const abort = fn(node);
      if (abort) {
        return true;
      }
      visited.add(node.id);
      navigator(node.id).forEach((n) => {
        if (!visited.has(n.id)) {
          visited.add(n.id);
          queue.push(n);
        }
      });
    }
    return false;
  }
  function doDFS$1(node, visited, fn, navigator) {
    const abort = fn(node);
    if (abort) {
      return true;
    }
    visited.add(node.id);
    for (const n of navigator(node.id)) {
      if (!visited.has(n.id)) {
        if (doDFS$1(n, visited, fn, navigator)) {
          return true;
        }
      }
    }
    return false;
  }
  const defaultFilter = () => true;
  class GraphView {
    constructor(options) {
      __publicField(this, "graph");
      __publicField(this, "nodeFilter");
      __publicField(this, "edgeFilter");
      // caches
      __publicField(this, "cacheEnabled");
      __publicField(this, "inEdgesMap", /* @__PURE__ */ new Map());
      __publicField(this, "outEdgesMap", /* @__PURE__ */ new Map());
      __publicField(this, "bothEdgesMap", /* @__PURE__ */ new Map());
      __publicField(this, "allNodesMap", /* @__PURE__ */ new Map());
      __publicField(this, "allEdgesMap", /* @__PURE__ */ new Map());
      /**
       * Clear all cache data. Therefore `getAllNodes()` will return `[]`.
       * If you want to disable caching, use `graphView.cacheEnabled = false` instead.
       */
      __publicField(this, "clearCache", () => {
        this.inEdgesMap.clear();
        this.outEdgesMap.clear();
        this.bothEdgesMap.clear();
        this.allNodesMap.clear();
        this.allEdgesMap.clear();
      });
      /**
       * Fully refresh all cache data to the current graph state.
       */
      __publicField(this, "refreshCache", () => {
        this.clearCache();
        this.updateCache(this.graph.getAllNodes().map((node) => node.id));
      });
      /**
       * Instead of a fully refreshment, this method partially update the cache data by specifying
       * involved(added, removed, updated) nodes. It's more efficient when handling small changes
       * on a large graph.
       */
      __publicField(this, "updateCache", (involvedNodeIds) => {
        const involvedEdgeIds = /* @__PURE__ */ new Set();
        involvedNodeIds.forEach((id) => {
          const oldEdgesSet = this.bothEdgesMap.get(id);
          if (oldEdgesSet) {
            oldEdgesSet.forEach((edge) => involvedEdgeIds.add(edge.id));
          }
          if (!this.hasNode(id)) {
            this.inEdgesMap.delete(id);
            this.outEdgesMap.delete(id);
            this.bothEdgesMap.delete(id);
            this.allNodesMap.delete(id);
          } else {
            const inEdges = this.graph.getRelatedEdges(id, "in").filter(this.edgeFilter);
            const outEdges = this.graph.getRelatedEdges(id, "out").filter(this.edgeFilter);
            const bothEdges = Array.from(/* @__PURE__ */ new Set([...inEdges, ...outEdges]));
            bothEdges.forEach((edge) => involvedEdgeIds.add(edge.id));
            this.inEdgesMap.set(id, inEdges);
            this.outEdgesMap.set(id, outEdges);
            this.bothEdgesMap.set(id, bothEdges);
            this.allNodesMap.set(id, this.graph.getNode(id));
          }
        });
        involvedEdgeIds.forEach((id) => {
          if (this.hasEdge(id)) {
            this.allEdgesMap.set(id, this.graph.getEdge(id));
          } else {
            this.allEdgesMap.delete(id);
          }
        });
      });
      __publicField(this, "handleGraphChanged", (event) => {
        const involvedNodeIds = /* @__PURE__ */ new Set();
        event.changes.forEach((change) => {
          switch (change.type) {
            case "NodeAdded":
              involvedNodeIds.add(change.value.id);
              break;
            case "NodeDataUpdated":
              involvedNodeIds.add(change.id);
              break;
            case "EdgeAdded":
              involvedNodeIds.add(change.value.source);
              involvedNodeIds.add(change.value.target);
              break;
            case "EdgeUpdated":
              if (change.propertyName === "source" || change.propertyName === "target") {
                involvedNodeIds.add(change.oldValue);
                involvedNodeIds.add(change.newValue);
              }
              break;
            case "EdgeDataUpdated":
              if (event.graph.hasEdge(change.id)) {
                const edge = event.graph.getEdge(change.id);
                involvedNodeIds.add(edge.source);
                involvedNodeIds.add(edge.target);
              }
              break;
            case "EdgeRemoved":
              involvedNodeIds.add(change.value.source);
              involvedNodeIds.add(change.value.target);
              break;
            case "NodeRemoved":
              involvedNodeIds.add(change.value.id);
              break;
          }
        });
        this.updateCache(involvedNodeIds);
      });
      this.graph = options.graph;
      const nodeFilter = options.nodeFilter || defaultFilter;
      const edgeFilter = options.edgeFilter || defaultFilter;
      this.nodeFilter = nodeFilter;
      this.edgeFilter = (edge) => {
        const { source, target } = this.graph.getEdgeDetail(edge.id);
        if (!nodeFilter(source) || !nodeFilter(target)) {
          return false;
        }
        return edgeFilter(edge, source, target);
      };
      if (options.cache === "auto") {
        this.cacheEnabled = true;
        this.startAutoCache();
      } else if (options.cache === "manual") {
        this.cacheEnabled = true;
      } else {
        this.cacheEnabled = false;
      }
    }
    startAutoCache() {
      this.refreshCache();
      this.graph.on("changed", this.handleGraphChanged);
    }
    stopAutoCache() {
      this.graph.off("changed", this.handleGraphChanged);
    }
    // ================= Node =================
    checkNodeExistence(id) {
      this.getNode(id);
    }
    hasNode(id) {
      if (!this.graph.hasNode(id))
        return false;
      const node = this.graph.getNode(id);
      return this.nodeFilter(node);
    }
    areNeighbors(firstNodeId, secondNodeId) {
      this.checkNodeExistence(firstNodeId);
      return this.getNeighbors(secondNodeId).some((neighbor) => neighbor.id === firstNodeId);
    }
    getNode(id) {
      const node = this.graph.getNode(id);
      if (!this.nodeFilter(node)) {
        throw new Error("Node not found for id: " + id);
      }
      return node;
    }
    getRelatedEdges(id, direction) {
      this.checkNodeExistence(id);
      if (this.cacheEnabled) {
        if (direction === "in") {
          return this.inEdgesMap.get(id);
        } else if (direction === "out") {
          return this.outEdgesMap.get(id);
        } else {
          return this.bothEdgesMap.get(id);
        }
      }
      const edges = this.graph.getRelatedEdges(id, direction);
      return edges.filter(this.edgeFilter);
    }
    getDegree(id, direction) {
      return this.getRelatedEdges(id, direction).length;
    }
    getSuccessors(id) {
      const outEdges = this.getRelatedEdges(id, "out");
      const targets = outEdges.map((edge) => this.getNode(edge.target));
      return Array.from(new Set(targets));
    }
    getPredecessors(id) {
      const inEdges = this.getRelatedEdges(id, "in");
      const sources = inEdges.map((edge) => this.getNode(edge.source));
      return Array.from(new Set(sources));
    }
    getNeighbors(id) {
      const predecessors = this.getPredecessors(id);
      const successors = this.getSuccessors(id);
      return Array.from(/* @__PURE__ */ new Set([...predecessors, ...successors]));
    }
    // ================= Edge =================
    hasEdge(id) {
      if (!this.graph.hasEdge(id))
        return false;
      const edge = this.graph.getEdge(id);
      return this.edgeFilter(edge);
    }
    getEdge(id) {
      const edge = this.graph.getEdge(id);
      if (!this.edgeFilter(edge)) {
        throw new Error("Edge not found for id: " + id);
      }
      return edge;
    }
    getEdgeDetail(id) {
      const edge = this.getEdge(id);
      return {
        edge,
        source: this.getNode(edge.source),
        target: this.getNode(edge.target)
      };
    }
    // ================= Tree =================
    hasTreeStructure(treeKey) {
      return this.graph.hasTreeStructure(treeKey);
    }
    getRoots(treeKey) {
      return this.graph.getRoots(treeKey).filter(this.nodeFilter);
    }
    getChildren(id, treeKey) {
      this.checkNodeExistence(id);
      return this.graph.getChildren(id, treeKey).filter(this.nodeFilter);
    }
    getParent(id, treeKey) {
      this.checkNodeExistence(id);
      const parent = this.graph.getParent(id, treeKey);
      if (!parent || !this.nodeFilter(parent))
        return null;
      return parent;
    }
    // ================= Graph =================
    getAllNodes() {
      if (this.cacheEnabled) {
        return Array.from(this.allNodesMap.values());
      }
      return this.graph.getAllNodes().filter(this.nodeFilter);
    }
    getAllEdges() {
      if (this.cacheEnabled) {
        return Array.from(this.allEdgesMap.values());
      }
      return this.graph.getAllEdges().filter(this.edgeFilter);
    }
    bfs(id, fn, direction = "out") {
      const navigator = {
        in: this.getPredecessors.bind(this),
        out: this.getSuccessors.bind(this),
        both: this.getNeighbors.bind(this)
      }[direction];
      doBFS([this.getNode(id)], /* @__PURE__ */ new Set(), fn, navigator);
    }
    dfs(id, fn, direction = "out") {
      const navigator = {
        in: this.getPredecessors.bind(this),
        out: this.getSuccessors.bind(this),
        both: this.getNeighbors.bind(this)
      }[direction];
      doDFS$1(this.getNode(id), /* @__PURE__ */ new Set(), fn, navigator);
    }
  }
  let Graph$8 = class Graph2 extends EventEmitter {
    /**
     * Create a new Graph instance.
     * @param options - The options to initialize a graph. See {@link GraphOptions}.
     *
     * ```ts
     * const graph = new Graph({
     *   // Optional, initial nodes.
     *   nodes: [
     *     // Each node has a unique ID.
     *     { id: 'A', foo: 1 },
     *     { id: 'B', foo: 1 },
     *   ],
     *   // Optional, initial edges.
     *   edges: [
     *     { id: 'C', source: 'B', target: 'B', weight: 1 },
     *   ],
     *   // Optional, called with a GraphChangedEvent.
     *   onChanged: (event) => {
     *     console.log(event);
     *   }
     * });
     * ```
     */
    constructor(options) {
      super();
      __publicField(this, "nodeMap", /* @__PURE__ */ new Map());
      __publicField(this, "edgeMap", /* @__PURE__ */ new Map());
      __publicField(this, "inEdgesMap", /* @__PURE__ */ new Map());
      __publicField(this, "outEdgesMap", /* @__PURE__ */ new Map());
      __publicField(this, "bothEdgesMap", /* @__PURE__ */ new Map());
      __publicField(this, "treeIndices", /* @__PURE__ */ new Map());
      __publicField(this, "changes", []);
      __publicField(this, "batchCount", 0);
      /**
       * This function is called with a {@link GraphChangedEvent} each time a graph change happened.
       *
       * `event.changes` contains all the graph changes in order since last `onChanged`.
       */
      __publicField(this, "onChanged", () => {
      });
      /**
       * Batch several graph changes into one.
       *
       * Make several changes, but dispatch only one ChangedEvent at the end of batch:
       * ```ts
       * graph.batch(() => {
       *   graph.addNodes([]);
       *   graph.addEdges([]);
       * });
       * ```
       *
       * Batches can be nested. Only the outermost batch will dispatch a ChangedEvent:
       * ```ts
       * graph.batch(() => {
       *   graph.addNodes([]);
       *   graph.batch(() => {
       *     graph.addEdges([]);
       *   });
       * });
       * ```
       */
      __publicField(this, "batch", (fn) => {
        this.batchCount += 1;
        fn();
        this.batchCount -= 1;
        if (!this.batchCount) {
          this.commit();
        }
      });
      if (!options)
        return;
      if (options.nodes)
        this.addNodes(options.nodes);
      if (options.edges)
        this.addEdges(options.edges);
      if (options.tree)
        this.addTree(options.tree);
      if (options.onChanged)
        this.onChanged = options.onChanged;
    }
    /**
     * Reset changes and dispatch a ChangedEvent.
     */
    commit() {
      const changes = this.changes;
      this.changes = [];
      const event = {
        graph: this,
        changes
      };
      this.emit("changed", event);
      this.onChanged(event);
    }
    /**
     * Reduce the number of ordered graph changes by dropping or merging unnecessary changes.
     *
     * For example, if we update a node and remove it in a batch:
     *
     * ```ts
     * graph.batch(() => {
     *   graph.updateNodeData('A', 'foo', 2);
     *   graph.removeNode('A');
     * });
     * ```
     *
     * We get 2 atomic graph changes like
     *
     * ```ts
     * [
     *   { type: 'NodeDataUpdated', id: 'A', propertyName: 'foo', oldValue: 1, newValue: 2 },
     *   { type: 'NodeRemoved', value: { id: 'A', data: { foo: 2 } },
     * ]
     * ```
     *
     * Since node 'A' has been removed, we actually have no need to handle with NodeDataUpdated change.
     *
     * `reduceChanges()` here helps us remove such changes.
     */
    reduceChanges(changes) {
      let mergedChanges = [];
      changes.forEach((change) => {
        switch (change.type) {
          case "NodeRemoved": {
            let isNewlyAdded = false;
            mergedChanges = mergedChanges.filter((pastChange) => {
              if (pastChange.type === "NodeAdded") {
                const sameId = pastChange.value.id === change.value.id;
                if (sameId) {
                  isNewlyAdded = true;
                }
                return !sameId;
              } else if (pastChange.type === "NodeDataUpdated") {
                return pastChange.id !== change.value.id;
              } else if (pastChange.type === "TreeStructureChanged") {
                return pastChange.nodeId !== change.value.id;
              }
              return true;
            });
            if (!isNewlyAdded) {
              mergedChanges.push(change);
            }
            break;
          }
          case "EdgeRemoved": {
            let isNewlyAdded = false;
            mergedChanges = mergedChanges.filter((pastChange) => {
              if (pastChange.type === "EdgeAdded") {
                const sameId = pastChange.value.id === change.value.id;
                if (sameId) {
                  isNewlyAdded = true;
                }
                return !sameId;
              } else if (pastChange.type === "EdgeDataUpdated" || pastChange.type === "EdgeUpdated") {
                return pastChange.id !== change.value.id;
              }
              return true;
            });
            if (!isNewlyAdded) {
              mergedChanges.push(change);
            }
            break;
          }
          case "NodeDataUpdated":
          case "EdgeDataUpdated":
          case "EdgeUpdated": {
            const index2 = mergedChanges.findIndex((pastChange) => {
              return pastChange.type === change.type && pastChange.id === change.id && (change.propertyName === void 0 || pastChange.propertyName === change.propertyName);
            });
            const existingChange = mergedChanges[index2];
            if (existingChange) {
              if (change.propertyName !== void 0) {
                existingChange.newValue = change.newValue;
              } else {
                mergedChanges.splice(index2, 1);
                mergedChanges.push(change);
              }
            } else {
              mergedChanges.push(change);
            }
            break;
          }
          case "TreeStructureDetached": {
            mergedChanges = mergedChanges.filter((pastChange) => {
              if (pastChange.type === "TreeStructureAttached") {
                return pastChange.treeKey !== change.treeKey;
              } else if (pastChange.type === "TreeStructureChanged") {
                return pastChange.treeKey !== change.treeKey;
              }
              return true;
            });
            mergedChanges.push(change);
            break;
          }
          case "TreeStructureChanged": {
            const existingChange = mergedChanges.find((pastChange) => {
              return pastChange.type === "TreeStructureChanged" && pastChange.treeKey === change.treeKey && pastChange.nodeId === change.nodeId;
            });
            if (existingChange) {
              existingChange.newParentId = change.newParentId;
            } else {
              mergedChanges.push(change);
            }
            break;
          }
          default:
            mergedChanges.push(change);
            break;
        }
      });
      return mergedChanges;
    }
    // ================= Node =================
    checkNodeExistence(id) {
      this.getNode(id);
    }
    /**
     * Check if a node exists in the graph.
     * @group NodeMethods
     */
    hasNode(id) {
      return this.nodeMap.has(id);
    }
    /**
     * Tell if two nodes are neighbors.
     * @group NodeMethods
     */
    areNeighbors(firstNodeId, secondNodeId) {
      return this.getNeighbors(secondNodeId).some((neighbor) => neighbor.id === firstNodeId);
    }
    /**
     * Get the node data with given ID.
     * @group NodeMethods
     */
    getNode(id) {
      const node = this.nodeMap.get(id);
      if (!node) {
        throw new Error("Node not found for id: " + id);
      }
      return node;
    }
    /**
     * Given a node ID, find all edges of the node.
     * @param id - ID of the node
     * @param direction - Edge direction, defaults to 'both'.
     * @group NodeMethods
     */
    getRelatedEdges(id, direction) {
      this.checkNodeExistence(id);
      if (direction === "in") {
        const inEdges = this.inEdgesMap.get(id);
        return Array.from(inEdges);
      } else if (direction === "out") {
        const outEdges = this.outEdgesMap.get(id);
        return Array.from(outEdges);
      } else {
        const bothEdges = this.bothEdgesMap.get(id);
        return Array.from(bothEdges);
      }
    }
    /**
     * Get the degree of the given node.
     * @group NodeMethods
     */
    getDegree(id, direction) {
      return this.getRelatedEdges(id, direction).length;
    }
    /**
     * Get all successors of the given node.
     */
    getSuccessors(id) {
      const outEdges = this.getRelatedEdges(id, "out");
      const targets = outEdges.map((edge) => this.getNode(edge.target));
      return Array.from(new Set(targets));
    }
    /**
     * Get all predecessors of the given node.
     */
    getPredecessors(id) {
      const inEdges = this.getRelatedEdges(id, "in");
      const sources = inEdges.map((edge) => this.getNode(edge.source));
      return Array.from(new Set(sources));
    }
    /**
     * Given a node ID, find its neighbors.
     * @param id - ID of the node
     * @group NodeMethods
     */
    getNeighbors(id) {
      const predecessors = this.getPredecessors(id);
      const successors = this.getSuccessors(id);
      return Array.from(/* @__PURE__ */ new Set([...predecessors, ...successors]));
    }
    doAddNode(node) {
      if (this.hasNode(node.id)) {
        throw new Error("Node already exists: " + node.id);
      }
      this.nodeMap.set(node.id, node);
      this.inEdgesMap.set(node.id, /* @__PURE__ */ new Set());
      this.outEdgesMap.set(node.id, /* @__PURE__ */ new Set());
      this.bothEdgesMap.set(node.id, /* @__PURE__ */ new Set());
      this.treeIndices.forEach((tree) => {
        tree.childrenMap.set(node.id, /* @__PURE__ */ new Set());
      });
      this.changes.push({ type: "NodeAdded", value: node });
    }
    /**
     * Add all nodes of the given array, or iterable, into the graph.
     * @group NodeMethods
     */
    addNodes(nodes) {
      this.batch(() => {
        for (const node of nodes) {
          this.doAddNode(node);
        }
      });
    }
    /**
     * Add a single node into the graph.
     * @group NodeMethods
     */
    addNode(node) {
      this.addNodes([node]);
    }
    doRemoveNode(id) {
      const node = this.getNode(id);
      const bothEdges = this.bothEdgesMap.get(id);
      bothEdges == null ? void 0 : bothEdges.forEach((edge) => this.doRemoveEdge(edge.id));
      this.nodeMap.delete(id);
      this.treeIndices.forEach((tree) => {
        var _a2, _b;
        (_a2 = tree.childrenMap.get(id)) == null ? void 0 : _a2.forEach((child) => {
          tree.parentMap.delete(child.id);
        });
        const parent = tree.parentMap.get(id);
        if (parent)
          (_b = tree.childrenMap.get(parent.id)) == null ? void 0 : _b.delete(node);
        tree.parentMap.delete(id);
        tree.childrenMap.delete(id);
      });
      this.bothEdgesMap.delete(id);
      this.inEdgesMap.delete(id);
      this.outEdgesMap.delete(id);
      this.changes.push({ type: "NodeRemoved", value: node });
    }
    /**
     * Remove nodes and their attached edges from the graph.
     * @group NodeMethods
     */
    removeNodes(idList) {
      this.batch(() => {
        idList.forEach((id) => this.doRemoveNode(id));
      });
    }
    /**
     * Remove a single node and its attached edges from the graph.
     * @group NodeMethods
     */
    removeNode(id) {
      this.removeNodes([id]);
    }
    updateNodeDataProperty(id, propertyName, value) {
      const node = this.getNode(id);
      this.batch(() => {
        const oldValue = node.data[propertyName];
        const newValue = value;
        node.data[propertyName] = newValue;
        this.changes.push({
          type: "NodeDataUpdated",
          id,
          propertyName,
          oldValue,
          newValue
        });
      });
    }
    /**
     * Like Object.assign, merge all properties of `path` to the node data.
     * @param id Node ID.
     * @param patch A data object to merge.
     */
    mergeNodeData(id, patch) {
      this.batch(() => {
        Object.entries(patch).forEach(([propertyName, value]) => {
          this.updateNodeDataProperty(id, propertyName, value);
        });
      });
    }
    updateNodeData(...args) {
      const id = args[0];
      const node = this.getNode(id);
      if (typeof args[1] === "string") {
        this.updateNodeDataProperty(id, args[1], args[2]);
        return;
      }
      let data;
      if (typeof args[1] === "function") {
        const update = args[1];
        data = update(node.data);
      } else if (typeof args[1] === "object") {
        data = args[1];
      }
      this.batch(() => {
        const oldValue = node.data;
        const newValue = data;
        node.data = data;
        this.changes.push({
          type: "NodeDataUpdated",
          id,
          oldValue,
          newValue
        });
      });
    }
    // ================= Edge =================
    checkEdgeExistence(id) {
      if (!this.hasEdge(id)) {
        throw new Error("Edge not found for id: " + id);
      }
    }
    /**
     * Check if an edge exists in the graph.
     * @group NodeMethods
     */
    hasEdge(id) {
      return this.edgeMap.has(id);
    }
    /**
     * Get the edge data with given ID.
     * @group EdgeMethods
     */
    getEdge(id) {
      this.checkEdgeExistence(id);
      return this.edgeMap.get(id);
    }
    /**
     * Get the edge, the source node, and the target node by an edge ID.
     * @group EdgeMethods
     */
    getEdgeDetail(id) {
      const edge = this.getEdge(id);
      return {
        edge,
        source: this.getNode(edge.source),
        target: this.getNode(edge.target)
      };
    }
    doAddEdge(edge) {
      if (this.hasEdge(edge.id)) {
        throw new Error("Edge already exists: " + edge.id);
      }
      this.checkNodeExistence(edge.source);
      this.checkNodeExistence(edge.target);
      this.edgeMap.set(edge.id, edge);
      const inEdges = this.inEdgesMap.get(edge.target);
      const outEdges = this.outEdgesMap.get(edge.source);
      const bothEdgesOfSource = this.bothEdgesMap.get(edge.source);
      const bothEdgesOfTarget = this.bothEdgesMap.get(edge.target);
      inEdges.add(edge);
      outEdges.add(edge);
      bothEdgesOfSource.add(edge);
      bothEdgesOfTarget.add(edge);
      this.changes.push({ type: "EdgeAdded", value: edge });
    }
    /**
     * Add all edges of the given iterable(an array, a set, etc.) into the graph.
     * @group EdgeMethods
     */
    addEdges(edges) {
      this.batch(() => {
        for (const edge of edges) {
          this.doAddEdge(edge);
        }
      });
    }
    /**
     * Add a single edge pointing from `source` to `target` into the graph.
     *
     * ```ts
     * graph.addNode({ id: 'NodeA' });
     * graph.addNode({ id: 'NodeB' });
     * graph.addEdge({ id: 'EdgeA', source: 'NodeA', target: 'NodeB' });
     * ```
     *
     * If `source` or `target` were not found in the current graph, it throws an Error.
     * @group EdgeMethods
     */
    addEdge(edge) {
      this.addEdges([edge]);
    }
    doRemoveEdge(id) {
      const edge = this.getEdge(id);
      const outEdges = this.outEdgesMap.get(edge.source);
      const inEdges = this.inEdgesMap.get(edge.target);
      const bothEdgesOfSource = this.bothEdgesMap.get(edge.source);
      const bothEdgesOfTarget = this.bothEdgesMap.get(edge.target);
      outEdges.delete(edge);
      inEdges.delete(edge);
      bothEdgesOfSource.delete(edge);
      bothEdgesOfTarget.delete(edge);
      this.edgeMap.delete(id);
      this.changes.push({ type: "EdgeRemoved", value: edge });
    }
    /**
     * Remove edges whose id was included in the given id list.
     * @group EdgeMethods
     */
    removeEdges(idList) {
      this.batch(() => {
        idList.forEach((id) => this.doRemoveEdge(id));
      });
    }
    /**
     * Remove a single edge of the given id.
     * @group EdgeMethods
     */
    removeEdge(id) {
      this.removeEdges([id]);
    }
    /**
     * Change the source of an edge. The source must be found in current graph.
     * @group EdgeMethods
     */
    updateEdgeSource(id, source) {
      const edge = this.getEdge(id);
      this.checkNodeExistence(source);
      const oldSource = edge.source;
      const newSource = source;
      this.outEdgesMap.get(oldSource).delete(edge);
      this.bothEdgesMap.get(oldSource).delete(edge);
      this.outEdgesMap.get(newSource).add(edge);
      this.bothEdgesMap.get(newSource).add(edge);
      edge.source = source;
      this.batch(() => {
        this.changes.push({
          type: "EdgeUpdated",
          id,
          propertyName: "source",
          oldValue: oldSource,
          newValue: newSource
        });
      });
    }
    /**
     * Change the target of an edge. The target must be found in current graph.
     * @group EdgeMethods
     */
    updateEdgeTarget(id, target) {
      const edge = this.getEdge(id);
      this.checkNodeExistence(target);
      const oldTarget = edge.target;
      const newTarget = target;
      this.inEdgesMap.get(oldTarget).delete(edge);
      this.bothEdgesMap.get(oldTarget).delete(edge);
      this.inEdgesMap.get(newTarget).add(edge);
      this.bothEdgesMap.get(newTarget).add(edge);
      edge.target = target;
      this.batch(() => {
        this.changes.push({
          type: "EdgeUpdated",
          id,
          propertyName: "target",
          oldValue: oldTarget,
          newValue: newTarget
        });
      });
    }
    updateEdgeDataProperty(id, propertyName, value) {
      const edge = this.getEdge(id);
      this.batch(() => {
        const oldValue = edge.data[propertyName];
        const newValue = value;
        edge.data[propertyName] = newValue;
        this.changes.push({
          type: "EdgeDataUpdated",
          id,
          propertyName,
          oldValue,
          newValue
        });
      });
    }
    updateEdgeData(...args) {
      const id = args[0];
      const edge = this.getEdge(id);
      if (typeof args[1] === "string") {
        this.updateEdgeDataProperty(id, args[1], args[2]);
        return;
      }
      let data;
      if (typeof args[1] === "function") {
        const update = args[1];
        data = update(edge.data);
      } else if (typeof args[1] === "object") {
        data = args[1];
      }
      this.batch(() => {
        const oldValue = edge.data;
        const newValue = data;
        edge.data = data;
        this.changes.push({
          type: "EdgeDataUpdated",
          id,
          oldValue,
          newValue
        });
      });
    }
    /**
     * @group EdgeMethods
     */
    mergeEdgeData(id, patch) {
      this.batch(() => {
        Object.entries(patch).forEach(([propertyName, value]) => {
          this.updateEdgeDataProperty(id, propertyName, value);
        });
      });
    }
    // ================= Tree =================
    checkTreeExistence(treeKey) {
      if (!this.hasTreeStructure(treeKey)) {
        throw new Error("Tree structure not found for treeKey: " + treeKey);
      }
    }
    hasTreeStructure(treeKey) {
      return this.treeIndices.has(treeKey);
    }
    /**
     * Attach a new tree structure representing the hierarchy of all nodes in the graph.
     * @param treeKey A unique key of the tree structure. You can attach multiple tree structures with different keys.
     *
     * ```ts
     * const graph = new Graph({
     *   nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
     * });
     * graph.attachTreeStructure('Inheritance');
     * graph.setParent(2, 1, 'Inheritance');
     * graph.setParent(3, 1, 'Inheritance');
     * graph.getRoots('Inheritance'); // [1]
     * graph.getChildren(1, 'Inheritance'); // [2,3]
     * ```
     * @group TreeMethods
     */
    attachTreeStructure(treeKey) {
      if (this.treeIndices.has(treeKey)) {
        return;
      }
      this.treeIndices.set(treeKey, {
        parentMap: /* @__PURE__ */ new Map(),
        childrenMap: /* @__PURE__ */ new Map()
      });
      this.batch(() => {
        this.changes.push({
          type: "TreeStructureAttached",
          treeKey
        });
      });
    }
    /**
     * Detach the tree structure of the given tree key from the graph.
     *
     * ```ts
     * graph.detachTreeStructure('Inheritance');
     * graph.getRoots('Inheritance'); // Error!
     * ```
     * @group TreeMethods
     */
    detachTreeStructure(treeKey) {
      this.checkTreeExistence(treeKey);
      this.treeIndices.delete(treeKey);
      this.batch(() => {
        this.changes.push({
          type: "TreeStructureDetached",
          treeKey
        });
      });
    }
    /**
     * Traverse the given tree data, add each node into the graph, then attach the tree structure.
     *
     * ```ts
     * graph.addTree({
     *   id: 1,
     *   children: [
     *     { id: 2 },
     *     { id: 3 },
     *   ],
     * }, 'Inheritance');
     * graph.getRoots('Inheritance'); // [1]
     * graph.getChildren(1, 'Inheritance'); // [2, 3]
     * graph.getAllNodes(); // [1, 2, 3]
     * graph.getAllEdges(); // []
     * ```
     * @group TreeMethods
     */
    addTree(tree, treeKey) {
      this.batch(() => {
        this.attachTreeStructure(treeKey);
        const nodes = [];
        const stack = Array.isArray(tree) ? tree : [tree];
        while (stack.length) {
          const node = stack.shift();
          nodes.push(node);
          if (node.children) {
            stack.push(...node.children);
          }
        }
        this.addNodes(nodes);
        nodes.forEach((parent) => {
          var _a2;
          (_a2 = parent.children) == null ? void 0 : _a2.forEach((child) => {
            this.setParent(child.id, parent.id, treeKey);
          });
        });
      });
    }
    /**
     * Get the root nodes of an attached tree structure.
     *
     * Consider a graph with the following tree structure attached:
     * ```
     * Tree structure:
     *    O     3
     *   / \    |
     *  1   2   4
     * ```
     * `graph.getRoots()` takes all nodes without a parent, therefore [0, 3] was returned.
     *
     * Newly added nodes are also unparented. So they are counted as roots.
     * ```ts
     * graph.addNode({ id: 5 });
     * graph.getRoots(); // [0, 3, 5]
     * ```
     *
     * Here is how the tree structure looks like:
     * ```
     * Tree structure:
     *    O     3  5
     *   / \    |
     *  1   2   4
     * ```
     *
     * By setting a parent, a root node no more be a root.
     * ```ts
     * graph.setParent(5, 2);
     * graph.getRoots(); // [0, 3]
     * ```
     *
     * The tree structure now becomes:
     * ```
     * Tree structure:
     *    O     3
     *   / \    |
     *  1   2   4
     *      |
     *      5
     * ```
     *
     * Removing a node forces its children to be unparented, or roots.
     * ```ts
     * graph.removeNode(0);
     * graph.getRoots(); // [1, 2, 3]
     * ```
     *
     * You might draw the the structure as follow:
     * ```
     * Tree structure:
     *  1   2  3
     *      |  |
     *      5  4
     * ```
     * @group TreeMethods
     */
    getRoots(treeKey) {
      this.checkTreeExistence(treeKey);
      return this.getAllNodes().filter((node) => !this.getParent(node.id, treeKey));
    }
    /**
     * Given a node ID and an optional tree key, get the children of the node in the specified tree structure.
     * @group TreeMethods
     */
    getChildren(id, treeKey) {
      this.checkNodeExistence(id);
      this.checkTreeExistence(treeKey);
      const tree = this.treeIndices.get(treeKey);
      const children = tree.childrenMap.get(id);
      return Array.from(children || []);
    }
    /**
     * Given a node ID and an optional tree key, get the parent of the node in the specified tree structure.
     * If the given node is one of the tree roots, this returns null.
     * @group TreeMethods
     */
    getParent(id, treeKey) {
      this.checkNodeExistence(id);
      this.checkTreeExistence(treeKey);
      const tree = this.treeIndices.get(treeKey);
      return tree.parentMap.get(id) || null;
    }
    /**
     * Returns an array of all the ancestor nodes, staring from the parent to the root.
     */
    getAncestors(id, treeKey) {
      const ancestors = [];
      let current = this.getNode(id);
      let parent;
      while (parent = this.getParent(current.id, treeKey)) {
        ancestors.push(parent);
        current = parent;
      }
      return ancestors;
    }
    /**
     * Set node parent. If this operation causes a circle, it fails with an error.
     * @param id - ID of the child node.
     * @param parent - ID of the parent node. If it is undefined or null, means unset parent for node with id.
     * @param treeKey - Which tree structure the relation is applied to.
     * @group TreeMethods
     */
    setParent(id, parent, treeKey) {
      var _a2, _b;
      this.checkTreeExistence(treeKey);
      const tree = this.treeIndices.get(treeKey);
      if (!tree)
        return;
      const node = this.getNode(id);
      const oldParent = tree.parentMap.get(id);
      if ((oldParent == null ? void 0 : oldParent.id) === parent)
        return;
      if (parent === void 0 || parent === null) {
        if (oldParent) {
          (_a2 = tree.childrenMap.get(oldParent.id)) == null ? void 0 : _a2.delete(node);
        }
        tree.parentMap.delete(id);
        return;
      }
      const newParent = this.getNode(parent);
      tree.parentMap.set(id, newParent);
      if (oldParent) {
        (_b = tree.childrenMap.get(oldParent.id)) == null ? void 0 : _b.delete(node);
      }
      let children = tree.childrenMap.get(newParent.id);
      if (!children) {
        children = /* @__PURE__ */ new Set();
        tree.childrenMap.set(newParent.id, children);
      }
      children.add(node);
      this.batch(() => {
        this.changes.push({
          type: "TreeStructureChanged",
          treeKey,
          nodeId: id,
          oldParentId: oldParent == null ? void 0 : oldParent.id,
          newParentId: newParent.id
        });
      });
    }
    dfsTree(id, fn, treeKey) {
      const navigator = (nodeId) => this.getChildren(nodeId, treeKey);
      return doDFS$1(this.getNode(id), /* @__PURE__ */ new Set(), fn, navigator);
    }
    bfsTree(id, fn, treeKey) {
      const navigator = (nodeId) => this.getChildren(nodeId, treeKey);
      return doBFS([this.getNode(id)], /* @__PURE__ */ new Set(), fn, navigator);
    }
    // ================= Graph =================
    /**
     * Get all nodes in the graph as an array.
     */
    getAllNodes() {
      return Array.from(this.nodeMap.values());
    }
    /**
     * Get all edges in the graph as an array.
     */
    getAllEdges() {
      return Array.from(this.edgeMap.values());
    }
    bfs(id, fn, direction = "out") {
      const navigator = {
        in: this.getPredecessors.bind(this),
        out: this.getSuccessors.bind(this),
        both: this.getNeighbors.bind(this)
      }[direction];
      return doBFS([this.getNode(id)], /* @__PURE__ */ new Set(), fn, navigator);
    }
    dfs(id, fn, direction = "out") {
      const navigator = {
        in: this.getPredecessors.bind(this),
        out: this.getSuccessors.bind(this),
        both: this.getNeighbors.bind(this)
      }[direction];
      return doDFS$1(this.getNode(id), /* @__PURE__ */ new Set(), fn, navigator);
    }
    clone() {
      const newNodes = this.getAllNodes().map((oldNode) => {
        return { ...oldNode, data: { ...oldNode.data } };
      });
      const newEdges = this.getAllEdges().map((oldEdge) => {
        return { ...oldEdge, data: { ...oldEdge.data } };
      });
      const newGraph = new Graph2({
        nodes: newNodes,
        edges: newEdges
      });
      this.treeIndices.forEach(({ parentMap: oldParentMap, childrenMap: oldChildrenMap }, treeKey) => {
        const parentMap = /* @__PURE__ */ new Map();
        oldParentMap.forEach((parent, key) => {
          parentMap.set(key, newGraph.getNode(parent.id));
        });
        const childrenMap = /* @__PURE__ */ new Map();
        oldChildrenMap.forEach((children, key) => {
          childrenMap.set(key, new Set(Array.from(children).map((n) => newGraph.getNode(n.id))));
        });
        newGraph.treeIndices.set(treeKey, {
          parentMap,
          childrenMap
        });
      });
      return newGraph;
    }
    toJSON() {
      return JSON.stringify({
        nodes: this.getAllNodes(),
        edges: this.getAllEdges()
        // FIXME: And tree structures?
      });
    }
    createView(options) {
      return new GraphView({
        graph: this,
        ...options
      });
    }
  };
  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   */
  const proxyMarker = Symbol("Comlink.proxy");
  const createEndpoint = Symbol("Comlink.endpoint");
  const releaseProxy = Symbol("Comlink.releaseProxy");
  const finalizer = Symbol("Comlink.finalizer");
  const throwMarker = Symbol("Comlink.thrown");
  const isObject$1 = (val) => typeof val === "object" && val !== null || typeof val === "function";
  const proxyTransferHandler = {
    canHandle: (val) => isObject$1(val) && val[proxyMarker],
    serialize(obj2) {
      const { port1, port2 } = new MessageChannel();
      expose(obj2, port1);
      return [port2, [port2]];
    },
    deserialize(port) {
      port.start();
      return wrap$1(port);
    }
  };
  const throwTransferHandler = {
    canHandle: (value) => isObject$1(value) && throwMarker in value,
    serialize({ value }) {
      let serialized;
      if (value instanceof Error) {
        serialized = {
          isError: true,
          value: {
            message: value.message,
            name: value.name,
            stack: value.stack
          }
        };
      } else {
        serialized = { isError: false, value };
      }
      return [serialized, []];
    },
    deserialize(serialized) {
      if (serialized.isError) {
        throw Object.assign(new Error(serialized.value.message), serialized.value);
      }
      throw serialized.value;
    }
  };
  const transferHandlers = /* @__PURE__ */ new Map([
    ["proxy", proxyTransferHandler],
    ["throw", throwTransferHandler]
  ]);
  function isAllowedOrigin(allowedOrigins, origin) {
    for (const allowedOrigin of allowedOrigins) {
      if (origin === allowedOrigin || allowedOrigin === "*") {
        return true;
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return true;
      }
    }
    return false;
  }
  function expose(obj2, ep = globalThis, allowedOrigins = ["*"]) {
    ep.addEventListener("message", function callback(ev) {
      if (!ev || !ev.data) {
        return;
      }
      if (!isAllowedOrigin(allowedOrigins, ev.origin)) {
        console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);
        return;
      }
      const { id, type, path } = Object.assign({ path: [] }, ev.data);
      const argumentList = (ev.data.argumentList || []).map(fromWireValue);
      let returnValue;
      try {
        const parent = path.slice(0, -1).reduce((obj3, prop) => obj3[prop], obj2);
        const rawValue = path.reduce((obj3, prop) => obj3[prop], obj2);
        switch (type) {
          case "GET":
            {
              returnValue = rawValue;
            }
            break;
          case "SET":
            {
              parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
              returnValue = true;
            }
            break;
          case "APPLY":
            {
              returnValue = rawValue.apply(parent, argumentList);
            }
            break;
          case "CONSTRUCT":
            {
              const value = new rawValue(...argumentList);
              returnValue = proxy(value);
            }
            break;
          case "ENDPOINT":
            {
              const { port1, port2 } = new MessageChannel();
              expose(obj2, port2);
              returnValue = transfer(port1, [port1]);
            }
            break;
          case "RELEASE":
            {
              returnValue = void 0;
            }
            break;
          default:
            return;
        }
      } catch (value) {
        returnValue = { value, [throwMarker]: 0 };
      }
      Promise.resolve(returnValue).catch((value) => {
        return { value, [throwMarker]: 0 };
      }).then((returnValue2) => {
        const [wireValue, transferables] = toWireValue(returnValue2);
        ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
        if (type === "RELEASE") {
          ep.removeEventListener("message", callback);
          closeEndPoint(ep);
          if (finalizer in obj2 && typeof obj2[finalizer] === "function") {
            obj2[finalizer]();
          }
        }
      }).catch((error) => {
        const [wireValue, transferables] = toWireValue({
          value: new TypeError("Unserializable return value"),
          [throwMarker]: 0
        });
        ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
      });
    });
    if (ep.start) {
      ep.start();
    }
  }
  function isMessagePort(endpoint) {
    return endpoint.constructor.name === "MessagePort";
  }
  function closeEndPoint(endpoint) {
    if (isMessagePort(endpoint))
      endpoint.close();
  }
  function wrap$1(ep, target) {
    const pendingListeners = /* @__PURE__ */ new Map();
    ep.addEventListener("message", function handleMessage(ev) {
      const { data } = ev;
      if (!data || !data.id) {
        return;
      }
      const resolver = pendingListeners.get(data.id);
      if (!resolver) {
        return;
      }
      try {
        resolver(data);
      } finally {
        pendingListeners.delete(data.id);
      }
    });
    return createProxy(ep, pendingListeners, [], target);
  }
  function throwIfProxyReleased(isReleased) {
    if (isReleased) {
      throw new Error("Proxy has been released and is not useable");
    }
  }
  function releaseEndpoint(ep) {
    return requestResponseMessage(ep, /* @__PURE__ */ new Map(), {
      type: "RELEASE"
    }).then(() => {
      closeEndPoint(ep);
    });
  }
  const proxyCounter = /* @__PURE__ */ new WeakMap();
  const proxyFinalizers = "FinalizationRegistry" in globalThis && new FinalizationRegistry((ep) => {
    const newCount = (proxyCounter.get(ep) || 0) - 1;
    proxyCounter.set(ep, newCount);
    if (newCount === 0) {
      releaseEndpoint(ep);
    }
  });
  function registerProxy(proxy2, ep) {
    const newCount = (proxyCounter.get(ep) || 0) + 1;
    proxyCounter.set(ep, newCount);
    if (proxyFinalizers) {
      proxyFinalizers.register(proxy2, ep, proxy2);
    }
  }
  function unregisterProxy(proxy2) {
    if (proxyFinalizers) {
      proxyFinalizers.unregister(proxy2);
    }
  }
  function createProxy(ep, pendingListeners, path = [], target = function() {
  }) {
    let isProxyReleased = false;
    const proxy2 = new Proxy(target, {
      get(_target, prop) {
        throwIfProxyReleased(isProxyReleased);
        if (prop === releaseProxy) {
          return () => {
            unregisterProxy(proxy2);
            releaseEndpoint(ep);
            pendingListeners.clear();
            isProxyReleased = true;
          };
        }
        if (prop === "then") {
          if (path.length === 0) {
            return { then: () => proxy2 };
          }
          const r = requestResponseMessage(ep, pendingListeners, {
            type: "GET",
            path: path.map((p) => p.toString())
          }).then(fromWireValue);
          return r.then.bind(r);
        }
        return createProxy(ep, pendingListeners, [...path, prop]);
      },
      set(_target, prop, rawValue) {
        throwIfProxyReleased(isProxyReleased);
        const [value, transferables] = toWireValue(rawValue);
        return requestResponseMessage(ep, pendingListeners, {
          type: "SET",
          path: [...path, prop].map((p) => p.toString()),
          value
        }, transferables).then(fromWireValue);
      },
      apply(_target, _thisArg, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased);
        const last = path[path.length - 1];
        if (last === createEndpoint) {
          return requestResponseMessage(ep, pendingListeners, {
            type: "ENDPOINT"
          }).then(fromWireValue);
        }
        if (last === "bind") {
          return createProxy(ep, pendingListeners, path.slice(0, -1));
        }
        const [argumentList, transferables] = processArguments(rawArgumentList);
        return requestResponseMessage(ep, pendingListeners, {
          type: "APPLY",
          path: path.map((p) => p.toString()),
          argumentList
        }, transferables).then(fromWireValue);
      },
      construct(_target, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased);
        const [argumentList, transferables] = processArguments(rawArgumentList);
        return requestResponseMessage(ep, pendingListeners, {
          type: "CONSTRUCT",
          path: path.map((p) => p.toString()),
          argumentList
        }, transferables).then(fromWireValue);
      }
    });
    registerProxy(proxy2, ep);
    return proxy2;
  }
  function myFlat(arr) {
    return Array.prototype.concat.apply([], arr);
  }
  function processArguments(argumentList) {
    const processed = argumentList.map(toWireValue);
    return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
  }
  const transferCache = /* @__PURE__ */ new WeakMap();
  function transfer(obj2, transfers) {
    transferCache.set(obj2, transfers);
    return obj2;
  }
  function proxy(obj2) {
    return Object.assign(obj2, { [proxyMarker]: true });
  }
  function toWireValue(value) {
    for (const [name, handler] of transferHandlers) {
      if (handler.canHandle(value)) {
        const [serializedValue, transferables] = handler.serialize(value);
        return [
          {
            type: "HANDLER",
            name,
            value: serializedValue
          },
          transferables
        ];
      }
    }
    return [
      {
        type: "RAW",
        value
      },
      transferCache.get(value) || []
    ];
  }
  function fromWireValue(value) {
    switch (value.type) {
      case "HANDLER":
        return transferHandlers.get(value.name).deserialize(value.value);
      case "RAW":
        return value.value;
    }
  }
  function requestResponseMessage(ep, pendingListeners, msg, transfers) {
    return new Promise((resolve) => {
      const id = generateUUID();
      pendingListeners.set(id, resolve);
      if (ep.start) {
        ep.start();
      }
      ep.postMessage(Object.assign({ id }, msg), transfers);
    });
  }
  function generateUUID() {
    return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isNil(value) {
    return value === null || value === void 0;
  }
  function isArray$1(value) {
    return Array.isArray(value);
  }
  var isObject = function(value) {
    var type = typeof value;
    return value !== null && type === "object" || type === "function";
  };
  function each$1(elements, func) {
    if (!elements) {
      return;
    }
    var rst;
    if (isArray$1(elements)) {
      for (var i = 0, len = elements.length; i < len; i++) {
        rst = func(elements[i], i);
        if (rst === false) {
          break;
        }
      }
    } else if (isObject(elements)) {
      for (var k in elements) {
        if (elements.hasOwnProperty(k)) {
          rst = func(elements[k], k);
          if (rst === false) {
            break;
          }
        }
      }
    }
  }
  var isObjectLike = function(value) {
    return typeof value === "object" && value !== null;
  };
  var toString$1 = {}.toString;
  var isType = function(value, type) {
    return toString$1.call(value) === "[object " + type + "]";
  };
  var isPlainObject = function(value) {
    if (!isObjectLike(value) || !isType(value, "Object")) {
      return false;
    }
    if (Object.getPrototypeOf(value) === null) {
      return true;
    }
    var proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
  };
  function isString(value) {
    return typeof value === "string";
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  var clone$1 = function(obj2) {
    if (typeof obj2 !== "object" || obj2 === null) {
      return obj2;
    }
    var rst;
    if (isArray$1(obj2)) {
      rst = [];
      for (var i = 0, l = obj2.length; i < l; i++) {
        if (typeof obj2[i] === "object" && obj2[i] != null) {
          rst[i] = clone$1(obj2[i]);
        } else {
          rst[i] = obj2[i];
        }
      }
    } else {
      rst = {};
      for (var k in obj2) {
        if (typeof obj2[k] === "object" && obj2[k] != null) {
          rst[k] = clone$1(obj2[k]);
        } else {
          rst[k] = obj2[k];
        }
      }
    }
    return rst;
  };
  var MAX_MIX_LEVEL = 5;
  function hasOwn(object, property) {
    if (Object.hasOwn) {
      return Object.hasOwn(object, property);
    }
    if (object == null) {
      throw new TypeError("Cannot convert undefined or null to object");
    }
    return Object.prototype.hasOwnProperty.call(Object(object), property);
  }
  function _deepMix(dist, src, level, maxLevel) {
    level = level || 0;
    maxLevel = maxLevel || MAX_MIX_LEVEL;
    for (var key in src) {
      if (hasOwn(src, key)) {
        var value = src[key];
        if (value !== null && isPlainObject(value)) {
          if (!isPlainObject(dist[key])) {
            dist[key] = {};
          }
          if (level < maxLevel) {
            _deepMix(dist[key], value, level + 1, maxLevel);
          } else {
            dist[key] = src[key];
          }
        } else if (isArray$1(value)) {
          dist[key] = [];
          dist[key] = dist[key].concat(value);
        } else if (value !== void 0) {
          dist[key] = value;
        }
      }
    }
  }
  var deepMix = function(rst) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < args.length; i += 1) {
      _deepMix(rst, args[i]);
    }
    return rst;
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var pick = function(object, keys) {
    if (object === null || !isPlainObject(object)) {
      return {};
    }
    var result = {};
    each$1(keys, function(key) {
      if (hasOwnProperty.call(object, key)) {
        result[key] = object[key];
      }
    });
    return result;
  };
  const filterOutLinks$1 = (k, v) => {
    if (k !== "next" && k !== "prev") {
      return v;
    }
  };
  const unlink$1 = (entry) => {
    entry.prev.next = entry.next;
    entry.next.prev = entry.prev;
    delete entry.next;
    delete entry.prev;
  };
  let List$3 = class List {
    constructor() {
      const shortcut = {};
      shortcut.prev = shortcut;
      shortcut.next = shortcut.prev;
      this.shortcut = shortcut;
    }
    dequeue() {
      const shortcut = this.shortcut;
      const entry = shortcut.prev;
      if (entry && entry !== shortcut) {
        unlink$1(entry);
        return entry;
      }
    }
    enqueue(entry) {
      const shortcut = this.shortcut;
      if (entry.prev && entry.next) {
        unlink$1(entry);
      }
      entry.next = shortcut.next;
      shortcut.next.prev = entry;
      shortcut.next = entry;
      entry.prev = shortcut;
    }
    toString() {
      const strs = [];
      const sentinel = this.shortcut;
      let curr = sentinel.prev;
      while (curr !== sentinel) {
        strs.push(JSON.stringify(curr, filterOutLinks$1));
        curr = curr === null || curr === void 0 ? void 0 : curr.prev;
      }
      return `[${strs.join(", ")}]`;
    }
  };
  let List$2 = class List extends List$3 {
  };
  const DEFAULT_WEIGHT_FN$1 = () => 1;
  const greedyFAS$2 = (g, weightFn) => {
    var _a2;
    if (g.getAllNodes().length <= 1)
      return [];
    const state = buildState$1(g, weightFn || DEFAULT_WEIGHT_FN$1);
    const results = doGreedyFAS$1(state.graph, state.buckets, state.zeroIdx);
    return (_a2 = results.map((e) => g.getRelatedEdges(e.v, "out").filter(({ target }) => target === e.w))) === null || _a2 === void 0 ? void 0 : _a2.flat();
  };
  const doGreedyFAS$1 = (g, buckets, zeroIdx) => {
    let results = [];
    const sources = buckets[buckets.length - 1];
    const sinks = buckets[0];
    let entry;
    while (g.getAllNodes().length) {
      while (entry = sinks.dequeue()) {
        removeNode$1(g, buckets, zeroIdx, entry);
      }
      while (entry = sources.dequeue()) {
        removeNode$1(g, buckets, zeroIdx, entry);
      }
      if (g.getAllNodes().length) {
        for (let i = buckets.length - 2; i > 0; --i) {
          entry = buckets[i].dequeue();
          if (entry) {
            results = results.concat(removeNode$1(g, buckets, zeroIdx, entry, true));
            break;
          }
        }
      }
    }
    return results;
  };
  const removeNode$1 = (g, buckets, zeroIdx, entry, collectPredecessors) => {
    var _a2, _b;
    const results = [];
    if (g.hasNode(entry.v)) {
      (_a2 = g.getRelatedEdges(entry.v, "in")) === null || _a2 === void 0 ? void 0 : _a2.forEach((edge) => {
        const weight = edge.data.weight;
        const uEntry = g.getNode(edge.source);
        if (collectPredecessors) {
          results.push({ v: edge.source, w: edge.target, in: 0, out: 0 });
        }
        if (uEntry.data.out === void 0)
          uEntry.data.out = 0;
        uEntry.data.out -= weight;
        assignBucket$1(buckets, zeroIdx, Object.assign({ v: uEntry.id }, uEntry.data));
      });
      (_b = g.getRelatedEdges(entry.v, "out")) === null || _b === void 0 ? void 0 : _b.forEach((edge) => {
        const weight = edge.data.weight;
        const w = edge.target;
        const wEntry = g.getNode(w);
        if (wEntry.data.in === void 0)
          wEntry.data.in = 0;
        wEntry.data.in -= weight;
        assignBucket$1(buckets, zeroIdx, Object.assign({ v: wEntry.id }, wEntry.data));
      });
      g.removeNode(entry.v);
    }
    return collectPredecessors ? results : void 0;
  };
  const buildState$1 = (g, weightFn) => {
    const fasGraph = new Graph$8();
    let maxIn = 0;
    let maxOut = 0;
    g.getAllNodes().forEach((v) => {
      fasGraph.addNode({
        id: v.id,
        data: { v: v.id, in: 0, out: 0 }
      });
    });
    g.getAllEdges().forEach((e) => {
      const edge = fasGraph.getRelatedEdges(e.source, "out").find((edge2) => edge2.target === e.target);
      const weight = (weightFn === null || weightFn === void 0 ? void 0 : weightFn(e)) || 1;
      if (!edge) {
        fasGraph.addEdge({
          id: e.id,
          source: e.source,
          target: e.target,
          data: {
            weight
          }
        });
      } else {
        fasGraph.updateEdgeData(edge === null || edge === void 0 ? void 0 : edge.id, Object.assign(Object.assign({}, edge.data), { weight: edge.data.weight + weight }));
      }
      maxOut = Math.max(maxOut, fasGraph.getNode(e.source).data.out += weight);
      maxIn = Math.max(maxIn, fasGraph.getNode(e.target).data.in += weight);
    });
    const buckets = [];
    const rangeMax = maxOut + maxIn + 3;
    for (let i = 0; i < rangeMax; i++) {
      buckets.push(new List$2());
    }
    const zeroIdx = maxIn + 1;
    fasGraph.getAllNodes().forEach((v) => {
      assignBucket$1(buckets, zeroIdx, Object.assign({ v: v.id }, fasGraph.getNode(v.id).data));
    });
    return { buckets, zeroIdx, graph: fasGraph };
  };
  const assignBucket$1 = (buckets, zeroIdx, entry) => {
    if (!entry.out) {
      buckets[0].enqueue(entry);
    } else if (!entry["in"]) {
      buckets[buckets.length - 1].enqueue(entry);
    } else {
      buckets[entry.out - entry["in"] + zeroIdx].enqueue(entry);
    }
  };
  const run$5 = (g, acyclicer) => {
    const weightFn = (g2) => {
      return (e) => e.data.weight || 1;
    };
    const fas = greedyFAS$2(g, weightFn());
    fas === null || fas === void 0 ? void 0 : fas.forEach((e) => {
      const label = e.data;
      g.removeEdge(e.id);
      label.forwardName = e.data.name;
      label.reversed = true;
      g.addEdge({
        id: e.id,
        source: e.target,
        target: e.source,
        data: Object.assign({}, label)
      });
    });
  };
  const undo$5 = (g) => {
    g.getAllEdges().forEach((e) => {
      const label = e.data;
      if (label.reversed) {
        g.removeEdge(e.id);
        const forwardName = label.forwardName;
        delete label.reversed;
        delete label.forwardName;
        g.addEdge({
          id: e.id,
          source: e.target,
          target: e.source,
          data: Object.assign(Object.assign({}, label), { forwardName })
        });
      }
    });
  };
  const safeSort = (valueA, valueB) => {
    return Number(valueA) - Number(valueB);
  };
  const addDummyNode$1 = (g, type, data, name) => {
    let v;
    do {
      v = `${name}${Math.random()}`;
    } while (g.hasNode(v));
    data.dummy = type;
    g.addNode({
      id: v,
      data
    });
    return v;
  };
  const simplify$2 = (g) => {
    const simplified = new Graph$8();
    g.getAllNodes().forEach((v) => {
      simplified.addNode(Object.assign({}, v));
    });
    g.getAllEdges().forEach((e) => {
      const edge = simplified.getRelatedEdges(e.source, "out").find((edge2) => edge2.target === e.target);
      if (!edge) {
        simplified.addEdge({
          id: e.id,
          source: e.source,
          target: e.target,
          data: {
            weight: e.data.weight || 0,
            minlen: e.data.minlen || 1
          }
        });
      } else {
        simplified.updateEdgeData(edge === null || edge === void 0 ? void 0 : edge.id, Object.assign(Object.assign({}, edge.data), { weight: edge.data.weight + e.data.weight || 0, minlen: Math.max(edge.data.minlen, e.data.minlen || 1) }));
      }
    });
    return simplified;
  };
  const asNonCompoundGraph$1 = (g) => {
    const simplified = new Graph$8();
    g.getAllNodes().forEach((node) => {
      if (!g.getChildren(node.id).length) {
        simplified.addNode(Object.assign({}, node));
      }
    });
    g.getAllEdges().forEach((edge) => {
      simplified.addEdge(edge);
    });
    return simplified;
  };
  const zipObject = (keys, values) => {
    return keys === null || keys === void 0 ? void 0 : keys.reduce((obj2, key, i) => {
      obj2[key] = values[i];
      return obj2;
    }, {});
  };
  const intersectRect$1 = (rect, point) => {
    const x2 = Number(rect.x);
    const y2 = Number(rect.y);
    const dx = Number(point.x) - x2;
    const dy = Number(point.y) - y2;
    let w = Number(rect.width) / 2;
    let h = Number(rect.height) / 2;
    if (!dx && !dy) {
      return { x: 0, y: 0 };
    }
    let sx;
    let sy;
    if (Math.abs(dy) * w > Math.abs(dx) * h) {
      if (dy < 0) {
        h = -h;
      }
      sx = h * dx / dy;
      sy = h;
    } else {
      if (dx < 0) {
        w = -w;
      }
      sx = w;
      sy = w * dy / dx;
    }
    return { x: x2 + sx, y: y2 + sy };
  };
  const buildLayerMatrix$1 = (g) => {
    const layeringNodes = [];
    const rankMax = maxRank$1(g) + 1;
    for (let i = 0; i < rankMax; i++) {
      layeringNodes.push([]);
    }
    g.getAllNodes().forEach((node) => {
      const rank2 = node.data.rank;
      if (rank2 !== void 0 && layeringNodes[rank2]) {
        layeringNodes[rank2].push(node.id);
      }
    });
    for (let i = 0; i < rankMax; i++) {
      layeringNodes[i] = layeringNodes[i].sort((va, vb) => safeSort(g.getNode(va).data.order, g.getNode(vb).data.order));
    }
    return layeringNodes;
  };
  const normalizeRanks$2 = (g) => {
    const nodeRanks = g.getAllNodes().filter((v) => v.data.rank !== void 0).map((v) => v.data.rank);
    const min2 = Math.min(...nodeRanks);
    g.getAllNodes().forEach((v) => {
      if (v.data.hasOwnProperty("rank") && min2 !== Infinity) {
        v.data.rank -= min2;
      }
    });
  };
  const removeEmptyRanks$2 = (g, nodeRankFactor = 0) => {
    const nodes = g.getAllNodes();
    const nodeRanks = nodes.filter((v) => v.data.rank !== void 0).map((v) => v.data.rank);
    const offset = Math.min(...nodeRanks);
    const layers = [];
    nodes.forEach((v) => {
      const rank2 = (v.data.rank || 0) - offset;
      if (!layers[rank2]) {
        layers[rank2] = [];
      }
      layers[rank2].push(v.id);
    });
    let delta = 0;
    for (let i = 0; i < layers.length; i++) {
      const vs = layers[i];
      if (vs === void 0) {
        if (i % nodeRankFactor !== 0) {
          delta -= 1;
        }
      } else if (delta) {
        vs === null || vs === void 0 ? void 0 : vs.forEach((v) => {
          const node = g.getNode(v);
          if (node) {
            node.data.rank = node.data.rank || 0;
            node.data.rank += delta;
          }
        });
      }
    }
  };
  const addBorderNode$3 = (g, prefix, rank2, order2) => {
    const node = {
      width: 0,
      height: 0
    };
    if (isNumber(rank2) && isNumber(order2)) {
      node.rank = rank2;
      node.order = order2;
    }
    return addDummyNode$1(g, "border", node, prefix);
  };
  const maxRank$1 = (g) => {
    let maxRank2;
    g.getAllNodes().forEach((v) => {
      const rank2 = v.data.rank;
      if (rank2 !== void 0) {
        if (maxRank2 === void 0 || rank2 > maxRank2) {
          maxRank2 = rank2;
        }
      }
    });
    if (!maxRank2) {
      maxRank2 = 0;
    }
    return maxRank2;
  };
  const partition$1 = (collection, fn) => {
    const result = { lhs: [], rhs: [] };
    collection === null || collection === void 0 ? void 0 : collection.forEach((value) => {
      if (fn(value)) {
        result.lhs.push(value);
      } else {
        result.rhs.push(value);
      }
    });
    return result;
  };
  const minBy = (array, func) => {
    return array.reduce((a2, b) => {
      const valA = func(a2);
      const valB = func(b);
      return valA > valB ? b : a2;
    });
  };
  const doDFS = (graph2, node, postorder2, visited, navigator, result) => {
    if (!visited.includes(node.id)) {
      visited.push(node.id);
      if (!postorder2) {
        result.push(node.id);
      }
      navigator(node.id).forEach((n) => doDFS(graph2, n, postorder2, visited, navigator, result));
      if (postorder2) {
        result.push(node.id);
      }
    }
  };
  const dfs$2 = (graph2, node, order2, isDirected) => {
    const nodes = Array.isArray(node) ? node : [node];
    const navigator = (n) => graph2.getNeighbors(n);
    const results = [];
    const visited = [];
    nodes.forEach((node2) => {
      if (!graph2.hasNode(node2.id)) {
        throw new Error(`Graph does not have node: ${node2}`);
      } else {
        doDFS(graph2, node2, order2 === "post", visited, navigator, results);
      }
    });
    return results;
  };
  const addBorderSegments$2 = (g) => {
    const dfs2 = (v) => {
      const children = g.getChildren(v);
      const node = g.getNode(v);
      if (children === null || children === void 0 ? void 0 : children.length) {
        children.forEach((child) => dfs2(child.id));
      }
      if (node.data.hasOwnProperty("minRank")) {
        node.data.borderLeft = [];
        node.data.borderRight = [];
        for (let rank2 = node.data.minRank, maxRank2 = node.data.maxRank + 1; rank2 < maxRank2; rank2 += 1) {
          addBorderNode$2(g, "borderLeft", "_bl", v, node, rank2);
          addBorderNode$2(g, "borderRight", "_br", v, node, rank2);
        }
      }
    };
    g.getRoots().forEach((child) => dfs2(child.id));
  };
  const addBorderNode$2 = (g, prop, prefix, sg, sgNode, rank2) => {
    const label = { rank: rank2, borderType: prop, width: 0, height: 0 };
    const prev = sgNode.data[prop][rank2 - 1];
    const curr = addDummyNode$1(g, "border", label, prefix);
    sgNode.data[prop][rank2] = curr;
    g.setParent(curr, sg);
    if (prev) {
      g.addEdge({
        id: `e${Math.random()}`,
        source: prev,
        target: curr,
        data: { weight: 1 }
      });
    }
  };
  const adjust$1 = (g, rankdir) => {
    const rd = rankdir.toLowerCase();
    if (rd === "lr" || rd === "rl") {
      swapWidthHeight$1(g);
    }
  };
  const undo$4 = (g, rankdir) => {
    const rd = rankdir.toLowerCase();
    if (rd === "bt" || rd === "rl") {
      reverseY$1(g);
    }
    if (rd === "lr" || rd === "rl") {
      swapXY$1(g);
      swapWidthHeight$1(g);
    }
  };
  const swapWidthHeight$1 = (g) => {
    g.getAllNodes().forEach((v) => {
      swapWidthHeightOne$1(v);
    });
    g.getAllEdges().forEach((e) => {
      swapWidthHeightOne$1(e);
    });
  };
  const swapWidthHeightOne$1 = (node) => {
    const w = node.data.width;
    node.data.width = node.data.height;
    node.data.height = w;
  };
  const reverseY$1 = (g) => {
    g.getAllNodes().forEach((v) => {
      reverseYOne$1(v.data);
    });
    g.getAllEdges().forEach((edge) => {
      var _a2;
      (_a2 = edge.data.points) === null || _a2 === void 0 ? void 0 : _a2.forEach((point) => reverseYOne$1(point));
      if (edge.data.hasOwnProperty("y")) {
        reverseYOne$1(edge.data);
      }
    });
  };
  const reverseYOne$1 = (node) => {
    if (node === null || node === void 0 ? void 0 : node.y) {
      node.y = -node.y;
    }
  };
  const swapXY$1 = (g) => {
    g.getAllNodes().forEach((v) => {
      swapXYOne$1(v.data);
    });
    g.getAllEdges().forEach((edge) => {
      var _a2;
      (_a2 = edge.data.points) === null || _a2 === void 0 ? void 0 : _a2.forEach((point) => swapXYOne$1(point));
      if (edge.data.hasOwnProperty("x")) {
        swapXYOne$1(edge.data);
      }
    });
  };
  const swapXYOne$1 = (node) => {
    const x2 = node.x;
    node.x = node.y;
    node.y = x2;
  };
  const run$4 = (g) => {
    const root = addDummyNode$1(g, "root", {}, "_root");
    const depths = treeDepths$1(g);
    let maxDepth = Math.max(...Object.values(depths));
    if (Math.abs(maxDepth) === Infinity) {
      maxDepth = 1;
    }
    const height = maxDepth - 1;
    const nodeSep = 2 * height + 1;
    g.getAllEdges().forEach((e) => {
      e.data.minlen *= nodeSep;
    });
    const weight = sumWeights$1(g) + 1;
    g.getRoots().forEach((child) => {
      dfs$1(g, root, nodeSep, weight, height, depths, child.id);
    });
    return {
      nestingRoot: root,
      nodeRankFactor: nodeSep
    };
  };
  const dfs$1 = (g, root, nodeSep, weight, height, depths, v) => {
    const children = g.getChildren(v);
    if (!(children === null || children === void 0 ? void 0 : children.length)) {
      if (v !== root) {
        g.addEdge({
          id: `e${Math.random()}`,
          source: root,
          target: v,
          data: { weight: 0, minlen: nodeSep }
        });
      }
      return;
    }
    const top = addBorderNode$3(g, "_bt");
    const bottom = addBorderNode$3(g, "_bb");
    const label = g.getNode(v);
    g.setParent(top, v);
    label.data.borderTop = top;
    g.setParent(bottom, v);
    label.data.borderBottom = bottom;
    children === null || children === void 0 ? void 0 : children.forEach((childNode) => {
      dfs$1(g, root, nodeSep, weight, height, depths, childNode.id);
      const childTop = childNode.data.borderTop ? childNode.data.borderTop : childNode.id;
      const childBottom = childNode.data.borderBottom ? childNode.data.borderBottom : childNode.id;
      const thisWeight = childNode.data.borderTop ? weight : 2 * weight;
      const minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;
      g.addEdge({
        id: `e${Math.random()}`,
        source: top,
        target: childTop,
        data: {
          minlen,
          weight: thisWeight,
          nestingEdge: true
        }
      });
      g.addEdge({
        id: `e${Math.random()}`,
        source: childBottom,
        target: bottom,
        data: {
          minlen,
          weight: thisWeight,
          nestingEdge: true
        }
      });
    });
    if (!g.getParent(v)) {
      g.addEdge({
        id: `e${Math.random()}`,
        source: root,
        target: top,
        data: {
          weight: 0,
          minlen: height + depths[v]
        }
      });
    }
  };
  const treeDepths$1 = (g) => {
    const depths = {};
    const dfs2 = (v, depth) => {
      const children = g.getChildren(v);
      children === null || children === void 0 ? void 0 : children.forEach((child) => dfs2(child.id, depth + 1));
      depths[v] = depth;
    };
    g.getRoots().forEach((v) => dfs2(v.id, 1));
    return depths;
  };
  const sumWeights$1 = (g) => {
    let result = 0;
    g.getAllEdges().forEach((e) => {
      result += e.data.weight;
    });
    return result;
  };
  const cleanup$1 = (g, nestingRoot) => {
    if (nestingRoot) {
      g.removeNode(nestingRoot);
    }
    g.getAllEdges().forEach((e) => {
      if (e.data.nestingEdge) {
        g.removeEdge(e.id);
      }
    });
  };
  const DUMMY_NODE_EDGE = "edge";
  const DUMMY_NODE_EDGE_LABEL = "edge-label";
  const run$3 = (g, dummyChains) => {
    g.getAllEdges().forEach((edge) => normalizeEdge$1(g, edge, dummyChains));
  };
  const normalizeEdge$1 = (g, e, dummyChains) => {
    let v = e.source;
    let vRank = g.getNode(v).data.rank;
    const w = e.target;
    const wRank = g.getNode(w).data.rank;
    const labelRank = e.data.labelRank;
    if (wRank === vRank + 1)
      return;
    g.removeEdge(e.id);
    let dummy;
    let nodeData;
    let i;
    for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
      e.data.points = [];
      nodeData = {
        originalEdge: e,
        width: 0,
        height: 0,
        rank: vRank
      };
      dummy = addDummyNode$1(g, DUMMY_NODE_EDGE, nodeData, "_d");
      if (vRank === labelRank) {
        nodeData.width = e.data.width;
        nodeData.height = e.data.height;
        nodeData.dummy = DUMMY_NODE_EDGE_LABEL;
        nodeData.labelpos = e.data.labelpos;
      }
      g.addEdge({
        id: `e${Math.random()}`,
        source: v,
        target: dummy,
        data: { weight: e.data.weight }
      });
      if (i === 0) {
        dummyChains.push(dummy);
      }
      v = dummy;
    }
    g.addEdge({
      id: `e${Math.random()}`,
      source: v,
      target: w,
      data: { weight: e.data.weight }
    });
  };
  const undo$3 = (g, dummyChains) => {
    dummyChains.forEach((v) => {
      let node = g.getNode(v);
      const { data } = node;
      const originalEdge = data.originalEdge;
      let w;
      if (originalEdge) {
        g.addEdge(originalEdge);
      }
      let currentV = v;
      while (node.data.dummy) {
        w = g.getSuccessors(currentV)[0];
        g.removeNode(currentV);
        originalEdge.data.points.push({
          x: node.data.x,
          y: node.data.y
        });
        if (node.data.dummy === DUMMY_NODE_EDGE_LABEL) {
          originalEdge.data.x = node.data.x;
          originalEdge.data.y = node.data.y;
          originalEdge.data.width = node.data.width;
          originalEdge.data.height = node.data.height;
        }
        currentV = w.id;
        node = g.getNode(currentV);
      }
    });
  };
  const addSubgraphConstraints$2 = (g, cg, vs) => {
    const prev = {};
    let rootPrev;
    vs === null || vs === void 0 ? void 0 : vs.forEach((v) => {
      let child = g.getParent(v);
      let parent;
      let prevChild;
      while (child) {
        parent = g.getParent(child.id);
        if (parent) {
          prevChild = prev[parent.id];
          prev[parent.id] = child.id;
        } else {
          prevChild = rootPrev;
          rootPrev = child.id;
        }
        if (prevChild && prevChild !== child.id) {
          if (!cg.hasNode(prevChild)) {
            cg.addNode({
              id: prevChild,
              data: {}
            });
          }
          if (!cg.hasNode(child.id)) {
            cg.addNode({
              id: child.id,
              data: {}
            });
          }
          if (!cg.hasEdge(`e${prevChild}-${child.id}`)) {
            cg.addEdge({
              id: `e${prevChild}-${child.id}`,
              source: prevChild,
              target: child.id,
              data: {}
            });
          }
          return;
        }
        child = parent;
      }
    });
  };
  const buildLayerGraph$2 = (g, rank2, direction) => {
    const root = createRootNode$1(g);
    const result = new Graph$8({
      tree: [
        {
          id: root,
          children: [],
          data: {}
        }
      ]
    });
    g.getAllNodes().forEach((v) => {
      const parent = g.getParent(v.id);
      if (v.data.rank === rank2 || v.data.minRank <= rank2 && rank2 <= v.data.maxRank) {
        if (!result.hasNode(v.id)) {
          result.addNode(Object.assign({}, v));
        }
        if ((parent === null || parent === void 0 ? void 0 : parent.id) && !result.hasNode(parent === null || parent === void 0 ? void 0 : parent.id)) {
          result.addNode(Object.assign({}, parent));
        }
        result.setParent(v.id, (parent === null || parent === void 0 ? void 0 : parent.id) || root);
        g.getRelatedEdges(v.id, direction).forEach((e) => {
          const u = e.source === v.id ? e.target : e.source;
          if (!result.hasNode(u)) {
            result.addNode(Object.assign({}, g.getNode(u)));
          }
          const edge = result.getRelatedEdges(u, "out").find(({ target }) => target === v.id);
          const weight = edge !== void 0 ? edge.data.weight : 0;
          if (!edge) {
            result.addEdge({
              id: e.id,
              source: u,
              target: v.id,
              data: {
                weight: e.data.weight + weight
              }
            });
          } else {
            result.updateEdgeData(edge.id, Object.assign(Object.assign({}, edge.data), { weight: e.data.weight + weight }));
          }
        });
        if (v.data.hasOwnProperty("minRank")) {
          result.updateNodeData(v.id, Object.assign(Object.assign({}, v.data), { borderLeft: v.data.borderLeft[rank2], borderRight: v.data.borderRight[rank2] }));
        }
      }
    });
    return result;
  };
  const createRootNode$1 = (g) => {
    let v;
    while (g.hasNode(v = `_root${Math.random()}`))
      ;
    return v;
  };
  const twoLayerCrossCount$1 = (g, northLayer, southLayer) => {
    const southPos = zipObject(southLayer, southLayer.map((v, i) => i));
    const unflat = northLayer.map((v) => {
      const unsort = g.getRelatedEdges(v, "out").map((e) => {
        return { pos: southPos[e.target] || 0, weight: e.data.weight };
      });
      return unsort === null || unsort === void 0 ? void 0 : unsort.sort((a2, b) => a2.pos - b.pos);
    });
    const southEntries = unflat.flat().filter((entry) => entry !== void 0);
    let firstIndex = 1;
    while (firstIndex < southLayer.length)
      firstIndex <<= 1;
    const treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;
    const tree = Array(treeSize).fill(0, 0, treeSize);
    let cc = 0;
    southEntries === null || southEntries === void 0 ? void 0 : southEntries.forEach((entry) => {
      if (entry) {
        let index2 = entry.pos + firstIndex;
        tree[index2] += entry.weight;
        let weightSum = 0;
        while (index2 > 0) {
          if (index2 % 2) {
            weightSum += tree[index2 + 1];
          }
          index2 = index2 - 1 >> 1;
          tree[index2] += entry.weight;
        }
        cc += entry.weight * weightSum;
      }
    });
    return cc;
  };
  const crossCount$2 = (g, layering) => {
    let cc = 0;
    for (let i = 1; i < (layering === null || layering === void 0 ? void 0 : layering.length); i += 1) {
      cc += twoLayerCrossCount$1(g, layering[i - 1], layering[i]);
    }
    return cc;
  };
  const initOrder$2 = (g) => {
    const visited = {};
    const simpleNodes = g.getAllNodes();
    const nodeRanks = simpleNodes.map((v) => {
      var _a2;
      return (_a2 = v.data.rank) !== null && _a2 !== void 0 ? _a2 : -Infinity;
    });
    const maxRank2 = Math.max(...nodeRanks);
    const layers = [];
    for (let i = 0; i < maxRank2 + 1; i++) {
      layers.push([]);
    }
    const orderedVs = simpleNodes.sort((a2, b) => g.getNode(a2.id).data.rank - g.getNode(b.id).data.rank);
    const beforeSort = orderedVs.filter((n) => {
      return g.getNode(n.id).data.fixorder !== void 0;
    });
    const fixOrderNodes = beforeSort.sort((a2, b) => g.getNode(a2.id).data.fixorder - g.getNode(b.id).data.fixorder);
    fixOrderNodes === null || fixOrderNodes === void 0 ? void 0 : fixOrderNodes.forEach((n) => {
      if (!isNaN(g.getNode(n.id).data.rank)) {
        layers[g.getNode(n.id).data.rank].push(n.id);
      }
      visited[n.id] = true;
    });
    orderedVs === null || orderedVs === void 0 ? void 0 : orderedVs.forEach((n) => g.dfsTree(n.id, (node) => {
      if (visited.hasOwnProperty(node.id))
        return true;
      visited[node.id] = true;
      if (!isNaN(node.data.rank)) {
        layers[node.data.rank].push(node.id);
      }
    }));
    return layers;
  };
  const barycenter$2 = (g, movable) => {
    return movable.map((v) => {
      const inV = g.getRelatedEdges(v, "in");
      if (!(inV === null || inV === void 0 ? void 0 : inV.length)) {
        return { v };
      }
      const result = { sum: 0, weight: 0 };
      inV === null || inV === void 0 ? void 0 : inV.forEach((e) => {
        const nodeU = g.getNode(e.source);
        result.sum += e.data.weight * nodeU.data.order;
        result.weight += e.data.weight;
      });
      return {
        v,
        barycenter: result.sum / result.weight,
        weight: result.weight
      };
    });
  };
  const resolveConflicts$2 = (entries, cg) => {
    var _a2, _b, _c;
    const mappedEntries = {};
    entries === null || entries === void 0 ? void 0 : entries.forEach((entry, i) => {
      mappedEntries[entry.v] = {
        i,
        indegree: 0,
        in: [],
        out: [],
        vs: [entry.v]
      };
      const tmp = mappedEntries[entry.v];
      if (entry.barycenter !== void 0) {
        tmp.barycenter = entry.barycenter;
        tmp.weight = entry.weight;
      }
    });
    (_a2 = cg.getAllEdges()) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => {
      const entryV = mappedEntries[e.source];
      const entryW = mappedEntries[e.target];
      if (entryV !== void 0 && entryW !== void 0) {
        entryW.indegree++;
        entryV.out.push(mappedEntries[e.target]);
      }
    });
    const sourceSet = (_c = (_b = Object.values(mappedEntries)).filter) === null || _c === void 0 ? void 0 : _c.call(_b, (entry) => !entry.indegree);
    return doResolveConflicts$1(sourceSet);
  };
  const doResolveConflicts$1 = (sourceSet) => {
    var _a2, _b;
    const entries = [];
    const handleIn = (vEntry) => {
      return (uEntry) => {
        if (uEntry.merged)
          return;
        if (uEntry.barycenter === void 0 || vEntry.barycenter === void 0 || uEntry.barycenter >= vEntry.barycenter) {
          mergeEntries$1(vEntry, uEntry);
        }
      };
    };
    const handleOut = (vEntry) => {
      return (wEntry) => {
        wEntry["in"].push(vEntry);
        if (--wEntry.indegree === 0) {
          sourceSet.push(wEntry);
        }
      };
    };
    while (sourceSet === null || sourceSet === void 0 ? void 0 : sourceSet.length) {
      const entry = sourceSet.pop();
      entries.push(entry);
      (_a2 = entry["in"].reverse()) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => handleIn(entry)(e));
      (_b = entry.out) === null || _b === void 0 ? void 0 : _b.forEach((e) => handleOut(entry)(e));
    }
    const filtered = entries.filter((entry) => !entry.merged);
    const keys = [
      "vs",
      "i",
      "barycenter",
      "weight"
    ];
    return filtered.map((entry) => {
      const picked = {};
      keys === null || keys === void 0 ? void 0 : keys.forEach((key) => {
        if (entry[key] === void 0)
          return;
        picked[key] = entry[key];
      });
      return picked;
    });
  };
  const mergeEntries$1 = (target, source) => {
    var _a2;
    let sum = 0;
    let weight = 0;
    if (target.weight) {
      sum += target.barycenter * target.weight;
      weight += target.weight;
    }
    if (source.weight) {
      sum += source.barycenter * source.weight;
      weight += source.weight;
    }
    target.vs = (_a2 = source.vs) === null || _a2 === void 0 ? void 0 : _a2.concat(target.vs);
    target.barycenter = sum / weight;
    target.weight = weight;
    target.i = Math.min(source.i, target.i);
    source.merged = true;
  };
  const sort$2 = (entries, biasRight, usePrev, keepNodeOrder) => {
    const parts = partition$1(entries, (entry) => {
      const hasFixOrder = entry.hasOwnProperty("fixorder") && !isNaN(entry.fixorder);
      if (keepNodeOrder) {
        return !hasFixOrder && entry.hasOwnProperty("barycenter");
      }
      return hasFixOrder || entry.hasOwnProperty("barycenter");
    });
    const sortable = parts.lhs;
    const unsortable = parts.rhs.sort((a2, b) => -a2.i - -b.i);
    const vs = [];
    let sum = 0;
    let weight = 0;
    let vsIndex = 0;
    sortable === null || sortable === void 0 ? void 0 : sortable.sort(compareWithBias$1(!!biasRight, !!usePrev));
    vsIndex = consumeUnsortable$1(vs, unsortable, vsIndex);
    sortable === null || sortable === void 0 ? void 0 : sortable.forEach((entry) => {
      var _a2;
      vsIndex += (_a2 = entry.vs) === null || _a2 === void 0 ? void 0 : _a2.length;
      vs.push(entry.vs);
      sum += entry.barycenter * entry.weight;
      weight += entry.weight;
      vsIndex = consumeUnsortable$1(vs, unsortable, vsIndex);
    });
    const result = {
      vs: vs.flat()
    };
    if (weight) {
      result.barycenter = sum / weight;
      result.weight = weight;
    }
    return result;
  };
  const consumeUnsortable$1 = (vs, unsortable, index2) => {
    let iindex = index2;
    let last;
    while (unsortable.length && (last = unsortable[unsortable.length - 1]).i <= iindex) {
      unsortable.pop();
      vs === null || vs === void 0 ? void 0 : vs.push(last.vs);
      iindex++;
    }
    return iindex;
  };
  const compareWithBias$1 = (bias, usePrev) => {
    return (entryV, entryW) => {
      if (entryV.fixorder !== void 0 && entryW.fixorder !== void 0) {
        return entryV.fixorder - entryW.fixorder;
      }
      if (entryV.barycenter < entryW.barycenter) {
        return -1;
      }
      if (entryV.barycenter > entryW.barycenter) {
        return 1;
      }
      if (usePrev && entryV.order !== void 0 && entryW.order !== void 0) {
        if (entryV.order < entryW.order) {
          return -1;
        }
        if (entryV.order > entryW.order) {
          return 1;
        }
      }
      return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
    };
  };
  const sortSubgraph$2 = (g, v, cg, biasRight, usePrev, keepNodeOrder) => {
    var _a2, _b, _c, _d;
    let movable = g.getChildren(v).map((n) => n.id);
    const node = g.getNode(v);
    const bl = node ? node.data.borderLeft : void 0;
    const br = node ? node.data.borderRight : void 0;
    const subgraphs = {};
    if (bl) {
      movable = movable === null || movable === void 0 ? void 0 : movable.filter((w) => {
        return w !== bl && w !== br;
      });
    }
    const barycenters = barycenter$2(g, movable || []);
    barycenters === null || barycenters === void 0 ? void 0 : barycenters.forEach((entry) => {
      var _a3;
      if ((_a3 = g.getChildren(entry.v)) === null || _a3 === void 0 ? void 0 : _a3.length) {
        const subgraphResult = sortSubgraph$2(g, entry.v, cg, biasRight, keepNodeOrder);
        subgraphs[entry.v] = subgraphResult;
        if (subgraphResult.hasOwnProperty("barycenter")) {
          mergeBarycenters$1(entry, subgraphResult);
        }
      }
    });
    const entries = resolveConflicts$2(barycenters, cg);
    expandSubgraphs$1(entries, subgraphs);
    (_a2 = entries.filter((e) => e.vs.length > 0)) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => {
      const node2 = g.getNode(e.vs[0]);
      if (node2) {
        e.fixorder = node2.data.fixorder;
        e.order = node2.data.order;
      }
    });
    const result = sort$2(entries, biasRight, usePrev, keepNodeOrder);
    if (bl) {
      result.vs = [bl, result.vs, br].flat();
      if ((_b = g.getPredecessors(bl)) === null || _b === void 0 ? void 0 : _b.length) {
        const blPred = g.getNode(((_c = g.getPredecessors(bl)) === null || _c === void 0 ? void 0 : _c[0].id) || "");
        const brPred = g.getNode(((_d = g.getPredecessors(br)) === null || _d === void 0 ? void 0 : _d[0].id) || "");
        if (!result.hasOwnProperty("barycenter")) {
          result.barycenter = 0;
          result.weight = 0;
        }
        result.barycenter = (result.barycenter * result.weight + blPred.data.order + brPred.data.order) / (result.weight + 2);
        result.weight += 2;
      }
    }
    return result;
  };
  const expandSubgraphs$1 = (entries, subgraphs) => {
    entries === null || entries === void 0 ? void 0 : entries.forEach((entry) => {
      var _a2;
      const vss = (_a2 = entry.vs) === null || _a2 === void 0 ? void 0 : _a2.map((v) => {
        if (subgraphs[v]) {
          return subgraphs[v].vs;
        }
        return v;
      });
      entry.vs = vss.flat();
    });
  };
  const mergeBarycenters$1 = (target, other) => {
    if (target.barycenter !== void 0) {
      target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
      target.weight += other.weight;
    } else {
      target.barycenter = other.barycenter;
      target.weight = other.weight;
    }
  };
  const order$2 = (g, keepNodeOrder) => {
    const mxRank = maxRank$1(g);
    const range1 = [];
    const range2 = [];
    for (let i = 1; i < mxRank + 1; i++)
      range1.push(i);
    for (let i = mxRank - 1; i > -1; i--)
      range2.push(i);
    const downLayerGraphs = buildLayerGraphs$1(g, range1, "in");
    const upLayerGraphs = buildLayerGraphs$1(g, range2, "out");
    let layering = initOrder$2(g);
    assignOrder$1(g, layering);
    let bestCC = Number.POSITIVE_INFINITY;
    let best;
    for (let i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
      sweepLayerGraphs$1(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2, false, keepNodeOrder);
      layering = buildLayerMatrix$1(g);
      const cc = crossCount$2(g, layering);
      if (cc < bestCC) {
        lastBest = 0;
        best = clone$1(layering);
        bestCC = cc;
      }
    }
    layering = initOrder$2(g);
    assignOrder$1(g, layering);
    for (let i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
      sweepLayerGraphs$1(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2, true, keepNodeOrder);
      layering = buildLayerMatrix$1(g);
      const cc = crossCount$2(g, layering);
      if (cc < bestCC) {
        lastBest = 0;
        best = clone$1(layering);
        bestCC = cc;
      }
    }
    assignOrder$1(g, best);
  };
  const buildLayerGraphs$1 = (g, ranks, direction) => {
    return ranks.map((rank2) => {
      return buildLayerGraph$2(g, rank2, direction);
    });
  };
  const sweepLayerGraphs$1 = (layerGraphs, biasRight, usePrev, keepNodeOrder) => {
    const cg = new Graph$8();
    layerGraphs === null || layerGraphs === void 0 ? void 0 : layerGraphs.forEach((lg) => {
      var _a2;
      const root = lg.getRoots()[0].id;
      const sorted = sortSubgraph$2(lg, root, cg, biasRight, usePrev, keepNodeOrder);
      for (let i = 0; i < ((_a2 = sorted.vs) === null || _a2 === void 0 ? void 0 : _a2.length) || 0; i++) {
        const lnode = lg.getNode(sorted.vs[i]);
        if (lnode) {
          lnode.data.order = i;
        }
      }
      addSubgraphConstraints$2(lg, cg, sorted.vs);
    });
  };
  const assignOrder$1 = (g, layering) => {
    layering === null || layering === void 0 ? void 0 : layering.forEach((layer) => {
      layer === null || layer === void 0 ? void 0 : layer.forEach((v, i) => {
        g.getNode(v).data.order = i;
      });
    });
  };
  const initDataOrder = (g, nodeOrder) => {
    const simpleNodes = g.getAllNodes().filter((v) => {
      var _a2;
      return !((_a2 = g.getChildren(v.id)) === null || _a2 === void 0 ? void 0 : _a2.length);
    });
    const ranks = simpleNodes.map((v) => v.data.rank);
    const maxRank2 = Math.max(...ranks);
    const layers = [];
    for (let i = 0; i < maxRank2 + 1; i++) {
      layers[i] = [];
    }
    nodeOrder === null || nodeOrder === void 0 ? void 0 : nodeOrder.forEach((n) => {
      const node = g.getNode(n);
      if (!node || node.data.dummy) {
        return;
      }
      if (!isNaN(node.data.rank)) {
        node.data.fixorder = layers[node.data.rank].length;
        layers[node.data.rank].push(n);
      }
    });
  };
  const dfsBothOrder = (g) => {
    const result = {};
    let lim = 0;
    const dfs2 = (v) => {
      const low = lim;
      g.getChildren(v).forEach((n) => dfs2(n.id));
      result[v] = { low, lim: lim++ };
    };
    g.getRoots().forEach((n) => dfs2(n.id));
    return result;
  };
  const findPath$1 = (g, postorderNums, v, w) => {
    var _a2, _b;
    const vPath = [];
    const wPath = [];
    const low = Math.min(postorderNums[v].low, postorderNums[w].low);
    const lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
    let parent;
    let lca;
    parent = v;
    do {
      parent = (_a2 = g.getParent(parent)) === null || _a2 === void 0 ? void 0 : _a2.id;
      vPath.push(parent);
    } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
    lca = parent;
    parent = w;
    while (parent && parent !== lca) {
      wPath.push(parent);
      parent = (_b = g.getParent(parent)) === null || _b === void 0 ? void 0 : _b.id;
    }
    return { lca, path: vPath.concat(wPath.reverse()) };
  };
  const parentDummyChains$2 = (g, dummyChains) => {
    const postorderNums = dfsBothOrder(g);
    dummyChains.forEach((startV) => {
      var _a2, _b;
      let v = startV;
      let node = g.getNode(v);
      const originalEdge = node.data.originalEdge;
      if (!originalEdge)
        return;
      const pathData = findPath$1(g, postorderNums, originalEdge.source, originalEdge.target);
      const path = pathData.path;
      const lca = pathData.lca;
      let pathIdx = 0;
      let pathV = path[pathIdx];
      let ascending = true;
      while (v !== originalEdge.target) {
        node = g.getNode(v);
        if (ascending) {
          while (pathV !== lca && ((_a2 = g.getNode(pathV)) === null || _a2 === void 0 ? void 0 : _a2.data.maxRank) < node.data.rank) {
            pathIdx++;
            pathV = path[pathIdx];
          }
          if (pathV === lca) {
            ascending = false;
          }
        }
        if (!ascending) {
          while (pathIdx < path.length - 1 && ((_b = g.getNode(path[pathIdx + 1])) === null || _b === void 0 ? void 0 : _b.data.minRank) <= node.data.rank) {
            pathIdx++;
          }
          pathV = path[pathIdx];
        }
        if (g.hasNode(pathV)) {
          g.setParent(v, pathV);
        }
        v = g.getSuccessors(v)[0].id;
      }
    });
  };
  const findType1Conflicts$1 = (g, layering) => {
    const conflicts = {};
    const visitLayer = (prevLayer, layer) => {
      let k0 = 0;
      let scanPos = 0;
      const prevLayerLength = prevLayer.length;
      const lastNode = layer === null || layer === void 0 ? void 0 : layer[(layer === null || layer === void 0 ? void 0 : layer.length) - 1];
      layer === null || layer === void 0 ? void 0 : layer.forEach((v, i) => {
        var _a2;
        const w = findOtherInnerSegmentNode$1(g, v);
        const k1 = w ? g.getNode(w.id).data.order : prevLayerLength;
        if (w || v === lastNode) {
          (_a2 = layer.slice(scanPos, i + 1)) === null || _a2 === void 0 ? void 0 : _a2.forEach((scanNode) => {
            var _a3;
            (_a3 = g.getPredecessors(scanNode)) === null || _a3 === void 0 ? void 0 : _a3.forEach((u) => {
              var _a4;
              const uLabel = g.getNode(u.id);
              const uPos = uLabel.data.order;
              if ((uPos < k0 || k1 < uPos) && !(uLabel.data.dummy && ((_a4 = g.getNode(scanNode)) === null || _a4 === void 0 ? void 0 : _a4.data.dummy))) {
                addConflict$1(conflicts, u.id, scanNode);
              }
            });
          });
          scanPos = i + 1;
          k0 = k1;
        }
      });
      return layer;
    };
    if (layering === null || layering === void 0 ? void 0 : layering.length) {
      layering.reduce(visitLayer);
    }
    return conflicts;
  };
  const findType2Conflicts$1 = (g, layering) => {
    const conflicts = {};
    function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
      var _a2, _b;
      let v;
      for (let i = southPos; i < southEnd; i++) {
        v = south[i];
        if ((_a2 = g.getNode(v)) === null || _a2 === void 0 ? void 0 : _a2.data.dummy) {
          (_b = g.getPredecessors(v)) === null || _b === void 0 ? void 0 : _b.forEach((u) => {
            const uNode = g.getNode(u.id);
            if (uNode.data.dummy && (uNode.data.order < prevNorthBorder || uNode.data.order > nextNorthBorder)) {
              addConflict$1(conflicts, u.id, v);
            }
          });
        }
      }
    }
    function getScannedKey(params) {
      return JSON.stringify(params.slice(1));
    }
    function scanIfNeeded(params, scanCache) {
      const cacheKey = getScannedKey(params);
      if (scanCache.get(cacheKey))
        return;
      scan(...params);
      scanCache.set(cacheKey, true);
    }
    const visitLayer = (north, south) => {
      let prevNorthPos = -1;
      let nextNorthPos;
      let southPos = 0;
      const scanned = /* @__PURE__ */ new Map();
      south === null || south === void 0 ? void 0 : south.forEach((v, southLookahead) => {
        var _a2;
        if (((_a2 = g.getNode(v)) === null || _a2 === void 0 ? void 0 : _a2.data.dummy) === "border") {
          const predecessors = g.getPredecessors(v) || [];
          if (predecessors.length) {
            nextNorthPos = g.getNode(predecessors[0].id).data.order;
            scanIfNeeded([south, southPos, southLookahead, prevNorthPos, nextNorthPos], scanned);
            southPos = southLookahead;
            prevNorthPos = nextNorthPos;
          }
        }
        scanIfNeeded([south, southPos, south.length, nextNorthPos, north.length], scanned);
      });
      return south;
    };
    if (layering === null || layering === void 0 ? void 0 : layering.length) {
      layering.reduce(visitLayer);
    }
    return conflicts;
  };
  const findOtherInnerSegmentNode$1 = (g, v) => {
    var _a2, _b;
    if ((_a2 = g.getNode(v)) === null || _a2 === void 0 ? void 0 : _a2.data.dummy) {
      return (_b = g.getPredecessors(v)) === null || _b === void 0 ? void 0 : _b.find((u) => g.getNode(u.id).data.dummy);
    }
  };
  const addConflict$1 = (conflicts, v, w) => {
    let vv = v;
    let ww = w;
    if (vv > ww) {
      const tmp = vv;
      vv = ww;
      ww = tmp;
    }
    let conflictsV = conflicts[vv];
    if (!conflictsV) {
      conflicts[vv] = conflictsV = {};
    }
    conflictsV[ww] = true;
  };
  const hasConflict$1 = (conflicts, v, w) => {
    let vv = v;
    let ww = w;
    if (vv > ww) {
      const tmp = v;
      vv = ww;
      ww = tmp;
    }
    return !!conflicts[vv];
  };
  const verticalAlignment$1 = (g, layering, conflicts, neighborFn) => {
    const root = {};
    const align = {};
    const pos = {};
    layering === null || layering === void 0 ? void 0 : layering.forEach((layer) => {
      layer === null || layer === void 0 ? void 0 : layer.forEach((v, order2) => {
        root[v] = v;
        align[v] = v;
        pos[v] = order2;
      });
    });
    layering === null || layering === void 0 ? void 0 : layering.forEach((layer) => {
      let prevIdx = -1;
      layer === null || layer === void 0 ? void 0 : layer.forEach((v) => {
        let ws = neighborFn(v).map((n) => n.id);
        if (ws.length) {
          ws = ws.sort((a2, b) => pos[a2] - pos[b]);
          const mp = (ws.length - 1) / 2;
          for (let i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
            const w = ws[i];
            if (align[v] === v && prevIdx < pos[w] && !hasConflict$1(conflicts, v, w)) {
              align[w] = v;
              align[v] = root[v] = root[w];
              prevIdx = pos[w];
            }
          }
        }
      });
    });
    return { root, align };
  };
  const horizontalCompaction$1 = (g, layering, root, align, nodesep, edgesep, reverseSep) => {
    var _a2;
    const xs = {};
    const blockG = buildBlockGraph$1(g, layering, root, nodesep, edgesep, reverseSep);
    const borderType = reverseSep ? "borderLeft" : "borderRight";
    const iterate = (setXsFunc, nextNodesFunc) => {
      let stack = blockG.getAllNodes();
      let elem = stack.pop();
      const visited = {};
      while (elem) {
        if (visited[elem.id]) {
          setXsFunc(elem.id);
        } else {
          visited[elem.id] = true;
          stack.push(elem);
          stack = stack.concat(nextNodesFunc(elem.id));
        }
        elem = stack.pop();
      }
    };
    const pass1 = (elem) => {
      xs[elem] = (blockG.getRelatedEdges(elem, "in") || []).reduce((acc, e) => {
        return Math.max(acc, (xs[e.source] || 0) + e.data.weight);
      }, 0);
    };
    const pass2 = (elem) => {
      const min2 = (blockG.getRelatedEdges(elem, "out") || []).reduce((acc, e) => {
        return Math.min(acc, (xs[e.target] || 0) - e.data.weight);
      }, Number.POSITIVE_INFINITY);
      const node = g.getNode(elem);
      if (min2 !== Number.POSITIVE_INFINITY && node.data.borderType !== borderType) {
        xs[elem] = Math.max(xs[elem], min2);
      }
    };
    iterate(pass1, blockG.getPredecessors.bind(blockG));
    iterate(pass2, blockG.getSuccessors.bind(blockG));
    (_a2 = Object.values(align)) === null || _a2 === void 0 ? void 0 : _a2.forEach((v) => {
      xs[v] = xs[root[v]];
    });
    return xs;
  };
  const buildBlockGraph$1 = (g, layering, root, nodesep, edgesep, reverseSep) => {
    const blockGraph = new Graph$8();
    const sepFn = sep$1(nodesep, edgesep, reverseSep);
    layering === null || layering === void 0 ? void 0 : layering.forEach((layer) => {
      let u;
      layer === null || layer === void 0 ? void 0 : layer.forEach((v) => {
        const vRoot = root[v];
        if (!blockGraph.hasNode(vRoot)) {
          blockGraph.addNode({
            id: vRoot,
            data: {}
          });
        }
        if (u) {
          const uRoot = root[u];
          const edge = blockGraph.getRelatedEdges(uRoot, "out").find((edge2) => edge2.target === vRoot);
          if (!edge) {
            blockGraph.addEdge({
              id: `e${Math.random()}`,
              source: uRoot,
              target: vRoot,
              data: {
                weight: Math.max(sepFn(g, v, u), 0)
              }
            });
          } else {
            blockGraph.updateEdgeData(edge.id, Object.assign(Object.assign({}, edge.data), { weight: Math.max(sepFn(g, v, u), edge.data.weight || 0) }));
          }
        }
        u = v;
      });
    });
    return blockGraph;
  };
  const findSmallestWidthAlignment$1 = (g, xss) => {
    return minBy(Object.values(xss), (xs) => {
      var _a2;
      let max2 = Number.NEGATIVE_INFINITY;
      let min2 = Number.POSITIVE_INFINITY;
      (_a2 = Object.keys(xs)) === null || _a2 === void 0 ? void 0 : _a2.forEach((v) => {
        const x2 = xs[v];
        const halfWidth = width$1(g, v) / 2;
        max2 = Math.max(x2 + halfWidth, max2);
        min2 = Math.min(x2 - halfWidth, min2);
      });
      return max2 - min2;
    });
  };
  function alignCoordinates$1(xss, alignTo) {
    const alignToVals = Object.values(alignTo);
    const alignToMin = Math.min(...alignToVals);
    const alignToMax = Math.max(...alignToVals);
    ["u", "d"].forEach((vert) => {
      ["l", "r"].forEach((horiz) => {
        const alignment = vert + horiz;
        const xs = xss[alignment];
        let delta;
        if (xs === alignTo)
          return;
        const xsVals = Object.values(xs);
        delta = horiz === "l" ? alignToMin - Math.min(...xsVals) : alignToMax - Math.max(...xsVals);
        if (delta) {
          xss[alignment] = {};
          Object.keys(xs).forEach((key) => {
            xss[alignment][key] = xs[key] + delta;
          });
        }
      });
    });
  }
  const balance$1 = (xss, align) => {
    const result = {};
    Object.keys(xss.ul).forEach((key) => {
      if (align) {
        result[key] = xss[align.toLowerCase()][key];
      } else {
        const values = Object.values(xss).map((x2) => x2[key]);
        result[key] = (values[0] + values[1]) / 2;
      }
    });
    return result;
  };
  const sep$1 = (nodeSep, edgeSep, reverseSep) => {
    return (g, v, w) => {
      const vLabel = g.getNode(v);
      const wLabel = g.getNode(w);
      let sum = 0;
      let delta = 0;
      sum += vLabel.data.width / 2;
      if (vLabel.data.hasOwnProperty("labelpos")) {
        switch ((vLabel.data.labelpos || "").toLowerCase()) {
          case "l":
            delta = -vLabel.data.width / 2;
            break;
          case "r":
            delta = vLabel.data.width / 2;
            break;
        }
      }
      if (delta) {
        sum += reverseSep ? delta : -delta;
      }
      delta = 0;
      sum += (vLabel.data.dummy ? edgeSep : nodeSep) / 2;
      sum += (wLabel.data.dummy ? edgeSep : nodeSep) / 2;
      sum += wLabel.data.width / 2;
      if (wLabel.data.labelpos) {
        switch ((wLabel.data.labelpos || "").toLowerCase()) {
          case "l":
            delta = wLabel.data.width / 2;
            break;
          case "r":
            delta = -wLabel.data.width / 2;
            break;
        }
      }
      if (delta) {
        sum += reverseSep ? delta : -delta;
      }
      delta = 0;
      return sum;
    };
  };
  const width$1 = (g, v) => g.getNode(v).data.width || 0;
  const positionY$1 = (g, options) => {
    const { ranksep = 0 } = options || {};
    const layering = buildLayerMatrix$1(g);
    let prevY = 0;
    layering === null || layering === void 0 ? void 0 : layering.forEach((layer) => {
      const heights = layer.map((v) => g.getNode(v).data.height);
      const maxHeight = Math.max(...heights, 0);
      layer === null || layer === void 0 ? void 0 : layer.forEach((v) => {
        g.getNode(v).data.y = prevY + maxHeight / 2;
      });
      prevY += maxHeight + ranksep;
    });
  };
  const positionX$2 = (g, options) => {
    const { align: graphAlign, nodesep = 0, edgesep = 0 } = options || {};
    const layering = buildLayerMatrix$1(g);
    const conflicts = Object.assign(findType1Conflicts$1(g, layering), findType2Conflicts$1(g, layering));
    const xss = {};
    let adjustedLayering = [];
    ["u", "d"].forEach((vert) => {
      adjustedLayering = vert === "u" ? layering : Object.values(layering).reverse();
      ["l", "r"].forEach((horiz) => {
        if (horiz === "r") {
          adjustedLayering = adjustedLayering.map((inner) => Object.values(inner).reverse());
        }
        const neighborFn = (vert === "u" ? g.getPredecessors : g.getSuccessors).bind(g);
        const align = verticalAlignment$1(g, adjustedLayering, conflicts, neighborFn);
        const xs = horizontalCompaction$1(g, adjustedLayering, align.root, align.align, nodesep, edgesep, horiz === "r");
        if (horiz === "r") {
          Object.keys(xs).forEach((xsKey) => xs[xsKey] = -xs[xsKey]);
        }
        xss[vert + horiz] = xs;
      });
    });
    const smallestWidth = findSmallestWidthAlignment$1(g, xss);
    smallestWidth && alignCoordinates$1(xss, smallestWidth);
    return balance$1(xss, graphAlign);
  };
  const position$2 = (g, options) => {
    var _a2;
    const ng = asNonCompoundGraph$1(g);
    positionY$1(ng, options);
    const xs = positionX$2(ng, options);
    (_a2 = Object.keys(xs)) === null || _a2 === void 0 ? void 0 : _a2.forEach((key) => {
      ng.getNode(key).data.x = xs[key];
    });
  };
  const longestPath$2 = (g) => {
    const visited = {};
    const dfs2 = (v) => {
      var _a2;
      const label = g.getNode(v);
      if (!label)
        return 0;
      if (visited[v]) {
        return label.data.rank;
      }
      visited[v] = true;
      let rank2;
      (_a2 = g.getRelatedEdges(v, "out")) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => {
        const wRank = dfs2(e.target);
        const minLen = e.data.minlen;
        const r = wRank - minLen;
        if (r) {
          if (rank2 === void 0 || r < rank2) {
            rank2 = r;
          }
        }
      });
      if (!rank2) {
        rank2 = 0;
      }
      label.data.rank = rank2;
      return rank2;
    };
    g.getAllNodes().filter((n) => g.getRelatedEdges(n.id, "in").length === 0).forEach((source) => dfs2(source.id));
  };
  const longestPathWithLayer = (g) => {
    const visited = {};
    let minRank;
    const dfs2 = (v) => {
      var _a2;
      const label = g.getNode(v);
      if (!label)
        return 0;
      if (visited[v]) {
        return label.data.rank;
      }
      visited[v] = true;
      let rank2;
      (_a2 = g.getRelatedEdges(v, "out")) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => {
        const wRank = dfs2(e.target);
        const minLen = e.data.minlen;
        const r = wRank - minLen;
        if (r) {
          if (rank2 === void 0 || r < rank2) {
            rank2 = r;
          }
        }
      });
      if (!rank2) {
        rank2 = 0;
      }
      if (minRank === void 0 || rank2 < minRank) {
        minRank = rank2;
      }
      label.data.rank = rank2;
      return rank2;
    };
    g.getAllNodes().filter((n) => g.getRelatedEdges(n.id, "in").length === 0).forEach((source) => {
      if (source)
        dfs2(source.id);
    });
    if (minRank === void 0) {
      minRank = 0;
    }
    const forwardVisited = {};
    const dfsForward = (v, nextRank) => {
      var _a2;
      const label = g.getNode(v);
      const currRank = !isNaN(label.data.layer) ? label.data.layer : nextRank;
      if (label.data.rank === void 0 || label.data.rank < currRank) {
        label.data.rank = currRank;
      }
      if (forwardVisited[v])
        return;
      forwardVisited[v] = true;
      (_a2 = g.getRelatedEdges(v, "out")) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => {
        dfsForward(e.target, currRank + e.data.minlen);
      });
    };
    g.getAllNodes().forEach((n) => {
      const label = n.data;
      if (!label)
        return;
      if (!isNaN(label.layer)) {
        dfsForward(n.id, label.layer);
      } else {
        label.rank -= minRank;
      }
    });
  };
  const slack$3 = (g, e) => {
    return g.getNode(e.target).data.rank - g.getNode(e.source).data.rank - e.data.minlen;
  };
  const feasibleTree$3 = (g) => {
    const t = new Graph$8({
      tree: []
    });
    const start = g.getAllNodes()[0];
    const size = g.getAllNodes().length;
    t.addNode(start);
    let edge;
    let delta;
    while (tightTree$1(t, g) < size) {
      edge = findMinSlackEdge$1(t, g);
      delta = t.hasNode(edge.source) ? slack$3(g, edge) : -slack$3(g, edge);
      shiftRanks$1(t, g, delta);
    }
    return t;
  };
  const tightTree$1 = (t, g) => {
    const dfs2 = (v) => {
      g.getRelatedEdges(v, "both").forEach((e) => {
        const edgeV = e.source;
        const w = v === edgeV ? e.target : edgeV;
        if (!t.hasNode(w) && !slack$3(g, e)) {
          t.addNode({
            id: w,
            data: {}
          });
          t.addEdge({
            id: e.id,
            source: v,
            target: w,
            data: {}
          });
          dfs2(w);
        }
      });
    };
    t.getAllNodes().forEach((n) => dfs2(n.id));
    return t.getAllNodes().length;
  };
  const feasibleTreeWithLayer = (g) => {
    const t = new Graph$8({ tree: [] });
    const start = g.getAllNodes()[0];
    const size = g.getAllNodes().length;
    t.addNode(start);
    let edge;
    let delta;
    while (tightTreeWithLayer(t, g) < size) {
      edge = findMinSlackEdge$1(t, g);
      delta = t.hasNode(edge.source) ? slack$3(g, edge) : -slack$3(g, edge);
      shiftRanks$1(t, g, delta);
    }
    return t;
  };
  const tightTreeWithLayer = (t, g) => {
    const dfs2 = (v) => {
      var _a2;
      (_a2 = g.getRelatedEdges(v, "both")) === null || _a2 === void 0 ? void 0 : _a2.forEach((e) => {
        const edgeV = e.source;
        const w = v === edgeV ? e.target : edgeV;
        if (!t.hasNode(w) && (g.getNode(w).data.layer !== void 0 || !slack$3(g, e))) {
          t.addNode({
            id: w,
            data: {}
          });
          t.addEdge({
            id: e.id,
            source: v,
            target: w,
            data: {}
          });
          dfs2(w);
        }
      });
    };
    t.getAllNodes().forEach((n) => dfs2(n.id));
    return t.getAllNodes().length;
  };
  const findMinSlackEdge$1 = (t, g) => {
    return minBy(g.getAllEdges(), (e) => {
      if (t.hasNode(e.source) !== t.hasNode(e.target)) {
        return slack$3(g, e);
      }
      return Infinity;
    });
  };
  const shiftRanks$1 = (t, g, delta) => {
    t.getAllNodes().forEach((tn) => {
      const v = g.getNode(tn.id);
      if (!v.data.rank)
        v.data.rank = 0;
      v.data.rank += delta;
    });
  };
  const networkSimplex$2 = (og) => {
    const g = simplify$2(og);
    longestPath$2(g);
    const t = feasibleTree$3(g);
    initLowLimValues$1(t);
    initCutValues$1(t, g);
    let e;
    let f;
    while (e = leaveEdge$1(t)) {
      f = enterEdge$1(t, g, e);
      exchangeEdges$1(t, g, e, f);
    }
  };
  const initCutValues$1 = (t, g) => {
    let vs = dfs$2(t, t.getAllNodes(), "post");
    vs = vs.slice(0, (vs === null || vs === void 0 ? void 0 : vs.length) - 1);
    vs.forEach((v) => {
      assignCutValue$1(t, g, v);
    });
  };
  const assignCutValue$1 = (t, g, child) => {
    const childLab = t.getNode(child);
    const parent = childLab.data.parent;
    const edge = t.getRelatedEdges(child, "both").find((e) => e.target === parent || e.source === parent);
    edge.data.cutvalue = calcCutValue$1(t, g, child);
  };
  const calcCutValue$1 = (t, g, child) => {
    const childLab = t.getNode(child);
    const parent = childLab.data.parent;
    let childIsTail = true;
    let graphEdge = g.getRelatedEdges(child, "out").find((e) => e.target === parent);
    let cutValue = 0;
    if (!graphEdge) {
      childIsTail = false;
      graphEdge = g.getRelatedEdges(parent, "out").find((e) => e.target === child);
    }
    cutValue = graphEdge.data.weight;
    g.getRelatedEdges(child, "both").forEach((e) => {
      const isOutEdge = e.source === child;
      const other = isOutEdge ? e.target : e.source;
      if (other !== parent) {
        const pointsToHead = isOutEdge === childIsTail;
        const otherWeight = e.data.weight;
        cutValue += pointsToHead ? otherWeight : -otherWeight;
        if (isTreeEdge$1(t, child, other)) {
          const otherCutValue = t.getRelatedEdges(child, "both").find((e2) => e2.source === other || e2.target === other).data.cutvalue;
          cutValue += pointsToHead ? -otherCutValue : otherCutValue;
        }
      }
    });
    return cutValue;
  };
  const initLowLimValues$1 = (tree, root = tree.getAllNodes()[0].id) => {
    dfsAssignLowLim$1(tree, {}, 1, root);
  };
  const dfsAssignLowLim$1 = (tree, visited, nextLim, v, parent) => {
    var _a2;
    const low = nextLim;
    let useNextLim = nextLim;
    const label = tree.getNode(v);
    visited[v] = true;
    (_a2 = tree.getNeighbors(v)) === null || _a2 === void 0 ? void 0 : _a2.forEach((w) => {
      if (!visited[w.id]) {
        useNextLim = dfsAssignLowLim$1(tree, visited, useNextLim, w.id, v);
      }
    });
    label.data.low = low;
    label.data.lim = useNextLim++;
    if (parent) {
      label.data.parent = parent;
    } else {
      delete label.data.parent;
    }
    return useNextLim;
  };
  const leaveEdge$1 = (tree) => {
    return tree.getAllEdges().find((e) => {
      return e.data.cutvalue < 0;
    });
  };
  const enterEdge$1 = (t, g, edge) => {
    let v = edge.source;
    let w = edge.target;
    if (!g.getRelatedEdges(v, "out").find((e) => e.target === w)) {
      v = edge.target;
      w = edge.source;
    }
    const vLabel = t.getNode(v);
    const wLabel = t.getNode(w);
    let tailLabel = vLabel;
    let flip = false;
    if (vLabel.data.lim > wLabel.data.lim) {
      tailLabel = wLabel;
      flip = true;
    }
    const candidates = g.getAllEdges().filter((edge2) => {
      return flip === isDescendant$1(t.getNode(edge2.source), tailLabel) && flip !== isDescendant$1(t.getNode(edge2.target), tailLabel);
    });
    return minBy(candidates, (edge2) => {
      return slack$3(g, edge2);
    });
  };
  const exchangeEdges$1 = (t, g, e, f) => {
    const existed = t.getRelatedEdges(e.source, "both").find((edge) => edge.source === e.target || edge.target === e.target);
    if (existed) {
      t.removeEdge(existed.id);
    }
    t.addEdge({
      id: `e${Math.random()}`,
      source: f.source,
      target: f.target,
      data: {}
    });
    initLowLimValues$1(t);
    initCutValues$1(t, g);
    updateRanks$1(t, g);
  };
  const updateRanks$1 = (t, g) => {
    const root = t.getAllNodes().find((v) => {
      return !v.data.parent;
    });
    let vs = dfs$2(t, root, "pre");
    vs = vs.slice(1);
    vs.forEach((v) => {
      const parent = t.getNode(v).data.parent;
      let edge = g.getRelatedEdges(v, "out").find((e) => e.target === parent);
      let flipped = false;
      if (!edge && g.hasNode(parent)) {
        edge = g.getRelatedEdges(parent, "out").find((e) => e.target === v);
        flipped = true;
      }
      g.getNode(v).data.rank = (g.hasNode(parent) && g.getNode(parent).data.rank || 0) + (flipped ? edge === null || edge === void 0 ? void 0 : edge.data.minlen : -(edge === null || edge === void 0 ? void 0 : edge.data.minlen));
    });
  };
  const isTreeEdge$1 = (tree, u, v) => {
    return tree.getRelatedEdges(u, "both").find((e) => e.source === v || e.target === v);
  };
  const isDescendant$1 = (vLabel, rootLabel) => {
    return rootLabel.data.low <= vLabel.data.lim && vLabel.data.lim <= rootLabel.data.lim;
  };
  const rank$2 = (g, ranker) => {
    switch (ranker) {
      case "network-simplex":
        networkSimplexRanker$1(g);
        break;
      case "tight-tree":
        tightTreeRanker$1(g);
        break;
      case "longest-path":
        longestPathRanker$1(g);
        break;
      default:
        tightTreeRanker$1(g);
    }
  };
  const longestPathRanker$1 = longestPath$2;
  const tightTreeRanker$1 = (g) => {
    longestPathWithLayer(g);
    feasibleTreeWithLayer(g);
  };
  const networkSimplexRanker$1 = (g) => {
    networkSimplex$2(g);
  };
  const layout$1 = (g, options) => {
    const { edgeLabelSpace, keepNodeOrder, prevGraph, rankdir, ranksep } = options;
    if (!keepNodeOrder && prevGraph) {
      inheritOrder(g, prevGraph);
    }
    const layoutGraph = buildLayoutGraph$1(g);
    if (!!edgeLabelSpace) {
      options.ranksep = makeSpaceForEdgeLabels$1(layoutGraph, {
        rankdir,
        ranksep
      });
    }
    let dimension;
    try {
      dimension = runLayout$1(layoutGraph, options);
    } catch (e) {
      if (e.message === "Not possible to find intersection inside of the rectangle") {
        console.error("The following error may be caused by improper layer setting, please make sure your manual layer setting does not violate the graph's structure:\n", e);
        return;
      }
      throw e;
    }
    updateInputGraph$1(g, layoutGraph);
    return dimension;
  };
  const runLayout$1 = (g, options) => {
    const { ranker, rankdir = "tb", nodeOrder, keepNodeOrder, align, nodesep = 50, edgesep = 20, ranksep = 50 } = options;
    removeSelfEdges$1(g);
    run$5(g);
    const { nestingRoot, nodeRankFactor } = run$4(g);
    rank$2(asNonCompoundGraph$1(g), ranker);
    injectEdgeLabelProxies$1(g);
    removeEmptyRanks$2(g, nodeRankFactor);
    cleanup$1(g, nestingRoot);
    normalizeRanks$2(g);
    assignRankMinMax$1(g);
    removeEdgeLabelProxies$1(g);
    const dummyChains = [];
    run$3(g, dummyChains);
    parentDummyChains$2(g, dummyChains);
    addBorderSegments$2(g);
    if (keepNodeOrder) {
      initDataOrder(g, nodeOrder);
    }
    order$2(g, keepNodeOrder);
    insertSelfEdges$1(g);
    adjust$1(g, rankdir);
    position$2(g, {
      align,
      nodesep,
      edgesep,
      ranksep
    });
    positionSelfEdges$1(g);
    removeBorderNodes$1(g);
    undo$3(g, dummyChains);
    fixupEdgeLabelCoords$1(g);
    undo$4(g, rankdir);
    const { width: width2, height } = translateGraph$1(g);
    assignNodeIntersects$1(g);
    reversePointsForReversedEdges$1(g);
    undo$5(g);
    return { width: width2, height };
  };
  const inheritOrder = (currG, prevG) => {
    currG.getAllNodes().forEach((n) => {
      const node = currG.getNode(n.id);
      if (prevG.hasNode(n.id)) {
        const prevNode = prevG.getNode(n.id);
        node.data.fixorder = prevNode.data._order;
        delete prevNode.data._order;
      } else {
        delete node.data.fixorder;
      }
    });
  };
  const updateInputGraph$1 = (inputGraph, layoutGraph) => {
    inputGraph.getAllNodes().forEach((v) => {
      var _a2;
      const inputLabel = inputGraph.getNode(v.id);
      if (inputLabel) {
        const layoutLabel = layoutGraph.getNode(v.id);
        inputLabel.data.x = layoutLabel.data.x;
        inputLabel.data.y = layoutLabel.data.y;
        inputLabel.data._order = layoutLabel.data.order;
        inputLabel.data._rank = layoutLabel.data.rank;
        if ((_a2 = layoutGraph.getChildren(v.id)) === null || _a2 === void 0 ? void 0 : _a2.length) {
          inputLabel.data.width = layoutLabel.data.width;
          inputLabel.data.height = layoutLabel.data.height;
        }
      }
    });
    inputGraph.getAllEdges().forEach((e) => {
      const inputLabel = inputGraph.getEdge(e.id);
      const layoutLabel = layoutGraph.getEdge(e.id);
      inputLabel.data.points = layoutLabel ? layoutLabel.data.points : [];
      if (layoutLabel && layoutLabel.data.hasOwnProperty("x")) {
        inputLabel.data.x = layoutLabel.data.x;
        inputLabel.data.y = layoutLabel.data.y;
      }
    });
  };
  const nodeNumAttrs$1 = ["width", "height", "layer", "fixorder"];
  const nodeDefaults$1 = { width: 0, height: 0 };
  const edgeNumAttrs$1 = ["minlen", "weight", "width", "height", "labeloffset"];
  const edgeDefaults$1 = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  };
  const edgeAttrs$1 = ["labelpos"];
  const buildLayoutGraph$1 = (inputGraph) => {
    const g = new Graph$8({ tree: [] });
    inputGraph.getAllNodes().forEach((v) => {
      const node = canonicalize$1(inputGraph.getNode(v.id).data);
      const defaultNode = Object.assign(Object.assign({}, nodeDefaults$1), node);
      const defaultAttrs = selectNumberAttrs$1(defaultNode, nodeNumAttrs$1);
      if (!g.hasNode(v.id)) {
        g.addNode({
          id: v.id,
          data: Object.assign({}, defaultAttrs)
        });
      }
      const parent = inputGraph.hasTreeStructure("combo") ? inputGraph.getParent(v.id, "combo") : inputGraph.getParent(v.id);
      if (!isNil(parent)) {
        if (!g.hasNode(parent.id)) {
          g.addNode(Object.assign({}, parent));
        }
        g.setParent(v.id, parent.id);
      }
    });
    inputGraph.getAllEdges().forEach((e) => {
      const edge = canonicalize$1(inputGraph.getEdge(e.id).data);
      const pickedProperties = {};
      edgeAttrs$1 === null || edgeAttrs$1 === void 0 ? void 0 : edgeAttrs$1.forEach((key) => {
        if (edge[key] !== void 0)
          pickedProperties[key] = edge[key];
      });
      g.addEdge({
        id: e.id,
        source: e.source,
        target: e.target,
        data: Object.assign({}, edgeDefaults$1, selectNumberAttrs$1(edge, edgeNumAttrs$1), pickedProperties)
      });
    });
    return g;
  };
  const makeSpaceForEdgeLabels$1 = (g, options) => {
    const { ranksep = 0, rankdir } = options;
    g.getAllNodes().forEach((node) => {
      if (!isNaN(node.data.layer)) {
        if (!node.data.layer)
          node.data.layer = 0;
      }
    });
    g.getAllEdges().forEach((edge) => {
      var _a2;
      edge.data.minlen *= 2;
      if (((_a2 = edge.data.labelpos) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) !== "c") {
        if (rankdir === "TB" || rankdir === "BT") {
          edge.data.width += edge.data.labeloffset;
        } else {
          edge.data.height += edge.data.labeloffset;
        }
      }
    });
    return ranksep / 2;
  };
  const injectEdgeLabelProxies$1 = (g) => {
    g.getAllEdges().forEach((e) => {
      if (e.data.width && e.data.height) {
        const v = g.getNode(e.source);
        const w = g.getNode(e.target);
        const label = {
          e,
          rank: (w.data.rank - v.data.rank) / 2 + v.data.rank
        };
        addDummyNode$1(g, "edge-proxy", label, "_ep");
      }
    });
  };
  const assignRankMinMax$1 = (g) => {
    let maxRank2 = 0;
    g.getAllNodes().forEach((node) => {
      var _a2, _b;
      if (node.data.borderTop) {
        node.data.minRank = (_a2 = g.getNode(node.data.borderTop)) === null || _a2 === void 0 ? void 0 : _a2.data.rank;
        node.data.maxRank = (_b = g.getNode(node.data.borderBottom)) === null || _b === void 0 ? void 0 : _b.data.rank;
        maxRank2 = Math.max(maxRank2, node.data.maxRank || -Infinity);
      }
    });
    return maxRank2;
  };
  const removeEdgeLabelProxies$1 = (g) => {
    g.getAllNodes().forEach((node) => {
      if (node.data.dummy === "edge-proxy") {
        g.getEdge(node.data.e.id).data.labelRank = node.data.rank;
        g.removeNode(node.id);
      }
    });
  };
  const translateGraph$1 = (g, options) => {
    let minX;
    let maxX = 0;
    let minY;
    let maxY = 0;
    const { marginx: marginX = 0, marginy: marginY = 0 } = {};
    const getExtremes = (attrs) => {
      if (!attrs.data)
        return;
      const x2 = attrs.data.x;
      const y2 = attrs.data.y;
      const w = attrs.data.width;
      const h = attrs.data.height;
      if (!isNaN(x2) && !isNaN(w)) {
        if (minX === void 0) {
          minX = x2 - w / 2;
        }
        minX = Math.min(minX, x2 - w / 2);
        maxX = Math.max(maxX, x2 + w / 2);
      }
      if (!isNaN(y2) && !isNaN(h)) {
        if (minY === void 0) {
          minY = y2 - h / 2;
        }
        minY = Math.min(minY, y2 - h / 2);
        maxY = Math.max(maxY, y2 + h / 2);
      }
    };
    g.getAllNodes().forEach((v) => {
      getExtremes(v);
    });
    g.getAllEdges().forEach((e) => {
      if (e === null || e === void 0 ? void 0 : e.data.hasOwnProperty("x")) {
        getExtremes(e);
      }
    });
    minX -= marginX;
    minY -= marginY;
    g.getAllNodes().forEach((node) => {
      node.data.x -= minX;
      node.data.y -= minY;
    });
    g.getAllEdges().forEach((edge) => {
      var _a2;
      (_a2 = edge.data.points) === null || _a2 === void 0 ? void 0 : _a2.forEach((p) => {
        p.x -= minX;
        p.y -= minY;
      });
      if (edge.data.hasOwnProperty("x")) {
        edge.data.x -= minX;
      }
      if (edge.data.hasOwnProperty("y")) {
        edge.data.y -= minY;
      }
    });
    return {
      width: maxX - minX + marginX,
      height: maxY - minY + marginY
    };
  };
  const assignNodeIntersects$1 = (g) => {
    g.getAllEdges().forEach((e) => {
      const nodeV = g.getNode(e.source);
      const nodeW = g.getNode(e.target);
      let p1;
      let p2;
      if (!e.data.points) {
        e.data.points = [];
        p1 = { x: nodeW.data.x, y: nodeW.data.y };
        p2 = { x: nodeV.data.x, y: nodeV.data.y };
      } else {
        p1 = e.data.points[0];
        p2 = e.data.points[e.data.points.length - 1];
      }
      e.data.points.unshift(intersectRect$1(nodeV.data, p1));
      e.data.points.push(intersectRect$1(nodeW.data, p2));
    });
  };
  const fixupEdgeLabelCoords$1 = (g) => {
    g.getAllEdges().forEach((edge) => {
      if (edge.data.hasOwnProperty("x")) {
        if (edge.data.labelpos === "l" || edge.data.labelpos === "r") {
          edge.data.width -= edge.data.labeloffset;
        }
        switch (edge.data.labelpos) {
          case "l":
            edge.data.x -= edge.data.width / 2 + edge.data.labeloffset;
            break;
          case "r":
            edge.data.x += edge.data.width / 2 + edge.data.labeloffset;
            break;
        }
      }
    });
  };
  const reversePointsForReversedEdges$1 = (g) => {
    g.getAllEdges().forEach((edge) => {
      var _a2;
      if (edge.data.reversed) {
        (_a2 = edge.data.points) === null || _a2 === void 0 ? void 0 : _a2.reverse();
      }
    });
  };
  const removeBorderNodes$1 = (g) => {
    g.getAllNodes().forEach((v) => {
      var _a2, _b, _c;
      if ((_a2 = g.getChildren(v.id)) === null || _a2 === void 0 ? void 0 : _a2.length) {
        const node = g.getNode(v.id);
        const t = g.getNode(node.data.borderTop);
        const b = g.getNode(node.data.borderBottom);
        const l = g.getNode(node.data.borderLeft[((_b = node.data.borderLeft) === null || _b === void 0 ? void 0 : _b.length) - 1]);
        const r = g.getNode(node.data.borderRight[((_c = node.data.borderRight) === null || _c === void 0 ? void 0 : _c.length) - 1]);
        node.data.width = Math.abs((r === null || r === void 0 ? void 0 : r.data.x) - (l === null || l === void 0 ? void 0 : l.data.x)) || 10;
        node.data.height = Math.abs((b === null || b === void 0 ? void 0 : b.data.y) - (t === null || t === void 0 ? void 0 : t.data.y)) || 10;
        node.data.x = ((l === null || l === void 0 ? void 0 : l.data.x) || 0) + node.data.width / 2;
        node.data.y = ((t === null || t === void 0 ? void 0 : t.data.y) || 0) + node.data.height / 2;
      }
    });
    g.getAllNodes().forEach((n) => {
      if (n.data.dummy === "border") {
        g.removeNode(n.id);
      }
    });
  };
  const removeSelfEdges$1 = (g) => {
    g.getAllEdges().forEach((e) => {
      if (e.source === e.target) {
        const node = g.getNode(e.source);
        if (!node.data.selfEdges) {
          node.data.selfEdges = [];
        }
        node.data.selfEdges.push(e);
        g.removeEdge(e.id);
      }
    });
  };
  const insertSelfEdges$1 = (g) => {
    const layers = buildLayerMatrix$1(g);
    layers === null || layers === void 0 ? void 0 : layers.forEach((layer) => {
      let orderShift = 0;
      layer === null || layer === void 0 ? void 0 : layer.forEach((v, i) => {
        var _a2;
        const node = g.getNode(v);
        node.data.order = i + orderShift;
        (_a2 = node.data.selfEdges) === null || _a2 === void 0 ? void 0 : _a2.forEach((selfEdge) => {
          addDummyNode$1(g, "selfedge", {
            width: selfEdge.data.width,
            height: selfEdge.data.height,
            rank: node.data.rank,
            order: i + ++orderShift,
            e: selfEdge
          }, "_se");
        });
        delete node.data.selfEdges;
      });
    });
  };
  const positionSelfEdges$1 = (g) => {
    g.getAllNodes().forEach((v) => {
      const node = g.getNode(v.id);
      if (node.data.dummy === "selfedge") {
        const selfNode = g.getNode(node.data.e.source);
        const x2 = selfNode.data.x + selfNode.data.width / 2;
        const y2 = selfNode.data.y;
        const dx = node.data.x - x2;
        const dy = selfNode.data.height / 2;
        if (g.hasEdge(node.data.e.id)) {
          g.updateEdgeData(node.data.e.id, node.data.e.data);
        } else {
          g.addEdge({
            id: node.data.e.id,
            source: node.data.e.source,
            target: node.data.e.target,
            data: node.data.e.data
          });
        }
        g.removeNode(v.id);
        node.data.e.data.points = [
          { x: x2 + 2 * dx / 3, y: y2 - dy },
          { x: x2 + 5 * dx / 6, y: y2 - dy },
          { y: y2, x: x2 + dx },
          { x: x2 + 5 * dx / 6, y: y2 + dy },
          { x: x2 + 2 * dx / 3, y: y2 + dy }
        ];
        node.data.e.data.x = node.data.x;
        node.data.e.data.y = node.data.y;
      }
    });
  };
  const selectNumberAttrs$1 = (obj2, attrs) => {
    const pickedProperties = {};
    attrs === null || attrs === void 0 ? void 0 : attrs.forEach((key) => {
      if (obj2[key] === void 0)
        return;
      pickedProperties[key] = +obj2[key];
    });
    return pickedProperties;
  };
  const canonicalize$1 = (attrs = {}) => {
    const newAttrs = {};
    Object.keys(attrs).forEach((k) => {
      newAttrs[k.toLowerCase()] = attrs[k];
    });
    return newAttrs;
  };
  const isArray = Array.isArray;
  const floydWarshall = (adjMatrix) => {
    const dist = [];
    const size = adjMatrix.length;
    for (let i = 0; i < size; i += 1) {
      dist[i] = [];
      for (let j = 0; j < size; j += 1) {
        if (i === j) {
          dist[i][j] = 0;
        } else if (adjMatrix[i][j] === 0 || !adjMatrix[i][j]) {
          dist[i][j] = Infinity;
        } else {
          dist[i][j] = adjMatrix[i][j];
        }
      }
    }
    for (let k = 0; k < size; k += 1) {
      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          if (dist[i][j] > dist[i][k] + dist[k][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }
    return dist;
  };
  const getAdjMatrix = (data, directed) => {
    const { nodes, edges } = data;
    const matrix2 = [];
    const nodeMap = {};
    if (!nodes) {
      throw new Error("invalid nodes data!");
    }
    if (nodes) {
      nodes.forEach((node, i) => {
        nodeMap[node.id] = i;
        const row = [];
        matrix2.push(row);
      });
    }
    edges === null || edges === void 0 ? void 0 : edges.forEach((e) => {
      const { source, target } = e;
      const sIndex = nodeMap[source];
      const tIndex = nodeMap[target];
      if (sIndex === void 0 || tIndex === void 0)
        return;
      matrix2[sIndex][tIndex] = 1;
      {
        matrix2[tIndex][sIndex] = 1;
      }
    });
    return matrix2;
  };
  const scaleMatrix = (matrix2, ratio) => {
    const result = [];
    matrix2.forEach((row) => {
      const newRow = [];
      row.forEach((v) => {
        newRow.push(v * ratio);
      });
      result.push(newRow);
    });
    return result;
  };
  const getLayoutBBox = (nodes) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    nodes.forEach((node) => {
      let size = node.data.size;
      if (isArray(size)) {
        if (size.length === 1)
          size = [size[0], size[0]];
      } else if (isNumber(size)) {
        size = [size, size];
      } else if (size === void 0 || isNaN(size)) {
        size = [30, 30];
      }
      const halfSize = [size[0] / 2, size[1] / 2];
      const left = node.data.x - halfSize[0];
      const right = node.data.x + halfSize[0];
      const top = node.data.y - halfSize[1];
      const bottom = node.data.y + halfSize[1];
      if (minX > left)
        minX = left;
      if (minY > top)
        minY = top;
      if (maxX < right)
        maxX = right;
      if (maxY < bottom)
        maxY = bottom;
    });
    return { minX, minY, maxX, maxY };
  };
  const getEuclideanDistance = (p1, p2) => Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
  const graphTreeDfs = (graph2, nodes, fn, mode = "TB", treeKey, stopFns = {}) => {
    if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length))
      return;
    const { stopBranchFn, stopAllFn } = stopFns;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!graph2.hasNode(node.id))
        continue;
      if (stopBranchFn === null || stopBranchFn === void 0 ? void 0 : stopBranchFn(node))
        continue;
      if (stopAllFn === null || stopAllFn === void 0 ? void 0 : stopAllFn(node))
        return;
      if (mode === "TB")
        fn(node);
      graphTreeDfs(graph2, graph2.getChildren(node.id, treeKey), fn, mode, treeKey, stopFns);
      if (mode !== "TB")
        fn(node);
    }
  };
  const clone = (target) => {
    if (target === null) {
      return target;
    }
    if (target instanceof Date) {
      return new Date(target.getTime());
    }
    if (target instanceof Array) {
      const cp = [];
      target.forEach((v) => {
        cp.push(v);
      });
      return cp.map((n) => clone(n));
    }
    if (typeof target === "object") {
      const cp = {};
      Object.keys(target).forEach((k) => {
        cp[k] = clone(target[k]);
      });
      return cp;
    }
    return target;
  };
  const cloneFormatData = (target, initRange) => {
    const cloned = clone(target);
    cloned.data = cloned.data || {};
    if (initRange) {
      if (!isNumber(cloned.data.x))
        cloned.data.x = Math.random() * initRange[0];
      if (!isNumber(cloned.data.y))
        cloned.data.y = Math.random() * initRange[1];
    }
    return cloned;
  };
  function parseSize(size) {
    if (!size)
      return [0, 0, 0];
    if (isNumber(size))
      return [size, size, size];
    else if (size.length === 0)
      return [0, 0, 0];
    const [x2, y2 = x2, z2 = x2] = size;
    return [x2, y2, z2];
  }
  function formatNumberFn(defaultValue, value) {
    let resultFunc;
    if (isFunction(value)) {
      resultFunc = value;
    } else if (isNumber(value)) {
      resultFunc = () => value;
    } else {
      resultFunc = () => defaultValue;
    }
    return resultFunc;
  }
  function formatSizeFn(defaultValue, value, resultIsNumber = true) {
    if (!value && value !== 0) {
      return (d) => {
        const { size } = d.data || {};
        if (size) {
          if (Array.isArray(size))
            return resultIsNumber ? Math.max(...size) || defaultValue : size;
          if (isObject(size) && size.width && size.height) {
            return resultIsNumber ? Math.max(size.width, size.height) || defaultValue : [size.width, size.height];
          }
          return size;
        }
        return defaultValue;
      };
    }
    if (isFunction(value))
      return value;
    if (isNumber(value))
      return () => value;
    if (Array.isArray(value)) {
      return () => {
        if (resultIsNumber)
          return Math.max(...value) || defaultValue;
        return value;
      };
    }
    if (isObject(value) && value.width && value.height) {
      return () => {
        if (resultIsNumber)
          return Math.max(value.width, value.height) || defaultValue;
        return [value.width, value.height];
      };
    }
    return () => defaultValue;
  }
  const formatNodeSizeToNumber = (nodeSize, nodeSpacing, defaultNodeSize = 10) => {
    let nodeSizeFunc;
    const nodeSpacingFunc = typeof nodeSpacing === "function" ? nodeSpacing : () => nodeSpacing || 0;
    if (!nodeSize) {
      nodeSizeFunc = (d) => {
        var _a2, _b, _c;
        if ((_a2 = d.data) === null || _a2 === void 0 ? void 0 : _a2.bboxSize)
          return (_b = d.data) === null || _b === void 0 ? void 0 : _b.bboxSize;
        if ((_c = d.data) === null || _c === void 0 ? void 0 : _c.size) {
          const dataSize = d.data.size;
          if (Array.isArray(dataSize))
            return dataSize;
          if (isObject(dataSize))
            return [dataSize.width, dataSize.height];
          return dataSize;
        }
        return defaultNodeSize;
      };
    } else if (Array.isArray(nodeSize)) {
      nodeSizeFunc = (d) => nodeSize;
    } else if (isFunction(nodeSize)) {
      nodeSizeFunc = nodeSize;
    } else {
      nodeSizeFunc = (d) => nodeSize;
    }
    const func = (d) => {
      const nodeSize2 = nodeSizeFunc(d);
      const nodeSpacing2 = nodeSpacingFunc(d);
      return Math.max(...parseSize(nodeSize2)) + nodeSpacing2;
    };
    return func;
  };
  const DEFAULTS_LAYOUT_OPTIONS$b = {
    rankdir: "TB",
    nodesep: 50,
    ranksep: 50,
    edgeLabelSpace: true,
    ranker: "tight-tree",
    controlPoints: false,
    radial: false,
    focusNode: null
    // radial 为 true 时生效，关注的节点
  };
  class AntVDagreLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "antv-dagre";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$b), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericDagreLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericDagreLayout(true, graph2, options);
      });
    }
    genericDagreLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const {
          nodeSize,
          align,
          rankdir = "TB",
          ranksep,
          nodesep,
          ranksepFunc,
          nodesepFunc,
          edgeLabelSpace,
          ranker,
          nodeOrder,
          begin,
          controlPoints,
          radial,
          sortByCombo,
          // focusNode,
          preset
        } = mergedOptions;
        const g = new Graph$8({
          tree: []
        });
        const ranksepfunc = formatNumberFn(ranksep || 50, ranksepFunc);
        const nodesepfunc = formatNumberFn(nodesep || 50, nodesepFunc);
        let horisep = nodesepfunc;
        let vertisep = ranksepfunc;
        if (rankdir === "LR" || rankdir === "RL") {
          horisep = ranksepfunc;
          vertisep = nodesepfunc;
        }
        const nodeSizeFunc = formatSizeFn(10, nodeSize, false);
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        nodes.forEach((node) => {
          const size = parseSize(nodeSizeFunc(node));
          const verti = vertisep(node);
          const hori = horisep(node);
          const width2 = size[0] + 2 * hori;
          const height = size[1] + 2 * verti;
          const layer = node.data.layer;
          if (isNumber(layer)) {
            g.addNode({
              id: node.id,
              data: { width: width2, height, layer }
            });
          } else {
            g.addNode({
              id: node.id,
              data: { width: width2, height }
            });
          }
        });
        if (sortByCombo) {
          g.attachTreeStructure("combo");
          nodes.forEach((node) => {
            const { parentId } = node.data;
            if (parentId === void 0)
              return;
            if (g.hasNode(parentId)) {
              g.setParent(node.id, parentId, "combo");
            }
          });
        }
        edges.forEach((edge) => {
          g.addEdge({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: {
              weight: edge.data.weight || 1
            }
          });
        });
        let prevGraph = void 0;
        if (preset === null || preset === void 0 ? void 0 : preset.length) {
          prevGraph = new Graph$8({
            nodes: preset
          });
        }
        layout$1(g, {
          prevGraph,
          edgeLabelSpace,
          keepNodeOrder: !!nodeOrder,
          nodeOrder: nodeOrder || [],
          acyclicer: "greedy",
          ranker,
          rankdir,
          nodesep,
          align
        });
        const layoutTopLeft = [0, 0];
        if (begin) {
          let minX = Infinity;
          let minY = Infinity;
          g.getAllNodes().forEach((node) => {
            if (minX > node.data.x)
              minX = node.data.x;
            if (minY > node.data.y)
              minY = node.data.y;
          });
          g.getAllEdges().forEach((edge) => {
            var _a2;
            (_a2 = edge.data.points) === null || _a2 === void 0 ? void 0 : _a2.forEach((point) => {
              if (minX > point.x)
                minX = point.x;
              if (minY > point.y)
                minY = point.y;
            });
          });
          layoutTopLeft[0] = begin[0] - minX;
          layoutTopLeft[1] = begin[1] - minY;
        }
        const isHorizontal = rankdir === "LR" || rankdir === "RL";
        if (radial) ;
        else {
          const layerCoords = /* @__PURE__ */ new Set();
          const isInvert = rankdir === "BT" || rankdir === "RL";
          const layerCoordSort = isInvert ? (a2, b) => b - a2 : (a2, b) => a2 - b;
          g.getAllNodes().forEach((node) => {
            node.data.x = node.data.x + layoutTopLeft[0];
            node.data.y = node.data.y + layoutTopLeft[1];
            layerCoords.add(isHorizontal ? node.data.x : node.data.y);
          });
          const layerCoordsArr = Array.from(layerCoords).sort(layerCoordSort);
          const isDifferentLayer = isHorizontal ? (point1, point2) => point1.x !== point2.x : (point1, point2) => point1.y !== point2.y;
          const filterControlPointsOutOfBoundary = isHorizontal ? (ps, point1, point2) => {
            const max2 = Math.max(point1.y, point2.y);
            const min2 = Math.min(point1.y, point2.y);
            return ps.filter((point) => point.y <= max2 && point.y >= min2);
          } : (ps, point1, point2) => {
            const max2 = Math.max(point1.x, point2.x);
            const min2 = Math.min(point1.x, point2.x);
            return ps.filter((point) => point.x <= max2 && point.x >= min2);
          };
          g.getAllEdges().forEach((edge, i) => {
            var _a2;
            if (edgeLabelSpace && controlPoints && edge.data.type !== "loop") {
              edge.data.controlPoints = getControlPoints((_a2 = edge.data.points) === null || _a2 === void 0 ? void 0 : _a2.map(({ x: x2, y: y2 }) => ({
                x: x2 + layoutTopLeft[0],
                y: y2 + layoutTopLeft[1]
              })), g.getNode(edge.source), g.getNode(edge.target), layerCoordsArr, isHorizontal, isDifferentLayer, filterControlPointsOutOfBoundary);
            }
          });
        }
        let layoutNodes = [];
        layoutNodes = g.getAllNodes().map((node) => cloneFormatData(node));
        const layoutEdges = g.getAllEdges();
        if (assign) {
          layoutNodes.forEach((node) => {
            graph2.mergeNodeData(node.id, {
              x: node.data.x,
              y: node.data.y
            });
          });
          layoutEdges.forEach((edge) => {
            graph2.mergeEdgeData(edge.id, {
              controlPoints: edge.data.controlPoints
            });
          });
        }
        const result = {
          nodes: layoutNodes,
          edges: layoutEdges
        };
        return result;
      });
    }
  }
  const getControlPoints = (points, sourceNode, targetNode, layerCoordsArr, isHorizontal, isDifferentLayer, filterControlPointsOutOfBoundary) => {
    let controlPoints = (points === null || points === void 0 ? void 0 : points.slice(1, points.length - 1)) || [];
    if (sourceNode && targetNode) {
      let { x: sourceX, y: sourceY } = sourceNode.data;
      let { x: targetX, y: targetY } = targetNode.data;
      if (isHorizontal) {
        sourceX = sourceNode.data.y;
        sourceY = sourceNode.data.x;
        targetX = targetNode.data.y;
        targetY = targetNode.data.x;
      }
      if (targetY !== sourceY && sourceX !== targetX) {
        const sourceLayer = layerCoordsArr.indexOf(sourceY);
        const sourceNextLayerCoord = layerCoordsArr[sourceLayer + 1];
        if (sourceNextLayerCoord) {
          const firstControlPoint = controlPoints[0];
          const insertStartControlPoint = isHorizontal ? {
            x: (sourceY + sourceNextLayerCoord) / 2,
            y: (firstControlPoint === null || firstControlPoint === void 0 ? void 0 : firstControlPoint.y) || targetX
          } : {
            x: (firstControlPoint === null || firstControlPoint === void 0 ? void 0 : firstControlPoint.x) || targetX,
            y: (sourceY + sourceNextLayerCoord) / 2
          };
          if (!firstControlPoint || isDifferentLayer(firstControlPoint, insertStartControlPoint)) {
            controlPoints.unshift(insertStartControlPoint);
          }
        }
        const targetLayer = layerCoordsArr.indexOf(targetY);
        const layerDiff = Math.abs(targetLayer - sourceLayer);
        if (layerDiff === 1) {
          controlPoints = filterControlPointsOutOfBoundary(controlPoints, sourceNode.data, targetNode.data);
          if (!controlPoints.length) {
            controlPoints.push(isHorizontal ? {
              x: (sourceY + targetY) / 2,
              y: sourceX
            } : {
              x: sourceX,
              y: (sourceY + targetY) / 2
            });
          }
        } else if (layerDiff > 1) {
          const targetLastLayerCoord = layerCoordsArr[targetLayer - 1];
          if (targetLastLayerCoord) {
            const lastControlPoints = controlPoints[controlPoints.length - 1];
            const insertEndControlPoint = isHorizontal ? {
              x: (targetY + targetLastLayerCoord) / 2,
              y: (lastControlPoints === null || lastControlPoints === void 0 ? void 0 : lastControlPoints.y) || targetX
            } : {
              x: (lastControlPoints === null || lastControlPoints === void 0 ? void 0 : lastControlPoints.x) || sourceX,
              y: (targetY + targetLastLayerCoord) / 2
            };
            if (!lastControlPoints || isDifferentLayer(lastControlPoints, insertEndControlPoint)) {
              controlPoints.push(insertEndControlPoint);
            }
          }
        }
      }
    }
    return controlPoints;
  };
  const handleSingleNodeGraph = (graph2, assign, center) => {
    const nodes = graph2.getAllNodes();
    const edges = graph2.getAllEdges();
    if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
      const result = { nodes: [], edges };
      return result;
    }
    if (nodes.length === 1) {
      if (assign) {
        graph2.mergeNodeData(nodes[0].id, {
          x: center[0],
          y: center[1]
        });
      }
      const result = {
        nodes: [
          Object.assign(Object.assign({}, nodes[0]), { data: Object.assign(Object.assign({}, nodes[0].data), { x: center[0], y: center[1] }) })
        ],
        edges
      };
      return result;
    }
  };
  const DEFAULTS_LAYOUT_OPTIONS$a = {
    radius: null,
    startRadius: null,
    endRadius: null,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    clockwise: true,
    divisions: 1,
    ordering: null,
    angleRatio: 1
  };
  class CircularLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "circular";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$a), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericCircularLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericCircularLayout(true, graph2, options);
      });
    }
    genericCircularLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const { width: width2, height, center, divisions, startAngle = 0, endAngle = 2 * Math.PI, angleRatio, ordering, clockwise, nodeSpacing: paramNodeSpacing, nodeSize: paramNodeSize } = mergedOptions;
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        const [calculatedWidth, calculatedHeight, calculatedCenter] = calculateCenter(width2, height, center);
        const n = nodes === null || nodes === void 0 ? void 0 : nodes.length;
        if (!n || n === 1) {
          return handleSingleNodeGraph(graph2, assign, calculatedCenter);
        }
        const angleStep = (endAngle - startAngle) / n;
        let { radius, startRadius, endRadius } = mergedOptions;
        if (paramNodeSpacing) {
          const nodeSpacing = formatNumberFn(10, paramNodeSpacing);
          const nodeSize = formatSizeFn(10, paramNodeSize);
          let maxNodeSize = -Infinity;
          nodes.forEach((node) => {
            const nSize = nodeSize(node);
            if (maxNodeSize < nSize)
              maxNodeSize = nSize;
          });
          let perimeter = 0;
          nodes.forEach((node, i) => {
            if (i === 0)
              perimeter += maxNodeSize || 10;
            else
              perimeter += (nodeSpacing(node) || 0) + (maxNodeSize || 10);
          });
          radius = perimeter / (2 * Math.PI);
        } else if (!radius && !startRadius && !endRadius) {
          radius = Math.min(calculatedHeight, calculatedWidth) / 2;
        } else if (!startRadius && endRadius) {
          startRadius = endRadius;
        } else if (startRadius && !endRadius) {
          endRadius = startRadius;
        }
        const astep = angleStep * angleRatio;
        let layoutNodes = [];
        if (ordering === "topology") {
          layoutNodes = topologyOrdering(graph2, nodes);
        } else if (ordering === "topology-directed") {
          layoutNodes = topologyOrdering(graph2, nodes, true);
        } else if (ordering === "degree") {
          layoutNodes = degreeOrdering(graph2, nodes);
        } else {
          layoutNodes = nodes.map((node) => cloneFormatData(node));
        }
        const divN = Math.ceil(n / divisions);
        for (let i = 0; i < n; ++i) {
          let r = radius;
          if (!r && startRadius !== null && endRadius !== null) {
            r = startRadius + i * (endRadius - startRadius) / (n - 1);
          }
          if (!r) {
            r = 10 + i * 100 / (n - 1);
          }
          let angle = startAngle + i % divN * astep + 2 * Math.PI / divisions * Math.floor(i / divN);
          if (!clockwise) {
            angle = endAngle - i % divN * astep - 2 * Math.PI / divisions * Math.floor(i / divN);
          }
          layoutNodes[i].data.x = calculatedCenter[0] + Math.cos(angle) * r;
          layoutNodes[i].data.y = calculatedCenter[1] + Math.sin(angle) * r;
        }
        if (assign) {
          layoutNodes.forEach((node) => {
            graph2.mergeNodeData(node.id, {
              x: node.data.x,
              y: node.data.y
            });
          });
        }
        const result = {
          nodes: layoutNodes,
          edges
        };
        return result;
      });
    }
  }
  const topologyOrdering = (graph2, nodes, directed = false) => {
    const orderedCNodes = [cloneFormatData(nodes[0])];
    const pickFlags = {};
    const n = nodes.length;
    pickFlags[nodes[0].id] = true;
    let k = 0;
    nodes.forEach((node, i) => {
      if (i !== 0) {
        if ((i === n - 1 || graph2.getDegree(node.id, "both") !== graph2.getDegree(nodes[i + 1].id, "both") || graph2.areNeighbors(orderedCNodes[k].id, node.id)) && !pickFlags[node.id]) {
          orderedCNodes.push(cloneFormatData(node));
          pickFlags[node.id] = true;
          k++;
        } else {
          const children = directed ? graph2.getSuccessors(orderedCNodes[k].id) : graph2.getNeighbors(orderedCNodes[k].id);
          let foundChild = false;
          for (let j = 0; j < children.length; j++) {
            const child = children[j];
            if (graph2.getDegree(child.id) === graph2.getDegree(node.id) && !pickFlags[child.id]) {
              orderedCNodes.push(cloneFormatData(child));
              pickFlags[child.id] = true;
              foundChild = true;
              break;
            }
          }
          let ii = 0;
          while (!foundChild) {
            if (!pickFlags[nodes[ii].id]) {
              orderedCNodes.push(cloneFormatData(nodes[ii]));
              pickFlags[nodes[ii].id] = true;
              foundChild = true;
            }
            ii++;
            if (ii === n) {
              break;
            }
          }
        }
      }
    });
    return orderedCNodes;
  };
  function degreeOrdering(graph2, nodes) {
    const orderedNodes = [];
    nodes.forEach((node, i) => {
      orderedNodes.push(cloneFormatData(node));
    });
    orderedNodes.sort((nodeA, nodeB) => graph2.getDegree(nodeA.id, "both") - graph2.getDegree(nodeB.id, "both"));
    return orderedNodes;
  }
  const calculateCenter = (width2, height, center) => {
    let calculatedWidth = width2;
    let calculatedHeight = height;
    let calculatedCenter = center;
    if (!calculatedWidth && typeof window !== "undefined") {
      calculatedWidth = window.innerWidth;
    }
    if (!calculatedHeight && typeof window !== "undefined") {
      calculatedHeight = window.innerHeight;
    }
    if (!calculatedCenter) {
      calculatedCenter = [calculatedWidth / 2, calculatedHeight / 2];
    }
    return [calculatedWidth, calculatedHeight, calculatedCenter];
  };
  const DEFAULTS_LAYOUT_OPTIONS$9 = {
    nodeSize: 30,
    nodeSpacing: 10,
    preventOverlap: false,
    sweep: void 0,
    equidistant: false,
    startAngle: 3 / 2 * Math.PI,
    clockwise: true,
    maxLevelDiff: void 0,
    sortBy: "degree"
  };
  class ConcentricLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "concentric";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$9), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericConcentricLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericConcentricLayout(true, graph2, options);
      });
    }
    genericConcentricLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const { center: propsCenter, width: propsWidth, height: propsHeight, sortBy: propsSortBy, maxLevelDiff: propsMaxLevelDiff, sweep: propsSweep, clockwise, equidistant, preventOverlap, startAngle = 3 / 2 * Math.PI, nodeSize, nodeSpacing } = mergedOptions;
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        const width2 = !propsWidth && typeof window !== "undefined" ? window.innerWidth : propsWidth;
        const height = !propsHeight && typeof window !== "undefined" ? window.innerHeight : propsHeight;
        const center = !propsCenter ? [width2 / 2, height / 2] : propsCenter;
        if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length) || nodes.length === 1) {
          return handleSingleNodeGraph(graph2, assign, center);
        }
        const layoutNodes = [];
        let maxNodeSize;
        let maxNodeSpacing = 0;
        if (isArray(nodeSize)) {
          maxNodeSize = Math.max(nodeSize[0], nodeSize[1]);
        } else if (isFunction(nodeSize)) {
          maxNodeSize = -Infinity;
          nodes.forEach((node) => {
            const currentSize = Math.max(...parseSize(nodeSize(node)));
            if (currentSize > maxNodeSize)
              maxNodeSize = currentSize;
          });
        } else {
          maxNodeSize = nodeSize;
        }
        if (isArray(nodeSpacing)) {
          maxNodeSpacing = Math.max(nodeSpacing[0], nodeSpacing[1]);
        } else if (isNumber(nodeSpacing)) {
          maxNodeSpacing = nodeSpacing;
        }
        nodes.forEach((node) => {
          const cnode = cloneFormatData(node);
          layoutNodes.push(cnode);
          let nodeSize2 = maxNodeSize;
          const { data } = cnode;
          if (isArray(data.size)) {
            nodeSize2 = Math.max(data.size[0], data.size[1]);
          } else if (isNumber(data.size)) {
            nodeSize2 = data.size;
          } else if (isObject(data.size)) {
            nodeSize2 = Math.max(data.size.width, data.size.height);
          }
          maxNodeSize = Math.max(maxNodeSize, nodeSize2);
          if (isFunction(nodeSpacing)) {
            maxNodeSpacing = Math.max(nodeSpacing(node), maxNodeSpacing);
          }
        });
        const nodeIdxMap = {};
        layoutNodes.forEach((node, i) => {
          nodeIdxMap[node.id] = i;
        });
        let sortBy = propsSortBy;
        if (!isString(sortBy) || layoutNodes[0].data[sortBy] === void 0) {
          sortBy = "degree";
        }
        if (sortBy === "degree") {
          layoutNodes.sort((n1, n2) => graph2.getDegree(n2.id, "both") - graph2.getDegree(n1.id, "both"));
        } else {
          layoutNodes.sort((n1, n2) => n2.data[sortBy] - n1.data[sortBy]);
        }
        const maxValueNode = layoutNodes[0];
        const maxLevelDiff = (propsMaxLevelDiff || (sortBy === "degree" ? graph2.getDegree(maxValueNode.id, "both") : maxValueNode.data[sortBy])) / 4;
        const levels = [{ nodes: [] }];
        let currentLevel = levels[0];
        layoutNodes.forEach((node) => {
          if (currentLevel.nodes.length > 0) {
            const diff = sortBy === "degree" ? Math.abs(graph2.getDegree(currentLevel.nodes[0].id, "both") - graph2.getDegree(node.id, "both")) : Math.abs(currentLevel.nodes[0].data[sortBy] - node.data[sortBy]);
            if (maxLevelDiff && diff >= maxLevelDiff) {
              currentLevel = { nodes: [] };
              levels.push(currentLevel);
            }
          }
          currentLevel.nodes.push(node);
        });
        let minDist = maxNodeSize + maxNodeSpacing;
        if (!preventOverlap) {
          const firstLvlHasMulti = levels.length > 0 && levels[0].nodes.length > 1;
          const maxR = Math.min(width2, height) / 2 - minDist;
          const rStep = maxR / (levels.length + (firstLvlHasMulti ? 1 : 0));
          minDist = Math.min(minDist, rStep);
        }
        let r = 0;
        levels.forEach((level) => {
          const sweep = propsSweep === void 0 ? 2 * Math.PI - 2 * Math.PI / level.nodes.length : propsSweep;
          level.dTheta = sweep / Math.max(1, level.nodes.length - 1);
          if (level.nodes.length > 1 && preventOverlap) {
            const dcos = Math.cos(level.dTheta) - Math.cos(0);
            const dsin = Math.sin(level.dTheta) - Math.sin(0);
            const rMin = Math.sqrt(minDist * minDist / (dcos * dcos + dsin * dsin));
            r = Math.max(rMin, r);
          }
          level.r = r;
          r += minDist;
        });
        if (equidistant) {
          let rDeltaMax = 0;
          let rr = 0;
          for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const rDelta = (level.r || 0) - rr;
            rDeltaMax = Math.max(rDeltaMax, rDelta);
          }
          rr = 0;
          levels.forEach((level, i) => {
            if (i === 0) {
              rr = level.r || 0;
            }
            level.r = rr;
            rr += rDeltaMax;
          });
        }
        levels.forEach((level) => {
          const dTheta = level.dTheta || 0;
          const rr = level.r || 0;
          level.nodes.forEach((node, j) => {
            const theta = startAngle + (clockwise ? 1 : -1) * dTheta * j;
            node.data.x = center[0] + rr * Math.cos(theta);
            node.data.y = center[1] + rr * Math.sin(theta);
          });
        });
        if (assign) {
          layoutNodes.forEach((node) => graph2.mergeNodeData(node.id, {
            x: node.data.x,
            y: node.data.y
          }));
        }
        const result = {
          nodes: layoutNodes,
          edges
        };
        return result;
      });
    }
  }
  function tree_add$2(d) {
    const x2 = +this._x.call(null, d), y2 = +this._y.call(null, d);
    return add$2(this.cover(x2, y2), x2, y2, d);
  }
  function add$2(tree, x2, y2, d) {
    if (isNaN(x2) || isNaN(y2)) return tree;
    var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i, j;
    if (!node) return tree._root = leaf, tree;
    while (node.length) {
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
      else y1 = ym;
      if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
    }
    xp = +tree._x.call(null, node.data);
    yp = +tree._y.call(null, node.data);
    if (x2 === xp && y2 === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
    do {
      parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
      else y1 = ym;
    } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
    return parent[j] = node, parent[i] = leaf, tree;
  }
  function addAll$2(data) {
    var d, i, n = data.length, x2, y2, xz = new Array(n), yz = new Array(n), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (i = 0; i < n; ++i) {
      if (isNaN(x2 = +this._x.call(null, d = data[i])) || isNaN(y2 = +this._y.call(null, d))) continue;
      xz[i] = x2;
      yz[i] = y2;
      if (x2 < x0) x0 = x2;
      if (x2 > x1) x1 = x2;
      if (y2 < y0) y0 = y2;
      if (y2 > y1) y1 = y2;
    }
    if (x0 > x1 || y0 > y1) return this;
    this.cover(x0, y0).cover(x1, y1);
    for (i = 0; i < n; ++i) {
      add$2(this, xz[i], yz[i], data[i]);
    }
    return this;
  }
  function tree_cover$2(x2, y2) {
    if (isNaN(x2 = +x2) || isNaN(y2 = +y2)) return this;
    var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x2)) + 1;
      y1 = (y0 = Math.floor(y2)) + 1;
    } else {
      var z2 = x1 - x0 || 1, node = this._root, parent, i;
      while (x0 > x2 || x2 >= x1 || y0 > y2 || y2 >= y1) {
        i = (y2 < y0) << 1 | x2 < x0;
        parent = new Array(4), parent[i] = node, node = parent, z2 *= 2;
        switch (i) {
          case 0:
            x1 = x0 + z2, y1 = y0 + z2;
            break;
          case 1:
            x0 = x1 - z2, y1 = y0 + z2;
            break;
          case 2:
            x1 = x0 + z2, y0 = y1 - z2;
            break;
          case 3:
            x0 = x1 - z2, y0 = y1 - z2;
            break;
        }
      }
      if (this._root && this._root.length) this._root = node;
    }
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    return this;
  }
  function tree_data$2() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do
        data.push(node.data);
      while (node = node.next);
    });
    return data;
  }
  function tree_extent$2(_2) {
    return arguments.length ? this.cover(+_2[0][0], +_2[0][1]).cover(+_2[1][0], +_2[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
  }
  function Quad$1(node, x0, y0, x1, y1) {
    this.node = node;
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }
  function tree_find$2(x2, y2, radius) {
    var data, x0 = this._x0, y0 = this._y0, x1, y1, x22, y22, x3 = this._x1, y3 = this._y1, quads = [], node = this._root, q, i;
    if (node) quads.push(new Quad$1(node, x0, y0, x3, y3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x2 - radius, y0 = y2 - radius;
      x3 = x2 + radius, y3 = y2 + radius;
      radius *= radius;
    }
    while (q = quads.pop()) {
      if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0) continue;
      if (node.length) {
        var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2;
        quads.push(
          new Quad$1(node[3], xm, ym, x22, y22),
          new Quad$1(node[2], x1, ym, xm, y22),
          new Quad$1(node[1], xm, y1, x22, ym),
          new Quad$1(node[0], x1, y1, xm, ym)
        );
        if (i = (y2 >= ym) << 1 | x2 >= xm) {
          q = quads[quads.length - 1];
          quads[quads.length - 1] = quads[quads.length - 1 - i];
          quads[quads.length - 1 - i] = q;
        }
      } else {
        var dx = x2 - +this._x.call(null, node.data), dy = y2 - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x2 - d, y0 = y2 - d;
          x3 = x2 + d, y3 = y2 + d;
          data = node.data;
        }
      }
    }
    return data;
  }
  function tree_remove$2(d) {
    if (isNaN(x2 = +this._x.call(null, d)) || isNaN(y2 = +this._y.call(null, d))) return this;
    var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x2, y2, xm, ym, right, bottom, i, j;
    if (!node) return this;
    if (node.length) while (true) {
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
      else y1 = ym;
      if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
      if (!node.length) break;
      if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
    }
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;
    if (previous) return next ? previous.next = next : delete previous.next, this;
    if (!parent) return this._root = next, this;
    next ? parent[i] = next : delete parent[i];
    if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }
    return this;
  }
  function removeAll$2(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }
  function tree_root$2() {
    return this._root;
  }
  function tree_size$2() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do
        ++size;
      while (node = node.next);
    });
    return size;
  }
  function tree_visit$2(callback) {
    var quads = [], q, node = this._root, child, x0, y0, x1, y1;
    if (node) quads.push(new Quad$1(node, this._x0, this._y0, this._x1, this._y1));
    while (q = quads.pop()) {
      if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
        var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
        if (child = node[3]) quads.push(new Quad$1(child, xm, ym, x1, y1));
        if (child = node[2]) quads.push(new Quad$1(child, x0, ym, xm, y1));
        if (child = node[1]) quads.push(new Quad$1(child, xm, y0, x1, ym));
        if (child = node[0]) quads.push(new Quad$1(child, x0, y0, xm, ym));
      }
    }
    return this;
  }
  function tree_visitAfter$2(callback) {
    var quads = [], next = [], q;
    if (this._root) quads.push(new Quad$1(this._root, this._x0, this._y0, this._x1, this._y1));
    while (q = quads.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
        if (child = node[0]) quads.push(new Quad$1(child, x0, y0, xm, ym));
        if (child = node[1]) quads.push(new Quad$1(child, xm, y0, x1, ym));
        if (child = node[2]) quads.push(new Quad$1(child, x0, ym, xm, y1));
        if (child = node[3]) quads.push(new Quad$1(child, xm, ym, x1, y1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.y0, q.x1, q.y1);
    }
    return this;
  }
  function defaultX$2(d) {
    return d[0];
  }
  function tree_x$2(_2) {
    return arguments.length ? (this._x = _2, this) : this._x;
  }
  function defaultY$1(d) {
    return d[1];
  }
  function tree_y$1(_2) {
    return arguments.length ? (this._y = _2, this) : this._y;
  }
  function quadtree(nodes, x2, y2) {
    var tree = new Quadtree(x2 == null ? defaultX$2 : x2, y2 == null ? defaultY$1 : y2, NaN, NaN, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }
  function Quadtree(x2, y2, x0, y0, x1, y1) {
    this._x = x2;
    this._y = y2;
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    this._root = void 0;
  }
  function leaf_copy$2(leaf) {
    var copy = { data: leaf.data }, next = copy;
    while (leaf = leaf.next) next = next.next = { data: leaf.data };
    return copy;
  }
  var treeProto$2 = quadtree.prototype = Quadtree.prototype;
  treeProto$2.copy = function() {
    var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
    if (!node) return copy;
    if (!node.length) return copy._root = leaf_copy$2(node), copy;
    nodes = [{ source: node, target: copy._root = new Array(4) }];
    while (node = nodes.pop()) {
      for (var i = 0; i < 4; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });
          else node.target[i] = leaf_copy$2(child);
        }
      }
    }
    return copy;
  };
  treeProto$2.add = tree_add$2;
  treeProto$2.addAll = addAll$2;
  treeProto$2.cover = tree_cover$2;
  treeProto$2.data = tree_data$2;
  treeProto$2.extent = tree_extent$2;
  treeProto$2.find = tree_find$2;
  treeProto$2.remove = tree_remove$2;
  treeProto$2.removeAll = removeAll$2;
  treeProto$2.root = tree_root$2;
  treeProto$2.size = tree_size$2;
  treeProto$2.visit = tree_visit$2;
  treeProto$2.visitAfter = tree_visitAfter$2;
  treeProto$2.x = tree_x$2;
  treeProto$2.y = tree_y$1;
  function tree_add$1(d) {
    const x2 = +this._x.call(null, d), y2 = +this._y.call(null, d), z2 = +this._z.call(null, d);
    return add$1(this.cover(x2, y2, z2), x2, y2, z2, d);
  }
  function add$1(tree, x2, y2, z2, d) {
    if (isNaN(x2) || isNaN(y2) || isNaN(z2)) return tree;
    var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, z0 = tree._z0, x1 = tree._x1, y1 = tree._y1, z1 = tree._z1, xm, ym, zm, xp, yp, zp, right, bottom, deep, i, j;
    if (!node) return tree._root = leaf, tree;
    while (node.length) {
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
      else y1 = ym;
      if (deep = z2 >= (zm = (z0 + z1) / 2)) z0 = zm;
      else z1 = zm;
      if (parent = node, !(node = node[i = deep << 2 | bottom << 1 | right])) return parent[i] = leaf, tree;
    }
    xp = +tree._x.call(null, node.data);
    yp = +tree._y.call(null, node.data);
    zp = +tree._z.call(null, node.data);
    if (x2 === xp && y2 === yp && z2 === zp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
    do {
      parent = parent ? parent[i] = new Array(8) : tree._root = new Array(8);
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
      else y1 = ym;
      if (deep = z2 >= (zm = (z0 + z1) / 2)) z0 = zm;
      else z1 = zm;
    } while ((i = deep << 2 | bottom << 1 | right) === (j = (zp >= zm) << 2 | (yp >= ym) << 1 | xp >= xm));
    return parent[j] = node, parent[i] = leaf, tree;
  }
  function addAll$1(data) {
    if (!Array.isArray(data)) data = Array.from(data);
    const n = data.length;
    const xz = new Float64Array(n);
    const yz = new Float64Array(n);
    const zz = new Float64Array(n);
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    for (let i = 0, d, x2, y2, z2; i < n; ++i) {
      if (isNaN(x2 = +this._x.call(null, d = data[i])) || isNaN(y2 = +this._y.call(null, d)) || isNaN(z2 = +this._z.call(null, d))) continue;
      xz[i] = x2;
      yz[i] = y2;
      zz[i] = z2;
      if (x2 < x0) x0 = x2;
      if (x2 > x1) x1 = x2;
      if (y2 < y0) y0 = y2;
      if (y2 > y1) y1 = y2;
      if (z2 < z0) z0 = z2;
      if (z2 > z1) z1 = z2;
    }
    if (x0 > x1 || y0 > y1 || z0 > z1) return this;
    this.cover(x0, y0, z0).cover(x1, y1, z1);
    for (let i = 0; i < n; ++i) {
      add$1(this, xz[i], yz[i], zz[i], data[i]);
    }
    return this;
  }
  function tree_cover$1(x2, y2, z2) {
    if (isNaN(x2 = +x2) || isNaN(y2 = +y2) || isNaN(z2 = +z2)) return this;
    var x0 = this._x0, y0 = this._y0, z0 = this._z0, x1 = this._x1, y1 = this._y1, z1 = this._z1;
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x2)) + 1;
      y1 = (y0 = Math.floor(y2)) + 1;
      z1 = (z0 = Math.floor(z2)) + 1;
    } else {
      var t = x1 - x0 || 1, node = this._root, parent, i;
      while (x0 > x2 || x2 >= x1 || y0 > y2 || y2 >= y1 || z0 > z2 || z2 >= z1) {
        i = (z2 < z0) << 2 | (y2 < y0) << 1 | x2 < x0;
        parent = new Array(8), parent[i] = node, node = parent, t *= 2;
        switch (i) {
          case 0:
            x1 = x0 + t, y1 = y0 + t, z1 = z0 + t;
            break;
          case 1:
            x0 = x1 - t, y1 = y0 + t, z1 = z0 + t;
            break;
          case 2:
            x1 = x0 + t, y0 = y1 - t, z1 = z0 + t;
            break;
          case 3:
            x0 = x1 - t, y0 = y1 - t, z1 = z0 + t;
            break;
          case 4:
            x1 = x0 + t, y1 = y0 + t, z0 = z1 - t;
            break;
          case 5:
            x0 = x1 - t, y1 = y0 + t, z0 = z1 - t;
            break;
          case 6:
            x1 = x0 + t, y0 = y1 - t, z0 = z1 - t;
            break;
          case 7:
            x0 = x1 - t, y0 = y1 - t, z0 = z1 - t;
            break;
        }
      }
      if (this._root && this._root.length) this._root = node;
    }
    this._x0 = x0;
    this._y0 = y0;
    this._z0 = z0;
    this._x1 = x1;
    this._y1 = y1;
    this._z1 = z1;
    return this;
  }
  function tree_data$1() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do
        data.push(node.data);
      while (node = node.next);
    });
    return data;
  }
  function tree_extent$1(_2) {
    return arguments.length ? this.cover(+_2[0][0], +_2[0][1], +_2[0][2]).cover(+_2[1][0], +_2[1][1], +_2[1][2]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
  }
  function Octant(node, x0, y0, z0, x1, y1, z1) {
    this.node = node;
    this.x0 = x0;
    this.y0 = y0;
    this.z0 = z0;
    this.x1 = x1;
    this.y1 = y1;
    this.z1 = z1;
  }
  function tree_find$1(x2, y2, z2, radius) {
    var data, x0 = this._x0, y0 = this._y0, z0 = this._z0, x1, y1, z1, x22, y22, z22, x3 = this._x1, y3 = this._y1, z3 = this._z1, octs = [], node = this._root, q, i;
    if (node) octs.push(new Octant(node, x0, y0, z0, x3, y3, z3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x2 - radius, y0 = y2 - radius, z0 = z2 - radius;
      x3 = x2 + radius, y3 = y2 + radius, z3 = z2 + radius;
      radius *= radius;
    }
    while (q = octs.pop()) {
      if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (z1 = q.z0) > z3 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0 || (z22 = q.z1) < z0) continue;
      if (node.length) {
        var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2, zm = (z1 + z22) / 2;
        octs.push(
          new Octant(node[7], xm, ym, zm, x22, y22, z22),
          new Octant(node[6], x1, ym, zm, xm, y22, z22),
          new Octant(node[5], xm, y1, zm, x22, ym, z22),
          new Octant(node[4], x1, y1, zm, xm, ym, z22),
          new Octant(node[3], xm, ym, z1, x22, y22, zm),
          new Octant(node[2], x1, ym, z1, xm, y22, zm),
          new Octant(node[1], xm, y1, z1, x22, ym, zm),
          new Octant(node[0], x1, y1, z1, xm, ym, zm)
        );
        if (i = (z2 >= zm) << 2 | (y2 >= ym) << 1 | x2 >= xm) {
          q = octs[octs.length - 1];
          octs[octs.length - 1] = octs[octs.length - 1 - i];
          octs[octs.length - 1 - i] = q;
        }
      } else {
        var dx = x2 - +this._x.call(null, node.data), dy = y2 - +this._y.call(null, node.data), dz = z2 - +this._z.call(null, node.data), d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x2 - d, y0 = y2 - d, z0 = z2 - d;
          x3 = x2 + d, y3 = y2 + d, z3 = z2 + d;
          data = node.data;
        }
      }
    }
    return data;
  }
  const distance = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
  function findAllWithinRadius(x2, y2, z2, radius) {
    const result = [];
    const xMin = x2 - radius;
    const yMin = y2 - radius;
    const zMin = z2 - radius;
    const xMax = x2 + radius;
    const yMax = y2 + radius;
    const zMax = z2 + radius;
    this.visit((node, x1, y1, z1, x22, y22, z22) => {
      if (!node.length) {
        do {
          const d = node.data;
          if (distance(x2, y2, z2, this._x(d), this._y(d), this._z(d)) <= radius) {
            result.push(d);
          }
        } while (node = node.next);
      }
      return x1 > xMax || y1 > yMax || z1 > zMax || x22 < xMin || y22 < yMin || z22 < zMin;
    });
    return result;
  }
  function tree_remove$1(d) {
    if (isNaN(x2 = +this._x.call(null, d)) || isNaN(y2 = +this._y.call(null, d)) || isNaN(z2 = +this._z.call(null, d))) return this;
    var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, z0 = this._z0, x1 = this._x1, y1 = this._y1, z1 = this._z1, x2, y2, z2, xm, ym, zm, right, bottom, deep, i, j;
    if (!node) return this;
    if (node.length) while (true) {
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
      else y1 = ym;
      if (deep = z2 >= (zm = (z0 + z1) / 2)) z0 = zm;
      else z1 = zm;
      if (!(parent = node, node = node[i = deep << 2 | bottom << 1 | right])) return this;
      if (!node.length) break;
      if (parent[i + 1 & 7] || parent[i + 2 & 7] || parent[i + 3 & 7] || parent[i + 4 & 7] || parent[i + 5 & 7] || parent[i + 6 & 7] || parent[i + 7 & 7]) retainer = parent, j = i;
    }
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;
    if (previous) return next ? previous.next = next : delete previous.next, this;
    if (!parent) return this._root = next, this;
    next ? parent[i] = next : delete parent[i];
    if ((node = parent[0] || parent[1] || parent[2] || parent[3] || parent[4] || parent[5] || parent[6] || parent[7]) && node === (parent[7] || parent[6] || parent[5] || parent[4] || parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }
    return this;
  }
  function removeAll$1(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }
  function tree_root$1() {
    return this._root;
  }
  function tree_size$1() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do
        ++size;
      while (node = node.next);
    });
    return size;
  }
  function tree_visit$1(callback) {
    var octs = [], q, node = this._root, child, x0, y0, z0, x1, y1, z1;
    if (node) octs.push(new Octant(node, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
    while (q = octs.pop()) {
      if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1) && node.length) {
        var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
        if (child = node[7]) octs.push(new Octant(child, xm, ym, zm, x1, y1, z1));
        if (child = node[6]) octs.push(new Octant(child, x0, ym, zm, xm, y1, z1));
        if (child = node[5]) octs.push(new Octant(child, xm, y0, zm, x1, ym, z1));
        if (child = node[4]) octs.push(new Octant(child, x0, y0, zm, xm, ym, z1));
        if (child = node[3]) octs.push(new Octant(child, xm, ym, z0, x1, y1, zm));
        if (child = node[2]) octs.push(new Octant(child, x0, ym, z0, xm, y1, zm));
        if (child = node[1]) octs.push(new Octant(child, xm, y0, z0, x1, ym, zm));
        if (child = node[0]) octs.push(new Octant(child, x0, y0, z0, xm, ym, zm));
      }
    }
    return this;
  }
  function tree_visitAfter$1(callback) {
    var octs = [], next = [], q;
    if (this._root) octs.push(new Octant(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
    while (q = octs.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
        if (child = node[0]) octs.push(new Octant(child, x0, y0, z0, xm, ym, zm));
        if (child = node[1]) octs.push(new Octant(child, xm, y0, z0, x1, ym, zm));
        if (child = node[2]) octs.push(new Octant(child, x0, ym, z0, xm, y1, zm));
        if (child = node[3]) octs.push(new Octant(child, xm, ym, z0, x1, y1, zm));
        if (child = node[4]) octs.push(new Octant(child, x0, y0, zm, xm, ym, z1));
        if (child = node[5]) octs.push(new Octant(child, xm, y0, zm, x1, ym, z1));
        if (child = node[6]) octs.push(new Octant(child, x0, ym, zm, xm, y1, z1));
        if (child = node[7]) octs.push(new Octant(child, xm, ym, zm, x1, y1, z1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.y0, q.z0, q.x1, q.y1, q.z1);
    }
    return this;
  }
  function defaultX$1(d) {
    return d[0];
  }
  function tree_x$1(_2) {
    return arguments.length ? (this._x = _2, this) : this._x;
  }
  function defaultY(d) {
    return d[1];
  }
  function tree_y(_2) {
    return arguments.length ? (this._y = _2, this) : this._y;
  }
  function defaultZ(d) {
    return d[2];
  }
  function tree_z(_2) {
    return arguments.length ? (this._z = _2, this) : this._z;
  }
  function octree(nodes, x2, y2, z2) {
    var tree = new Octree(x2 == null ? defaultX$1 : x2, y2 == null ? defaultY : y2, z2 == null ? defaultZ : z2, NaN, NaN, NaN, NaN, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }
  function Octree(x2, y2, z2, x0, y0, z0, x1, y1, z1) {
    this._x = x2;
    this._y = y2;
    this._z = z2;
    this._x0 = x0;
    this._y0 = y0;
    this._z0 = z0;
    this._x1 = x1;
    this._y1 = y1;
    this._z1 = z1;
    this._root = void 0;
  }
  function leaf_copy$1(leaf) {
    var copy = { data: leaf.data }, next = copy;
    while (leaf = leaf.next) next = next.next = { data: leaf.data };
    return copy;
  }
  var treeProto$1 = octree.prototype = Octree.prototype;
  treeProto$1.copy = function() {
    var copy = new Octree(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), node = this._root, nodes, child;
    if (!node) return copy;
    if (!node.length) return copy._root = leaf_copy$1(node), copy;
    nodes = [{ source: node, target: copy._root = new Array(8) }];
    while (node = nodes.pop()) {
      for (var i = 0; i < 8; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(8) });
          else node.target[i] = leaf_copy$1(child);
        }
      }
    }
    return copy;
  };
  treeProto$1.add = tree_add$1;
  treeProto$1.addAll = addAll$1;
  treeProto$1.cover = tree_cover$1;
  treeProto$1.data = tree_data$1;
  treeProto$1.extent = tree_extent$1;
  treeProto$1.find = tree_find$1;
  treeProto$1.findAllWithinRadius = findAllWithinRadius;
  treeProto$1.remove = tree_remove$1;
  treeProto$1.removeAll = removeAll$1;
  treeProto$1.root = tree_root$1;
  treeProto$1.size = tree_size$1;
  treeProto$1.visit = tree_visit$1;
  treeProto$1.visitAfter = tree_visitAfter$1;
  treeProto$1.x = tree_x$1;
  treeProto$1.y = tree_y;
  treeProto$1.z = tree_z;
  const theta2 = 0.81;
  const epsilon = 0.1;
  function forceNBody(calcGraph, factor, coulombDisScale2, accMap, dimensions = 2) {
    const weightParam = factor / coulombDisScale2;
    const calcNodes = calcGraph.getAllNodes();
    const data = calcNodes.map((calcNode, i) => {
      const { nodeStrength, x: x2, y: y2, z: z2, size } = calcNode.data;
      return {
        x: x2,
        y: y2,
        z: z2,
        size,
        index: i,
        id: calcNode.id,
        vx: 0,
        vy: 0,
        vz: 0,
        weight: weightParam * nodeStrength
      };
    });
    const tree = (dimensions === 2 ? quadtree(data, (d) => d.x, (d) => d.y) : octree(data, (d) => d.x, (d) => d.y, (d) => d.z)).visitAfter(accumulate);
    const nodeMap = /* @__PURE__ */ new Map();
    data.forEach((n) => {
      nodeMap.set(n.id, n);
      computeForce(n, tree, dimensions);
    });
    data.map((n, i) => {
      const { id, data: data2 } = calcNodes[i];
      const { mass = 1 } = data2;
      accMap[id] = {
        x: n.vx / mass,
        y: n.vy / mass,
        z: n.vz / mass
      };
    });
    return accMap;
  }
  function accumulate(treeNode) {
    let accWeight = 0;
    let accX = 0;
    let accY = 0;
    let accZ = 0;
    let accSize = 0;
    const numChildren = treeNode.length;
    if (numChildren) {
      for (let i = 0; i < numChildren; i++) {
        const q = treeNode[i];
        if (q && q.weight) {
          accWeight += q.weight;
          accX += q.x * q.weight;
          accY += q.y * q.weight;
          accZ += q.z * q.weight;
          accSize += q.size * q.weight;
        }
      }
      treeNode.x = accX / accWeight;
      treeNode.y = accY / accWeight;
      treeNode.z = accZ / accWeight;
      treeNode.size = accSize / accWeight;
      treeNode.weight = accWeight;
    } else {
      const q = treeNode;
      treeNode.x = q.data.x;
      treeNode.y = q.data.y;
      treeNode.z = q.data.z;
      treeNode.size = q.data.size;
      treeNode.weight = q.data.weight;
    }
  }
  const apply$1 = (treeNode, x1, arg1, arg2, arg3, node, dimensions) => {
    var _a2;
    if (((_a2 = treeNode.data) === null || _a2 === void 0 ? void 0 : _a2.id) === node.id)
      return;
    const x2 = [arg1, arg2, arg3][dimensions - 1];
    const dx = node.x - treeNode.x || epsilon;
    const dy = node.y - treeNode.y || epsilon;
    const dz = node.z - treeNode.z || epsilon;
    const pos = [dx, dy, dz];
    const width2 = x2 - x1;
    let len2 = 0;
    for (let i = 0; i < dimensions; i++) {
      len2 += pos[i] * pos[i];
    }
    const len1 = Math.sqrt(len2);
    const len3 = len1 * len2;
    if (width2 * width2 * theta2 < len2) {
      const param = treeNode.weight / len3;
      node.vx += dx * param;
      node.vy += dy * param;
      node.vz += dz * param;
      return true;
    }
    if (treeNode.length)
      return false;
    if (treeNode.data !== node) {
      const param = treeNode.data.weight / len3;
      node.vx += dx * param;
      node.vy += dy * param;
      node.vz += dz * param;
    }
  };
  function computeForce(node, tree, dimensions) {
    tree.visit((treeNode, x1, y1, x2, y2) => apply$1(treeNode, x1, y1, x2, y2, node, dimensions));
  }
  const DEFAULTS_LAYOUT_OPTIONS$8 = {
    dimensions: 2,
    maxIteration: 500,
    gravity: 10,
    factor: 1,
    edgeStrength: 50,
    nodeStrength: 1e3,
    coulombDisScale: 5e-3,
    damping: 0.9,
    maxSpeed: 200,
    minMovement: 0.4,
    interval: 0.02,
    linkDistance: 200,
    clusterNodeStrength: 20,
    preventOverlap: true,
    distanceThresholdMode: "mean"
  };
  class ForceLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "force";
      this.timeInterval = 0;
      this.judgingDistance = 0;
      this.running = false;
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$8), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericForceLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericForceLayout(true, graph2, options);
      });
    }
    /**
     * Stop simulation immediately.
     */
    stop() {
      if (this.timeInterval && typeof window !== "undefined") {
        window.clearInterval(this.timeInterval);
      }
      this.running = false;
    }
    /**
     * Manually steps the simulation by the specified number of iterations.
     * @see https://github.com/d3/d3-force#simulation_tick
     */
    tick(iterations = this.options.maxIteration || 1) {
      if (this.lastResult) {
        return this.lastResult;
      }
      for (let i = 0; (this.judgingDistance > this.lastOptions.minMovement || i < 1) && i < iterations; i++) {
        this.runOneStep(this.lastCalcGraph, this.lastGraph, i, this.lastVelMap, this.lastOptions);
        this.updatePosition(this.lastGraph, this.lastCalcGraph, this.lastVelMap, this.lastOptions);
      }
      const result = {
        nodes: this.lastLayoutNodes,
        edges: this.lastLayoutEdges
      };
      if (this.lastAssign) {
        result.nodes.forEach((node) => this.lastGraph.mergeNodeData(node.id, {
          x: node.data.x,
          y: node.data.y,
          z: this.options.dimensions === 3 ? node.data.z : void 0
        }));
      }
      return result;
    }
    genericForceLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        const formattedOptions = this.formatOptions(mergedOptions, graph2);
        const { dimensions, width: width2, height, nodeSize, getMass, nodeStrength, edgeStrength, linkDistance } = formattedOptions;
        const layoutNodes = nodes.map((node, i) => {
          return Object.assign(Object.assign({}, node), { data: Object.assign(Object.assign({}, node.data), {
            // ...randomDistribution(node, dimensions, 30, i),
            x: isNumber(node.data.x) ? node.data.x : Math.random() * width2,
            y: isNumber(node.data.y) ? node.data.y : Math.random() * height,
            z: isNumber(node.data.z) ? node.data.z : Math.random() * Math.sqrt(width2 * height),
            size: nodeSize(node) || 30,
            mass: getMass(node),
            nodeStrength: nodeStrength(node)
          }) });
        });
        const layoutEdges = edges.map((edge) => Object.assign(Object.assign({}, edge), { data: Object.assign(Object.assign({}, edge.data), { edgeStrength: edgeStrength(edge), linkDistance: linkDistance(edge, graph2.getNode(edge.source), graph2.getNode(edge.target)) }) }));
        if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
          this.lastResult = { nodes: [], edges };
          return { nodes: [], edges };
        }
        const velMap = {};
        nodes.forEach((node, i) => {
          velMap[node.id] = {
            x: 0,
            y: 0,
            z: 0
          };
        });
        const calcGraph = new Graph$8({
          nodes: layoutNodes,
          edges: layoutEdges
        });
        this.formatCentripetal(formattedOptions, calcGraph);
        const { maxIteration, minMovement, onTick } = formattedOptions;
        this.lastLayoutNodes = layoutNodes;
        this.lastLayoutEdges = layoutEdges;
        this.lastAssign = assign;
        this.lastGraph = graph2;
        this.lastCalcGraph = calcGraph;
        this.lastOptions = formattedOptions;
        this.lastVelMap = velMap;
        if (typeof window === "undefined")
          return;
        let iter = 0;
        return new Promise((resolve) => {
          this.timeInterval = window.setInterval(() => {
            if (!nodes || !this.running) {
              resolve({
                nodes: formatOutNodes(graph2, layoutNodes),
                edges
              });
            }
            this.runOneStep(calcGraph, graph2, iter, velMap, formattedOptions);
            this.updatePosition(graph2, calcGraph, velMap, formattedOptions);
            if (assign) {
              layoutNodes.forEach((node) => graph2.mergeNodeData(node.id, {
                x: node.data.x,
                y: node.data.y,
                z: dimensions === 3 ? node.data.z : void 0
              }));
            }
            onTick === null || onTick === void 0 ? void 0 : onTick({
              nodes: formatOutNodes(graph2, layoutNodes),
              edges
            });
            iter++;
            if (iter >= maxIteration || this.judgingDistance < minMovement) {
              window.clearInterval(this.timeInterval);
              resolve({
                nodes: formatOutNodes(graph2, layoutNodes),
                edges
              });
            }
          }, 0);
          this.running = true;
        });
      });
    }
    /**
     * Format merged layout options.
     * @param options merged layout options
     * @param graph original graph
     * @returns
     */
    formatOptions(options, graph2) {
      const formattedOptions = Object.assign({}, options);
      const { width: propsWidth, height: propsHeight, getMass } = options;
      formattedOptions.width = !propsWidth && typeof window !== "undefined" ? window.innerWidth : propsWidth;
      formattedOptions.height = !propsHeight && typeof window !== "undefined" ? window.innerHeight : propsHeight;
      if (!options.center) {
        formattedOptions.center = [
          formattedOptions.width / 2,
          formattedOptions.height / 2
        ];
      }
      if (!getMass) {
        formattedOptions.getMass = (d) => {
          let massWeight = 1;
          if (isNumber(d === null || d === void 0 ? void 0 : d.data.mass))
            massWeight = d === null || d === void 0 ? void 0 : d.data.mass;
          const degree = graph2.getDegree(d.id, "both");
          return !degree || degree < 5 ? massWeight : degree * 5 * massWeight;
        };
      }
      formattedOptions.nodeSize = formatNodeSizeToNumber(options.nodeSize, options.nodeSpacing);
      const linkDistanceFn = options.linkDistance ? formatNumberFn(1, options.linkDistance) : (edge) => {
        return 1 + formattedOptions.nodeSize(graph2.getNode(edge.source)) + formattedOptions.nodeSize(graph2.getNode(edge.target));
      };
      formattedOptions.linkDistance = linkDistanceFn;
      formattedOptions.nodeStrength = formatNumberFn(1, options.nodeStrength);
      formattedOptions.edgeStrength = formatNumberFn(1, options.edgeStrength);
      return formattedOptions;
    }
    /**
     * Format centripetalOption in the option.
     * @param options merged layout options
     * @param calcGraph calculation graph
     */
    formatCentripetal(options, calcGraph) {
      const { dimensions, centripetalOptions, center, clusterNodeStrength, leafCluster, clustering, nodeClusterBy } = options;
      const calcNodes = calcGraph.getAllNodes();
      const basicCentripetal = centripetalOptions || {
        leaf: 2,
        single: 2,
        others: 1,
        // eslint-disable-next-line
        center: (n) => {
          return {
            x: center[0],
            y: center[1],
            z: dimensions === 3 ? center[2] : void 0
          };
        }
      };
      if (typeof clusterNodeStrength !== "function") {
        options.clusterNodeStrength = (node) => clusterNodeStrength;
      }
      let sameTypeLeafMap;
      let clusters;
      if (leafCluster && nodeClusterBy) {
        sameTypeLeafMap = getSameTypeLeafMap(calcGraph, nodeClusterBy);
        clusters = Array.from(new Set(calcNodes === null || calcNodes === void 0 ? void 0 : calcNodes.map((node) => node.data[nodeClusterBy]))) || [];
        options.centripetalOptions = Object.assign(basicCentripetal, {
          single: 100,
          leaf: (node) => {
            const { siblingLeaves, sameTypeLeaves } = sameTypeLeafMap[node.id] || {};
            if ((sameTypeLeaves === null || sameTypeLeaves === void 0 ? void 0 : sameTypeLeaves.length) === (siblingLeaves === null || siblingLeaves === void 0 ? void 0 : siblingLeaves.length) || (clusters === null || clusters === void 0 ? void 0 : clusters.length) === 1) {
              return 1;
            }
            return options.clusterNodeStrength(node);
          },
          others: 1,
          center: (node) => {
            const degree = calcGraph.getDegree(node.id, "both");
            if (!degree) {
              return {
                x: 100,
                y: 100,
                z: 0
              };
            }
            let centerPos;
            if (degree === 1) {
              const { sameTypeLeaves = [] } = sameTypeLeafMap[node.id] || {};
              if (sameTypeLeaves.length === 1) {
                centerPos = void 0;
              } else if (sameTypeLeaves.length > 1) {
                centerPos = getAvgNodePosition(sameTypeLeaves);
              }
            } else {
              centerPos = void 0;
            }
            return {
              x: centerPos === null || centerPos === void 0 ? void 0 : centerPos.x,
              y: centerPos === null || centerPos === void 0 ? void 0 : centerPos.y,
              z: centerPos === null || centerPos === void 0 ? void 0 : centerPos.z
            };
          }
        });
      }
      if (clustering && nodeClusterBy) {
        if (!sameTypeLeafMap) {
          sameTypeLeafMap = getSameTypeLeafMap(calcGraph, nodeClusterBy);
        }
        if (!clusters) {
          clusters = Array.from(new Set(calcNodes.map((node) => node.data[nodeClusterBy])));
        }
        clusters = clusters.filter((item) => item !== void 0);
        const centerInfo = {};
        clusters.forEach((cluster) => {
          const sameTypeNodes = calcNodes.filter((node) => node.data[nodeClusterBy] === cluster).map((node) => calcGraph.getNode(node.id));
          centerInfo[cluster] = getAvgNodePosition(sameTypeNodes);
        });
        options.centripetalOptions = Object.assign(basicCentripetal, {
          single: (node) => options.clusterNodeStrength(node),
          leaf: (node) => options.clusterNodeStrength(node),
          others: (node) => options.clusterNodeStrength(node),
          center: (node) => {
            const centerPos = centerInfo[node.data[nodeClusterBy]];
            return {
              x: centerPos === null || centerPos === void 0 ? void 0 : centerPos.x,
              y: centerPos === null || centerPos === void 0 ? void 0 : centerPos.y,
              z: centerPos === null || centerPos === void 0 ? void 0 : centerPos.z
            };
          }
        });
      }
      const { leaf, single, others } = options.centripetalOptions || {};
      if (leaf && typeof leaf !== "function") {
        options.centripetalOptions.leaf = () => leaf;
      }
      if (single && typeof single !== "function") {
        options.centripetalOptions.single = () => single;
      }
      if (others && typeof others !== "function") {
        options.centripetalOptions.others = () => others;
      }
    }
    /**
     * One iteration.
     * @param calcGraph calculation graph
     * @param graph origin graph
     * @param iter current iteration index
     * @param velMap nodes' velocity map
     * @param options formatted layout options
     * @returns
     */
    runOneStep(calcGraph, graph2, iter, velMap, options) {
      const accMap = {};
      const calcNodes = calcGraph.getAllNodes();
      const calcEdges = calcGraph.getAllEdges();
      if (!(calcNodes === null || calcNodes === void 0 ? void 0 : calcNodes.length))
        return;
      const { monitor } = options;
      this.calRepulsive(calcGraph, accMap, options);
      if (calcEdges)
        this.calAttractive(calcGraph, accMap, options);
      this.calGravity(calcGraph, graph2, accMap, options);
      this.updateVelocity(calcGraph, accMap, velMap, options);
      if (monitor) {
        const energy = this.calTotalEnergy(accMap, calcNodes);
        monitor({
          energy,
          nodes: graph2.getAllNodes(),
          edges: graph2.getAllEdges(),
          iterations: iter
        });
      }
    }
    /**
     * Calculate graph energy for monitoring convergence.
     * @param accMap acceleration map
     * @param nodes calculation nodes
     * @returns energy
     */
    calTotalEnergy(accMap, nodes) {
      if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length))
        return 0;
      let energy = 0;
      nodes.forEach((node, i) => {
        const vx = accMap[node.id].x;
        const vy = accMap[node.id].y;
        const vz = this.options.dimensions === 3 ? accMap[node.id].z : 0;
        const speed2 = vx * vx + vy * vy + vz * vz;
        const { mass = 1 } = node.data;
        energy += mass * speed2 * 0.5;
      });
      return energy;
    }
    /**
     * Calculate the repulsive forces according to coulombs law.
     * @param calcGraph calculation graph
     * @param accMap acceleration map
     * @param options formatted layout options
     */
    calRepulsive(calcGraph, accMap, options) {
      const { dimensions, factor, coulombDisScale } = options;
      forceNBody(calcGraph, factor, coulombDisScale * coulombDisScale, accMap, dimensions);
    }
    /**
     * Calculate the attractive forces according to hooks law.
     * @param calcGraph calculation graph
     * @param accMap acceleration map
     */
    calAttractive(calcGraph, accMap, options) {
      const { dimensions, nodeSize } = options;
      calcGraph.getAllEdges().forEach((edge, i) => {
        const { source, target } = edge;
        const sourceNode = calcGraph.getNode(source);
        const targetNode = calcGraph.getNode(target);
        if (!sourceNode || !targetNode)
          return;
        let vecX = targetNode.data.x - sourceNode.data.x;
        let vecY = targetNode.data.y - sourceNode.data.y;
        let vecZ = dimensions === 3 ? targetNode.data.z - sourceNode.data.z : 0;
        if (!vecX && !vecY) {
          vecX = Math.random() * 0.01;
          vecY = Math.random() * 0.01;
          if (dimensions === 3 && !vecZ) {
            vecZ = Math.random() * 0.01;
          }
        }
        const vecLength = Math.sqrt(vecX * vecX + vecY * vecY + vecZ * vecZ);
        if (vecLength < nodeSize(sourceNode) + nodeSize(targetNode))
          return;
        const direX = vecX / vecLength;
        const direY = vecY / vecLength;
        const direZ = vecZ / vecLength;
        const { linkDistance = 200, edgeStrength = 200 } = edge.data || {};
        const diff = linkDistance - vecLength;
        const param = diff * edgeStrength;
        const massSource = sourceNode.data.mass || 1;
        const massTarget = targetNode.data.mass || 1;
        const sourceMassRatio = 1 / massSource;
        const targetMassRatio = 1 / massTarget;
        const disX = direX * param;
        const disY = direY * param;
        const disZ = direZ * param;
        accMap[source].x -= disX * sourceMassRatio;
        accMap[source].y -= disY * sourceMassRatio;
        accMap[source].z -= disZ * sourceMassRatio;
        accMap[target].x += disX * targetMassRatio;
        accMap[target].y += disY * targetMassRatio;
        accMap[target].z += disZ * targetMassRatio;
      });
    }
    /**
     * Calculate the gravity forces toward center.
     * @param calcGraph calculation graph
     * @param graph origin graph
     * @param accMap acceleration map
     * @param options formatted layout options
     */
    calGravity(calcGraph, graph2, accMap, options) {
      const { getCenter } = options;
      const calcNodes = calcGraph.getAllNodes();
      const nodes = graph2.getAllNodes();
      const edges = graph2.getAllEdges();
      const { width: width2, height, center, gravity: defaultGravity, centripetalOptions } = options;
      if (!calcNodes)
        return;
      calcNodes.forEach((calcNode) => {
        const { id, data } = calcNode;
        const { mass, x: x2, y: y2, z: z2 } = data;
        const node = graph2.getNode(id);
        let vecX = 0;
        let vecY = 0;
        let vecZ = 0;
        let gravity = defaultGravity;
        const inDegree = calcGraph.getDegree(id, "in");
        const outDegree = calcGraph.getDegree(id, "out");
        const degree = calcGraph.getDegree(id, "both");
        const forceCenter2 = getCenter === null || getCenter === void 0 ? void 0 : getCenter(node, degree);
        if (forceCenter2) {
          const [centerX, centerY, strength] = forceCenter2;
          vecX = x2 - centerX;
          vecY = y2 - centerY;
          gravity = strength;
        } else {
          vecX = x2 - center[0];
          vecY = y2 - center[1];
          vecZ = z2 - center[2];
        }
        if (gravity) {
          accMap[id].x -= gravity * vecX / mass;
          accMap[id].y -= gravity * vecY / mass;
          accMap[id].z -= gravity * vecZ / mass;
        }
        if (centripetalOptions) {
          const { leaf, single, others, center: centriCenter } = centripetalOptions;
          const { x: centriX, y: centriY, z: centriZ, centerStrength } = (centriCenter === null || centriCenter === void 0 ? void 0 : centriCenter(node, nodes, edges, width2, height)) || {
            x: 0,
            y: 0,
            z: 0,
            centerStrength: 0
          };
          if (!isNumber(centriX) || !isNumber(centriY))
            return;
          const vx = (x2 - centriX) / mass;
          const vy = (y2 - centriY) / mass;
          const vz = (z2 - centriZ) / mass;
          if (centerStrength) {
            accMap[id].x -= centerStrength * vx;
            accMap[id].y -= centerStrength * vy;
            accMap[id].z -= centerStrength * vz;
          }
          if (degree === 0) {
            const singleStrength = single(node);
            if (!singleStrength)
              return;
            accMap[id].x -= singleStrength * vx;
            accMap[id].y -= singleStrength * vy;
            accMap[id].z -= singleStrength * vz;
            return;
          }
          if (inDegree === 0 || outDegree === 0) {
            const leafStrength = leaf(node, nodes, edges);
            if (!leafStrength)
              return;
            accMap[id].x -= leafStrength * vx;
            accMap[id].y -= leafStrength * vy;
            accMap[id].z -= leafStrength * vz;
            return;
          }
          const othersStrength = others(node);
          if (!othersStrength)
            return;
          accMap[id].x -= othersStrength * vx;
          accMap[id].y -= othersStrength * vy;
          accMap[id].z -= othersStrength * vz;
        }
      });
    }
    /**
     * Update the velocities for nodes.
     * @param calcGraph calculation graph
     * @param accMap acceleration map
     * @param velMap velocity map
     * @param options formatted layout options
     * @returns
     */
    updateVelocity(calcGraph, accMap, velMap, options) {
      const { damping, maxSpeed, interval: interval2, dimensions } = options;
      const calcNodes = calcGraph.getAllNodes();
      if (!(calcNodes === null || calcNodes === void 0 ? void 0 : calcNodes.length))
        return;
      calcNodes.forEach((calcNode) => {
        const { id } = calcNode;
        let vx = (velMap[id].x + accMap[id].x * interval2) * damping || 0.01;
        let vy = (velMap[id].y + accMap[id].y * interval2) * damping || 0.01;
        let vz = dimensions === 3 ? (velMap[id].z + accMap[id].z * interval2) * damping || 0.01 : 0;
        const vLength = Math.sqrt(vx * vx + vy * vy + vz * vz);
        if (vLength > maxSpeed) {
          const param2 = maxSpeed / vLength;
          vx = param2 * vx;
          vy = param2 * vy;
          vz = param2 * vz;
        }
        velMap[id] = {
          x: vx,
          y: vy,
          z: vz
        };
      });
    }
    /**
     * Update nodes' positions.
     * @param graph origin graph
     * @param calcGraph calculatition graph
     * @param velMap velocity map
     * @param options formatted layou options
     * @returns
     */
    updatePosition(graph2, calcGraph, velMap, options) {
      const { distanceThresholdMode, interval: interval2, dimensions } = options;
      const calcNodes = calcGraph.getAllNodes();
      if (!(calcNodes === null || calcNodes === void 0 ? void 0 : calcNodes.length)) {
        this.judgingDistance = 0;
        return;
      }
      let sum = 0;
      if (distanceThresholdMode === "max")
        this.judgingDistance = -Infinity;
      else if (distanceThresholdMode === "min")
        this.judgingDistance = Infinity;
      calcNodes.forEach((calcNode) => {
        const { id } = calcNode;
        const node = graph2.getNode(id);
        if (isNumber(node.data.fx) && isNumber(node.data.fy)) {
          calcGraph.mergeNodeData(id, {
            x: node.data.fx,
            y: node.data.fy,
            z: dimensions === 3 ? node.data.fz : void 0
          });
          return;
        }
        const distX = velMap[id].x * interval2;
        const distY = velMap[id].y * interval2;
        const distZ = dimensions === 3 ? velMap[id].z * interval2 : 0;
        calcGraph.mergeNodeData(id, {
          x: calcNode.data.x + distX,
          y: calcNode.data.y + distY,
          z: calcNode.data.z + distZ
        });
        const distanceMagnitude = Math.sqrt(distX * distX + distY * distY + distZ * distZ);
        switch (distanceThresholdMode) {
          case "max":
            if (this.judgingDistance < distanceMagnitude) {
              this.judgingDistance = distanceMagnitude;
            }
            break;
          case "min":
            if (this.judgingDistance > distanceMagnitude) {
              this.judgingDistance = distanceMagnitude;
            }
            break;
          default:
            sum = sum + distanceMagnitude;
            break;
        }
      });
      if (!distanceThresholdMode || distanceThresholdMode === "mean") {
        this.judgingDistance = sum / calcNodes.length;
      }
    }
  }
  const getSameTypeLeafMap = (calcGraph, nodeClusterBy) => {
    const calcNodes = calcGraph.getAllNodes();
    if (!(calcNodes === null || calcNodes === void 0 ? void 0 : calcNodes.length))
      return {};
    const sameTypeLeafMap = {};
    calcNodes.forEach((node, i) => {
      const degree = calcGraph.getDegree(node.id, "both");
      if (degree === 1) {
        sameTypeLeafMap[node.id] = getCoreNodeAndSiblingLeaves(calcGraph, "leaf", node, nodeClusterBy);
      }
    });
    return sameTypeLeafMap;
  };
  const getCoreNodeAndSiblingLeaves = (calcGraph, type, node, nodeClusterBy) => {
    const inDegree = calcGraph.getDegree(node.id, "in");
    const outDegree = calcGraph.getDegree(node.id, "out");
    let coreNode = node;
    let siblingLeaves = [];
    if (inDegree === 0) {
      coreNode = calcGraph.getSuccessors(node.id)[0];
      siblingLeaves = calcGraph.getNeighbors(coreNode.id);
    } else if (outDegree === 0) {
      coreNode = calcGraph.getPredecessors(node.id)[0];
      siblingLeaves = calcGraph.getNeighbors(coreNode.id);
    }
    siblingLeaves = siblingLeaves.filter((node2) => calcGraph.getDegree(node2.id, "in") === 0 || calcGraph.getDegree(node2.id, "out") === 0);
    const sameTypeLeaves = getSameTypeNodes(calcGraph, type, nodeClusterBy, node, siblingLeaves);
    return { coreNode, siblingLeaves, sameTypeLeaves };
  };
  const getSameTypeNodes = (calcGraph, type, nodeClusterBy, node, relativeNodes) => {
    const typeName = node.data[nodeClusterBy] || "";
    let sameTypeNodes = (relativeNodes === null || relativeNodes === void 0 ? void 0 : relativeNodes.filter((item) => item.data[nodeClusterBy] === typeName)) || [];
    {
      sameTypeNodes = sameTypeNodes.filter((item) => calcGraph.getDegree(item.id, "in") === 0 || calcGraph.getDegree(item.id, "out") === 0);
    }
    return sameTypeNodes;
  };
  const getAvgNodePosition = (nodes) => {
    const totalNodes = { x: 0, y: 0 };
    nodes.forEach((node) => {
      const { x: x2, y: y2 } = node.data;
      totalNodes.x += x2 || 0;
      totalNodes.y += y2 || 0;
    });
    const length = nodes.length || 1;
    return {
      x: totalNodes.x / length,
      y: totalNodes.y / length
    };
  };
  const formatOutNodes = (graph2, layoutNodes) => layoutNodes.map((calcNode) => {
    const { id, data } = calcNode;
    const node = graph2.getNode(id);
    return Object.assign(Object.assign({}, node), { data: Object.assign(Object.assign({}, node.data), { x: data.x, y: data.y, z: data.z }) });
  });
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
  }
  function getAugmentedNamespace(n) {
    if (n.__esModule) return n;
    var f = n.default;
    if (typeof f == "function") {
      var a2 = function a3() {
        if (this instanceof a3) {
          return Reflect.construct(f, arguments, this.constructor);
        }
        return f.apply(this, arguments);
      };
      a2.prototype = f.prototype;
    } else a2 = {};
    Object.defineProperty(a2, "__esModule", { value: true });
    Object.keys(n).forEach(function(k) {
      var d = Object.getOwnPropertyDescriptor(n, k);
      Object.defineProperty(a2, k, d.get ? d : {
        enumerable: true,
        get: function() {
          return n[k];
        }
      });
    });
    return a2;
  }
  var matrix = {};
  const toString = Object.prototype.toString;
  function isAnyArray$1(value) {
    const tag = toString.call(value);
    return tag.endsWith("Array]") && !tag.includes("Big");
  }
  var libEsm = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    isAnyArray: isAnyArray$1
  });
  var require$$0 = /* @__PURE__ */ getAugmentedNamespace(libEsm);
  function max(input) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!isAnyArray$1(input)) {
      throw new TypeError("input must be an array");
    }
    if (input.length === 0) {
      throw new TypeError("input must not be empty");
    }
    var _options$fromIndex = options.fromIndex, fromIndex = _options$fromIndex === void 0 ? 0 : _options$fromIndex, _options$toIndex = options.toIndex, toIndex = _options$toIndex === void 0 ? input.length : _options$toIndex;
    if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
      throw new Error("fromIndex must be a positive integer smaller than length");
    }
    if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
      throw new Error("toIndex must be an integer greater than fromIndex and at most equal to length");
    }
    var maxValue = input[fromIndex];
    for (var i = fromIndex + 1; i < toIndex; i++) {
      if (input[i] > maxValue) maxValue = input[i];
    }
    return maxValue;
  }
  function min(input) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!isAnyArray$1(input)) {
      throw new TypeError("input must be an array");
    }
    if (input.length === 0) {
      throw new TypeError("input must not be empty");
    }
    var _options$fromIndex = options.fromIndex, fromIndex = _options$fromIndex === void 0 ? 0 : _options$fromIndex, _options$toIndex = options.toIndex, toIndex = _options$toIndex === void 0 ? input.length : _options$toIndex;
    if (fromIndex < 0 || fromIndex >= input.length || !Number.isInteger(fromIndex)) {
      throw new Error("fromIndex must be a positive integer smaller than length");
    }
    if (toIndex <= fromIndex || toIndex > input.length || !Number.isInteger(toIndex)) {
      throw new Error("toIndex must be an integer greater than fromIndex and at most equal to length");
    }
    var minValue = input[fromIndex];
    for (var i = fromIndex + 1; i < toIndex; i++) {
      if (input[i] < minValue) minValue = input[i];
    }
    return minValue;
  }
  function rescale$1(input) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (!isAnyArray$1(input)) {
      throw new TypeError("input must be an array");
    } else if (input.length === 0) {
      throw new TypeError("input must not be empty");
    }
    var output;
    if (options.output !== void 0) {
      if (!isAnyArray$1(options.output)) {
        throw new TypeError("output option must be an array if specified");
      }
      output = options.output;
    } else {
      output = new Array(input.length);
    }
    var currentMin = min(input);
    var currentMax = max(input);
    if (currentMin === currentMax) {
      throw new RangeError("minimum and maximum input values are equal. Cannot rescale a constant array");
    }
    var _options$min = options.min, minValue = _options$min === void 0 ? options.autoMinMax ? currentMin : 0 : _options$min, _options$max = options.max, maxValue = _options$max === void 0 ? options.autoMinMax ? currentMax : 1 : _options$max;
    if (minValue >= maxValue) {
      throw new RangeError("min option must be smaller than max option");
    }
    var factor = (maxValue - minValue) / (currentMax - currentMin);
    for (var i = 0; i < input.length; i++) {
      output[i] = (input[i] - currentMin) * factor + minValue;
    }
    return output;
  }
  var libEs6 = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    default: rescale$1
  });
  var require$$1 = /* @__PURE__ */ getAugmentedNamespace(libEs6);
  Object.defineProperty(matrix, "__esModule", { value: true });
  var isAnyArray = require$$0;
  var rescale = require$$1;
  const indent = " ".repeat(2);
  const indentData = " ".repeat(4);
  function inspectMatrix() {
    return inspectMatrixWithOptions(this);
  }
  function inspectMatrixWithOptions(matrix2, options = {}) {
    const {
      maxRows = 15,
      maxColumns = 10,
      maxNumSize = 8,
      padMinus = "auto"
    } = options;
    return `${matrix2.constructor.name} {
${indent}[
${indentData}${inspectData(matrix2, maxRows, maxColumns, maxNumSize, padMinus)}
${indent}]
${indent}rows: ${matrix2.rows}
${indent}columns: ${matrix2.columns}
}`;
  }
  function inspectData(matrix2, maxRows, maxColumns, maxNumSize, padMinus) {
    const { rows, columns } = matrix2;
    const maxI = Math.min(rows, maxRows);
    const maxJ = Math.min(columns, maxColumns);
    const result = [];
    if (padMinus === "auto") {
      padMinus = false;
      loop: for (let i = 0; i < maxI; i++) {
        for (let j = 0; j < maxJ; j++) {
          if (matrix2.get(i, j) < 0) {
            padMinus = true;
            break loop;
          }
        }
      }
    }
    for (let i = 0; i < maxI; i++) {
      let line = [];
      for (let j = 0; j < maxJ; j++) {
        line.push(formatNumber(matrix2.get(i, j), maxNumSize, padMinus));
      }
      result.push(`${line.join(" ")}`);
    }
    if (maxJ !== columns) {
      result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
    }
    if (maxI !== rows) {
      result.push(`... ${rows - maxRows} more rows`);
    }
    return result.join(`
${indentData}`);
  }
  function formatNumber(num, maxNumSize, padMinus) {
    return (num >= 0 && padMinus ? ` ${formatNumber2(num, maxNumSize - 1)}` : formatNumber2(num, maxNumSize)).padEnd(maxNumSize);
  }
  function formatNumber2(num, len) {
    let str = num.toString();
    if (str.length <= len) return str;
    let fix = num.toFixed(len);
    if (fix.length > len) {
      fix = num.toFixed(Math.max(0, len - (fix.length - len)));
    }
    if (fix.length <= len && !fix.startsWith("0.000") && !fix.startsWith("-0.000")) {
      return fix;
    }
    let exp = num.toExponential(len);
    if (exp.length > len) {
      exp = num.toExponential(Math.max(0, len - (exp.length - len)));
    }
    return exp.slice(0);
  }
  function installMathOperations(AbstractMatrix2, Matrix2) {
    AbstractMatrix2.prototype.add = function add2(value) {
      if (typeof value === "number") return this.addS(value);
      return this.addM(value);
    };
    AbstractMatrix2.prototype.addS = function addS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.addM = function addM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.add = function add2(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.add(value);
    };
    AbstractMatrix2.prototype.sub = function sub(value) {
      if (typeof value === "number") return this.subS(value);
      return this.subM(value);
    };
    AbstractMatrix2.prototype.subS = function subS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.subM = function subM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.sub = function sub(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.sub(value);
    };
    AbstractMatrix2.prototype.subtract = AbstractMatrix2.prototype.sub;
    AbstractMatrix2.prototype.subtractS = AbstractMatrix2.prototype.subS;
    AbstractMatrix2.prototype.subtractM = AbstractMatrix2.prototype.subM;
    AbstractMatrix2.subtract = AbstractMatrix2.sub;
    AbstractMatrix2.prototype.mul = function mul(value) {
      if (typeof value === "number") return this.mulS(value);
      return this.mulM(value);
    };
    AbstractMatrix2.prototype.mulS = function mulS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.mulM = function mulM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.mul = function mul(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.mul(value);
    };
    AbstractMatrix2.prototype.multiply = AbstractMatrix2.prototype.mul;
    AbstractMatrix2.prototype.multiplyS = AbstractMatrix2.prototype.mulS;
    AbstractMatrix2.prototype.multiplyM = AbstractMatrix2.prototype.mulM;
    AbstractMatrix2.multiply = AbstractMatrix2.mul;
    AbstractMatrix2.prototype.div = function div(value) {
      if (typeof value === "number") return this.divS(value);
      return this.divM(value);
    };
    AbstractMatrix2.prototype.divS = function divS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.divM = function divM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.div = function div(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.div(value);
    };
    AbstractMatrix2.prototype.divide = AbstractMatrix2.prototype.div;
    AbstractMatrix2.prototype.divideS = AbstractMatrix2.prototype.divS;
    AbstractMatrix2.prototype.divideM = AbstractMatrix2.prototype.divM;
    AbstractMatrix2.divide = AbstractMatrix2.div;
    AbstractMatrix2.prototype.mod = function mod(value) {
      if (typeof value === "number") return this.modS(value);
      return this.modM(value);
    };
    AbstractMatrix2.prototype.modS = function modS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) % value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.modM = function modM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) % matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.mod = function mod(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.mod(value);
    };
    AbstractMatrix2.prototype.modulus = AbstractMatrix2.prototype.mod;
    AbstractMatrix2.prototype.modulusS = AbstractMatrix2.prototype.modS;
    AbstractMatrix2.prototype.modulusM = AbstractMatrix2.prototype.modM;
    AbstractMatrix2.modulus = AbstractMatrix2.mod;
    AbstractMatrix2.prototype.and = function and(value) {
      if (typeof value === "number") return this.andS(value);
      return this.andM(value);
    };
    AbstractMatrix2.prototype.andS = function andS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) & value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.andM = function andM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) & matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.and = function and(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.and(value);
    };
    AbstractMatrix2.prototype.or = function or(value) {
      if (typeof value === "number") return this.orS(value);
      return this.orM(value);
    };
    AbstractMatrix2.prototype.orS = function orS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) | value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.orM = function orM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) | matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.or = function or(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.or(value);
    };
    AbstractMatrix2.prototype.xor = function xor(value) {
      if (typeof value === "number") return this.xorS(value);
      return this.xorM(value);
    };
    AbstractMatrix2.prototype.xorS = function xorS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ^ value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.xorM = function xorM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ^ matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.xor = function xor(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.xor(value);
    };
    AbstractMatrix2.prototype.leftShift = function leftShift(value) {
      if (typeof value === "number") return this.leftShiftS(value);
      return this.leftShiftM(value);
    };
    AbstractMatrix2.prototype.leftShiftS = function leftShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) << value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.leftShiftM = function leftShiftM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) << matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.leftShift = function leftShift(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.leftShift(value);
    };
    AbstractMatrix2.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
      if (typeof value === "number") return this.signPropagatingRightShiftS(value);
      return this.signPropagatingRightShiftM(value);
    };
    AbstractMatrix2.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >> value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >> matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.signPropagatingRightShift = function signPropagatingRightShift(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.signPropagatingRightShift(value);
    };
    AbstractMatrix2.prototype.rightShift = function rightShift(value) {
      if (typeof value === "number") return this.rightShiftS(value);
      return this.rightShiftM(value);
    };
    AbstractMatrix2.prototype.rightShiftS = function rightShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >>> value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.rightShiftM = function rightShiftM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >>> matrix2.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.rightShift = function rightShift(matrix2, value) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.rightShift(value);
    };
    AbstractMatrix2.prototype.zeroFillRightShift = AbstractMatrix2.prototype.rightShift;
    AbstractMatrix2.prototype.zeroFillRightShiftS = AbstractMatrix2.prototype.rightShiftS;
    AbstractMatrix2.prototype.zeroFillRightShiftM = AbstractMatrix2.prototype.rightShiftM;
    AbstractMatrix2.zeroFillRightShift = AbstractMatrix2.rightShift;
    AbstractMatrix2.prototype.not = function not() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, ~this.get(i, j));
        }
      }
      return this;
    };
    AbstractMatrix2.not = function not(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.not();
    };
    AbstractMatrix2.prototype.abs = function abs() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.abs(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.abs = function abs(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.abs();
    };
    AbstractMatrix2.prototype.acos = function acos() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.acos(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.acos = function acos(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.acos();
    };
    AbstractMatrix2.prototype.acosh = function acosh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.acosh(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.acosh = function acosh(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.acosh();
    };
    AbstractMatrix2.prototype.asin = function asin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.asin(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.asin = function asin(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.asin();
    };
    AbstractMatrix2.prototype.asinh = function asinh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.asinh(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.asinh = function asinh(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.asinh();
    };
    AbstractMatrix2.prototype.atan = function atan() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.atan(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.atan = function atan(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.atan();
    };
    AbstractMatrix2.prototype.atanh = function atanh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.atanh(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.atanh = function atanh(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.atanh();
    };
    AbstractMatrix2.prototype.cbrt = function cbrt() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cbrt(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.cbrt = function cbrt(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.cbrt();
    };
    AbstractMatrix2.prototype.ceil = function ceil() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.ceil(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.ceil = function ceil(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.ceil();
    };
    AbstractMatrix2.prototype.clz32 = function clz32() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.clz32(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.clz32 = function clz32(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.clz32();
    };
    AbstractMatrix2.prototype.cos = function cos() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cos(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.cos = function cos(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.cos();
    };
    AbstractMatrix2.prototype.cosh = function cosh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cosh(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.cosh = function cosh(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.cosh();
    };
    AbstractMatrix2.prototype.exp = function exp() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.exp(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.exp = function exp(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.exp();
    };
    AbstractMatrix2.prototype.expm1 = function expm1() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.expm1(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.expm1 = function expm1(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.expm1();
    };
    AbstractMatrix2.prototype.floor = function floor() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.floor(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.floor = function floor(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.floor();
    };
    AbstractMatrix2.prototype.fround = function fround() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.fround(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.fround = function fround(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.fround();
    };
    AbstractMatrix2.prototype.log = function log() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.log = function log(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.log();
    };
    AbstractMatrix2.prototype.log1p = function log1p() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log1p(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.log1p = function log1p(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.log1p();
    };
    AbstractMatrix2.prototype.log10 = function log10() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log10(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.log10 = function log10(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.log10();
    };
    AbstractMatrix2.prototype.log2 = function log2() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log2(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.log2 = function log2(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.log2();
    };
    AbstractMatrix2.prototype.round = function round() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.round(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.round = function round(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.round();
    };
    AbstractMatrix2.prototype.sign = function sign() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sign(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.sign = function sign(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.sign();
    };
    AbstractMatrix2.prototype.sin = function sin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sin(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.sin = function sin(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.sin();
    };
    AbstractMatrix2.prototype.sinh = function sinh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sinh(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.sinh = function sinh(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.sinh();
    };
    AbstractMatrix2.prototype.sqrt = function sqrt() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sqrt(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.sqrt = function sqrt(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.sqrt();
    };
    AbstractMatrix2.prototype.tan = function tan() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.tan(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.tan = function tan(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.tan();
    };
    AbstractMatrix2.prototype.tanh = function tanh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.tanh(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.tanh = function tanh(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.tanh();
    };
    AbstractMatrix2.prototype.trunc = function trunc() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.trunc(this.get(i, j)));
        }
      }
      return this;
    };
    AbstractMatrix2.trunc = function trunc(matrix2) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.trunc();
    };
    AbstractMatrix2.pow = function pow(matrix2, arg0) {
      const newMatrix = new Matrix2(matrix2);
      return newMatrix.pow(arg0);
    };
    AbstractMatrix2.prototype.pow = function pow(value) {
      if (typeof value === "number") return this.powS(value);
      return this.powM(value);
    };
    AbstractMatrix2.prototype.powS = function powS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ** value);
        }
      }
      return this;
    };
    AbstractMatrix2.prototype.powM = function powM(matrix2) {
      matrix2 = Matrix2.checkMatrix(matrix2);
      if (this.rows !== matrix2.rows || this.columns !== matrix2.columns) {
        throw new RangeError("Matrices dimensions must be equal");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ** matrix2.get(i, j));
        }
      }
      return this;
    };
  }
  function checkRowIndex(matrix2, index2, outer) {
    let max2 = outer ? matrix2.rows : matrix2.rows - 1;
    if (index2 < 0 || index2 > max2) {
      throw new RangeError("Row index out of range");
    }
  }
  function checkColumnIndex(matrix2, index2, outer) {
    let max2 = outer ? matrix2.columns : matrix2.columns - 1;
    if (index2 < 0 || index2 > max2) {
      throw new RangeError("Column index out of range");
    }
  }
  function checkRowVector(matrix2, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }
    if (vector.length !== matrix2.columns) {
      throw new RangeError(
        "vector size must be the same as the number of columns"
      );
    }
    return vector;
  }
  function checkColumnVector(matrix2, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }
    if (vector.length !== matrix2.rows) {
      throw new RangeError("vector size must be the same as the number of rows");
    }
    return vector;
  }
  function checkRowIndices(matrix2, rowIndices) {
    if (!isAnyArray.isAnyArray(rowIndices)) {
      throw new TypeError("row indices must be an array");
    }
    for (let i = 0; i < rowIndices.length; i++) {
      if (rowIndices[i] < 0 || rowIndices[i] >= matrix2.rows) {
        throw new RangeError("row indices are out of range");
      }
    }
  }
  function checkColumnIndices(matrix2, columnIndices) {
    if (!isAnyArray.isAnyArray(columnIndices)) {
      throw new TypeError("column indices must be an array");
    }
    for (let i = 0; i < columnIndices.length; i++) {
      if (columnIndices[i] < 0 || columnIndices[i] >= matrix2.columns) {
        throw new RangeError("column indices are out of range");
      }
    }
  }
  function checkRange(matrix2, startRow, endRow, startColumn, endColumn) {
    if (arguments.length !== 5) {
      throw new RangeError("expected 4 arguments");
    }
    checkNumber("startRow", startRow);
    checkNumber("endRow", endRow);
    checkNumber("startColumn", startColumn);
    checkNumber("endColumn", endColumn);
    if (startRow > endRow || startColumn > endColumn || startRow < 0 || startRow >= matrix2.rows || endRow < 0 || endRow >= matrix2.rows || startColumn < 0 || startColumn >= matrix2.columns || endColumn < 0 || endColumn >= matrix2.columns) {
      throw new RangeError("Submatrix indices are out of range");
    }
  }
  function newArray(length, value = 0) {
    let array = [];
    for (let i = 0; i < length; i++) {
      array.push(value);
    }
    return array;
  }
  function checkNumber(name, value) {
    if (typeof value !== "number") {
      throw new TypeError(`${name} must be a number`);
    }
  }
  function checkNonEmpty(matrix2) {
    if (matrix2.isEmpty()) {
      throw new Error("Empty matrix has no elements to index");
    }
  }
  function sumByRow(matrix2) {
    let sum = newArray(matrix2.rows);
    for (let i = 0; i < matrix2.rows; ++i) {
      for (let j = 0; j < matrix2.columns; ++j) {
        sum[i] += matrix2.get(i, j);
      }
    }
    return sum;
  }
  function sumByColumn(matrix2) {
    let sum = newArray(matrix2.columns);
    for (let i = 0; i < matrix2.rows; ++i) {
      for (let j = 0; j < matrix2.columns; ++j) {
        sum[j] += matrix2.get(i, j);
      }
    }
    return sum;
  }
  function sumAll(matrix2) {
    let v = 0;
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        v += matrix2.get(i, j);
      }
    }
    return v;
  }
  function productByRow(matrix2) {
    let sum = newArray(matrix2.rows, 1);
    for (let i = 0; i < matrix2.rows; ++i) {
      for (let j = 0; j < matrix2.columns; ++j) {
        sum[i] *= matrix2.get(i, j);
      }
    }
    return sum;
  }
  function productByColumn(matrix2) {
    let sum = newArray(matrix2.columns, 1);
    for (let i = 0; i < matrix2.rows; ++i) {
      for (let j = 0; j < matrix2.columns; ++j) {
        sum[j] *= matrix2.get(i, j);
      }
    }
    return sum;
  }
  function productAll(matrix2) {
    let v = 1;
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        v *= matrix2.get(i, j);
      }
    }
    return v;
  }
  function varianceByRow(matrix2, unbiased, mean) {
    const rows = matrix2.rows;
    const cols = matrix2.columns;
    const variance = [];
    for (let i = 0; i < rows; i++) {
      let sum1 = 0;
      let sum2 = 0;
      let x2 = 0;
      for (let j = 0; j < cols; j++) {
        x2 = matrix2.get(i, j) - mean[i];
        sum1 += x2;
        sum2 += x2 * x2;
      }
      if (unbiased) {
        variance.push((sum2 - sum1 * sum1 / cols) / (cols - 1));
      } else {
        variance.push((sum2 - sum1 * sum1 / cols) / cols);
      }
    }
    return variance;
  }
  function varianceByColumn(matrix2, unbiased, mean) {
    const rows = matrix2.rows;
    const cols = matrix2.columns;
    const variance = [];
    for (let j = 0; j < cols; j++) {
      let sum1 = 0;
      let sum2 = 0;
      let x2 = 0;
      for (let i = 0; i < rows; i++) {
        x2 = matrix2.get(i, j) - mean[j];
        sum1 += x2;
        sum2 += x2 * x2;
      }
      if (unbiased) {
        variance.push((sum2 - sum1 * sum1 / rows) / (rows - 1));
      } else {
        variance.push((sum2 - sum1 * sum1 / rows) / rows);
      }
    }
    return variance;
  }
  function varianceAll(matrix2, unbiased, mean) {
    const rows = matrix2.rows;
    const cols = matrix2.columns;
    const size = rows * cols;
    let sum1 = 0;
    let sum2 = 0;
    let x2 = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        x2 = matrix2.get(i, j) - mean;
        sum1 += x2;
        sum2 += x2 * x2;
      }
    }
    if (unbiased) {
      return (sum2 - sum1 * sum1 / size) / (size - 1);
    } else {
      return (sum2 - sum1 * sum1 / size) / size;
    }
  }
  function centerByRow(matrix2, mean) {
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        matrix2.set(i, j, matrix2.get(i, j) - mean[i]);
      }
    }
  }
  function centerByColumn(matrix2, mean) {
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        matrix2.set(i, j, matrix2.get(i, j) - mean[j]);
      }
    }
  }
  function centerAll(matrix2, mean) {
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        matrix2.set(i, j, matrix2.get(i, j) - mean);
      }
    }
  }
  function getScaleByRow(matrix2) {
    const scale = [];
    for (let i = 0; i < matrix2.rows; i++) {
      let sum = 0;
      for (let j = 0; j < matrix2.columns; j++) {
        sum += matrix2.get(i, j) ** 2 / (matrix2.columns - 1);
      }
      scale.push(Math.sqrt(sum));
    }
    return scale;
  }
  function scaleByRow(matrix2, scale) {
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        matrix2.set(i, j, matrix2.get(i, j) / scale[i]);
      }
    }
  }
  function getScaleByColumn(matrix2) {
    const scale = [];
    for (let j = 0; j < matrix2.columns; j++) {
      let sum = 0;
      for (let i = 0; i < matrix2.rows; i++) {
        sum += matrix2.get(i, j) ** 2 / (matrix2.rows - 1);
      }
      scale.push(Math.sqrt(sum));
    }
    return scale;
  }
  function scaleByColumn(matrix2, scale) {
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        matrix2.set(i, j, matrix2.get(i, j) / scale[j]);
      }
    }
  }
  function getScaleAll(matrix2) {
    const divider = matrix2.size - 1;
    let sum = 0;
    for (let j = 0; j < matrix2.columns; j++) {
      for (let i = 0; i < matrix2.rows; i++) {
        sum += matrix2.get(i, j) ** 2 / divider;
      }
    }
    return Math.sqrt(sum);
  }
  function scaleAll(matrix2, scale) {
    for (let i = 0; i < matrix2.rows; i++) {
      for (let j = 0; j < matrix2.columns; j++) {
        matrix2.set(i, j, matrix2.get(i, j) / scale);
      }
    }
  }
  class AbstractMatrix {
    static from1DArray(newRows, newColumns, newData) {
      let length = newRows * newColumns;
      if (length !== newData.length) {
        throw new RangeError("data length does not match given dimensions");
      }
      let newMatrix = new Matrix$1(newRows, newColumns);
      for (let row = 0; row < newRows; row++) {
        for (let column = 0; column < newColumns; column++) {
          newMatrix.set(row, column, newData[row * newColumns + column]);
        }
      }
      return newMatrix;
    }
    static rowVector(newData) {
      let vector = new Matrix$1(1, newData.length);
      for (let i = 0; i < newData.length; i++) {
        vector.set(0, i, newData[i]);
      }
      return vector;
    }
    static columnVector(newData) {
      let vector = new Matrix$1(newData.length, 1);
      for (let i = 0; i < newData.length; i++) {
        vector.set(i, 0, newData[i]);
      }
      return vector;
    }
    static zeros(rows, columns) {
      return new Matrix$1(rows, columns);
    }
    static ones(rows, columns) {
      return new Matrix$1(rows, columns).fill(1);
    }
    static rand(rows, columns, options = {}) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { random = Math.random } = options;
      let matrix2 = new Matrix$1(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          matrix2.set(i, j, random());
        }
      }
      return matrix2;
    }
    static randInt(rows, columns, options = {}) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { min: min2 = 0, max: max2 = 1e3, random = Math.random } = options;
      if (!Number.isInteger(min2)) throw new TypeError("min must be an integer");
      if (!Number.isInteger(max2)) throw new TypeError("max must be an integer");
      if (min2 >= max2) throw new RangeError("min must be smaller than max");
      let interval2 = max2 - min2;
      let matrix2 = new Matrix$1(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          let value = min2 + Math.round(random() * interval2);
          matrix2.set(i, j, value);
        }
      }
      return matrix2;
    }
    static eye(rows, columns, value) {
      if (columns === void 0) columns = rows;
      if (value === void 0) value = 1;
      let min2 = Math.min(rows, columns);
      let matrix2 = this.zeros(rows, columns);
      for (let i = 0; i < min2; i++) {
        matrix2.set(i, i, value);
      }
      return matrix2;
    }
    static diag(data, rows, columns) {
      let l = data.length;
      if (rows === void 0) rows = l;
      if (columns === void 0) columns = rows;
      let min2 = Math.min(l, rows, columns);
      let matrix2 = this.zeros(rows, columns);
      for (let i = 0; i < min2; i++) {
        matrix2.set(i, i, data[i]);
      }
      return matrix2;
    }
    static min(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      let rows = matrix1.rows;
      let columns = matrix1.columns;
      let result = new Matrix$1(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }
      return result;
    }
    static max(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      let rows = matrix1.rows;
      let columns = matrix1.columns;
      let result = new this(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }
      return result;
    }
    static checkMatrix(value) {
      return AbstractMatrix.isMatrix(value) ? value : new Matrix$1(value);
    }
    static isMatrix(value) {
      return value != null && value.klass === "Matrix";
    }
    get size() {
      return this.rows * this.columns;
    }
    apply(callback) {
      if (typeof callback !== "function") {
        throw new TypeError("callback must be a function");
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          callback.call(this, i, j);
        }
      }
      return this;
    }
    to1DArray() {
      let array = [];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          array.push(this.get(i, j));
        }
      }
      return array;
    }
    to2DArray() {
      let copy = [];
      for (let i = 0; i < this.rows; i++) {
        copy.push([]);
        for (let j = 0; j < this.columns; j++) {
          copy[i].push(this.get(i, j));
        }
      }
      return copy;
    }
    toJSON() {
      return this.to2DArray();
    }
    isRowVector() {
      return this.rows === 1;
    }
    isColumnVector() {
      return this.columns === 1;
    }
    isVector() {
      return this.rows === 1 || this.columns === 1;
    }
    isSquare() {
      return this.rows === this.columns;
    }
    isEmpty() {
      return this.rows === 0 || this.columns === 0;
    }
    isSymmetric() {
      if (this.isSquare()) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j <= i; j++) {
            if (this.get(i, j) !== this.get(j, i)) {
              return false;
            }
          }
        }
        return true;
      }
      return false;
    }
    isDistance() {
      if (!this.isSymmetric()) return false;
      for (let i = 0; i < this.rows; i++) {
        if (this.get(i, i) !== 0) return false;
      }
      return true;
    }
    isEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isEchelonForm = true;
      let checked = false;
      while (i < this.rows && isEchelonForm) {
        j = 0;
        checked = false;
        while (j < this.columns && checked === false) {
          if (this.get(i, j) === 0) {
            j++;
          } else if (this.get(i, j) === 1 && j > previousColumn) {
            checked = true;
            previousColumn = j;
          } else {
            isEchelonForm = false;
            checked = true;
          }
        }
        i++;
      }
      return isEchelonForm;
    }
    isReducedEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isReducedEchelonForm = true;
      let checked = false;
      while (i < this.rows && isReducedEchelonForm) {
        j = 0;
        checked = false;
        while (j < this.columns && checked === false) {
          if (this.get(i, j) === 0) {
            j++;
          } else if (this.get(i, j) === 1 && j > previousColumn) {
            checked = true;
            previousColumn = j;
          } else {
            isReducedEchelonForm = false;
            checked = true;
          }
        }
        for (let k = j + 1; k < this.rows; k++) {
          if (this.get(i, k) !== 0) {
            isReducedEchelonForm = false;
          }
        }
        i++;
      }
      return isReducedEchelonForm;
    }
    echelonForm() {
      let result = this.clone();
      let h = 0;
      let k = 0;
      while (h < result.rows && k < result.columns) {
        let iMax = h;
        for (let i = h; i < result.rows; i++) {
          if (result.get(i, k) > result.get(iMax, k)) {
            iMax = i;
          }
        }
        if (result.get(iMax, k) === 0) {
          k++;
        } else {
          result.swapRows(h, iMax);
          let tmp = result.get(h, k);
          for (let j = k; j < result.columns; j++) {
            result.set(h, j, result.get(h, j) / tmp);
          }
          for (let i = h + 1; i < result.rows; i++) {
            let factor = result.get(i, k) / result.get(h, k);
            result.set(i, k, 0);
            for (let j = k + 1; j < result.columns; j++) {
              result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
            }
          }
          h++;
          k++;
        }
      }
      return result;
    }
    reducedEchelonForm() {
      let result = this.echelonForm();
      let m2 = result.columns;
      let n = result.rows;
      let h = n - 1;
      while (h >= 0) {
        if (result.maxRow(h) === 0) {
          h--;
        } else {
          let p = 0;
          let pivot = false;
          while (p < n && pivot === false) {
            if (result.get(h, p) === 1) {
              pivot = true;
            } else {
              p++;
            }
          }
          for (let i = 0; i < h; i++) {
            let factor = result.get(i, p);
            for (let j = p; j < m2; j++) {
              let tmp = result.get(i, j) - factor * result.get(h, j);
              result.set(i, j, tmp);
            }
          }
          h--;
        }
      }
      return result;
    }
    set() {
      throw new Error("set method is unimplemented");
    }
    get() {
      throw new Error("get method is unimplemented");
    }
    repeat(options = {}) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { rows = 1, columns = 1 } = options;
      if (!Number.isInteger(rows) || rows <= 0) {
        throw new TypeError("rows must be a positive integer");
      }
      if (!Number.isInteger(columns) || columns <= 0) {
        throw new TypeError("columns must be a positive integer");
      }
      let matrix2 = new Matrix$1(this.rows * rows, this.columns * columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          matrix2.setSubMatrix(this, this.rows * i, this.columns * j);
        }
      }
      return matrix2;
    }
    fill(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, value);
        }
      }
      return this;
    }
    neg() {
      return this.mulS(-1);
    }
    getRow(index2) {
      checkRowIndex(this, index2);
      let row = [];
      for (let i = 0; i < this.columns; i++) {
        row.push(this.get(index2, i));
      }
      return row;
    }
    getRowVector(index2) {
      return Matrix$1.rowVector(this.getRow(index2));
    }
    setRow(index2, array) {
      checkRowIndex(this, index2);
      array = checkRowVector(this, array);
      for (let i = 0; i < this.columns; i++) {
        this.set(index2, i, array[i]);
      }
      return this;
    }
    swapRows(row1, row2) {
      checkRowIndex(this, row1);
      checkRowIndex(this, row2);
      for (let i = 0; i < this.columns; i++) {
        let temp = this.get(row1, i);
        this.set(row1, i, this.get(row2, i));
        this.set(row2, i, temp);
      }
      return this;
    }
    getColumn(index2) {
      checkColumnIndex(this, index2);
      let column = [];
      for (let i = 0; i < this.rows; i++) {
        column.push(this.get(i, index2));
      }
      return column;
    }
    getColumnVector(index2) {
      return Matrix$1.columnVector(this.getColumn(index2));
    }
    setColumn(index2, array) {
      checkColumnIndex(this, index2);
      array = checkColumnVector(this, array);
      for (let i = 0; i < this.rows; i++) {
        this.set(i, index2, array[i]);
      }
      return this;
    }
    swapColumns(column1, column2) {
      checkColumnIndex(this, column1);
      checkColumnIndex(this, column2);
      for (let i = 0; i < this.rows; i++) {
        let temp = this.get(i, column1);
        this.set(i, column1, this.get(i, column2));
        this.set(i, column2, temp);
      }
      return this;
    }
    addRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[j]);
        }
      }
      return this;
    }
    subRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[j]);
        }
      }
      return this;
    }
    mulRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[j]);
        }
      }
      return this;
    }
    divRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[j]);
        }
      }
      return this;
    }
    addColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[i]);
        }
      }
      return this;
    }
    subColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[i]);
        }
      }
      return this;
    }
    mulColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[i]);
        }
      }
      return this;
    }
    divColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[i]);
        }
      }
      return this;
    }
    mulRow(index2, value) {
      checkRowIndex(this, index2);
      for (let i = 0; i < this.columns; i++) {
        this.set(index2, i, this.get(index2, i) * value);
      }
      return this;
    }
    mulColumn(index2, value) {
      checkColumnIndex(this, index2);
      for (let i = 0; i < this.rows; i++) {
        this.set(i, index2, this.get(i, index2) * value);
      }
      return this;
    }
    max(by) {
      if (this.isEmpty()) {
        return NaN;
      }
      switch (by) {
        case "row": {
          const max2 = new Array(this.rows).fill(Number.NEGATIVE_INFINITY);
          for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
              if (this.get(row, column) > max2[row]) {
                max2[row] = this.get(row, column);
              }
            }
          }
          return max2;
        }
        case "column": {
          const max2 = new Array(this.columns).fill(Number.NEGATIVE_INFINITY);
          for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
              if (this.get(row, column) > max2[column]) {
                max2[column] = this.get(row, column);
              }
            }
          }
          return max2;
        }
        case void 0: {
          let max2 = this.get(0, 0);
          for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
              if (this.get(row, column) > max2) {
                max2 = this.get(row, column);
              }
            }
          }
          return max2;
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    maxIndex() {
      checkNonEmpty(this);
      let v = this.get(0, 0);
      let idx = [0, 0];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }
      return idx;
    }
    min(by) {
      if (this.isEmpty()) {
        return NaN;
      }
      switch (by) {
        case "row": {
          const min2 = new Array(this.rows).fill(Number.POSITIVE_INFINITY);
          for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
              if (this.get(row, column) < min2[row]) {
                min2[row] = this.get(row, column);
              }
            }
          }
          return min2;
        }
        case "column": {
          const min2 = new Array(this.columns).fill(Number.POSITIVE_INFINITY);
          for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
              if (this.get(row, column) < min2[column]) {
                min2[column] = this.get(row, column);
              }
            }
          }
          return min2;
        }
        case void 0: {
          let min2 = this.get(0, 0);
          for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
              if (this.get(row, column) < min2) {
                min2 = this.get(row, column);
              }
            }
          }
          return min2;
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    minIndex() {
      checkNonEmpty(this);
      let v = this.get(0, 0);
      let idx = [0, 0];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }
      return idx;
    }
    maxRow(row) {
      checkRowIndex(this, row);
      if (this.isEmpty()) {
        return NaN;
      }
      let v = this.get(row, 0);
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
        }
      }
      return v;
    }
    maxRowIndex(row) {
      checkRowIndex(this, row);
      checkNonEmpty(this);
      let v = this.get(row, 0);
      let idx = [row, 0];
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }
      return idx;
    }
    minRow(row) {
      checkRowIndex(this, row);
      if (this.isEmpty()) {
        return NaN;
      }
      let v = this.get(row, 0);
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
        }
      }
      return v;
    }
    minRowIndex(row) {
      checkRowIndex(this, row);
      checkNonEmpty(this);
      let v = this.get(row, 0);
      let idx = [row, 0];
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }
      return idx;
    }
    maxColumn(column) {
      checkColumnIndex(this, column);
      if (this.isEmpty()) {
        return NaN;
      }
      let v = this.get(0, column);
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
        }
      }
      return v;
    }
    maxColumnIndex(column) {
      checkColumnIndex(this, column);
      checkNonEmpty(this);
      let v = this.get(0, column);
      let idx = [0, column];
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }
      return idx;
    }
    minColumn(column) {
      checkColumnIndex(this, column);
      if (this.isEmpty()) {
        return NaN;
      }
      let v = this.get(0, column);
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
        }
      }
      return v;
    }
    minColumnIndex(column) {
      checkColumnIndex(this, column);
      checkNonEmpty(this);
      let v = this.get(0, column);
      let idx = [0, column];
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }
      return idx;
    }
    diag() {
      let min2 = Math.min(this.rows, this.columns);
      let diag = [];
      for (let i = 0; i < min2; i++) {
        diag.push(this.get(i, i));
      }
      return diag;
    }
    norm(type = "frobenius") {
      switch (type) {
        case "max":
          return this.max();
        case "frobenius":
          return Math.sqrt(this.dot(this));
        default:
          throw new RangeError(`unknown norm type: ${type}`);
      }
    }
    cumulativeSum() {
      let sum = 0;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          sum += this.get(i, j);
          this.set(i, j, sum);
        }
      }
      return this;
    }
    dot(vector2) {
      if (AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
      let vector1 = this.to1DArray();
      if (vector1.length !== vector2.length) {
        throw new RangeError("vectors do not have the same size");
      }
      let dot = 0;
      for (let i = 0; i < vector1.length; i++) {
        dot += vector1[i] * vector2[i];
      }
      return dot;
    }
    mmul(other) {
      other = Matrix$1.checkMatrix(other);
      let m2 = this.rows;
      let n = this.columns;
      let p = other.columns;
      let result = new Matrix$1(m2, p);
      let Bcolj = new Float64Array(n);
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < n; k++) {
          Bcolj[k] = other.get(k, j);
        }
        for (let i = 0; i < m2; i++) {
          let s = 0;
          for (let k = 0; k < n; k++) {
            s += this.get(i, k) * Bcolj[k];
          }
          result.set(i, j, s);
        }
      }
      return result;
    }
    mpow(scalar) {
      if (!this.isSquare()) {
        throw new RangeError("Matrix must be square");
      }
      if (!Number.isInteger(scalar) || scalar < 0) {
        throw new RangeError("Exponent must be a non-negative integer");
      }
      let result = Matrix$1.eye(this.rows);
      let bb = this;
      for (let e = scalar; e >= 1; e /= 2) {
        if ((e & 1) !== 0) {
          result = result.mmul(bb);
        }
        bb = bb.mmul(bb);
      }
      return result;
    }
    strassen2x2(other) {
      other = Matrix$1.checkMatrix(other);
      let result = new Matrix$1(2, 2);
      const a11 = this.get(0, 0);
      const b11 = other.get(0, 0);
      const a12 = this.get(0, 1);
      const b12 = other.get(0, 1);
      const a21 = this.get(1, 0);
      const b21 = other.get(1, 0);
      const a22 = this.get(1, 1);
      const b22 = other.get(1, 1);
      const m1 = (a11 + a22) * (b11 + b22);
      const m2 = (a21 + a22) * b11;
      const m3 = a11 * (b12 - b22);
      const m4 = a22 * (b21 - b11);
      const m5 = (a11 + a12) * b22;
      const m6 = (a21 - a11) * (b11 + b12);
      const m7 = (a12 - a22) * (b21 + b22);
      const c00 = m1 + m4 - m5 + m7;
      const c01 = m3 + m5;
      const c10 = m2 + m4;
      const c11 = m1 - m2 + m3 + m6;
      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      return result;
    }
    strassen3x3(other) {
      other = Matrix$1.checkMatrix(other);
      let result = new Matrix$1(3, 3);
      const a00 = this.get(0, 0);
      const a01 = this.get(0, 1);
      const a02 = this.get(0, 2);
      const a10 = this.get(1, 0);
      const a11 = this.get(1, 1);
      const a12 = this.get(1, 2);
      const a20 = this.get(2, 0);
      const a21 = this.get(2, 1);
      const a22 = this.get(2, 2);
      const b00 = other.get(0, 0);
      const b01 = other.get(0, 1);
      const b02 = other.get(0, 2);
      const b10 = other.get(1, 0);
      const b11 = other.get(1, 1);
      const b12 = other.get(1, 2);
      const b20 = other.get(2, 0);
      const b21 = other.get(2, 1);
      const b22 = other.get(2, 2);
      const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
      const m2 = (a00 - a10) * (-b01 + b11);
      const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
      const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
      const m5 = (a10 + a11) * (-b00 + b01);
      const m6 = a00 * b00;
      const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
      const m8 = (-a00 + a20) * (b02 - b12);
      const m9 = (a20 + a21) * (-b00 + b02);
      const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
      const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
      const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
      const m13 = (a02 - a22) * (b11 - b21);
      const m14 = a02 * b20;
      const m15 = (a21 + a22) * (-b20 + b21);
      const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
      const m17 = (a02 - a12) * (b12 - b22);
      const m18 = (a11 + a12) * (-b20 + b22);
      const m19 = a01 * b10;
      const m20 = a12 * b21;
      const m21 = a10 * b02;
      const m22 = a20 * b01;
      const m23 = a22 * b22;
      const c00 = m6 + m14 + m19;
      const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
      const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
      const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
      const c11 = m2 + m4 + m5 + m6 + m20;
      const c12 = m14 + m16 + m17 + m18 + m21;
      const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
      const c21 = m12 + m13 + m14 + m15 + m22;
      const c22 = m6 + m7 + m8 + m9 + m23;
      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(0, 2, c02);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      result.set(1, 2, c12);
      result.set(2, 0, c20);
      result.set(2, 1, c21);
      result.set(2, 2, c22);
      return result;
    }
    mmulStrassen(y2) {
      y2 = Matrix$1.checkMatrix(y2);
      let x2 = this.clone();
      let r1 = x2.rows;
      let c1 = x2.columns;
      let r2 = y2.rows;
      let c2 = y2.columns;
      if (c1 !== r2) {
        console.warn(
          `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`
        );
      }
      function embed(mat, rows, cols) {
        let r3 = mat.rows;
        let c4 = mat.columns;
        if (r3 === rows && c4 === cols) {
          return mat;
        } else {
          let resultat = AbstractMatrix.zeros(rows, cols);
          resultat = resultat.setSubMatrix(mat, 0, 0);
          return resultat;
        }
      }
      let r = Math.max(r1, r2);
      let c3 = Math.max(c1, c2);
      x2 = embed(x2, r, c3);
      y2 = embed(y2, r, c3);
      function blockMult(a2, b, rows, cols) {
        if (rows <= 512 || cols <= 512) {
          return a2.mmul(b);
        }
        if (rows % 2 === 1 && cols % 2 === 1) {
          a2 = embed(a2, rows + 1, cols + 1);
          b = embed(b, rows + 1, cols + 1);
        } else if (rows % 2 === 1) {
          a2 = embed(a2, rows + 1, cols);
          b = embed(b, rows + 1, cols);
        } else if (cols % 2 === 1) {
          a2 = embed(a2, rows, cols + 1);
          b = embed(b, rows, cols + 1);
        }
        let halfRows = parseInt(a2.rows / 2, 10);
        let halfCols = parseInt(a2.columns / 2, 10);
        let a11 = a2.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        let a12 = a2.subMatrix(0, halfRows - 1, halfCols, a2.columns - 1);
        let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);
        let a21 = a2.subMatrix(halfRows, a2.rows - 1, 0, halfCols - 1);
        let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);
        let a22 = a2.subMatrix(halfRows, a2.rows - 1, halfCols, a2.columns - 1);
        let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);
        let m1 = blockMult(
          AbstractMatrix.add(a11, a22),
          AbstractMatrix.add(b11, b22),
          halfRows,
          halfCols
        );
        let m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
        let m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
        let m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
        let m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
        let m6 = blockMult(
          AbstractMatrix.sub(a21, a11),
          AbstractMatrix.add(b11, b12),
          halfRows,
          halfCols
        );
        let m7 = blockMult(
          AbstractMatrix.sub(a12, a22),
          AbstractMatrix.add(b21, b22),
          halfRows,
          halfCols
        );
        let c11 = AbstractMatrix.add(m1, m4);
        c11.sub(m5);
        c11.add(m7);
        let c12 = AbstractMatrix.add(m3, m5);
        let c21 = AbstractMatrix.add(m2, m4);
        let c22 = AbstractMatrix.sub(m1, m2);
        c22.add(m3);
        c22.add(m6);
        let result = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
        result = result.setSubMatrix(c11, 0, 0);
        result = result.setSubMatrix(c12, c11.rows, 0);
        result = result.setSubMatrix(c21, 0, c11.columns);
        result = result.setSubMatrix(c22, c11.rows, c11.columns);
        return result.subMatrix(0, rows - 1, 0, cols - 1);
      }
      return blockMult(x2, y2, r, c3);
    }
    scaleRows(options = {}) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { min: min2 = 0, max: max2 = 1 } = options;
      if (!Number.isFinite(min2)) throw new TypeError("min must be a number");
      if (!Number.isFinite(max2)) throw new TypeError("max must be a number");
      if (min2 >= max2) throw new RangeError("min must be smaller than max");
      let newMatrix = new Matrix$1(this.rows, this.columns);
      for (let i = 0; i < this.rows; i++) {
        const row = this.getRow(i);
        if (row.length > 0) {
          rescale(row, { min: min2, max: max2, output: row });
        }
        newMatrix.setRow(i, row);
      }
      return newMatrix;
    }
    scaleColumns(options = {}) {
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { min: min2 = 0, max: max2 = 1 } = options;
      if (!Number.isFinite(min2)) throw new TypeError("min must be a number");
      if (!Number.isFinite(max2)) throw new TypeError("max must be a number");
      if (min2 >= max2) throw new RangeError("min must be smaller than max");
      let newMatrix = new Matrix$1(this.rows, this.columns);
      for (let i = 0; i < this.columns; i++) {
        const column = this.getColumn(i);
        if (column.length) {
          rescale(column, {
            min: min2,
            max: max2,
            output: column
          });
        }
        newMatrix.setColumn(i, column);
      }
      return newMatrix;
    }
    flipRows() {
      const middle = Math.ceil(this.columns / 2);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < middle; j++) {
          let first = this.get(i, j);
          let last = this.get(i, this.columns - 1 - j);
          this.set(i, j, last);
          this.set(i, this.columns - 1 - j, first);
        }
      }
      return this;
    }
    flipColumns() {
      const middle = Math.ceil(this.rows / 2);
      for (let j = 0; j < this.columns; j++) {
        for (let i = 0; i < middle; i++) {
          let first = this.get(i, j);
          let last = this.get(this.rows - 1 - i, j);
          this.set(i, j, last);
          this.set(this.rows - 1 - i, j, first);
        }
      }
      return this;
    }
    kroneckerProduct(other) {
      other = Matrix$1.checkMatrix(other);
      let m2 = this.rows;
      let n = this.columns;
      let p = other.rows;
      let q = other.columns;
      let result = new Matrix$1(m2 * p, n * q);
      for (let i = 0; i < m2; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < p; k++) {
            for (let l = 0; l < q; l++) {
              result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
            }
          }
        }
      }
      return result;
    }
    kroneckerSum(other) {
      other = Matrix$1.checkMatrix(other);
      if (!this.isSquare() || !other.isSquare()) {
        throw new Error("Kronecker Sum needs two Square Matrices");
      }
      let m2 = this.rows;
      let n = other.rows;
      let AxI = this.kroneckerProduct(Matrix$1.eye(n, n));
      let IxB = Matrix$1.eye(m2, m2).kroneckerProduct(other);
      return AxI.add(IxB);
    }
    transpose() {
      let result = new Matrix$1(this.columns, this.rows);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          result.set(j, i, this.get(i, j));
        }
      }
      return result;
    }
    sortRows(compareFunction = compareNumbers) {
      for (let i = 0; i < this.rows; i++) {
        this.setRow(i, this.getRow(i).sort(compareFunction));
      }
      return this;
    }
    sortColumns(compareFunction = compareNumbers) {
      for (let i = 0; i < this.columns; i++) {
        this.setColumn(i, this.getColumn(i).sort(compareFunction));
      }
      return this;
    }
    subMatrix(startRow, endRow, startColumn, endColumn) {
      checkRange(this, startRow, endRow, startColumn, endColumn);
      let newMatrix = new Matrix$1(
        endRow - startRow + 1,
        endColumn - startColumn + 1
      );
      for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
          newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
        }
      }
      return newMatrix;
    }
    subMatrixRow(indices, startColumn, endColumn) {
      if (startColumn === void 0) startColumn = 0;
      if (endColumn === void 0) endColumn = this.columns - 1;
      if (startColumn > endColumn || startColumn < 0 || startColumn >= this.columns || endColumn < 0 || endColumn >= this.columns) {
        throw new RangeError("Argument out of range");
      }
      let newMatrix = new Matrix$1(indices.length, endColumn - startColumn + 1);
      for (let i = 0; i < indices.length; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
          if (indices[i] < 0 || indices[i] >= this.rows) {
            throw new RangeError(`Row index out of range: ${indices[i]}`);
          }
          newMatrix.set(i, j - startColumn, this.get(indices[i], j));
        }
      }
      return newMatrix;
    }
    subMatrixColumn(indices, startRow, endRow) {
      if (startRow === void 0) startRow = 0;
      if (endRow === void 0) endRow = this.rows - 1;
      if (startRow > endRow || startRow < 0 || startRow >= this.rows || endRow < 0 || endRow >= this.rows) {
        throw new RangeError("Argument out of range");
      }
      let newMatrix = new Matrix$1(endRow - startRow + 1, indices.length);
      for (let i = 0; i < indices.length; i++) {
        for (let j = startRow; j <= endRow; j++) {
          if (indices[i] < 0 || indices[i] >= this.columns) {
            throw new RangeError(`Column index out of range: ${indices[i]}`);
          }
          newMatrix.set(j - startRow, i, this.get(j, indices[i]));
        }
      }
      return newMatrix;
    }
    setSubMatrix(matrix2, startRow, startColumn) {
      matrix2 = Matrix$1.checkMatrix(matrix2);
      if (matrix2.isEmpty()) {
        return this;
      }
      let endRow = startRow + matrix2.rows - 1;
      let endColumn = startColumn + matrix2.columns - 1;
      checkRange(this, startRow, endRow, startColumn, endColumn);
      for (let i = 0; i < matrix2.rows; i++) {
        for (let j = 0; j < matrix2.columns; j++) {
          this.set(startRow + i, startColumn + j, matrix2.get(i, j));
        }
      }
      return this;
    }
    selection(rowIndices, columnIndices) {
      checkRowIndices(this, rowIndices);
      checkColumnIndices(this, columnIndices);
      let newMatrix = new Matrix$1(rowIndices.length, columnIndices.length);
      for (let i = 0; i < rowIndices.length; i++) {
        let rowIndex = rowIndices[i];
        for (let j = 0; j < columnIndices.length; j++) {
          let columnIndex = columnIndices[j];
          newMatrix.set(i, j, this.get(rowIndex, columnIndex));
        }
      }
      return newMatrix;
    }
    trace() {
      let min2 = Math.min(this.rows, this.columns);
      let trace = 0;
      for (let i = 0; i < min2; i++) {
        trace += this.get(i, i);
      }
      return trace;
    }
    clone() {
      return this.constructor.copy(this, new Matrix$1(this.rows, this.columns));
    }
    /**
     * @template {AbstractMatrix} M
     * @param {AbstractMatrix} from
     * @param {M} to
     * @return {M}
     */
    static copy(from, to) {
      for (const [row, column, value] of from.entries()) {
        to.set(row, column, value);
      }
      return to;
    }
    sum(by) {
      switch (by) {
        case "row":
          return sumByRow(this);
        case "column":
          return sumByColumn(this);
        case void 0:
          return sumAll(this);
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    product(by) {
      switch (by) {
        case "row":
          return productByRow(this);
        case "column":
          return productByColumn(this);
        case void 0:
          return productAll(this);
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    mean(by) {
      const sum = this.sum(by);
      switch (by) {
        case "row": {
          for (let i = 0; i < this.rows; i++) {
            sum[i] /= this.columns;
          }
          return sum;
        }
        case "column": {
          for (let i = 0; i < this.columns; i++) {
            sum[i] /= this.rows;
          }
          return sum;
        }
        case void 0:
          return sum / this.size;
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    variance(by, options = {}) {
      if (typeof by === "object") {
        options = by;
        by = void 0;
      }
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { unbiased = true, mean = this.mean(by) } = options;
      if (typeof unbiased !== "boolean") {
        throw new TypeError("unbiased must be a boolean");
      }
      switch (by) {
        case "row": {
          if (!isAnyArray.isAnyArray(mean)) {
            throw new TypeError("mean must be an array");
          }
          return varianceByRow(this, unbiased, mean);
        }
        case "column": {
          if (!isAnyArray.isAnyArray(mean)) {
            throw new TypeError("mean must be an array");
          }
          return varianceByColumn(this, unbiased, mean);
        }
        case void 0: {
          if (typeof mean !== "number") {
            throw new TypeError("mean must be a number");
          }
          return varianceAll(this, unbiased, mean);
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    standardDeviation(by, options) {
      if (typeof by === "object") {
        options = by;
        by = void 0;
      }
      const variance = this.variance(by, options);
      if (by === void 0) {
        return Math.sqrt(variance);
      } else {
        for (let i = 0; i < variance.length; i++) {
          variance[i] = Math.sqrt(variance[i]);
        }
        return variance;
      }
    }
    center(by, options = {}) {
      if (typeof by === "object") {
        options = by;
        by = void 0;
      }
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      const { center = this.mean(by) } = options;
      switch (by) {
        case "row": {
          if (!isAnyArray.isAnyArray(center)) {
            throw new TypeError("center must be an array");
          }
          centerByRow(this, center);
          return this;
        }
        case "column": {
          if (!isAnyArray.isAnyArray(center)) {
            throw new TypeError("center must be an array");
          }
          centerByColumn(this, center);
          return this;
        }
        case void 0: {
          if (typeof center !== "number") {
            throw new TypeError("center must be a number");
          }
          centerAll(this, center);
          return this;
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    scale(by, options = {}) {
      if (typeof by === "object") {
        options = by;
        by = void 0;
      }
      if (typeof options !== "object") {
        throw new TypeError("options must be an object");
      }
      let scale = options.scale;
      switch (by) {
        case "row": {
          if (scale === void 0) {
            scale = getScaleByRow(this);
          } else if (!isAnyArray.isAnyArray(scale)) {
            throw new TypeError("scale must be an array");
          }
          scaleByRow(this, scale);
          return this;
        }
        case "column": {
          if (scale === void 0) {
            scale = getScaleByColumn(this);
          } else if (!isAnyArray.isAnyArray(scale)) {
            throw new TypeError("scale must be an array");
          }
          scaleByColumn(this, scale);
          return this;
        }
        case void 0: {
          if (scale === void 0) {
            scale = getScaleAll(this);
          } else if (typeof scale !== "number") {
            throw new TypeError("scale must be a number");
          }
          scaleAll(this, scale);
          return this;
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }
    toString(options) {
      return inspectMatrixWithOptions(this, options);
    }
    [Symbol.iterator]() {
      return this.entries();
    }
    /**
     * iterator from left to right, from top to bottom
     * yield [row, column, value]
     * @returns {Generator<[number, number, number], void, void>}
     */
    *entries() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
          yield [row, col, this.get(row, col)];
        }
      }
    }
    /**
     * iterator from left to right, from top to bottom
     * yield value
     * @returns {Generator<number, void, void>}
     */
    *values() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
          yield this.get(row, col);
        }
      }
    }
  }
  AbstractMatrix.prototype.klass = "Matrix";
  if (typeof Symbol !== "undefined") {
    AbstractMatrix.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspectMatrix;
  }
  function compareNumbers(a2, b) {
    return a2 - b;
  }
  function isArrayOfNumbers(array) {
    return array.every((element) => {
      return typeof element === "number";
    });
  }
  AbstractMatrix.random = AbstractMatrix.rand;
  AbstractMatrix.randomInt = AbstractMatrix.randInt;
  AbstractMatrix.diagonal = AbstractMatrix.diag;
  AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
  AbstractMatrix.identity = AbstractMatrix.eye;
  AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
  AbstractMatrix.prototype.tensorProduct = AbstractMatrix.prototype.kroneckerProduct;
  let Matrix$1 = (_a = class extends AbstractMatrix {
    constructor(nRows, nColumns) {
      super();
      __privateAdd(this, _Matrix_instances);
      /**
       * @type {Float64Array[]}
       */
      __publicField(this, "data");
      if (_a.isMatrix(nRows)) {
        __privateMethod(this, _Matrix_instances, initData_fn).call(this, nRows.rows, nRows.columns);
        _a.copy(nRows, this);
      } else if (Number.isInteger(nRows) && nRows >= 0) {
        __privateMethod(this, _Matrix_instances, initData_fn).call(this, nRows, nColumns);
      } else if (isAnyArray.isAnyArray(nRows)) {
        const arrayData = nRows;
        nRows = arrayData.length;
        nColumns = nRows ? arrayData[0].length : 0;
        if (typeof nColumns !== "number") {
          throw new TypeError(
            "Data must be a 2D array with at least one element"
          );
        }
        this.data = [];
        for (let i = 0; i < nRows; i++) {
          if (arrayData[i].length !== nColumns) {
            throw new RangeError("Inconsistent array dimensions");
          }
          if (!isArrayOfNumbers(arrayData[i])) {
            throw new TypeError("Input data contains non-numeric values");
          }
          this.data.push(Float64Array.from(arrayData[i]));
        }
        this.rows = nRows;
        this.columns = nColumns;
      } else {
        throw new TypeError(
          "First argument must be a positive number or an array"
        );
      }
    }
    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }
    removeRow(index2) {
      checkRowIndex(this, index2);
      this.data.splice(index2, 1);
      this.rows -= 1;
      return this;
    }
    addRow(index2, array) {
      if (array === void 0) {
        array = index2;
        index2 = this.rows;
      }
      checkRowIndex(this, index2, true);
      array = Float64Array.from(checkRowVector(this, array));
      this.data.splice(index2, 0, array);
      this.rows += 1;
      return this;
    }
    removeColumn(index2) {
      checkColumnIndex(this, index2);
      for (let i = 0; i < this.rows; i++) {
        const newRow = new Float64Array(this.columns - 1);
        for (let j = 0; j < index2; j++) {
          newRow[j] = this.data[i][j];
        }
        for (let j = index2 + 1; j < this.columns; j++) {
          newRow[j - 1] = this.data[i][j];
        }
        this.data[i] = newRow;
      }
      this.columns -= 1;
      return this;
    }
    addColumn(index2, array) {
      if (typeof array === "undefined") {
        array = index2;
        index2 = this.columns;
      }
      checkColumnIndex(this, index2, true);
      array = checkColumnVector(this, array);
      for (let i = 0; i < this.rows; i++) {
        const newRow = new Float64Array(this.columns + 1);
        let j = 0;
        for (; j < index2; j++) {
          newRow[j] = this.data[i][j];
        }
        newRow[j++] = array[i];
        for (; j < this.columns + 1; j++) {
          newRow[j] = this.data[i][j - 1];
        }
        this.data[i] = newRow;
      }
      this.columns += 1;
      return this;
    }
  }, _Matrix_instances = new WeakSet(), /**
   * Init an empty matrix
   * @param {number} nRows
   * @param {number} nColumns
   */
  initData_fn = function(nRows, nColumns) {
    this.data = [];
    if (Number.isInteger(nColumns) && nColumns >= 0) {
      for (let i = 0; i < nRows; i++) {
        this.data.push(new Float64Array(nColumns));
      }
    } else {
      throw new TypeError("nColumns must be a positive integer");
    }
    this.rows = nRows;
    this.columns = nColumns;
  }, _a);
  installMathOperations(AbstractMatrix, Matrix$1);
  const _SymmetricMatrix = class _SymmetricMatrix extends AbstractMatrix {
    /**
     * @param {number | AbstractMatrix | ArrayLike<ArrayLike<number>>} diagonalSize
     * @return {this}
     */
    constructor(diagonalSize) {
      super();
      /** @type {Matrix} */
      __privateAdd(this, _matrix);
      if (Matrix$1.isMatrix(diagonalSize)) {
        if (!diagonalSize.isSymmetric()) {
          throw new TypeError("not symmetric data");
        }
        __privateSet(this, _matrix, Matrix$1.copy(
          diagonalSize,
          new Matrix$1(diagonalSize.rows, diagonalSize.rows)
        ));
      } else if (Number.isInteger(diagonalSize) && diagonalSize >= 0) {
        __privateSet(this, _matrix, new Matrix$1(diagonalSize, diagonalSize));
      } else {
        __privateSet(this, _matrix, new Matrix$1(diagonalSize));
        if (!this.isSymmetric()) {
          throw new TypeError("not symmetric data");
        }
      }
    }
    get size() {
      return __privateGet(this, _matrix).size;
    }
    get rows() {
      return __privateGet(this, _matrix).rows;
    }
    get columns() {
      return __privateGet(this, _matrix).columns;
    }
    get diagonalSize() {
      return this.rows;
    }
    /**
     * not the same as matrix.isSymmetric()
     * Here is to check if it's instanceof SymmetricMatrix without bundling issues
     *
     * @param value
     * @returns {boolean}
     */
    static isSymmetricMatrix(value) {
      return Matrix$1.isMatrix(value) && value.klassType === "SymmetricMatrix";
    }
    /**
     * @param diagonalSize
     * @return {SymmetricMatrix}
     */
    static zeros(diagonalSize) {
      return new this(diagonalSize);
    }
    /**
     * @param diagonalSize
     * @return {SymmetricMatrix}
     */
    static ones(diagonalSize) {
      return new this(diagonalSize).fill(1);
    }
    clone() {
      const matrix2 = new _SymmetricMatrix(this.diagonalSize);
      for (const [row, col, value] of this.upperRightEntries()) {
        matrix2.set(row, col, value);
      }
      return matrix2;
    }
    toMatrix() {
      return new Matrix$1(this);
    }
    get(rowIndex, columnIndex) {
      return __privateGet(this, _matrix).get(rowIndex, columnIndex);
    }
    set(rowIndex, columnIndex, value) {
      __privateGet(this, _matrix).set(rowIndex, columnIndex, value);
      __privateGet(this, _matrix).set(columnIndex, rowIndex, value);
      return this;
    }
    removeCross(index2) {
      __privateGet(this, _matrix).removeRow(index2);
      __privateGet(this, _matrix).removeColumn(index2);
      return this;
    }
    addCross(index2, array) {
      if (array === void 0) {
        array = index2;
        index2 = this.diagonalSize;
      }
      const row = array.slice();
      row.splice(index2, 1);
      __privateGet(this, _matrix).addRow(index2, row);
      __privateGet(this, _matrix).addColumn(index2, array);
      return this;
    }
    /**
     * @param {Mask[]} mask
     */
    applyMask(mask) {
      if (mask.length !== this.diagonalSize) {
        throw new RangeError("Mask size do not match with matrix size");
      }
      const sidesToRemove = [];
      for (const [index2, passthroughs] of mask.entries()) {
        if (passthroughs) continue;
        sidesToRemove.push(index2);
      }
      sidesToRemove.reverse();
      for (const sideIndex of sidesToRemove) {
        this.removeCross(sideIndex);
      }
      return this;
    }
    /**
     * Compact format upper-right corner of matrix
     * iterate from left to right, from top to bottom.
     *
     * ```
     *   A B C D
     * A 1 2 3 4
     * B 2 5 6 7
     * C 3 6 8 9
     * D 4 7 9 10
     * ```
     *
     * will return compact 1D array `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
     *
     * length is S(i=0, n=sideSize) => 10 for a 4 sideSized matrix
     *
     * @returns {number[]}
     */
    toCompact() {
      const { diagonalSize } = this;
      const compact = new Array(diagonalSize * (diagonalSize + 1) / 2);
      for (let col = 0, row = 0, index2 = 0; index2 < compact.length; index2++) {
        compact[index2] = this.get(row, col);
        if (++col >= diagonalSize) col = ++row;
      }
      return compact;
    }
    /**
     * @param {number[]} compact
     * @return {SymmetricMatrix}
     */
    static fromCompact(compact) {
      const compactSize = compact.length;
      const diagonalSize = (Math.sqrt(8 * compactSize + 1) - 1) / 2;
      if (!Number.isInteger(diagonalSize)) {
        throw new TypeError(
          `This array is not a compact representation of a Symmetric Matrix, ${JSON.stringify(
            compact
          )}`
        );
      }
      const matrix2 = new _SymmetricMatrix(diagonalSize);
      for (let col = 0, row = 0, index2 = 0; index2 < compactSize; index2++) {
        matrix2.set(col, row, compact[index2]);
        if (++col >= diagonalSize) col = ++row;
      }
      return matrix2;
    }
    /**
     * half iterator upper-right-corner from left to right, from top to bottom
     * yield [row, column, value]
     *
     * @returns {Generator<[number, number, number], void, void>}
     */
    *upperRightEntries() {
      for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
        const value = this.get(row, col);
        yield [row, col, value];
        if (++col >= this.diagonalSize) col = ++row;
      }
    }
    /**
     * half iterator upper-right-corner from left to right, from top to bottom
     * yield value
     *
     * @returns {Generator<[number, number, number], void, void>}
     */
    *upperRightValues() {
      for (let row = 0, col = 0; row < this.diagonalSize; void 0) {
        const value = this.get(row, col);
        yield value;
        if (++col >= this.diagonalSize) col = ++row;
      }
    }
  };
  _matrix = new WeakMap();
  let SymmetricMatrix = _SymmetricMatrix;
  SymmetricMatrix.prototype.klassType = "SymmetricMatrix";
  class DistanceMatrix extends SymmetricMatrix {
    /**
     * not the same as matrix.isSymmetric()
     * Here is to check if it's instanceof SymmetricMatrix without bundling issues
     *
     * @param value
     * @returns {boolean}
     */
    static isDistanceMatrix(value) {
      return SymmetricMatrix.isSymmetricMatrix(value) && value.klassSubType === "DistanceMatrix";
    }
    constructor(sideSize) {
      super(sideSize);
      if (!this.isDistance()) {
        throw new TypeError("Provided arguments do no produce a distance matrix");
      }
    }
    set(rowIndex, columnIndex, value) {
      if (rowIndex === columnIndex) value = 0;
      return super.set(rowIndex, columnIndex, value);
    }
    addCross(index2, array) {
      if (array === void 0) {
        array = index2;
        index2 = this.diagonalSize;
      }
      array = array.slice();
      array[index2] = 0;
      return super.addCross(index2, array);
    }
    toSymmetricMatrix() {
      return new SymmetricMatrix(this);
    }
    clone() {
      const matrix2 = new DistanceMatrix(this.diagonalSize);
      for (const [row, col, value] of this.upperRightEntries()) {
        if (row === col) continue;
        matrix2.set(row, col, value);
      }
      return matrix2;
    }
    /**
     * Compact format upper-right corner of matrix
     * no diagonal (only zeros)
     * iterable from left to right, from top to bottom.
     *
     * ```
     *   A B C D
     * A 0 1 2 3
     * B 1 0 4 5
     * C 2 4 0 6
     * D 3 5 6 0
     * ```
     *
     * will return compact 1D array `[1, 2, 3, 4, 5, 6]`
     *
     * length is S(i=0, n=sideSize-1) => 6 for a 4 side sized matrix
     *
     * @returns {number[]}
     */
    toCompact() {
      const { diagonalSize } = this;
      const compactLength = (diagonalSize - 1) * diagonalSize / 2;
      const compact = new Array(compactLength);
      for (let col = 1, row = 0, index2 = 0; index2 < compact.length; index2++) {
        compact[index2] = this.get(row, col);
        if (++col >= diagonalSize) col = ++row + 1;
      }
      return compact;
    }
    /**
     * @param {number[]} compact
     */
    static fromCompact(compact) {
      const compactSize = compact.length;
      if (compactSize === 0) {
        return new this(0);
      }
      const diagonalSize = (Math.sqrt(8 * compactSize + 1) + 1) / 2;
      if (!Number.isInteger(diagonalSize)) {
        throw new TypeError(
          `This array is not a compact representation of a DistanceMatrix, ${JSON.stringify(
            compact
          )}`
        );
      }
      const matrix2 = new this(diagonalSize);
      for (let col = 1, row = 0, index2 = 0; index2 < compactSize; index2++) {
        matrix2.set(col, row, compact[index2]);
        if (++col >= diagonalSize) col = ++row + 1;
      }
      return matrix2;
    }
  }
  DistanceMatrix.prototype.klassSubType = "DistanceMatrix";
  class BaseView extends AbstractMatrix {
    constructor(matrix2, rows, columns) {
      super();
      this.matrix = matrix2;
      this.rows = rows;
      this.columns = columns;
    }
  }
  class MatrixColumnView extends BaseView {
    constructor(matrix2, column) {
      checkColumnIndex(matrix2, column);
      super(matrix2, matrix2.rows, 1);
      this.column = column;
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.column, value);
      return this;
    }
    get(rowIndex) {
      return this.matrix.get(rowIndex, this.column);
    }
  }
  class MatrixColumnSelectionView extends BaseView {
    constructor(matrix2, columnIndices) {
      checkColumnIndices(matrix2, columnIndices);
      super(matrix2, matrix2.rows, columnIndices.length);
      this.columnIndices = columnIndices;
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.columnIndices[columnIndex], value);
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(rowIndex, this.columnIndices[columnIndex]);
    }
  }
  class MatrixFlipColumnView extends BaseView {
    constructor(matrix2) {
      super(matrix2, matrix2.rows, matrix2.columns);
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(rowIndex, this.columns - columnIndex - 1, value);
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(rowIndex, this.columns - columnIndex - 1);
    }
  }
  class MatrixFlipRowView extends BaseView {
    constructor(matrix2) {
      super(matrix2, matrix2.rows, matrix2.columns);
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rows - rowIndex - 1, columnIndex, value);
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rows - rowIndex - 1, columnIndex);
    }
  }
  class MatrixRowView extends BaseView {
    constructor(matrix2, row) {
      checkRowIndex(matrix2, row);
      super(matrix2, 1, matrix2.columns);
      this.row = row;
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.row, columnIndex, value);
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(this.row, columnIndex);
    }
  }
  class MatrixRowSelectionView extends BaseView {
    constructor(matrix2, rowIndices) {
      checkRowIndices(matrix2, rowIndices);
      super(matrix2, rowIndices.length, matrix2.columns);
      this.rowIndices = rowIndices;
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(this.rowIndices[rowIndex], columnIndex, value);
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(this.rowIndices[rowIndex], columnIndex);
    }
  }
  class MatrixSelectionView extends BaseView {
    constructor(matrix2, rowIndices, columnIndices) {
      checkRowIndices(matrix2, rowIndices);
      checkColumnIndices(matrix2, columnIndices);
      super(matrix2, rowIndices.length, columnIndices.length);
      this.rowIndices = rowIndices;
      this.columnIndices = columnIndices;
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(
        this.rowIndices[rowIndex],
        this.columnIndices[columnIndex],
        value
      );
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(
        this.rowIndices[rowIndex],
        this.columnIndices[columnIndex]
      );
    }
  }
  class MatrixSubView extends BaseView {
    constructor(matrix2, startRow, endRow, startColumn, endColumn) {
      checkRange(matrix2, startRow, endRow, startColumn, endColumn);
      super(matrix2, endRow - startRow + 1, endColumn - startColumn + 1);
      this.startRow = startRow;
      this.startColumn = startColumn;
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(
        this.startRow + rowIndex,
        this.startColumn + columnIndex,
        value
      );
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(
        this.startRow + rowIndex,
        this.startColumn + columnIndex
      );
    }
  }
  class MatrixTransposeView extends BaseView {
    constructor(matrix2) {
      super(matrix2, matrix2.columns, matrix2.rows);
    }
    set(rowIndex, columnIndex, value) {
      this.matrix.set(columnIndex, rowIndex, value);
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.matrix.get(columnIndex, rowIndex);
    }
  }
  class WrapperMatrix1D extends AbstractMatrix {
    constructor(data, options = {}) {
      const { rows = 1 } = options;
      if (data.length % rows !== 0) {
        throw new Error("the data length is not divisible by the number of rows");
      }
      super();
      this.rows = rows;
      this.columns = data.length / rows;
      this.data = data;
    }
    set(rowIndex, columnIndex, value) {
      let index2 = this._calculateIndex(rowIndex, columnIndex);
      this.data[index2] = value;
      return this;
    }
    get(rowIndex, columnIndex) {
      let index2 = this._calculateIndex(rowIndex, columnIndex);
      return this.data[index2];
    }
    _calculateIndex(row, column) {
      return row * this.columns + column;
    }
  }
  class WrapperMatrix2D extends AbstractMatrix {
    constructor(data) {
      super();
      this.data = data;
      this.rows = data.length;
      this.columns = data[0].length;
    }
    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }
    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }
  }
  function wrap(array, options) {
    if (isAnyArray.isAnyArray(array)) {
      if (array[0] && isAnyArray.isAnyArray(array[0])) {
        return new WrapperMatrix2D(array);
      } else {
        return new WrapperMatrix1D(array, options);
      }
    } else {
      throw new Error("the argument is not an array");
    }
  }
  class LuDecomposition {
    constructor(matrix2) {
      matrix2 = WrapperMatrix2D.checkMatrix(matrix2);
      let lu = matrix2.clone();
      let rows = lu.rows;
      let columns = lu.columns;
      let pivotVector = new Float64Array(rows);
      let pivotSign = 1;
      let i, j, k, p, s, t, v;
      let LUcolj, kmax;
      for (i = 0; i < rows; i++) {
        pivotVector[i] = i;
      }
      LUcolj = new Float64Array(rows);
      for (j = 0; j < columns; j++) {
        for (i = 0; i < rows; i++) {
          LUcolj[i] = lu.get(i, j);
        }
        for (i = 0; i < rows; i++) {
          kmax = Math.min(i, j);
          s = 0;
          for (k = 0; k < kmax; k++) {
            s += lu.get(i, k) * LUcolj[k];
          }
          LUcolj[i] -= s;
          lu.set(i, j, LUcolj[i]);
        }
        p = j;
        for (i = j + 1; i < rows; i++) {
          if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
            p = i;
          }
        }
        if (p !== j) {
          for (k = 0; k < columns; k++) {
            t = lu.get(p, k);
            lu.set(p, k, lu.get(j, k));
            lu.set(j, k, t);
          }
          v = pivotVector[p];
          pivotVector[p] = pivotVector[j];
          pivotVector[j] = v;
          pivotSign = -pivotSign;
        }
        if (j < rows && lu.get(j, j) !== 0) {
          for (i = j + 1; i < rows; i++) {
            lu.set(i, j, lu.get(i, j) / lu.get(j, j));
          }
        }
      }
      this.LU = lu;
      this.pivotVector = pivotVector;
      this.pivotSign = pivotSign;
    }
    isSingular() {
      let data = this.LU;
      let col = data.columns;
      for (let j = 0; j < col; j++) {
        if (data.get(j, j) === 0) {
          return true;
        }
      }
      return false;
    }
    solve(value) {
      value = Matrix$1.checkMatrix(value);
      let lu = this.LU;
      let rows = lu.rows;
      if (rows !== value.rows) {
        throw new Error("Invalid matrix dimensions");
      }
      if (this.isSingular()) {
        throw new Error("LU matrix is singular");
      }
      let count = value.columns;
      let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
      let columns = lu.columns;
      let i, j, k;
      for (k = 0; k < columns; k++) {
        for (i = k + 1; i < columns; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
          }
        }
      }
      for (k = columns - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X.set(k, j, X.get(k, j) / lu.get(k, k));
        }
        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
          }
        }
      }
      return X;
    }
    get determinant() {
      let data = this.LU;
      if (!data.isSquare()) {
        throw new Error("Matrix must be square");
      }
      let determinant2 = this.pivotSign;
      let col = data.columns;
      for (let j = 0; j < col; j++) {
        determinant2 *= data.get(j, j);
      }
      return determinant2;
    }
    get lowerTriangularMatrix() {
      let data = this.LU;
      let rows = data.rows;
      let columns = data.columns;
      let X = new Matrix$1(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (i > j) {
            X.set(i, j, data.get(i, j));
          } else if (i === j) {
            X.set(i, j, 1);
          } else {
            X.set(i, j, 0);
          }
        }
      }
      return X;
    }
    get upperTriangularMatrix() {
      let data = this.LU;
      let rows = data.rows;
      let columns = data.columns;
      let X = new Matrix$1(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (i <= j) {
            X.set(i, j, data.get(i, j));
          } else {
            X.set(i, j, 0);
          }
        }
      }
      return X;
    }
    get pivotPermutationVector() {
      return Array.from(this.pivotVector);
    }
  }
  function hypotenuse(a2, b) {
    let r = 0;
    if (Math.abs(a2) > Math.abs(b)) {
      r = b / a2;
      return Math.abs(a2) * Math.sqrt(1 + r * r);
    }
    if (b !== 0) {
      r = a2 / b;
      return Math.abs(b) * Math.sqrt(1 + r * r);
    }
    return 0;
  }
  class QrDecomposition {
    constructor(value) {
      value = WrapperMatrix2D.checkMatrix(value);
      let qr = value.clone();
      let m2 = value.rows;
      let n = value.columns;
      let rdiag = new Float64Array(n);
      let i, j, k, s;
      for (k = 0; k < n; k++) {
        let nrm = 0;
        for (i = k; i < m2; i++) {
          nrm = hypotenuse(nrm, qr.get(i, k));
        }
        if (nrm !== 0) {
          if (qr.get(k, k) < 0) {
            nrm = -nrm;
          }
          for (i = k; i < m2; i++) {
            qr.set(i, k, qr.get(i, k) / nrm);
          }
          qr.set(k, k, qr.get(k, k) + 1);
          for (j = k + 1; j < n; j++) {
            s = 0;
            for (i = k; i < m2; i++) {
              s += qr.get(i, k) * qr.get(i, j);
            }
            s = -s / qr.get(k, k);
            for (i = k; i < m2; i++) {
              qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
            }
          }
        }
        rdiag[k] = -nrm;
      }
      this.QR = qr;
      this.Rdiag = rdiag;
    }
    solve(value) {
      value = Matrix$1.checkMatrix(value);
      let qr = this.QR;
      let m2 = qr.rows;
      if (value.rows !== m2) {
        throw new Error("Matrix row dimensions must agree");
      }
      if (!this.isFullRank()) {
        throw new Error("Matrix is rank deficient");
      }
      let count = value.columns;
      let X = value.clone();
      let n = qr.columns;
      let i, j, k, s;
      for (k = 0; k < n; k++) {
        for (j = 0; j < count; j++) {
          s = 0;
          for (i = k; i < m2; i++) {
            s += qr.get(i, k) * X.get(i, j);
          }
          s = -s / qr.get(k, k);
          for (i = k; i < m2; i++) {
            X.set(i, j, X.get(i, j) + s * qr.get(i, k));
          }
        }
      }
      for (k = n - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X.set(k, j, X.get(k, j) / this.Rdiag[k]);
        }
        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * qr.get(i, k));
          }
        }
      }
      return X.subMatrix(0, n - 1, 0, count - 1);
    }
    isFullRank() {
      let columns = this.QR.columns;
      for (let i = 0; i < columns; i++) {
        if (this.Rdiag[i] === 0) {
          return false;
        }
      }
      return true;
    }
    get upperTriangularMatrix() {
      let qr = this.QR;
      let n = qr.columns;
      let X = new Matrix$1(n, n);
      let i, j;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (i < j) {
            X.set(i, j, qr.get(i, j));
          } else if (i === j) {
            X.set(i, j, this.Rdiag[i]);
          } else {
            X.set(i, j, 0);
          }
        }
      }
      return X;
    }
    get orthogonalMatrix() {
      let qr = this.QR;
      let rows = qr.rows;
      let columns = qr.columns;
      let X = new Matrix$1(rows, columns);
      let i, j, k, s;
      for (k = columns - 1; k >= 0; k--) {
        for (i = 0; i < rows; i++) {
          X.set(i, k, 0);
        }
        X.set(k, k, 1);
        for (j = k; j < columns; j++) {
          if (qr.get(k, k) !== 0) {
            s = 0;
            for (i = k; i < rows; i++) {
              s += qr.get(i, k) * X.get(i, j);
            }
            s = -s / qr.get(k, k);
            for (i = k; i < rows; i++) {
              X.set(i, j, X.get(i, j) + s * qr.get(i, k));
            }
          }
        }
      }
      return X;
    }
  }
  let SingularValueDecomposition$1 = class SingularValueDecomposition {
    constructor(value, options = {}) {
      value = WrapperMatrix2D.checkMatrix(value);
      if (value.isEmpty()) {
        throw new Error("Matrix must be non-empty");
      }
      let m2 = value.rows;
      let n = value.columns;
      const {
        computeLeftSingularVectors = true,
        computeRightSingularVectors = true,
        autoTranspose = false
      } = options;
      let wantu = Boolean(computeLeftSingularVectors);
      let wantv = Boolean(computeRightSingularVectors);
      let swapped = false;
      let a2;
      if (m2 < n) {
        if (!autoTranspose) {
          a2 = value.clone();
          console.warn(
            "Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose"
          );
        } else {
          a2 = value.transpose();
          m2 = a2.rows;
          n = a2.columns;
          swapped = true;
          let aux = wantu;
          wantu = wantv;
          wantv = aux;
        }
      } else {
        a2 = value.clone();
      }
      let nu = Math.min(m2, n);
      let ni = Math.min(m2 + 1, n);
      let s = new Float64Array(ni);
      let U = new Matrix$1(m2, nu);
      let V = new Matrix$1(n, n);
      let e = new Float64Array(n);
      let work = new Float64Array(m2);
      let si = new Float64Array(ni);
      for (let i = 0; i < ni; i++) si[i] = i;
      let nct = Math.min(m2 - 1, n);
      let nrt = Math.max(0, Math.min(n - 2, m2));
      let mrc = Math.max(nct, nrt);
      for (let k = 0; k < mrc; k++) {
        if (k < nct) {
          s[k] = 0;
          for (let i = k; i < m2; i++) {
            s[k] = hypotenuse(s[k], a2.get(i, k));
          }
          if (s[k] !== 0) {
            if (a2.get(k, k) < 0) {
              s[k] = -s[k];
            }
            for (let i = k; i < m2; i++) {
              a2.set(i, k, a2.get(i, k) / s[k]);
            }
            a2.set(k, k, a2.get(k, k) + 1);
          }
          s[k] = -s[k];
        }
        for (let j = k + 1; j < n; j++) {
          if (k < nct && s[k] !== 0) {
            let t = 0;
            for (let i = k; i < m2; i++) {
              t += a2.get(i, k) * a2.get(i, j);
            }
            t = -t / a2.get(k, k);
            for (let i = k; i < m2; i++) {
              a2.set(i, j, a2.get(i, j) + t * a2.get(i, k));
            }
          }
          e[j] = a2.get(k, j);
        }
        if (wantu && k < nct) {
          for (let i = k; i < m2; i++) {
            U.set(i, k, a2.get(i, k));
          }
        }
        if (k < nrt) {
          e[k] = 0;
          for (let i = k + 1; i < n; i++) {
            e[k] = hypotenuse(e[k], e[i]);
          }
          if (e[k] !== 0) {
            if (e[k + 1] < 0) {
              e[k] = 0 - e[k];
            }
            for (let i = k + 1; i < n; i++) {
              e[i] /= e[k];
            }
            e[k + 1] += 1;
          }
          e[k] = -e[k];
          if (k + 1 < m2 && e[k] !== 0) {
            for (let i = k + 1; i < m2; i++) {
              work[i] = 0;
            }
            for (let i = k + 1; i < m2; i++) {
              for (let j = k + 1; j < n; j++) {
                work[i] += e[j] * a2.get(i, j);
              }
            }
            for (let j = k + 1; j < n; j++) {
              let t = -e[j] / e[k + 1];
              for (let i = k + 1; i < m2; i++) {
                a2.set(i, j, a2.get(i, j) + t * work[i]);
              }
            }
          }
          if (wantv) {
            for (let i = k + 1; i < n; i++) {
              V.set(i, k, e[i]);
            }
          }
        }
      }
      let p = Math.min(n, m2 + 1);
      if (nct < n) {
        s[nct] = a2.get(nct, nct);
      }
      if (m2 < p) {
        s[p - 1] = 0;
      }
      if (nrt + 1 < p) {
        e[nrt] = a2.get(nrt, p - 1);
      }
      e[p - 1] = 0;
      if (wantu) {
        for (let j = nct; j < nu; j++) {
          for (let i = 0; i < m2; i++) {
            U.set(i, j, 0);
          }
          U.set(j, j, 1);
        }
        for (let k = nct - 1; k >= 0; k--) {
          if (s[k] !== 0) {
            for (let j = k + 1; j < nu; j++) {
              let t = 0;
              for (let i = k; i < m2; i++) {
                t += U.get(i, k) * U.get(i, j);
              }
              t = -t / U.get(k, k);
              for (let i = k; i < m2; i++) {
                U.set(i, j, U.get(i, j) + t * U.get(i, k));
              }
            }
            for (let i = k; i < m2; i++) {
              U.set(i, k, -U.get(i, k));
            }
            U.set(k, k, 1 + U.get(k, k));
            for (let i = 0; i < k - 1; i++) {
              U.set(i, k, 0);
            }
          } else {
            for (let i = 0; i < m2; i++) {
              U.set(i, k, 0);
            }
            U.set(k, k, 1);
          }
        }
      }
      if (wantv) {
        for (let k = n - 1; k >= 0; k--) {
          if (k < nrt && e[k] !== 0) {
            for (let j = k + 1; j < n; j++) {
              let t = 0;
              for (let i = k + 1; i < n; i++) {
                t += V.get(i, k) * V.get(i, j);
              }
              t = -t / V.get(k + 1, k);
              for (let i = k + 1; i < n; i++) {
                V.set(i, j, V.get(i, j) + t * V.get(i, k));
              }
            }
          }
          for (let i = 0; i < n; i++) {
            V.set(i, k, 0);
          }
          V.set(k, k, 1);
        }
      }
      let pp = p - 1;
      let eps = Number.EPSILON;
      while (p > 0) {
        let k, kase;
        for (k = p - 2; k >= -1; k--) {
          if (k === -1) {
            break;
          }
          const alpha = Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
          if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
            e[k] = 0;
            break;
          }
        }
        if (k === p - 2) {
          kase = 4;
        } else {
          let ks;
          for (ks = p - 1; ks >= k; ks--) {
            if (ks === k) {
              break;
            }
            let t = (ks !== p ? Math.abs(e[ks]) : 0) + (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
            if (Math.abs(s[ks]) <= eps * t) {
              s[ks] = 0;
              break;
            }
          }
          if (ks === k) {
            kase = 3;
          } else if (ks === p - 1) {
            kase = 1;
          } else {
            kase = 2;
            k = ks;
          }
        }
        k++;
        switch (kase) {
          case 1: {
            let f = e[p - 2];
            e[p - 2] = 0;
            for (let j = p - 2; j >= k; j--) {
              let t = hypotenuse(s[j], f);
              let cs = s[j] / t;
              let sn = f / t;
              s[j] = t;
              if (j !== k) {
                f = -sn * e[j - 1];
                e[j - 1] = cs * e[j - 1];
              }
              if (wantv) {
                for (let i = 0; i < n; i++) {
                  t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                  V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                  V.set(i, j, t);
                }
              }
            }
            break;
          }
          case 2: {
            let f = e[k - 1];
            e[k - 1] = 0;
            for (let j = k; j < p; j++) {
              let t = hypotenuse(s[j], f);
              let cs = s[j] / t;
              let sn = f / t;
              s[j] = t;
              f = -sn * e[j];
              e[j] = cs * e[j];
              if (wantu) {
                for (let i = 0; i < m2; i++) {
                  t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                  U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                  U.set(i, j, t);
                }
              }
            }
            break;
          }
          case 3: {
            const scale = Math.max(
              Math.abs(s[p - 1]),
              Math.abs(s[p - 2]),
              Math.abs(e[p - 2]),
              Math.abs(s[k]),
              Math.abs(e[k])
            );
            const sp = s[p - 1] / scale;
            const spm1 = s[p - 2] / scale;
            const epm1 = e[p - 2] / scale;
            const sk = s[k] / scale;
            const ek = e[k] / scale;
            const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
            const c2 = sp * epm1 * (sp * epm1);
            let shift = 0;
            if (b !== 0 || c2 !== 0) {
              if (b < 0) {
                shift = 0 - Math.sqrt(b * b + c2);
              } else {
                shift = Math.sqrt(b * b + c2);
              }
              shift = c2 / (b + shift);
            }
            let f = (sk + sp) * (sk - sp) + shift;
            let g = sk * ek;
            for (let j = k; j < p - 1; j++) {
              let t = hypotenuse(f, g);
              if (t === 0) t = Number.MIN_VALUE;
              let cs = f / t;
              let sn = g / t;
              if (j !== k) {
                e[j - 1] = t;
              }
              f = cs * s[j] + sn * e[j];
              e[j] = cs * e[j] - sn * s[j];
              g = sn * s[j + 1];
              s[j + 1] = cs * s[j + 1];
              if (wantv) {
                for (let i = 0; i < n; i++) {
                  t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                  V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                  V.set(i, j, t);
                }
              }
              t = hypotenuse(f, g);
              if (t === 0) t = Number.MIN_VALUE;
              cs = f / t;
              sn = g / t;
              s[j] = t;
              f = cs * e[j] + sn * s[j + 1];
              s[j + 1] = -sn * e[j] + cs * s[j + 1];
              g = sn * e[j + 1];
              e[j + 1] = cs * e[j + 1];
              if (wantu && j < m2 - 1) {
                for (let i = 0; i < m2; i++) {
                  t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                  U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                  U.set(i, j, t);
                }
              }
            }
            e[p - 2] = f;
            break;
          }
          case 4: {
            if (s[k] <= 0) {
              s[k] = s[k] < 0 ? -s[k] : 0;
              if (wantv) {
                for (let i = 0; i <= pp; i++) {
                  V.set(i, k, -V.get(i, k));
                }
              }
            }
            while (k < pp) {
              if (s[k] >= s[k + 1]) {
                break;
              }
              let t = s[k];
              s[k] = s[k + 1];
              s[k + 1] = t;
              if (wantv && k < n - 1) {
                for (let i = 0; i < n; i++) {
                  t = V.get(i, k + 1);
                  V.set(i, k + 1, V.get(i, k));
                  V.set(i, k, t);
                }
              }
              if (wantu && k < m2 - 1) {
                for (let i = 0; i < m2; i++) {
                  t = U.get(i, k + 1);
                  U.set(i, k + 1, U.get(i, k));
                  U.set(i, k, t);
                }
              }
              k++;
            }
            p--;
            break;
          }
        }
      }
      if (swapped) {
        let tmp = V;
        V = U;
        U = tmp;
      }
      this.m = m2;
      this.n = n;
      this.s = s;
      this.U = U;
      this.V = V;
    }
    solve(value) {
      let Y = value;
      let e = this.threshold;
      let scols = this.s.length;
      let Ls = Matrix$1.zeros(scols, scols);
      for (let i = 0; i < scols; i++) {
        if (Math.abs(this.s[i]) <= e) {
          Ls.set(i, i, 0);
        } else {
          Ls.set(i, i, 1 / this.s[i]);
        }
      }
      let U = this.U;
      let V = this.rightSingularVectors;
      let VL = V.mmul(Ls);
      let vrows = V.rows;
      let urows = U.rows;
      let VLU = Matrix$1.zeros(vrows, urows);
      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;
          for (let k = 0; k < scols; k++) {
            sum += VL.get(i, k) * U.get(j, k);
          }
          VLU.set(i, j, sum);
        }
      }
      return VLU.mmul(Y);
    }
    solveForDiagonal(value) {
      return this.solve(Matrix$1.diag(value));
    }
    inverse() {
      let V = this.V;
      let e = this.threshold;
      let vrows = V.rows;
      let vcols = V.columns;
      let X = new Matrix$1(vrows, this.s.length);
      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < vcols; j++) {
          if (Math.abs(this.s[j]) > e) {
            X.set(i, j, V.get(i, j) / this.s[j]);
          }
        }
      }
      let U = this.U;
      let urows = U.rows;
      let ucols = U.columns;
      let Y = new Matrix$1(vrows, urows);
      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;
          for (let k = 0; k < ucols; k++) {
            sum += X.get(i, k) * U.get(j, k);
          }
          Y.set(i, j, sum);
        }
      }
      return Y;
    }
    get condition() {
      return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    }
    get norm2() {
      return this.s[0];
    }
    get rank() {
      let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
      let r = 0;
      let s = this.s;
      for (let i = 0, ii = s.length; i < ii; i++) {
        if (s[i] > tol) {
          r++;
        }
      }
      return r;
    }
    get diagonal() {
      return Array.from(this.s);
    }
    get threshold() {
      return Number.EPSILON / 2 * Math.max(this.m, this.n) * this.s[0];
    }
    get leftSingularVectors() {
      return this.U;
    }
    get rightSingularVectors() {
      return this.V;
    }
    get diagonalMatrix() {
      return Matrix$1.diag(this.s);
    }
  };
  function inverse(matrix2, useSVD = false) {
    matrix2 = WrapperMatrix2D.checkMatrix(matrix2);
    if (useSVD) {
      return new SingularValueDecomposition$1(matrix2).inverse();
    } else {
      return solve(matrix2, Matrix$1.eye(matrix2.rows));
    }
  }
  function solve(leftHandSide, rightHandSide, useSVD = false) {
    leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
    rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
    if (useSVD) {
      return new SingularValueDecomposition$1(leftHandSide).solve(rightHandSide);
    } else {
      return leftHandSide.isSquare() ? new LuDecomposition(leftHandSide).solve(rightHandSide) : new QrDecomposition(leftHandSide).solve(rightHandSide);
    }
  }
  function determinant(matrix2) {
    matrix2 = Matrix$1.checkMatrix(matrix2);
    if (matrix2.isSquare()) {
      if (matrix2.columns === 0) {
        return 1;
      }
      let a2, b, c2, d;
      if (matrix2.columns === 2) {
        a2 = matrix2.get(0, 0);
        b = matrix2.get(0, 1);
        c2 = matrix2.get(1, 0);
        d = matrix2.get(1, 1);
        return a2 * d - b * c2;
      } else if (matrix2.columns === 3) {
        let subMatrix0, subMatrix1, subMatrix2;
        subMatrix0 = new MatrixSelectionView(matrix2, [1, 2], [1, 2]);
        subMatrix1 = new MatrixSelectionView(matrix2, [1, 2], [0, 2]);
        subMatrix2 = new MatrixSelectionView(matrix2, [1, 2], [0, 1]);
        a2 = matrix2.get(0, 0);
        b = matrix2.get(0, 1);
        c2 = matrix2.get(0, 2);
        return a2 * determinant(subMatrix0) - b * determinant(subMatrix1) + c2 * determinant(subMatrix2);
      } else {
        return new LuDecomposition(matrix2).determinant;
      }
    } else {
      throw Error("determinant can only be calculated for a square matrix");
    }
  }
  function xrange(n, exception) {
    let range = [];
    for (let i = 0; i < n; i++) {
      if (i !== exception) {
        range.push(i);
      }
    }
    return range;
  }
  function dependenciesOneRow(error, matrix2, index2, thresholdValue = 1e-9, thresholdError = 1e-9) {
    if (error > thresholdError) {
      return new Array(matrix2.rows + 1).fill(0);
    } else {
      let returnArray = matrix2.addRow(index2, [0]);
      for (let i = 0; i < returnArray.rows; i++) {
        if (Math.abs(returnArray.get(i, 0)) < thresholdValue) {
          returnArray.set(i, 0, 0);
        }
      }
      return returnArray.to1DArray();
    }
  }
  function linearDependencies(matrix2, options = {}) {
    const { thresholdValue = 1e-9, thresholdError = 1e-9 } = options;
    matrix2 = Matrix$1.checkMatrix(matrix2);
    let n = matrix2.rows;
    let results = new Matrix$1(n, n);
    for (let i = 0; i < n; i++) {
      let b = Matrix$1.columnVector(matrix2.getRow(i));
      let Abis = matrix2.subMatrixRow(xrange(n, i)).transpose();
      let svd = new SingularValueDecomposition$1(Abis);
      let x2 = svd.solve(b);
      let error = Matrix$1.sub(b, Abis.mmul(x2)).abs().max();
      results.setRow(
        i,
        dependenciesOneRow(error, x2, i, thresholdValue, thresholdError)
      );
    }
    return results;
  }
  function pseudoInverse(matrix2, threshold = Number.EPSILON) {
    matrix2 = Matrix$1.checkMatrix(matrix2);
    if (matrix2.isEmpty()) {
      return matrix2.transpose();
    }
    let svdSolution = new SingularValueDecomposition$1(matrix2, { autoTranspose: true });
    let U = svdSolution.leftSingularVectors;
    let V = svdSolution.rightSingularVectors;
    let s = svdSolution.diagonal;
    for (let i = 0; i < s.length; i++) {
      if (Math.abs(s[i]) > threshold) {
        s[i] = 1 / s[i];
      } else {
        s[i] = 0;
      }
    }
    return V.mmul(Matrix$1.diag(s).mmul(U.transpose()));
  }
  function covariance(xMatrix, yMatrix = xMatrix, options = {}) {
    xMatrix = new Matrix$1(xMatrix);
    let yIsSame = false;
    if (typeof yMatrix === "object" && !Matrix$1.isMatrix(yMatrix) && !isAnyArray.isAnyArray(yMatrix)) {
      options = yMatrix;
      yMatrix = xMatrix;
      yIsSame = true;
    } else {
      yMatrix = new Matrix$1(yMatrix);
    }
    if (xMatrix.rows !== yMatrix.rows) {
      throw new TypeError("Both matrices must have the same number of rows");
    }
    const { center = true } = options;
    if (center) {
      xMatrix = xMatrix.center("column");
      if (!yIsSame) {
        yMatrix = yMatrix.center("column");
      }
    }
    const cov = xMatrix.transpose().mmul(yMatrix);
    for (let i = 0; i < cov.rows; i++) {
      for (let j = 0; j < cov.columns; j++) {
        cov.set(i, j, cov.get(i, j) * (1 / (xMatrix.rows - 1)));
      }
    }
    return cov;
  }
  function correlation(xMatrix, yMatrix = xMatrix, options = {}) {
    xMatrix = new Matrix$1(xMatrix);
    let yIsSame = false;
    if (typeof yMatrix === "object" && !Matrix$1.isMatrix(yMatrix) && !isAnyArray.isAnyArray(yMatrix)) {
      options = yMatrix;
      yMatrix = xMatrix;
      yIsSame = true;
    } else {
      yMatrix = new Matrix$1(yMatrix);
    }
    if (xMatrix.rows !== yMatrix.rows) {
      throw new TypeError("Both matrices must have the same number of rows");
    }
    const { center = true, scale = true } = options;
    if (center) {
      xMatrix.center("column");
      if (!yIsSame) {
        yMatrix.center("column");
      }
    }
    if (scale) {
      xMatrix.scale("column");
      if (!yIsSame) {
        yMatrix.scale("column");
      }
    }
    const sdx = xMatrix.standardDeviation("column", { unbiased: true });
    const sdy = yIsSame ? sdx : yMatrix.standardDeviation("column", { unbiased: true });
    const corr = xMatrix.transpose().mmul(yMatrix);
    for (let i = 0; i < corr.rows; i++) {
      for (let j = 0; j < corr.columns; j++) {
        corr.set(
          i,
          j,
          corr.get(i, j) * (1 / (sdx[i] * sdy[j])) * (1 / (xMatrix.rows - 1))
        );
      }
    }
    return corr;
  }
  class EigenvalueDecomposition {
    constructor(matrix2, options = {}) {
      const { assumeSymmetric = false } = options;
      matrix2 = WrapperMatrix2D.checkMatrix(matrix2);
      if (!matrix2.isSquare()) {
        throw new Error("Matrix is not a square matrix");
      }
      if (matrix2.isEmpty()) {
        throw new Error("Matrix must be non-empty");
      }
      let n = matrix2.columns;
      let V = new Matrix$1(n, n);
      let d = new Float64Array(n);
      let e = new Float64Array(n);
      let value = matrix2;
      let i, j;
      let isSymmetric = false;
      if (assumeSymmetric) {
        isSymmetric = true;
      } else {
        isSymmetric = matrix2.isSymmetric();
      }
      if (isSymmetric) {
        for (i = 0; i < n; i++) {
          for (j = 0; j < n; j++) {
            V.set(i, j, value.get(i, j));
          }
        }
        tred2(n, e, d, V);
        tql2(n, e, d, V);
      } else {
        let H = new Matrix$1(n, n);
        let ort = new Float64Array(n);
        for (j = 0; j < n; j++) {
          for (i = 0; i < n; i++) {
            H.set(i, j, value.get(i, j));
          }
        }
        orthes(n, H, ort, V);
        hqr2(n, e, d, V, H);
      }
      this.n = n;
      this.e = e;
      this.d = d;
      this.V = V;
    }
    get realEigenvalues() {
      return Array.from(this.d);
    }
    get imaginaryEigenvalues() {
      return Array.from(this.e);
    }
    get eigenvectorMatrix() {
      return this.V;
    }
    get diagonalMatrix() {
      let n = this.n;
      let e = this.e;
      let d = this.d;
      let X = new Matrix$1(n, n);
      let i, j;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          X.set(i, j, 0);
        }
        X.set(i, i, d[i]);
        if (e[i] > 0) {
          X.set(i, i + 1, e[i]);
        } else if (e[i] < 0) {
          X.set(i, i - 1, e[i]);
        }
      }
      return X;
    }
  }
  function tred2(n, e, d, V) {
    let f, g, h, i, j, k, hh, scale;
    for (j = 0; j < n; j++) {
      d[j] = V.get(n - 1, j);
    }
    for (i = n - 1; i > 0; i--) {
      scale = 0;
      h = 0;
      for (k = 0; k < i; k++) {
        scale = scale + Math.abs(d[k]);
      }
      if (scale === 0) {
        e[i] = d[i - 1];
        for (j = 0; j < i; j++) {
          d[j] = V.get(i - 1, j);
          V.set(i, j, 0);
          V.set(j, i, 0);
        }
      } else {
        for (k = 0; k < i; k++) {
          d[k] /= scale;
          h += d[k] * d[k];
        }
        f = d[i - 1];
        g = Math.sqrt(h);
        if (f > 0) {
          g = -g;
        }
        e[i] = scale * g;
        h = h - f * g;
        d[i - 1] = f - g;
        for (j = 0; j < i; j++) {
          e[j] = 0;
        }
        for (j = 0; j < i; j++) {
          f = d[j];
          V.set(j, i, f);
          g = e[j] + V.get(j, j) * f;
          for (k = j + 1; k <= i - 1; k++) {
            g += V.get(k, j) * d[k];
            e[k] += V.get(k, j) * f;
          }
          e[j] = g;
        }
        f = 0;
        for (j = 0; j < i; j++) {
          e[j] /= h;
          f += e[j] * d[j];
        }
        hh = f / (h + h);
        for (j = 0; j < i; j++) {
          e[j] -= hh * d[j];
        }
        for (j = 0; j < i; j++) {
          f = d[j];
          g = e[j];
          for (k = j; k <= i - 1; k++) {
            V.set(k, j, V.get(k, j) - (f * e[k] + g * d[k]));
          }
          d[j] = V.get(i - 1, j);
          V.set(i, j, 0);
        }
      }
      d[i] = h;
    }
    for (i = 0; i < n - 1; i++) {
      V.set(n - 1, i, V.get(i, i));
      V.set(i, i, 1);
      h = d[i + 1];
      if (h !== 0) {
        for (k = 0; k <= i; k++) {
          d[k] = V.get(k, i + 1) / h;
        }
        for (j = 0; j <= i; j++) {
          g = 0;
          for (k = 0; k <= i; k++) {
            g += V.get(k, i + 1) * V.get(k, j);
          }
          for (k = 0; k <= i; k++) {
            V.set(k, j, V.get(k, j) - g * d[k]);
          }
        }
      }
      for (k = 0; k <= i; k++) {
        V.set(k, i + 1, 0);
      }
    }
    for (j = 0; j < n; j++) {
      d[j] = V.get(n - 1, j);
      V.set(n - 1, j, 0);
    }
    V.set(n - 1, n - 1, 1);
    e[0] = 0;
  }
  function tql2(n, e, d, V) {
    let g, h, i, j, k, l, m2, p, r, dl1, c2, c22, c3, el1, s, s2;
    for (i = 1; i < n; i++) {
      e[i - 1] = e[i];
    }
    e[n - 1] = 0;
    let f = 0;
    let tst1 = 0;
    let eps = Number.EPSILON;
    for (l = 0; l < n; l++) {
      tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
      m2 = l;
      while (m2 < n) {
        if (Math.abs(e[m2]) <= eps * tst1) {
          break;
        }
        m2++;
      }
      if (m2 > l) {
        do {
          g = d[l];
          p = (d[l + 1] - g) / (2 * e[l]);
          r = hypotenuse(p, 1);
          if (p < 0) {
            r = -r;
          }
          d[l] = e[l] / (p + r);
          d[l + 1] = e[l] * (p + r);
          dl1 = d[l + 1];
          h = g - d[l];
          for (i = l + 2; i < n; i++) {
            d[i] -= h;
          }
          f = f + h;
          p = d[m2];
          c2 = 1;
          c22 = c2;
          c3 = c2;
          el1 = e[l + 1];
          s = 0;
          s2 = 0;
          for (i = m2 - 1; i >= l; i--) {
            c3 = c22;
            c22 = c2;
            s2 = s;
            g = c2 * e[i];
            h = c2 * p;
            r = hypotenuse(p, e[i]);
            e[i + 1] = s * r;
            s = e[i] / r;
            c2 = p / r;
            p = c2 * d[i] - s * g;
            d[i + 1] = h + s * (c2 * g + s * d[i]);
            for (k = 0; k < n; k++) {
              h = V.get(k, i + 1);
              V.set(k, i + 1, s * V.get(k, i) + c2 * h);
              V.set(k, i, c2 * V.get(k, i) - s * h);
            }
          }
          p = -s * s2 * c3 * el1 * e[l] / dl1;
          e[l] = s * p;
          d[l] = c2 * p;
        } while (Math.abs(e[l]) > eps * tst1);
      }
      d[l] = d[l] + f;
      e[l] = 0;
    }
    for (i = 0; i < n - 1; i++) {
      k = i;
      p = d[i];
      for (j = i + 1; j < n; j++) {
        if (d[j] < p) {
          k = j;
          p = d[j];
        }
      }
      if (k !== i) {
        d[k] = d[i];
        d[i] = p;
        for (j = 0; j < n; j++) {
          p = V.get(j, i);
          V.set(j, i, V.get(j, k));
          V.set(j, k, p);
        }
      }
    }
  }
  function orthes(n, H, ort, V) {
    let low = 0;
    let high = n - 1;
    let f, g, h, i, j, m2;
    let scale;
    for (m2 = low + 1; m2 <= high - 1; m2++) {
      scale = 0;
      for (i = m2; i <= high; i++) {
        scale = scale + Math.abs(H.get(i, m2 - 1));
      }
      if (scale !== 0) {
        h = 0;
        for (i = high; i >= m2; i--) {
          ort[i] = H.get(i, m2 - 1) / scale;
          h += ort[i] * ort[i];
        }
        g = Math.sqrt(h);
        if (ort[m2] > 0) {
          g = -g;
        }
        h = h - ort[m2] * g;
        ort[m2] = ort[m2] - g;
        for (j = m2; j < n; j++) {
          f = 0;
          for (i = high; i >= m2; i--) {
            f += ort[i] * H.get(i, j);
          }
          f = f / h;
          for (i = m2; i <= high; i++) {
            H.set(i, j, H.get(i, j) - f * ort[i]);
          }
        }
        for (i = 0; i <= high; i++) {
          f = 0;
          for (j = high; j >= m2; j--) {
            f += ort[j] * H.get(i, j);
          }
          f = f / h;
          for (j = m2; j <= high; j++) {
            H.set(i, j, H.get(i, j) - f * ort[j]);
          }
        }
        ort[m2] = scale * ort[m2];
        H.set(m2, m2 - 1, scale * g);
      }
    }
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        V.set(i, j, i === j ? 1 : 0);
      }
    }
    for (m2 = high - 1; m2 >= low + 1; m2--) {
      if (H.get(m2, m2 - 1) !== 0) {
        for (i = m2 + 1; i <= high; i++) {
          ort[i] = H.get(i, m2 - 1);
        }
        for (j = m2; j <= high; j++) {
          g = 0;
          for (i = m2; i <= high; i++) {
            g += ort[i] * V.get(i, j);
          }
          g = g / ort[m2] / H.get(m2, m2 - 1);
          for (i = m2; i <= high; i++) {
            V.set(i, j, V.get(i, j) + g * ort[i]);
          }
        }
      }
    }
  }
  function hqr2(nn, e, d, V, H) {
    let n = nn - 1;
    let low = 0;
    let high = nn - 1;
    let eps = Number.EPSILON;
    let exshift = 0;
    let norm = 0;
    let p = 0;
    let q = 0;
    let r = 0;
    let s = 0;
    let z2 = 0;
    let iter = 0;
    let i, j, k, l, m2, t, w, x2, y2;
    let ra, sa, vr, vi;
    let notlast, cdivres;
    for (i = 0; i < nn; i++) {
      if (i < low || i > high) {
        d[i] = H.get(i, i);
        e[i] = 0;
      }
      for (j = Math.max(i - 1, 0); j < nn; j++) {
        norm = norm + Math.abs(H.get(i, j));
      }
    }
    while (n >= low) {
      l = n;
      while (l > low) {
        s = Math.abs(H.get(l - 1, l - 1)) + Math.abs(H.get(l, l));
        if (s === 0) {
          s = norm;
        }
        if (Math.abs(H.get(l, l - 1)) < eps * s) {
          break;
        }
        l--;
      }
      if (l === n) {
        H.set(n, n, H.get(n, n) + exshift);
        d[n] = H.get(n, n);
        e[n] = 0;
        n--;
        iter = 0;
      } else if (l === n - 1) {
        w = H.get(n, n - 1) * H.get(n - 1, n);
        p = (H.get(n - 1, n - 1) - H.get(n, n)) / 2;
        q = p * p + w;
        z2 = Math.sqrt(Math.abs(q));
        H.set(n, n, H.get(n, n) + exshift);
        H.set(n - 1, n - 1, H.get(n - 1, n - 1) + exshift);
        x2 = H.get(n, n);
        if (q >= 0) {
          z2 = p >= 0 ? p + z2 : p - z2;
          d[n - 1] = x2 + z2;
          d[n] = d[n - 1];
          if (z2 !== 0) {
            d[n] = x2 - w / z2;
          }
          e[n - 1] = 0;
          e[n] = 0;
          x2 = H.get(n, n - 1);
          s = Math.abs(x2) + Math.abs(z2);
          p = x2 / s;
          q = z2 / s;
          r = Math.sqrt(p * p + q * q);
          p = p / r;
          q = q / r;
          for (j = n - 1; j < nn; j++) {
            z2 = H.get(n - 1, j);
            H.set(n - 1, j, q * z2 + p * H.get(n, j));
            H.set(n, j, q * H.get(n, j) - p * z2);
          }
          for (i = 0; i <= n; i++) {
            z2 = H.get(i, n - 1);
            H.set(i, n - 1, q * z2 + p * H.get(i, n));
            H.set(i, n, q * H.get(i, n) - p * z2);
          }
          for (i = low; i <= high; i++) {
            z2 = V.get(i, n - 1);
            V.set(i, n - 1, q * z2 + p * V.get(i, n));
            V.set(i, n, q * V.get(i, n) - p * z2);
          }
        } else {
          d[n - 1] = x2 + p;
          d[n] = x2 + p;
          e[n - 1] = z2;
          e[n] = -z2;
        }
        n = n - 2;
        iter = 0;
      } else {
        x2 = H.get(n, n);
        y2 = 0;
        w = 0;
        if (l < n) {
          y2 = H.get(n - 1, n - 1);
          w = H.get(n, n - 1) * H.get(n - 1, n);
        }
        if (iter === 10) {
          exshift += x2;
          for (i = low; i <= n; i++) {
            H.set(i, i, H.get(i, i) - x2);
          }
          s = Math.abs(H.get(n, n - 1)) + Math.abs(H.get(n - 1, n - 2));
          x2 = y2 = 0.75 * s;
          w = -0.4375 * s * s;
        }
        if (iter === 30) {
          s = (y2 - x2) / 2;
          s = s * s + w;
          if (s > 0) {
            s = Math.sqrt(s);
            if (y2 < x2) {
              s = -s;
            }
            s = x2 - w / ((y2 - x2) / 2 + s);
            for (i = low; i <= n; i++) {
              H.set(i, i, H.get(i, i) - s);
            }
            exshift += s;
            x2 = y2 = w = 0.964;
          }
        }
        iter = iter + 1;
        m2 = n - 2;
        while (m2 >= l) {
          z2 = H.get(m2, m2);
          r = x2 - z2;
          s = y2 - z2;
          p = (r * s - w) / H.get(m2 + 1, m2) + H.get(m2, m2 + 1);
          q = H.get(m2 + 1, m2 + 1) - z2 - r - s;
          r = H.get(m2 + 2, m2 + 1);
          s = Math.abs(p) + Math.abs(q) + Math.abs(r);
          p = p / s;
          q = q / s;
          r = r / s;
          if (m2 === l) {
            break;
          }
          if (Math.abs(H.get(m2, m2 - 1)) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H.get(m2 - 1, m2 - 1)) + Math.abs(z2) + Math.abs(H.get(m2 + 1, m2 + 1))))) {
            break;
          }
          m2--;
        }
        for (i = m2 + 2; i <= n; i++) {
          H.set(i, i - 2, 0);
          if (i > m2 + 2) {
            H.set(i, i - 3, 0);
          }
        }
        for (k = m2; k <= n - 1; k++) {
          notlast = k !== n - 1;
          if (k !== m2) {
            p = H.get(k, k - 1);
            q = H.get(k + 1, k - 1);
            r = notlast ? H.get(k + 2, k - 1) : 0;
            x2 = Math.abs(p) + Math.abs(q) + Math.abs(r);
            if (x2 !== 0) {
              p = p / x2;
              q = q / x2;
              r = r / x2;
            }
          }
          if (x2 === 0) {
            break;
          }
          s = Math.sqrt(p * p + q * q + r * r);
          if (p < 0) {
            s = -s;
          }
          if (s !== 0) {
            if (k !== m2) {
              H.set(k, k - 1, -s * x2);
            } else if (l !== m2) {
              H.set(k, k - 1, -H.get(k, k - 1));
            }
            p = p + s;
            x2 = p / s;
            y2 = q / s;
            z2 = r / s;
            q = q / p;
            r = r / p;
            for (j = k; j < nn; j++) {
              p = H.get(k, j) + q * H.get(k + 1, j);
              if (notlast) {
                p = p + r * H.get(k + 2, j);
                H.set(k + 2, j, H.get(k + 2, j) - p * z2);
              }
              H.set(k, j, H.get(k, j) - p * x2);
              H.set(k + 1, j, H.get(k + 1, j) - p * y2);
            }
            for (i = 0; i <= Math.min(n, k + 3); i++) {
              p = x2 * H.get(i, k) + y2 * H.get(i, k + 1);
              if (notlast) {
                p = p + z2 * H.get(i, k + 2);
                H.set(i, k + 2, H.get(i, k + 2) - p * r);
              }
              H.set(i, k, H.get(i, k) - p);
              H.set(i, k + 1, H.get(i, k + 1) - p * q);
            }
            for (i = low; i <= high; i++) {
              p = x2 * V.get(i, k) + y2 * V.get(i, k + 1);
              if (notlast) {
                p = p + z2 * V.get(i, k + 2);
                V.set(i, k + 2, V.get(i, k + 2) - p * r);
              }
              V.set(i, k, V.get(i, k) - p);
              V.set(i, k + 1, V.get(i, k + 1) - p * q);
            }
          }
        }
      }
    }
    if (norm === 0) {
      return;
    }
    for (n = nn - 1; n >= 0; n--) {
      p = d[n];
      q = e[n];
      if (q === 0) {
        l = n;
        H.set(n, n, 1);
        for (i = n - 1; i >= 0; i--) {
          w = H.get(i, i) - p;
          r = 0;
          for (j = l; j <= n; j++) {
            r = r + H.get(i, j) * H.get(j, n);
          }
          if (e[i] < 0) {
            z2 = w;
            s = r;
          } else {
            l = i;
            if (e[i] === 0) {
              H.set(i, n, w !== 0 ? -r / w : -r / (eps * norm));
            } else {
              x2 = H.get(i, i + 1);
              y2 = H.get(i + 1, i);
              q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
              t = (x2 * s - z2 * r) / q;
              H.set(i, n, t);
              H.set(
                i + 1,
                n,
                Math.abs(x2) > Math.abs(z2) ? (-r - w * t) / x2 : (-s - y2 * t) / z2
              );
            }
            t = Math.abs(H.get(i, n));
            if (eps * t * t > 1) {
              for (j = i; j <= n; j++) {
                H.set(j, n, H.get(j, n) / t);
              }
            }
          }
        }
      } else if (q < 0) {
        l = n - 1;
        if (Math.abs(H.get(n, n - 1)) > Math.abs(H.get(n - 1, n))) {
          H.set(n - 1, n - 1, q / H.get(n, n - 1));
          H.set(n - 1, n, -(H.get(n, n) - p) / H.get(n, n - 1));
        } else {
          cdivres = cdiv(0, -H.get(n - 1, n), H.get(n - 1, n - 1) - p, q);
          H.set(n - 1, n - 1, cdivres[0]);
          H.set(n - 1, n, cdivres[1]);
        }
        H.set(n, n - 1, 0);
        H.set(n, n, 1);
        for (i = n - 2; i >= 0; i--) {
          ra = 0;
          sa = 0;
          for (j = l; j <= n; j++) {
            ra = ra + H.get(i, j) * H.get(j, n - 1);
            sa = sa + H.get(i, j) * H.get(j, n);
          }
          w = H.get(i, i) - p;
          if (e[i] < 0) {
            z2 = w;
            r = ra;
            s = sa;
          } else {
            l = i;
            if (e[i] === 0) {
              cdivres = cdiv(-ra, -sa, w, q);
              H.set(i, n - 1, cdivres[0]);
              H.set(i, n, cdivres[1]);
            } else {
              x2 = H.get(i, i + 1);
              y2 = H.get(i + 1, i);
              vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
              vi = (d[i] - p) * 2 * q;
              if (vr === 0 && vi === 0) {
                vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x2) + Math.abs(y2) + Math.abs(z2));
              }
              cdivres = cdiv(
                x2 * r - z2 * ra + q * sa,
                x2 * s - z2 * sa - q * ra,
                vr,
                vi
              );
              H.set(i, n - 1, cdivres[0]);
              H.set(i, n, cdivres[1]);
              if (Math.abs(x2) > Math.abs(z2) + Math.abs(q)) {
                H.set(
                  i + 1,
                  n - 1,
                  (-ra - w * H.get(i, n - 1) + q * H.get(i, n)) / x2
                );
                H.set(
                  i + 1,
                  n,
                  (-sa - w * H.get(i, n) - q * H.get(i, n - 1)) / x2
                );
              } else {
                cdivres = cdiv(
                  -r - y2 * H.get(i, n - 1),
                  -s - y2 * H.get(i, n),
                  z2,
                  q
                );
                H.set(i + 1, n - 1, cdivres[0]);
                H.set(i + 1, n, cdivres[1]);
              }
            }
            t = Math.max(Math.abs(H.get(i, n - 1)), Math.abs(H.get(i, n)));
            if (eps * t * t > 1) {
              for (j = i; j <= n; j++) {
                H.set(j, n - 1, H.get(j, n - 1) / t);
                H.set(j, n, H.get(j, n) / t);
              }
            }
          }
        }
      }
    }
    for (i = 0; i < nn; i++) {
      if (i < low || i > high) {
        for (j = i; j < nn; j++) {
          V.set(i, j, H.get(i, j));
        }
      }
    }
    for (j = nn - 1; j >= low; j--) {
      for (i = low; i <= high; i++) {
        z2 = 0;
        for (k = low; k <= Math.min(j, high); k++) {
          z2 = z2 + V.get(i, k) * H.get(k, j);
        }
        V.set(i, j, z2);
      }
    }
  }
  function cdiv(xr, xi, yr, yi) {
    let r, d;
    if (Math.abs(yr) > Math.abs(yi)) {
      r = yi / yr;
      d = yr + r * yi;
      return [(xr + r * xi) / d, (xi - r * xr) / d];
    } else {
      r = yr / yi;
      d = yi + r * yr;
      return [(r * xr + xi) / d, (r * xi - xr) / d];
    }
  }
  class CholeskyDecomposition {
    constructor(value) {
      value = WrapperMatrix2D.checkMatrix(value);
      if (!value.isSymmetric()) {
        throw new Error("Matrix is not symmetric");
      }
      let a2 = value;
      let dimension = a2.rows;
      let l = new Matrix$1(dimension, dimension);
      let positiveDefinite = true;
      let i, j, k;
      for (j = 0; j < dimension; j++) {
        let d = 0;
        for (k = 0; k < j; k++) {
          let s = 0;
          for (i = 0; i < k; i++) {
            s += l.get(k, i) * l.get(j, i);
          }
          s = (a2.get(j, k) - s) / l.get(k, k);
          l.set(j, k, s);
          d = d + s * s;
        }
        d = a2.get(j, j) - d;
        positiveDefinite && (positiveDefinite = d > 0);
        l.set(j, j, Math.sqrt(Math.max(d, 0)));
        for (k = j + 1; k < dimension; k++) {
          l.set(j, k, 0);
        }
      }
      this.L = l;
      this.positiveDefinite = positiveDefinite;
    }
    isPositiveDefinite() {
      return this.positiveDefinite;
    }
    solve(value) {
      value = WrapperMatrix2D.checkMatrix(value);
      let l = this.L;
      let dimension = l.rows;
      if (value.rows !== dimension) {
        throw new Error("Matrix dimensions do not match");
      }
      if (this.isPositiveDefinite() === false) {
        throw new Error("Matrix is not positive definite");
      }
      let count = value.columns;
      let B = value.clone();
      let i, j, k;
      for (k = 0; k < dimension; k++) {
        for (j = 0; j < count; j++) {
          for (i = 0; i < k; i++) {
            B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(k, i));
          }
          B.set(k, j, B.get(k, j) / l.get(k, k));
        }
      }
      for (k = dimension - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          for (i = k + 1; i < dimension; i++) {
            B.set(k, j, B.get(k, j) - B.get(i, j) * l.get(i, k));
          }
          B.set(k, j, B.get(k, j) / l.get(k, k));
        }
      }
      return B;
    }
    get lowerTriangularMatrix() {
      return this.L;
    }
  }
  class nipals {
    constructor(X, options = {}) {
      X = WrapperMatrix2D.checkMatrix(X);
      let { Y } = options;
      const {
        scaleScores = false,
        maxIterations = 1e3,
        terminationCriteria = 1e-10
      } = options;
      let u;
      if (Y) {
        if (isAnyArray.isAnyArray(Y) && typeof Y[0] === "number") {
          Y = Matrix$1.columnVector(Y);
        } else {
          Y = WrapperMatrix2D.checkMatrix(Y);
        }
        if (Y.rows !== X.rows) {
          throw new Error("Y should have the same number of rows as X");
        }
        u = Y.getColumnVector(0);
      } else {
        u = X.getColumnVector(0);
      }
      let diff = 1;
      let t, q, w, tOld;
      for (let counter = 0; counter < maxIterations && diff > terminationCriteria; counter++) {
        w = X.transpose().mmul(u).div(u.transpose().mmul(u).get(0, 0));
        w = w.div(w.norm());
        t = X.mmul(w).div(w.transpose().mmul(w).get(0, 0));
        if (counter > 0) {
          diff = t.clone().sub(tOld).pow(2).sum();
        }
        tOld = t.clone();
        if (Y) {
          q = Y.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
          q = q.div(q.norm());
          u = Y.mmul(q).div(q.transpose().mmul(q).get(0, 0));
        } else {
          u = t;
        }
      }
      if (Y) {
        let p = X.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
        p = p.div(p.norm());
        let xResidual = X.clone().sub(t.clone().mmul(p.transpose()));
        let residual = u.transpose().mmul(t).div(t.transpose().mmul(t).get(0, 0));
        let yResidual = Y.clone().sub(
          t.clone().mulS(residual.get(0, 0)).mmul(q.transpose())
        );
        this.t = t;
        this.p = p.transpose();
        this.w = w.transpose();
        this.q = q;
        this.u = u;
        this.s = t.transpose().mmul(t);
        this.xResidual = xResidual;
        this.yResidual = yResidual;
        this.betas = residual;
      } else {
        this.w = w.transpose();
        this.s = t.transpose().mmul(t).sqrt();
        if (scaleScores) {
          this.t = t.clone().div(this.s.get(0, 0));
        } else {
          this.t = t;
        }
        this.xResidual = X.sub(t.mmul(w.transpose()));
      }
    }
  }
  matrix.AbstractMatrix = AbstractMatrix;
  matrix.CHO = CholeskyDecomposition;
  matrix.CholeskyDecomposition = CholeskyDecomposition;
  matrix.DistanceMatrix = DistanceMatrix;
  matrix.EVD = EigenvalueDecomposition;
  matrix.EigenvalueDecomposition = EigenvalueDecomposition;
  matrix.LU = LuDecomposition;
  matrix.LuDecomposition = LuDecomposition;
  var Matrix_1 = matrix.Matrix = Matrix$1;
  matrix.MatrixColumnSelectionView = MatrixColumnSelectionView;
  matrix.MatrixColumnView = MatrixColumnView;
  matrix.MatrixFlipColumnView = MatrixFlipColumnView;
  matrix.MatrixFlipRowView = MatrixFlipRowView;
  matrix.MatrixRowSelectionView = MatrixRowSelectionView;
  matrix.MatrixRowView = MatrixRowView;
  matrix.MatrixSelectionView = MatrixSelectionView;
  matrix.MatrixSubView = MatrixSubView;
  matrix.MatrixTransposeView = MatrixTransposeView;
  matrix.NIPALS = nipals;
  matrix.Nipals = nipals;
  matrix.QR = QrDecomposition;
  matrix.QrDecomposition = QrDecomposition;
  matrix.SVD = SingularValueDecomposition$1;
  var SingularValueDecomposition_1 = matrix.SingularValueDecomposition = SingularValueDecomposition$1;
  matrix.SymmetricMatrix = SymmetricMatrix;
  matrix.WrapperMatrix1D = WrapperMatrix1D;
  matrix.WrapperMatrix2D = WrapperMatrix2D;
  matrix.correlation = correlation;
  matrix.covariance = covariance;
  var _default = matrix.default = Matrix$1;
  matrix.determinant = determinant;
  matrix.inverse = inverse;
  matrix.linearDependencies = linearDependencies;
  matrix.pseudoInverse = pseudoInverse;
  matrix.solve = solve;
  matrix.wrap = wrap;
  const Matrix = Matrix_1;
  const SingularValueDecomposition = SingularValueDecomposition_1;
  _default.Matrix ? _default.Matrix : Matrix_1;
  const DEFAULTS_LAYOUT_OPTIONS$7 = {
    center: [0, 0],
    linkDistance: 50
  };
  class MDSLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "mds";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$7), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericMDSLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericMDSLayout(true, graph2, options);
      });
    }
    genericMDSLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const { center = [0, 0], linkDistance = 50 } = mergedOptions;
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length) || nodes.length === 1) {
          return handleSingleNodeGraph(graph2, assign, center);
        }
        const adjMatrix = getAdjMatrix({ nodes, edges });
        const distances = floydWarshall(adjMatrix);
        handleInfinity$1(distances);
        const scaledD = scaleMatrix(distances, linkDistance);
        const positions = runMDS(scaledD);
        const layoutNodes = [];
        positions.forEach((p, i) => {
          const cnode = cloneFormatData(nodes[i]);
          cnode.data.x = p[0] + center[0];
          cnode.data.y = p[1] + center[1];
          layoutNodes.push(cnode);
        });
        if (assign) {
          layoutNodes.forEach((node) => graph2.mergeNodeData(node.id, {
            x: node.data.x,
            y: node.data.y
          }));
        }
        const result = {
          nodes: layoutNodes,
          edges
        };
        return result;
      });
    }
  }
  const handleInfinity$1 = (distances) => {
    let maxDistance = -999999;
    distances.forEach((row) => {
      row.forEach((value) => {
        if (value === Infinity) {
          return;
        }
        if (maxDistance < value) {
          maxDistance = value;
        }
      });
    });
    distances.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value === Infinity) {
          distances[i][j] = maxDistance;
        }
      });
    });
  };
  const runMDS = (distances) => {
    const dimension = 2;
    const M = Matrix.mul(Matrix.pow(distances, 2), -0.5);
    const rowMeans = M.mean("row");
    const colMeans = M.mean("column");
    const totalMean = M.mean();
    M.add(totalMean).subRowVector(rowMeans).subColumnVector(colMeans);
    const ret = new SingularValueDecomposition(M);
    const eigenValues = Matrix.sqrt(ret.diagonalMatrix).diagonal();
    return ret.leftSingularVectors.toJSON().map((row) => {
      return Matrix.mul([row], [eigenValues]).toJSON()[0].splice(0, dimension);
    });
  };
  function isLayoutWithIterations(layout2) {
    return !!layout2.tick && !!layout2.stop;
  }
  const FORCE_LAYOUT_TYPE_MAP = {
    gForce: true,
    force2: true,
    d3force: true,
    fruchterman: true,
    forceAtlas2: true,
    force: true,
    "graphin-force": true
  };
  const DEFAULTS_LAYOUT_OPTIONS$6 = {
    center: [0, 0],
    comboPadding: 10,
    treeKey: "combo"
  };
  class ComboCombinedLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "comboCombined";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$6), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericComboCombinedLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericComboCombinedLayout(true, graph2, options);
      });
    }
    genericComboCombinedLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = this.initVals(Object.assign(Object.assign({}, this.options), options));
        const { center, treeKey, outerLayout: propsOuterLayout } = mergedOptions;
        const nodes = graph2.getAllNodes().filter((node) => !node.data._isCombo);
        const combos = graph2.getAllNodes().filter((node) => node.data._isCombo);
        const edges = graph2.getAllEdges();
        const n = nodes === null || nodes === void 0 ? void 0 : nodes.length;
        if (!n || n === 1) {
          return handleSingleNodeGraph(graph2, assign, center);
        }
        const layoutNodes = [];
        const nodeMap = /* @__PURE__ */ new Map();
        nodes.forEach((node) => {
          nodeMap.set(node.id, node);
        });
        const comboMap = /* @__PURE__ */ new Map();
        combos.forEach((combo) => {
          comboMap.set(combo.id, combo);
        });
        const comboNodes = /* @__PURE__ */ new Map();
        const innerGraphLayoutPromises = this.getInnerGraphs(graph2, treeKey, nodeMap, comboMap, edges, mergedOptions, comboNodes);
        yield Promise.all(innerGraphLayoutPromises);
        const outerNodeIds = /* @__PURE__ */ new Map();
        const outerLayoutNodes = [];
        const nodeAncestorIdMap = /* @__PURE__ */ new Map();
        let allHaveNoPosition = true;
        graph2.getRoots(treeKey).forEach((root) => {
          const combo = comboNodes.get(root.id);
          const cacheCombo = comboMap.get(root.id) || nodeMap.get(root.id);
          const comboLayoutNode = {
            id: root.id,
            data: Object.assign(Object.assign({}, root.data), { x: combo.data.x || cacheCombo.data.x, y: combo.data.y || cacheCombo.data.y, fx: combo.data.fx || cacheCombo.data.fx, fy: combo.data.fy || cacheCombo.data.fy, mass: combo.data.mass || cacheCombo.data.mass, size: combo.data.size })
          };
          outerLayoutNodes.push(comboLayoutNode);
          outerNodeIds.set(root.id, true);
          if (!isNaN(comboLayoutNode.data.x) && comboLayoutNode.data.x !== 0 && !isNaN(comboLayoutNode.data.y) && comboLayoutNode.data.y !== 0) {
            allHaveNoPosition = false;
          } else {
            comboLayoutNode.data.x = Math.random() * 100;
            comboLayoutNode.data.y = Math.random() * 100;
          }
          graphTreeDfs(graph2, [root], (child) => {
            if (child.id !== root.id)
              nodeAncestorIdMap.set(child.id, root.id);
          }, "TB", treeKey);
        });
        const outerLayoutEdges = [];
        edges.forEach((edge) => {
          const sourceAncestorId = nodeAncestorIdMap.get(edge.source) || edge.source;
          const targetAncestorId = nodeAncestorIdMap.get(edge.target) || edge.target;
          if (sourceAncestorId !== targetAncestorId && outerNodeIds.has(sourceAncestorId) && outerNodeIds.has(targetAncestorId)) {
            outerLayoutEdges.push({
              id: edge.id,
              source: sourceAncestorId,
              target: targetAncestorId,
              data: {}
            });
          }
        });
        let outerPositions;
        if (outerLayoutNodes === null || outerLayoutNodes === void 0 ? void 0 : outerLayoutNodes.length) {
          if (outerLayoutNodes.length === 1) {
            outerLayoutNodes[0].data.x = center[0];
            outerLayoutNodes[0].data.y = center[1];
          } else {
            const outerLayoutGraph = new Graph$8({
              nodes: outerLayoutNodes,
              edges: outerLayoutEdges
            });
            const outerLayout = propsOuterLayout || new ForceLayout();
            if (allHaveNoPosition && FORCE_LAYOUT_TYPE_MAP[outerLayout.id]) {
              const outerLayoutPreset = outerLayoutNodes.length < 100 ? new MDSLayout() : new ConcentricLayout();
              yield outerLayoutPreset.assign(outerLayoutGraph);
            }
            const options2 = Object.assign({ center, kg: 5, preventOverlap: true, animate: false }, outerLayout.id === "force" ? {
              gravity: 1,
              factor: 4,
              linkDistance: (edge, source, target) => {
                const sourceSize = Math.max(...source.data.size) || 32;
                const targetSize = Math.max(...target.data.size) || 32;
                return sourceSize / 2 + targetSize / 2 + 200;
              }
            } : {});
            outerPositions = yield executeLayout(outerLayout, outerLayoutGraph, options2);
          }
          comboNodes.forEach((comboNode) => {
            var _a2;
            const outerPosition = outerPositions.nodes.find((pos) => pos.id === comboNode.id);
            if (outerPosition) {
              const { x: x3, y: y3 } = outerPosition.data;
              comboNode.data.visited = true;
              comboNode.data.x = x3;
              comboNode.data.y = y3;
              layoutNodes.push({
                id: comboNode.id,
                data: { x: x3, y: y3 }
              });
            }
            const { x: x2, y: y2 } = comboNode.data;
            (_a2 = comboNode.data.nodes) === null || _a2 === void 0 ? void 0 : _a2.forEach((node) => {
              layoutNodes.push({
                id: node.id,
                data: { x: node.data.x + x2, y: node.data.y + y2 }
              });
            });
          });
          comboNodes.forEach(({ data }) => {
            const { x: x2, y: y2, visited, nodes: nodes2 } = data;
            nodes2 === null || nodes2 === void 0 ? void 0 : nodes2.forEach((node) => {
              if (!visited) {
                const layoutNode = layoutNodes.find((n2) => n2.id === node.id);
                layoutNode.data.x += x2 || 0;
                layoutNode.data.y += y2 || 0;
              }
            });
          });
        }
        if (assign) {
          layoutNodes.forEach((node) => {
            graph2.mergeNodeData(node.id, {
              x: node.data.x,
              y: node.data.y
            });
          });
        }
        const result = {
          nodes: layoutNodes,
          edges
        };
        return result;
      });
    }
    initVals(options) {
      const formattedOptions = Object.assign({}, options);
      const { nodeSize, spacing, comboPadding } = options;
      let nodeSizeFunc;
      let spacingFunc;
      if (isNumber(spacing)) {
        spacingFunc = () => spacing;
      } else if (isFunction(spacing)) {
        spacingFunc = spacing;
      } else {
        spacingFunc = () => 0;
      }
      formattedOptions.spacing = spacingFunc;
      if (!nodeSize) {
        nodeSizeFunc = (d) => {
          const spacing2 = spacingFunc(d);
          if (d.size) {
            if (isArray(d.size)) {
              const res = d.size[0] > d.size[1] ? d.size[0] : d.size[1];
              return (res + spacing2) / 2;
            }
            if (isObject(d.size)) {
              const res = d.size.width > d.size.height ? d.size.width : d.size.height;
              return (res + spacing2) / 2;
            }
            return (d.size + spacing2) / 2;
          }
          return 32 + spacing2 / 2;
        };
      } else if (isFunction(nodeSize)) {
        nodeSizeFunc = (d) => {
          const size = nodeSize(d);
          const spacing2 = spacingFunc(d);
          if (isArray(d.size)) {
            const res = d.size[0] > d.size[1] ? d.size[0] : d.size[1];
            return (res + spacing2) / 2;
          }
          return ((size || 32) + spacing2) / 2;
        };
      } else if (isArray(nodeSize)) {
        const larger = nodeSize[0] > nodeSize[1] ? nodeSize[0] : nodeSize[1];
        const radius = larger / 2;
        nodeSizeFunc = (d) => radius + spacingFunc(d) / 2;
      } else {
        const radius = nodeSize / 2;
        nodeSizeFunc = (d) => radius + spacingFunc(d) / 2;
      }
      formattedOptions.nodeSize = nodeSizeFunc;
      let comboPaddingFunc;
      if (isNumber(comboPadding)) {
        comboPaddingFunc = () => comboPadding;
      } else if (isArray(comboPadding)) {
        comboPaddingFunc = () => Math.max.apply(null, comboPadding);
      } else if (isFunction(comboPadding)) {
        comboPaddingFunc = comboPadding;
      } else {
        comboPaddingFunc = () => 0;
      }
      formattedOptions.comboPadding = comboPaddingFunc;
      return formattedOptions;
    }
    getInnerGraphs(graph2, treeKey, nodeMap, comboMap, edges, options, comboNodes) {
      const { nodeSize, comboPadding, spacing, innerLayout } = options;
      const innerGraphLayout = innerLayout || new ConcentricLayout({});
      const innerLayoutOptions = {
        center: [0, 0],
        preventOverlap: true,
        nodeSpacing: spacing
      };
      const innerLayoutPromises = [];
      const getSize = (node) => {
        let padding = (comboPadding === null || comboPadding === void 0 ? void 0 : comboPadding(node)) || 10;
        if (isArray(padding))
          padding = Math.max(...padding);
        return {
          size: padding ? [padding * 2, padding * 2] : [30, 30],
          padding
        };
      };
      graph2.getRoots(treeKey).forEach((root) => {
        comboNodes.set(root.id, {
          id: root.id,
          data: {
            nodes: [],
            size: getSize(root).size
          }
        });
        let start = Promise.resolve();
        graphTreeDfs(graph2, [root], (treeNode) => {
          var _a2;
          if (!treeNode.data._isCombo)
            return;
          const { size: nsize, padding } = getSize(treeNode);
          if (!((_a2 = graph2.getChildren(treeNode.id, treeKey)) === null || _a2 === void 0 ? void 0 : _a2.length)) {
            comboNodes.set(treeNode.id, {
              id: treeNode.id,
              data: Object.assign(Object.assign({}, treeNode.data), { size: nsize })
            });
          } else {
            const comboNode = comboNodes.get(treeNode.id);
            comboNodes.set(treeNode.id, {
              id: treeNode.id,
              data: Object.assign({ nodes: [] }, comboNode === null || comboNode === void 0 ? void 0 : comboNode.data)
            });
            const innerLayoutNodeIds = /* @__PURE__ */ new Map();
            const innerLayoutNodes = graph2.getChildren(treeNode.id, treeKey).map((child) => {
              if (child.data._isCombo) {
                if (!comboNodes.has(child.id)) {
                  comboNodes.set(child.id, {
                    id: child.id,
                    data: Object.assign({}, child.data)
                  });
                }
                innerLayoutNodeIds.set(child.id, true);
                return comboNodes.get(child.id);
              }
              const oriNode = nodeMap.get(child.id) || comboMap.get(child.id);
              innerLayoutNodeIds.set(child.id, true);
              return {
                id: child.id,
                data: Object.assign(Object.assign({}, oriNode.data), child.data)
              };
            });
            const innerGraphData = {
              nodes: innerLayoutNodes,
              edges: edges.filter((edge) => innerLayoutNodeIds.has(edge.source) && innerLayoutNodeIds.has(edge.target))
            };
            let minNodeSize = Infinity;
            innerLayoutNodes.forEach((node) => {
              var _a3;
              let { size } = node.data;
              if (!size) {
                size = ((_a3 = comboNodes.get(node.id)) === null || _a3 === void 0 ? void 0 : _a3.data.size) || (nodeSize === null || nodeSize === void 0 ? void 0 : nodeSize(node)) || [30, 30];
              }
              if (isNumber(size))
                size = [size, size];
              const [size0, size1] = size;
              if (minNodeSize > size0)
                minNodeSize = size0;
              if (minNodeSize > size1)
                minNodeSize = size1;
              node.data.size = size;
            });
            start = start.then(() => __awaiter(this, void 0, void 0, function* () {
              const innerGraphCore = new Graph$8(innerGraphData);
              yield executeLayout(innerGraphLayout, innerGraphCore, innerLayoutOptions, true);
              const { minX, minY, maxX, maxY } = getLayoutBBox(innerLayoutNodes);
              const center = { x: (maxX + minX) / 2, y: (maxY + minY) / 2 };
              innerGraphData.nodes.forEach((node) => {
                node.data.x -= center.x;
                node.data.y -= center.y;
              });
              const size = [
                Math.max(maxX - minX, minNodeSize) + padding * 2,
                Math.max(maxY - minY, minNodeSize) + padding * 2
              ];
              comboNodes.get(treeNode.id).data.size = size;
              comboNodes.get(treeNode.id).data.nodes = innerLayoutNodes;
            }));
          }
          return true;
        }, "BT", treeKey);
        innerLayoutPromises.push(start);
      });
      return innerLayoutPromises;
    }
  }
  function executeLayout(layout2, graph2, options, assign) {
    var _a2;
    return __awaiter(this, void 0, void 0, function* () {
      if (isLayoutWithIterations(layout2)) {
        layout2.execute(graph2, options);
        layout2.stop();
        return layout2.tick((_a2 = options.iterations) !== null && _a2 !== void 0 ? _a2 : 300);
      }
      if (assign)
        return yield layout2.assign(graph2, options);
      return yield layout2.execute(graph2, options);
    });
  }
  function forceCenter$1(x2, y2) {
    var nodes, strength = 1;
    if (x2 == null) x2 = 0;
    if (y2 == null) y2 = 0;
    function force() {
      var i, n = nodes.length, node, sx = 0, sy = 0;
      for (i = 0; i < n; ++i) {
        node = nodes[i], sx += node.x, sy += node.y;
      }
      for (sx = (sx / n - x2) * strength, sy = (sy / n - y2) * strength, i = 0; i < n; ++i) {
        node = nodes[i], node.x -= sx, node.y -= sy;
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
    };
    force.x = function(_2) {
      return arguments.length ? (x2 = +_2, force) : x2;
    };
    force.y = function(_2) {
      return arguments.length ? (y2 = +_2, force) : y2;
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = +_2, force) : strength;
    };
    return force;
  }
  function constant$1(x2) {
    return function() {
      return x2;
    };
  }
  function jiggle$1(random) {
    return (random() - 0.5) * 1e-6;
  }
  function x$3(d) {
    return d.x + d.vx;
  }
  function y$3(d) {
    return d.y + d.vy;
  }
  function forceCollide$1(radius) {
    var nodes, radii, random, strength = 1, iterations = 1;
    if (typeof radius !== "function") radius = constant$1(radius == null ? 1 : +radius);
    function force() {
      var i, n = nodes.length, tree, node, xi, yi, ri, ri2;
      for (var k = 0; k < iterations; ++k) {
        tree = quadtree(nodes, x$3, y$3).visitAfter(prepare);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          ri = radii[node.index], ri2 = ri * ri;
          xi = node.x + node.vx;
          yi = node.y + node.vy;
          tree.visit(apply2);
        }
      }
      function apply2(quad, x0, y0, x1, y1) {
        var data = quad.data, rj = quad.r, r = ri + rj;
        if (data) {
          if (data.index > node.index) {
            var x2 = xi - data.x - data.vx, y2 = yi - data.y - data.vy, l = x2 * x2 + y2 * y2;
            if (l < r * r) {
              if (x2 === 0) x2 = jiggle$1(random), l += x2 * x2;
              if (y2 === 0) y2 = jiggle$1(random), l += y2 * y2;
              l = (r - (l = Math.sqrt(l))) / l * strength;
              node.vx += (x2 *= l) * (r = (rj *= rj) / (ri2 + rj));
              node.vy += (y2 *= l) * r;
              data.vx -= x2 * (r = 1 - r);
              data.vy -= y2 * r;
            }
          }
          return;
        }
        return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
      }
    }
    function prepare(quad) {
      if (quad.data) return quad.r = radii[quad.data.index];
      for (var i = quad.r = 0; i < 4; ++i) {
        if (quad[i] && quad[i].r > quad.r) {
          quad.r = quad[i].r;
        }
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, node;
      radii = new Array(n);
      for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
    }
    force.initialize = function(_nodes, _random) {
      nodes = _nodes;
      random = _random;
      initialize();
    };
    force.iterations = function(_2) {
      return arguments.length ? (iterations = +_2, force) : iterations;
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = +_2, force) : strength;
    };
    force.radius = function(_2) {
      return arguments.length ? (radius = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : radius;
    };
    return force;
  }
  function index$1(d) {
    return d.index;
  }
  function find$1(nodeById, nodeId) {
    var node = nodeById.get(nodeId);
    if (!node) throw new Error("node not found: " + nodeId);
    return node;
  }
  function forceLink$1(links) {
    var id = index$1, strength = defaultStrength, strengths, distance2 = constant$1(30), distances, nodes, count, bias, random, iterations = 1;
    if (links == null) links = [];
    function defaultStrength(link) {
      return 1 / Math.min(count[link.source.index], count[link.target.index]);
    }
    function force(alpha) {
      for (var k = 0, n = links.length; k < iterations; ++k) {
        for (var i = 0, link, source, target, x2, y2, l, b; i < n; ++i) {
          link = links[i], source = link.source, target = link.target;
          x2 = target.x + target.vx - source.x - source.vx || jiggle$1(random);
          y2 = target.y + target.vy - source.y - source.vy || jiggle$1(random);
          l = Math.sqrt(x2 * x2 + y2 * y2);
          l = (l - distances[i]) / l * alpha * strengths[i];
          x2 *= l, y2 *= l;
          target.vx -= x2 * (b = bias[i]);
          target.vy -= y2 * b;
          source.vx += x2 * (b = 1 - b);
          source.vy += y2 * b;
        }
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, m2 = links.length, nodeById = new Map(nodes.map((d, i2) => [id(d, i2, nodes), d])), link;
      for (i = 0, count = new Array(n); i < m2; ++i) {
        link = links[i], link.index = i;
        if (typeof link.source !== "object") link.source = find$1(nodeById, link.source);
        if (typeof link.target !== "object") link.target = find$1(nodeById, link.target);
        count[link.source.index] = (count[link.source.index] || 0) + 1;
        count[link.target.index] = (count[link.target.index] || 0) + 1;
      }
      for (i = 0, bias = new Array(m2); i < m2; ++i) {
        link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
      }
      strengths = new Array(m2), initializeStrength();
      distances = new Array(m2), initializeDistance();
    }
    function initializeStrength() {
      if (!nodes) return;
      for (var i = 0, n = links.length; i < n; ++i) {
        strengths[i] = +strength(links[i], i, links);
      }
    }
    function initializeDistance() {
      if (!nodes) return;
      for (var i = 0, n = links.length; i < n; ++i) {
        distances[i] = +distance2(links[i], i, links);
      }
    }
    force.initialize = function(_nodes, _random) {
      nodes = _nodes;
      random = _random;
      initialize();
    };
    force.links = function(_2) {
      return arguments.length ? (links = _2, initialize(), force) : links;
    };
    force.id = function(_2) {
      return arguments.length ? (id = _2, force) : id;
    };
    force.iterations = function(_2) {
      return arguments.length ? (iterations = +_2, force) : iterations;
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant$1(+_2), initializeStrength(), force) : strength;
    };
    force.distance = function(_2) {
      return arguments.length ? (distance2 = typeof _2 === "function" ? _2 : constant$1(+_2), initializeDistance(), force) : distance2;
    };
    return force;
  }
  var noop = { value: () => {
  } };
  function dispatch() {
    for (var i = 0, n = arguments.length, _2 = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _2 || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _2[t] = [];
    }
    return new Dispatch(_2);
  }
  function Dispatch(_2) {
    this._ = _2;
  }
  function parseTypenames(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return { type: t, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _2 = this._, T = parseTypenames(typename + "", _2), t, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_2[t], typename.name))) return t;
        return;
      }
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _2[t] = set(_2[t], typename.name, callback);
        else if (callback == null) for (t in _2) _2[t] = set(_2[t], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy = {}, _2 = this._;
      for (var t in _2) copy[t] = _2[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };
  function get(type, name) {
    for (var i = 0, n = type.length, c2; i < n; ++i) {
      if ((c2 = type[i]).name === name) {
        return c2.value;
      }
    }
  }
  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({ name, value: callback });
    return type;
  }
  var frame = 0, timeout = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time2) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time2 = (time2 == null ? now() : +time2) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time2;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time2) {
    var t = new Timer();
    t.restart(callback, delay, time2);
    return t;
  }
  function timerFlush() {
    now();
    ++frame;
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
      t = t._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now2 = clock.now(), delay = now2 - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
  }
  function nap() {
    var t0, t1 = taskHead, t2, time2 = Infinity;
    while (t1) {
      if (t1._call) {
        if (time2 > t1._time) time2 = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time2);
  }
  function sleep(time2) {
    if (frame) return;
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time2 - clockNow;
    if (delay > 24) {
      if (time2 < Infinity) timeout = setTimeout(wake, time2 - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }
  const a$1 = 1664525;
  const c$1 = 1013904223;
  const m$1 = 4294967296;
  function lcg$1() {
    let s = 1;
    return () => (s = (a$1 * s + c$1) % m$1) / m$1;
  }
  function x$2(d) {
    return d.x;
  }
  function y$2(d) {
    return d.y;
  }
  var initialRadius$1 = 10, initialAngle = Math.PI * (3 - Math.sqrt(5));
  function forceSimulation$1(nodes) {
    var simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch("tick", "end"), random = lcg$1();
    if (nodes == null) nodes = [];
    function step() {
      tick();
      event.call("tick", simulation);
      if (alpha < alphaMin) {
        stepper.stop();
        event.call("end", simulation);
      }
    }
    function tick(iterations) {
      var i, n = nodes.length, node;
      if (iterations === void 0) iterations = 1;
      for (var k = 0; k < iterations; ++k) {
        alpha += (alphaTarget - alpha) * alphaDecay;
        forces.forEach(function(force) {
          force(alpha);
        });
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          if (node.fx == null) node.x += node.vx *= velocityDecay;
          else node.x = node.fx, node.vx = 0;
          if (node.fy == null) node.y += node.vy *= velocityDecay;
          else node.y = node.fy, node.vy = 0;
        }
      }
      return simulation;
    }
    function initializeNodes() {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.index = i;
        if (node.fx != null) node.x = node.fx;
        if (node.fy != null) node.y = node.fy;
        if (isNaN(node.x) || isNaN(node.y)) {
          var radius = initialRadius$1 * Math.sqrt(0.5 + i), angle = i * initialAngle;
          node.x = radius * Math.cos(angle);
          node.y = radius * Math.sin(angle);
        }
        if (isNaN(node.vx) || isNaN(node.vy)) {
          node.vx = node.vy = 0;
        }
      }
    }
    function initializeForce(force) {
      if (force.initialize) force.initialize(nodes, random);
      return force;
    }
    initializeNodes();
    return simulation = {
      tick,
      restart: function() {
        return stepper.restart(step), simulation;
      },
      stop: function() {
        return stepper.stop(), simulation;
      },
      nodes: function(_2) {
        return arguments.length ? (nodes = _2, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
      },
      alpha: function(_2) {
        return arguments.length ? (alpha = +_2, simulation) : alpha;
      },
      alphaMin: function(_2) {
        return arguments.length ? (alphaMin = +_2, simulation) : alphaMin;
      },
      alphaDecay: function(_2) {
        return arguments.length ? (alphaDecay = +_2, simulation) : +alphaDecay;
      },
      alphaTarget: function(_2) {
        return arguments.length ? (alphaTarget = +_2, simulation) : alphaTarget;
      },
      velocityDecay: function(_2) {
        return arguments.length ? (velocityDecay = 1 - _2, simulation) : 1 - velocityDecay;
      },
      randomSource: function(_2) {
        return arguments.length ? (random = _2, forces.forEach(initializeForce), simulation) : random;
      },
      force: function(name, _2) {
        return arguments.length > 1 ? (_2 == null ? forces.delete(name) : forces.set(name, initializeForce(_2)), simulation) : forces.get(name);
      },
      find: function(x2, y2, radius) {
        var i = 0, n = nodes.length, dx, dy, d2, node, closest;
        if (radius == null) radius = Infinity;
        else radius *= radius;
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dx = x2 - node.x;
          dy = y2 - node.y;
          d2 = dx * dx + dy * dy;
          if (d2 < radius) closest = node, radius = d2;
        }
        return closest;
      },
      on: function(name, _2) {
        return arguments.length > 1 ? (event.on(name, _2), simulation) : event.on(name);
      }
    };
  }
  function forceManyBody$1() {
    var nodes, node, random, alpha, strength = constant$1(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta22 = 0.81;
    function force(_2) {
      var i, n = nodes.length, tree = quadtree(nodes, x$2, y$2).visitAfter(accumulate2);
      for (alpha = _2, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply2);
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, node2;
      strengths = new Array(n);
      for (i = 0; i < n; ++i) node2 = nodes[i], strengths[node2.index] = +strength(node2, i, nodes);
    }
    function accumulate2(quad) {
      var strength2 = 0, q, c2, weight = 0, x2, y2, i;
      if (quad.length) {
        for (x2 = y2 = i = 0; i < 4; ++i) {
          if ((q = quad[i]) && (c2 = Math.abs(q.value))) {
            strength2 += q.value, weight += c2, x2 += c2 * q.x, y2 += c2 * q.y;
          }
        }
        quad.x = x2 / weight;
        quad.y = y2 / weight;
      } else {
        q = quad;
        q.x = q.data.x;
        q.y = q.data.y;
        do
          strength2 += strengths[q.data.index];
        while (q = q.next);
      }
      quad.value = strength2;
    }
    function apply2(quad, x1, _2, x2) {
      if (!quad.value) return true;
      var x3 = quad.x - node.x, y2 = quad.y - node.y, w = x2 - x1, l = x3 * x3 + y2 * y2;
      if (w * w / theta22 < l) {
        if (l < distanceMax2) {
          if (x3 === 0) x3 = jiggle$1(random), l += x3 * x3;
          if (y2 === 0) y2 = jiggle$1(random), l += y2 * y2;
          if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
          node.vx += x3 * quad.value * alpha / l;
          node.vy += y2 * quad.value * alpha / l;
        }
        return true;
      } else if (quad.length || l >= distanceMax2) return;
      if (quad.data !== node || quad.next) {
        if (x3 === 0) x3 = jiggle$1(random), l += x3 * x3;
        if (y2 === 0) y2 = jiggle$1(random), l += y2 * y2;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
      }
      do
        if (quad.data !== node) {
          w = strengths[quad.data.index] * alpha / l;
          node.vx += x3 * w;
          node.vy += y2 * w;
        }
      while (quad = quad.next);
    }
    force.initialize = function(_nodes, _random) {
      nodes = _nodes;
      random = _random;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : strength;
    };
    force.distanceMin = function(_2) {
      return arguments.length ? (distanceMin2 = _2 * _2, force) : Math.sqrt(distanceMin2);
    };
    force.distanceMax = function(_2) {
      return arguments.length ? (distanceMax2 = _2 * _2, force) : Math.sqrt(distanceMax2);
    };
    force.theta = function(_2) {
      return arguments.length ? (theta22 = _2 * _2, force) : Math.sqrt(theta22);
    };
    return force;
  }
  function forceRadial$1(radius, x2, y2) {
    var nodes, strength = constant$1(0.1), strengths, radiuses;
    if (typeof radius !== "function") radius = constant$1(+radius);
    if (x2 == null) x2 = 0;
    if (y2 == null) y2 = 0;
    function force(alpha) {
      for (var i = 0, n = nodes.length; i < n; ++i) {
        var node = nodes[i], dx = node.x - x2 || 1e-6, dy = node.y - y2 || 1e-6, r = Math.sqrt(dx * dx + dy * dy), k = (radiuses[i] - r) * strengths[i] * alpha / r;
        node.vx += dx * k;
        node.vy += dy * k;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      radiuses = new Array(n);
      for (i = 0; i < n; ++i) {
        radiuses[i] = +radius(nodes[i], i, nodes);
        strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_2) {
      nodes = _2, initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : strength;
    };
    force.radius = function(_2) {
      return arguments.length ? (radius = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : radius;
    };
    force.x = function(_2) {
      return arguments.length ? (x2 = +_2, force) : x2;
    };
    force.y = function(_2) {
      return arguments.length ? (y2 = +_2, force) : y2;
    };
    return force;
  }
  function forceX$1(x2) {
    var strength = constant$1(0.1), nodes, strengths, xz;
    if (typeof x2 !== "function") x2 = constant$1(x2 == null ? 0 : +x2);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      xz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(xz[i] = +x2(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : strength;
    };
    force.x = function(_2) {
      return arguments.length ? (x2 = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : x2;
    };
    return force;
  }
  function forceY$1(y2) {
    var strength = constant$1(0.1), nodes, strengths, yz;
    if (typeof y2 !== "function") y2 = constant$1(y2 == null ? 0 : +y2);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      yz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(yz[i] = +y2(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : strength;
    };
    force.y = function(_2) {
      return arguments.length ? (y2 = typeof _2 === "function" ? _2 : constant$1(+_2), initialize(), force) : y2;
    };
    return force;
  }
  class D3ForceLayout {
    constructor(options) {
      this.id = "d3-force";
      this.config = {
        inputNodeAttrs: ["x", "y", "vx", "vy", "fx", "fy"],
        outputNodeAttrs: ["x", "y", "vx", "vy"],
        simulationAttrs: [
          "alpha",
          "alphaMin",
          "alphaDecay",
          "alphaTarget",
          "velocityDecay",
          "randomSource"
        ]
      };
      this.forceMap = {
        link: forceLink$1,
        manyBody: forceManyBody$1,
        center: forceCenter$1,
        collide: forceCollide$1,
        radial: forceRadial$1,
        x: forceX$1,
        y: forceY$1
      };
      this.options = {
        link: {
          id: (edge) => edge.id
        },
        manyBody: {},
        center: {
          x: 0,
          y: 0
        }
      };
      this.context = {
        options: {},
        assign: false,
        nodes: [],
        edges: []
      };
      deepMix(this.options, options);
      if (this.options.forceSimulation) {
        this.simulation = this.options.forceSimulation;
      }
    }
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericLayout(false, graph2, options);
      });
    }
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericLayout(true, graph2, options);
      });
    }
    stop() {
      this.simulation.stop();
    }
    tick(iterations) {
      this.simulation.tick(iterations);
      return this.getResult();
    }
    restart() {
      this.simulation.restart();
    }
    setFixedPosition(id, position2) {
      const node = this.context.nodes.find((n) => n.id === id);
      if (!node)
        return;
      position2.forEach((value, index2) => {
        if (typeof value === "number" || value === null) {
          const key = ["fx", "fy", "fz"][index2];
          node[key] = value;
        }
      });
    }
    getOptions(options) {
      var _a2, _b;
      const _2 = deepMix({}, this.options, options);
      if (_2.collide && ((_a2 = _2.collide) === null || _a2 === void 0 ? void 0 : _a2.radius) === void 0) {
        _2.collide = _2.collide || {};
        _2.collide.radius = (_b = _2.nodeSize) !== null && _b !== void 0 ? _b : 10;
      }
      if (_2.iterations === void 0) {
        if (_2.link && _2.link.iterations === void 0) {
          _2.iterations = _2.link.iterations;
        }
        if (_2.collide && _2.collide.iterations === void 0) {
          _2.iterations = _2.collide.iterations;
        }
      }
      this.context.options = _2;
      return _2;
    }
    genericLayout(assign, graph2, options) {
      var _a2;
      return __awaiter(this, void 0, void 0, function* () {
        const _options = this.getOptions(options);
        const nodes = graph2.getAllNodes().map(({ id, data }) => Object.assign(Object.assign({ id }, data), pick(data.data, this.config.inputNodeAttrs)));
        const edges = graph2.getAllEdges().map((edge) => Object.assign({}, edge));
        Object.assign(this.context, { assign, nodes, edges, graph: graph2 });
        const promise = new Promise((resolver) => {
          this.resolver = resolver;
        });
        const simulation = this.setSimulation(_options);
        simulation.nodes(nodes);
        (_a2 = simulation.force("link")) === null || _a2 === void 0 ? void 0 : _a2.links(edges);
        return promise;
      });
    }
    getResult() {
      const { assign, nodes, edges, graph: graph2 } = this.context;
      const nodesResult = nodes.map((node) => ({
        id: node.id,
        data: Object.assign(Object.assign({}, node.data), pick(node, this.config.outputNodeAttrs))
      }));
      const edgeResult = edges.map(({ id, source, target, data }) => ({
        id,
        source: typeof source === "object" ? source.id : source,
        target: typeof target === "object" ? target.id : target,
        data
      }));
      if (assign) {
        nodesResult.forEach((node) => graph2.mergeNodeData(node.id, node.data));
      }
      return { nodes: nodesResult, edges: edgeResult };
    }
    initSimulation() {
      return forceSimulation$1();
    }
    setSimulation(options) {
      const simulation = this.simulation || this.options.forceSimulation || this.initSimulation();
      if (!this.simulation) {
        this.simulation = simulation.on("tick", () => {
          var _a2;
          return (_a2 = options.onTick) === null || _a2 === void 0 ? void 0 : _a2.call(options, this.getResult());
        }).on("end", () => {
          var _a2;
          return (_a2 = this.resolver) === null || _a2 === void 0 ? void 0 : _a2.call(this, this.getResult());
        });
      }
      apply(simulation, this.config.simulationAttrs.map((name) => [
        name,
        options[name]
      ]));
      Object.entries(this.forceMap).forEach(([name, Ctor]) => {
        const forceName = name;
        if (options[name]) {
          let force = simulation.force(forceName);
          if (!force) {
            force = Ctor();
            simulation.force(forceName, force);
          }
          apply(force, Object.entries(options[forceName]));
        } else
          simulation.force(forceName, null);
      });
      return simulation;
    }
  }
  const apply = (target, params) => {
    return params.reduce((acc, [method, param]) => {
      if (!acc[method] || param === void 0)
        return acc;
      return acc[method].call(target, param);
    }, target);
  };
  function forceCenter(x2, y2, z2) {
    var nodes, strength = 1;
    if (x2 == null) x2 = 0;
    if (y2 == null) y2 = 0;
    if (z2 == null) z2 = 0;
    function force() {
      var i, n = nodes.length, node, sx = 0, sy = 0, sz = 0;
      for (i = 0; i < n; ++i) {
        node = nodes[i], sx += node.x || 0, sy += node.y || 0, sz += node.z || 0;
      }
      for (sx = (sx / n - x2) * strength, sy = (sy / n - y2) * strength, sz = (sz / n - z2) * strength, i = 0; i < n; ++i) {
        node = nodes[i];
        if (sx) {
          node.x -= sx;
        }
        if (sy) {
          node.y -= sy;
        }
        if (sz) {
          node.z -= sz;
        }
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
    };
    force.x = function(_2) {
      return arguments.length ? (x2 = +_2, force) : x2;
    };
    force.y = function(_2) {
      return arguments.length ? (y2 = +_2, force) : y2;
    };
    force.z = function(_2) {
      return arguments.length ? (z2 = +_2, force) : z2;
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = +_2, force) : strength;
    };
    return force;
  }
  function tree_add(d) {
    const x2 = +this._x.call(null, d);
    return add(this.cover(x2), x2, d);
  }
  function add(tree, x2, d) {
    if (isNaN(x2)) return tree;
    var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, x1 = tree._x1, xm, xp, right, i, j;
    if (!node) return tree._root = leaf, tree;
    while (node.length) {
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (parent = node, !(node = node[i = +right])) return parent[i] = leaf, tree;
    }
    xp = +tree._x.call(null, node.data);
    if (x2 === xp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
    do {
      parent = parent ? parent[i] = new Array(2) : tree._root = new Array(2);
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
    } while ((i = +right) === (j = +(xp >= xm)));
    return parent[j] = node, parent[i] = leaf, tree;
  }
  function addAll(data) {
    if (!Array.isArray(data)) data = Array.from(data);
    const n = data.length;
    const xz = new Float64Array(n);
    let x0 = Infinity, x1 = -Infinity;
    for (let i = 0, x2; i < n; ++i) {
      if (isNaN(x2 = +this._x.call(null, data[i]))) continue;
      xz[i] = x2;
      if (x2 < x0) x0 = x2;
      if (x2 > x1) x1 = x2;
    }
    if (x0 > x1) return this;
    this.cover(x0).cover(x1);
    for (let i = 0; i < n; ++i) {
      add(this, xz[i], data[i]);
    }
    return this;
  }
  function tree_cover(x2) {
    if (isNaN(x2 = +x2)) return this;
    var x0 = this._x0, x1 = this._x1;
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x2)) + 1;
    } else {
      var z2 = x1 - x0 || 1, node = this._root, parent, i;
      while (x0 > x2 || x2 >= x1) {
        i = +(x2 < x0);
        parent = new Array(2), parent[i] = node, node = parent, z2 *= 2;
        switch (i) {
          case 0:
            x1 = x0 + z2;
            break;
          case 1:
            x0 = x1 - z2;
            break;
        }
      }
      if (this._root && this._root.length) this._root = node;
    }
    this._x0 = x0;
    this._x1 = x1;
    return this;
  }
  function tree_data() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do
        data.push(node.data);
      while (node = node.next);
    });
    return data;
  }
  function tree_extent(_2) {
    return arguments.length ? this.cover(+_2[0][0]).cover(+_2[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
  }
  function Half(node, x0, x1) {
    this.node = node;
    this.x0 = x0;
    this.x1 = x1;
  }
  function tree_find(x2, radius) {
    var data, x0 = this._x0, x1, x22, x3 = this._x1, halves = [], node = this._root, q, i;
    if (node) halves.push(new Half(node, x0, x3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x2 - radius;
      x3 = x2 + radius;
    }
    while (q = halves.pop()) {
      if (!(node = q.node) || (x1 = q.x0) > x3 || (x22 = q.x1) < x0) continue;
      if (node.length) {
        var xm = (x1 + x22) / 2;
        halves.push(
          new Half(node[1], xm, x22),
          new Half(node[0], x1, xm)
        );
        if (i = +(x2 >= xm)) {
          q = halves[halves.length - 1];
          halves[halves.length - 1] = halves[halves.length - 1 - i];
          halves[halves.length - 1 - i] = q;
        }
      } else {
        var d = Math.abs(x2 - +this._x.call(null, node.data));
        if (d < radius) {
          radius = d;
          x0 = x2 - d;
          x3 = x2 + d;
          data = node.data;
        }
      }
    }
    return data;
  }
  function tree_remove(d) {
    if (isNaN(x2 = +this._x.call(null, d))) return this;
    var parent, node = this._root, retainer, previous, next, x0 = this._x0, x1 = this._x1, x2, xm, right, i, j;
    if (!node) return this;
    if (node.length) while (true) {
      if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
      else x1 = xm;
      if (!(parent = node, node = node[i = +right])) return this;
      if (!node.length) break;
      if (parent[i + 1 & 1]) retainer = parent, j = i;
    }
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;
    if (previous) return next ? previous.next = next : delete previous.next, this;
    if (!parent) return this._root = next, this;
    next ? parent[i] = next : delete parent[i];
    if ((node = parent[0] || parent[1]) && node === (parent[1] || parent[0]) && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }
    return this;
  }
  function removeAll(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }
  function tree_root() {
    return this._root;
  }
  function tree_size() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do
        ++size;
      while (node = node.next);
    });
    return size;
  }
  function tree_visit(callback) {
    var halves = [], q, node = this._root, child, x0, x1;
    if (node) halves.push(new Half(node, this._x0, this._x1));
    while (q = halves.pop()) {
      if (!callback(node = q.node, x0 = q.x0, x1 = q.x1) && node.length) {
        var xm = (x0 + x1) / 2;
        if (child = node[1]) halves.push(new Half(child, xm, x1));
        if (child = node[0]) halves.push(new Half(child, x0, xm));
      }
    }
    return this;
  }
  function tree_visitAfter(callback) {
    var halves = [], next = [], q;
    if (this._root) halves.push(new Half(this._root, this._x0, this._x1));
    while (q = halves.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, x1 = q.x1, xm = (x0 + x1) / 2;
        if (child = node[0]) halves.push(new Half(child, x0, xm));
        if (child = node[1]) halves.push(new Half(child, xm, x1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.x1);
    }
    return this;
  }
  function defaultX(d) {
    return d[0];
  }
  function tree_x(_2) {
    return arguments.length ? (this._x = _2, this) : this._x;
  }
  function binarytree(nodes, x2) {
    var tree = new Binarytree(x2 == null ? defaultX : x2, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }
  function Binarytree(x2, x0, x1) {
    this._x = x2;
    this._x0 = x0;
    this._x1 = x1;
    this._root = void 0;
  }
  function leaf_copy(leaf) {
    var copy = { data: leaf.data }, next = copy;
    while (leaf = leaf.next) next = next.next = { data: leaf.data };
    return copy;
  }
  var treeProto = binarytree.prototype = Binarytree.prototype;
  treeProto.copy = function() {
    var copy = new Binarytree(this._x, this._x0, this._x1), node = this._root, nodes, child;
    if (!node) return copy;
    if (!node.length) return copy._root = leaf_copy(node), copy;
    nodes = [{ source: node, target: copy._root = new Array(2) }];
    while (node = nodes.pop()) {
      for (var i = 0; i < 2; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(2) });
          else node.target[i] = leaf_copy(child);
        }
      }
    }
    return copy;
  };
  treeProto.add = tree_add;
  treeProto.addAll = addAll;
  treeProto.cover = tree_cover;
  treeProto.data = tree_data;
  treeProto.extent = tree_extent;
  treeProto.find = tree_find;
  treeProto.remove = tree_remove;
  treeProto.removeAll = removeAll;
  treeProto.root = tree_root;
  treeProto.size = tree_size;
  treeProto.visit = tree_visit;
  treeProto.visitAfter = tree_visitAfter;
  treeProto.x = tree_x;
  function constant(x2) {
    return function() {
      return x2;
    };
  }
  function jiggle(random) {
    return (random() - 0.5) * 1e-6;
  }
  function x$1(d) {
    return d.x + d.vx;
  }
  function y$1(d) {
    return d.y + d.vy;
  }
  function z$1(d) {
    return d.z + d.vz;
  }
  function forceCollide(radius) {
    var nodes, nDim, radii, random, strength = 1, iterations = 1;
    if (typeof radius !== "function") radius = constant(radius == null ? 1 : +radius);
    function force() {
      var i, n = nodes.length, tree, node, xi, yi, zi, ri, ri2;
      for (var k = 0; k < iterations; ++k) {
        tree = (nDim === 1 ? binarytree(nodes, x$1) : nDim === 2 ? quadtree(nodes, x$1, y$1) : nDim === 3 ? octree(nodes, x$1, y$1, z$1) : null).visitAfter(prepare);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          ri = radii[node.index], ri2 = ri * ri;
          xi = node.x + node.vx;
          if (nDim > 1) {
            yi = node.y + node.vy;
          }
          if (nDim > 2) {
            zi = node.z + node.vz;
          }
          tree.visit(apply2);
        }
      }
      function apply2(treeNode, arg1, arg2, arg3, arg4, arg5, arg6) {
        var args = [arg1, arg2, arg3, arg4, arg5, arg6];
        var x0 = args[0], y0 = args[1], z0 = args[2], x1 = args[nDim], y1 = args[nDim + 1], z1 = args[nDim + 2];
        var data = treeNode.data, rj = treeNode.r, r = ri + rj;
        if (data) {
          if (data.index > node.index) {
            var x2 = xi - data.x - data.vx, y2 = nDim > 1 ? yi - data.y - data.vy : 0, z2 = nDim > 2 ? zi - data.z - data.vz : 0, l = x2 * x2 + y2 * y2 + z2 * z2;
            if (l < r * r) {
              if (x2 === 0) x2 = jiggle(random), l += x2 * x2;
              if (nDim > 1 && y2 === 0) y2 = jiggle(random), l += y2 * y2;
              if (nDim > 2 && z2 === 0) z2 = jiggle(random), l += z2 * z2;
              l = (r - (l = Math.sqrt(l))) / l * strength;
              node.vx += (x2 *= l) * (r = (rj *= rj) / (ri2 + rj));
              if (nDim > 1) {
                node.vy += (y2 *= l) * r;
              }
              if (nDim > 2) {
                node.vz += (z2 *= l) * r;
              }
              data.vx -= x2 * (r = 1 - r);
              if (nDim > 1) {
                data.vy -= y2 * r;
              }
              if (nDim > 2) {
                data.vz -= z2 * r;
              }
            }
          }
          return;
        }
        return x0 > xi + r || x1 < xi - r || nDim > 1 && (y0 > yi + r || y1 < yi - r) || nDim > 2 && (z0 > zi + r || z1 < zi - r);
      }
    }
    function prepare(treeNode) {
      if (treeNode.data) return treeNode.r = radii[treeNode.data.index];
      for (var i = treeNode.r = 0; i < Math.pow(2, nDim); ++i) {
        if (treeNode[i] && treeNode[i].r > treeNode.r) {
          treeNode.r = treeNode[i].r;
        }
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, node;
      radii = new Array(n);
      for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
    }
    force.initialize = function(_nodes, ...args) {
      nodes = _nodes;
      random = args.find((arg) => typeof arg === "function") || Math.random;
      nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
      initialize();
    };
    force.iterations = function(_2) {
      return arguments.length ? (iterations = +_2, force) : iterations;
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = +_2, force) : strength;
    };
    force.radius = function(_2) {
      return arguments.length ? (radius = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : radius;
    };
    return force;
  }
  function index(d) {
    return d.index;
  }
  function find(nodeById, nodeId) {
    var node = nodeById.get(nodeId);
    if (!node) throw new Error("node not found: " + nodeId);
    return node;
  }
  function forceLink(links) {
    var id = index, strength = defaultStrength, strengths, distance2 = constant(30), distances, nodes, nDim, count, bias, random, iterations = 1;
    if (links == null) links = [];
    function defaultStrength(link) {
      return 1 / Math.min(count[link.source.index], count[link.target.index]);
    }
    function force(alpha) {
      for (var k = 0, n = links.length; k < iterations; ++k) {
        for (var i = 0, link, source, target, x2 = 0, y2 = 0, z2 = 0, l, b; i < n; ++i) {
          link = links[i], source = link.source, target = link.target;
          x2 = target.x + target.vx - source.x - source.vx || jiggle(random);
          if (nDim > 1) {
            y2 = target.y + target.vy - source.y - source.vy || jiggle(random);
          }
          if (nDim > 2) {
            z2 = target.z + target.vz - source.z - source.vz || jiggle(random);
          }
          l = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
          l = (l - distances[i]) / l * alpha * strengths[i];
          x2 *= l, y2 *= l, z2 *= l;
          target.vx -= x2 * (b = bias[i]);
          if (nDim > 1) {
            target.vy -= y2 * b;
          }
          if (nDim > 2) {
            target.vz -= z2 * b;
          }
          source.vx += x2 * (b = 1 - b);
          if (nDim > 1) {
            source.vy += y2 * b;
          }
          if (nDim > 2) {
            source.vz += z2 * b;
          }
        }
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, m2 = links.length, nodeById = new Map(nodes.map((d, i2) => [id(d, i2, nodes), d])), link;
      for (i = 0, count = new Array(n); i < m2; ++i) {
        link = links[i], link.index = i;
        if (typeof link.source !== "object") link.source = find(nodeById, link.source);
        if (typeof link.target !== "object") link.target = find(nodeById, link.target);
        count[link.source.index] = (count[link.source.index] || 0) + 1;
        count[link.target.index] = (count[link.target.index] || 0) + 1;
      }
      for (i = 0, bias = new Array(m2); i < m2; ++i) {
        link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
      }
      strengths = new Array(m2), initializeStrength();
      distances = new Array(m2), initializeDistance();
    }
    function initializeStrength() {
      if (!nodes) return;
      for (var i = 0, n = links.length; i < n; ++i) {
        strengths[i] = +strength(links[i], i, links);
      }
    }
    function initializeDistance() {
      if (!nodes) return;
      for (var i = 0, n = links.length; i < n; ++i) {
        distances[i] = +distance2(links[i], i, links);
      }
    }
    force.initialize = function(_nodes, ...args) {
      nodes = _nodes;
      random = args.find((arg) => typeof arg === "function") || Math.random;
      nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
      initialize();
    };
    force.links = function(_2) {
      return arguments.length ? (links = _2, initialize(), force) : links;
    };
    force.id = function(_2) {
      return arguments.length ? (id = _2, force) : id;
    };
    force.iterations = function(_2) {
      return arguments.length ? (iterations = +_2, force) : iterations;
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant(+_2), initializeStrength(), force) : strength;
    };
    force.distance = function(_2) {
      return arguments.length ? (distance2 = typeof _2 === "function" ? _2 : constant(+_2), initializeDistance(), force) : distance2;
    };
    return force;
  }
  const a = 1664525;
  const c = 1013904223;
  const m = 4294967296;
  function lcg() {
    let s = 1;
    return () => (s = (a * s + c) % m) / m;
  }
  var MAX_DIMENSIONS = 3;
  function x(d) {
    return d.x;
  }
  function y(d) {
    return d.y;
  }
  function z(d) {
    return d.z;
  }
  var initialRadius = 10, initialAngleRoll = Math.PI * (3 - Math.sqrt(5)), initialAngleYaw = Math.PI * 20 / (9 + Math.sqrt(221));
  function forceSimulation(nodes, numDimensions) {
    numDimensions = numDimensions || 2;
    var nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(numDimensions))), simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch("tick", "end"), random = lcg();
    if (nodes == null) nodes = [];
    function step() {
      tick();
      event.call("tick", simulation);
      if (alpha < alphaMin) {
        stepper.stop();
        event.call("end", simulation);
      }
    }
    function tick(iterations) {
      var i, n = nodes.length, node;
      if (iterations === void 0) iterations = 1;
      for (var k = 0; k < iterations; ++k) {
        alpha += (alphaTarget - alpha) * alphaDecay;
        forces.forEach(function(force) {
          force(alpha);
        });
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          if (node.fx == null) node.x += node.vx *= velocityDecay;
          else node.x = node.fx, node.vx = 0;
          if (nDim > 1) {
            if (node.fy == null) node.y += node.vy *= velocityDecay;
            else node.y = node.fy, node.vy = 0;
          }
          if (nDim > 2) {
            if (node.fz == null) node.z += node.vz *= velocityDecay;
            else node.z = node.fz, node.vz = 0;
          }
        }
      }
      return simulation;
    }
    function initializeNodes() {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.index = i;
        if (node.fx != null) node.x = node.fx;
        if (node.fy != null) node.y = node.fy;
        if (node.fz != null) node.z = node.fz;
        if (isNaN(node.x) || nDim > 1 && isNaN(node.y) || nDim > 2 && isNaN(node.z)) {
          var radius = initialRadius * (nDim > 2 ? Math.cbrt(0.5 + i) : nDim > 1 ? Math.sqrt(0.5 + i) : i), rollAngle = i * initialAngleRoll, yawAngle = i * initialAngleYaw;
          if (nDim === 1) {
            node.x = radius;
          } else if (nDim === 2) {
            node.x = radius * Math.cos(rollAngle);
            node.y = radius * Math.sin(rollAngle);
          } else {
            node.x = radius * Math.sin(rollAngle) * Math.cos(yawAngle);
            node.y = radius * Math.cos(rollAngle);
            node.z = radius * Math.sin(rollAngle) * Math.sin(yawAngle);
          }
        }
        if (isNaN(node.vx) || nDim > 1 && isNaN(node.vy) || nDim > 2 && isNaN(node.vz)) {
          node.vx = 0;
          if (nDim > 1) {
            node.vy = 0;
          }
          if (nDim > 2) {
            node.vz = 0;
          }
        }
      }
    }
    function initializeForce(force) {
      if (force.initialize) force.initialize(nodes, random, nDim);
      return force;
    }
    initializeNodes();
    return simulation = {
      tick,
      restart: function() {
        return stepper.restart(step), simulation;
      },
      stop: function() {
        return stepper.stop(), simulation;
      },
      numDimensions: function(_2) {
        return arguments.length ? (nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(_2))), forces.forEach(initializeForce), simulation) : nDim;
      },
      nodes: function(_2) {
        return arguments.length ? (nodes = _2, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
      },
      alpha: function(_2) {
        return arguments.length ? (alpha = +_2, simulation) : alpha;
      },
      alphaMin: function(_2) {
        return arguments.length ? (alphaMin = +_2, simulation) : alphaMin;
      },
      alphaDecay: function(_2) {
        return arguments.length ? (alphaDecay = +_2, simulation) : +alphaDecay;
      },
      alphaTarget: function(_2) {
        return arguments.length ? (alphaTarget = +_2, simulation) : alphaTarget;
      },
      velocityDecay: function(_2) {
        return arguments.length ? (velocityDecay = 1 - _2, simulation) : 1 - velocityDecay;
      },
      randomSource: function(_2) {
        return arguments.length ? (random = _2, forces.forEach(initializeForce), simulation) : random;
      },
      force: function(name, _2) {
        return arguments.length > 1 ? (_2 == null ? forces.delete(name) : forces.set(name, initializeForce(_2)), simulation) : forces.get(name);
      },
      find: function() {
        var args = Array.prototype.slice.call(arguments);
        var x2 = args.shift() || 0, y2 = (nDim > 1 ? args.shift() : null) || 0, z2 = (nDim > 2 ? args.shift() : null) || 0, radius = args.shift() || Infinity;
        var i = 0, n = nodes.length, dx, dy, dz, d2, node, closest;
        radius *= radius;
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dx = x2 - node.x;
          dy = y2 - (node.y || 0);
          dz = z2 - (node.z || 0);
          d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < radius) closest = node, radius = d2;
        }
        return closest;
      },
      on: function(name, _2) {
        return arguments.length > 1 ? (event.on(name, _2), simulation) : event.on(name);
      }
    };
  }
  function forceManyBody() {
    var nodes, nDim, node, random, alpha, strength = constant(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta22 = 0.81;
    function force(_2) {
      var i, n = nodes.length, tree = (nDim === 1 ? binarytree(nodes, x) : nDim === 2 ? quadtree(nodes, x, y) : nDim === 3 ? octree(nodes, x, y, z) : null).visitAfter(accumulate2);
      for (alpha = _2, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply2);
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, node2;
      strengths = new Array(n);
      for (i = 0; i < n; ++i) node2 = nodes[i], strengths[node2.index] = +strength(node2, i, nodes);
    }
    function accumulate2(treeNode) {
      var strength2 = 0, q, c2, weight = 0, x2, y2, z2, i;
      var numChildren = treeNode.length;
      if (numChildren) {
        for (x2 = y2 = z2 = i = 0; i < numChildren; ++i) {
          if ((q = treeNode[i]) && (c2 = Math.abs(q.value))) {
            strength2 += q.value, weight += c2, x2 += c2 * (q.x || 0), y2 += c2 * (q.y || 0), z2 += c2 * (q.z || 0);
          }
        }
        strength2 *= Math.sqrt(4 / numChildren);
        treeNode.x = x2 / weight;
        if (nDim > 1) {
          treeNode.y = y2 / weight;
        }
        if (nDim > 2) {
          treeNode.z = z2 / weight;
        }
      } else {
        q = treeNode;
        q.x = q.data.x;
        if (nDim > 1) {
          q.y = q.data.y;
        }
        if (nDim > 2) {
          q.z = q.data.z;
        }
        do
          strength2 += strengths[q.data.index];
        while (q = q.next);
      }
      treeNode.value = strength2;
    }
    function apply2(treeNode, x1, arg1, arg2, arg3) {
      if (!treeNode.value) return true;
      var x2 = [arg1, arg2, arg3][nDim - 1];
      var x3 = treeNode.x - node.x, y2 = nDim > 1 ? treeNode.y - node.y : 0, z2 = nDim > 2 ? treeNode.z - node.z : 0, w = x2 - x1, l = x3 * x3 + y2 * y2 + z2 * z2;
      if (w * w / theta22 < l) {
        if (l < distanceMax2) {
          if (x3 === 0) x3 = jiggle(random), l += x3 * x3;
          if (nDim > 1 && y2 === 0) y2 = jiggle(random), l += y2 * y2;
          if (nDim > 2 && z2 === 0) z2 = jiggle(random), l += z2 * z2;
          if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
          node.vx += x3 * treeNode.value * alpha / l;
          if (nDim > 1) {
            node.vy += y2 * treeNode.value * alpha / l;
          }
          if (nDim > 2) {
            node.vz += z2 * treeNode.value * alpha / l;
          }
        }
        return true;
      } else if (treeNode.length || l >= distanceMax2) return;
      if (treeNode.data !== node || treeNode.next) {
        if (x3 === 0) x3 = jiggle(random), l += x3 * x3;
        if (nDim > 1 && y2 === 0) y2 = jiggle(random), l += y2 * y2;
        if (nDim > 2 && z2 === 0) z2 = jiggle(random), l += z2 * z2;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
      }
      do
        if (treeNode.data !== node) {
          w = strengths[treeNode.data.index] * alpha / l;
          node.vx += x3 * w;
          if (nDim > 1) {
            node.vy += y2 * w;
          }
          if (nDim > 2) {
            node.vz += z2 * w;
          }
        }
      while (treeNode = treeNode.next);
    }
    force.initialize = function(_nodes, ...args) {
      nodes = _nodes;
      random = args.find((arg) => typeof arg === "function") || Math.random;
      nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : strength;
    };
    force.distanceMin = function(_2) {
      return arguments.length ? (distanceMin2 = _2 * _2, force) : Math.sqrt(distanceMin2);
    };
    force.distanceMax = function(_2) {
      return arguments.length ? (distanceMax2 = _2 * _2, force) : Math.sqrt(distanceMax2);
    };
    force.theta = function(_2) {
      return arguments.length ? (theta22 = _2 * _2, force) : Math.sqrt(theta22);
    };
    return force;
  }
  function forceRadial(radius, x2, y2, z2) {
    var nodes, nDim, strength = constant(0.1), strengths, radiuses;
    if (typeof radius !== "function") radius = constant(+radius);
    if (x2 == null) x2 = 0;
    if (y2 == null) y2 = 0;
    if (z2 == null) z2 = 0;
    function force(alpha) {
      for (var i = 0, n = nodes.length; i < n; ++i) {
        var node = nodes[i], dx = node.x - x2 || 1e-6, dy = (node.y || 0) - y2 || 1e-6, dz = (node.z || 0) - z2 || 1e-6, r = Math.sqrt(dx * dx + dy * dy + dz * dz), k = (radiuses[i] - r) * strengths[i] * alpha / r;
        node.vx += dx * k;
        if (nDim > 1) {
          node.vy += dy * k;
        }
        if (nDim > 2) {
          node.vz += dz * k;
        }
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      radiuses = new Array(n);
      for (i = 0; i < n; ++i) {
        radiuses[i] = +radius(nodes[i], i, nodes);
        strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(initNodes, ...args) {
      nodes = initNodes;
      nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : strength;
    };
    force.radius = function(_2) {
      return arguments.length ? (radius = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : radius;
    };
    force.x = function(_2) {
      return arguments.length ? (x2 = +_2, force) : x2;
    };
    force.y = function(_2) {
      return arguments.length ? (y2 = +_2, force) : y2;
    };
    force.z = function(_2) {
      return arguments.length ? (z2 = +_2, force) : z2;
    };
    return force;
  }
  function forceX(x2) {
    var strength = constant(0.1), nodes, strengths, xz;
    if (typeof x2 !== "function") x2 = constant(x2 == null ? 0 : +x2);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vx += (xz[i] - node.x) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      xz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(xz[i] = +x2(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : strength;
    };
    force.x = function(_2) {
      return arguments.length ? (x2 = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : x2;
    };
    return force;
  }
  function forceY(y2) {
    var strength = constant(0.1), nodes, strengths, yz;
    if (typeof y2 !== "function") y2 = constant(y2 == null ? 0 : +y2);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vy += (yz[i] - node.y) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      yz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(yz[i] = +y2(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : strength;
    };
    force.y = function(_2) {
      return arguments.length ? (y2 = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : y2;
    };
    return force;
  }
  function forceZ(z2) {
    var strength = constant(0.1), nodes, strengths, zz;
    if (typeof z2 !== "function") z2 = constant(z2 == null ? 0 : +z2);
    function force(alpha) {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.vz += (zz[i] - node.z) * strengths[i] * alpha;
      }
    }
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      zz = new Array(n);
      for (i = 0; i < n; ++i) {
        strengths[i] = isNaN(zz[i] = +z2(nodes[i], i, nodes)) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
    force.initialize = function(_2) {
      nodes = _2;
      initialize();
    };
    force.strength = function(_2) {
      return arguments.length ? (strength = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : strength;
    };
    force.z = function(_2) {
      return arguments.length ? (z2 = typeof _2 === "function" ? _2 : constant(+_2), initialize(), force) : z2;
    };
    return force;
  }
  class D3Force3DLayout extends D3ForceLayout {
    constructor() {
      super(...arguments);
      this.id = "d3-force-3d";
      this.config = {
        inputNodeAttrs: ["x", "y", "z", "vx", "vy", "vz", "fx", "fy", "fz"],
        outputNodeAttrs: ["x", "y", "z", "vx", "vy", "vz"],
        simulationAttrs: [
          "alpha",
          "alphaMin",
          "alphaDecay",
          "alphaTarget",
          "velocityDecay",
          "randomSource",
          "numDimensions"
        ]
      };
      this.forceMap = {
        link: forceLink,
        manyBody: forceManyBody,
        center: forceCenter,
        collide: forceCollide,
        radial: forceRadial,
        x: forceX,
        y: forceY,
        z: forceZ
      };
      this.options = {
        numDimensions: 3,
        link: {
          id: (edge) => edge.id
        },
        manyBody: {},
        center: {
          x: 0,
          y: 0,
          z: 0
        }
      };
    }
    initSimulation() {
      return forceSimulation();
    }
  }
  function commonjsRequire(path) {
    throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
  }
  var _listCacheClear;
  var hasRequired_listCacheClear;
  function require_listCacheClear() {
    if (hasRequired_listCacheClear) return _listCacheClear;
    hasRequired_listCacheClear = 1;
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    _listCacheClear = listCacheClear;
    return _listCacheClear;
  }
  var eq_1;
  var hasRequiredEq;
  function requireEq() {
    if (hasRequiredEq) return eq_1;
    hasRequiredEq = 1;
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    eq_1 = eq;
    return eq_1;
  }
  var _assocIndexOf;
  var hasRequired_assocIndexOf;
  function require_assocIndexOf() {
    if (hasRequired_assocIndexOf) return _assocIndexOf;
    hasRequired_assocIndexOf = 1;
    var eq = requireEq();
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    _assocIndexOf = assocIndexOf;
    return _assocIndexOf;
  }
  var _listCacheDelete;
  var hasRequired_listCacheDelete;
  function require_listCacheDelete() {
    if (hasRequired_listCacheDelete) return _listCacheDelete;
    hasRequired_listCacheDelete = 1;
    var assocIndexOf = require_assocIndexOf();
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index2 = assocIndexOf(data, key);
      if (index2 < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index2 == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index2, 1);
      }
      --this.size;
      return true;
    }
    _listCacheDelete = listCacheDelete;
    return _listCacheDelete;
  }
  var _listCacheGet;
  var hasRequired_listCacheGet;
  function require_listCacheGet() {
    if (hasRequired_listCacheGet) return _listCacheGet;
    hasRequired_listCacheGet = 1;
    var assocIndexOf = require_assocIndexOf();
    function listCacheGet(key) {
      var data = this.__data__, index2 = assocIndexOf(data, key);
      return index2 < 0 ? void 0 : data[index2][1];
    }
    _listCacheGet = listCacheGet;
    return _listCacheGet;
  }
  var _listCacheHas;
  var hasRequired_listCacheHas;
  function require_listCacheHas() {
    if (hasRequired_listCacheHas) return _listCacheHas;
    hasRequired_listCacheHas = 1;
    var assocIndexOf = require_assocIndexOf();
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    _listCacheHas = listCacheHas;
    return _listCacheHas;
  }
  var _listCacheSet;
  var hasRequired_listCacheSet;
  function require_listCacheSet() {
    if (hasRequired_listCacheSet) return _listCacheSet;
    hasRequired_listCacheSet = 1;
    var assocIndexOf = require_assocIndexOf();
    function listCacheSet(key, value) {
      var data = this.__data__, index2 = assocIndexOf(data, key);
      if (index2 < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index2][1] = value;
      }
      return this;
    }
    _listCacheSet = listCacheSet;
    return _listCacheSet;
  }
  var _ListCache;
  var hasRequired_ListCache;
  function require_ListCache() {
    if (hasRequired_ListCache) return _ListCache;
    hasRequired_ListCache = 1;
    var listCacheClear = require_listCacheClear(), listCacheDelete = require_listCacheDelete(), listCacheGet = require_listCacheGet(), listCacheHas = require_listCacheHas(), listCacheSet = require_listCacheSet();
    function ListCache(entries) {
      var index2 = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index2 < length) {
        var entry = entries[index2];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    _ListCache = ListCache;
    return _ListCache;
  }
  var _stackClear;
  var hasRequired_stackClear;
  function require_stackClear() {
    if (hasRequired_stackClear) return _stackClear;
    hasRequired_stackClear = 1;
    var ListCache = require_ListCache();
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    _stackClear = stackClear;
    return _stackClear;
  }
  var _stackDelete;
  var hasRequired_stackDelete;
  function require_stackDelete() {
    if (hasRequired_stackDelete) return _stackDelete;
    hasRequired_stackDelete = 1;
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    _stackDelete = stackDelete;
    return _stackDelete;
  }
  var _stackGet;
  var hasRequired_stackGet;
  function require_stackGet() {
    if (hasRequired_stackGet) return _stackGet;
    hasRequired_stackGet = 1;
    function stackGet(key) {
      return this.__data__.get(key);
    }
    _stackGet = stackGet;
    return _stackGet;
  }
  var _stackHas;
  var hasRequired_stackHas;
  function require_stackHas() {
    if (hasRequired_stackHas) return _stackHas;
    hasRequired_stackHas = 1;
    function stackHas(key) {
      return this.__data__.has(key);
    }
    _stackHas = stackHas;
    return _stackHas;
  }
  var _freeGlobal;
  var hasRequired_freeGlobal;
  function require_freeGlobal() {
    if (hasRequired_freeGlobal) return _freeGlobal;
    hasRequired_freeGlobal = 1;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    _freeGlobal = freeGlobal;
    return _freeGlobal;
  }
  var _root;
  var hasRequired_root;
  function require_root() {
    if (hasRequired_root) return _root;
    hasRequired_root = 1;
    var freeGlobal = require_freeGlobal();
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    _root = root;
    return _root;
  }
  var _Symbol;
  var hasRequired_Symbol;
  function require_Symbol() {
    if (hasRequired_Symbol) return _Symbol;
    hasRequired_Symbol = 1;
    var root = require_root();
    var Symbol2 = root.Symbol;
    _Symbol = Symbol2;
    return _Symbol;
  }
  var _getRawTag;
  var hasRequired_getRawTag;
  function require_getRawTag() {
    if (hasRequired_getRawTag) return _getRawTag;
    hasRequired_getRawTag = 1;
    var Symbol2 = require_Symbol();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    var nativeObjectToString = objectProto.toString;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty2.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    _getRawTag = getRawTag;
    return _getRawTag;
  }
  var _objectToString;
  var hasRequired_objectToString;
  function require_objectToString() {
    if (hasRequired_objectToString) return _objectToString;
    hasRequired_objectToString = 1;
    var objectProto = Object.prototype;
    var nativeObjectToString = objectProto.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    _objectToString = objectToString;
    return _objectToString;
  }
  var _baseGetTag;
  var hasRequired_baseGetTag;
  function require_baseGetTag() {
    if (hasRequired_baseGetTag) return _baseGetTag;
    hasRequired_baseGetTag = 1;
    var Symbol2 = require_Symbol(), getRawTag = require_getRawTag(), objectToString = require_objectToString();
    var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    _baseGetTag = baseGetTag;
    return _baseGetTag;
  }
  var isObject_1;
  var hasRequiredIsObject;
  function requireIsObject() {
    if (hasRequiredIsObject) return isObject_1;
    hasRequiredIsObject = 1;
    function isObject2(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    isObject_1 = isObject2;
    return isObject_1;
  }
  var isFunction_1;
  var hasRequiredIsFunction;
  function requireIsFunction() {
    if (hasRequiredIsFunction) return isFunction_1;
    hasRequiredIsFunction = 1;
    var baseGetTag = require_baseGetTag(), isObject2 = requireIsObject();
    var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
    function isFunction2(value) {
      if (!isObject2(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    isFunction_1 = isFunction2;
    return isFunction_1;
  }
  var _coreJsData;
  var hasRequired_coreJsData;
  function require_coreJsData() {
    if (hasRequired_coreJsData) return _coreJsData;
    hasRequired_coreJsData = 1;
    var root = require_root();
    var coreJsData = root["__core-js_shared__"];
    _coreJsData = coreJsData;
    return _coreJsData;
  }
  var _isMasked;
  var hasRequired_isMasked;
  function require_isMasked() {
    if (hasRequired_isMasked) return _isMasked;
    hasRequired_isMasked = 1;
    var coreJsData = require_coreJsData();
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    _isMasked = isMasked;
    return _isMasked;
  }
  var _toSource;
  var hasRequired_toSource;
  function require_toSource() {
    if (hasRequired_toSource) return _toSource;
    hasRequired_toSource = 1;
    var funcProto = Function.prototype;
    var funcToString = funcProto.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    _toSource = toSource;
    return _toSource;
  }
  var _baseIsNative;
  var hasRequired_baseIsNative;
  function require_baseIsNative() {
    if (hasRequired_baseIsNative) return _baseIsNative;
    hasRequired_baseIsNative = 1;
    var isFunction2 = requireIsFunction(), isMasked = require_isMasked(), isObject2 = requireIsObject(), toSource = require_toSource();
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype, objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject2(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction2(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    _baseIsNative = baseIsNative;
    return _baseIsNative;
  }
  var _getValue;
  var hasRequired_getValue;
  function require_getValue() {
    if (hasRequired_getValue) return _getValue;
    hasRequired_getValue = 1;
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    _getValue = getValue;
    return _getValue;
  }
  var _getNative;
  var hasRequired_getNative;
  function require_getNative() {
    if (hasRequired_getNative) return _getNative;
    hasRequired_getNative = 1;
    var baseIsNative = require_baseIsNative(), getValue = require_getValue();
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    _getNative = getNative;
    return _getNative;
  }
  var _Map;
  var hasRequired_Map;
  function require_Map() {
    if (hasRequired_Map) return _Map;
    hasRequired_Map = 1;
    var getNative = require_getNative(), root = require_root();
    var Map2 = getNative(root, "Map");
    _Map = Map2;
    return _Map;
  }
  var _nativeCreate;
  var hasRequired_nativeCreate;
  function require_nativeCreate() {
    if (hasRequired_nativeCreate) return _nativeCreate;
    hasRequired_nativeCreate = 1;
    var getNative = require_getNative();
    var nativeCreate = getNative(Object, "create");
    _nativeCreate = nativeCreate;
    return _nativeCreate;
  }
  var _hashClear;
  var hasRequired_hashClear;
  function require_hashClear() {
    if (hasRequired_hashClear) return _hashClear;
    hasRequired_hashClear = 1;
    var nativeCreate = require_nativeCreate();
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    _hashClear = hashClear;
    return _hashClear;
  }
  var _hashDelete;
  var hasRequired_hashDelete;
  function require_hashDelete() {
    if (hasRequired_hashDelete) return _hashDelete;
    hasRequired_hashDelete = 1;
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    _hashDelete = hashDelete;
    return _hashDelete;
  }
  var _hashGet;
  var hasRequired_hashGet;
  function require_hashGet() {
    if (hasRequired_hashGet) return _hashGet;
    hasRequired_hashGet = 1;
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty2.call(data, key) ? data[key] : void 0;
    }
    _hashGet = hashGet;
    return _hashGet;
  }
  var _hashHas;
  var hasRequired_hashHas;
  function require_hashHas() {
    if (hasRequired_hashHas) return _hashHas;
    hasRequired_hashHas = 1;
    var nativeCreate = require_nativeCreate();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty2.call(data, key);
    }
    _hashHas = hashHas;
    return _hashHas;
  }
  var _hashSet;
  var hasRequired_hashSet;
  function require_hashSet() {
    if (hasRequired_hashSet) return _hashSet;
    hasRequired_hashSet = 1;
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    _hashSet = hashSet;
    return _hashSet;
  }
  var _Hash;
  var hasRequired_Hash;
  function require_Hash() {
    if (hasRequired_Hash) return _Hash;
    hasRequired_Hash = 1;
    var hashClear = require_hashClear(), hashDelete = require_hashDelete(), hashGet = require_hashGet(), hashHas = require_hashHas(), hashSet = require_hashSet();
    function Hash(entries) {
      var index2 = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index2 < length) {
        var entry = entries[index2];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    _Hash = Hash;
    return _Hash;
  }
  var _mapCacheClear;
  var hasRequired_mapCacheClear;
  function require_mapCacheClear() {
    if (hasRequired_mapCacheClear) return _mapCacheClear;
    hasRequired_mapCacheClear = 1;
    var Hash = require_Hash(), ListCache = require_ListCache(), Map2 = require_Map();
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    _mapCacheClear = mapCacheClear;
    return _mapCacheClear;
  }
  var _isKeyable;
  var hasRequired_isKeyable;
  function require_isKeyable() {
    if (hasRequired_isKeyable) return _isKeyable;
    hasRequired_isKeyable = 1;
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    _isKeyable = isKeyable;
    return _isKeyable;
  }
  var _getMapData;
  var hasRequired_getMapData;
  function require_getMapData() {
    if (hasRequired_getMapData) return _getMapData;
    hasRequired_getMapData = 1;
    var isKeyable = require_isKeyable();
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    _getMapData = getMapData;
    return _getMapData;
  }
  var _mapCacheDelete;
  var hasRequired_mapCacheDelete;
  function require_mapCacheDelete() {
    if (hasRequired_mapCacheDelete) return _mapCacheDelete;
    hasRequired_mapCacheDelete = 1;
    var getMapData = require_getMapData();
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    _mapCacheDelete = mapCacheDelete;
    return _mapCacheDelete;
  }
  var _mapCacheGet;
  var hasRequired_mapCacheGet;
  function require_mapCacheGet() {
    if (hasRequired_mapCacheGet) return _mapCacheGet;
    hasRequired_mapCacheGet = 1;
    var getMapData = require_getMapData();
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    _mapCacheGet = mapCacheGet;
    return _mapCacheGet;
  }
  var _mapCacheHas;
  var hasRequired_mapCacheHas;
  function require_mapCacheHas() {
    if (hasRequired_mapCacheHas) return _mapCacheHas;
    hasRequired_mapCacheHas = 1;
    var getMapData = require_getMapData();
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    _mapCacheHas = mapCacheHas;
    return _mapCacheHas;
  }
  var _mapCacheSet;
  var hasRequired_mapCacheSet;
  function require_mapCacheSet() {
    if (hasRequired_mapCacheSet) return _mapCacheSet;
    hasRequired_mapCacheSet = 1;
    var getMapData = require_getMapData();
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    _mapCacheSet = mapCacheSet;
    return _mapCacheSet;
  }
  var _MapCache;
  var hasRequired_MapCache;
  function require_MapCache() {
    if (hasRequired_MapCache) return _MapCache;
    hasRequired_MapCache = 1;
    var mapCacheClear = require_mapCacheClear(), mapCacheDelete = require_mapCacheDelete(), mapCacheGet = require_mapCacheGet(), mapCacheHas = require_mapCacheHas(), mapCacheSet = require_mapCacheSet();
    function MapCache(entries) {
      var index2 = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index2 < length) {
        var entry = entries[index2];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    _MapCache = MapCache;
    return _MapCache;
  }
  var _stackSet;
  var hasRequired_stackSet;
  function require_stackSet() {
    if (hasRequired_stackSet) return _stackSet;
    hasRequired_stackSet = 1;
    var ListCache = require_ListCache(), Map2 = require_Map(), MapCache = require_MapCache();
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    _stackSet = stackSet;
    return _stackSet;
  }
  var _Stack;
  var hasRequired_Stack;
  function require_Stack() {
    if (hasRequired_Stack) return _Stack;
    hasRequired_Stack = 1;
    var ListCache = require_ListCache(), stackClear = require_stackClear(), stackDelete = require_stackDelete(), stackGet = require_stackGet(), stackHas = require_stackHas(), stackSet = require_stackSet();
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    _Stack = Stack;
    return _Stack;
  }
  var _arrayEach;
  var hasRequired_arrayEach;
  function require_arrayEach() {
    if (hasRequired_arrayEach) return _arrayEach;
    hasRequired_arrayEach = 1;
    function arrayEach(array, iteratee) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (iteratee(array[index2], index2, array) === false) {
          break;
        }
      }
      return array;
    }
    _arrayEach = arrayEach;
    return _arrayEach;
  }
  var _defineProperty;
  var hasRequired_defineProperty;
  function require_defineProperty() {
    if (hasRequired_defineProperty) return _defineProperty;
    hasRequired_defineProperty = 1;
    var getNative = require_getNative();
    var defineProperty = function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    }();
    _defineProperty = defineProperty;
    return _defineProperty;
  }
  var _baseAssignValue;
  var hasRequired_baseAssignValue;
  function require_baseAssignValue() {
    if (hasRequired_baseAssignValue) return _baseAssignValue;
    hasRequired_baseAssignValue = 1;
    var defineProperty = require_defineProperty();
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    _baseAssignValue = baseAssignValue;
    return _baseAssignValue;
  }
  var _assignValue;
  var hasRequired_assignValue;
  function require_assignValue() {
    if (hasRequired_assignValue) return _assignValue;
    hasRequired_assignValue = 1;
    var baseAssignValue = require_baseAssignValue(), eq = requireEq();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty2.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    _assignValue = assignValue;
    return _assignValue;
  }
  var _copyObject;
  var hasRequired_copyObject;
  function require_copyObject() {
    if (hasRequired_copyObject) return _copyObject;
    hasRequired_copyObject = 1;
    var assignValue = require_assignValue(), baseAssignValue = require_baseAssignValue();
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index2 = -1, length = props.length;
      while (++index2 < length) {
        var key = props[index2];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    _copyObject = copyObject;
    return _copyObject;
  }
  var _baseTimes;
  var hasRequired_baseTimes;
  function require_baseTimes() {
    if (hasRequired_baseTimes) return _baseTimes;
    hasRequired_baseTimes = 1;
    function baseTimes(n, iteratee) {
      var index2 = -1, result = Array(n);
      while (++index2 < n) {
        result[index2] = iteratee(index2);
      }
      return result;
    }
    _baseTimes = baseTimes;
    return _baseTimes;
  }
  var isObjectLike_1;
  var hasRequiredIsObjectLike;
  function requireIsObjectLike() {
    if (hasRequiredIsObjectLike) return isObjectLike_1;
    hasRequiredIsObjectLike = 1;
    function isObjectLike2(value) {
      return value != null && typeof value == "object";
    }
    isObjectLike_1 = isObjectLike2;
    return isObjectLike_1;
  }
  var _baseIsArguments;
  var hasRequired_baseIsArguments;
  function require_baseIsArguments() {
    if (hasRequired_baseIsArguments) return _baseIsArguments;
    hasRequired_baseIsArguments = 1;
    var baseGetTag = require_baseGetTag(), isObjectLike2 = requireIsObjectLike();
    var argsTag = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike2(value) && baseGetTag(value) == argsTag;
    }
    _baseIsArguments = baseIsArguments;
    return _baseIsArguments;
  }
  var isArguments_1;
  var hasRequiredIsArguments;
  function requireIsArguments() {
    if (hasRequiredIsArguments) return isArguments_1;
    hasRequiredIsArguments = 1;
    var baseIsArguments = require_baseIsArguments(), isObjectLike2 = requireIsObjectLike();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var isArguments = baseIsArguments(/* @__PURE__ */ function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike2(value) && hasOwnProperty2.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    isArguments_1 = isArguments;
    return isArguments_1;
  }
  var isArray_1;
  var hasRequiredIsArray;
  function requireIsArray() {
    if (hasRequiredIsArray) return isArray_1;
    hasRequiredIsArray = 1;
    var isArray2 = Array.isArray;
    isArray_1 = isArray2;
    return isArray_1;
  }
  var isBuffer = { exports: {} };
  var stubFalse_1;
  var hasRequiredStubFalse;
  function requireStubFalse() {
    if (hasRequiredStubFalse) return stubFalse_1;
    hasRequiredStubFalse = 1;
    function stubFalse() {
      return false;
    }
    stubFalse_1 = stubFalse;
    return stubFalse_1;
  }
  isBuffer.exports;
  var hasRequiredIsBuffer;
  function requireIsBuffer() {
    if (hasRequiredIsBuffer) return isBuffer.exports;
    hasRequiredIsBuffer = 1;
    (function(module, exports$1) {
      var root = require_root(), stubFalse = requireStubFalse();
      var freeExports = exports$1 && !exports$1.nodeType && exports$1;
      var freeModule = freeExports && true && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var Buffer2 = moduleExports ? root.Buffer : void 0;
      var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
      var isBuffer2 = nativeIsBuffer || stubFalse;
      module.exports = isBuffer2;
    })(isBuffer, isBuffer.exports);
    return isBuffer.exports;
  }
  var _isIndex;
  var hasRequired_isIndex;
  function require_isIndex() {
    if (hasRequired_isIndex) return _isIndex;
    hasRequired_isIndex = 1;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    _isIndex = isIndex;
    return _isIndex;
  }
  var isLength_1;
  var hasRequiredIsLength;
  function requireIsLength() {
    if (hasRequiredIsLength) return isLength_1;
    hasRequiredIsLength = 1;
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    isLength_1 = isLength;
    return isLength_1;
  }
  var _baseIsTypedArray;
  var hasRequired_baseIsTypedArray;
  function require_baseIsTypedArray() {
    if (hasRequired_baseIsTypedArray) return _baseIsTypedArray;
    hasRequired_baseIsTypedArray = 1;
    var baseGetTag = require_baseGetTag(), isLength = requireIsLength(), isObjectLike2 = requireIsObjectLike();
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    function baseIsTypedArray(value) {
      return isObjectLike2(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    _baseIsTypedArray = baseIsTypedArray;
    return _baseIsTypedArray;
  }
  var _baseUnary;
  var hasRequired_baseUnary;
  function require_baseUnary() {
    if (hasRequired_baseUnary) return _baseUnary;
    hasRequired_baseUnary = 1;
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    _baseUnary = baseUnary;
    return _baseUnary;
  }
  var _nodeUtil = { exports: {} };
  _nodeUtil.exports;
  var hasRequired_nodeUtil;
  function require_nodeUtil() {
    if (hasRequired_nodeUtil) return _nodeUtil.exports;
    hasRequired_nodeUtil = 1;
    (function(module, exports$1) {
      var freeGlobal = require_freeGlobal();
      var freeExports = exports$1 && !exports$1.nodeType && exports$1;
      var freeModule = freeExports && true && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var freeProcess = moduleExports && freeGlobal.process;
      var nodeUtil = function() {
        try {
          var types = freeModule && freeModule.require && freeModule.require("util").types;
          if (types) {
            return types;
          }
          return freeProcess && freeProcess.binding && freeProcess.binding("util");
        } catch (e) {
        }
      }();
      module.exports = nodeUtil;
    })(_nodeUtil, _nodeUtil.exports);
    return _nodeUtil.exports;
  }
  var isTypedArray_1;
  var hasRequiredIsTypedArray;
  function requireIsTypedArray() {
    if (hasRequiredIsTypedArray) return isTypedArray_1;
    hasRequiredIsTypedArray = 1;
    var baseIsTypedArray = require_baseIsTypedArray(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    isTypedArray_1 = isTypedArray;
    return isTypedArray_1;
  }
  var _arrayLikeKeys;
  var hasRequired_arrayLikeKeys;
  function require_arrayLikeKeys() {
    if (hasRequired_arrayLikeKeys) return _arrayLikeKeys;
    hasRequired_arrayLikeKeys = 1;
    var baseTimes = require_baseTimes(), isArguments = requireIsArguments(), isArray2 = requireIsArray(), isBuffer2 = requireIsBuffer(), isIndex = require_isIndex(), isTypedArray = requireIsTypedArray();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray2(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer2(value), isType2 = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType2, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty2.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType2 && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    _arrayLikeKeys = arrayLikeKeys;
    return _arrayLikeKeys;
  }
  var _isPrototype;
  var hasRequired_isPrototype;
  function require_isPrototype() {
    if (hasRequired_isPrototype) return _isPrototype;
    hasRequired_isPrototype = 1;
    var objectProto = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    _isPrototype = isPrototype;
    return _isPrototype;
  }
  var _overArg;
  var hasRequired_overArg;
  function require_overArg() {
    if (hasRequired_overArg) return _overArg;
    hasRequired_overArg = 1;
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    _overArg = overArg;
    return _overArg;
  }
  var _nativeKeys;
  var hasRequired_nativeKeys;
  function require_nativeKeys() {
    if (hasRequired_nativeKeys) return _nativeKeys;
    hasRequired_nativeKeys = 1;
    var overArg = require_overArg();
    var nativeKeys = overArg(Object.keys, Object);
    _nativeKeys = nativeKeys;
    return _nativeKeys;
  }
  var _baseKeys;
  var hasRequired_baseKeys;
  function require_baseKeys() {
    if (hasRequired_baseKeys) return _baseKeys;
    hasRequired_baseKeys = 1;
    var isPrototype = require_isPrototype(), nativeKeys = require_nativeKeys();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty2.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    _baseKeys = baseKeys;
    return _baseKeys;
  }
  var isArrayLike_1;
  var hasRequiredIsArrayLike;
  function requireIsArrayLike() {
    if (hasRequiredIsArrayLike) return isArrayLike_1;
    hasRequiredIsArrayLike = 1;
    var isFunction2 = requireIsFunction(), isLength = requireIsLength();
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction2(value);
    }
    isArrayLike_1 = isArrayLike;
    return isArrayLike_1;
  }
  var keys_1;
  var hasRequiredKeys;
  function requireKeys() {
    if (hasRequiredKeys) return keys_1;
    hasRequiredKeys = 1;
    var arrayLikeKeys = require_arrayLikeKeys(), baseKeys = require_baseKeys(), isArrayLike = requireIsArrayLike();
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    keys_1 = keys;
    return keys_1;
  }
  var _baseAssign;
  var hasRequired_baseAssign;
  function require_baseAssign() {
    if (hasRequired_baseAssign) return _baseAssign;
    hasRequired_baseAssign = 1;
    var copyObject = require_copyObject(), keys = requireKeys();
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    _baseAssign = baseAssign;
    return _baseAssign;
  }
  var _nativeKeysIn;
  var hasRequired_nativeKeysIn;
  function require_nativeKeysIn() {
    if (hasRequired_nativeKeysIn) return _nativeKeysIn;
    hasRequired_nativeKeysIn = 1;
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    _nativeKeysIn = nativeKeysIn;
    return _nativeKeysIn;
  }
  var _baseKeysIn;
  var hasRequired_baseKeysIn;
  function require_baseKeysIn() {
    if (hasRequired_baseKeysIn) return _baseKeysIn;
    hasRequired_baseKeysIn = 1;
    var isObject2 = requireIsObject(), isPrototype = require_isPrototype(), nativeKeysIn = require_nativeKeysIn();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function baseKeysIn(object) {
      if (!isObject2(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty2.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    _baseKeysIn = baseKeysIn;
    return _baseKeysIn;
  }
  var keysIn_1;
  var hasRequiredKeysIn;
  function requireKeysIn() {
    if (hasRequiredKeysIn) return keysIn_1;
    hasRequiredKeysIn = 1;
    var arrayLikeKeys = require_arrayLikeKeys(), baseKeysIn = require_baseKeysIn(), isArrayLike = requireIsArrayLike();
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    keysIn_1 = keysIn;
    return keysIn_1;
  }
  var _baseAssignIn;
  var hasRequired_baseAssignIn;
  function require_baseAssignIn() {
    if (hasRequired_baseAssignIn) return _baseAssignIn;
    hasRequired_baseAssignIn = 1;
    var copyObject = require_copyObject(), keysIn = requireKeysIn();
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }
    _baseAssignIn = baseAssignIn;
    return _baseAssignIn;
  }
  var _cloneBuffer = { exports: {} };
  _cloneBuffer.exports;
  var hasRequired_cloneBuffer;
  function require_cloneBuffer() {
    if (hasRequired_cloneBuffer) return _cloneBuffer.exports;
    hasRequired_cloneBuffer = 1;
    (function(module, exports$1) {
      var root = require_root();
      var freeExports = exports$1 && !exports$1.nodeType && exports$1;
      var freeModule = freeExports && true && module && !module.nodeType && module;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var Buffer2 = moduleExports ? root.Buffer : void 0, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result);
        return result;
      }
      module.exports = cloneBuffer;
    })(_cloneBuffer, _cloneBuffer.exports);
    return _cloneBuffer.exports;
  }
  var _copyArray;
  var hasRequired_copyArray;
  function require_copyArray() {
    if (hasRequired_copyArray) return _copyArray;
    hasRequired_copyArray = 1;
    function copyArray(source, array) {
      var index2 = -1, length = source.length;
      array || (array = Array(length));
      while (++index2 < length) {
        array[index2] = source[index2];
      }
      return array;
    }
    _copyArray = copyArray;
    return _copyArray;
  }
  var _arrayFilter;
  var hasRequired_arrayFilter;
  function require_arrayFilter() {
    if (hasRequired_arrayFilter) return _arrayFilter;
    hasRequired_arrayFilter = 1;
    function arrayFilter(array, predicate) {
      var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index2 < length) {
        var value = array[index2];
        if (predicate(value, index2, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    _arrayFilter = arrayFilter;
    return _arrayFilter;
  }
  var stubArray_1;
  var hasRequiredStubArray;
  function requireStubArray() {
    if (hasRequiredStubArray) return stubArray_1;
    hasRequiredStubArray = 1;
    function stubArray() {
      return [];
    }
    stubArray_1 = stubArray;
    return stubArray_1;
  }
  var _getSymbols;
  var hasRequired_getSymbols;
  function require_getSymbols() {
    if (hasRequired_getSymbols) return _getSymbols;
    hasRequired_getSymbols = 1;
    var arrayFilter = require_arrayFilter(), stubArray = requireStubArray();
    var objectProto = Object.prototype;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    _getSymbols = getSymbols;
    return _getSymbols;
  }
  var _copySymbols;
  var hasRequired_copySymbols;
  function require_copySymbols() {
    if (hasRequired_copySymbols) return _copySymbols;
    hasRequired_copySymbols = 1;
    var copyObject = require_copyObject(), getSymbols = require_getSymbols();
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    _copySymbols = copySymbols;
    return _copySymbols;
  }
  var _arrayPush;
  var hasRequired_arrayPush;
  function require_arrayPush() {
    if (hasRequired_arrayPush) return _arrayPush;
    hasRequired_arrayPush = 1;
    function arrayPush(array, values) {
      var index2 = -1, length = values.length, offset = array.length;
      while (++index2 < length) {
        array[offset + index2] = values[index2];
      }
      return array;
    }
    _arrayPush = arrayPush;
    return _arrayPush;
  }
  var _getPrototype;
  var hasRequired_getPrototype;
  function require_getPrototype() {
    if (hasRequired_getPrototype) return _getPrototype;
    hasRequired_getPrototype = 1;
    var overArg = require_overArg();
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    _getPrototype = getPrototype;
    return _getPrototype;
  }
  var _getSymbolsIn;
  var hasRequired_getSymbolsIn;
  function require_getSymbolsIn() {
    if (hasRequired_getSymbolsIn) return _getSymbolsIn;
    hasRequired_getSymbolsIn = 1;
    var arrayPush = require_arrayPush(), getPrototype = require_getPrototype(), getSymbols = require_getSymbols(), stubArray = requireStubArray();
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };
    _getSymbolsIn = getSymbolsIn;
    return _getSymbolsIn;
  }
  var _copySymbolsIn;
  var hasRequired_copySymbolsIn;
  function require_copySymbolsIn() {
    if (hasRequired_copySymbolsIn) return _copySymbolsIn;
    hasRequired_copySymbolsIn = 1;
    var copyObject = require_copyObject(), getSymbolsIn = require_getSymbolsIn();
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }
    _copySymbolsIn = copySymbolsIn;
    return _copySymbolsIn;
  }
  var _baseGetAllKeys;
  var hasRequired_baseGetAllKeys;
  function require_baseGetAllKeys() {
    if (hasRequired_baseGetAllKeys) return _baseGetAllKeys;
    hasRequired_baseGetAllKeys = 1;
    var arrayPush = require_arrayPush(), isArray2 = requireIsArray();
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray2(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    _baseGetAllKeys = baseGetAllKeys;
    return _baseGetAllKeys;
  }
  var _getAllKeys;
  var hasRequired_getAllKeys;
  function require_getAllKeys() {
    if (hasRequired_getAllKeys) return _getAllKeys;
    hasRequired_getAllKeys = 1;
    var baseGetAllKeys = require_baseGetAllKeys(), getSymbols = require_getSymbols(), keys = requireKeys();
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    _getAllKeys = getAllKeys;
    return _getAllKeys;
  }
  var _getAllKeysIn;
  var hasRequired_getAllKeysIn;
  function require_getAllKeysIn() {
    if (hasRequired_getAllKeysIn) return _getAllKeysIn;
    hasRequired_getAllKeysIn = 1;
    var baseGetAllKeys = require_baseGetAllKeys(), getSymbolsIn = require_getSymbolsIn(), keysIn = requireKeysIn();
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }
    _getAllKeysIn = getAllKeysIn;
    return _getAllKeysIn;
  }
  var _DataView;
  var hasRequired_DataView;
  function require_DataView() {
    if (hasRequired_DataView) return _DataView;
    hasRequired_DataView = 1;
    var getNative = require_getNative(), root = require_root();
    var DataView = getNative(root, "DataView");
    _DataView = DataView;
    return _DataView;
  }
  var _Promise;
  var hasRequired_Promise;
  function require_Promise() {
    if (hasRequired_Promise) return _Promise;
    hasRequired_Promise = 1;
    var getNative = require_getNative(), root = require_root();
    var Promise2 = getNative(root, "Promise");
    _Promise = Promise2;
    return _Promise;
  }
  var _Set;
  var hasRequired_Set;
  function require_Set() {
    if (hasRequired_Set) return _Set;
    hasRequired_Set = 1;
    var getNative = require_getNative(), root = require_root();
    var Set2 = getNative(root, "Set");
    _Set = Set2;
    return _Set;
  }
  var _WeakMap;
  var hasRequired_WeakMap;
  function require_WeakMap() {
    if (hasRequired_WeakMap) return _WeakMap;
    hasRequired_WeakMap = 1;
    var getNative = require_getNative(), root = require_root();
    var WeakMap2 = getNative(root, "WeakMap");
    _WeakMap = WeakMap2;
    return _WeakMap;
  }
  var _getTag;
  var hasRequired_getTag;
  function require_getTag() {
    if (hasRequired_getTag) return _getTag;
    hasRequired_getTag = 1;
    var DataView = require_DataView(), Map2 = require_Map(), Promise2 = require_Promise(), Set2 = require_Set(), WeakMap2 = require_WeakMap(), baseGetTag = require_baseGetTag(), toSource = require_toSource();
    var mapTag = "[object Map]", objectTag = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
    var dataViewTag = "[object DataView]";
    var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap2);
    var getTag = baseGetTag;
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    _getTag = getTag;
    return _getTag;
  }
  var _initCloneArray;
  var hasRequired_initCloneArray;
  function require_initCloneArray() {
    if (hasRequired_initCloneArray) return _initCloneArray;
    hasRequired_initCloneArray = 1;
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function initCloneArray(array) {
      var length = array.length, result = new array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty2.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    _initCloneArray = initCloneArray;
    return _initCloneArray;
  }
  var _Uint8Array;
  var hasRequired_Uint8Array;
  function require_Uint8Array() {
    if (hasRequired_Uint8Array) return _Uint8Array;
    hasRequired_Uint8Array = 1;
    var root = require_root();
    var Uint8Array2 = root.Uint8Array;
    _Uint8Array = Uint8Array2;
    return _Uint8Array;
  }
  var _cloneArrayBuffer;
  var hasRequired_cloneArrayBuffer;
  function require_cloneArrayBuffer() {
    if (hasRequired_cloneArrayBuffer) return _cloneArrayBuffer;
    hasRequired_cloneArrayBuffer = 1;
    var Uint8Array2 = require_Uint8Array();
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    _cloneArrayBuffer = cloneArrayBuffer;
    return _cloneArrayBuffer;
  }
  var _cloneDataView;
  var hasRequired_cloneDataView;
  function require_cloneDataView() {
    if (hasRequired_cloneDataView) return _cloneDataView;
    hasRequired_cloneDataView = 1;
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    _cloneDataView = cloneDataView;
    return _cloneDataView;
  }
  var _cloneRegExp;
  var hasRequired_cloneRegExp;
  function require_cloneRegExp() {
    if (hasRequired_cloneRegExp) return _cloneRegExp;
    hasRequired_cloneRegExp = 1;
    var reFlags = /\w*$/;
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    _cloneRegExp = cloneRegExp;
    return _cloneRegExp;
  }
  var _cloneSymbol;
  var hasRequired_cloneSymbol;
  function require_cloneSymbol() {
    if (hasRequired_cloneSymbol) return _cloneSymbol;
    hasRequired_cloneSymbol = 1;
    var Symbol2 = require_Symbol();
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    _cloneSymbol = cloneSymbol;
    return _cloneSymbol;
  }
  var _cloneTypedArray;
  var hasRequired_cloneTypedArray;
  function require_cloneTypedArray() {
    if (hasRequired_cloneTypedArray) return _cloneTypedArray;
    hasRequired_cloneTypedArray = 1;
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    _cloneTypedArray = cloneTypedArray;
    return _cloneTypedArray;
  }
  var _initCloneByTag;
  var hasRequired_initCloneByTag;
  function require_initCloneByTag() {
    if (hasRequired_initCloneByTag) return _initCloneByTag;
    hasRequired_initCloneByTag = 1;
    var cloneArrayBuffer = require_cloneArrayBuffer(), cloneDataView = require_cloneDataView(), cloneRegExp = require_cloneRegExp(), cloneSymbol = require_cloneSymbol(), cloneTypedArray = require_cloneTypedArray();
    var boolTag = "[object Boolean]", dateTag = "[object Date]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return new Ctor();
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return new Ctor();
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    _initCloneByTag = initCloneByTag;
    return _initCloneByTag;
  }
  var _baseCreate;
  var hasRequired_baseCreate;
  function require_baseCreate() {
    if (hasRequired_baseCreate) return _baseCreate;
    hasRequired_baseCreate = 1;
    var isObject2 = requireIsObject();
    var objectCreate = Object.create;
    var baseCreate = /* @__PURE__ */ function() {
      function object() {
      }
      return function(proto) {
        if (!isObject2(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    }();
    _baseCreate = baseCreate;
    return _baseCreate;
  }
  var _initCloneObject;
  var hasRequired_initCloneObject;
  function require_initCloneObject() {
    if (hasRequired_initCloneObject) return _initCloneObject;
    hasRequired_initCloneObject = 1;
    var baseCreate = require_baseCreate(), getPrototype = require_getPrototype(), isPrototype = require_isPrototype();
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    _initCloneObject = initCloneObject;
    return _initCloneObject;
  }
  var _baseIsMap;
  var hasRequired_baseIsMap;
  function require_baseIsMap() {
    if (hasRequired_baseIsMap) return _baseIsMap;
    hasRequired_baseIsMap = 1;
    var getTag = require_getTag(), isObjectLike2 = requireIsObjectLike();
    var mapTag = "[object Map]";
    function baseIsMap(value) {
      return isObjectLike2(value) && getTag(value) == mapTag;
    }
    _baseIsMap = baseIsMap;
    return _baseIsMap;
  }
  var isMap_1;
  var hasRequiredIsMap;
  function requireIsMap() {
    if (hasRequiredIsMap) return isMap_1;
    hasRequiredIsMap = 1;
    var baseIsMap = require_baseIsMap(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
    var nodeIsMap = nodeUtil && nodeUtil.isMap;
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    isMap_1 = isMap;
    return isMap_1;
  }
  var _baseIsSet;
  var hasRequired_baseIsSet;
  function require_baseIsSet() {
    if (hasRequired_baseIsSet) return _baseIsSet;
    hasRequired_baseIsSet = 1;
    var getTag = require_getTag(), isObjectLike2 = requireIsObjectLike();
    var setTag = "[object Set]";
    function baseIsSet(value) {
      return isObjectLike2(value) && getTag(value) == setTag;
    }
    _baseIsSet = baseIsSet;
    return _baseIsSet;
  }
  var isSet_1;
  var hasRequiredIsSet;
  function requireIsSet() {
    if (hasRequiredIsSet) return isSet_1;
    hasRequiredIsSet = 1;
    var baseIsSet = require_baseIsSet(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
    var nodeIsSet = nodeUtil && nodeUtil.isSet;
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    isSet_1 = isSet;
    return isSet_1;
  }
  var _baseClone;
  var hasRequired_baseClone;
  function require_baseClone() {
    if (hasRequired_baseClone) return _baseClone;
    hasRequired_baseClone = 1;
    var Stack = require_Stack(), arrayEach = require_arrayEach(), assignValue = require_assignValue(), baseAssign = require_baseAssign(), baseAssignIn = require_baseAssignIn(), cloneBuffer = require_cloneBuffer(), copyArray = require_copyArray(), copySymbols = require_copySymbols(), copySymbolsIn = require_copySymbolsIn(), getAllKeys = require_getAllKeys(), getAllKeysIn = require_getAllKeysIn(), getTag = require_getTag(), initCloneArray = require_initCloneArray(), initCloneByTag = require_initCloneByTag(), initCloneObject = require_initCloneObject(), isArray2 = requireIsArray(), isBuffer2 = requireIsBuffer(), isMap = requireIsMap(), isObject2 = requireIsObject(), isSet = requireIsSet(), keys = requireKeys(), keysIn = requireKeysIn();
    var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== void 0) {
        return result;
      }
      if (!isObject2(value)) {
        return value;
      }
      var isArr = isArray2(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer2(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || isFunc && !object) {
          result = isFlat || isFunc ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key2) {
          result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
      }
      var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
      var props = isArr ? void 0 : keysFunc(value);
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
      return result;
    }
    _baseClone = baseClone;
    return _baseClone;
  }
  var clone_1;
  var hasRequiredClone;
  function requireClone() {
    if (hasRequiredClone) return clone_1;
    hasRequiredClone = 1;
    var baseClone = require_baseClone();
    var CLONE_SYMBOLS_FLAG = 4;
    function clone2(value) {
      return baseClone(value, CLONE_SYMBOLS_FLAG);
    }
    clone_1 = clone2;
    return clone_1;
  }
  var constant_1;
  var hasRequiredConstant;
  function requireConstant() {
    if (hasRequiredConstant) return constant_1;
    hasRequiredConstant = 1;
    function constant2(value) {
      return function() {
        return value;
      };
    }
    constant_1 = constant2;
    return constant_1;
  }
  var _createBaseFor;
  var hasRequired_createBaseFor;
  function require_createBaseFor() {
    if (hasRequired_createBaseFor) return _createBaseFor;
    hasRequired_createBaseFor = 1;
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index2 = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index2];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    _createBaseFor = createBaseFor;
    return _createBaseFor;
  }
  var _baseFor;
  var hasRequired_baseFor;
  function require_baseFor() {
    if (hasRequired_baseFor) return _baseFor;
    hasRequired_baseFor = 1;
    var createBaseFor = require_createBaseFor();
    var baseFor = createBaseFor();
    _baseFor = baseFor;
    return _baseFor;
  }
  var _baseForOwn;
  var hasRequired_baseForOwn;
  function require_baseForOwn() {
    if (hasRequired_baseForOwn) return _baseForOwn;
    hasRequired_baseForOwn = 1;
    var baseFor = require_baseFor(), keys = requireKeys();
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }
    _baseForOwn = baseForOwn;
    return _baseForOwn;
  }
  var _createBaseEach;
  var hasRequired_createBaseEach;
  function require_createBaseEach() {
    if (hasRequired_createBaseEach) return _createBaseEach;
    hasRequired_createBaseEach = 1;
    var isArrayLike = requireIsArrayLike();
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length, index2 = fromRight ? length : -1, iterable = Object(collection);
        while (fromRight ? index2-- : ++index2 < length) {
          if (iteratee(iterable[index2], index2, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }
    _createBaseEach = createBaseEach;
    return _createBaseEach;
  }
  var _baseEach;
  var hasRequired_baseEach;
  function require_baseEach() {
    if (hasRequired_baseEach) return _baseEach;
    hasRequired_baseEach = 1;
    var baseForOwn = require_baseForOwn(), createBaseEach = require_createBaseEach();
    var baseEach = createBaseEach(baseForOwn);
    _baseEach = baseEach;
    return _baseEach;
  }
  var identity_1;
  var hasRequiredIdentity;
  function requireIdentity() {
    if (hasRequiredIdentity) return identity_1;
    hasRequiredIdentity = 1;
    function identity(value) {
      return value;
    }
    identity_1 = identity;
    return identity_1;
  }
  var _castFunction;
  var hasRequired_castFunction;
  function require_castFunction() {
    if (hasRequired_castFunction) return _castFunction;
    hasRequired_castFunction = 1;
    var identity = requireIdentity();
    function castFunction(value) {
      return typeof value == "function" ? value : identity;
    }
    _castFunction = castFunction;
    return _castFunction;
  }
  var forEach_1;
  var hasRequiredForEach;
  function requireForEach() {
    if (hasRequiredForEach) return forEach_1;
    hasRequiredForEach = 1;
    var arrayEach = require_arrayEach(), baseEach = require_baseEach(), castFunction = require_castFunction(), isArray2 = requireIsArray();
    function forEach(collection, iteratee) {
      var func = isArray2(collection) ? arrayEach : baseEach;
      return func(collection, castFunction(iteratee));
    }
    forEach_1 = forEach;
    return forEach_1;
  }
  var each;
  var hasRequiredEach;
  function requireEach() {
    if (hasRequiredEach) return each;
    hasRequiredEach = 1;
    each = requireForEach();
    return each;
  }
  var _baseFilter;
  var hasRequired_baseFilter;
  function require_baseFilter() {
    if (hasRequired_baseFilter) return _baseFilter;
    hasRequired_baseFilter = 1;
    var baseEach = require_baseEach();
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index2, collection2) {
        if (predicate(value, index2, collection2)) {
          result.push(value);
        }
      });
      return result;
    }
    _baseFilter = baseFilter;
    return _baseFilter;
  }
  var _setCacheAdd;
  var hasRequired_setCacheAdd;
  function require_setCacheAdd() {
    if (hasRequired_setCacheAdd) return _setCacheAdd;
    hasRequired_setCacheAdd = 1;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    _setCacheAdd = setCacheAdd;
    return _setCacheAdd;
  }
  var _setCacheHas;
  var hasRequired_setCacheHas;
  function require_setCacheHas() {
    if (hasRequired_setCacheHas) return _setCacheHas;
    hasRequired_setCacheHas = 1;
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    _setCacheHas = setCacheHas;
    return _setCacheHas;
  }
  var _SetCache;
  var hasRequired_SetCache;
  function require_SetCache() {
    if (hasRequired_SetCache) return _SetCache;
    hasRequired_SetCache = 1;
    var MapCache = require_MapCache(), setCacheAdd = require_setCacheAdd(), setCacheHas = require_setCacheHas();
    function SetCache(values) {
      var index2 = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index2 < length) {
        this.add(values[index2]);
      }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    _SetCache = SetCache;
    return _SetCache;
  }
  var _arraySome;
  var hasRequired_arraySome;
  function require_arraySome() {
    if (hasRequired_arraySome) return _arraySome;
    hasRequired_arraySome = 1;
    function arraySome(array, predicate) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (predicate(array[index2], index2, array)) {
          return true;
        }
      }
      return false;
    }
    _arraySome = arraySome;
    return _arraySome;
  }
  var _cacheHas;
  var hasRequired_cacheHas;
  function require_cacheHas() {
    if (hasRequired_cacheHas) return _cacheHas;
    hasRequired_cacheHas = 1;
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    _cacheHas = cacheHas;
    return _cacheHas;
  }
  var _equalArrays;
  var hasRequired_equalArrays;
  function require_equalArrays() {
    if (hasRequired_equalArrays) return _equalArrays;
    hasRequired_equalArrays = 1;
    var SetCache = require_SetCache(), arraySome = require_arraySome(), cacheHas = require_cacheHas();
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index2 = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index2 < arrLength) {
        var arrValue = array[index2], othValue = other[index2];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    _equalArrays = equalArrays;
    return _equalArrays;
  }
  var _mapToArray;
  var hasRequired_mapToArray;
  function require_mapToArray() {
    if (hasRequired_mapToArray) return _mapToArray;
    hasRequired_mapToArray = 1;
    function mapToArray(map) {
      var index2 = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index2] = [key, value];
      });
      return result;
    }
    _mapToArray = mapToArray;
    return _mapToArray;
  }
  var _setToArray;
  var hasRequired_setToArray;
  function require_setToArray() {
    if (hasRequired_setToArray) return _setToArray;
    hasRequired_setToArray = 1;
    function setToArray(set2) {
      var index2 = -1, result = Array(set2.size);
      set2.forEach(function(value) {
        result[++index2] = value;
      });
      return result;
    }
    _setToArray = setToArray;
    return _setToArray;
  }
  var _equalByTag;
  var hasRequired_equalByTag;
  function require_equalByTag() {
    if (hasRequired_equalByTag) return _equalByTag;
    hasRequired_equalByTag = 1;
    var Symbol2 = require_Symbol(), Uint8Array2 = require_Uint8Array(), eq = requireEq(), equalArrays = require_equalArrays(), mapToArray = require_mapToArray(), setToArray = require_setToArray();
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    _equalByTag = equalByTag;
    return _equalByTag;
  }
  var _equalObjects;
  var hasRequired_equalObjects;
  function require_equalObjects() {
    if (hasRequired_equalObjects) return _equalObjects;
    hasRequired_equalObjects = 1;
    var getAllKeys = require_getAllKeys();
    var COMPARE_PARTIAL_FLAG = 1;
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index2 = objLength;
      while (index2--) {
        var key = objProps[index2];
        if (!(isPartial ? key in other : hasOwnProperty2.call(other, key))) {
          return false;
        }
      }
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index2 < objLength) {
        key = objProps[index2];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    _equalObjects = equalObjects;
    return _equalObjects;
  }
  var _baseIsEqualDeep;
  var hasRequired_baseIsEqualDeep;
  function require_baseIsEqualDeep() {
    if (hasRequired_baseIsEqualDeep) return _baseIsEqualDeep;
    hasRequired_baseIsEqualDeep = 1;
    var Stack = require_Stack(), equalArrays = require_equalArrays(), equalByTag = require_equalByTag(), equalObjects = require_equalObjects(), getTag = require_getTag(), isArray2 = requireIsArray(), isBuffer2 = requireIsBuffer(), isTypedArray = requireIsTypedArray();
    var COMPARE_PARTIAL_FLAG = 1;
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray2(object), othIsArr = isArray2(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer2(object)) {
        if (!isBuffer2(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty2.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty2.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    _baseIsEqualDeep = baseIsEqualDeep;
    return _baseIsEqualDeep;
  }
  var _baseIsEqual;
  var hasRequired_baseIsEqual;
  function require_baseIsEqual() {
    if (hasRequired_baseIsEqual) return _baseIsEqual;
    hasRequired_baseIsEqual = 1;
    var baseIsEqualDeep = require_baseIsEqualDeep(), isObjectLike2 = requireIsObjectLike();
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike2(value) && !isObjectLike2(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    _baseIsEqual = baseIsEqual;
    return _baseIsEqual;
  }
  var _baseIsMatch;
  var hasRequired_baseIsMatch;
  function require_baseIsMatch() {
    if (hasRequired_baseIsMatch) return _baseIsMatch;
    hasRequired_baseIsMatch = 1;
    var Stack = require_Stack(), baseIsEqual = require_baseIsEqual();
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    function baseIsMatch(object, source, matchData, customizer) {
      var index2 = matchData.length, length = index2, noCustomizer = !customizer;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index2--) {
        var data = matchData[index2];
        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
          return false;
        }
      }
      while (++index2 < length) {
        data = matchData[index2];
        var key = data[0], objValue = object[key], srcValue = data[1];
        if (noCustomizer && data[2]) {
          if (objValue === void 0 && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack();
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
            return false;
          }
        }
      }
      return true;
    }
    _baseIsMatch = baseIsMatch;
    return _baseIsMatch;
  }
  var _isStrictComparable;
  var hasRequired_isStrictComparable;
  function require_isStrictComparable() {
    if (hasRequired_isStrictComparable) return _isStrictComparable;
    hasRequired_isStrictComparable = 1;
    var isObject2 = requireIsObject();
    function isStrictComparable(value) {
      return value === value && !isObject2(value);
    }
    _isStrictComparable = isStrictComparable;
    return _isStrictComparable;
  }
  var _getMatchData;
  var hasRequired_getMatchData;
  function require_getMatchData() {
    if (hasRequired_getMatchData) return _getMatchData;
    hasRequired_getMatchData = 1;
    var isStrictComparable = require_isStrictComparable(), keys = requireKeys();
    function getMatchData(object) {
      var result = keys(object), length = result.length;
      while (length--) {
        var key = result[length], value = object[key];
        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }
    _getMatchData = getMatchData;
    return _getMatchData;
  }
  var _matchesStrictComparable;
  var hasRequired_matchesStrictComparable;
  function require_matchesStrictComparable() {
    if (hasRequired_matchesStrictComparable) return _matchesStrictComparable;
    hasRequired_matchesStrictComparable = 1;
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
      };
    }
    _matchesStrictComparable = matchesStrictComparable;
    return _matchesStrictComparable;
  }
  var _baseMatches;
  var hasRequired_baseMatches;
  function require_baseMatches() {
    if (hasRequired_baseMatches) return _baseMatches;
    hasRequired_baseMatches = 1;
    var baseIsMatch = require_baseIsMatch(), getMatchData = require_getMatchData(), matchesStrictComparable = require_matchesStrictComparable();
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }
    _baseMatches = baseMatches;
    return _baseMatches;
  }
  var isSymbol_1;
  var hasRequiredIsSymbol;
  function requireIsSymbol() {
    if (hasRequiredIsSymbol) return isSymbol_1;
    hasRequiredIsSymbol = 1;
    var baseGetTag = require_baseGetTag(), isObjectLike2 = requireIsObjectLike();
    var symbolTag = "[object Symbol]";
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike2(value) && baseGetTag(value) == symbolTag;
    }
    isSymbol_1 = isSymbol;
    return isSymbol_1;
  }
  var _isKey;
  var hasRequired_isKey;
  function require_isKey() {
    if (hasRequired_isKey) return _isKey;
    hasRequired_isKey = 1;
    var isArray2 = requireIsArray(), isSymbol = requireIsSymbol();
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
    function isKey(value, object) {
      if (isArray2(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    _isKey = isKey;
    return _isKey;
  }
  var memoize_1;
  var hasRequiredMemoize;
  function requireMemoize() {
    if (hasRequiredMemoize) return memoize_1;
    hasRequiredMemoize = 1;
    var MapCache = require_MapCache();
    var FUNC_ERROR_TEXT = "Expected a function";
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver != null && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    memoize.Cache = MapCache;
    memoize_1 = memoize;
    return memoize_1;
  }
  var _memoizeCapped;
  var hasRequired_memoizeCapped;
  function require_memoizeCapped() {
    if (hasRequired_memoizeCapped) return _memoizeCapped;
    hasRequired_memoizeCapped = 1;
    var memoize = requireMemoize();
    var MAX_MEMOIZE_SIZE = 500;
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });
      var cache = result.cache;
      return result;
    }
    _memoizeCapped = memoizeCapped;
    return _memoizeCapped;
  }
  var _stringToPath;
  var hasRequired_stringToPath;
  function require_stringToPath() {
    if (hasRequired_stringToPath) return _stringToPath;
    hasRequired_stringToPath = 1;
    var memoizeCapped = require_memoizeCapped();
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    _stringToPath = stringToPath;
    return _stringToPath;
  }
  var _arrayMap;
  var hasRequired_arrayMap;
  function require_arrayMap() {
    if (hasRequired_arrayMap) return _arrayMap;
    hasRequired_arrayMap = 1;
    function arrayMap(array, iteratee) {
      var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index2 < length) {
        result[index2] = iteratee(array[index2], index2, array);
      }
      return result;
    }
    _arrayMap = arrayMap;
    return _arrayMap;
  }
  var _baseToString;
  var hasRequired_baseToString;
  function require_baseToString() {
    if (hasRequired_baseToString) return _baseToString;
    hasRequired_baseToString = 1;
    var Symbol2 = require_Symbol(), arrayMap = require_arrayMap(), isArray2 = requireIsArray(), isSymbol = requireIsSymbol();
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isArray2(value)) {
        return arrayMap(value, baseToString) + "";
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -Infinity ? "-0" : result;
    }
    _baseToString = baseToString;
    return _baseToString;
  }
  var toString_1;
  var hasRequiredToString;
  function requireToString() {
    if (hasRequiredToString) return toString_1;
    hasRequiredToString = 1;
    var baseToString = require_baseToString();
    function toString2(value) {
      return value == null ? "" : baseToString(value);
    }
    toString_1 = toString2;
    return toString_1;
  }
  var _castPath;
  var hasRequired_castPath;
  function require_castPath() {
    if (hasRequired_castPath) return _castPath;
    hasRequired_castPath = 1;
    var isArray2 = requireIsArray(), isKey = require_isKey(), stringToPath = require_stringToPath(), toString2 = requireToString();
    function castPath(value, object) {
      if (isArray2(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString2(value));
    }
    _castPath = castPath;
    return _castPath;
  }
  var _toKey;
  var hasRequired_toKey;
  function require_toKey() {
    if (hasRequired_toKey) return _toKey;
    hasRequired_toKey = 1;
    var isSymbol = requireIsSymbol();
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -Infinity ? "-0" : result;
    }
    _toKey = toKey;
    return _toKey;
  }
  var _baseGet;
  var hasRequired_baseGet;
  function require_baseGet() {
    if (hasRequired_baseGet) return _baseGet;
    hasRequired_baseGet = 1;
    var castPath = require_castPath(), toKey = require_toKey();
    function baseGet(object, path) {
      path = castPath(path, object);
      var index2 = 0, length = path.length;
      while (object != null && index2 < length) {
        object = object[toKey(path[index2++])];
      }
      return index2 && index2 == length ? object : void 0;
    }
    _baseGet = baseGet;
    return _baseGet;
  }
  var get_1;
  var hasRequiredGet;
  function requireGet() {
    if (hasRequiredGet) return get_1;
    hasRequiredGet = 1;
    var baseGet = require_baseGet();
    function get2(object, path, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path);
      return result === void 0 ? defaultValue : result;
    }
    get_1 = get2;
    return get_1;
  }
  var _baseHasIn;
  var hasRequired_baseHasIn;
  function require_baseHasIn() {
    if (hasRequired_baseHasIn) return _baseHasIn;
    hasRequired_baseHasIn = 1;
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }
    _baseHasIn = baseHasIn;
    return _baseHasIn;
  }
  var _hasPath;
  var hasRequired_hasPath;
  function require_hasPath() {
    if (hasRequired_hasPath) return _hasPath;
    hasRequired_hasPath = 1;
    var castPath = require_castPath(), isArguments = requireIsArguments(), isArray2 = requireIsArray(), isIndex = require_isIndex(), isLength = requireIsLength(), toKey = require_toKey();
    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);
      var index2 = -1, length = path.length, result = false;
      while (++index2 < length) {
        var key = toKey(path[index2]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index2 != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) && (isArray2(object) || isArguments(object));
    }
    _hasPath = hasPath;
    return _hasPath;
  }
  var hasIn_1;
  var hasRequiredHasIn;
  function requireHasIn() {
    if (hasRequiredHasIn) return hasIn_1;
    hasRequiredHasIn = 1;
    var baseHasIn = require_baseHasIn(), hasPath = require_hasPath();
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }
    hasIn_1 = hasIn;
    return hasIn_1;
  }
  var _baseMatchesProperty;
  var hasRequired_baseMatchesProperty;
  function require_baseMatchesProperty() {
    if (hasRequired_baseMatchesProperty) return _baseMatchesProperty;
    hasRequired_baseMatchesProperty = 1;
    var baseIsEqual = require_baseIsEqual(), get2 = requireGet(), hasIn = requireHasIn(), isKey = require_isKey(), isStrictComparable = require_isStrictComparable(), matchesStrictComparable = require_matchesStrictComparable(), toKey = require_toKey();
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get2(object, path);
        return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }
    _baseMatchesProperty = baseMatchesProperty;
    return _baseMatchesProperty;
  }
  var _baseProperty;
  var hasRequired_baseProperty;
  function require_baseProperty() {
    if (hasRequired_baseProperty) return _baseProperty;
    hasRequired_baseProperty = 1;
    function baseProperty(key) {
      return function(object) {
        return object == null ? void 0 : object[key];
      };
    }
    _baseProperty = baseProperty;
    return _baseProperty;
  }
  var _basePropertyDeep;
  var hasRequired_basePropertyDeep;
  function require_basePropertyDeep() {
    if (hasRequired_basePropertyDeep) return _basePropertyDeep;
    hasRequired_basePropertyDeep = 1;
    var baseGet = require_baseGet();
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }
    _basePropertyDeep = basePropertyDeep;
    return _basePropertyDeep;
  }
  var property_1;
  var hasRequiredProperty;
  function requireProperty() {
    if (hasRequiredProperty) return property_1;
    hasRequiredProperty = 1;
    var baseProperty = require_baseProperty(), basePropertyDeep = require_basePropertyDeep(), isKey = require_isKey(), toKey = require_toKey();
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }
    property_1 = property;
    return property_1;
  }
  var _baseIteratee;
  var hasRequired_baseIteratee;
  function require_baseIteratee() {
    if (hasRequired_baseIteratee) return _baseIteratee;
    hasRequired_baseIteratee = 1;
    var baseMatches = require_baseMatches(), baseMatchesProperty = require_baseMatchesProperty(), identity = requireIdentity(), isArray2 = requireIsArray(), property = requireProperty();
    function baseIteratee(value) {
      if (typeof value == "function") {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == "object") {
        return isArray2(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
      }
      return property(value);
    }
    _baseIteratee = baseIteratee;
    return _baseIteratee;
  }
  var filter_1;
  var hasRequiredFilter;
  function requireFilter() {
    if (hasRequiredFilter) return filter_1;
    hasRequiredFilter = 1;
    var arrayFilter = require_arrayFilter(), baseFilter = require_baseFilter(), baseIteratee = require_baseIteratee(), isArray2 = requireIsArray();
    function filter(collection, predicate) {
      var func = isArray2(collection) ? arrayFilter : baseFilter;
      return func(collection, baseIteratee(predicate, 3));
    }
    filter_1 = filter;
    return filter_1;
  }
  var _baseHas;
  var hasRequired_baseHas;
  function require_baseHas() {
    if (hasRequired_baseHas) return _baseHas;
    hasRequired_baseHas = 1;
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function baseHas(object, key) {
      return object != null && hasOwnProperty2.call(object, key);
    }
    _baseHas = baseHas;
    return _baseHas;
  }
  var has_1;
  var hasRequiredHas;
  function requireHas() {
    if (hasRequiredHas) return has_1;
    hasRequiredHas = 1;
    var baseHas = require_baseHas(), hasPath = require_hasPath();
    function has(object, path) {
      return object != null && hasPath(object, path, baseHas);
    }
    has_1 = has;
    return has_1;
  }
  var isEmpty_1;
  var hasRequiredIsEmpty;
  function requireIsEmpty() {
    if (hasRequiredIsEmpty) return isEmpty_1;
    hasRequiredIsEmpty = 1;
    var baseKeys = require_baseKeys(), getTag = require_getTag(), isArguments = requireIsArguments(), isArray2 = requireIsArray(), isArrayLike = requireIsArrayLike(), isBuffer2 = requireIsBuffer(), isPrototype = require_isPrototype(), isTypedArray = requireIsTypedArray();
    var mapTag = "[object Map]", setTag = "[object Set]";
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike(value) && (isArray2(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer2(value) || isTypedArray(value) || isArguments(value))) {
        return !value.length;
      }
      var tag = getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (isPrototype(value)) {
        return !baseKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty2.call(value, key)) {
          return false;
        }
      }
      return true;
    }
    isEmpty_1 = isEmpty;
    return isEmpty_1;
  }
  var isUndefined_1;
  var hasRequiredIsUndefined;
  function requireIsUndefined() {
    if (hasRequiredIsUndefined) return isUndefined_1;
    hasRequiredIsUndefined = 1;
    function isUndefined(value) {
      return value === void 0;
    }
    isUndefined_1 = isUndefined;
    return isUndefined_1;
  }
  var _baseMap;
  var hasRequired_baseMap;
  function require_baseMap() {
    if (hasRequired_baseMap) return _baseMap;
    hasRequired_baseMap = 1;
    var baseEach = require_baseEach(), isArrayLike = requireIsArrayLike();
    function baseMap(collection, iteratee) {
      var index2 = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
      baseEach(collection, function(value, key, collection2) {
        result[++index2] = iteratee(value, key, collection2);
      });
      return result;
    }
    _baseMap = baseMap;
    return _baseMap;
  }
  var map_1;
  var hasRequiredMap;
  function requireMap() {
    if (hasRequiredMap) return map_1;
    hasRequiredMap = 1;
    var arrayMap = require_arrayMap(), baseIteratee = require_baseIteratee(), baseMap = require_baseMap(), isArray2 = requireIsArray();
    function map(collection, iteratee) {
      var func = isArray2(collection) ? arrayMap : baseMap;
      return func(collection, baseIteratee(iteratee, 3));
    }
    map_1 = map;
    return map_1;
  }
  var _arrayReduce;
  var hasRequired_arrayReduce;
  function require_arrayReduce() {
    if (hasRequired_arrayReduce) return _arrayReduce;
    hasRequired_arrayReduce = 1;
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index2 = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index2];
      }
      while (++index2 < length) {
        accumulator = iteratee(accumulator, array[index2], index2, array);
      }
      return accumulator;
    }
    _arrayReduce = arrayReduce;
    return _arrayReduce;
  }
  var _baseReduce;
  var hasRequired_baseReduce;
  function require_baseReduce() {
    if (hasRequired_baseReduce) return _baseReduce;
    hasRequired_baseReduce = 1;
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index2, collection2) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index2, collection2);
      });
      return accumulator;
    }
    _baseReduce = baseReduce;
    return _baseReduce;
  }
  var reduce_1;
  var hasRequiredReduce;
  function requireReduce() {
    if (hasRequiredReduce) return reduce_1;
    hasRequiredReduce = 1;
    var arrayReduce = require_arrayReduce(), baseEach = require_baseEach(), baseIteratee = require_baseIteratee(), baseReduce = require_baseReduce(), isArray2 = requireIsArray();
    function reduce(collection, iteratee, accumulator) {
      var func = isArray2(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
      return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEach);
    }
    reduce_1 = reduce;
    return reduce_1;
  }
  var isString_1;
  var hasRequiredIsString;
  function requireIsString() {
    if (hasRequiredIsString) return isString_1;
    hasRequiredIsString = 1;
    var baseGetTag = require_baseGetTag(), isArray2 = requireIsArray(), isObjectLike2 = requireIsObjectLike();
    var stringTag = "[object String]";
    function isString2(value) {
      return typeof value == "string" || !isArray2(value) && isObjectLike2(value) && baseGetTag(value) == stringTag;
    }
    isString_1 = isString2;
    return isString_1;
  }
  var _asciiSize;
  var hasRequired_asciiSize;
  function require_asciiSize() {
    if (hasRequired_asciiSize) return _asciiSize;
    hasRequired_asciiSize = 1;
    var baseProperty = require_baseProperty();
    var asciiSize = baseProperty("length");
    _asciiSize = asciiSize;
    return _asciiSize;
  }
  var _hasUnicode;
  var hasRequired_hasUnicode;
  function require_hasUnicode() {
    if (hasRequired_hasUnicode) return _hasUnicode;
    hasRequired_hasUnicode = 1;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsVarRange = "\\ufe0e\\ufe0f";
    var rsZWJ = "\\u200d";
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    _hasUnicode = hasUnicode;
    return _hasUnicode;
  }
  var _unicodeSize;
  var hasRequired_unicodeSize;
  function require_unicodeSize() {
    if (hasRequired_unicodeSize) return _unicodeSize;
    hasRequired_unicodeSize = 1;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsVarRange = "\\ufe0e\\ufe0f";
    var rsAstral = "[" + rsAstralRange + "]", rsCombo = "[" + rsComboRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsZWJ = "\\u200d";
    var reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }
    _unicodeSize = unicodeSize;
    return _unicodeSize;
  }
  var _stringSize;
  var hasRequired_stringSize;
  function require_stringSize() {
    if (hasRequired_stringSize) return _stringSize;
    hasRequired_stringSize = 1;
    var asciiSize = require_asciiSize(), hasUnicode = require_hasUnicode(), unicodeSize = require_unicodeSize();
    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    _stringSize = stringSize;
    return _stringSize;
  }
  var size_1;
  var hasRequiredSize;
  function requireSize() {
    if (hasRequiredSize) return size_1;
    hasRequiredSize = 1;
    var baseKeys = require_baseKeys(), getTag = require_getTag(), isArrayLike = requireIsArrayLike(), isString2 = requireIsString(), stringSize = require_stringSize();
    var mapTag = "[object Map]", setTag = "[object Set]";
    function size(collection) {
      if (collection == null) {
        return 0;
      }
      if (isArrayLike(collection)) {
        return isString2(collection) ? stringSize(collection) : collection.length;
      }
      var tag = getTag(collection);
      if (tag == mapTag || tag == setTag) {
        return collection.size;
      }
      return baseKeys(collection).length;
    }
    size_1 = size;
    return size_1;
  }
  var transform_1;
  var hasRequiredTransform;
  function requireTransform() {
    if (hasRequiredTransform) return transform_1;
    hasRequiredTransform = 1;
    var arrayEach = require_arrayEach(), baseCreate = require_baseCreate(), baseForOwn = require_baseForOwn(), baseIteratee = require_baseIteratee(), getPrototype = require_getPrototype(), isArray2 = requireIsArray(), isBuffer2 = requireIsBuffer(), isFunction2 = requireIsFunction(), isObject2 = requireIsObject(), isTypedArray = requireIsTypedArray();
    function transform(object, iteratee, accumulator) {
      var isArr = isArray2(object), isArrLike = isArr || isBuffer2(object) || isTypedArray(object);
      iteratee = baseIteratee(iteratee, 4);
      if (accumulator == null) {
        var Ctor = object && object.constructor;
        if (isArrLike) {
          accumulator = isArr ? new Ctor() : [];
        } else if (isObject2(object)) {
          accumulator = isFunction2(Ctor) ? baseCreate(getPrototype(object)) : {};
        } else {
          accumulator = {};
        }
      }
      (isArrLike ? arrayEach : baseForOwn)(object, function(value, index2, object2) {
        return iteratee(accumulator, value, index2, object2);
      });
      return accumulator;
    }
    transform_1 = transform;
    return transform_1;
  }
  var _isFlattenable;
  var hasRequired_isFlattenable;
  function require_isFlattenable() {
    if (hasRequired_isFlattenable) return _isFlattenable;
    hasRequired_isFlattenable = 1;
    var Symbol2 = require_Symbol(), isArguments = requireIsArguments(), isArray2 = requireIsArray();
    var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0;
    function isFlattenable(value) {
      return isArray2(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
    }
    _isFlattenable = isFlattenable;
    return _isFlattenable;
  }
  var _baseFlatten;
  var hasRequired_baseFlatten;
  function require_baseFlatten() {
    if (hasRequired_baseFlatten) return _baseFlatten;
    hasRequired_baseFlatten = 1;
    var arrayPush = require_arrayPush(), isFlattenable = require_isFlattenable();
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index2 = -1, length = array.length;
      predicate || (predicate = isFlattenable);
      result || (result = []);
      while (++index2 < length) {
        var value = array[index2];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }
    _baseFlatten = baseFlatten;
    return _baseFlatten;
  }
  var _apply;
  var hasRequired_apply;
  function require_apply() {
    if (hasRequired_apply) return _apply;
    hasRequired_apply = 1;
    function apply2(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    _apply = apply2;
    return _apply;
  }
  var _overRest;
  var hasRequired_overRest;
  function require_overRest() {
    if (hasRequired_overRest) return _overRest;
    hasRequired_overRest = 1;
    var apply2 = require_apply();
    var nativeMax = Math.max;
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index2 = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index2 < length) {
          array[index2] = args[start + index2];
        }
        index2 = -1;
        var otherArgs = Array(start + 1);
        while (++index2 < start) {
          otherArgs[index2] = args[index2];
        }
        otherArgs[start] = transform(array);
        return apply2(func, this, otherArgs);
      };
    }
    _overRest = overRest;
    return _overRest;
  }
  var _baseSetToString;
  var hasRequired_baseSetToString;
  function require_baseSetToString() {
    if (hasRequired_baseSetToString) return _baseSetToString;
    hasRequired_baseSetToString = 1;
    var constant2 = requireConstant(), defineProperty = require_defineProperty(), identity = requireIdentity();
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant2(string),
        "writable": true
      });
    };
    _baseSetToString = baseSetToString;
    return _baseSetToString;
  }
  var _shortOut;
  var hasRequired_shortOut;
  function require_shortOut() {
    if (hasRequired_shortOut) return _shortOut;
    hasRequired_shortOut = 1;
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var nativeNow = Date.now;
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    _shortOut = shortOut;
    return _shortOut;
  }
  var _setToString;
  var hasRequired_setToString;
  function require_setToString() {
    if (hasRequired_setToString) return _setToString;
    hasRequired_setToString = 1;
    var baseSetToString = require_baseSetToString(), shortOut = require_shortOut();
    var setToString = shortOut(baseSetToString);
    _setToString = setToString;
    return _setToString;
  }
  var _baseRest;
  var hasRequired_baseRest;
  function require_baseRest() {
    if (hasRequired_baseRest) return _baseRest;
    hasRequired_baseRest = 1;
    var identity = requireIdentity(), overRest = require_overRest(), setToString = require_setToString();
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    _baseRest = baseRest;
    return _baseRest;
  }
  var _baseFindIndex;
  var hasRequired_baseFindIndex;
  function require_baseFindIndex() {
    if (hasRequired_baseFindIndex) return _baseFindIndex;
    hasRequired_baseFindIndex = 1;
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index2 = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index2-- : ++index2 < length) {
        if (predicate(array[index2], index2, array)) {
          return index2;
        }
      }
      return -1;
    }
    _baseFindIndex = baseFindIndex;
    return _baseFindIndex;
  }
  var _baseIsNaN;
  var hasRequired_baseIsNaN;
  function require_baseIsNaN() {
    if (hasRequired_baseIsNaN) return _baseIsNaN;
    hasRequired_baseIsNaN = 1;
    function baseIsNaN(value) {
      return value !== value;
    }
    _baseIsNaN = baseIsNaN;
    return _baseIsNaN;
  }
  var _strictIndexOf;
  var hasRequired_strictIndexOf;
  function require_strictIndexOf() {
    if (hasRequired_strictIndexOf) return _strictIndexOf;
    hasRequired_strictIndexOf = 1;
    function strictIndexOf(array, value, fromIndex) {
      var index2 = fromIndex - 1, length = array.length;
      while (++index2 < length) {
        if (array[index2] === value) {
          return index2;
        }
      }
      return -1;
    }
    _strictIndexOf = strictIndexOf;
    return _strictIndexOf;
  }
  var _baseIndexOf;
  var hasRequired_baseIndexOf;
  function require_baseIndexOf() {
    if (hasRequired_baseIndexOf) return _baseIndexOf;
    hasRequired_baseIndexOf = 1;
    var baseFindIndex = require_baseFindIndex(), baseIsNaN = require_baseIsNaN(), strictIndexOf = require_strictIndexOf();
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    _baseIndexOf = baseIndexOf;
    return _baseIndexOf;
  }
  var _arrayIncludes;
  var hasRequired_arrayIncludes;
  function require_arrayIncludes() {
    if (hasRequired_arrayIncludes) return _arrayIncludes;
    hasRequired_arrayIncludes = 1;
    var baseIndexOf = require_baseIndexOf();
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }
    _arrayIncludes = arrayIncludes;
    return _arrayIncludes;
  }
  var _arrayIncludesWith;
  var hasRequired_arrayIncludesWith;
  function require_arrayIncludesWith() {
    if (hasRequired_arrayIncludesWith) return _arrayIncludesWith;
    hasRequired_arrayIncludesWith = 1;
    function arrayIncludesWith(array, value, comparator) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (comparator(value, array[index2])) {
          return true;
        }
      }
      return false;
    }
    _arrayIncludesWith = arrayIncludesWith;
    return _arrayIncludesWith;
  }
  var noop_1;
  var hasRequiredNoop;
  function requireNoop() {
    if (hasRequiredNoop) return noop_1;
    hasRequiredNoop = 1;
    function noop2() {
    }
    noop_1 = noop2;
    return noop_1;
  }
  var _createSet;
  var hasRequired_createSet;
  function require_createSet() {
    if (hasRequired_createSet) return _createSet;
    hasRequired_createSet = 1;
    var Set2 = require_Set(), noop2 = requireNoop(), setToArray = require_setToArray();
    var INFINITY = 1 / 0;
    var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop2 : function(values) {
      return new Set2(values);
    };
    _createSet = createSet;
    return _createSet;
  }
  var _baseUniq;
  var hasRequired_baseUniq;
  function require_baseUniq() {
    if (hasRequired_baseUniq) return _baseUniq;
    hasRequired_baseUniq = 1;
    var SetCache = require_SetCache(), arrayIncludes = require_arrayIncludes(), arrayIncludesWith = require_arrayIncludesWith(), cacheHas = require_cacheHas(), createSet = require_createSet(), setToArray = require_setToArray();
    var LARGE_ARRAY_SIZE = 200;
    function baseUniq(array, iteratee, comparator) {
      var index2 = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
      if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
      } else if (length >= LARGE_ARRAY_SIZE) {
        var set2 = iteratee ? null : createSet(array);
        if (set2) {
          return setToArray(set2);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache();
      } else {
        seen = iteratee ? [] : result;
      }
      outer:
        while (++index2 < length) {
          var value = array[index2], computed = iteratee ? iteratee(value) : value;
          value = comparator || value !== 0 ? value : 0;
          if (isCommon && computed === computed) {
            var seenIndex = seen.length;
            while (seenIndex--) {
              if (seen[seenIndex] === computed) {
                continue outer;
              }
            }
            if (iteratee) {
              seen.push(computed);
            }
            result.push(value);
          } else if (!includes(seen, computed, comparator)) {
            if (seen !== result) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
      return result;
    }
    _baseUniq = baseUniq;
    return _baseUniq;
  }
  var isArrayLikeObject_1;
  var hasRequiredIsArrayLikeObject;
  function requireIsArrayLikeObject() {
    if (hasRequiredIsArrayLikeObject) return isArrayLikeObject_1;
    hasRequiredIsArrayLikeObject = 1;
    var isArrayLike = requireIsArrayLike(), isObjectLike2 = requireIsObjectLike();
    function isArrayLikeObject(value) {
      return isObjectLike2(value) && isArrayLike(value);
    }
    isArrayLikeObject_1 = isArrayLikeObject;
    return isArrayLikeObject_1;
  }
  var union_1;
  var hasRequiredUnion;
  function requireUnion() {
    if (hasRequiredUnion) return union_1;
    hasRequiredUnion = 1;
    var baseFlatten = require_baseFlatten(), baseRest = require_baseRest(), baseUniq = require_baseUniq(), isArrayLikeObject = requireIsArrayLikeObject();
    var union = baseRest(function(arrays) {
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
    });
    union_1 = union;
    return union_1;
  }
  var _baseValues;
  var hasRequired_baseValues;
  function require_baseValues() {
    if (hasRequired_baseValues) return _baseValues;
    hasRequired_baseValues = 1;
    var arrayMap = require_arrayMap();
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    _baseValues = baseValues;
    return _baseValues;
  }
  var values_1;
  var hasRequiredValues;
  function requireValues() {
    if (hasRequiredValues) return values_1;
    hasRequiredValues = 1;
    var baseValues = require_baseValues(), keys = requireKeys();
    function values(object) {
      return object == null ? [] : baseValues(object, keys(object));
    }
    values_1 = values;
    return values_1;
  }
  var lodash_1$1;
  var hasRequiredLodash;
  function requireLodash() {
    if (hasRequiredLodash) return lodash_1$1;
    hasRequiredLodash = 1;
    var lodash2;
    if (typeof commonjsRequire === "function") {
      try {
        lodash2 = {
          clone: requireClone(),
          constant: requireConstant(),
          each: requireEach(),
          filter: requireFilter(),
          has: requireHas(),
          isArray: requireIsArray(),
          isEmpty: requireIsEmpty(),
          isFunction: requireIsFunction(),
          isUndefined: requireIsUndefined(),
          keys: requireKeys(),
          map: requireMap(),
          reduce: requireReduce(),
          size: requireSize(),
          transform: requireTransform(),
          union: requireUnion(),
          values: requireValues()
        };
      } catch (e) {
      }
    }
    if (!lodash2) {
      lodash2 = window._;
    }
    lodash_1$1 = lodash2;
    return lodash_1$1;
  }
  var graph;
  var hasRequiredGraph;
  function requireGraph() {
    if (hasRequiredGraph) return graph;
    hasRequiredGraph = 1;
    var _2 = requireLodash();
    graph = Graph2;
    var DEFAULT_EDGE_NAME = "\0";
    var GRAPH_NODE = "\0";
    var EDGE_KEY_DELIM = "";
    function Graph2(opts) {
      this._isDirected = _2.has(opts, "directed") ? opts.directed : true;
      this._isMultigraph = _2.has(opts, "multigraph") ? opts.multigraph : false;
      this._isCompound = _2.has(opts, "compound") ? opts.compound : false;
      this._label = void 0;
      this._defaultNodeLabelFn = _2.constant(void 0);
      this._defaultEdgeLabelFn = _2.constant(void 0);
      this._nodes = {};
      if (this._isCompound) {
        this._parent = {};
        this._children = {};
        this._children[GRAPH_NODE] = {};
      }
      this._in = {};
      this._preds = {};
      this._out = {};
      this._sucs = {};
      this._edgeObjs = {};
      this._edgeLabels = {};
    }
    Graph2.prototype._nodeCount = 0;
    Graph2.prototype._edgeCount = 0;
    Graph2.prototype.isDirected = function() {
      return this._isDirected;
    };
    Graph2.prototype.isMultigraph = function() {
      return this._isMultigraph;
    };
    Graph2.prototype.isCompound = function() {
      return this._isCompound;
    };
    Graph2.prototype.setGraph = function(label) {
      this._label = label;
      return this;
    };
    Graph2.prototype.graph = function() {
      return this._label;
    };
    Graph2.prototype.setDefaultNodeLabel = function(newDefault) {
      if (!_2.isFunction(newDefault)) {
        newDefault = _2.constant(newDefault);
      }
      this._defaultNodeLabelFn = newDefault;
      return this;
    };
    Graph2.prototype.nodeCount = function() {
      return this._nodeCount;
    };
    Graph2.prototype.nodes = function() {
      return _2.keys(this._nodes);
    };
    Graph2.prototype.sources = function() {
      var self2 = this;
      return _2.filter(this.nodes(), function(v) {
        return _2.isEmpty(self2._in[v]);
      });
    };
    Graph2.prototype.sinks = function() {
      var self2 = this;
      return _2.filter(this.nodes(), function(v) {
        return _2.isEmpty(self2._out[v]);
      });
    };
    Graph2.prototype.setNodes = function(vs, value) {
      var args = arguments;
      var self2 = this;
      _2.each(vs, function(v) {
        if (args.length > 1) {
          self2.setNode(v, value);
        } else {
          self2.setNode(v);
        }
      });
      return this;
    };
    Graph2.prototype.setNode = function(v, value) {
      if (_2.has(this._nodes, v)) {
        if (arguments.length > 1) {
          this._nodes[v] = value;
        }
        return this;
      }
      this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
      if (this._isCompound) {
        this._parent[v] = GRAPH_NODE;
        this._children[v] = {};
        this._children[GRAPH_NODE][v] = true;
      }
      this._in[v] = {};
      this._preds[v] = {};
      this._out[v] = {};
      this._sucs[v] = {};
      ++this._nodeCount;
      return this;
    };
    Graph2.prototype.node = function(v) {
      return this._nodes[v];
    };
    Graph2.prototype.hasNode = function(v) {
      return _2.has(this._nodes, v);
    };
    Graph2.prototype.removeNode = function(v) {
      var self2 = this;
      if (_2.has(this._nodes, v)) {
        var removeEdge = function(e) {
          self2.removeEdge(self2._edgeObjs[e]);
        };
        delete this._nodes[v];
        if (this._isCompound) {
          this._removeFromParentsChildList(v);
          delete this._parent[v];
          _2.each(this.children(v), function(child) {
            self2.setParent(child);
          });
          delete this._children[v];
        }
        _2.each(_2.keys(this._in[v]), removeEdge);
        delete this._in[v];
        delete this._preds[v];
        _2.each(_2.keys(this._out[v]), removeEdge);
        delete this._out[v];
        delete this._sucs[v];
        --this._nodeCount;
      }
      return this;
    };
    Graph2.prototype.setParent = function(v, parent) {
      if (!this._isCompound) {
        throw new Error("Cannot set parent in a non-compound graph");
      }
      if (_2.isUndefined(parent)) {
        parent = GRAPH_NODE;
      } else {
        parent += "";
        for (var ancestor = parent; !_2.isUndefined(ancestor); ancestor = this.parent(ancestor)) {
          if (ancestor === v) {
            throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
          }
        }
        this.setNode(parent);
      }
      this.setNode(v);
      this._removeFromParentsChildList(v);
      this._parent[v] = parent;
      this._children[parent][v] = true;
      return this;
    };
    Graph2.prototype._removeFromParentsChildList = function(v) {
      delete this._children[this._parent[v]][v];
    };
    Graph2.prototype.parent = function(v) {
      if (this._isCompound) {
        var parent = this._parent[v];
        if (parent !== GRAPH_NODE) {
          return parent;
        }
      }
    };
    Graph2.prototype.children = function(v) {
      if (_2.isUndefined(v)) {
        v = GRAPH_NODE;
      }
      if (this._isCompound) {
        var children = this._children[v];
        if (children) {
          return _2.keys(children);
        }
      } else if (v === GRAPH_NODE) {
        return this.nodes();
      } else if (this.hasNode(v)) {
        return [];
      }
    };
    Graph2.prototype.predecessors = function(v) {
      var predsV = this._preds[v];
      if (predsV) {
        return _2.keys(predsV);
      }
    };
    Graph2.prototype.successors = function(v) {
      var sucsV = this._sucs[v];
      if (sucsV) {
        return _2.keys(sucsV);
      }
    };
    Graph2.prototype.neighbors = function(v) {
      var preds = this.predecessors(v);
      if (preds) {
        return _2.union(preds, this.successors(v));
      }
    };
    Graph2.prototype.isLeaf = function(v) {
      var neighbors;
      if (this.isDirected()) {
        neighbors = this.successors(v);
      } else {
        neighbors = this.neighbors(v);
      }
      return neighbors.length === 0;
    };
    Graph2.prototype.filterNodes = function(filter) {
      var copy = new this.constructor({
        directed: this._isDirected,
        multigraph: this._isMultigraph,
        compound: this._isCompound
      });
      copy.setGraph(this.graph());
      var self2 = this;
      _2.each(this._nodes, function(value, v) {
        if (filter(v)) {
          copy.setNode(v, value);
        }
      });
      _2.each(this._edgeObjs, function(e) {
        if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
          copy.setEdge(e, self2.edge(e));
        }
      });
      var parents = {};
      function findParent(v) {
        var parent = self2.parent(v);
        if (parent === void 0 || copy.hasNode(parent)) {
          parents[v] = parent;
          return parent;
        } else if (parent in parents) {
          return parents[parent];
        } else {
          return findParent(parent);
        }
      }
      if (this._isCompound) {
        _2.each(copy.nodes(), function(v) {
          copy.setParent(v, findParent(v));
        });
      }
      return copy;
    };
    Graph2.prototype.setDefaultEdgeLabel = function(newDefault) {
      if (!_2.isFunction(newDefault)) {
        newDefault = _2.constant(newDefault);
      }
      this._defaultEdgeLabelFn = newDefault;
      return this;
    };
    Graph2.prototype.edgeCount = function() {
      return this._edgeCount;
    };
    Graph2.prototype.edges = function() {
      return _2.values(this._edgeObjs);
    };
    Graph2.prototype.setPath = function(vs, value) {
      var self2 = this;
      var args = arguments;
      _2.reduce(vs, function(v, w) {
        if (args.length > 1) {
          self2.setEdge(v, w, value);
        } else {
          self2.setEdge(v, w);
        }
        return w;
      });
      return this;
    };
    Graph2.prototype.setEdge = function() {
      var v, w, name, value;
      var valueSpecified = false;
      var arg0 = arguments[0];
      if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
        v = arg0.v;
        w = arg0.w;
        name = arg0.name;
        if (arguments.length === 2) {
          value = arguments[1];
          valueSpecified = true;
        }
      } else {
        v = arg0;
        w = arguments[1];
        name = arguments[3];
        if (arguments.length > 2) {
          value = arguments[2];
          valueSpecified = true;
        }
      }
      v = "" + v;
      w = "" + w;
      if (!_2.isUndefined(name)) {
        name = "" + name;
      }
      var e = edgeArgsToId(this._isDirected, v, w, name);
      if (_2.has(this._edgeLabels, e)) {
        if (valueSpecified) {
          this._edgeLabels[e] = value;
        }
        return this;
      }
      if (!_2.isUndefined(name) && !this._isMultigraph) {
        throw new Error("Cannot set a named edge when isMultigraph = false");
      }
      this.setNode(v);
      this.setNode(w);
      this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
      var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
      v = edgeObj.v;
      w = edgeObj.w;
      Object.freeze(edgeObj);
      this._edgeObjs[e] = edgeObj;
      incrementOrInitEntry(this._preds[w], v);
      incrementOrInitEntry(this._sucs[v], w);
      this._in[w][e] = edgeObj;
      this._out[v][e] = edgeObj;
      this._edgeCount++;
      return this;
    };
    Graph2.prototype.edge = function(v, w, name) {
      var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
      return this._edgeLabels[e];
    };
    Graph2.prototype.hasEdge = function(v, w, name) {
      var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
      return _2.has(this._edgeLabels, e);
    };
    Graph2.prototype.removeEdge = function(v, w, name) {
      var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
      var edge = this._edgeObjs[e];
      if (edge) {
        v = edge.v;
        w = edge.w;
        delete this._edgeLabels[e];
        delete this._edgeObjs[e];
        decrementOrRemoveEntry(this._preds[w], v);
        decrementOrRemoveEntry(this._sucs[v], w);
        delete this._in[w][e];
        delete this._out[v][e];
        this._edgeCount--;
      }
      return this;
    };
    Graph2.prototype.inEdges = function(v, u) {
      var inV = this._in[v];
      if (inV) {
        var edges = _2.values(inV);
        if (!u) {
          return edges;
        }
        return _2.filter(edges, function(edge) {
          return edge.v === u;
        });
      }
    };
    Graph2.prototype.outEdges = function(v, w) {
      var outV = this._out[v];
      if (outV) {
        var edges = _2.values(outV);
        if (!w) {
          return edges;
        }
        return _2.filter(edges, function(edge) {
          return edge.w === w;
        });
      }
    };
    Graph2.prototype.nodeEdges = function(v, w) {
      var inEdges = this.inEdges(v, w);
      if (inEdges) {
        return inEdges.concat(this.outEdges(v, w));
      }
    };
    function incrementOrInitEntry(map, k) {
      if (map[k]) {
        map[k]++;
      } else {
        map[k] = 1;
      }
    }
    function decrementOrRemoveEntry(map, k) {
      if (!--map[k]) {
        delete map[k];
      }
    }
    function edgeArgsToId(isDirected, v_, w_, name) {
      var v = "" + v_;
      var w = "" + w_;
      if (!isDirected && v > w) {
        var tmp = v;
        v = w;
        w = tmp;
      }
      return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (_2.isUndefined(name) ? DEFAULT_EDGE_NAME : name);
    }
    function edgeArgsToObj(isDirected, v_, w_, name) {
      var v = "" + v_;
      var w = "" + w_;
      if (!isDirected && v > w) {
        var tmp = v;
        v = w;
        w = tmp;
      }
      var edgeObj = { v, w };
      if (name) {
        edgeObj.name = name;
      }
      return edgeObj;
    }
    function edgeObjToId(isDirected, edgeObj) {
      return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
    }
    return graph;
  }
  var version$1;
  var hasRequiredVersion;
  function requireVersion() {
    if (hasRequiredVersion) return version$1;
    hasRequiredVersion = 1;
    version$1 = "2.1.8";
    return version$1;
  }
  var lib;
  var hasRequiredLib;
  function requireLib() {
    if (hasRequiredLib) return lib;
    hasRequiredLib = 1;
    lib = {
      Graph: requireGraph(),
      version: requireVersion()
    };
    return lib;
  }
  var json;
  var hasRequiredJson;
  function requireJson() {
    if (hasRequiredJson) return json;
    hasRequiredJson = 1;
    var _2 = requireLodash();
    var Graph2 = requireGraph();
    json = {
      write,
      read
    };
    function write(g) {
      var json2 = {
        options: {
          directed: g.isDirected(),
          multigraph: g.isMultigraph(),
          compound: g.isCompound()
        },
        nodes: writeNodes(g),
        edges: writeEdges(g)
      };
      if (!_2.isUndefined(g.graph())) {
        json2.value = _2.clone(g.graph());
      }
      return json2;
    }
    function writeNodes(g) {
      return _2.map(g.nodes(), function(v) {
        var nodeValue = g.node(v);
        var parent = g.parent(v);
        var node = { v };
        if (!_2.isUndefined(nodeValue)) {
          node.value = nodeValue;
        }
        if (!_2.isUndefined(parent)) {
          node.parent = parent;
        }
        return node;
      });
    }
    function writeEdges(g) {
      return _2.map(g.edges(), function(e) {
        var edgeValue = g.edge(e);
        var edge = { v: e.v, w: e.w };
        if (!_2.isUndefined(e.name)) {
          edge.name = e.name;
        }
        if (!_2.isUndefined(edgeValue)) {
          edge.value = edgeValue;
        }
        return edge;
      });
    }
    function read(json2) {
      var g = new Graph2(json2.options).setGraph(json2.value);
      _2.each(json2.nodes, function(entry) {
        g.setNode(entry.v, entry.value);
        if (entry.parent) {
          g.setParent(entry.v, entry.parent);
        }
      });
      _2.each(json2.edges, function(entry) {
        g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
      });
      return g;
    }
    return json;
  }
  var components_1;
  var hasRequiredComponents;
  function requireComponents() {
    if (hasRequiredComponents) return components_1;
    hasRequiredComponents = 1;
    var _2 = requireLodash();
    components_1 = components;
    function components(g) {
      var visited = {};
      var cmpts = [];
      var cmpt;
      function dfs2(v) {
        if (_2.has(visited, v)) return;
        visited[v] = true;
        cmpt.push(v);
        _2.each(g.successors(v), dfs2);
        _2.each(g.predecessors(v), dfs2);
      }
      _2.each(g.nodes(), function(v) {
        cmpt = [];
        dfs2(v);
        if (cmpt.length) {
          cmpts.push(cmpt);
        }
      });
      return cmpts;
    }
    return components_1;
  }
  var priorityQueue;
  var hasRequiredPriorityQueue;
  function requirePriorityQueue() {
    if (hasRequiredPriorityQueue) return priorityQueue;
    hasRequiredPriorityQueue = 1;
    var _2 = requireLodash();
    priorityQueue = PriorityQueue;
    function PriorityQueue() {
      this._arr = [];
      this._keyIndices = {};
    }
    PriorityQueue.prototype.size = function() {
      return this._arr.length;
    };
    PriorityQueue.prototype.keys = function() {
      return this._arr.map(function(x2) {
        return x2.key;
      });
    };
    PriorityQueue.prototype.has = function(key) {
      return _2.has(this._keyIndices, key);
    };
    PriorityQueue.prototype.priority = function(key) {
      var index2 = this._keyIndices[key];
      if (index2 !== void 0) {
        return this._arr[index2].priority;
      }
    };
    PriorityQueue.prototype.min = function() {
      if (this.size() === 0) {
        throw new Error("Queue underflow");
      }
      return this._arr[0].key;
    };
    PriorityQueue.prototype.add = function(key, priority) {
      var keyIndices = this._keyIndices;
      key = String(key);
      if (!_2.has(keyIndices, key)) {
        var arr = this._arr;
        var index2 = arr.length;
        keyIndices[key] = index2;
        arr.push({ key, priority });
        this._decrease(index2);
        return true;
      }
      return false;
    };
    PriorityQueue.prototype.removeMin = function() {
      this._swap(0, this._arr.length - 1);
      var min2 = this._arr.pop();
      delete this._keyIndices[min2.key];
      this._heapify(0);
      return min2.key;
    };
    PriorityQueue.prototype.decrease = function(key, priority) {
      var index2 = this._keyIndices[key];
      if (priority > this._arr[index2].priority) {
        throw new Error("New priority is greater than current priority. Key: " + key + " Old: " + this._arr[index2].priority + " New: " + priority);
      }
      this._arr[index2].priority = priority;
      this._decrease(index2);
    };
    PriorityQueue.prototype._heapify = function(i) {
      var arr = this._arr;
      var l = 2 * i;
      var r = l + 1;
      var largest = i;
      if (l < arr.length) {
        largest = arr[l].priority < arr[largest].priority ? l : largest;
        if (r < arr.length) {
          largest = arr[r].priority < arr[largest].priority ? r : largest;
        }
        if (largest !== i) {
          this._swap(i, largest);
          this._heapify(largest);
        }
      }
    };
    PriorityQueue.prototype._decrease = function(index2) {
      var arr = this._arr;
      var priority = arr[index2].priority;
      var parent;
      while (index2 !== 0) {
        parent = index2 >> 1;
        if (arr[parent].priority < priority) {
          break;
        }
        this._swap(index2, parent);
        index2 = parent;
      }
    };
    PriorityQueue.prototype._swap = function(i, j) {
      var arr = this._arr;
      var keyIndices = this._keyIndices;
      var origArrI = arr[i];
      var origArrJ = arr[j];
      arr[i] = origArrJ;
      arr[j] = origArrI;
      keyIndices[origArrJ.key] = i;
      keyIndices[origArrI.key] = j;
    };
    return priorityQueue;
  }
  var dijkstra_1;
  var hasRequiredDijkstra;
  function requireDijkstra() {
    if (hasRequiredDijkstra) return dijkstra_1;
    hasRequiredDijkstra = 1;
    var _2 = requireLodash();
    var PriorityQueue = requirePriorityQueue();
    dijkstra_1 = dijkstra;
    var DEFAULT_WEIGHT_FUNC = _2.constant(1);
    function dijkstra(g, source, weightFn, edgeFn) {
      return runDijkstra(
        g,
        String(source),
        weightFn || DEFAULT_WEIGHT_FUNC,
        edgeFn || function(v) {
          return g.outEdges(v);
        }
      );
    }
    function runDijkstra(g, source, weightFn, edgeFn) {
      var results = {};
      var pq = new PriorityQueue();
      var v, vEntry;
      var updateNeighbors = function(edge) {
        var w = edge.v !== v ? edge.v : edge.w;
        var wEntry = results[w];
        var weight = weightFn(edge);
        var distance2 = vEntry.distance + weight;
        if (weight < 0) {
          throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + edge + " Weight: " + weight);
        }
        if (distance2 < wEntry.distance) {
          wEntry.distance = distance2;
          wEntry.predecessor = v;
          pq.decrease(w, distance2);
        }
      };
      g.nodes().forEach(function(v2) {
        var distance2 = v2 === source ? 0 : Number.POSITIVE_INFINITY;
        results[v2] = { distance: distance2 };
        pq.add(v2, distance2);
      });
      while (pq.size() > 0) {
        v = pq.removeMin();
        vEntry = results[v];
        if (vEntry.distance === Number.POSITIVE_INFINITY) {
          break;
        }
        edgeFn(v).forEach(updateNeighbors);
      }
      return results;
    }
    return dijkstra_1;
  }
  var dijkstraAll_1;
  var hasRequiredDijkstraAll;
  function requireDijkstraAll() {
    if (hasRequiredDijkstraAll) return dijkstraAll_1;
    hasRequiredDijkstraAll = 1;
    var dijkstra = requireDijkstra();
    var _2 = requireLodash();
    dijkstraAll_1 = dijkstraAll;
    function dijkstraAll(g, weightFunc, edgeFunc) {
      return _2.transform(g.nodes(), function(acc, v) {
        acc[v] = dijkstra(g, v, weightFunc, edgeFunc);
      }, {});
    }
    return dijkstraAll_1;
  }
  var tarjan_1;
  var hasRequiredTarjan;
  function requireTarjan() {
    if (hasRequiredTarjan) return tarjan_1;
    hasRequiredTarjan = 1;
    var _2 = requireLodash();
    tarjan_1 = tarjan;
    function tarjan(g) {
      var index2 = 0;
      var stack = [];
      var visited = {};
      var results = [];
      function dfs2(v) {
        var entry = visited[v] = {
          onStack: true,
          lowlink: index2,
          index: index2++
        };
        stack.push(v);
        g.successors(v).forEach(function(w2) {
          if (!_2.has(visited, w2)) {
            dfs2(w2);
            entry.lowlink = Math.min(entry.lowlink, visited[w2].lowlink);
          } else if (visited[w2].onStack) {
            entry.lowlink = Math.min(entry.lowlink, visited[w2].index);
          }
        });
        if (entry.lowlink === entry.index) {
          var cmpt = [];
          var w;
          do {
            w = stack.pop();
            visited[w].onStack = false;
            cmpt.push(w);
          } while (v !== w);
          results.push(cmpt);
        }
      }
      g.nodes().forEach(function(v) {
        if (!_2.has(visited, v)) {
          dfs2(v);
        }
      });
      return results;
    }
    return tarjan_1;
  }
  var findCycles_1;
  var hasRequiredFindCycles;
  function requireFindCycles() {
    if (hasRequiredFindCycles) return findCycles_1;
    hasRequiredFindCycles = 1;
    var _2 = requireLodash();
    var tarjan = requireTarjan();
    findCycles_1 = findCycles;
    function findCycles(g) {
      return _2.filter(tarjan(g), function(cmpt) {
        return cmpt.length > 1 || cmpt.length === 1 && g.hasEdge(cmpt[0], cmpt[0]);
      });
    }
    return findCycles_1;
  }
  var floydWarshall_1;
  var hasRequiredFloydWarshall;
  function requireFloydWarshall() {
    if (hasRequiredFloydWarshall) return floydWarshall_1;
    hasRequiredFloydWarshall = 1;
    var _2 = requireLodash();
    floydWarshall_1 = floydWarshall2;
    var DEFAULT_WEIGHT_FUNC = _2.constant(1);
    function floydWarshall2(g, weightFn, edgeFn) {
      return runFloydWarshall(
        g,
        weightFn || DEFAULT_WEIGHT_FUNC,
        edgeFn || function(v) {
          return g.outEdges(v);
        }
      );
    }
    function runFloydWarshall(g, weightFn, edgeFn) {
      var results = {};
      var nodes = g.nodes();
      nodes.forEach(function(v) {
        results[v] = {};
        results[v][v] = { distance: 0 };
        nodes.forEach(function(w) {
          if (v !== w) {
            results[v][w] = { distance: Number.POSITIVE_INFINITY };
          }
        });
        edgeFn(v).forEach(function(edge) {
          var w = edge.v === v ? edge.w : edge.v;
          var d = weightFn(edge);
          results[v][w] = { distance: d, predecessor: v };
        });
      });
      nodes.forEach(function(k) {
        var rowK = results[k];
        nodes.forEach(function(i) {
          var rowI = results[i];
          nodes.forEach(function(j) {
            var ik = rowI[k];
            var kj = rowK[j];
            var ij = rowI[j];
            var altDistance = ik.distance + kj.distance;
            if (altDistance < ij.distance) {
              ij.distance = altDistance;
              ij.predecessor = kj.predecessor;
            }
          });
        });
      });
      return results;
    }
    return floydWarshall_1;
  }
  var topsort_1;
  var hasRequiredTopsort;
  function requireTopsort() {
    if (hasRequiredTopsort) return topsort_1;
    hasRequiredTopsort = 1;
    var _2 = requireLodash();
    topsort_1 = topsort;
    topsort.CycleException = CycleException;
    function topsort(g) {
      var visited = {};
      var stack = {};
      var results = [];
      function visit(node) {
        if (_2.has(stack, node)) {
          throw new CycleException();
        }
        if (!_2.has(visited, node)) {
          stack[node] = true;
          visited[node] = true;
          _2.each(g.predecessors(node), visit);
          delete stack[node];
          results.push(node);
        }
      }
      _2.each(g.sinks(), visit);
      if (_2.size(visited) !== g.nodeCount()) {
        throw new CycleException();
      }
      return results;
    }
    function CycleException() {
    }
    CycleException.prototype = new Error();
    return topsort_1;
  }
  var isAcyclic_1;
  var hasRequiredIsAcyclic;
  function requireIsAcyclic() {
    if (hasRequiredIsAcyclic) return isAcyclic_1;
    hasRequiredIsAcyclic = 1;
    var topsort = requireTopsort();
    isAcyclic_1 = isAcyclic;
    function isAcyclic(g) {
      try {
        topsort(g);
      } catch (e) {
        if (e instanceof topsort.CycleException) {
          return false;
        }
        throw e;
      }
      return true;
    }
    return isAcyclic_1;
  }
  var dfs_1;
  var hasRequiredDfs;
  function requireDfs() {
    if (hasRequiredDfs) return dfs_1;
    hasRequiredDfs = 1;
    var _2 = requireLodash();
    dfs_1 = dfs2;
    function dfs2(g, vs, order2) {
      if (!_2.isArray(vs)) {
        vs = [vs];
      }
      var navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);
      var acc = [];
      var visited = {};
      _2.each(vs, function(v) {
        if (!g.hasNode(v)) {
          throw new Error("Graph does not have node: " + v);
        }
        doDfs(g, v, order2 === "post", visited, navigation, acc);
      });
      return acc;
    }
    function doDfs(g, v, postorder2, visited, navigation, acc) {
      if (!_2.has(visited, v)) {
        visited[v] = true;
        if (!postorder2) {
          acc.push(v);
        }
        _2.each(navigation(v), function(w) {
          doDfs(g, w, postorder2, visited, navigation, acc);
        });
        if (postorder2) {
          acc.push(v);
        }
      }
    }
    return dfs_1;
  }
  var postorder_1;
  var hasRequiredPostorder;
  function requirePostorder() {
    if (hasRequiredPostorder) return postorder_1;
    hasRequiredPostorder = 1;
    var dfs2 = requireDfs();
    postorder_1 = postorder2;
    function postorder2(g, vs) {
      return dfs2(g, vs, "post");
    }
    return postorder_1;
  }
  var preorder_1;
  var hasRequiredPreorder;
  function requirePreorder() {
    if (hasRequiredPreorder) return preorder_1;
    hasRequiredPreorder = 1;
    var dfs2 = requireDfs();
    preorder_1 = preorder2;
    function preorder2(g, vs) {
      return dfs2(g, vs, "pre");
    }
    return preorder_1;
  }
  var prim_1;
  var hasRequiredPrim;
  function requirePrim() {
    if (hasRequiredPrim) return prim_1;
    hasRequiredPrim = 1;
    var _2 = requireLodash();
    var Graph2 = requireGraph();
    var PriorityQueue = requirePriorityQueue();
    prim_1 = prim;
    function prim(g, weightFunc) {
      var result = new Graph2();
      var parents = {};
      var pq = new PriorityQueue();
      var v;
      function updateNeighbors(edge) {
        var w = edge.v === v ? edge.w : edge.v;
        var pri = pq.priority(w);
        if (pri !== void 0) {
          var edgeWeight = weightFunc(edge);
          if (edgeWeight < pri) {
            parents[w] = v;
            pq.decrease(w, edgeWeight);
          }
        }
      }
      if (g.nodeCount() === 0) {
        return result;
      }
      _2.each(g.nodes(), function(v2) {
        pq.add(v2, Number.POSITIVE_INFINITY);
        result.setNode(v2);
      });
      pq.decrease(g.nodes()[0], 0);
      var init = false;
      while (pq.size() > 0) {
        v = pq.removeMin();
        if (_2.has(parents, v)) {
          result.setEdge(v, parents[v]);
        } else if (init) {
          throw new Error("Input graph is not connected: " + g);
        } else {
          init = true;
        }
        g.nodeEdges(v).forEach(updateNeighbors);
      }
      return result;
    }
    return prim_1;
  }
  var alg;
  var hasRequiredAlg;
  function requireAlg() {
    if (hasRequiredAlg) return alg;
    hasRequiredAlg = 1;
    alg = {
      components: requireComponents(),
      dijkstra: requireDijkstra(),
      dijkstraAll: requireDijkstraAll(),
      findCycles: requireFindCycles(),
      floydWarshall: requireFloydWarshall(),
      isAcyclic: requireIsAcyclic(),
      postorder: requirePostorder(),
      preorder: requirePreorder(),
      prim: requirePrim(),
      tarjan: requireTarjan(),
      topsort: requireTopsort()
    };
    return alg;
  }
  var graphlib$1;
  var hasRequiredGraphlib;
  function requireGraphlib() {
    if (hasRequiredGraphlib) return graphlib$1;
    hasRequiredGraphlib = 1;
    var lib2 = requireLib();
    graphlib$1 = {
      Graph: lib2.Graph,
      json: requireJson(),
      alg: requireAlg(),
      version: lib2.version
    };
    return graphlib$1;
  }
  var graphlib;
  if (typeof commonjsRequire === "function") {
    try {
      graphlib = requireGraphlib();
    } catch (e) {
    }
  }
  if (!graphlib) {
    graphlib = window.graphlib;
  }
  var graphlib_1 = graphlib;
  var cloneDeep_1;
  var hasRequiredCloneDeep;
  function requireCloneDeep() {
    if (hasRequiredCloneDeep) return cloneDeep_1;
    hasRequiredCloneDeep = 1;
    var baseClone = require_baseClone();
    var CLONE_DEEP_FLAG = 1, CLONE_SYMBOLS_FLAG = 4;
    function cloneDeep(value) {
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }
    cloneDeep_1 = cloneDeep;
    return cloneDeep_1;
  }
  var _isIterateeCall;
  var hasRequired_isIterateeCall;
  function require_isIterateeCall() {
    if (hasRequired_isIterateeCall) return _isIterateeCall;
    hasRequired_isIterateeCall = 1;
    var eq = requireEq(), isArrayLike = requireIsArrayLike(), isIndex = require_isIndex(), isObject2 = requireIsObject();
    function isIterateeCall(value, index2, object) {
      if (!isObject2(object)) {
        return false;
      }
      var type = typeof index2;
      if (type == "number" ? isArrayLike(object) && isIndex(index2, object.length) : type == "string" && index2 in object) {
        return eq(object[index2], value);
      }
      return false;
    }
    _isIterateeCall = isIterateeCall;
    return _isIterateeCall;
  }
  var defaults_1;
  var hasRequiredDefaults;
  function requireDefaults() {
    if (hasRequiredDefaults) return defaults_1;
    hasRequiredDefaults = 1;
    var baseRest = require_baseRest(), eq = requireEq(), isIterateeCall = require_isIterateeCall(), keysIn = requireKeysIn();
    var objectProto = Object.prototype;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    var defaults = baseRest(function(object, sources) {
      object = Object(object);
      var index2 = -1;
      var length = sources.length;
      var guard = length > 2 ? sources[2] : void 0;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        length = 1;
      }
      while (++index2 < length) {
        var source = sources[index2];
        var props = keysIn(source);
        var propsIndex = -1;
        var propsLength = props.length;
        while (++propsIndex < propsLength) {
          var key = props[propsIndex];
          var value = object[key];
          if (value === void 0 || eq(value, objectProto[key]) && !hasOwnProperty2.call(object, key)) {
            object[key] = source[key];
          }
        }
      }
      return object;
    });
    defaults_1 = defaults;
    return defaults_1;
  }
  var _createFind;
  var hasRequired_createFind;
  function require_createFind() {
    if (hasRequired_createFind) return _createFind;
    hasRequired_createFind = 1;
    var baseIteratee = require_baseIteratee(), isArrayLike = requireIsArrayLike(), keys = requireKeys();
    function createFind(findIndexFunc) {
      return function(collection, predicate, fromIndex) {
        var iterable = Object(collection);
        if (!isArrayLike(collection)) {
          var iteratee = baseIteratee(predicate, 3);
          collection = keys(collection);
          predicate = function(key) {
            return iteratee(iterable[key], key, iterable);
          };
        }
        var index2 = findIndexFunc(collection, predicate, fromIndex);
        return index2 > -1 ? iterable[iteratee ? collection[index2] : index2] : void 0;
      };
    }
    _createFind = createFind;
    return _createFind;
  }
  var _trimmedEndIndex;
  var hasRequired_trimmedEndIndex;
  function require_trimmedEndIndex() {
    if (hasRequired_trimmedEndIndex) return _trimmedEndIndex;
    hasRequired_trimmedEndIndex = 1;
    var reWhitespace = /\s/;
    function trimmedEndIndex(string) {
      var index2 = string.length;
      while (index2-- && reWhitespace.test(string.charAt(index2))) {
      }
      return index2;
    }
    _trimmedEndIndex = trimmedEndIndex;
    return _trimmedEndIndex;
  }
  var _baseTrim;
  var hasRequired_baseTrim;
  function require_baseTrim() {
    if (hasRequired_baseTrim) return _baseTrim;
    hasRequired_baseTrim = 1;
    var trimmedEndIndex = require_trimmedEndIndex();
    var reTrimStart = /^\s+/;
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    _baseTrim = baseTrim;
    return _baseTrim;
  }
  var toNumber_1;
  var hasRequiredToNumber;
  function requireToNumber() {
    if (hasRequiredToNumber) return toNumber_1;
    hasRequiredToNumber = 1;
    var baseTrim = require_baseTrim(), isObject2 = requireIsObject(), isSymbol = requireIsSymbol();
    var NAN = 0 / 0;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject2(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject2(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    toNumber_1 = toNumber;
    return toNumber_1;
  }
  var toFinite_1;
  var hasRequiredToFinite;
  function requireToFinite() {
    if (hasRequiredToFinite) return toFinite_1;
    hasRequiredToFinite = 1;
    var toNumber = requireToNumber();
    var INFINITY = 1 / 0, MAX_INTEGER = 17976931348623157e292;
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    toFinite_1 = toFinite;
    return toFinite_1;
  }
  var toInteger_1;
  var hasRequiredToInteger;
  function requireToInteger() {
    if (hasRequiredToInteger) return toInteger_1;
    hasRequiredToInteger = 1;
    var toFinite = requireToFinite();
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    toInteger_1 = toInteger;
    return toInteger_1;
  }
  var findIndex_1;
  var hasRequiredFindIndex;
  function requireFindIndex() {
    if (hasRequiredFindIndex) return findIndex_1;
    hasRequiredFindIndex = 1;
    var baseFindIndex = require_baseFindIndex(), baseIteratee = require_baseIteratee(), toInteger = requireToInteger();
    var nativeMax = Math.max;
    function findIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index2 = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index2 < 0) {
        index2 = nativeMax(length + index2, 0);
      }
      return baseFindIndex(array, baseIteratee(predicate, 3), index2);
    }
    findIndex_1 = findIndex;
    return findIndex_1;
  }
  var find_1;
  var hasRequiredFind;
  function requireFind() {
    if (hasRequiredFind) return find_1;
    hasRequiredFind = 1;
    var createFind = require_createFind(), findIndex = requireFindIndex();
    var find2 = createFind(findIndex);
    find_1 = find2;
    return find_1;
  }
  var flatten_1;
  var hasRequiredFlatten;
  function requireFlatten() {
    if (hasRequiredFlatten) return flatten_1;
    hasRequiredFlatten = 1;
    var baseFlatten = require_baseFlatten();
    function flatten(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, 1) : [];
    }
    flatten_1 = flatten;
    return flatten_1;
  }
  var forIn_1;
  var hasRequiredForIn;
  function requireForIn() {
    if (hasRequiredForIn) return forIn_1;
    hasRequiredForIn = 1;
    var baseFor = require_baseFor(), castFunction = require_castFunction(), keysIn = requireKeysIn();
    function forIn(object, iteratee) {
      return object == null ? object : baseFor(object, castFunction(iteratee), keysIn);
    }
    forIn_1 = forIn;
    return forIn_1;
  }
  var last_1;
  var hasRequiredLast;
  function requireLast() {
    if (hasRequiredLast) return last_1;
    hasRequiredLast = 1;
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : void 0;
    }
    last_1 = last;
    return last_1;
  }
  var mapValues_1;
  var hasRequiredMapValues;
  function requireMapValues() {
    if (hasRequiredMapValues) return mapValues_1;
    hasRequiredMapValues = 1;
    var baseAssignValue = require_baseAssignValue(), baseForOwn = require_baseForOwn(), baseIteratee = require_baseIteratee();
    function mapValues(object, iteratee) {
      var result = {};
      iteratee = baseIteratee(iteratee, 3);
      baseForOwn(object, function(value, key, object2) {
        baseAssignValue(result, key, iteratee(value, key, object2));
      });
      return result;
    }
    mapValues_1 = mapValues;
    return mapValues_1;
  }
  var _baseExtremum;
  var hasRequired_baseExtremum;
  function require_baseExtremum() {
    if (hasRequired_baseExtremum) return _baseExtremum;
    hasRequired_baseExtremum = 1;
    var isSymbol = requireIsSymbol();
    function baseExtremum(array, iteratee, comparator) {
      var index2 = -1, length = array.length;
      while (++index2 < length) {
        var value = array[index2], current = iteratee(value);
        if (current != null && (computed === void 0 ? current === current && !isSymbol(current) : comparator(current, computed))) {
          var computed = current, result = value;
        }
      }
      return result;
    }
    _baseExtremum = baseExtremum;
    return _baseExtremum;
  }
  var _baseGt;
  var hasRequired_baseGt;
  function require_baseGt() {
    if (hasRequired_baseGt) return _baseGt;
    hasRequired_baseGt = 1;
    function baseGt(value, other) {
      return value > other;
    }
    _baseGt = baseGt;
    return _baseGt;
  }
  var max_1;
  var hasRequiredMax;
  function requireMax() {
    if (hasRequiredMax) return max_1;
    hasRequiredMax = 1;
    var baseExtremum = require_baseExtremum(), baseGt = require_baseGt(), identity = requireIdentity();
    function max2(array) {
      return array && array.length ? baseExtremum(array, identity, baseGt) : void 0;
    }
    max_1 = max2;
    return max_1;
  }
  var _assignMergeValue;
  var hasRequired_assignMergeValue;
  function require_assignMergeValue() {
    if (hasRequired_assignMergeValue) return _assignMergeValue;
    hasRequired_assignMergeValue = 1;
    var baseAssignValue = require_baseAssignValue(), eq = requireEq();
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    _assignMergeValue = assignMergeValue;
    return _assignMergeValue;
  }
  var isPlainObject_1;
  var hasRequiredIsPlainObject;
  function requireIsPlainObject() {
    if (hasRequiredIsPlainObject) return isPlainObject_1;
    hasRequiredIsPlainObject = 1;
    var baseGetTag = require_baseGetTag(), getPrototype = require_getPrototype(), isObjectLike2 = requireIsObjectLike();
    var objectTag = "[object Object]";
    var funcProto = Function.prototype, objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty2 = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    function isPlainObject2(value) {
      if (!isObjectLike2(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty2.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    isPlainObject_1 = isPlainObject2;
    return isPlainObject_1;
  }
  var _safeGet;
  var hasRequired_safeGet;
  function require_safeGet() {
    if (hasRequired_safeGet) return _safeGet;
    hasRequired_safeGet = 1;
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    _safeGet = safeGet;
    return _safeGet;
  }
  var toPlainObject_1;
  var hasRequiredToPlainObject;
  function requireToPlainObject() {
    if (hasRequiredToPlainObject) return toPlainObject_1;
    hasRequiredToPlainObject = 1;
    var copyObject = require_copyObject(), keysIn = requireKeysIn();
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    toPlainObject_1 = toPlainObject;
    return toPlainObject_1;
  }
  var _baseMergeDeep;
  var hasRequired_baseMergeDeep;
  function require_baseMergeDeep() {
    if (hasRequired_baseMergeDeep) return _baseMergeDeep;
    hasRequired_baseMergeDeep = 1;
    var assignMergeValue = require_assignMergeValue(), cloneBuffer = require_cloneBuffer(), cloneTypedArray = require_cloneTypedArray(), copyArray = require_copyArray(), initCloneObject = require_initCloneObject(), isArguments = requireIsArguments(), isArray2 = requireIsArray(), isArrayLikeObject = requireIsArrayLikeObject(), isBuffer2 = requireIsBuffer(), isFunction2 = requireIsFunction(), isObject2 = requireIsObject(), isPlainObject2 = requireIsPlainObject(), isTypedArray = requireIsTypedArray(), safeGet = require_safeGet(), toPlainObject = requireToPlainObject();
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray2(srcValue), isBuff = !isArr && isBuffer2(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray2(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject2(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject2(objValue) || isFunction2(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    _baseMergeDeep = baseMergeDeep;
    return _baseMergeDeep;
  }
  var _baseMerge;
  var hasRequired_baseMerge;
  function require_baseMerge() {
    if (hasRequired_baseMerge) return _baseMerge;
    hasRequired_baseMerge = 1;
    var Stack = require_Stack(), assignMergeValue = require_assignMergeValue(), baseFor = require_baseFor(), baseMergeDeep = require_baseMergeDeep(), isObject2 = requireIsObject(), keysIn = requireKeysIn(), safeGet = require_safeGet();
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject2(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    _baseMerge = baseMerge;
    return _baseMerge;
  }
  var _createAssigner;
  var hasRequired_createAssigner;
  function require_createAssigner() {
    if (hasRequired_createAssigner) return _createAssigner;
    hasRequired_createAssigner = 1;
    var baseRest = require_baseRest(), isIterateeCall = require_isIterateeCall();
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index2 = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index2 < length) {
          var source = sources[index2];
          if (source) {
            assigner(object, source, index2, customizer);
          }
        }
        return object;
      });
    }
    _createAssigner = createAssigner;
    return _createAssigner;
  }
  var merge_1;
  var hasRequiredMerge;
  function requireMerge() {
    if (hasRequiredMerge) return merge_1;
    hasRequiredMerge = 1;
    var baseMerge = require_baseMerge(), createAssigner = require_createAssigner();
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    merge_1 = merge;
    return merge_1;
  }
  var _baseLt;
  var hasRequired_baseLt;
  function require_baseLt() {
    if (hasRequired_baseLt) return _baseLt;
    hasRequired_baseLt = 1;
    function baseLt(value, other) {
      return value < other;
    }
    _baseLt = baseLt;
    return _baseLt;
  }
  var min_1;
  var hasRequiredMin;
  function requireMin() {
    if (hasRequiredMin) return min_1;
    hasRequiredMin = 1;
    var baseExtremum = require_baseExtremum(), baseLt = require_baseLt(), identity = requireIdentity();
    function min2(array) {
      return array && array.length ? baseExtremum(array, identity, baseLt) : void 0;
    }
    min_1 = min2;
    return min_1;
  }
  var minBy_1;
  var hasRequiredMinBy;
  function requireMinBy() {
    if (hasRequiredMinBy) return minBy_1;
    hasRequiredMinBy = 1;
    var baseExtremum = require_baseExtremum(), baseIteratee = require_baseIteratee(), baseLt = require_baseLt();
    function minBy2(array, iteratee) {
      return array && array.length ? baseExtremum(array, baseIteratee(iteratee, 2), baseLt) : void 0;
    }
    minBy_1 = minBy2;
    return minBy_1;
  }
  var now_1;
  var hasRequiredNow;
  function requireNow() {
    if (hasRequiredNow) return now_1;
    hasRequiredNow = 1;
    var root = require_root();
    var now2 = function() {
      return root.Date.now();
    };
    now_1 = now2;
    return now_1;
  }
  var _baseSet;
  var hasRequired_baseSet;
  function require_baseSet() {
    if (hasRequired_baseSet) return _baseSet;
    hasRequired_baseSet = 1;
    var assignValue = require_assignValue(), castPath = require_castPath(), isIndex = require_isIndex(), isObject2 = requireIsObject(), toKey = require_toKey();
    function baseSet(object, path, value, customizer) {
      if (!isObject2(object)) {
        return object;
      }
      path = castPath(path, object);
      var index2 = -1, length = path.length, lastIndex = length - 1, nested = object;
      while (nested != null && ++index2 < length) {
        var key = toKey(path[index2]), newValue = value;
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          return object;
        }
        if (index2 != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : void 0;
          if (newValue === void 0) {
            newValue = isObject2(objValue) ? objValue : isIndex(path[index2 + 1]) ? [] : {};
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    _baseSet = baseSet;
    return _baseSet;
  }
  var _basePickBy;
  var hasRequired_basePickBy;
  function require_basePickBy() {
    if (hasRequired_basePickBy) return _basePickBy;
    hasRequired_basePickBy = 1;
    var baseGet = require_baseGet(), baseSet = require_baseSet(), castPath = require_castPath();
    function basePickBy(object, paths, predicate) {
      var index2 = -1, length = paths.length, result = {};
      while (++index2 < length) {
        var path = paths[index2], value = baseGet(object, path);
        if (predicate(value, path)) {
          baseSet(result, castPath(path, object), value);
        }
      }
      return result;
    }
    _basePickBy = basePickBy;
    return _basePickBy;
  }
  var _basePick;
  var hasRequired_basePick;
  function require_basePick() {
    if (hasRequired_basePick) return _basePick;
    hasRequired_basePick = 1;
    var basePickBy = require_basePickBy(), hasIn = requireHasIn();
    function basePick(object, paths) {
      return basePickBy(object, paths, function(value, path) {
        return hasIn(object, path);
      });
    }
    _basePick = basePick;
    return _basePick;
  }
  var _flatRest;
  var hasRequired_flatRest;
  function require_flatRest() {
    if (hasRequired_flatRest) return _flatRest;
    hasRequired_flatRest = 1;
    var flatten = requireFlatten(), overRest = require_overRest(), setToString = require_setToString();
    function flatRest(func) {
      return setToString(overRest(func, void 0, flatten), func + "");
    }
    _flatRest = flatRest;
    return _flatRest;
  }
  var pick_1;
  var hasRequiredPick;
  function requirePick() {
    if (hasRequiredPick) return pick_1;
    hasRequiredPick = 1;
    var basePick = require_basePick(), flatRest = require_flatRest();
    var pick2 = flatRest(function(object, paths) {
      return object == null ? {} : basePick(object, paths);
    });
    pick_1 = pick2;
    return pick_1;
  }
  var _baseRange;
  var hasRequired_baseRange;
  function require_baseRange() {
    if (hasRequired_baseRange) return _baseRange;
    hasRequired_baseRange = 1;
    var nativeCeil = Math.ceil, nativeMax = Math.max;
    function baseRange(start, end, step, fromRight) {
      var index2 = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
      while (length--) {
        result[fromRight ? length : ++index2] = start;
        start += step;
      }
      return result;
    }
    _baseRange = baseRange;
    return _baseRange;
  }
  var _createRange;
  var hasRequired_createRange;
  function require_createRange() {
    if (hasRequired_createRange) return _createRange;
    hasRequired_createRange = 1;
    var baseRange = require_baseRange(), isIterateeCall = require_isIterateeCall(), toFinite = requireToFinite();
    function createRange(fromRight) {
      return function(start, end, step) {
        if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
          end = step = void 0;
        }
        start = toFinite(start);
        if (end === void 0) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        step = step === void 0 ? start < end ? 1 : -1 : toFinite(step);
        return baseRange(start, end, step, fromRight);
      };
    }
    _createRange = createRange;
    return _createRange;
  }
  var range_1;
  var hasRequiredRange;
  function requireRange() {
    if (hasRequiredRange) return range_1;
    hasRequiredRange = 1;
    var createRange = require_createRange();
    var range = createRange();
    range_1 = range;
    return range_1;
  }
  var _baseSortBy;
  var hasRequired_baseSortBy;
  function require_baseSortBy() {
    if (hasRequired_baseSortBy) return _baseSortBy;
    hasRequired_baseSortBy = 1;
    function baseSortBy(array, comparer) {
      var length = array.length;
      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }
    _baseSortBy = baseSortBy;
    return _baseSortBy;
  }
  var _compareAscending;
  var hasRequired_compareAscending;
  function require_compareAscending() {
    if (hasRequired_compareAscending) return _compareAscending;
    hasRequired_compareAscending = 1;
    var isSymbol = requireIsSymbol();
    function compareAscending(value, other) {
      if (value !== other) {
        var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
        var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
        if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
          return 1;
        }
        if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
          return -1;
        }
      }
      return 0;
    }
    _compareAscending = compareAscending;
    return _compareAscending;
  }
  var _compareMultiple;
  var hasRequired_compareMultiple;
  function require_compareMultiple() {
    if (hasRequired_compareMultiple) return _compareMultiple;
    hasRequired_compareMultiple = 1;
    var compareAscending = require_compareAscending();
    function compareMultiple(object, other, orders) {
      var index2 = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
      while (++index2 < length) {
        var result = compareAscending(objCriteria[index2], othCriteria[index2]);
        if (result) {
          if (index2 >= ordersLength) {
            return result;
          }
          var order2 = orders[index2];
          return result * (order2 == "desc" ? -1 : 1);
        }
      }
      return object.index - other.index;
    }
    _compareMultiple = compareMultiple;
    return _compareMultiple;
  }
  var _baseOrderBy;
  var hasRequired_baseOrderBy;
  function require_baseOrderBy() {
    if (hasRequired_baseOrderBy) return _baseOrderBy;
    hasRequired_baseOrderBy = 1;
    var arrayMap = require_arrayMap(), baseGet = require_baseGet(), baseIteratee = require_baseIteratee(), baseMap = require_baseMap(), baseSortBy = require_baseSortBy(), baseUnary = require_baseUnary(), compareMultiple = require_compareMultiple(), identity = requireIdentity(), isArray2 = requireIsArray();
    function baseOrderBy(collection, iteratees, orders) {
      if (iteratees.length) {
        iteratees = arrayMap(iteratees, function(iteratee) {
          if (isArray2(iteratee)) {
            return function(value) {
              return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
            };
          }
          return iteratee;
        });
      } else {
        iteratees = [identity];
      }
      var index2 = -1;
      iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
      var result = baseMap(collection, function(value, key, collection2) {
        var criteria = arrayMap(iteratees, function(iteratee) {
          return iteratee(value);
        });
        return { "criteria": criteria, "index": ++index2, "value": value };
      });
      return baseSortBy(result, function(object, other) {
        return compareMultiple(object, other, orders);
      });
    }
    _baseOrderBy = baseOrderBy;
    return _baseOrderBy;
  }
  var sortBy_1;
  var hasRequiredSortBy;
  function requireSortBy() {
    if (hasRequiredSortBy) return sortBy_1;
    hasRequiredSortBy = 1;
    var baseFlatten = require_baseFlatten(), baseOrderBy = require_baseOrderBy(), baseRest = require_baseRest(), isIterateeCall = require_isIterateeCall();
    var sortBy = baseRest(function(collection, iteratees) {
      if (collection == null) {
        return [];
      }
      var length = iteratees.length;
      if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
        iteratees = [];
      } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
        iteratees = [iteratees[0]];
      }
      return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
    });
    sortBy_1 = sortBy;
    return sortBy_1;
  }
  var uniqueId_1;
  var hasRequiredUniqueId;
  function requireUniqueId() {
    if (hasRequiredUniqueId) return uniqueId_1;
    hasRequiredUniqueId = 1;
    var toString2 = requireToString();
    var idCounter = 0;
    function uniqueId(prefix) {
      var id = ++idCounter;
      return toString2(prefix) + id;
    }
    uniqueId_1 = uniqueId;
    return uniqueId_1;
  }
  var _baseZipObject;
  var hasRequired_baseZipObject;
  function require_baseZipObject() {
    if (hasRequired_baseZipObject) return _baseZipObject;
    hasRequired_baseZipObject = 1;
    function baseZipObject(props, values, assignFunc) {
      var index2 = -1, length = props.length, valsLength = values.length, result = {};
      while (++index2 < length) {
        var value = index2 < valsLength ? values[index2] : void 0;
        assignFunc(result, props[index2], value);
      }
      return result;
    }
    _baseZipObject = baseZipObject;
    return _baseZipObject;
  }
  var zipObject_1;
  var hasRequiredZipObject;
  function requireZipObject() {
    if (hasRequiredZipObject) return zipObject_1;
    hasRequiredZipObject = 1;
    var assignValue = require_assignValue(), baseZipObject = require_baseZipObject();
    function zipObject2(props, values) {
      return baseZipObject(props || [], values || [], assignValue);
    }
    zipObject_1 = zipObject2;
    return zipObject_1;
  }
  var lodash;
  if (typeof commonjsRequire === "function") {
    try {
      lodash = {
        cloneDeep: requireCloneDeep(),
        constant: requireConstant(),
        defaults: requireDefaults(),
        each: requireEach(),
        filter: requireFilter(),
        find: requireFind(),
        flatten: requireFlatten(),
        forEach: requireForEach(),
        forIn: requireForIn(),
        has: requireHas(),
        isUndefined: requireIsUndefined(),
        last: requireLast(),
        map: requireMap(),
        mapValues: requireMapValues(),
        max: requireMax(),
        merge: requireMerge(),
        min: requireMin(),
        minBy: requireMinBy(),
        now: requireNow(),
        pick: requirePick(),
        range: requireRange(),
        reduce: requireReduce(),
        sortBy: requireSortBy(),
        uniqueId: requireUniqueId(),
        values: requireValues(),
        zipObject: requireZipObject()
      };
    } catch (e) {
    }
  }
  if (!lodash) {
    lodash = window._;
  }
  var lodash_1 = lodash;
  var list = List$1;
  function List$1() {
    var sentinel = {};
    sentinel._next = sentinel._prev = sentinel;
    this._sentinel = sentinel;
  }
  List$1.prototype.dequeue = function() {
    var sentinel = this._sentinel;
    var entry = sentinel._prev;
    if (entry !== sentinel) {
      unlink(entry);
      return entry;
    }
  };
  List$1.prototype.enqueue = function(entry) {
    var sentinel = this._sentinel;
    if (entry._prev && entry._next) {
      unlink(entry);
    }
    entry._next = sentinel._next;
    sentinel._next._prev = entry;
    sentinel._next = entry;
    entry._prev = sentinel;
  };
  List$1.prototype.toString = function() {
    var strs = [];
    var sentinel = this._sentinel;
    var curr = sentinel._prev;
    while (curr !== sentinel) {
      strs.push(JSON.stringify(curr, filterOutLinks));
      curr = curr._prev;
    }
    return "[" + strs.join(", ") + "]";
  };
  function unlink(entry) {
    entry._prev._next = entry._next;
    entry._next._prev = entry._prev;
    delete entry._next;
    delete entry._prev;
  }
  function filterOutLinks(k, v) {
    if (k !== "_next" && k !== "_prev") {
      return v;
    }
  }
  var _$n = lodash_1;
  var Graph$7 = graphlib_1.Graph;
  var List = list;
  var greedyFas = greedyFAS$1;
  var DEFAULT_WEIGHT_FN = _$n.constant(1);
  function greedyFAS$1(g, weightFn) {
    if (g.nodeCount() <= 1) {
      return [];
    }
    var state = buildState(g, weightFn || DEFAULT_WEIGHT_FN);
    var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);
    return _$n.flatten(_$n.map(results, function(e) {
      return g.outEdges(e.v, e.w);
    }), true);
  }
  function doGreedyFAS(g, buckets, zeroIdx) {
    var results = [];
    var sources = buckets[buckets.length - 1];
    var sinks = buckets[0];
    var entry;
    while (g.nodeCount()) {
      while (entry = sinks.dequeue()) {
        removeNode(g, buckets, zeroIdx, entry);
      }
      while (entry = sources.dequeue()) {
        removeNode(g, buckets, zeroIdx, entry);
      }
      if (g.nodeCount()) {
        for (var i = buckets.length - 2; i > 0; --i) {
          entry = buckets[i].dequeue();
          if (entry) {
            results = results.concat(removeNode(g, buckets, zeroIdx, entry, true));
            break;
          }
        }
      }
    }
    return results;
  }
  function removeNode(g, buckets, zeroIdx, entry, collectPredecessors) {
    var results = collectPredecessors ? [] : void 0;
    _$n.forEach(g.inEdges(entry.v), function(edge) {
      var weight = g.edge(edge);
      var uEntry = g.node(edge.v);
      if (collectPredecessors) {
        results.push({ v: edge.v, w: edge.w });
      }
      uEntry.out -= weight;
      assignBucket(buckets, zeroIdx, uEntry);
    });
    _$n.forEach(g.outEdges(entry.v), function(edge) {
      var weight = g.edge(edge);
      var w = edge.w;
      var wEntry = g.node(w);
      wEntry["in"] -= weight;
      assignBucket(buckets, zeroIdx, wEntry);
    });
    g.removeNode(entry.v);
    return results;
  }
  function buildState(g, weightFn) {
    var fasGraph = new Graph$7();
    var maxIn = 0;
    var maxOut = 0;
    _$n.forEach(g.nodes(), function(v) {
      fasGraph.setNode(v, { v, "in": 0, out: 0 });
    });
    _$n.forEach(g.edges(), function(e) {
      var prevWeight = fasGraph.edge(e.v, e.w) || 0;
      var weight = weightFn(e);
      var edgeWeight = prevWeight + weight;
      fasGraph.setEdge(e.v, e.w, edgeWeight);
      maxOut = Math.max(maxOut, fasGraph.node(e.v).out += weight);
      maxIn = Math.max(maxIn, fasGraph.node(e.w)["in"] += weight);
    });
    var buckets = _$n.range(maxOut + maxIn + 3).map(function() {
      return new List();
    });
    var zeroIdx = maxIn + 1;
    _$n.forEach(fasGraph.nodes(), function(v) {
      assignBucket(buckets, zeroIdx, fasGraph.node(v));
    });
    return { graph: fasGraph, buckets, zeroIdx };
  }
  function assignBucket(buckets, zeroIdx, entry) {
    if (!entry.out) {
      buckets[0].enqueue(entry);
    } else if (!entry["in"]) {
      buckets[buckets.length - 1].enqueue(entry);
    } else {
      buckets[entry.out - entry["in"] + zeroIdx].enqueue(entry);
    }
  }
  var _$m = lodash_1;
  var greedyFAS = greedyFas;
  var acyclic$1 = {
    run: run$2,
    undo: undo$2
  };
  function run$2(g) {
    var fas = g.graph().acyclicer === "greedy" ? greedyFAS(g, weightFn(g)) : dfsFAS(g);
    _$m.forEach(fas, function(e) {
      var label = g.edge(e);
      g.removeEdge(e);
      label.forwardName = e.name;
      label.reversed = true;
      g.setEdge(e.w, e.v, label, _$m.uniqueId("rev"));
    });
    function weightFn(g2) {
      return function(e) {
        return g2.edge(e).weight;
      };
    }
  }
  function dfsFAS(g) {
    var fas = [];
    var stack = {};
    var visited = {};
    function dfs2(v) {
      if (_$m.has(visited, v)) {
        return;
      }
      visited[v] = true;
      stack[v] = true;
      _$m.forEach(g.outEdges(v), function(e) {
        if (_$m.has(stack, e.w)) {
          fas.push(e);
        } else {
          dfs2(e.w);
        }
      });
      delete stack[v];
    }
    _$m.forEach(g.nodes(), dfs2);
    return fas;
  }
  function undo$2(g) {
    _$m.forEach(g.edges(), function(e) {
      var label = g.edge(e);
      if (label.reversed) {
        g.removeEdge(e);
        var forwardName = label.forwardName;
        delete label.reversed;
        delete label.forwardName;
        g.setEdge(e.w, e.v, label, forwardName);
      }
    });
  }
  var _$l = lodash_1;
  var Graph$6 = graphlib_1.Graph;
  var util$a = {
    addDummyNode,
    simplify: simplify$1,
    asNonCompoundGraph,
    successorWeights,
    predecessorWeights,
    intersectRect,
    buildLayerMatrix,
    normalizeRanks: normalizeRanks$1,
    removeEmptyRanks: removeEmptyRanks$1,
    addBorderNode: addBorderNode$1,
    maxRank,
    partition,
    time,
    notime
  };
  function addDummyNode(g, type, attrs, name) {
    var v;
    do {
      v = _$l.uniqueId(name);
    } while (g.hasNode(v));
    attrs.dummy = type;
    g.setNode(v, attrs);
    return v;
  }
  function simplify$1(g) {
    var simplified = new Graph$6().setGraph(g.graph());
    _$l.forEach(g.nodes(), function(v) {
      simplified.setNode(v, g.node(v));
    });
    _$l.forEach(g.edges(), function(e) {
      var simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 };
      var label = g.edge(e);
      simplified.setEdge(e.v, e.w, {
        weight: simpleLabel.weight + label.weight,
        minlen: Math.max(simpleLabel.minlen, label.minlen)
      });
    });
    return simplified;
  }
  function asNonCompoundGraph(g) {
    var simplified = new Graph$6({ multigraph: g.isMultigraph() }).setGraph(g.graph());
    _$l.forEach(g.nodes(), function(v) {
      if (!g.children(v).length) {
        simplified.setNode(v, g.node(v));
      }
    });
    _$l.forEach(g.edges(), function(e) {
      simplified.setEdge(e, g.edge(e));
    });
    return simplified;
  }
  function successorWeights(g) {
    var weightMap = _$l.map(g.nodes(), function(v) {
      var sucs = {};
      _$l.forEach(g.outEdges(v), function(e) {
        sucs[e.w] = (sucs[e.w] || 0) + g.edge(e).weight;
      });
      return sucs;
    });
    return _$l.zipObject(g.nodes(), weightMap);
  }
  function predecessorWeights(g) {
    var weightMap = _$l.map(g.nodes(), function(v) {
      var preds = {};
      _$l.forEach(g.inEdges(v), function(e) {
        preds[e.v] = (preds[e.v] || 0) + g.edge(e).weight;
      });
      return preds;
    });
    return _$l.zipObject(g.nodes(), weightMap);
  }
  function intersectRect(rect, point) {
    var x2 = rect.x;
    var y2 = rect.y;
    var dx = point.x - x2;
    var dy = point.y - y2;
    var w = rect.width / 2;
    var h = rect.height / 2;
    if (!dx && !dy) {
      throw new Error("Not possible to find intersection inside of the rectangle");
    }
    var sx, sy;
    if (Math.abs(dy) * w > Math.abs(dx) * h) {
      if (dy < 0) {
        h = -h;
      }
      sx = h * dx / dy;
      sy = h;
    } else {
      if (dx < 0) {
        w = -w;
      }
      sx = w;
      sy = w * dy / dx;
    }
    return { x: x2 + sx, y: y2 + sy };
  }
  function buildLayerMatrix(g) {
    var layering = _$l.map(_$l.range(maxRank(g) + 1), function() {
      return [];
    });
    _$l.forEach(g.nodes(), function(v) {
      var node = g.node(v);
      var rank2 = node.rank;
      if (!_$l.isUndefined(rank2)) {
        layering[rank2][node.order] = v;
      }
    });
    return layering;
  }
  function normalizeRanks$1(g) {
    var min2 = _$l.min(_$l.map(g.nodes(), function(v) {
      return g.node(v).rank;
    }));
    _$l.forEach(g.nodes(), function(v) {
      var node = g.node(v);
      if (_$l.has(node, "rank")) {
        node.rank -= min2;
      }
    });
  }
  function removeEmptyRanks$1(g) {
    var offset = _$l.min(_$l.map(g.nodes(), function(v) {
      return g.node(v).rank;
    }));
    var layers = [];
    _$l.forEach(g.nodes(), function(v) {
      var rank2 = g.node(v).rank - offset;
      if (!layers[rank2]) {
        layers[rank2] = [];
      }
      layers[rank2].push(v);
    });
    var delta = 0;
    var nodeRankFactor = g.graph().nodeRankFactor;
    _$l.forEach(layers, function(vs, i) {
      if (_$l.isUndefined(vs) && i % nodeRankFactor !== 0) {
        --delta;
      } else if (delta) {
        _$l.forEach(vs, function(v) {
          g.node(v).rank += delta;
        });
      }
    });
  }
  function addBorderNode$1(g, prefix, rank2, order2) {
    var node = {
      width: 0,
      height: 0
    };
    if (arguments.length >= 4) {
      node.rank = rank2;
      node.order = order2;
    }
    return addDummyNode(g, "border", node, prefix);
  }
  function maxRank(g) {
    return _$l.max(_$l.map(g.nodes(), function(v) {
      var rank2 = g.node(v).rank;
      if (!_$l.isUndefined(rank2)) {
        return rank2;
      }
    }));
  }
  function partition(collection, fn) {
    var result = { lhs: [], rhs: [] };
    _$l.forEach(collection, function(value) {
      if (fn(value)) {
        result.lhs.push(value);
      } else {
        result.rhs.push(value);
      }
    });
    return result;
  }
  function time(name, fn) {
    var start = _$l.now();
    try {
      return fn();
    } finally {
      console.log(name + " time: " + (_$l.now() - start) + "ms");
    }
  }
  function notime(name, fn) {
    return fn();
  }
  var _$k = lodash_1;
  var util$9 = util$a;
  var normalize$1 = {
    run: run$1,
    undo: undo$1
  };
  function run$1(g) {
    g.graph().dummyChains = [];
    _$k.forEach(g.edges(), function(edge) {
      normalizeEdge(g, edge);
    });
  }
  function normalizeEdge(g, e) {
    var v = e.v;
    var vRank = g.node(v).rank;
    var w = e.w;
    var wRank = g.node(w).rank;
    var name = e.name;
    var edgeLabel = g.edge(e);
    var labelRank = edgeLabel.labelRank;
    if (wRank === vRank + 1) return;
    g.removeEdge(e);
    var dummy, attrs, i;
    for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
      edgeLabel.points = [];
      attrs = {
        width: 0,
        height: 0,
        edgeLabel,
        edgeObj: e,
        rank: vRank
      };
      dummy = util$9.addDummyNode(g, "edge", attrs, "_d");
      if (vRank === labelRank) {
        attrs.width = edgeLabel.width;
        attrs.height = edgeLabel.height;
        attrs.dummy = "edge-label";
        attrs.labelpos = edgeLabel.labelpos;
      }
      g.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
      if (i === 0) {
        g.graph().dummyChains.push(dummy);
      }
      v = dummy;
    }
    g.setEdge(v, w, { weight: edgeLabel.weight }, name);
  }
  function undo$1(g) {
    _$k.forEach(g.graph().dummyChains, function(v) {
      var node = g.node(v);
      var origLabel = node.edgeLabel;
      var w;
      g.setEdge(node.edgeObj, origLabel);
      while (node.dummy) {
        w = g.successors(v)[0];
        g.removeNode(v);
        origLabel.points.push({ x: node.x, y: node.y });
        if (node.dummy === "edge-label") {
          origLabel.x = node.x;
          origLabel.y = node.y;
          origLabel.width = node.width;
          origLabel.height = node.height;
        }
        v = w;
        node = g.node(v);
      }
    });
  }
  var _$j = lodash_1;
  var util$8 = {
    longestPath: longestPath$1,
    slack: slack$2
  };
  function longestPath$1(g) {
    var visited = {};
    function dfs2(v) {
      var label = g.node(v);
      if (_$j.has(visited, v)) {
        return label.rank;
      }
      visited[v] = true;
      var rank2 = _$j.min(_$j.map(g.outEdges(v), function(e) {
        return dfs2(e.w) - g.edge(e).minlen;
      }));
      if (rank2 === Number.POSITIVE_INFINITY || // return value of _.map([]) for Lodash 3
      rank2 === void 0 || // return value of _.map([]) for Lodash 4
      rank2 === null) {
        rank2 = 0;
      }
      return label.rank = rank2;
    }
    _$j.forEach(g.sources(), dfs2);
  }
  function slack$2(g, e) {
    return g.node(e.w).rank - g.node(e.v).rank - g.edge(e).minlen;
  }
  var _$i = lodash_1;
  var Graph$5 = graphlib_1.Graph;
  var slack$1 = util$8.slack;
  var feasibleTree_1 = feasibleTree$2;
  function feasibleTree$2(g) {
    var t = new Graph$5({ directed: false });
    var start = g.nodes()[0];
    var size = g.nodeCount();
    t.setNode(start, {});
    var edge, delta;
    while (tightTree(t, g) < size) {
      edge = findMinSlackEdge(t, g);
      delta = t.hasNode(edge.v) ? slack$1(g, edge) : -slack$1(g, edge);
      shiftRanks(t, g, delta);
    }
    return t;
  }
  function tightTree(t, g) {
    function dfs2(v) {
      _$i.forEach(g.nodeEdges(v), function(e) {
        var edgeV = e.v, w = v === edgeV ? e.w : edgeV;
        if (!t.hasNode(w) && !slack$1(g, e)) {
          t.setNode(w, {});
          t.setEdge(v, w, {});
          dfs2(w);
        }
      });
    }
    _$i.forEach(t.nodes(), dfs2);
    return t.nodeCount();
  }
  function findMinSlackEdge(t, g) {
    return _$i.minBy(g.edges(), function(e) {
      if (t.hasNode(e.v) !== t.hasNode(e.w)) {
        return slack$1(g, e);
      }
    });
  }
  function shiftRanks(t, g, delta) {
    _$i.forEach(t.nodes(), function(v) {
      g.node(v).rank += delta;
    });
  }
  var _$h = lodash_1;
  var feasibleTree$1 = feasibleTree_1;
  var slack = util$8.slack;
  var initRank = util$8.longestPath;
  var preorder = graphlib_1.alg.preorder;
  var postorder$1 = graphlib_1.alg.postorder;
  var simplify = util$a.simplify;
  var networkSimplex_1 = networkSimplex$1;
  networkSimplex$1.initLowLimValues = initLowLimValues;
  networkSimplex$1.initCutValues = initCutValues;
  networkSimplex$1.calcCutValue = calcCutValue;
  networkSimplex$1.leaveEdge = leaveEdge;
  networkSimplex$1.enterEdge = enterEdge;
  networkSimplex$1.exchangeEdges = exchangeEdges;
  function networkSimplex$1(g) {
    g = simplify(g);
    initRank(g);
    var t = feasibleTree$1(g);
    initLowLimValues(t);
    initCutValues(t, g);
    var e, f;
    while (e = leaveEdge(t)) {
      f = enterEdge(t, g, e);
      exchangeEdges(t, g, e, f);
    }
  }
  function initCutValues(t, g) {
    var vs = postorder$1(t, t.nodes());
    vs = vs.slice(0, vs.length - 1);
    _$h.forEach(vs, function(v) {
      assignCutValue(t, g, v);
    });
  }
  function assignCutValue(t, g, child) {
    var childLab = t.node(child);
    var parent = childLab.parent;
    t.edge(child, parent).cutvalue = calcCutValue(t, g, child);
  }
  function calcCutValue(t, g, child) {
    var childLab = t.node(child);
    var parent = childLab.parent;
    var childIsTail = true;
    var graphEdge = g.edge(child, parent);
    var cutValue = 0;
    if (!graphEdge) {
      childIsTail = false;
      graphEdge = g.edge(parent, child);
    }
    cutValue = graphEdge.weight;
    _$h.forEach(g.nodeEdges(child), function(e) {
      var isOutEdge = e.v === child, other = isOutEdge ? e.w : e.v;
      if (other !== parent) {
        var pointsToHead = isOutEdge === childIsTail, otherWeight = g.edge(e).weight;
        cutValue += pointsToHead ? otherWeight : -otherWeight;
        if (isTreeEdge(t, child, other)) {
          var otherCutValue = t.edge(child, other).cutvalue;
          cutValue += pointsToHead ? -otherCutValue : otherCutValue;
        }
      }
    });
    return cutValue;
  }
  function initLowLimValues(tree, root) {
    if (arguments.length < 2) {
      root = tree.nodes()[0];
    }
    dfsAssignLowLim(tree, {}, 1, root);
  }
  function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
    var low = nextLim;
    var label = tree.node(v);
    visited[v] = true;
    _$h.forEach(tree.neighbors(v), function(w) {
      if (!_$h.has(visited, w)) {
        nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
      }
    });
    label.low = low;
    label.lim = nextLim++;
    if (parent) {
      label.parent = parent;
    } else {
      delete label.parent;
    }
    return nextLim;
  }
  function leaveEdge(tree) {
    return _$h.find(tree.edges(), function(e) {
      return tree.edge(e).cutvalue < 0;
    });
  }
  function enterEdge(t, g, edge) {
    var v = edge.v;
    var w = edge.w;
    if (!g.hasEdge(v, w)) {
      v = edge.w;
      w = edge.v;
    }
    var vLabel = t.node(v);
    var wLabel = t.node(w);
    var tailLabel = vLabel;
    var flip = false;
    if (vLabel.lim > wLabel.lim) {
      tailLabel = wLabel;
      flip = true;
    }
    var candidates = _$h.filter(g.edges(), function(edge2) {
      return flip === isDescendant(t, t.node(edge2.v), tailLabel) && flip !== isDescendant(t, t.node(edge2.w), tailLabel);
    });
    return _$h.minBy(candidates, function(edge2) {
      return slack(g, edge2);
    });
  }
  function exchangeEdges(t, g, e, f) {
    var v = e.v;
    var w = e.w;
    t.removeEdge(v, w);
    t.setEdge(f.v, f.w, {});
    initLowLimValues(t);
    initCutValues(t, g);
    updateRanks(t, g);
  }
  function updateRanks(t, g) {
    var root = _$h.find(t.nodes(), function(v) {
      return !g.node(v).parent;
    });
    var vs = preorder(t, root);
    vs = vs.slice(1);
    _$h.forEach(vs, function(v) {
      var parent = t.node(v).parent, edge = g.edge(v, parent), flipped = false;
      if (!edge) {
        edge = g.edge(parent, v);
        flipped = true;
      }
      g.node(v).rank = g.node(parent).rank + (flipped ? edge.minlen : -edge.minlen);
    });
  }
  function isTreeEdge(tree, u, v) {
    return tree.hasEdge(u, v);
  }
  function isDescendant(tree, vLabel, rootLabel) {
    return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
  }
  var rankUtil = util$8;
  var longestPath = rankUtil.longestPath;
  var feasibleTree = feasibleTree_1;
  var networkSimplex = networkSimplex_1;
  var rank_1 = rank$1;
  function rank$1(g) {
    switch (g.graph().ranker) {
      case "network-simplex":
        networkSimplexRanker(g);
        break;
      case "tight-tree":
        tightTreeRanker(g);
        break;
      case "longest-path":
        longestPathRanker(g);
        break;
      default:
        networkSimplexRanker(g);
    }
  }
  var longestPathRanker = longestPath;
  function tightTreeRanker(g) {
    longestPath(g);
    feasibleTree(g);
  }
  function networkSimplexRanker(g) {
    networkSimplex(g);
  }
  var _$g = lodash_1;
  var parentDummyChains_1 = parentDummyChains$1;
  function parentDummyChains$1(g) {
    var postorderNums = postorder(g);
    _$g.forEach(g.graph().dummyChains, function(v) {
      var node = g.node(v);
      var edgeObj = node.edgeObj;
      var pathData = findPath(g, postorderNums, edgeObj.v, edgeObj.w);
      var path = pathData.path;
      var lca = pathData.lca;
      var pathIdx = 0;
      var pathV = path[pathIdx];
      var ascending = true;
      while (v !== edgeObj.w) {
        node = g.node(v);
        if (ascending) {
          while ((pathV = path[pathIdx]) !== lca && g.node(pathV).maxRank < node.rank) {
            pathIdx++;
          }
          if (pathV === lca) {
            ascending = false;
          }
        }
        if (!ascending) {
          while (pathIdx < path.length - 1 && g.node(pathV = path[pathIdx + 1]).minRank <= node.rank) {
            pathIdx++;
          }
          pathV = path[pathIdx];
        }
        g.setParent(v, pathV);
        v = g.successors(v)[0];
      }
    });
  }
  function findPath(g, postorderNums, v, w) {
    var vPath = [];
    var wPath = [];
    var low = Math.min(postorderNums[v].low, postorderNums[w].low);
    var lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
    var parent;
    var lca;
    parent = v;
    do {
      parent = g.parent(parent);
      vPath.push(parent);
    } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
    lca = parent;
    parent = w;
    while ((parent = g.parent(parent)) !== lca) {
      wPath.push(parent);
    }
    return { path: vPath.concat(wPath.reverse()), lca };
  }
  function postorder(g) {
    var result = {};
    var lim = 0;
    function dfs2(v) {
      var low = lim;
      _$g.forEach(g.children(v), dfs2);
      result[v] = { low, lim: lim++ };
    }
    _$g.forEach(g.children(), dfs2);
    return result;
  }
  var _$f = lodash_1;
  var util$7 = util$a;
  var nestingGraph$1 = {
    run,
    cleanup
  };
  function run(g) {
    var root = util$7.addDummyNode(g, "root", {}, "_root");
    var depths = treeDepths(g);
    var height = _$f.max(_$f.values(depths)) - 1;
    var nodeSep = 2 * height + 1;
    g.graph().nestingRoot = root;
    _$f.forEach(g.edges(), function(e) {
      g.edge(e).minlen *= nodeSep;
    });
    var weight = sumWeights(g) + 1;
    _$f.forEach(g.children(), function(child) {
      dfs(g, root, nodeSep, weight, height, depths, child);
    });
    g.graph().nodeRankFactor = nodeSep;
  }
  function dfs(g, root, nodeSep, weight, height, depths, v) {
    var children = g.children(v);
    if (!children.length) {
      if (v !== root) {
        g.setEdge(root, v, { weight: 0, minlen: nodeSep });
      }
      return;
    }
    var top = util$7.addBorderNode(g, "_bt");
    var bottom = util$7.addBorderNode(g, "_bb");
    var label = g.node(v);
    g.setParent(top, v);
    label.borderTop = top;
    g.setParent(bottom, v);
    label.borderBottom = bottom;
    _$f.forEach(children, function(child) {
      dfs(g, root, nodeSep, weight, height, depths, child);
      var childNode = g.node(child);
      var childTop = childNode.borderTop ? childNode.borderTop : child;
      var childBottom = childNode.borderBottom ? childNode.borderBottom : child;
      var thisWeight = childNode.borderTop ? weight : 2 * weight;
      var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;
      g.setEdge(top, childTop, {
        weight: thisWeight,
        minlen,
        nestingEdge: true
      });
      g.setEdge(childBottom, bottom, {
        weight: thisWeight,
        minlen,
        nestingEdge: true
      });
    });
    if (!g.parent(v)) {
      g.setEdge(root, top, { weight: 0, minlen: height + depths[v] });
    }
  }
  function treeDepths(g) {
    var depths = {};
    function dfs2(v, depth) {
      var children = g.children(v);
      if (children && children.length) {
        _$f.forEach(children, function(child) {
          dfs2(child, depth + 1);
        });
      }
      depths[v] = depth;
    }
    _$f.forEach(g.children(), function(v) {
      dfs2(v, 1);
    });
    return depths;
  }
  function sumWeights(g) {
    return _$f.reduce(g.edges(), function(acc, e) {
      return acc + g.edge(e).weight;
    }, 0);
  }
  function cleanup(g) {
    var graphLabel = g.graph();
    g.removeNode(graphLabel.nestingRoot);
    delete graphLabel.nestingRoot;
    _$f.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      if (edge.nestingEdge) {
        g.removeEdge(e);
      }
    });
  }
  var _$e = lodash_1;
  var util$6 = util$a;
  var addBorderSegments_1 = addBorderSegments$1;
  function addBorderSegments$1(g) {
    function dfs2(v) {
      var children = g.children(v);
      var node = g.node(v);
      if (children.length) {
        _$e.forEach(children, dfs2);
      }
      if (_$e.has(node, "minRank")) {
        node.borderLeft = [];
        node.borderRight = [];
        for (var rank2 = node.minRank, maxRank2 = node.maxRank + 1; rank2 < maxRank2; ++rank2) {
          addBorderNode(g, "borderLeft", "_bl", v, node, rank2);
          addBorderNode(g, "borderRight", "_br", v, node, rank2);
        }
      }
    }
    _$e.forEach(g.children(), dfs2);
  }
  function addBorderNode(g, prop, prefix, sg, sgNode, rank2) {
    var label = { width: 0, height: 0, rank: rank2, borderType: prop };
    var prev = sgNode[prop][rank2 - 1];
    var curr = util$6.addDummyNode(g, "border", label, prefix);
    sgNode[prop][rank2] = curr;
    g.setParent(curr, sg);
    if (prev) {
      g.setEdge(prev, curr, { weight: 1 });
    }
  }
  var _$d = lodash_1;
  var coordinateSystem$1 = {
    adjust,
    undo
  };
  function adjust(g) {
    var rankDir = g.graph().rankdir.toLowerCase();
    if (rankDir === "lr" || rankDir === "rl") {
      swapWidthHeight(g);
    }
  }
  function undo(g) {
    var rankDir = g.graph().rankdir.toLowerCase();
    if (rankDir === "bt" || rankDir === "rl") {
      reverseY(g);
    }
    if (rankDir === "lr" || rankDir === "rl") {
      swapXY(g);
      swapWidthHeight(g);
    }
  }
  function swapWidthHeight(g) {
    _$d.forEach(g.nodes(), function(v) {
      swapWidthHeightOne(g.node(v));
    });
    _$d.forEach(g.edges(), function(e) {
      swapWidthHeightOne(g.edge(e));
    });
  }
  function swapWidthHeightOne(attrs) {
    var w = attrs.width;
    attrs.width = attrs.height;
    attrs.height = w;
  }
  function reverseY(g) {
    _$d.forEach(g.nodes(), function(v) {
      reverseYOne(g.node(v));
    });
    _$d.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      _$d.forEach(edge.points, reverseYOne);
      if (_$d.has(edge, "y")) {
        reverseYOne(edge);
      }
    });
  }
  function reverseYOne(attrs) {
    attrs.y = -attrs.y;
  }
  function swapXY(g) {
    _$d.forEach(g.nodes(), function(v) {
      swapXYOne(g.node(v));
    });
    _$d.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      _$d.forEach(edge.points, swapXYOne);
      if (_$d.has(edge, "x")) {
        swapXYOne(edge);
      }
    });
  }
  function swapXYOne(attrs) {
    var x2 = attrs.x;
    attrs.x = attrs.y;
    attrs.y = x2;
  }
  var _$c = lodash_1;
  var initOrder_1 = initOrder$1;
  function initOrder$1(g) {
    var visited = {};
    var simpleNodes = _$c.filter(g.nodes(), function(v) {
      return !g.children(v).length;
    });
    var maxRank2 = _$c.max(_$c.map(simpleNodes, function(v) {
      return g.node(v).rank;
    }));
    var layers = _$c.map(_$c.range(maxRank2 + 1), function() {
      return [];
    });
    function dfs2(v) {
      if (_$c.has(visited, v)) return;
      visited[v] = true;
      var node = g.node(v);
      layers[node.rank].push(v);
      _$c.forEach(g.successors(v), dfs2);
    }
    var orderedVs = _$c.sortBy(simpleNodes, function(v) {
      return g.node(v).rank;
    });
    _$c.forEach(orderedVs, dfs2);
    return layers;
  }
  var _$b = lodash_1;
  var crossCount_1 = crossCount$1;
  function crossCount$1(g, layering) {
    var cc = 0;
    for (var i = 1; i < layering.length; ++i) {
      cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
    }
    return cc;
  }
  function twoLayerCrossCount(g, northLayer, southLayer) {
    var southPos = _$b.zipObject(
      southLayer,
      _$b.map(southLayer, function(v, i) {
        return i;
      })
    );
    var southEntries = _$b.flatten(_$b.map(northLayer, function(v) {
      return _$b.sortBy(_$b.map(g.outEdges(v), function(e) {
        return { pos: southPos[e.w], weight: g.edge(e).weight };
      }), "pos");
    }), true);
    var firstIndex = 1;
    while (firstIndex < southLayer.length) firstIndex <<= 1;
    var treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;
    var tree = _$b.map(new Array(treeSize), function() {
      return 0;
    });
    var cc = 0;
    _$b.forEach(southEntries.forEach(function(entry) {
      var index2 = entry.pos + firstIndex;
      tree[index2] += entry.weight;
      var weightSum = 0;
      while (index2 > 0) {
        if (index2 % 2) {
          weightSum += tree[index2 + 1];
        }
        index2 = index2 - 1 >> 1;
        tree[index2] += entry.weight;
      }
      cc += entry.weight * weightSum;
    }));
    return cc;
  }
  var _$a = lodash_1;
  var barycenter_1 = barycenter$1;
  function barycenter$1(g, movable) {
    return _$a.map(movable, function(v) {
      var inV = g.inEdges(v);
      if (!inV.length) {
        return { v };
      } else {
        var result = _$a.reduce(inV, function(acc, e) {
          var edge = g.edge(e), nodeU = g.node(e.v);
          return {
            sum: acc.sum + edge.weight * nodeU.order,
            weight: acc.weight + edge.weight
          };
        }, { sum: 0, weight: 0 });
        return {
          v,
          barycenter: result.sum / result.weight,
          weight: result.weight
        };
      }
    });
  }
  var _$9 = lodash_1;
  var resolveConflicts_1 = resolveConflicts$1;
  function resolveConflicts$1(entries, cg) {
    var mappedEntries = {};
    _$9.forEach(entries, function(entry, i) {
      var tmp = mappedEntries[entry.v] = {
        indegree: 0,
        "in": [],
        out: [],
        vs: [entry.v],
        i
      };
      if (!_$9.isUndefined(entry.barycenter)) {
        tmp.barycenter = entry.barycenter;
        tmp.weight = entry.weight;
      }
    });
    _$9.forEach(cg.edges(), function(e) {
      var entryV = mappedEntries[e.v];
      var entryW = mappedEntries[e.w];
      if (!_$9.isUndefined(entryV) && !_$9.isUndefined(entryW)) {
        entryW.indegree++;
        entryV.out.push(mappedEntries[e.w]);
      }
    });
    var sourceSet = _$9.filter(mappedEntries, function(entry) {
      return !entry.indegree;
    });
    return doResolveConflicts(sourceSet);
  }
  function doResolveConflicts(sourceSet) {
    var entries = [];
    function handleIn(vEntry) {
      return function(uEntry) {
        if (uEntry.merged) {
          return;
        }
        if (_$9.isUndefined(uEntry.barycenter) || _$9.isUndefined(vEntry.barycenter) || uEntry.barycenter >= vEntry.barycenter) {
          mergeEntries(vEntry, uEntry);
        }
      };
    }
    function handleOut(vEntry) {
      return function(wEntry) {
        wEntry["in"].push(vEntry);
        if (--wEntry.indegree === 0) {
          sourceSet.push(wEntry);
        }
      };
    }
    while (sourceSet.length) {
      var entry = sourceSet.pop();
      entries.push(entry);
      _$9.forEach(entry["in"].reverse(), handleIn(entry));
      _$9.forEach(entry.out, handleOut(entry));
    }
    return _$9.map(
      _$9.filter(entries, function(entry2) {
        return !entry2.merged;
      }),
      function(entry2) {
        return _$9.pick(entry2, ["vs", "i", "barycenter", "weight"]);
      }
    );
  }
  function mergeEntries(target, source) {
    var sum = 0;
    var weight = 0;
    if (target.weight) {
      sum += target.barycenter * target.weight;
      weight += target.weight;
    }
    if (source.weight) {
      sum += source.barycenter * source.weight;
      weight += source.weight;
    }
    target.vs = source.vs.concat(target.vs);
    target.barycenter = sum / weight;
    target.weight = weight;
    target.i = Math.min(source.i, target.i);
    source.merged = true;
  }
  var _$8 = lodash_1;
  var util$5 = util$a;
  var sort_1 = sort$1;
  function sort$1(entries, biasRight) {
    var parts = util$5.partition(entries, function(entry) {
      return _$8.has(entry, "barycenter");
    });
    var sortable = parts.lhs, unsortable = _$8.sortBy(parts.rhs, function(entry) {
      return -entry.i;
    }), vs = [], sum = 0, weight = 0, vsIndex = 0;
    sortable.sort(compareWithBias(!!biasRight));
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    _$8.forEach(sortable, function(entry) {
      vsIndex += entry.vs.length;
      vs.push(entry.vs);
      sum += entry.barycenter * entry.weight;
      weight += entry.weight;
      vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    });
    var result = { vs: _$8.flatten(vs, true) };
    if (weight) {
      result.barycenter = sum / weight;
      result.weight = weight;
    }
    return result;
  }
  function consumeUnsortable(vs, unsortable, index2) {
    var last;
    while (unsortable.length && (last = _$8.last(unsortable)).i <= index2) {
      unsortable.pop();
      vs.push(last.vs);
      index2++;
    }
    return index2;
  }
  function compareWithBias(bias) {
    return function(entryV, entryW) {
      if (entryV.barycenter < entryW.barycenter) {
        return -1;
      } else if (entryV.barycenter > entryW.barycenter) {
        return 1;
      }
      return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
    };
  }
  var _$7 = lodash_1;
  var barycenter = barycenter_1;
  var resolveConflicts = resolveConflicts_1;
  var sort = sort_1;
  var sortSubgraph_1 = sortSubgraph$1;
  function sortSubgraph$1(g, v, cg, biasRight) {
    var movable = g.children(v);
    var node = g.node(v);
    var bl = node ? node.borderLeft : void 0;
    var br = node ? node.borderRight : void 0;
    var subgraphs = {};
    if (bl) {
      movable = _$7.filter(movable, function(w) {
        return w !== bl && w !== br;
      });
    }
    var barycenters = barycenter(g, movable);
    _$7.forEach(barycenters, function(entry) {
      if (g.children(entry.v).length) {
        var subgraphResult = sortSubgraph$1(g, entry.v, cg, biasRight);
        subgraphs[entry.v] = subgraphResult;
        if (_$7.has(subgraphResult, "barycenter")) {
          mergeBarycenters(entry, subgraphResult);
        }
      }
    });
    var entries = resolveConflicts(barycenters, cg);
    expandSubgraphs(entries, subgraphs);
    var result = sort(entries, biasRight);
    if (bl) {
      result.vs = _$7.flatten([bl, result.vs, br], true);
      if (g.predecessors(bl).length) {
        var blPred = g.node(g.predecessors(bl)[0]), brPred = g.node(g.predecessors(br)[0]);
        if (!_$7.has(result, "barycenter")) {
          result.barycenter = 0;
          result.weight = 0;
        }
        result.barycenter = (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
        result.weight += 2;
      }
    }
    return result;
  }
  function expandSubgraphs(entries, subgraphs) {
    _$7.forEach(entries, function(entry) {
      entry.vs = _$7.flatten(entry.vs.map(function(v) {
        if (subgraphs[v]) {
          return subgraphs[v].vs;
        }
        return v;
      }), true);
    });
  }
  function mergeBarycenters(target, other) {
    if (!_$7.isUndefined(target.barycenter)) {
      target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
      target.weight += other.weight;
    } else {
      target.barycenter = other.barycenter;
      target.weight = other.weight;
    }
  }
  var _$6 = lodash_1;
  var Graph$4 = graphlib_1.Graph;
  var buildLayerGraph_1 = buildLayerGraph$1;
  function buildLayerGraph$1(g, rank2, relationship) {
    var root = createRootNode(g), result = new Graph$4({ compound: true }).setGraph({ root }).setDefaultNodeLabel(function(v) {
      return g.node(v);
    });
    _$6.forEach(g.nodes(), function(v) {
      var node = g.node(v), parent = g.parent(v);
      if (node.rank === rank2 || node.minRank <= rank2 && rank2 <= node.maxRank) {
        result.setNode(v);
        result.setParent(v, parent || root);
        _$6.forEach(g[relationship](v), function(e) {
          var u = e.v === v ? e.w : e.v, edge = result.edge(u, v), weight = !_$6.isUndefined(edge) ? edge.weight : 0;
          result.setEdge(u, v, { weight: g.edge(e).weight + weight });
        });
        if (_$6.has(node, "minRank")) {
          result.setNode(v, {
            borderLeft: node.borderLeft[rank2],
            borderRight: node.borderRight[rank2]
          });
        }
      }
    });
    return result;
  }
  function createRootNode(g) {
    var v;
    while (g.hasNode(v = _$6.uniqueId("_root"))) ;
    return v;
  }
  var _$5 = lodash_1;
  var addSubgraphConstraints_1 = addSubgraphConstraints$1;
  function addSubgraphConstraints$1(g, cg, vs) {
    var prev = {}, rootPrev;
    _$5.forEach(vs, function(v) {
      var child = g.parent(v), parent, prevChild;
      while (child) {
        parent = g.parent(child);
        if (parent) {
          prevChild = prev[parent];
          prev[parent] = child;
        } else {
          prevChild = rootPrev;
          rootPrev = child;
        }
        if (prevChild && prevChild !== child) {
          cg.setEdge(prevChild, child);
          return;
        }
        child = parent;
      }
    });
  }
  var _$4 = lodash_1;
  var initOrder = initOrder_1;
  var crossCount = crossCount_1;
  var sortSubgraph = sortSubgraph_1;
  var buildLayerGraph = buildLayerGraph_1;
  var addSubgraphConstraints = addSubgraphConstraints_1;
  var Graph$3 = graphlib_1.Graph;
  var util$4 = util$a;
  var order_1 = order$1;
  function order$1(g) {
    var maxRank2 = util$4.maxRank(g), downLayerGraphs = buildLayerGraphs(g, _$4.range(1, maxRank2 + 1), "inEdges"), upLayerGraphs = buildLayerGraphs(g, _$4.range(maxRank2 - 1, -1, -1), "outEdges");
    var layering = initOrder(g);
    assignOrder(g, layering);
    var bestCC = Number.POSITIVE_INFINITY, best;
    for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
      sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);
      layering = util$4.buildLayerMatrix(g);
      var cc = crossCount(g, layering);
      if (cc < bestCC) {
        lastBest = 0;
        best = _$4.cloneDeep(layering);
        bestCC = cc;
      }
    }
    assignOrder(g, best);
  }
  function buildLayerGraphs(g, ranks, relationship) {
    return _$4.map(ranks, function(rank2) {
      return buildLayerGraph(g, rank2, relationship);
    });
  }
  function sweepLayerGraphs(layerGraphs, biasRight) {
    var cg = new Graph$3();
    _$4.forEach(layerGraphs, function(lg) {
      var root = lg.graph().root;
      var sorted = sortSubgraph(lg, root, cg, biasRight);
      _$4.forEach(sorted.vs, function(v, i) {
        lg.node(v).order = i;
      });
      addSubgraphConstraints(lg, cg, sorted.vs);
    });
  }
  function assignOrder(g, layering) {
    _$4.forEach(layering, function(layer) {
      _$4.forEach(layer, function(v, i) {
        g.node(v).order = i;
      });
    });
  }
  var _$3 = lodash_1;
  var Graph$2 = graphlib_1.Graph;
  var util$3 = util$a;
  var bk = {
    positionX: positionX$1
  };
  function findType1Conflicts(g, layering) {
    var conflicts = {};
    function visitLayer(prevLayer, layer) {
      var k0 = 0, scanPos = 0, prevLayerLength = prevLayer.length, lastNode = _$3.last(layer);
      _$3.forEach(layer, function(v, i) {
        var w = findOtherInnerSegmentNode(g, v), k1 = w ? g.node(w).order : prevLayerLength;
        if (w || v === lastNode) {
          _$3.forEach(layer.slice(scanPos, i + 1), function(scanNode) {
            _$3.forEach(g.predecessors(scanNode), function(u) {
              var uLabel = g.node(u), uPos = uLabel.order;
              if ((uPos < k0 || k1 < uPos) && !(uLabel.dummy && g.node(scanNode).dummy)) {
                addConflict(conflicts, u, scanNode);
              }
            });
          });
          scanPos = i + 1;
          k0 = k1;
        }
      });
      return layer;
    }
    _$3.reduce(layering, visitLayer);
    return conflicts;
  }
  function findType2Conflicts(g, layering) {
    var conflicts = {};
    function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
      var v;
      _$3.forEach(_$3.range(southPos, southEnd), function(i) {
        v = south[i];
        if (g.node(v).dummy) {
          _$3.forEach(g.predecessors(v), function(u) {
            var uNode = g.node(u);
            if (uNode.dummy && (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)) {
              addConflict(conflicts, u, v);
            }
          });
        }
      });
    }
    function visitLayer(north, south) {
      var prevNorthPos = -1, nextNorthPos, southPos = 0;
      _$3.forEach(south, function(v, southLookahead) {
        if (g.node(v).dummy === "border") {
          var predecessors = g.predecessors(v);
          if (predecessors.length) {
            nextNorthPos = g.node(predecessors[0]).order;
            scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
            southPos = southLookahead;
            prevNorthPos = nextNorthPos;
          }
        }
        scan(south, southPos, south.length, nextNorthPos, north.length);
      });
      return south;
    }
    _$3.reduce(layering, visitLayer);
    return conflicts;
  }
  function findOtherInnerSegmentNode(g, v) {
    if (g.node(v).dummy) {
      return _$3.find(g.predecessors(v), function(u) {
        return g.node(u).dummy;
      });
    }
  }
  function addConflict(conflicts, v, w) {
    if (v > w) {
      var tmp = v;
      v = w;
      w = tmp;
    }
    var conflictsV = conflicts[v];
    if (!conflictsV) {
      conflicts[v] = conflictsV = {};
    }
    conflictsV[w] = true;
  }
  function hasConflict(conflicts, v, w) {
    if (v > w) {
      var tmp = v;
      v = w;
      w = tmp;
    }
    return _$3.has(conflicts[v], w);
  }
  function verticalAlignment(g, layering, conflicts, neighborFn) {
    var root = {}, align = {}, pos = {};
    _$3.forEach(layering, function(layer) {
      _$3.forEach(layer, function(v, order2) {
        root[v] = v;
        align[v] = v;
        pos[v] = order2;
      });
    });
    _$3.forEach(layering, function(layer) {
      var prevIdx = -1;
      _$3.forEach(layer, function(v) {
        var ws = neighborFn(v);
        if (ws.length) {
          ws = _$3.sortBy(ws, function(w2) {
            return pos[w2];
          });
          var mp = (ws.length - 1) / 2;
          for (var i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
            var w = ws[i];
            if (align[v] === v && prevIdx < pos[w] && !hasConflict(conflicts, v, w)) {
              align[w] = v;
              align[v] = root[v] = root[w];
              prevIdx = pos[w];
            }
          }
        }
      });
    });
    return { root, align };
  }
  function horizontalCompaction(g, layering, root, align, reverseSep) {
    var xs = {}, blockG = buildBlockGraph(g, layering, root, reverseSep), borderType = reverseSep ? "borderLeft" : "borderRight";
    function iterate(setXsFunc, nextNodesFunc) {
      var stack = blockG.nodes();
      var elem = stack.pop();
      var visited = {};
      while (elem) {
        if (visited[elem]) {
          setXsFunc(elem);
        } else {
          visited[elem] = true;
          stack.push(elem);
          stack = stack.concat(nextNodesFunc(elem));
        }
        elem = stack.pop();
      }
    }
    function pass1(elem) {
      xs[elem] = blockG.inEdges(elem).reduce(function(acc, e) {
        return Math.max(acc, xs[e.v] + blockG.edge(e));
      }, 0);
    }
    function pass2(elem) {
      var min2 = blockG.outEdges(elem).reduce(function(acc, e) {
        return Math.min(acc, xs[e.w] - blockG.edge(e));
      }, Number.POSITIVE_INFINITY);
      var node = g.node(elem);
      if (min2 !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
        xs[elem] = Math.max(xs[elem], min2);
      }
    }
    iterate(pass1, blockG.predecessors.bind(blockG));
    iterate(pass2, blockG.successors.bind(blockG));
    _$3.forEach(align, function(v) {
      xs[v] = xs[root[v]];
    });
    return xs;
  }
  function buildBlockGraph(g, layering, root, reverseSep) {
    var blockGraph = new Graph$2(), graphLabel = g.graph(), sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);
    _$3.forEach(layering, function(layer) {
      var u;
      _$3.forEach(layer, function(v) {
        var vRoot = root[v];
        blockGraph.setNode(vRoot);
        if (u) {
          var uRoot = root[u], prevMax = blockGraph.edge(uRoot, vRoot);
          blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g, v, u), prevMax || 0));
        }
        u = v;
      });
    });
    return blockGraph;
  }
  function findSmallestWidthAlignment(g, xss) {
    return _$3.minBy(_$3.values(xss), function(xs) {
      var max2 = Number.NEGATIVE_INFINITY;
      var min2 = Number.POSITIVE_INFINITY;
      _$3.forIn(xs, function(x2, v) {
        var halfWidth = width(g, v) / 2;
        max2 = Math.max(x2 + halfWidth, max2);
        min2 = Math.min(x2 - halfWidth, min2);
      });
      return max2 - min2;
    });
  }
  function alignCoordinates(xss, alignTo) {
    var alignToVals = _$3.values(alignTo), alignToMin = _$3.min(alignToVals), alignToMax = _$3.max(alignToVals);
    _$3.forEach(["u", "d"], function(vert) {
      _$3.forEach(["l", "r"], function(horiz) {
        var alignment = vert + horiz, xs = xss[alignment], delta;
        if (xs === alignTo) return;
        var xsVals = _$3.values(xs);
        delta = horiz === "l" ? alignToMin - _$3.min(xsVals) : alignToMax - _$3.max(xsVals);
        if (delta) {
          xss[alignment] = _$3.mapValues(xs, function(x2) {
            return x2 + delta;
          });
        }
      });
    });
  }
  function balance(xss, align) {
    return _$3.mapValues(xss.ul, function(ignore, v) {
      if (align) {
        return xss[align.toLowerCase()][v];
      } else {
        var xs = _$3.sortBy(_$3.map(xss, v));
        return (xs[1] + xs[2]) / 2;
      }
    });
  }
  function positionX$1(g) {
    var layering = util$3.buildLayerMatrix(g);
    var conflicts = _$3.merge(
      findType1Conflicts(g, layering),
      findType2Conflicts(g, layering)
    );
    var xss = {};
    var adjustedLayering;
    _$3.forEach(["u", "d"], function(vert) {
      adjustedLayering = vert === "u" ? layering : _$3.values(layering).reverse();
      _$3.forEach(["l", "r"], function(horiz) {
        if (horiz === "r") {
          adjustedLayering = _$3.map(adjustedLayering, function(inner) {
            return _$3.values(inner).reverse();
          });
        }
        var neighborFn = (vert === "u" ? g.predecessors : g.successors).bind(g);
        var align = verticalAlignment(g, adjustedLayering, conflicts, neighborFn);
        var xs = horizontalCompaction(
          g,
          adjustedLayering,
          align.root,
          align.align,
          horiz === "r"
        );
        if (horiz === "r") {
          xs = _$3.mapValues(xs, function(x2) {
            return -x2;
          });
        }
        xss[vert + horiz] = xs;
      });
    });
    var smallestWidth = findSmallestWidthAlignment(g, xss);
    alignCoordinates(xss, smallestWidth);
    return balance(xss, g.graph().align);
  }
  function sep(nodeSep, edgeSep, reverseSep) {
    return function(g, v, w) {
      var vLabel = g.node(v);
      var wLabel = g.node(w);
      var sum = 0;
      var delta;
      sum += vLabel.width / 2;
      if (_$3.has(vLabel, "labelpos")) {
        switch (vLabel.labelpos.toLowerCase()) {
          case "l":
            delta = -vLabel.width / 2;
            break;
          case "r":
            delta = vLabel.width / 2;
            break;
        }
      }
      if (delta) {
        sum += reverseSep ? delta : -delta;
      }
      delta = 0;
      sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
      sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;
      sum += wLabel.width / 2;
      if (_$3.has(wLabel, "labelpos")) {
        switch (wLabel.labelpos.toLowerCase()) {
          case "l":
            delta = wLabel.width / 2;
            break;
          case "r":
            delta = -wLabel.width / 2;
            break;
        }
      }
      if (delta) {
        sum += reverseSep ? delta : -delta;
      }
      delta = 0;
      return sum;
    };
  }
  function width(g, v) {
    return g.node(v).width;
  }
  var _$2 = lodash_1;
  var util$2 = util$a;
  var positionX = bk.positionX;
  var position_1 = position$1;
  function position$1(g) {
    g = util$2.asNonCompoundGraph(g);
    positionY(g);
    _$2.forEach(positionX(g), function(x2, v) {
      g.node(v).x = x2;
    });
  }
  function positionY(g) {
    var layering = util$2.buildLayerMatrix(g);
    var rankSep = g.graph().ranksep;
    var prevY = 0;
    _$2.forEach(layering, function(layer) {
      var maxHeight = _$2.max(_$2.map(layer, function(v) {
        return g.node(v).height;
      }));
      _$2.forEach(layer, function(v) {
        g.node(v).y = prevY + maxHeight / 2;
      });
      prevY += maxHeight + rankSep;
    });
  }
  var _$1 = lodash_1;
  var acyclic = acyclic$1;
  var normalize = normalize$1;
  var rank = rank_1;
  var normalizeRanks = util$a.normalizeRanks;
  var parentDummyChains = parentDummyChains_1;
  var removeEmptyRanks = util$a.removeEmptyRanks;
  var nestingGraph = nestingGraph$1;
  var addBorderSegments = addBorderSegments_1;
  var coordinateSystem = coordinateSystem$1;
  var order = order_1;
  var position = position_1;
  var util$1 = util$a;
  var Graph$1 = graphlib_1.Graph;
  var layout_1 = layout;
  function layout(g, opts) {
    var time2 = opts && opts.debugTiming ? util$1.time : util$1.notime;
    time2("layout", function() {
      var layoutGraph = time2("  buildLayoutGraph", function() {
        return buildLayoutGraph(g);
      });
      time2("  runLayout", function() {
        runLayout(layoutGraph, time2);
      });
      time2("  updateInputGraph", function() {
        updateInputGraph(g, layoutGraph);
      });
    });
  }
  function runLayout(g, time2) {
    time2("    makeSpaceForEdgeLabels", function() {
      makeSpaceForEdgeLabels(g);
    });
    time2("    removeSelfEdges", function() {
      removeSelfEdges(g);
    });
    time2("    acyclic", function() {
      acyclic.run(g);
    });
    time2("    nestingGraph.run", function() {
      nestingGraph.run(g);
    });
    time2("    rank", function() {
      rank(util$1.asNonCompoundGraph(g));
    });
    time2("    injectEdgeLabelProxies", function() {
      injectEdgeLabelProxies(g);
    });
    time2("    removeEmptyRanks", function() {
      removeEmptyRanks(g);
    });
    time2("    nestingGraph.cleanup", function() {
      nestingGraph.cleanup(g);
    });
    time2("    normalizeRanks", function() {
      normalizeRanks(g);
    });
    time2("    assignRankMinMax", function() {
      assignRankMinMax(g);
    });
    time2("    removeEdgeLabelProxies", function() {
      removeEdgeLabelProxies(g);
    });
    time2("    normalize.run", function() {
      normalize.run(g);
    });
    time2("    parentDummyChains", function() {
      parentDummyChains(g);
    });
    time2("    addBorderSegments", function() {
      addBorderSegments(g);
    });
    time2("    order", function() {
      order(g);
    });
    time2("    insertSelfEdges", function() {
      insertSelfEdges(g);
    });
    time2("    adjustCoordinateSystem", function() {
      coordinateSystem.adjust(g);
    });
    time2("    position", function() {
      position(g);
    });
    time2("    positionSelfEdges", function() {
      positionSelfEdges(g);
    });
    time2("    removeBorderNodes", function() {
      removeBorderNodes(g);
    });
    time2("    normalize.undo", function() {
      normalize.undo(g);
    });
    time2("    fixupEdgeLabelCoords", function() {
      fixupEdgeLabelCoords(g);
    });
    time2("    undoCoordinateSystem", function() {
      coordinateSystem.undo(g);
    });
    time2("    translateGraph", function() {
      translateGraph(g);
    });
    time2("    assignNodeIntersects", function() {
      assignNodeIntersects(g);
    });
    time2("    reversePoints", function() {
      reversePointsForReversedEdges(g);
    });
    time2("    acyclic.undo", function() {
      acyclic.undo(g);
    });
  }
  function updateInputGraph(inputGraph, layoutGraph) {
    _$1.forEach(inputGraph.nodes(), function(v) {
      var inputLabel = inputGraph.node(v);
      var layoutLabel = layoutGraph.node(v);
      if (inputLabel) {
        inputLabel.x = layoutLabel.x;
        inputLabel.y = layoutLabel.y;
        if (layoutGraph.children(v).length) {
          inputLabel.width = layoutLabel.width;
          inputLabel.height = layoutLabel.height;
        }
      }
    });
    _$1.forEach(inputGraph.edges(), function(e) {
      var inputLabel = inputGraph.edge(e);
      var layoutLabel = layoutGraph.edge(e);
      inputLabel.points = layoutLabel.points;
      if (_$1.has(layoutLabel, "x")) {
        inputLabel.x = layoutLabel.x;
        inputLabel.y = layoutLabel.y;
      }
    });
    inputGraph.graph().width = layoutGraph.graph().width;
    inputGraph.graph().height = layoutGraph.graph().height;
  }
  var graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
  var graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
  var graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
  var nodeNumAttrs = ["width", "height"];
  var nodeDefaults = { width: 0, height: 0 };
  var edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
  var edgeDefaults = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r"
  };
  var edgeAttrs = ["labelpos"];
  function buildLayoutGraph(inputGraph) {
    var g = new Graph$1({ multigraph: true, compound: true });
    var graph2 = canonicalize(inputGraph.graph());
    g.setGraph(_$1.merge(
      {},
      graphDefaults,
      selectNumberAttrs(graph2, graphNumAttrs),
      _$1.pick(graph2, graphAttrs)
    ));
    _$1.forEach(inputGraph.nodes(), function(v) {
      var node = canonicalize(inputGraph.node(v));
      g.setNode(v, _$1.defaults(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults));
      g.setParent(v, inputGraph.parent(v));
    });
    _$1.forEach(inputGraph.edges(), function(e) {
      var edge = canonicalize(inputGraph.edge(e));
      g.setEdge(e, _$1.merge(
        {},
        edgeDefaults,
        selectNumberAttrs(edge, edgeNumAttrs),
        _$1.pick(edge, edgeAttrs)
      ));
    });
    return g;
  }
  function makeSpaceForEdgeLabels(g) {
    var graph2 = g.graph();
    graph2.ranksep /= 2;
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      edge.minlen *= 2;
      if (edge.labelpos.toLowerCase() !== "c") {
        if (graph2.rankdir === "TB" || graph2.rankdir === "BT") {
          edge.width += edge.labeloffset;
        } else {
          edge.height += edge.labeloffset;
        }
      }
    });
  }
  function injectEdgeLabelProxies(g) {
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      if (edge.width && edge.height) {
        var v = g.node(e.v);
        var w = g.node(e.w);
        var label = { rank: (w.rank - v.rank) / 2 + v.rank, e };
        util$1.addDummyNode(g, "edge-proxy", label, "_ep");
      }
    });
  }
  function assignRankMinMax(g) {
    var maxRank2 = 0;
    _$1.forEach(g.nodes(), function(v) {
      var node = g.node(v);
      if (node.borderTop) {
        node.minRank = g.node(node.borderTop).rank;
        node.maxRank = g.node(node.borderBottom).rank;
        maxRank2 = _$1.max(maxRank2, node.maxRank);
      }
    });
    g.graph().maxRank = maxRank2;
  }
  function removeEdgeLabelProxies(g) {
    _$1.forEach(g.nodes(), function(v) {
      var node = g.node(v);
      if (node.dummy === "edge-proxy") {
        g.edge(node.e).labelRank = node.rank;
        g.removeNode(v);
      }
    });
  }
  function translateGraph(g) {
    var minX = Number.POSITIVE_INFINITY;
    var maxX = 0;
    var minY = Number.POSITIVE_INFINITY;
    var maxY = 0;
    var graphLabel = g.graph();
    var marginX = graphLabel.marginx || 0;
    var marginY = graphLabel.marginy || 0;
    function getExtremes(attrs) {
      var x2 = attrs.x;
      var y2 = attrs.y;
      var w = attrs.width;
      var h = attrs.height;
      minX = Math.min(minX, x2 - w / 2);
      maxX = Math.max(maxX, x2 + w / 2);
      minY = Math.min(minY, y2 - h / 2);
      maxY = Math.max(maxY, y2 + h / 2);
    }
    _$1.forEach(g.nodes(), function(v) {
      getExtremes(g.node(v));
    });
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      if (_$1.has(edge, "x")) {
        getExtremes(edge);
      }
    });
    minX -= marginX;
    minY -= marginY;
    _$1.forEach(g.nodes(), function(v) {
      var node = g.node(v);
      node.x -= minX;
      node.y -= minY;
    });
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      _$1.forEach(edge.points, function(p) {
        p.x -= minX;
        p.y -= minY;
      });
      if (_$1.has(edge, "x")) {
        edge.x -= minX;
      }
      if (_$1.has(edge, "y")) {
        edge.y -= minY;
      }
    });
    graphLabel.width = maxX - minX + marginX;
    graphLabel.height = maxY - minY + marginY;
  }
  function assignNodeIntersects(g) {
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      var nodeV = g.node(e.v);
      var nodeW = g.node(e.w);
      var p1, p2;
      if (!edge.points) {
        edge.points = [];
        p1 = nodeW;
        p2 = nodeV;
      } else {
        p1 = edge.points[0];
        p2 = edge.points[edge.points.length - 1];
      }
      edge.points.unshift(util$1.intersectRect(nodeV, p1));
      edge.points.push(util$1.intersectRect(nodeW, p2));
    });
  }
  function fixupEdgeLabelCoords(g) {
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      if (_$1.has(edge, "x")) {
        if (edge.labelpos === "l" || edge.labelpos === "r") {
          edge.width -= edge.labeloffset;
        }
        switch (edge.labelpos) {
          case "l":
            edge.x -= edge.width / 2 + edge.labeloffset;
            break;
          case "r":
            edge.x += edge.width / 2 + edge.labeloffset;
            break;
        }
      }
    });
  }
  function reversePointsForReversedEdges(g) {
    _$1.forEach(g.edges(), function(e) {
      var edge = g.edge(e);
      if (edge.reversed) {
        edge.points.reverse();
      }
    });
  }
  function removeBorderNodes(g) {
    _$1.forEach(g.nodes(), function(v) {
      if (g.children(v).length) {
        var node = g.node(v);
        var t = g.node(node.borderTop);
        var b = g.node(node.borderBottom);
        var l = g.node(_$1.last(node.borderLeft));
        var r = g.node(_$1.last(node.borderRight));
        node.width = Math.abs(r.x - l.x);
        node.height = Math.abs(b.y - t.y);
        node.x = l.x + node.width / 2;
        node.y = t.y + node.height / 2;
      }
    });
    _$1.forEach(g.nodes(), function(v) {
      if (g.node(v).dummy === "border") {
        g.removeNode(v);
      }
    });
  }
  function removeSelfEdges(g) {
    _$1.forEach(g.edges(), function(e) {
      if (e.v === e.w) {
        var node = g.node(e.v);
        if (!node.selfEdges) {
          node.selfEdges = [];
        }
        node.selfEdges.push({ e, label: g.edge(e) });
        g.removeEdge(e);
      }
    });
  }
  function insertSelfEdges(g) {
    var layers = util$1.buildLayerMatrix(g);
    _$1.forEach(layers, function(layer) {
      var orderShift = 0;
      _$1.forEach(layer, function(v, i) {
        var node = g.node(v);
        node.order = i + orderShift;
        _$1.forEach(node.selfEdges, function(selfEdge) {
          util$1.addDummyNode(g, "selfedge", {
            width: selfEdge.label.width,
            height: selfEdge.label.height,
            rank: node.rank,
            order: i + ++orderShift,
            e: selfEdge.e,
            label: selfEdge.label
          }, "_se");
        });
        delete node.selfEdges;
      });
    });
  }
  function positionSelfEdges(g) {
    _$1.forEach(g.nodes(), function(v) {
      var node = g.node(v);
      if (node.dummy === "selfedge") {
        var selfNode = g.node(node.e.v);
        var x2 = selfNode.x + selfNode.width / 2;
        var y2 = selfNode.y;
        var dx = node.x - x2;
        var dy = selfNode.height / 2;
        g.setEdge(node.e, node.label);
        g.removeNode(v);
        node.label.points = [
          { x: x2 + 2 * dx / 3, y: y2 - dy },
          { x: x2 + 5 * dx / 6, y: y2 - dy },
          { x: x2 + dx, y: y2 },
          { x: x2 + 5 * dx / 6, y: y2 + dy },
          { x: x2 + 2 * dx / 3, y: y2 + dy }
        ];
        node.label.x = node.x;
        node.label.y = node.y;
      }
    });
  }
  function selectNumberAttrs(obj2, attrs) {
    return _$1.mapValues(_$1.pick(obj2, attrs), Number);
  }
  function canonicalize(attrs) {
    var newAttrs = {};
    _$1.forEach(attrs, function(v, k) {
      newAttrs[k.toLowerCase()] = v;
    });
    return newAttrs;
  }
  var _ = lodash_1;
  var util = util$a;
  var Graph = graphlib_1.Graph;
  var debug = {
    debugOrdering
  };
  function debugOrdering(g) {
    var layerMatrix = util.buildLayerMatrix(g);
    var h = new Graph({ compound: true, multigraph: true }).setGraph({});
    _.forEach(g.nodes(), function(v) {
      h.setNode(v, { label: v });
      h.setParent(v, "layer" + g.node(v).rank);
    });
    _.forEach(g.edges(), function(e) {
      h.setEdge(e.v, e.w, {}, e.name);
    });
    _.forEach(layerMatrix, function(layer, i) {
      var layerV = "layer" + i;
      h.setNode(layerV, { rank: "same" });
      _.reduce(layer, function(u, v) {
        h.setEdge(u, v, { style: "invis" });
        return v;
      });
    });
    return h;
  }
  var version = "0.8.5";
  var dagre = {
    graphlib: graphlib_1,
    layout: layout_1,
    debug,
    util: {
      time: util$a.time,
      notime: util$a.notime
    },
    version
  };
  var dagre$1 = /* @__PURE__ */ getDefaultExportFromCjs(dagre);
  class DagreLayout {
    constructor(options) {
      this.id = "dagre";
      this.options = {};
      Object.assign(this.options, DagreLayout.defaultOptions, options);
    }
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericDagreLayout(false, graph2, Object.assign(Object.assign({}, this.options), options));
      });
    }
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericDagreLayout(true, graph2, Object.assign(Object.assign({}, this.options), options));
      });
    }
    genericDagreLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const { nodeSize } = options;
        const g = new dagre.graphlib.Graph();
        g.setGraph(options);
        g.setDefaultEdgeLabel(() => ({}));
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        if ([...nodes, ...edges].some(({ id }) => isNumber(id))) {
          console.error("Dagre layout only support string id, it will convert number to string.");
        }
        graph2.getAllNodes().forEach((node) => {
          const { id } = node;
          const data = Object.assign({}, node.data);
          if (nodeSize !== void 0) {
            const [width2, height] = parseSize(isFunction(nodeSize) ? nodeSize(node) : nodeSize);
            Object.assign(data, { width: width2, height });
          }
          g.setNode(id.toString(), data);
        });
        graph2.getAllEdges().forEach(({ id, source, target }) => {
          g.setEdge(source.toString(), target.toString(), { id });
        });
        dagre$1.layout(g);
        const mapping = { nodes: [], edges: [] };
        g.nodes().forEach((id) => {
          const data = g.node(id);
          mapping.nodes.push({ id, data });
          if (assign)
            graph2.mergeNodeData(id, data);
        });
        g.edges().forEach((edge) => {
          const _a2 = g.edge(edge), { id } = _a2, data = __rest(_a2, ["id"]);
          const { v: source, w: target } = edge;
          mapping.edges.push({ id, source, target, data });
          if (assign)
            graph2.mergeEdgeData(id, data);
        });
        return mapping;
      });
    }
  }
  DagreLayout.defaultOptions = {};
  class Body {
    constructor(params) {
      this.id = params.id || 0;
      this.rx = params.rx;
      this.ry = params.ry;
      this.fx = 0;
      this.fy = 0;
      this.mass = params.mass;
      this.degree = params.degree;
      this.g = params.g || 0;
    }
    // returns the euclidean distance
    distanceTo(bo) {
      const dx = this.rx - bo.rx;
      const dy = this.ry - bo.ry;
      return Math.hypot(dx, dy);
    }
    setPos(x2, y2) {
      this.rx = x2;
      this.ry = y2;
    }
    // resets the forces
    resetForce() {
      this.fx = 0;
      this.fy = 0;
    }
    addForce(b) {
      const dx = b.rx - this.rx;
      const dy = b.ry - this.ry;
      let dist = Math.hypot(dx, dy);
      dist = dist < 1e-4 ? 1e-4 : dist;
      const F = this.g * (this.degree + 1) * (b.degree + 1) / dist;
      this.fx += F * dx / dist;
      this.fy += F * dy / dist;
    }
    // if quad contains this body
    in(quad) {
      return quad.contains(this.rx, this.ry);
    }
    // returns a new body
    add(bo) {
      const nenwMass = this.mass + bo.mass;
      const x2 = (this.rx * this.mass + bo.rx * bo.mass) / nenwMass;
      const y2 = (this.ry * this.mass + bo.ry * bo.mass) / nenwMass;
      const dg = this.degree + bo.degree;
      const params = {
        rx: x2,
        ry: y2,
        mass: nenwMass,
        degree: dg
      };
      return new Body(params);
    }
  }
  class Quad {
    constructor(params) {
      this.xmid = params.xmid;
      this.ymid = params.ymid;
      this.length = params.length;
      this.massCenter = params.massCenter || [0, 0];
      this.mass = params.mass || 1;
    }
    getLength() {
      return this.length;
    }
    contains(x2, y2) {
      const halfLen = this.length / 2;
      return x2 <= this.xmid + halfLen && x2 >= this.xmid - halfLen && y2 <= this.ymid + halfLen && y2 >= this.ymid - halfLen;
    }
    // northwest quadrant
    // tslint:disable-next-line
    NW() {
      const x2 = this.xmid - this.length / 4;
      const y2 = this.ymid + this.length / 4;
      const len = this.length / 2;
      const params = {
        xmid: x2,
        ymid: y2,
        length: len
      };
      const NW = new Quad(params);
      return NW;
    }
    // northeast
    // tslint:disable-next-line
    NE() {
      const x2 = this.xmid + this.length / 4;
      const y2 = this.ymid + this.length / 4;
      const len = this.length / 2;
      const params = {
        xmid: x2,
        ymid: y2,
        length: len
      };
      const NE = new Quad(params);
      return NE;
    }
    // southwest
    // tslint:disable-next-line
    SW() {
      const x2 = this.xmid - this.length / 4;
      const y2 = this.ymid - this.length / 4;
      const len = this.length / 2;
      const params = {
        xmid: x2,
        ymid: y2,
        length: len
      };
      const SW = new Quad(params);
      return SW;
    }
    // southeast
    // tslint:disable-next-line
    SE() {
      const x2 = this.xmid + this.length / 4;
      const y2 = this.ymid - this.length / 4;
      const len = this.length / 2;
      const params = {
        xmid: x2,
        ymid: y2,
        length: len
      };
      const SE = new Quad(params);
      return SE;
    }
  }
  class QuadTree {
    // each quadtree represents a quadrant and an aggregate body
    // that represents all bodies inside the quadrant
    constructor(param) {
      this.body = null;
      this.quad = null;
      this.NW = null;
      this.NE = null;
      this.SW = null;
      this.SE = null;
      this.theta = 0.5;
      if (param != null)
        this.quad = param;
    }
    // insert a body(node) into the tree
    insert(bo) {
      if (this.body == null) {
        this.body = bo;
        return;
      }
      if (!this._isExternal()) {
        this.body = this.body.add(bo);
        this._putBody(bo);
      } else {
        if (this.quad) {
          this.NW = new QuadTree(this.quad.NW());
          this.NE = new QuadTree(this.quad.NE());
          this.SW = new QuadTree(this.quad.SW());
          this.SE = new QuadTree(this.quad.SE());
        }
        this._putBody(this.body);
        this._putBody(bo);
        this.body = this.body.add(bo);
      }
    }
    // inserts bo into a quad
    // tslint:disable-next-line
    _putBody(bo) {
      if (!this.quad)
        return;
      if (bo.in(this.quad.NW()) && this.NW)
        this.NW.insert(bo);
      else if (bo.in(this.quad.NE()) && this.NE)
        this.NE.insert(bo);
      else if (bo.in(this.quad.SW()) && this.SW)
        this.SW.insert(bo);
      else if (bo.in(this.quad.SE()) && this.SE)
        this.SE.insert(bo);
    }
    // tslint:disable-next-line
    _isExternal() {
      return this.NW == null && this.NE == null && this.SW == null && this.SE == null;
    }
    // update the forces
    updateForce(bo) {
      if (this.body == null || bo === this.body) {
        return;
      }
      if (this._isExternal())
        bo.addForce(this.body);
      else {
        const s = this.quad ? this.quad.getLength() : 0;
        const d = this.body.distanceTo(bo);
        if (s / d < this.theta)
          bo.addForce(this.body);
        else {
          this.NW && this.NW.updateForce(bo);
          this.NE && this.NE.updateForce(bo);
          this.SW && this.SW.updateForce(bo);
          this.SE && this.SE.updateForce(bo);
        }
      }
    }
  }
  const DEFAULTS_LAYOUT_OPTIONS$5 = {
    center: [0, 0],
    width: 300,
    height: 300,
    kr: 5,
    kg: 1,
    mode: "normal",
    preventOverlap: false,
    dissuadeHubs: false,
    maxIteration: 0,
    ks: 0.1,
    ksmax: 10,
    tao: 0.1
  };
  class ForceAtlas2Layout {
    constructor(options = {}) {
      this.options = options;
      this.id = "forceAtlas2";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$5), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericForceAtlas2Layout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericForceAtlas2Layout(true, graph2, options);
      });
    }
    genericForceAtlas2Layout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const edges = graph2.getAllEdges();
        const nodes = graph2.getAllNodes();
        const mergedOptions = this.formatOptions(options, nodes.length);
        const { width: width2, height, prune, maxIteration, nodeSize, center } = mergedOptions;
        if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length) || nodes.length === 1) {
          return handleSingleNodeGraph(graph2, assign, center);
        }
        const calcNodes = nodes.map((node) => cloneFormatData(node, [width2, height]));
        const calcEdges = edges.filter((edge) => {
          const { source, target } = edge;
          return source !== target;
        });
        const calcGraph = new Graph$8({
          nodes: calcNodes,
          edges: calcEdges
        });
        const sizes = this.getSizes(calcGraph, nodeSize);
        this.run(calcGraph, graph2, maxIteration, sizes, assign, mergedOptions);
        if (prune) {
          for (let j = 0; j < calcEdges.length; j += 1) {
            const { source, target } = calcEdges[j];
            const sourceDegree = calcGraph.getDegree(source);
            const targetDegree = calcGraph.getDegree(source);
            if (sourceDegree <= 1) {
              const targetNode = calcGraph.getNode(target);
              calcGraph.mergeNodeData(source, {
                x: targetNode.data.x,
                y: targetNode.data.y
              });
            } else if (targetDegree <= 1) {
              const sourceNode = calcGraph.getNode(source);
              calcGraph.mergeNodeData(target, {
                x: sourceNode.data.x,
                y: sourceNode.data.y
              });
            }
          }
          const postOptions = Object.assign(Object.assign({}, mergedOptions), { prune: false, barnesHut: false });
          this.run(calcGraph, graph2, 100, sizes, assign, postOptions);
        }
        return {
          nodes: calcNodes,
          edges
        };
      });
    }
    /**
     * Init the node positions if there is no initial positions.
     * And pre-calculate the size (max of width and height) for each node.
     * @param calcGraph graph for calculation
     * @param nodeSize node size config from layout options
     * @returns {SizeMap} node'id mapped to max of its width and height
     */
    getSizes(calcGraph, nodeSize) {
      const nodes = calcGraph.getAllNodes();
      const sizes = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        sizes[node.id] = formatNodeSizeToNumber(nodeSize, void 0)(node);
      }
      return sizes;
    }
    /**
     * Format the options.
     * @param options input options
     * @param nodeNum number of nodes
     * @returns formatted options
     */
    formatOptions(options = {}, nodeNum) {
      const mergedOptions = Object.assign(Object.assign({}, this.options), options);
      const { center, width: width2, height, barnesHut, prune, maxIteration, kr, kg } = mergedOptions;
      mergedOptions.width = !width2 && typeof window !== "undefined" ? window.innerWidth : width2;
      mergedOptions.height = !height && typeof window !== "undefined" ? window.innerHeight : height;
      mergedOptions.center = !center ? [mergedOptions.width / 2, mergedOptions.height / 2] : center;
      if (barnesHut === void 0 && nodeNum > 250) {
        mergedOptions.barnesHut = true;
      }
      if (prune === void 0 && nodeNum > 100)
        mergedOptions.prune = true;
      if (maxIteration === 0 && !prune) {
        mergedOptions.maxIteration = 250;
        if (nodeNum <= 200 && nodeNum > 100)
          mergedOptions.maxIteration = 1e3;
        else if (nodeNum > 200)
          mergedOptions.maxIteration = 1200;
      } else if (maxIteration === 0 && prune) {
        mergedOptions.maxIteration = 100;
        if (nodeNum <= 200 && nodeNum > 100)
          mergedOptions.maxIteration = 500;
        else if (nodeNum > 200)
          mergedOptions.maxIteration = 950;
      }
      if (!kr) {
        mergedOptions.kr = 50;
        if (nodeNum > 100 && nodeNum <= 500)
          mergedOptions.kr = 20;
        else if (nodeNum > 500)
          mergedOptions.kr = 1;
      }
      if (!kg) {
        mergedOptions.kg = 20;
        if (nodeNum > 100 && nodeNum <= 500)
          mergedOptions.kg = 10;
        else if (nodeNum > 500)
          mergedOptions.kg = 1;
      }
      return mergedOptions;
    }
    /**
     * Loops for fa2.
     * @param calcGraph graph for calculation
     * @param graph original graph
     * @param iteration iteration number
     * @param sizes nodes' size
     * @param options formatted layout options
     * @returns
     */
    run(calcGraph, graph2, iteration, sizes, assign, options) {
      const { kr, barnesHut, onTick } = options;
      const calcNodes = calcGraph.getAllNodes();
      let sg = 0;
      let iter = iteration;
      const forces = {};
      const preForces = {};
      const bodies = {};
      for (let i = 0; i < calcNodes.length; i += 1) {
        const { data, id } = calcNodes[i];
        forces[id] = [0, 0];
        if (barnesHut) {
          const params = {
            id: i,
            rx: data.x,
            ry: data.y,
            mass: 1,
            g: kr,
            degree: calcGraph.getDegree(id)
          };
          bodies[id] = new Body(params);
        }
      }
      while (iter > 0) {
        sg = this.oneStep(calcGraph, {
          iter,
          preventOverlapIters: 50,
          krPrime: 100,
          sg,
          forces,
          preForces,
          bodies,
          sizes
        }, options);
        iter--;
        onTick === null || onTick === void 0 ? void 0 : onTick({
          nodes: calcNodes,
          edges: graph2.getAllEdges()
        });
      }
      return calcGraph;
    }
    /**
     * One step for a loop.
     * @param graph graph for calculation
     * @param params parameters for a loop
     * @param options formatted layout's input options
     * @returns
     */
    oneStep(graph2, params, options) {
      const { iter, preventOverlapIters, krPrime, sg, preForces, bodies, sizes } = params;
      let { forces } = params;
      const { preventOverlap, barnesHut } = options;
      const nodes = graph2.getAllNodes();
      for (let i = 0; i < nodes.length; i += 1) {
        const { id } = nodes[i];
        preForces[id] = [...forces[id]];
        forces[id] = [0, 0];
      }
      forces = this.getAttrForces(graph2, iter, preventOverlapIters, sizes, forces, options);
      if (barnesHut && (preventOverlap && iter > preventOverlapIters || !preventOverlap)) {
        forces = this.getOptRepGraForces(graph2, forces, bodies, options);
      } else {
        forces = this.getRepGraForces(graph2, iter, preventOverlapIters, forces, krPrime, sizes, options);
      }
      return this.updatePos(graph2, forces, preForces, sg, options);
    }
    /**
     * Calculate the attract forces for nodes.
     * @param graph graph for calculation
     * @param iter current iteration index
     * @param preventOverlapIters the iteration number for preventing overlappings
     * @param sizes nodes' sizes
     * @param forces forces for nodes, which will be modified
     * @param options formatted layout's input options
     * @returns
     */
    getAttrForces(graph2, iter, preventOverlapIters, sizes, forces, options) {
      const { preventOverlap, dissuadeHubs, mode, prune } = options;
      const edges = graph2.getAllEdges();
      for (let i = 0; i < edges.length; i += 1) {
        const { source, target } = edges[i];
        const sourceNode = graph2.getNode(source);
        const targetNode = graph2.getNode(target);
        const sourceDegree = graph2.getDegree(source);
        const targetDegree = graph2.getDegree(target);
        if (prune && (sourceDegree <= 1 || targetDegree <= 1))
          continue;
        const dir = [
          targetNode.data.x - sourceNode.data.x,
          targetNode.data.y - sourceNode.data.y
        ];
        let eucliDis = Math.hypot(dir[0], dir[1]);
        eucliDis = eucliDis < 1e-4 ? 1e-4 : eucliDis;
        dir[0] = dir[0] / eucliDis;
        dir[1] = dir[1] / eucliDis;
        if (preventOverlap && iter < preventOverlapIters) {
          eucliDis = eucliDis - sizes[source] - sizes[target];
        }
        let fa1 = eucliDis;
        let fa2 = fa1;
        if (mode === "linlog") {
          fa1 = Math.log(1 + eucliDis);
          fa2 = fa1;
        }
        if (dissuadeHubs) {
          fa1 = eucliDis / sourceDegree;
          fa2 = eucliDis / targetDegree;
        }
        if (preventOverlap && iter < preventOverlapIters && eucliDis <= 0) {
          fa1 = 0;
          fa2 = 0;
        } else if (preventOverlap && iter < preventOverlapIters && eucliDis > 0) {
          fa1 = eucliDis;
          fa2 = eucliDis;
        }
        forces[source][0] += fa1 * dir[0];
        forces[target][0] -= fa2 * dir[0];
        forces[source][1] += fa1 * dir[1];
        forces[target][1] -= fa2 * dir[1];
      }
      return forces;
    }
    /**
     * Calculate the repulsive forces for nodes under barnesHut mode.
     * @param graph graph for calculatiion
     * @param forces forces for nodes, which will be modified
     * @param bodies force body map
     * @param options formatted layout's input options
     * @returns
     */
    getOptRepGraForces(graph2, forces, bodies, options) {
      const { kg, center, prune } = options;
      const nodes = graph2.getAllNodes();
      const nodeNum = nodes.length;
      let minx = 9e10;
      let maxx = -9e10;
      let miny = 9e10;
      let maxy = -9e10;
      for (let i = 0; i < nodeNum; i += 1) {
        const { id, data } = nodes[i];
        if (prune && graph2.getDegree(id) <= 1)
          continue;
        bodies[id].setPos(data.x, data.y);
        if (data.x >= maxx)
          maxx = data.x;
        if (data.x <= minx)
          minx = data.x;
        if (data.y >= maxy)
          maxy = data.y;
        if (data.y <= miny)
          miny = data.y;
      }
      const width2 = Math.max(maxx - minx, maxy - miny);
      const quadParams = {
        xmid: (maxx + minx) / 2,
        ymid: (maxy + miny) / 2,
        length: width2,
        massCenter: center,
        mass: nodeNum
      };
      const quad = new Quad(quadParams);
      const quadTree = new QuadTree(quad);
      for (let i = 0; i < nodeNum; i += 1) {
        const { id } = nodes[i];
        if (prune && graph2.getDegree(id) <= 1)
          continue;
        if (bodies[id].in(quad))
          quadTree.insert(bodies[id]);
      }
      for (let i = 0; i < nodeNum; i += 1) {
        const { id, data } = nodes[i];
        const degree = graph2.getDegree(id);
        if (prune && degree <= 1)
          continue;
        bodies[id].resetForce();
        quadTree.updateForce(bodies[id]);
        forces[id][0] -= bodies[id].fx;
        forces[id][1] -= bodies[id].fy;
        const dir = [data.x - center[0], data.y - center[1]];
        let eucliDis = Math.hypot(dir[0], dir[1]);
        eucliDis = eucliDis < 1e-4 ? 1e-4 : eucliDis;
        dir[0] = dir[0] / eucliDis;
        dir[1] = dir[1] / eucliDis;
        const fg = kg * (degree + 1);
        forces[id][0] -= fg * dir[0];
        forces[id][1] -= fg * dir[1];
      }
      return forces;
    }
    /**
     * Calculate the repulsive forces for nodes.
     * @param graph graph for calculatiion
     * @param iter current iteration index
     * @param preventOverlapIters the iteration number for preventing overlappings
     * @param forces forces for nodes, which will be modified
     * @param krPrime larger the krPrime, larger the repulsive force
     * @param sizes nodes' sizes
     * @param options formatted layout's input options
     * @returns
     */
    getRepGraForces(graph2, iter, preventOverlapIters, forces, krPrime, sizes, options) {
      const { preventOverlap, kr, kg, center, prune } = options;
      const nodes = graph2.getAllNodes();
      const nodeNum = nodes.length;
      for (let i = 0; i < nodeNum; i += 1) {
        const nodei = nodes[i];
        const degreei = graph2.getDegree(nodei.id);
        for (let j = i + 1; j < nodeNum; j += 1) {
          const nodej = nodes[j];
          const degreej = graph2.getDegree(nodej.id);
          if (prune && (degreei <= 1 || degreej <= 1))
            continue;
          const dir2 = [nodej.data.x - nodei.data.x, nodej.data.y - nodei.data.y];
          let eucliDis2 = Math.hypot(dir2[0], dir2[1]);
          eucliDis2 = eucliDis2 < 1e-4 ? 1e-4 : eucliDis2;
          dir2[0] = dir2[0] / eucliDis2;
          dir2[1] = dir2[1] / eucliDis2;
          if (preventOverlap && iter < preventOverlapIters) {
            eucliDis2 = eucliDis2 - sizes[nodei.id] - sizes[nodej.id];
          }
          let fr = kr * (degreei + 1) * (degreej + 1) / eucliDis2;
          if (preventOverlap && iter < preventOverlapIters && eucliDis2 < 0) {
            fr = krPrime * (degreei + 1) * (degreej + 1);
          } else if (preventOverlap && iter < preventOverlapIters && eucliDis2 === 0) {
            fr = 0;
          } else if (preventOverlap && iter < preventOverlapIters && eucliDis2 > 0) {
            fr = kr * (degreei + 1) * (degreej + 1) / eucliDis2;
          }
          forces[nodei.id][0] -= fr * dir2[0];
          forces[nodej.id][0] += fr * dir2[0];
          forces[nodei.id][1] -= fr * dir2[1];
          forces[nodej.id][1] += fr * dir2[1];
        }
        const dir = [nodei.data.x - center[0], nodei.data.y - center[1]];
        const eucliDis = Math.hypot(dir[0], dir[1]);
        dir[0] = dir[0] / eucliDis;
        dir[1] = dir[1] / eucliDis;
        const fg = kg * (degreei + 1);
        forces[nodei.id][0] -= fg * dir[0];
        forces[nodei.id][1] -= fg * dir[1];
      }
      return forces;
    }
    /**
     * Update node positions.
     * @param graph graph for calculatiion
     * @param forces forces for nodes, which will be modified
     * @param preForces previous forces for nodes, which will be modified
     * @param sg constant for move distance of one step
     * @param options formatted layout's input options
     * @returns
     */
    updatePos(graph2, forces, preForces, sg, options) {
      const { ks, tao, prune, ksmax } = options;
      const nodes = graph2.getAllNodes();
      const nodeNum = nodes.length;
      const swgns = [];
      const trans = [];
      let swgG = 0;
      let traG = 0;
      let usingSg = sg;
      for (let i = 0; i < nodeNum; i += 1) {
        const { id } = nodes[i];
        const degree = graph2.getDegree(id);
        if (prune && degree <= 1)
          continue;
        const minus = [
          forces[id][0] - preForces[id][0],
          forces[id][1] - preForces[id][1]
        ];
        const minusNorm = Math.hypot(minus[0], minus[1]);
        const add2 = [
          forces[id][0] + preForces[id][0],
          forces[id][1] + preForces[id][1]
        ];
        const addNorm = Math.hypot(add2[0], add2[1]);
        swgns[i] = minusNorm;
        trans[i] = addNorm / 2;
        swgG += (degree + 1) * swgns[i];
        traG += (degree + 1) * trans[i];
      }
      const preSG = usingSg;
      usingSg = tao * traG / swgG;
      if (preSG !== 0) {
        usingSg = usingSg > 1.5 * preSG ? 1.5 * preSG : usingSg;
      }
      for (let i = 0; i < nodeNum; i += 1) {
        const { id, data } = nodes[i];
        const degree = graph2.getDegree(id);
        if (prune && degree <= 1)
          continue;
        if (isNumber(data.fx) && isNumber(data.fy))
          continue;
        let sn = ks * usingSg / (1 + usingSg * Math.sqrt(swgns[i]));
        let absForce = Math.hypot(forces[id][0], forces[id][1]);
        absForce = absForce < 1e-4 ? 1e-4 : absForce;
        const max2 = ksmax / absForce;
        sn = sn > max2 ? max2 : sn;
        const dnx = sn * forces[id][0];
        const dny = sn * forces[id][1];
        graph2.mergeNodeData(id, {
          x: data.x + dnx,
          y: data.y + dny
        });
      }
      return usingSg;
    }
  }
  const DEFAULTS_LAYOUT_OPTIONS$4 = {
    maxIteration: 1e3,
    gravity: 10,
    speed: 5,
    clustering: false,
    clusterGravity: 10,
    width: 300,
    height: 300,
    nodeClusterBy: "cluster"
  };
  const SPEED_DIVISOR$1 = 800;
  class FruchtermanLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "fruchterman";
      this.timeInterval = 0;
      this.running = false;
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$4), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericFruchtermanLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericFruchtermanLayout(true, graph2, options);
      });
    }
    /**
     * Stop simulation immediately.
     */
    stop() {
      if (this.timeInterval && typeof window !== "undefined") {
        window.clearInterval(this.timeInterval);
      }
      this.running = false;
    }
    /**
     * Manually steps the simulation by the specified number of iterations.
     * @see https://github.com/d3/d3-force#simulation_tick
     */
    tick(iterations = this.options.maxIteration || 1) {
      if (this.lastResult) {
        return this.lastResult;
      }
      for (let i = 0; i < iterations; i++) {
        this.runOneStep(this.lastGraph, this.lastClusterMap, this.lastOptions);
      }
      const result = {
        nodes: this.lastLayoutNodes,
        edges: this.lastLayoutEdges
      };
      if (this.lastAssign) {
        result.nodes.forEach((node) => this.lastGraph.mergeNodeData(node.id, {
          x: node.data.x,
          y: node.data.y,
          z: this.options.dimensions === 3 ? node.data.z : void 0
        }));
      }
      return result;
    }
    genericFruchtermanLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        if (this.running)
          return;
        const formattedOptions = this.formatOptions(options);
        const { dimensions, width: width2, height, center, clustering, nodeClusterBy, maxIteration, onTick } = formattedOptions;
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
          const result = { nodes: [], edges };
          this.lastResult = result;
          return result;
        }
        if (nodes.length === 1) {
          if (assign) {
            graph2.mergeNodeData(nodes[0].id, {
              x: center[0],
              y: center[1],
              z: dimensions === 3 ? center[2] : void 0
            });
          }
          const result = {
            nodes: [
              Object.assign(Object.assign({}, nodes[0]), { data: Object.assign(Object.assign({}, nodes[0].data), { x: center[0], y: center[1], z: dimensions === 3 ? center[2] : void 0 }) })
            ],
            edges
          };
          this.lastResult = result;
          return result;
        }
        const layoutNodes = nodes.map((node) => cloneFormatData(node, [width2, height]));
        const calcGraph = new Graph$8({
          nodes: layoutNodes,
          edges
        });
        const clusterMap = {};
        if (clustering) {
          layoutNodes.forEach((node) => {
            const clusterValue = node.data[nodeClusterBy];
            if (!clusterMap[clusterValue]) {
              clusterMap[clusterValue] = {
                name: clusterValue,
                cx: 0,
                cy: 0,
                count: 0
              };
            }
          });
        }
        this.lastLayoutNodes = layoutNodes;
        this.lastLayoutEdges = edges;
        this.lastAssign = assign;
        this.lastGraph = calcGraph;
        this.lastOptions = formattedOptions;
        this.lastClusterMap = clusterMap;
        if (typeof window === "undefined")
          return;
        let iter = 0;
        return new Promise((resolve) => {
          this.timeInterval = window.setInterval(() => {
            if (!this.running) {
              resolve({ nodes: layoutNodes, edges });
              return;
            }
            this.runOneStep(calcGraph, clusterMap, formattedOptions);
            if (assign) {
              layoutNodes.forEach(({ id, data }) => graph2.mergeNodeData(id, {
                x: data.x,
                y: data.y,
                z: dimensions === 3 ? data.z : void 0
              }));
            }
            onTick === null || onTick === void 0 ? void 0 : onTick({
              nodes: layoutNodes,
              edges
            });
            iter++;
            if (iter >= maxIteration) {
              window.clearInterval(this.timeInterval);
              resolve({ nodes: layoutNodes, edges });
            }
          }, 0);
          this.running = true;
        });
      });
    }
    formatOptions(options = {}) {
      const mergedOptions = Object.assign(Object.assign({}, this.options), options);
      const { clustering, nodeClusterBy } = mergedOptions;
      const { center: propsCenter, width: propsWidth, height: propsHeight } = mergedOptions;
      mergedOptions.width = !propsWidth && typeof window !== "undefined" ? window.innerWidth : propsWidth;
      mergedOptions.height = !propsHeight && typeof window !== "undefined" ? window.innerHeight : propsHeight;
      mergedOptions.center = !propsCenter ? [mergedOptions.width / 2, mergedOptions.height / 2] : propsCenter;
      mergedOptions.clustering = clustering && !!nodeClusterBy;
      return mergedOptions;
    }
    runOneStep(calcGraph, clusterMap, options) {
      const { dimensions, height, width: width2, gravity, center, speed, clustering, nodeClusterBy, clusterGravity: propsClusterGravity } = options;
      const area = height * width2;
      const maxDisplace = Math.sqrt(area) / 10;
      const nodes = calcGraph.getAllNodes();
      const k2 = area / (nodes.length + 1);
      const k = Math.sqrt(k2);
      const displacements = {};
      this.applyCalculate(calcGraph, displacements, k, k2);
      if (clustering) {
        for (const key in clusterMap) {
          clusterMap[key].cx = 0;
          clusterMap[key].cy = 0;
          clusterMap[key].count = 0;
        }
        nodes.forEach((node) => {
          const { data } = node;
          const c2 = clusterMap[data[nodeClusterBy]];
          if (isNumber(data.x)) {
            c2.cx += data.x;
          }
          if (isNumber(data.y)) {
            c2.cy += data.y;
          }
          c2.count++;
        });
        for (const key in clusterMap) {
          clusterMap[key].cx /= clusterMap[key].count;
          clusterMap[key].cy /= clusterMap[key].count;
        }
        const clusterGravity = propsClusterGravity || gravity;
        nodes.forEach((node, j) => {
          const { id, data } = node;
          if (!isNumber(data.x) || !isNumber(data.y))
            return;
          const c2 = clusterMap[data[nodeClusterBy]];
          const distLength = Math.sqrt((data.x - c2.cx) * (data.x - c2.cx) + (data.y - c2.cy) * (data.y - c2.cy));
          const gravityForce = k * clusterGravity;
          displacements[id].x -= gravityForce * (data.x - c2.cx) / distLength;
          displacements[id].y -= gravityForce * (data.y - c2.cy) / distLength;
        });
      }
      nodes.forEach((node, j) => {
        const { id, data } = node;
        if (!isNumber(data.x) || !isNumber(data.y))
          return;
        const gravityForce = 0.01 * k * gravity;
        displacements[id].x -= gravityForce * (data.x - center[0]);
        displacements[id].y -= gravityForce * (data.y - center[1]);
        if (dimensions === 3) {
          displacements[id].z -= gravityForce * (data.z - center[2]);
        }
      });
      nodes.forEach((node, j) => {
        const { id, data } = node;
        if (isNumber(data.fx) && isNumber(data.fy)) {
          data.x = data.fx;
          data.y = data.fy;
          if (dimensions === 3) {
            data.z = data.fz;
          }
          return;
        }
        if (!isNumber(data.x) || !isNumber(data.y))
          return;
        const distLength = Math.sqrt(displacements[id].x * displacements[id].x + displacements[id].y * displacements[id].y + (dimensions === 3 ? displacements[id].z * displacements[id].z : 0));
        if (distLength > 0) {
          const limitedDist = Math.min(maxDisplace * (speed / SPEED_DIVISOR$1), distLength);
          calcGraph.mergeNodeData(id, {
            x: data.x + displacements[id].x / distLength * limitedDist,
            y: data.y + displacements[id].y / distLength * limitedDist,
            z: dimensions === 3 ? data.z + displacements[id].z / distLength * limitedDist : void 0
          });
        }
      });
    }
    applyCalculate(calcGraph, displacements, k, k2) {
      this.calRepulsive(calcGraph, displacements, k2);
      this.calAttractive(calcGraph, displacements, k);
    }
    calRepulsive(calcGraph, displacements, k2) {
      const nodes = calcGraph.getAllNodes();
      nodes.forEach(({ data: v, id: vid }, i) => {
        displacements[vid] = { x: 0, y: 0, z: 0 };
        nodes.forEach(({ data: u, id: uid }, j) => {
          if (i <= j || !isNumber(v.x) || !isNumber(u.x) || !isNumber(v.y) || !isNumber(u.y)) {
            return;
          }
          let vecX = v.x - u.x;
          let vecY = v.y - u.y;
          let vecZ = this.options.dimensions === 3 ? v.z - u.z : 0;
          let lengthSqr = vecX * vecX + vecY * vecY + vecZ * vecZ;
          if (lengthSqr === 0) {
            lengthSqr = 1;
            vecX = 0.01;
            vecY = 0.01;
            vecZ = 0.01;
          }
          const common = k2 / lengthSqr;
          const dispX = vecX * common;
          const dispY = vecY * common;
          const dispZ = vecZ * common;
          displacements[vid].x += dispX;
          displacements[vid].y += dispY;
          displacements[uid].x -= dispX;
          displacements[uid].y -= dispY;
          if (this.options.dimensions === 3) {
            displacements[vid].z += dispZ;
            displacements[uid].z -= dispZ;
          }
        });
      });
    }
    calAttractive(calcGraph, displacements, k) {
      const edges = calcGraph.getAllEdges();
      edges.forEach((e) => {
        const { source, target } = e;
        if (!source || !target || source === target) {
          return;
        }
        const { data: u } = calcGraph.getNode(source);
        const { data: v } = calcGraph.getNode(target);
        if (!isNumber(v.x) || !isNumber(u.x) || !isNumber(v.y) || !isNumber(u.y)) {
          return;
        }
        const vecX = v.x - u.x;
        const vecY = v.y - u.y;
        const vecZ = this.options.dimensions === 3 ? v.z - u.z : 0;
        const common = Math.sqrt(vecX * vecX + vecY * vecY + vecZ * vecZ) / k;
        const dispX = vecX * common;
        const dispY = vecY * common;
        const dispZ = vecZ * common;
        displacements[source].x += dispX;
        displacements[source].y += dispY;
        displacements[target].x -= dispX;
        displacements[target].y -= dispY;
        if (this.options.dimensions === 3) {
          displacements[source].z += dispZ;
          displacements[target].z -= dispZ;
        }
      });
    }
  }
  const DEFAULTS_LAYOUT_OPTIONS$3 = {
    begin: [0, 0],
    preventOverlap: true,
    preventOverlapPadding: 10,
    condense: false,
    rows: void 0,
    cols: void 0,
    position: void 0,
    sortBy: "degree",
    nodeSize: 30,
    width: 300,
    height: 300
  };
  class GridLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "grid";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$3), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericGridLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericGridLayout(true, graph2, options);
      });
    }
    genericGridLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const { begin = [0, 0], condense, preventOverlapPadding, preventOverlap, rows: propsRows, cols: propsCols, nodeSpacing: paramNodeSpacing, nodeSize: paramNodeSize, width: propsWidth, height: propsHeight, position: position2 } = mergedOptions;
        let { sortBy } = mergedOptions;
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        const n = nodes === null || nodes === void 0 ? void 0 : nodes.length;
        if (!n || n === 1) {
          return handleSingleNodeGraph(graph2, assign, begin);
        }
        const layoutNodes = nodes.map((node) => cloneFormatData(node));
        if (
          // `id` should be reserved keyword
          sortBy !== "id" && (!isString(sortBy) || layoutNodes[0].data[sortBy] === void 0)
        ) {
          sortBy = "degree";
        }
        if (sortBy === "degree") {
          layoutNodes.sort((n1, n2) => graph2.getDegree(n2.id, "both") - graph2.getDegree(n1.id, "both"));
        } else if (sortBy === "id") {
          layoutNodes.sort((n1, n2) => {
            if (isNumber(n2.id) && isNumber(n1.id)) {
              return n2.id - n1.id;
            }
            return `${n1.id}`.localeCompare(`${n2.id}`);
          });
        } else {
          layoutNodes.sort((n1, n2) => n2.data[sortBy] - n1.data[sortBy]);
        }
        const width2 = !propsWidth && typeof window !== "undefined" ? window.innerWidth : propsWidth;
        const height = !propsHeight && typeof window !== "undefined" ? window.innerHeight : propsHeight;
        const cells = n;
        const rcs = { rows: propsRows, cols: propsCols };
        if (propsRows != null && propsCols != null) {
          rcs.rows = propsRows;
          rcs.cols = propsCols;
        } else if (propsRows != null && propsCols == null) {
          rcs.rows = propsRows;
          rcs.cols = Math.ceil(cells / rcs.rows);
        } else if (propsRows == null && propsCols != null) {
          rcs.cols = propsCols;
          rcs.rows = Math.ceil(cells / rcs.cols);
        } else {
          const splits = Math.sqrt(cells * height / width2);
          rcs.rows = Math.round(splits);
          rcs.cols = Math.round(width2 / height * splits);
        }
        rcs.rows = Math.max(rcs.rows, 1);
        rcs.cols = Math.max(rcs.cols, 1);
        if (rcs.cols * rcs.rows > cells) {
          const sm = small(rcs);
          const lg = large(rcs);
          if ((sm - 1) * lg >= cells) {
            small(rcs, sm - 1);
          } else if ((lg - 1) * sm >= cells) {
            large(rcs, lg - 1);
          }
        } else {
          while (rcs.cols * rcs.rows < cells) {
            const sm = small(rcs);
            const lg = large(rcs);
            if ((lg + 1) * sm >= cells) {
              large(rcs, lg + 1);
            } else {
              small(rcs, sm + 1);
            }
          }
        }
        let cellWidth = condense ? 0 : width2 / rcs.cols;
        let cellHeight = condense ? 0 : height / rcs.rows;
        if (preventOverlap || paramNodeSpacing) {
          const nodeSpacing = formatNumberFn(10, paramNodeSpacing);
          const nodeSize = formatSizeFn(30, paramNodeSize, false);
          layoutNodes.forEach((node) => {
            if (!node.data.x || !node.data.y) {
              node.data.x = 0;
              node.data.y = 0;
            }
            const oNode = graph2.getNode(node.id);
            const [nodeW, nodeH] = parseSize(nodeSize(oNode) || 30);
            const p = nodeSpacing !== void 0 ? nodeSpacing(node) : preventOverlapPadding;
            const w = nodeW + p;
            const h = nodeH + p;
            cellWidth = Math.max(cellWidth, w);
            cellHeight = Math.max(cellHeight, h);
          });
        }
        const cellUsed = {};
        const rc = { row: 0, col: 0 };
        const id2manPos = {};
        for (let i = 0; i < layoutNodes.length; i++) {
          const node = layoutNodes[i];
          let rcPos;
          if (position2) {
            rcPos = position2(graph2.getNode(node.id));
          }
          if (rcPos && (rcPos.row !== void 0 || rcPos.col !== void 0)) {
            const pos = {
              row: rcPos.row,
              col: rcPos.col
            };
            if (pos.col === void 0) {
              pos.col = 0;
              while (used(cellUsed, pos)) {
                pos.col++;
              }
            } else if (pos.row === void 0) {
              pos.row = 0;
              while (used(cellUsed, pos)) {
                pos.row++;
              }
            }
            id2manPos[node.id] = pos;
            use(cellUsed, pos);
          }
          getPos(node, begin, cellWidth, cellHeight, id2manPos, rcs, rc, cellUsed);
        }
        const result = {
          nodes: layoutNodes,
          edges
        };
        if (assign) {
          layoutNodes.forEach((node) => {
            graph2.mergeNodeData(node.id, {
              x: node.data.x,
              y: node.data.y
            });
          });
        }
        return result;
      });
    }
  }
  const small = (rcs, val) => {
    let res;
    const rows = rcs.rows || 5;
    const cols = rcs.cols || 5;
    if (val == null) {
      res = Math.min(rows, cols);
    } else {
      const min2 = Math.min(rows, cols);
      if (min2 === rcs.rows) {
        rcs.rows = val;
      } else {
        rcs.cols = val;
      }
    }
    return res;
  };
  const large = (rcs, val) => {
    let result;
    const usedRows = rcs.rows || 5;
    const usedCols = rcs.cols || 5;
    if (val == null) {
      result = Math.max(usedRows, usedCols);
    } else {
      const max2 = Math.max(usedRows, usedCols);
      if (max2 === rcs.rows) {
        rcs.rows = val;
      } else {
        rcs.cols = val;
      }
    }
    return result;
  };
  const used = (cellUsed, rc) => cellUsed[`c-${rc.row}-${rc.col}`] || false;
  const use = (cellUsed, rc) => cellUsed[`c-${rc.row}-${rc.col}`] = true;
  const moveToNextCell = (rcs, rc) => {
    const cols = rcs.cols || 5;
    rc.col++;
    if (rc.col >= cols) {
      rc.col = 0;
      rc.row++;
    }
  };
  const getPos = (node, begin, cellWidth, cellHeight, id2manPos, rcs, rc, cellUsed) => {
    let x2;
    let y2;
    const rcPos = id2manPos[node.id];
    if (rcPos) {
      x2 = rcPos.col * cellWidth + cellWidth / 2 + begin[0];
      y2 = rcPos.row * cellHeight + cellHeight / 2 + begin[1];
    } else {
      while (used(cellUsed, rc)) {
        moveToNextCell(rcs, rc);
      }
      x2 = rc.col * cellWidth + cellWidth / 2 + begin[0];
      y2 = rc.row * cellHeight + cellHeight / 2 + begin[1];
      use(cellUsed, rc);
      moveToNextCell(rcs, rc);
    }
    node.data.x = x2;
    node.data.y = y2;
  };
  const mds = (dimension, distances, linkDistance) => {
    try {
      const M = Matrix.mul(Matrix.pow(distances, 2), -0.5);
      const rowMeans = M.mean("row");
      const colMeans = M.mean("column");
      const totalMean = M.mean();
      M.add(totalMean).subRowVector(rowMeans).subColumnVector(colMeans);
      const ret = new SingularValueDecomposition(M);
      const eigenValues = Matrix.sqrt(ret.diagonalMatrix).diagonal();
      return ret.leftSingularVectors.toJSON().map((row) => {
        return Matrix.mul([row], [eigenValues]).toJSON()[0].splice(0, dimension);
      });
    } catch (_a2) {
      const res = [];
      for (let i = 0; i < distances.length; i++) {
        const x2 = Math.random() * linkDistance;
        const y2 = Math.random() * linkDistance;
        res.push([x2, y2]);
      }
      return res;
    }
  };
  const SPEED_DIVISOR = 800;
  const DEFAULTS_LAYOUT_OPTIONS$2 = {
    iterations: 10,
    height: 10,
    width: 10,
    speed: 100,
    gravity: 10,
    k: 5
  };
  const radialNonoverlapForce = (graph2, options) => {
    const mergedOptions = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$2), options);
    const { positions, iterations, width: width2, k, speed = 100, strictRadial, focusIdx, radii = [], nodeSizeFunc } = mergedOptions;
    const nodes = graph2.getAllNodes();
    const disp = [];
    const maxDisplace = width2 / 10;
    for (let i = 0; i < iterations; i++) {
      positions.forEach((_2, k2) => {
        disp[k2] = { x: 0, y: 0 };
      });
      getRepulsion(nodes, positions, disp, k, radii, nodeSizeFunc);
      updatePositions(positions, disp, speed, strictRadial, focusIdx, maxDisplace, width2, radii);
    }
    return positions;
  };
  const getRepulsion = (nodes, positions, disp, k, radii, nodeSizeFunc) => {
    positions.forEach((v, i) => {
      disp[i] = { x: 0, y: 0 };
      positions.forEach((u, j) => {
        if (i === j) {
          return;
        }
        if (radii[i] !== radii[j]) {
          return;
        }
        let vecx = v.x - u.x;
        let vecy = v.y - u.y;
        let vecLength = Math.sqrt(vecx * vecx + vecy * vecy);
        if (vecLength === 0) {
          vecLength = 1;
          const sign = i > j ? 1 : -1;
          vecx = 0.01 * sign;
          vecy = 0.01 * sign;
        }
        if (vecLength < nodeSizeFunc(nodes[i]) / 2 + nodeSizeFunc(nodes[j]) / 2) {
          const common = k * k / vecLength;
          disp[i].x += vecx / vecLength * common;
          disp[i].y += vecy / vecLength * common;
        }
      });
    });
  };
  const updatePositions = (positions, disp, speed, strictRadial, focusIdx, maxDisplace, width2, radii) => {
    const maxDisp = maxDisplace || width2 / 10;
    if (strictRadial) {
      disp.forEach((di, i) => {
        const vx = positions[i].x - positions[focusIdx].x;
        const vy = positions[i].y - positions[focusIdx].y;
        const vLength = Math.sqrt(vx * vx + vy * vy);
        let vpx = vy / vLength;
        let vpy = -vx / vLength;
        const diLength = Math.sqrt(di.x * di.x + di.y * di.y);
        let alpha = Math.acos((vpx * di.x + vpy * di.y) / diLength);
        if (alpha > Math.PI / 2) {
          alpha -= Math.PI / 2;
          vpx *= -1;
          vpy *= -1;
        }
        const tdispLength = Math.cos(alpha) * diLength;
        di.x = vpx * tdispLength;
        di.y = vpy * tdispLength;
      });
    }
    positions.forEach((n, i) => {
      if (i === focusIdx) {
        return;
      }
      const distLength = Math.sqrt(disp[i].x * disp[i].x + disp[i].y * disp[i].y);
      if (distLength > 0 && i !== focusIdx) {
        const limitedDist = Math.min(maxDisp * (speed / SPEED_DIVISOR), distLength);
        n.x += disp[i].x / distLength * limitedDist;
        n.y += disp[i].y / distLength * limitedDist;
        if (strictRadial) {
          let vx = n.x - positions[focusIdx].x;
          let vy = n.y - positions[focusIdx].y;
          const nfDis = Math.sqrt(vx * vx + vy * vy);
          vx = vx / nfDis * radii[i];
          vy = vy / nfDis * radii[i];
          n.x = positions[focusIdx].x + vx;
          n.y = positions[focusIdx].y + vy;
        }
      }
    });
    return positions;
  };
  const DEFAULTS_LAYOUT_OPTIONS$1 = {
    maxIteration: 1e3,
    focusNode: null,
    unitRadius: null,
    linkDistance: 50,
    preventOverlap: false,
    strictRadial: true,
    maxPreventOverlapIteration: 200,
    sortStrength: 10
  };
  class RadialLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "radial";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS$1), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericRadialLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericRadialLayout(true, graph2, options);
      });
    }
    genericRadialLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const { width: propsWidth, height: propsHeight, center: propsCenter, focusNode: propsFocusNode, unitRadius: propsUnitRadius, nodeSize, nodeSpacing, strictRadial, preventOverlap, maxPreventOverlapIteration, sortBy, linkDistance = 50, sortStrength = 10, maxIteration = 1e3 } = mergedOptions;
        const nodes = graph2.getAllNodes();
        const edges = graph2.getAllEdges();
        const width2 = !propsWidth && typeof window !== "undefined" ? window.innerWidth : propsWidth;
        const height = !propsHeight && typeof window !== "undefined" ? window.innerHeight : propsHeight;
        const center = !propsCenter ? [width2 / 2, height / 2] : propsCenter;
        if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length) || nodes.length === 1) {
          return handleSingleNodeGraph(graph2, assign, center);
        }
        let focusNode = nodes[0];
        if (isString(propsFocusNode)) {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === propsFocusNode) {
              focusNode = nodes[i];
              break;
            }
          }
        } else {
          focusNode = propsFocusNode || nodes[0];
        }
        const focusIndex = getIndexById(nodes, focusNode.id);
        const adjMatrix = getAdjMatrix({ nodes, edges });
        const distances = floydWarshall(adjMatrix);
        const maxDistance = maxToFocus(distances, focusIndex);
        handleInfinity(distances, focusIndex, maxDistance + 1);
        const focusNodeD = distances[focusIndex];
        let semiWidth = width2 - center[0] > center[0] ? center[0] : width2 - center[0];
        let semiHeight = height - center[1] > center[1] ? center[1] : height - center[1];
        if (semiWidth === 0) {
          semiWidth = width2 / 2;
        }
        if (semiHeight === 0) {
          semiHeight = height / 2;
        }
        const maxRadius = Math.min(semiWidth, semiHeight);
        const maxD = Math.max(...focusNodeD);
        const radii = [];
        const unitRadius = !propsUnitRadius ? maxRadius / maxD : propsUnitRadius;
        focusNodeD.forEach((value, i) => {
          radii[i] = value * unitRadius;
        });
        const idealDistances = eIdealDisMatrix(nodes, distances, linkDistance, radii, unitRadius, sortBy, sortStrength);
        const weights = getWeightMatrix(idealDistances);
        const mdsResult = mds(linkDistance, idealDistances, linkDistance);
        let positions = mdsResult.map(([x2, y2]) => ({
          x: (isNaN(x2) ? Math.random() * linkDistance : x2) - mdsResult[focusIndex][0],
          y: (isNaN(y2) ? Math.random() * linkDistance : y2) - mdsResult[focusIndex][1]
        }));
        this.run(maxIteration, positions, weights, idealDistances, radii, focusIndex);
        let nodeSizeFunc;
        if (preventOverlap) {
          nodeSizeFunc = formatNodeSizeToNumber(nodeSize, nodeSpacing);
          const nonoverlapForceParams = {
            nodes,
            nodeSizeFunc,
            positions,
            radii,
            height,
            width: width2,
            strictRadial: Boolean(strictRadial),
            focusIdx: focusIndex,
            iterations: maxPreventOverlapIteration || 200,
            k: positions.length / 4.5
          };
          positions = radialNonoverlapForce(graph2, nonoverlapForceParams);
        }
        const layoutNodes = [];
        positions.forEach((p, i) => {
          const cnode = cloneFormatData(nodes[i]);
          cnode.data.x = p.x + center[0];
          cnode.data.y = p.y + center[1];
          layoutNodes.push(cnode);
        });
        if (assign) {
          layoutNodes.forEach((node) => graph2.mergeNodeData(node.id, {
            x: node.data.x,
            y: node.data.y
          }));
        }
        const result = {
          nodes: layoutNodes,
          edges
        };
        return result;
      });
    }
    run(maxIteration, positions, weights, idealDistances, radii, focusIndex) {
      for (let i = 0; i <= maxIteration; i++) {
        const param = i / maxIteration;
        this.oneIteration(param, positions, radii, idealDistances, weights, focusIndex);
      }
    }
    oneIteration(param, positions, radii, distances, weights, focusIndex) {
      const vparam = 1 - param;
      positions.forEach((v, i) => {
        const originDis = getEuclideanDistance(v, { x: 0, y: 0 });
        const reciODis = originDis === 0 ? 0 : 1 / originDis;
        if (i === focusIndex) {
          return;
        }
        let xMolecule = 0;
        let yMolecule = 0;
        let denominator = 0;
        positions.forEach((u, j) => {
          if (i === j) {
            return;
          }
          const edis = getEuclideanDistance(v, u);
          const reciEdis = edis === 0 ? 0 : 1 / edis;
          const idealDis = distances[j][i];
          denominator += weights[i][j];
          xMolecule += weights[i][j] * (u.x + idealDis * (v.x - u.x) * reciEdis);
          yMolecule += weights[i][j] * (u.y + idealDis * (v.y - u.y) * reciEdis);
        });
        const reciR = radii[i] === 0 ? 0 : 1 / radii[i];
        denominator *= vparam;
        denominator += param * reciR * reciR;
        xMolecule *= vparam;
        xMolecule += param * reciR * v.x * reciODis;
        v.x = xMolecule / denominator;
        yMolecule *= vparam;
        yMolecule += param * reciR * v.y * reciODis;
        v.y = yMolecule / denominator;
      });
    }
  }
  const eIdealDisMatrix = (nodes, distances, linkDistance, radii, unitRadius, sortBy, sortStrength) => {
    if (!nodes)
      return [];
    const result = [];
    if (distances) {
      const sortValueCache = {};
      distances.forEach((row, i) => {
        const newRow = [];
        row.forEach((v, j) => {
          var _a2, _b;
          if (i === j) {
            newRow.push(0);
          } else if (radii[i] === radii[j]) {
            if (sortBy === "data") {
              newRow.push(v * (Math.abs(i - j) * sortStrength) / (radii[i] / unitRadius));
            } else if (sortBy) {
              let iValue;
              let jValue;
              if (sortValueCache[nodes[i].id]) {
                iValue = sortValueCache[nodes[i].id];
              } else {
                const value = (sortBy === "id" ? nodes[i].id : (_a2 = nodes[i].data) === null || _a2 === void 0 ? void 0 : _a2[sortBy]) || 0;
                if (isString(value)) {
                  iValue = value.charCodeAt(0);
                } else {
                  iValue = value;
                }
                sortValueCache[nodes[i].id] = iValue;
              }
              if (sortValueCache[nodes[j].id]) {
                jValue = sortValueCache[nodes[j].id];
              } else {
                const value = (sortBy === "id" ? nodes[j].id : (_b = nodes[j].data) === null || _b === void 0 ? void 0 : _b[sortBy]) || 0;
                if (isString(value)) {
                  jValue = value.charCodeAt(0);
                } else {
                  jValue = value;
                }
                sortValueCache[nodes[j].id] = jValue;
              }
              newRow.push(v * (Math.abs(iValue - jValue) * sortStrength) / (radii[i] / unitRadius));
            } else {
              newRow.push(v * linkDistance / (radii[i] / unitRadius));
            }
          } else {
            const link = (linkDistance + unitRadius) / 2;
            newRow.push(v * link);
          }
        });
        result.push(newRow);
      });
    }
    return result;
  };
  const getWeightMatrix = (idealDistances) => {
    const rows = idealDistances.length;
    const cols = idealDistances[0].length;
    const result = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        if (idealDistances[i][j] !== 0) {
          row.push(1 / (idealDistances[i][j] * idealDistances[i][j]));
        } else {
          row.push(0);
        }
      }
      result.push(row);
    }
    return result;
  };
  const getIndexById = (array, id) => {
    let index2 = -1;
    array.forEach((a2, i) => {
      if (a2.id === id) {
        index2 = i;
      }
    });
    return Math.max(index2, 0);
  };
  const handleInfinity = (matrix2, focusIndex, step) => {
    const length = matrix2.length;
    for (let i = 0; i < length; i++) {
      if (matrix2[focusIndex][i] === Infinity) {
        matrix2[focusIndex][i] = step;
        matrix2[i][focusIndex] = step;
        for (let j = 0; j < length; j++) {
          if (matrix2[i][j] !== Infinity && matrix2[focusIndex][j] === Infinity) {
            matrix2[focusIndex][j] = step + matrix2[i][j];
            matrix2[j][focusIndex] = step + matrix2[i][j];
          }
        }
      }
    }
    for (let i = 0; i < length; i++) {
      if (i === focusIndex) {
        continue;
      }
      for (let j = 0; j < length; j++) {
        if (matrix2[i][j] === Infinity) {
          let minus = Math.abs(matrix2[focusIndex][i] - matrix2[focusIndex][j]);
          minus = minus === 0 ? 1 : minus;
          matrix2[i][j] = minus;
        }
      }
    }
  };
  const maxToFocus = (matrix2, focusIndex) => {
    let max2 = 0;
    for (let i = 0; i < matrix2[focusIndex].length; i++) {
      if (matrix2[focusIndex][i] === Infinity) {
        continue;
      }
      max2 = matrix2[focusIndex][i] > max2 ? matrix2[focusIndex][i] : max2;
    }
    return max2;
  };
  const DEFAULTS_LAYOUT_OPTIONS = {
    center: [0, 0],
    width: 300,
    height: 300
  };
  class RandomLayout {
    constructor(options = {}) {
      this.options = options;
      this.id = "random";
      this.options = Object.assign(Object.assign({}, DEFAULTS_LAYOUT_OPTIONS), options);
    }
    /**
     * Return the positions of nodes and edges(if needed).
     */
    execute(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        return this.genericRandomLayout(false, graph2, options);
      });
    }
    /**
     * To directly assign the positions to the nodes.
     */
    assign(graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.genericRandomLayout(true, graph2, options);
      });
    }
    genericRandomLayout(assign, graph2, options) {
      return __awaiter(this, void 0, void 0, function* () {
        const mergedOptions = Object.assign(Object.assign({}, this.options), options);
        const { center: propsCenter, width: propsWidth, height: propsHeight } = mergedOptions;
        const nodes = graph2.getAllNodes();
        const layoutScale = 0.9;
        const width2 = !propsWidth && typeof window !== "undefined" ? window.innerWidth : propsWidth;
        const height = !propsHeight && typeof window !== "undefined" ? window.innerHeight : propsHeight;
        const center = !propsCenter ? [width2 / 2, height / 2] : propsCenter;
        const layoutNodes = [];
        if (nodes) {
          nodes.forEach((node) => {
            layoutNodes.push({
              id: node.id,
              data: {
                x: (Math.random() - 0.5) * layoutScale * width2 + center[0],
                y: (Math.random() - 0.5) * layoutScale * height + center[1]
              }
            });
          });
        }
        if (assign) {
          layoutNodes.forEach((node) => graph2.mergeNodeData(node.id, {
            x: node.data.x,
            y: node.data.y
          }));
        }
        const result = {
          nodes: layoutNodes,
          edges: graph2.getAllEdges()
        };
        return result;
      });
    }
  }
  const registry = {
    circular: CircularLayout,
    concentric: ConcentricLayout,
    mds: MDSLayout,
    random: RandomLayout,
    grid: GridLayout,
    radial: RadialLayout,
    force: ForceLayout,
    d3force: D3ForceLayout,
    "d3-force-3d": D3Force3DLayout,
    fruchterman: FruchtermanLayout,
    forceAtlas2: ForceAtlas2Layout,
    dagre: DagreLayout,
    antvDagre: AntVDagreLayout,
    comboCombined: ComboCombinedLayout
  };
  let currentLayout;
  const obj = {
    stopLayout() {
      if (currentLayout === null || currentLayout === void 0 ? void 0 : currentLayout.stop) {
        currentLayout.stop();
      }
    },
    calculateLayout(payload, transferables) {
      return __awaiter(this, void 0, void 0, function* () {
        const { layout: { id, options, iterations }, nodes, edges } = payload;
        const graph2 = new Graph$8({
          nodes,
          edges
        });
        const layoutCtor = registry[id];
        if (layoutCtor) {
          currentLayout = new layoutCtor(options);
        } else {
          throw new Error(`Unknown layout id: ${id}`);
        }
        let positions = yield currentLayout.execute(graph2);
        if (isLayoutWithIterations(currentLayout)) {
          currentLayout.stop();
          positions = currentLayout.tick(iterations);
        }
        return [positions, transferables];
      });
    }
  };
  expose(obj);
})();
