let e;
function t(e) {
	return e && e.__esModule ? e.default : e;
}
var r,
	n = Object.defineProperty,
	i = Object.getOwnPropertySymbols,
	o = Object.prototype.hasOwnProperty,
	s = Object.prototype.propertyIsEnumerable,
	a = (e, t, r) => (t in e ? n(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (e[t] = r)),
	l = (e, t) => {
		for (var r in t || (t = {})) o.call(t, r) && a(e, r, t[r]);
		if (i) for (var r of i(t)) s.call(t, r) && a(e, r, t[r]);
		return e;
	},
	u = Symbol.for("immer-nothing"),
	c = Symbol.for("immer-draftable"),
	m = Symbol.for("immer-state");
function p(e, ...t) {
	throw Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var d = Object.getPrototypeOf;
function f(e) {
	return !!e && !!e[m];
}
function g(e) {
	var t;
	return (
		!!e && (h(e) || Array.isArray(e) || !!e[c] || !!(null == (t = e.constructor) ? void 0 : t[c]) || w(e) || N(e))
	);
}
var I = Object.prototype.constructor.toString();
function h(e) {
	if (!e || "object" != typeof e) return !1;
	let t = d(e);
	if (null === t) return !0;
	let r = Object.hasOwnProperty.call(t, "constructor") && t.constructor;
	return r === Object || ("function" == typeof r && Function.toString.call(r) === I);
}
function C(e, t) {
	0 === R(e)
		? Object.entries(e).forEach(([r, n]) => {
				t(r, n, e);
		  })
		: e.forEach((r, n) => t(n, r, e));
}
function R(e) {
	let t = e[m];
	return t ? t.type_ : Array.isArray(e) ? 1 : w(e) ? 2 : N(e) ? 3 : 0;
}
function _(e, t) {
	return 2 === R(e) ? e.has(t) : Object.prototype.hasOwnProperty.call(e, t);
}
function y(e, t, r) {
	let n = R(e);
	2 === n ? e.set(t, r) : 3 === n ? e.add(r) : (e[t] = r);
}
function w(e) {
	return e instanceof Map;
}
function N(e) {
	return e instanceof Set;
}
function b(e) {
	return e.copy_ || e.base_;
}
function P(e, t) {
	if (w(e)) return new Map(e);
	if (N(e)) return new Set(e);
	if (Array.isArray(e)) return Array.prototype.slice.call(e);
	if (!t && h(e)) {
		if (!d(e)) {
			let t = Object.create(null);
			return Object.assign(t, e);
		}
		return l({}, e);
	}
	let r = Object.getOwnPropertyDescriptors(e);
	delete r[m];
	let n = Reflect.ownKeys(r);
	for (let t = 0; t < n.length; t++) {
		let i = n[t],
			o = r[i];
		!1 === o.writable && ((o.writable = !0), (o.configurable = !0)),
			(o.get || o.set) && (r[i] = { configurable: !0, writable: !0, enumerable: o.enumerable, value: e[i] });
	}
	return Object.create(d(e), r);
}
function S(e, t = !1) {
	return (
		v(e) ||
			f(e) ||
			!g(e) ||
			(R(e) > 1 && (e.set = e.add = e.clear = e.delete = D), Object.freeze(e), t && C(e, (e, t) => S(t, !0), !0)),
		e
	);
}
function D() {
	p(2);
}
function v(e) {
	return Object.isFrozen(e);
}
var A = {};
function F(e) {
	let t = A[e];
	return t || p(0, e), t;
}
function O(e, t) {
	t && (F("Patches"), (e.patches_ = []), (e.inversePatches_ = []), (e.patchListener_ = t));
}
function B(e) {
	x(e), e.drafts_.forEach(E), (e.drafts_ = null);
}
function x(e) {
	e === r && (r = e.parent_);
}
function k(e) {
	return (r = { drafts_: [], parent_: r, immer_: e, canAutoFreeze_: !0, unfinalizedDrafts_: 0 });
}
function E(e) {
	let t = e[m];
	0 === t.type_ || 1 === t.type_ ? t.revoke_() : (t.revoked_ = !0);
}
function H(e, t) {
	t.unfinalizedDrafts_ = t.drafts_.length;
	let r = t.drafts_[0],
		n = void 0 !== e && e !== r;
	return (
		n
			? (r[m].modified_ && (B(t), p(4)),
			  g(e) && ((e = U(t, e)), t.parent_ || M(t, e)),
			  t.patches_ && F("Patches").generateReplacementPatches_(r[m].base_, e, t.patches_, t.inversePatches_))
			: (e = U(t, r, [])),
		B(t),
		t.patches_ && t.patchListener_(t.patches_, t.inversePatches_),
		e !== u ? e : void 0
	);
}
function U(e, t, r) {
	if (v(t)) return t;
	let n = t[m];
	if (!n) return C(t, (i, o) => q(e, n, t, i, o, r), !0), t;
	if (n.scope_ !== e) return t;
	if (!n.modified_) return M(e, n.base_, !0), n.base_;
	if (!n.finalized_) {
		(n.finalized_ = !0), n.scope_.unfinalizedDrafts_--;
		let t = n.copy_,
			i = t,
			o = !1;
		3 === n.type_ && ((i = new Set(t)), t.clear(), (o = !0)),
			C(i, (i, s) => q(e, n, t, i, s, r, o)),
			M(e, t, !1),
			r && e.patches_ && F("Patches").generatePatches_(n, r, e.patches_, e.inversePatches_);
	}
	return n.copy_;
}
function q(e, t, r, n, i, o, s) {
	if (f(i)) {
		let s = o && t && 3 !== t.type_ && !_(t.assigned_, n) ? o.concat(n) : void 0,
			a = U(e, i, s);
		if ((y(r, n, a), !f(a))) return;
		e.canAutoFreeze_ = !1;
	} else s && r.add(i);
	if (g(i) && !v(i)) {
		if (!e.immer_.autoFreeze_ && e.unfinalizedDrafts_ < 1) return;
		U(e, i), (t && t.scope_.parent_) || M(e, i);
	}
}
function M(e, t, r = !1) {
	!e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && S(t, r);
}
var L = {
		get(e, t) {
			if (t === m) return e;
			let r = b(e);
			if (!_(r, t))
				return (function (e, t, r) {
					var n;
					let i = W(t, r);
					return i ? ("value" in i ? i.value : null == (n = i.get) ? void 0 : n.call(e.draft_)) : void 0;
				})(e, r, t);
			let n = r[t];
			return e.finalized_ || !g(n) ? n : n === z(e.base_, t) ? (j(e), (e.copy_[t] = G(n, e))) : n;
		},
		has: (e, t) => t in b(e),
		ownKeys: (e) => Reflect.ownKeys(b(e)),
		set(e, t, r) {
			let n = W(b(e), t);
			if (null == n ? void 0 : n.set) return n.set.call(e.draft_, r), !0;
			if (!e.modified_) {
				let n = z(b(e), t),
					i = null == n ? void 0 : n[m];
				if (i && i.base_ === r) return (e.copy_[t] = r), (e.assigned_[t] = !1), !0;
				if ((r === n ? 0 !== r || 1 / r == 1 / n : r != r && n != n) && (void 0 !== r || _(e.base_, t)))
					return !0;
				j(e), $(e);
			}
			return (
				!!(
					(e.copy_[t] === r && (void 0 !== r || t in e.copy_)) ||
					(Number.isNaN(r) && Number.isNaN(e.copy_[t]))
				) || ((e.copy_[t] = r), (e.assigned_[t] = !0), !0)
			);
		},
		deleteProperty: (e, t) => (
			void 0 !== z(e.base_, t) || t in e.base_ ? ((e.assigned_[t] = !1), j(e), $(e)) : delete e.assigned_[t],
			e.copy_ && delete e.copy_[t],
			!0
		),
		getOwnPropertyDescriptor(e, t) {
			let r = b(e),
				n = Reflect.getOwnPropertyDescriptor(r, t);
			return n
				? { writable: !0, configurable: 1 !== e.type_ || "length" !== t, enumerable: n.enumerable, value: r[t] }
				: n;
		},
		defineProperty() {
			p(11);
		},
		getPrototypeOf: (e) => d(e.base_),
		setPrototypeOf() {
			p(12);
		},
	},
	T = {};
function z(e, t) {
	let r = e[m],
		n = r ? b(r) : e;
	return n[t];
}
function W(e, t) {
	if (!(t in e)) return;
	let r = d(e);
	for (; r; ) {
		let e = Object.getOwnPropertyDescriptor(r, t);
		if (e) return e;
		r = d(r);
	}
}
function $(e) {
	!e.modified_ && ((e.modified_ = !0), e.parent_ && $(e.parent_));
}
function j(e) {
	e.copy_ || (e.copy_ = P(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
function G(e, t) {
	let n = w(e)
			? F("MapSet").proxyMap_(e, t)
			: N(e)
			? F("MapSet").proxySet_(e, t)
			: (function (e, t) {
					let n = Array.isArray(e),
						i = {
							type_: n ? 1 : 0,
							scope_: t ? t.scope_ : r,
							modified_: !1,
							finalized_: !1,
							assigned_: {},
							parent_: t,
							base_: e,
							draft_: null,
							copy_: null,
							revoke_: null,
							isManual_: !1,
						},
						o = i,
						s = L;
					n && ((o = [i]), (s = T));
					let { revoke: a, proxy: l } = Proxy.revocable(o, s);
					return (i.draft_ = l), (i.revoke_ = a), l;
			  })(e, t),
		i = t ? t.scope_ : r;
	return i.drafts_.push(n), n;
}
C(L, (e, t) => {
	T[e] = function () {
		return (arguments[0] = arguments[0][0]), t.apply(this, arguments);
	};
}),
	(T.deleteProperty = function (e, t) {
		return T.set.call(this, e, t, void 0);
	}),
	(T.set = function (e, t, r) {
		return L.set.call(this, e[0], t, r, e[0]);
	});
var Q = new (class {
		constructor(e) {
			(this.autoFreeze_ = !0),
				(this.useStrictShallowCopy_ = !1),
				(this.produce = (e, t, r) => {
					let n;
					if ("function" == typeof e && "function" != typeof t) {
						let r = t;
						t = e;
						let n = this;
						return function (e = r, ...i) {
							return n.produce(e, (e) => t.call(this, e, ...i));
						};
					}
					if (("function" != typeof t && p(6), void 0 !== r && "function" != typeof r && p(7), g(e))) {
						let i = k(this),
							o = G(e, void 0),
							s = !0;
						try {
							(n = t(o)), (s = !1);
						} finally {
							s ? B(i) : x(i);
						}
						return O(i, r), H(n, i);
					}
					if (e && "object" == typeof e) p(1, e);
					else {
						if (
							(void 0 === (n = t(e)) && (n = e), n === u && (n = void 0), this.autoFreeze_ && S(n, !0), r)
						) {
							let t = [],
								i = [];
							F("Patches").generateReplacementPatches_(e, n, t, i), r(t, i);
						}
						return n;
					}
				}),
				(this.produceWithPatches = (e, t) => {
					let r, n;
					if ("function" == typeof e) return (t, ...r) => this.produceWithPatches(t, (t) => e(t, ...r));
					let i = this.produce(e, t, (e, t) => {
						(r = e), (n = t);
					});
					return [i, r, n];
				}),
				"boolean" == typeof (null == e ? void 0 : e.autoFreeze) && this.setAutoFreeze(e.autoFreeze),
				"boolean" == typeof (null == e ? void 0 : e.useStrictShallowCopy) &&
					this.setUseStrictShallowCopy(e.useStrictShallowCopy);
		}
		createDraft(e) {
			var t;
			g(e) || p(8),
				f(e) &&
					(f((t = e)) || p(10, t),
					(e = (function e(t) {
						let r;
						if (!g(t) || v(t)) return t;
						let n = t[m];
						if (n) {
							if (!n.modified_) return n.base_;
							(n.finalized_ = !0), (r = P(t, n.scope_.immer_.useStrictShallowCopy_));
						} else r = P(t, !0);
						return (
							C(r, (t, n) => {
								y(r, t, e(n));
							}),
							n && (n.finalized_ = !1),
							r
						);
					})(t)));
			let r = k(this),
				n = G(e, void 0);
			return (n[m].isManual_ = !0), x(r), n;
		}
		finishDraft(e, t) {
			let r = e && e[m];
			(r && r.isManual_) || p(9);
			let { scope_: n } = r;
			return O(n, t), H(void 0, n);
		}
		setAutoFreeze(e) {
			this.autoFreeze_ = e;
		}
		setUseStrictShallowCopy(e) {
			this.useStrictShallowCopy_ = e;
		}
		applyPatches(e, t) {
			let r;
			for (r = t.length - 1; r >= 0; r--) {
				let n = t[r];
				if (0 === n.path.length && "replace" === n.op) {
					e = n.value;
					break;
				}
			}
			r > -1 && (t = t.slice(r + 1));
			let n = F("Patches").applyPatches_;
			return f(e) ? n(e, t) : this.produce(e, (e) => n(e, t));
		}
	})(),
	Z = Q.produce;
Q.produceWithPatches.bind(Q),
	Q.setAutoFreeze.bind(Q),
	Q.setUseStrictShallowCopy.bind(Q),
	Q.applyPatches.bind(Q),
	Q.createDraft.bind(Q),
	Q.finishDraft.bind(Q),
	(function () {
		var e;
		class t extends Map {
			constructor(e, t) {
				super(),
					(this[m] = {
						type_: 2,
						parent_: t,
						scope_: t ? t.scope_ : r,
						modified_: !1,
						finalized_: !1,
						copy_: void 0,
						assigned_: void 0,
						base_: e,
						draft_: this,
						isManual_: !1,
						revoked_: !1,
					});
			}
			get size() {
				return b(this[m]).size;
			}
			has(e) {
				return b(this[m]).has(e);
			}
			set(e, t) {
				let r = this[m];
				return (
					s(r),
					(b(r).has(e) && b(r).get(e) === t) ||
						(n(r), $(r), r.assigned_.set(e, !0), r.copy_.set(e, t), r.assigned_.set(e, !0)),
					this
				);
			}
			delete(e) {
				if (!this.has(e)) return !1;
				let t = this[m];
				return (
					s(t),
					n(t),
					$(t),
					t.base_.has(e) ? t.assigned_.set(e, !1) : t.assigned_.delete(e),
					t.copy_.delete(e),
					!0
				);
			}
			clear() {
				let e = this[m];
				s(e),
					b(e).size &&
						(n(e),
						$(e),
						(e.assigned_ = new Map()),
						C(e.base_, (t) => {
							e.assigned_.set(t, !1);
						}),
						e.copy_.clear());
			}
			forEach(e, t) {
				let r = this[m];
				b(r).forEach((r, n, i) => {
					e.call(t, this.get(n), n, this);
				});
			}
			get(e) {
				let t = this[m];
				s(t);
				let r = b(t).get(e);
				if (t.finalized_ || !g(r) || r !== t.base_.get(e)) return r;
				let i = G(r, t);
				return n(t), t.copy_.set(e, i), i;
			}
			keys() {
				return b(this[m]).keys();
			}
			values() {
				let e = this.keys();
				return {
					[Symbol.iterator]: () => this.values(),
					next: () => {
						let t = e.next();
						if (t.done) return t;
						let r = this.get(t.value);
						return { done: !1, value: r };
					},
				};
			}
			entries() {
				let e = this.keys();
				return {
					[Symbol.iterator]: () => this.entries(),
					next: () => {
						let t = e.next();
						if (t.done) return t;
						let r = this.get(t.value);
						return { done: !1, value: [t.value, r] };
					},
				};
			}
			[Symbol.iterator]() {
				return this.entries();
			}
		}
		function n(e) {
			e.copy_ || ((e.assigned_ = new Map()), (e.copy_ = new Map(e.base_)));
		}
		class i extends Set {
			constructor(e, t) {
				super(),
					(this[m] = {
						type_: 3,
						parent_: t,
						scope_: t ? t.scope_ : r,
						modified_: !1,
						finalized_: !1,
						copy_: void 0,
						base_: e,
						draft_: this,
						drafts_: new Map(),
						revoked_: !1,
						isManual_: !1,
					});
			}
			get size() {
				return b(this[m]).size;
			}
			has(e) {
				let t = this[m];
				return (s(t), t.copy_)
					? !!(t.copy_.has(e) || (t.drafts_.has(e) && t.copy_.has(t.drafts_.get(e))))
					: t.base_.has(e);
			}
			add(e) {
				let t = this[m];
				return s(t), this.has(e) || (o(t), $(t), t.copy_.add(e)), this;
			}
			delete(e) {
				if (!this.has(e)) return !1;
				let t = this[m];
				return s(t), o(t), $(t), t.copy_.delete(e) || (!!t.drafts_.has(e) && t.copy_.delete(t.drafts_.get(e)));
			}
			clear() {
				let e = this[m];
				s(e), b(e).size && (o(e), $(e), e.copy_.clear());
			}
			values() {
				let e = this[m];
				return s(e), o(e), e.copy_.values();
			}
			entries() {
				let e = this[m];
				return s(e), o(e), e.copy_.entries();
			}
			keys() {
				return this.values();
			}
			[Symbol.iterator]() {
				return this.values();
			}
			forEach(e, t) {
				let r = this.values(),
					n = r.next();
				for (; !n.done; ) e.call(t, n.value, n.value, this), (n = r.next());
			}
		}
		function o(e) {
			e.copy_ ||
				((e.copy_ = new Set()),
				e.base_.forEach((t) => {
					if (g(t)) {
						let r = G(t, e);
						e.drafts_.set(t, r), e.copy_.add(r);
					} else e.copy_.add(t);
				}));
		}
		function s(e) {
			e.revoked_ && p(3, JSON.stringify(b(e)));
		}
		A[(e = "MapSet")] ||
			(A[e] = {
				proxyMap_: function (e, r) {
					return new t(e, r);
				},
				proxySet_: function (e, t) {
					return new i(e, t);
				},
			});
	})();
const V = Symbol("vdomk.Fragment");
function Y(e, t, r) {
	if (e === V) {
		if (void 0 === r) return t.children;
		let e = [t.children];
		return (e.key = r), e;
	}
	return { type: e, key: r, props: t };
}
const X = /^on([a-z]+?)(capture)?$/i,
	J = /^children|value|checked$/;
function K(e, t, r, n, i, o) {
	let s;
	if (!(r === n || J.test(t))) {
		if ("ref" === t) {
			r?.(null), eN(o, () => n?.(e));
			return;
		}
		if ((s = t.match(X))) {
			let [, t, i] = s;
			t = t.toLowerCase();
			let o = !!i;
			r && e.removeEventListener(t, r, o), n && e.addEventListener(t, n, o);
			return;
		}
		if (!i && t in e) {
			e[t] = n;
			return;
		}
		null == n ? e.removeAttribute(t) : e.setAttribute(t, n);
	}
}
function ee(e, t, r) {
	if (t in r) {
		let n = r[t];
		void 0 !== n && n !== e[t] && (e[t] = n ?? "");
	}
}
function et(e) {
	return "string" == typeof e?.type;
}
function er(e) {
	return "function" == typeof e?.type;
}
const { isArray: en } = Array;
function ei(e) {
	return en(e);
}
function eo(e) {
	return null == e || "object" != typeof e;
}
const es = "http://www.w3.org/2000/svg",
	{ min: ea, max: el } = Math;
class eu {
	cleanup() {}
	remove() {
		let e = new Range();
		return e.setStartBefore(this.start()), e.setEndAfter(this.end()), e.extractContents();
	}
	unmount() {
		this.cleanup(), this.remove();
	}
	moveTo(e) {
		let t = this.start().parentElement;
		t.insertBefore(this.remove(), e);
	}
}
class ec extends eu {
	vNode;
	static guard = er;
	parentLayer;
	layerRNode;
	depth;
	alive = !0;
	pending = !0;
	cleanupQueue;
	opc;
	context;
	start() {
		return this.layerRNode.start();
	}
	end() {
		return this.layerRNode.end();
	}
	constructor(e, t, r, n) {
		let i;
		super(), (this.vNode = e), (this.parentLayer = n), (this.depth = (n?.depth ?? -1) + 1);
		let { type: o, props: s } = e,
			a = o(s, this);
		"function" == typeof a ? ((this.opc = a), (i = a(s, this))) : ((this.opc = o), (i = a)),
			(this.layerRNode = new ep(void 0, t, r)),
			this.finishLayerUpdate(i);
	}
	runLayerUpdate(e) {
		this.alive && (this.pending || e) && this.finishLayerUpdate((0, this.opc)(this.vNode.props, this));
	}
	finishLayerUpdate(e) {
		(this.pending = !1), (this.layerRNode = eg(this.layerRNode, e, this));
	}
	scheduleLayerUpdate() {
		this.alive && !this.pending && ((this.pending = !0), ew(this));
	}
	cleanup() {
		this.alive = !1;
		let { cleanupQueue: e } = this;
		if (e) for (let t = e.length - 1; t >= 0; t--) (0, e[t])();
		this.layerRNode.cleanup();
	}
	update(e) {
		if (this.vNode.type !== e.type) return !1;
		let t = this.vNode.props;
		return (this.vNode = e), t !== e.props && this.runLayerUpdate(!0), !0;
	}
}
function em(e) {
	return null == e || "boolean" == typeof e ? "" : String(e);
}
class ep extends eu {
	vNode;
	static guard = eo;
	text;
	start() {
		return this.text;
	}
	end() {
		return this.text;
	}
	constructor(e, t, r) {
		super(), (this.vNode = e);
		let n = new Text(em(e));
		t.insertBefore(n, r), (this.text = n);
	}
	update(e) {
		return (this.text.nodeValue = em(e)), (this.vNode = e), !0;
	}
}
const ed = [
	class extends eu {
		vNode;
		static guard = et;
		children;
		element;
		svg;
		start() {
			return this.element;
		}
		end() {
			return this.element;
		}
		constructor(e, t, r, n) {
			super(), (this.vNode = e);
			let { type: i } = e,
				o = "svg" === i || (t.namespaceURI === es && "foreignObject" !== t.tagName),
				s = o ? document.createElementNS(es, i) : document.createElement(i);
			(this.svg = o), (this.element = s);
			let { props: a } = e;
			for (let e in a) K(s, e, void 0, a[e], this.svg, n.depth + 1);
			let { children: l } = a;
			void 0 !== l && (this.children = ef(l, s, null, n)),
				ee(s, "value", a),
				ee(s, "checked", a),
				t.insertBefore(s, r);
		}
		cleanup() {
			this.children?.cleanup(), this.vNode.props.ref?.(null);
		}
		update(e, t) {
			if (this.vNode.type !== e.type) return !1;
			let r = this.vNode.props,
				n = e.props,
				{ element: i, svg: o } = this,
				s = t.depth + 1;
			for (let e in r) e in n || K(i, e, r[e], void 0, o, s);
			for (let e in n) K(i, e, r[e], n[e], o, s);
			this.vNode = e;
			let { children: a } = n;
			return (
				this.children && void 0 !== a
					? (this.children = eg(this.children, a, t))
					: this.children
					? (this.children.unmount(), (this.children = void 0))
					: void 0 !== a && (this.children = ef(a, i, null, t)),
				ee(i, "value", n),
				ee(i, "checked", n),
				!0
			);
		}
	},
	ec,
	class extends eu {
		vNode;
		static guard = ei;
		children = [];
		start() {
			return this.children[0].start();
		}
		end() {
			return this.children.at(-1).end();
		}
		constructor(e, t, r, n) {
			super(), (this.vNode = e);
			let { children: i } = this,
				o = el(e.length, 1);
			for (let s = 0; s < o; s++) i[s] = ef(e[s], t, r, n);
		}
		cleanup() {
			for (let e of this.children) e.cleanup();
		}
		update(e, t) {
			let r, n, i, o;
			let { children: s } = this,
				a = this.vNode;
			{
				let e = this.end();
				(r = e.parentElement), (n = e.nextSibling);
			}
			let l = a.length,
				u = e.length,
				c = ea(l, u);
			function m(e, n, a, l, u) {
				if (void 0 !== n) {
					let c = o?.get(n);
					if (c) {
						o.delete(n), c.moveTo(e), (s[l] = eg(c, a, t));
						return;
					}
					if (u) {
						let t = new Text();
						r.insertBefore(t, e), (i ??= []).push({ adjacent: t, key: n, vNode: a, index: l });
						return;
					}
				}
				s[l] = ef(a, r, e, t);
			}
			function p(e, t) {
				void 0 !== t ? (o ??= new Map()).set(t, e) : e.unmount();
			}
			(c = el(c, 1)), (u = el(u, 1));
			let d = 0;
			for (; d < c; d++) {
				let r = s[d],
					n = this.vNode[d],
					i = e[d],
					o = n?.key,
					a = i?.key;
				o === a ? (s[d] = eg(r, i, t)) : (m(r.start(), a, i, d, !0), p(r, o));
			}
			for (; d < l; d++) {
				let e = s[d],
					t = this.vNode[d],
					r = t?.key;
				p(e, r);
			}
			for (s.length = u; d < u; d++) {
				let t = e[d],
					r = t?.key;
				m(n, r, t, d, !1);
			}
			if (i) for (let { adjacent: e, key: t, vNode: r, index: n } of i) m(e, t, r, n, !1), e.remove();
			if (o) for (let e of o.values()) e.unmount();
			return (this.vNode = e), !0;
		}
	},
	ep,
];
function ef(e, t, r, n) {
	for (let i of ed) if (i.guard(e)) return new i(e, t, r, n);
}
function eg(e, t, r) {
	let n = e.vNode;
	if (n === t || (e.constructor.guard(t) && n?.key === t?.key && e.update(t, r))) return e;
	e.cleanup();
	let i = e.start(),
		o = ef(t, i.parentElement, i, r);
	return e.remove(), o;
}
const eI = (e, t) => e.depth - t.depth,
	eh = (e, t) => t.depth - e.depth;
let eC = [];
function eR() {
	for (; eC.length; ) {
		let t = eC;
		for (let r of ((eC = []), t.sort(eI), (e = []), t)) r.runLayerUpdate(!1);
		for (; e.length; ) {
			let t = e;
			for (let { cb: r } of ((e = []), t.sort(eh), t)) r();
		}
		e = void 0;
	}
}
const e_ = ({ rootNode: e }) => e();
function ey(e, t, r) {
	let n;
	let i = new ec({ type: e_, key: void 0, props: { rootNode: () => n } }, e, r ?? null, void 0);
	return (
		(n = t),
		i.scheduleLayerUpdate(),
		eR(),
		{
			async render(e) {
				(n = e), i.scheduleLayerUpdate(), await 0, eR();
			},
			unmount() {
				i.unmount();
			},
		}
	);
}
async function ew(e) {
	eC.push(e), await 0, eR();
}
function eN(t, r) {
	e?.push({ depth: t, cb: r }) ?? r();
}
function eb(e, t) {
	e.alive ? (e.cleanupQueue ??= []).push(t) : t();
}
function eP(e, t) {
	eN(e.depth, t);
}
function eS(e) {
	e.scheduleLayerUpdate();
}
const eD = Math.min,
	ev = Math.max,
	eA = Math.round,
	eF = (e) => ({ x: e, y: e }),
	eO = { left: "right", right: "left", bottom: "top", top: "bottom" },
	eB = { start: "end", end: "start" };
function ex(e, t) {
	return "function" == typeof e ? e(t) : e;
}
function ek(e) {
	return e.split("-")[0];
}
function eE(e) {
	return e.split("-")[1];
}
function eH(e) {
	return "x" === e ? "y" : "x";
}
function eU(e) {
	return "y" === e ? "height" : "width";
}
function eq(e) {
	return ["top", "bottom"].includes(ek(e)) ? "y" : "x";
}
function eM(e) {
	return e.replace(/start|end/g, (e) => eB[e]);
}
function eL(e) {
	return e.replace(/left|right|bottom|top/g, (e) => eO[e]);
}
function eT(e) {
	return { ...e, top: e.y, left: e.x, right: e.x + e.width, bottom: e.y + e.height };
}
function ez(e, t, r) {
	let n,
		{ reference: i, floating: o } = e,
		s = eq(t),
		a = eH(eq(t)),
		l = eU(a),
		u = ek(t),
		c = "y" === s,
		m = i.x + i.width / 2 - o.width / 2,
		p = i.y + i.height / 2 - o.height / 2,
		d = i[l] / 2 - o[l] / 2;
	switch (u) {
		case "top":
			n = { x: m, y: i.y - o.height };
			break;
		case "bottom":
			n = { x: m, y: i.y + i.height };
			break;
		case "right":
			n = { x: i.x + i.width, y: p };
			break;
		case "left":
			n = { x: i.x - o.width, y: p };
			break;
		default:
			n = { x: i.x, y: i.y };
	}
	switch (eE(t)) {
		case "start":
			n[a] -= d * (r && c ? -1 : 1);
			break;
		case "end":
			n[a] += d * (r && c ? -1 : 1);
	}
	return n;
}
const eW = async (e, t, r) => {
	let { placement: n = "bottom", strategy: i = "absolute", middleware: o = [], platform: s } = r,
		a = o.filter(Boolean),
		l = await (null == s.isRTL ? void 0 : s.isRTL(t)),
		u = await s.getElementRects({ reference: e, floating: t, strategy: i }),
		{ x: c, y: m } = ez(u, n, l),
		p = n,
		d = {},
		f = 0;
	for (let r = 0; r < a.length; r++) {
		let { name: o, fn: g } = a[r],
			{
				x: I,
				y: h,
				data: C,
				reset: R,
			} = await g({
				x: c,
				y: m,
				initialPlacement: n,
				placement: p,
				strategy: i,
				middlewareData: d,
				rects: u,
				platform: s,
				elements: { reference: e, floating: t },
			});
		if (((c = null != I ? I : c), (m = null != h ? h : m), (d = { ...d, [o]: { ...d[o], ...C } }), R && f <= 50)) {
			f++,
				"object" == typeof R &&
					(R.placement && (p = R.placement),
					R.rects &&
						(u =
							!0 === R.rects
								? await s.getElementRects({ reference: e, floating: t, strategy: i })
								: R.rects),
					({ x: c, y: m } = ez(u, p, l))),
				(r = -1);
			continue;
		}
	}
	return { x: c, y: m, placement: p, strategy: i, middlewareData: d };
};
async function e$(e, t) {
	var r;
	void 0 === t && (t = {});
	let { x: n, y: i, platform: o, rects: s, elements: a, strategy: l } = e,
		{
			boundary: u = "clippingAncestors",
			rootBoundary: c = "viewport",
			elementContext: m = "floating",
			altBoundary: p = !1,
			padding: d = 0,
		} = ex(t, e),
		f =
			"number" != typeof d
				? { top: 0, right: 0, bottom: 0, left: 0, ...d }
				: { top: d, right: d, bottom: d, left: d },
		g = a[p ? ("floating" === m ? "reference" : "floating") : m],
		I = eT(
			await o.getClippingRect({
				element:
					null == (r = await (null == o.isElement ? void 0 : o.isElement(g))) || r
						? g
						: g.contextElement ||
						  (await (null == o.getDocumentElement ? void 0 : o.getDocumentElement(a.floating))),
				boundary: u,
				rootBoundary: c,
				strategy: l,
			}),
		),
		h = "floating" === m ? { ...s.floating, x: n, y: i } : s.reference,
		C = await (null == o.getOffsetParent ? void 0 : o.getOffsetParent(a.floating)),
		R = ((await (null == o.isElement ? void 0 : o.isElement(C))) &&
			(await (null == o.getScale ? void 0 : o.getScale(C)))) || { x: 1, y: 1 },
		_ = eT(
			o.convertOffsetParentRelativeRectToViewportRelativeRect
				? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
						rect: h,
						offsetParent: C,
						strategy: l,
				  })
				: h,
		);
	return {
		top: (I.top - _.top + f.top) / R.y,
		bottom: (_.bottom - I.bottom + f.bottom) / R.y,
		left: (I.left - _.left + f.left) / R.x,
		right: (_.right - I.right + f.right) / R.x,
	};
}
function ej(e) {
	return eZ(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function eG(e) {
	var t;
	return (null == e ? void 0 : null == (t = e.ownerDocument) ? void 0 : t.defaultView) || window;
}
function eQ(e) {
	var t;
	return null == (t = (eZ(e) ? e.ownerDocument : e.document) || window.document) ? void 0 : t.documentElement;
}
function eZ(e) {
	return e instanceof Node || e instanceof eG(e).Node;
}
function eV(e) {
	return e instanceof Element || e instanceof eG(e).Element;
}
function eY(e) {
	return e instanceof HTMLElement || e instanceof eG(e).HTMLElement;
}
function eX(e) {
	return "undefined" != typeof ShadowRoot && (e instanceof ShadowRoot || e instanceof eG(e).ShadowRoot);
}
function eJ(e) {
	let { overflow: t, overflowX: r, overflowY: n, display: i } = e2(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + n + r) && !["inline", "contents"].includes(i);
}
function eK(e) {
	let t = e0(),
		r = e2(e);
	return (
		"none" !== r.transform ||
		"none" !== r.perspective ||
		(!!r.containerType && "normal" !== r.containerType) ||
		(!t && !!r.backdropFilter && "none" !== r.backdropFilter) ||
		(!t && !!r.filter && "none" !== r.filter) ||
		["transform", "perspective", "filter"].some((e) => (r.willChange || "").includes(e)) ||
		["paint", "layout", "strict", "content"].some((e) => (r.contain || "").includes(e))
	);
}
function e0() {
	return "undefined" != typeof CSS && !!CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
}
function e1(e) {
	return ["html", "body", "#document"].includes(ej(e));
}
function e2(e) {
	return eG(e).getComputedStyle(e);
}
function e5(e) {
	return eV(e)
		? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
		: { scrollLeft: e.pageXOffset, scrollTop: e.pageYOffset };
}
function e3(e) {
	if ("html" === ej(e)) return e;
	let t = e.assignedSlot || e.parentNode || (eX(e) && e.host) || eQ(e);
	return eX(t) ? t.host : t;
}
function e4(e) {
	let t = e2(e),
		r = parseFloat(t.width) || 0,
		n = parseFloat(t.height) || 0,
		i = eY(e),
		o = i ? e.offsetWidth : r,
		s = i ? e.offsetHeight : n,
		a = eA(r) !== o || eA(n) !== s;
	return a && ((r = o), (n = s)), { width: r, height: n, $: a };
}
function e6(e) {
	return eV(e) ? e : e.contextElement;
}
function e7(e) {
	let t = e6(e);
	if (!eY(t)) return eF(1);
	let r = t.getBoundingClientRect(),
		{ width: n, height: i, $: o } = e4(t),
		s = (o ? eA(r.width) : r.width) / n,
		a = (o ? eA(r.height) : r.height) / i;
	return (s && Number.isFinite(s)) || (s = 1), (a && Number.isFinite(a)) || (a = 1), { x: s, y: a };
}
const e9 = eF(0);
function e8(e) {
	let t = eG(e);
	return e0() && t.visualViewport ? { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop } : e9;
}
function te(e, t, r, n) {
	var i;
	void 0 === t && (t = !1), void 0 === r && (r = !1);
	let o = e.getBoundingClientRect(),
		s = e6(e),
		a = eF(1);
	t && (n ? eV(n) && (a = e7(n)) : (a = e7(e)));
	let l = (void 0 === (i = r) && (i = !1), n && (!i || n === eG(s)) && i) ? e8(s) : eF(0),
		u = (o.left + l.x) / a.x,
		c = (o.top + l.y) / a.y,
		m = o.width / a.x,
		p = o.height / a.y;
	if (s) {
		let e = eG(s),
			t = n && eV(n) ? eG(n) : n,
			r = e.frameElement;
		for (; r && n && t !== e; ) {
			let e = e7(r),
				t = r.getBoundingClientRect(),
				n = e2(r),
				i = t.left + (r.clientLeft + parseFloat(n.paddingLeft)) * e.x,
				o = t.top + (r.clientTop + parseFloat(n.paddingTop)) * e.y;
			(u *= e.x), (c *= e.y), (m *= e.x), (p *= e.y), (u += i), (c += o), (r = eG(r).frameElement);
		}
	}
	return eT({ width: m, height: p, x: u, y: c });
}
function tt(e) {
	return te(eQ(e)).left + e5(e).scrollLeft;
}
function tr(e, t, r) {
	let n;
	if ("viewport" === t)
		n = (function (e, t) {
			let r = eG(e),
				n = eQ(e),
				i = r.visualViewport,
				o = n.clientWidth,
				s = n.clientHeight,
				a = 0,
				l = 0;
			if (i) {
				(o = i.width), (s = i.height);
				let e = e0();
				(!e || (e && "fixed" === t)) && ((a = i.offsetLeft), (l = i.offsetTop));
			}
			return { width: o, height: s, x: a, y: l };
		})(e, r);
	else if ("document" === t)
		n = (function (e) {
			let t = eQ(e),
				r = e5(e),
				n = e.ownerDocument.body,
				i = ev(t.scrollWidth, t.clientWidth, n.scrollWidth, n.clientWidth),
				o = ev(t.scrollHeight, t.clientHeight, n.scrollHeight, n.clientHeight),
				s = -r.scrollLeft + tt(e),
				a = -r.scrollTop;
			return (
				"rtl" === e2(n).direction && (s += ev(t.clientWidth, n.clientWidth) - i),
				{ width: i, height: o, x: s, y: a }
			);
		})(eQ(e));
	else if (eV(t))
		n = (function (e, t) {
			let r = te(e, !0, "fixed" === t),
				n = r.top + e.clientTop,
				i = r.left + e.clientLeft,
				o = eY(e) ? e7(e) : eF(1),
				s = e.clientWidth * o.x,
				a = e.clientHeight * o.y,
				l = i * o.x,
				u = n * o.y;
			return { width: s, height: a, x: l, y: u };
		})(t, r);
	else {
		let r = e8(e);
		n = { ...t, x: t.x - r.x, y: t.y - r.y };
	}
	return eT(n);
}
function tn(e, t) {
	return eY(e) && "fixed" !== e2(e).position ? (t ? t(e) : e.offsetParent) : null;
}
function ti(e, t) {
	let r = eG(e);
	if (!eY(e)) return r;
	let n = tn(e, t);
	for (; n && ["table", "td", "th"].includes(ej(n)) && "static" === e2(n).position; ) n = tn(n, t);
	return n && ("html" === ej(n) || ("body" === ej(n) && "static" === e2(n).position && !eK(n)))
		? r
		: n ||
				(function (e) {
					let t = e3(e);
					for (; eY(t) && !e1(t); ) {
						if (eK(t)) return t;
						t = e3(t);
					}
					return null;
				})(e) ||
				r;
}
const to = async function (e) {
		let { reference: t, floating: r, strategy: n } = e,
			i = this.getOffsetParent || ti,
			o = this.getDimensions;
		return {
			reference: (function (e, t, r) {
				let n = eY(t),
					i = eQ(t),
					o = "fixed" === r,
					s = te(e, !0, o, t),
					a = { scrollLeft: 0, scrollTop: 0 },
					l = eF(0);
				if (n || (!n && !o)) {
					if ((("body" !== ej(t) || eJ(i)) && (a = e5(t)), n)) {
						let e = te(t, !0, o, t);
						(l.x = e.x + t.clientLeft), (l.y = e.y + t.clientTop);
					} else i && (l.x = tt(i));
				}
				return {
					x: s.left + a.scrollLeft - l.x,
					y: s.top + a.scrollTop - l.y,
					width: s.width,
					height: s.height,
				};
			})(t, await i(r), n),
			floating: { x: 0, y: 0, ...(await o(r)) },
		};
	},
	ts = {
		convertOffsetParentRelativeRectToViewportRelativeRect: function (e) {
			let { rect: t, offsetParent: r, strategy: n } = e,
				i = eY(r),
				o = eQ(r);
			if (r === o) return t;
			let s = { scrollLeft: 0, scrollTop: 0 },
				a = eF(1),
				l = eF(0);
			if ((i || (!i && "fixed" !== n)) && (("body" !== ej(r) || eJ(o)) && (s = e5(r)), eY(r))) {
				let e = te(r);
				(a = e7(r)), (l.x = e.x + r.clientLeft), (l.y = e.y + r.clientTop);
			}
			return {
				width: t.width * a.x,
				height: t.height * a.y,
				x: t.x * a.x - s.scrollLeft * a.x + l.x,
				y: t.y * a.y - s.scrollTop * a.y + l.y,
			};
		},
		getDocumentElement: eQ,
		getClippingRect: function (e) {
			let { element: t, boundary: r, rootBoundary: n, strategy: i } = e,
				o =
					"clippingAncestors" === r
						? (function (e, t) {
								let r = t.get(e);
								if (r) return r;
								let n = (function e(t, r, n) {
										var i;
										void 0 === r && (r = []), void 0 === n && (n = !0);
										let o = (function e(t) {
												let r = e3(t);
												return e1(r)
													? t.ownerDocument
														? t.ownerDocument.body
														: t.body
													: eY(r) && eJ(r)
													? r
													: e(r);
											})(t),
											s = o === (null == (i = t.ownerDocument) ? void 0 : i.body),
											a = eG(o);
										return s
											? r.concat(
													a,
													a.visualViewport || [],
													eJ(o) ? o : [],
													a.frameElement && n ? e(a.frameElement) : [],
											  )
											: r.concat(o, e(o, [], n));
									})(e, [], !1).filter((e) => eV(e) && "body" !== ej(e)),
									i = null,
									o = "fixed" === e2(e).position,
									s = o ? e3(e) : e;
								for (; eV(s) && !e1(s); ) {
									let t = e2(s),
										r = eK(s);
									r || "fixed" !== t.position || (i = null);
									let a = o
										? !r && !i
										: (!r &&
												"static" === t.position &&
												!!i &&
												["absolute", "fixed"].includes(i.position)) ||
										  (eJ(s) &&
												!r &&
												(function e(t, r) {
													let n = e3(t);
													return (
														!(n === r || !eV(n) || e1(n)) &&
														("fixed" === e2(n).position || e(n, r))
													);
												})(e, s));
									a ? (n = n.filter((e) => e !== s)) : (i = t), (s = e3(s));
								}
								return t.set(e, n), n;
						  })(t, this._c)
						: [].concat(r),
				s = [...o, n],
				a = s[0],
				l = s.reduce(
					(e, r) => {
						let n = tr(t, r, i);
						return (
							(e.top = ev(n.top, e.top)),
							(e.right = eD(n.right, e.right)),
							(e.bottom = eD(n.bottom, e.bottom)),
							(e.left = ev(n.left, e.left)),
							e
						);
					},
					tr(t, a, i),
				);
			return { width: l.right - l.left, height: l.bottom - l.top, x: l.left, y: l.top };
		},
		getOffsetParent: ti,
		getElementRects: to,
		getClientRects: function (e) {
			return Array.from(e.getClientRects());
		},
		getDimensions: function (e) {
			return e4(e);
		},
		getScale: e7,
		isElement: eV,
		isRTL: function (e) {
			return "rtl" === e2(e).direction;
		},
	},
	ta = (e, t, r) => {
		let n = new Map(),
			i = { platform: ts, ...r },
			o = { ...i.platform, _c: n };
		return eW(e, t, { ...i, platform: o });
	},
	tl = /^-?\d+(\.\d+)?$/,
	{ MIN_SAFE_INTEGER: tu, MAX_SAFE_INTEGER: tc } = Number,
	tm = BigInt(tu),
	tp = BigInt(tc);
class td {
	[c] = !1;
	ps;
	qs;
	pb;
	qb;
	constructor() {}
	static fromBigInts(e, t) {
		if (0n === t) throw RangeError("BigRat divide by zero");
		let r = (function (e, t) {
			for (; 0n !== t; ) {
				let r = t;
				(t = e % t), (e = r);
			}
			return e;
		})(e, t);
		1n !== r && ((e /= r), (t /= r)), t < 0n && ((e = -e), (t = -t));
		let n = new td();
		return e >= tm && e <= tp && t <= tp ? ((n.ps = Number(e)), (n.qs = Number(t))) : ((n.pb = e), (n.qb = t)), n;
	}
	static fromInteger(e) {
		if ((0 | e) !== e) throw TypeError("Number is not an integer");
		let t = new td();
		return (t.ps = e), (t.qs = 1), t;
	}
	static fromIntegers(e, t) {
		if (0 === t) throw RangeError("BigRat divide by zero");
		if (e < tu || e > tc || t < tu || t > tc) throw TypeError("Numbers are out of range");
		let r = (function (e, t) {
			for (; 0 !== t; ) {
				let r = t;
				(t = e % t), (e = r);
			}
			return e;
		})(e, t);
		1 !== r && ((e /= r), (t /= r)), t < 0 && ((e = -e), (t = -t));
		let n = new td();
		return (n.ps = e), (n.qs = t), n;
	}
	static tryParse(e) {
		let t = e.match(tl);
		if (!t) return null;
		let r = t[1];
		return r
			? td.fromBigInts(BigInt(e.replace(".", "")), BigInt("1".padEnd(r.length, "0")))
			: td.fromBigInts(BigInt(e), 1n);
	}
	static parse(e) {
		let t = td.tryParse(e);
		if (!t) throw TypeError("BigRat parse error");
		return t;
	}
	static fromRatioString(e) {
		let t = e.match(/^(-?\d+):(\d+)$/);
		if (!t) throw TypeError("BigRat parse error");
		let [, r, n] = t;
		return td.fromBigInts(BigInt(r), BigInt(n));
	}
	terms() {
		return { p: this.pb ?? BigInt(this.ps), q: this.qb ?? BigInt(this.qs) };
	}
	toNumberApprox() {
		return null != this.pb ? Number(this.pb) / Number(this.qb) : this.ps / this.qs;
	}
	toFixed(e) {
		return this.toNumberApprox().toFixed(e);
	}
	toStringAdaptive() {
		let e = this.toNumberApprox();
		return e.toFixed(e > 100 ? 0 : e > 10 ? 1 : 2);
	}
	toRatioString() {
		return `${this.pb ?? this.ps}:${this.qb ?? this.qs}`;
	}
	static compare(e, t) {
		let r = e.pb,
			n = t.pb;
		if (null != r || null != n) {
			let i = (r ?? BigInt(e.ps)) * (t.qb ?? BigInt(t.qs)),
				o = (e.qb ?? BigInt(e.qs)) * (n ?? BigInt(t.ps));
			return i < o ? -1 : i > o ? 1 : 0;
		}
		let i = e.ps * t.qs,
			o = e.qs * t.ps;
		if (i < tu || i > tc || o < tu || o > tc) {
			let i = (r ?? BigInt(e.ps)) * (t.qb ?? BigInt(t.qs)),
				o = (e.qb ?? BigInt(e.qs)) * (n ?? BigInt(t.ps));
			return i < o ? -1 : i > o ? 1 : 0;
		}
		return i < o ? -1 : i > o ? 1 : 0;
	}
	eq(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n === i;
		}
		let n = this.ps * e.qs,
			i = this.qs * e.ps;
		if (n < tu || n > tc || i < tu || i > tc) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n === i;
		}
		return n === i;
	}
	gt(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n > i;
		}
		let n = this.ps * e.qs,
			i = this.qs * e.ps;
		if (n < tu || n > tc || i < tu || i > tc) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n > i;
		}
		return n > i;
	}
	lt(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n < i;
		}
		let n = this.ps * e.qs,
			i = this.qs * e.ps;
		if (n < tu || n > tc || i < tu || i > tc) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n < i;
		}
		return n < i;
	}
	gte(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n >= i;
		}
		let n = this.ps * e.qs,
			i = this.qs * e.ps;
		if (n < tu || n > tc || i < tu || i > tc) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n >= i;
		}
		return n >= i;
	}
	lte(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n <= i;
		}
		let n = this.ps * e.qs,
			i = this.qs * e.ps;
		if (n < tu || n > tc || i < tu || i > tc) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n <= i;
		}
		return n <= i;
	}
	neq(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n !== i;
		}
		let n = this.ps * e.qs,
			i = this.qs * e.ps;
		if (n < tu || n > tc || i < tu || i > tc) {
			let n = (t ?? BigInt(this.ps)) * (e.qb ?? BigInt(e.qs)),
				i = (this.qb ?? BigInt(this.qs)) * (r ?? BigInt(e.ps));
			return n !== i;
		}
		return n !== i;
	}
	add(e) {
		if (0n === this.pb || 0 === this.ps) return e;
		if (0n === e.pb || 0 === e.ps) return this;
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = t ?? BigInt(this.ps),
				i = this.qb ?? BigInt(this.qs),
				o = r ?? BigInt(e.ps),
				s = e.qb ?? BigInt(e.qs);
			return td.fromBigInts(n * s + i * o, i * s);
		}
		{
			let n = this.ps,
				i = this.qs,
				o = e.ps,
				s = e.qs,
				a = n * s,
				l = i * o,
				u = a + l,
				c = i * s;
			if (c <= tc && u >= tu && u <= tc && a >= tu && a <= tc && l >= tu && l <= tc) return td.fromIntegers(u, c);
			{
				let n = t ?? BigInt(this.ps),
					i = this.qb ?? BigInt(this.qs),
					o = r ?? BigInt(e.ps),
					s = e.qb ?? BigInt(e.qs);
				return td.fromBigInts(n * s + i * o, i * s);
			}
		}
	}
	sub(e) {
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = t ?? BigInt(this.ps),
				i = this.qb ?? BigInt(this.qs),
				o = r ?? BigInt(e.ps),
				s = e.qb ?? BigInt(e.qs);
			return td.fromBigInts(n * s - i * o, i * s);
		}
		{
			let n = this.ps,
				i = this.qs,
				o = e.ps,
				s = e.qs,
				a = n * s,
				l = i * o,
				u = a - l,
				c = i * s;
			if (c <= tc && u >= tu && u <= tc && a >= tu && a <= tc && l >= tu && l <= tc) return td.fromIntegers(u, c);
			{
				let n = t ?? BigInt(this.ps),
					i = this.qb ?? BigInt(this.qs),
					o = r ?? BigInt(e.ps),
					s = e.qb ?? BigInt(e.qs);
				return td.fromBigInts(n * s - i * o, i * s);
			}
		}
	}
	mul(e) {
		if (0n === this.pb || 0 === this.ps || 0n === e.pb || 0 === e.ps) return td.ZERO;
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = t ?? BigInt(this.ps),
				i = this.qb ?? BigInt(this.qs),
				o = r ?? BigInt(e.ps),
				s = e.qb ?? BigInt(e.qs);
			return td.fromBigInts(n * o, i * s);
		}
		{
			let n = this.ps,
				i = this.qs,
				o = e.ps,
				s = e.qs,
				a = n * o,
				l = i * s;
			if (l <= tc && a >= tu && a <= tc) return td.fromIntegers(a, l);
			{
				let n = t ?? BigInt(this.ps),
					i = this.qb ?? BigInt(this.qs),
					o = r ?? BigInt(e.ps),
					s = e.qb ?? BigInt(e.qs);
				return td.fromBigInts(n * o, i * s);
			}
		}
	}
	div(e) {
		if (0n === this.pb || 0 === this.ps) return this;
		let t = this.pb,
			r = e.pb;
		if (null != t || null != r) {
			let n = t ?? BigInt(this.ps),
				i = this.qb ?? BigInt(this.qs),
				o = r ?? BigInt(e.ps),
				s = e.qb ?? BigInt(e.qs);
			return td.fromBigInts(n * s, i * o);
		}
		{
			let n = this.ps,
				i = this.qs,
				o = e.ps,
				s = e.qs,
				a = n * s,
				l = i * o;
			if (l >= tu && l <= tc && a >= tu && a <= tc) return td.fromIntegers(a, l);
			{
				let n = t ?? BigInt(this.ps),
					i = this.qb ?? BigInt(this.qs),
					o = r ?? BigInt(e.ps),
					s = e.qb ?? BigInt(e.qs);
				return td.fromBigInts(n * s, i * o);
			}
		}
	}
	fma(e, t) {
		if (0n === e.pb || 0 === e.ps || 0n === t.pb || 0 === t.ps) return this;
		let r = this.pb,
			n = e.pb,
			i = t.pb;
		if (null != r || null != n || null != i) {
			let o = r ?? BigInt(this.ps),
				s = this.qb ?? BigInt(this.qs),
				a = n ?? BigInt(e.ps),
				l = e.qb ?? BigInt(e.qs),
				u = i ?? BigInt(t.ps),
				c = t.qb ?? BigInt(t.qs),
				m = l * c;
			return td.fromBigInts(o * m + s * (a * u), s * m);
		}
		{
			let o = this.ps,
				s = this.qs,
				a = e.ps,
				l = e.qs,
				u = t.ps,
				c = t.qs,
				m = a * u,
				p = l * c,
				d = o * p,
				f = s * m,
				g = d + f,
				I = s * p;
			if (
				m >= tu &&
				m <= tc &&
				p <= tc &&
				d >= tu &&
				d <= tc &&
				f >= tu &&
				f <= tc &&
				g >= tu &&
				g <= tc &&
				I <= tc
			)
				return td.fromIntegers(g, I);
			{
				let o = r ?? BigInt(this.ps),
					s = this.qb ?? BigInt(this.qs),
					a = n ?? BigInt(e.ps),
					l = e.qb ?? BigInt(e.qs),
					u = i ?? BigInt(t.ps),
					c = t.qb ?? BigInt(t.qs),
					m = l * c;
				return td.fromBigInts(o * m + s * (a * u), s * m);
			}
		}
	}
	abs() {
		let { pb: e } = this;
		if (null != e) {
			if (!(e < 0n)) return this;
			{
				let t = new td();
				return (t.pb = -e), (t.qb = this.qb), t;
			}
		}
		let { ps: t } = this;
		if (!(t < 0)) return this;
		{
			let e = new td();
			return (e.ps = -t), (e.qs = this.qs), e;
		}
	}
	neg() {
		let { pb: e } = this;
		if (null != e) {
			if (0n === e) return this;
			{
				let t = new td();
				return (t.pb = -e), (t.qb = this.qb), t;
			}
		}
		let { ps: t } = this;
		if (0 === t) return this;
		{
			let e = new td();
			return (e.ps = -t), (e.qs = this.qs), e;
		}
	}
	inv() {
		let { pb: e } = this;
		if (null != e) {
			let { qb: t } = this;
			e < 0n && ((e = -e), (t = -t));
			let r = new td();
			return (r.pb = t), (r.qb = e), r;
		}
		{
			let { ps: e, qs: t } = this;
			e < 0 && ((e = -e), (t = -t));
			let r = new td();
			return (r.ps = t), (r.qs = e), r;
		}
	}
	sign() {
		let { pb: e } = this;
		if (null != e) return e > 0n ? 1 : e < 0n ? -1 : 0;
		let { ps: t } = this;
		return t > 0 ? 1 : t < 0 ? -1 : 0;
	}
	debug() {
		return this.toRatioString();
	}
	uneval() {
		return null != this.pb
			? `BigRat.fromBigInts(${this.pb}n, ${this.qb}n)`
			: 1 === this.qs
			? `BigRat.fromInteger(${this.ps})`
			: `BigRat.fromIntegers(${this.ps}, ${this.qs})`;
	}
	static ZERO = td.fromInteger(0);
	static ONE = td.fromInteger(1);
	static MINUS_ONE = td.fromInteger(-1);
}
var tf = {};
tf = new URL("Desc_Coal_C.e5a20c79.png", import.meta.url).toString();
var tg = {};
tg = new URL("Desc_OreCopper_C.fa33a7d7.png", import.meta.url).toString();
var tI = {};
tI = new URL("Desc_OreGold_C.eed3d0d7.png", import.meta.url).toString();
var th = {};
th = new URL("Desc_OreIron_C.4fefb300.png", import.meta.url).toString();
var tC = {};
tC = new URL("Desc_RawQuartz_C.d61c8088.png", import.meta.url).toString();
var tR = {};
tR = new URL("Desc_Stone_C.b94988a1.png", import.meta.url).toString();
var t_ = {};
t_ = new URL("Desc_Sulfur_C.e2ec66cb.png", import.meta.url).toString();
var ty = {};
ty = new URL("Desc_LiquidOil_C.edb0edec.png", import.meta.url).toString();
var tw = {};
tw = new URL("Desc_NitrogenGas_C.229f69c9.png", import.meta.url).toString();
var tN = {};
tN = new URL("Desc_Water_C.f2201915.png", import.meta.url).toString();
var tb = {};
tb = new URL("Desc_OreBauxite_C.588ddb3d.png", import.meta.url).toString();
var tP = {};
tP = new URL("Desc_OreUranium_C.aa89db3f.png", import.meta.url).toString();
var tS = {};
tS = new URL("Desc_NuclearWaste_C.91f7646d.png", import.meta.url).toString();
var tD = {};
tD = new URL("Desc_PlutoniumWaste_C.ae1da29f.png", import.meta.url).toString();
var tv = {};
tv = new URL("Desc_Battery_C.3aaa8ae8.png", import.meta.url).toString();
var tA = {};
tA = new URL("Desc_AluminumIngot_C.99db357e.png", import.meta.url).toString();
var tF = {};
tF = new URL("Desc_NonFissibleUranium_C.0bb25776.png", import.meta.url).toString();
var tO = {};
tO = new URL("Desc_PlutoniumPellet_C.bf19f584.png", import.meta.url).toString();
var tB = {};
tB = new URL("Desc_PlutoniumCell_C.5294b3db.png", import.meta.url).toString();
var tx = {};
tx = new URL("Desc_IronRod_C.7500474c.png", import.meta.url).toString();
var tk = {};
tk = new URL("Desc_IronScrew_C.3922b4c8.png", import.meta.url).toString();
var tE = {};
tE = new URL("Desc_Wire_C.69526100.png", import.meta.url).toString();
var tH = {};
tH = new URL("Desc_Cement_C.ab60fd78.png", import.meta.url).toString();
var tU = {};
tU = new URL("Desc_Silica_C.317af1eb.png", import.meta.url).toString();
var tq = {};
tq = new URL("Desc_IronPlate_C.876b115f.png", import.meta.url).toString();
var tM = {};
tM = new URL("Desc_SteelPlate_C.82e15caa.png", import.meta.url).toString();
var tL = {};
tL = new URL("Desc_Cable_C.adbf794c.png", import.meta.url).toString();
var tT = {};
tT = new URL("Desc_ModularFrame_C.55c7fe30.png", import.meta.url).toString();
var tz = {};
tz = new URL("Desc_Fuel_C.0c8cab49.png", import.meta.url).toString();
var tW = {};
tW = new URL("Desc_TurboFuel_C.e21a76b4.png", import.meta.url).toString();
var t$ = {};
t$ = new URL("Desc_HazmatFilter_C.4d035966.png", import.meta.url).toString();
var tj = {};
tj = new URL("Desc_Filter_C.152f5653.png", import.meta.url).toString();
var tG = {};
tG = new URL("Desc_IronPlateReinforced_C.fbcc1bed.png", import.meta.url).toString();
var tQ = {};
tQ = new URL("Desc_CopperIngot_C.79adb3a9.png", import.meta.url).toString();
var tZ = {};
tZ = new URL("Desc_ModularFrameFused_C.b77b3a07.png", import.meta.url).toString();
var tV = {};
tV = new URL("Desc_CircuitBoard_C.91790c18.png", import.meta.url).toString();
var tY = {};
tY = new URL("Desc_CopperSheet_C.d7a5263c.png", import.meta.url).toString();
var tX = {};
tX = new URL("Desc_CrystalOscillator_C.0e0482d7.png", import.meta.url).toString();
var tJ = {};
tJ = new URL("Desc_SpaceElevatorPart_1_C.5f69254c.png", import.meta.url).toString();
var tK = {};
tK = new URL("Desc_SpaceElevatorPart_2_C.d2208e64.png", import.meta.url).toString();
var t0 = {};
t0 = new URL("Desc_SpaceElevatorPart_3_C.3a9fa880.png", import.meta.url).toString();
var t1 = {};
t1 = new URL("Desc_SpaceElevatorPart_4_C.ad83f9ab.png", import.meta.url).toString();
var t2 = {};
t2 = new URL("Desc_PackagedWater_C.cac705eb.png", import.meta.url).toString();
var t5 = {};
t5 = new URL("Desc_HighSpeedConnector_C.2e00fe8a.png", import.meta.url).toString();
var t3 = {};
t3 = new URL("Desc_Motor_C.84a1655a.png", import.meta.url).toString();
var t4 = {};
t4 = new URL("Desc_SpaceElevatorPart_5_C.5c2d2406.png", import.meta.url).toString();
var t6 = {};
t6 = new URL("Desc_SpaceElevatorPart_6_C.08731c71.png", import.meta.url).toString();
var t7 = {};
t7 = new URL("Desc_SpaceElevatorPart_7_C.8e160a0c.png", import.meta.url).toString();
var t9 = {};
t9 = new URL("Desc_SpaceElevatorPart_8_C.6bc62dbe.png", import.meta.url).toString();
var t8 = {};
t8 = new URL("Desc_SpaceElevatorPart_9_C.42aab80d.png", import.meta.url).toString();
var re = {};
re = new URL("Desc_IronIngot_C.e8347158.png", import.meta.url).toString();
var rt = {};
rt = new URL("Desc_AluminumPlate_C.4de46949.png", import.meta.url).toString();
var rr = {};
rr = new URL("Desc_Rotor_C.92980c81.png", import.meta.url).toString();
var rn = {};
rn = new URL("Desc_Rubber_C.c56d0fe3.png", import.meta.url).toString();
var ri = {};
ri = new URL("Desc_Plastic_C.c64e64e7.png", import.meta.url).toString();
var ro = {};
ro = new URL("Desc_SteelPlateReinforced_C.e6616f0a.png", import.meta.url).toString();
var rs = {};
rs = new URL("Desc_SteelPipe_C.d16b533e.png", import.meta.url).toString();
var ra = {};
ra = new URL("Desc_LiquidFuel_C.04ac11f7.png", import.meta.url).toString();
var rl = {};
rl = new URL("Desc_PolymerResin_C.9c11f328.png", import.meta.url).toString();
var ru = {};
ru = new URL("Desc_HeavyOilResidue_C.2786413f.png", import.meta.url).toString();
var rc = {};
rc = new URL("Desc_PetroleumCoke_C.68f0eb03.png", import.meta.url).toString();
var rm = {};
rm = new URL("Desc_FluidCanister_C.f5f4a6e3.png", import.meta.url).toString();
var rp = {};
rp = new URL("Desc_ModularFrameHeavy_C.a9baa600.png", import.meta.url).toString();
var rd = {};
rd = new URL("Desc_PackagedOil_C.a1acb8c3.png", import.meta.url).toString();
var rf = {};
rf = new URL("Desc_PackagedOilResidue_C.ca80a756.png", import.meta.url).toString();
var rg = {};
rg = new URL("Desc_SteelIngot_C.495f173a.png", import.meta.url).toString();
var rI = {};
rI = new URL("Desc_AluminaSolution_C.229f69c9.png", import.meta.url).toString();
var rh = {};
rh = new URL("Desc_AluminumScrap_C.a84252f0.png", import.meta.url).toString();
var rC = {};
rC = new URL("Desc_SulfuricAcid_C.81e65aef.png", import.meta.url).toString();
var rR = {};
rR = new URL("Desc_UraniumCell_C.1e1c8336.png", import.meta.url).toString();
var r_ = {};
r_ = new URL("Desc_AluminumPlateReinforced_C.7fbdd9c5.png", import.meta.url).toString();
var ry = {};
ry = new URL("Desc_CoolingSystem_C.55180979.png", import.meta.url).toString();
var rw = {};
rw = new URL("Desc_NitricAcid_C.a07930ad.png", import.meta.url).toString();
var rN = {};
rN = new URL("Desc_AluminumCasing_C.83f37029.png", import.meta.url).toString();
var rb = {};
rb = new URL("Desc_ModularFrameLightweight_C.8eee39f6.png", import.meta.url).toString();
var rP = {};
rP = new URL("Desc_Computer_C.c396ff21.png", import.meta.url).toString();
var rS = {};
rS = new URL("Desc_QuartzCrystal_C.024fe3c2.png", import.meta.url).toString();
var rD = {};
rD = new URL("Desc_GoldIngot_C.3e05f49d.png", import.meta.url).toString();
var rv = {};
rv = new URL("Desc_Stator_C.ba9ffb23.png", import.meta.url).toString();
var rA = {};
rA = new URL("Desc_CircuitBoardHighSpeed_C.1223b515.png", import.meta.url).toString();
var rF = {};
rF = new URL("Desc_HighSpeedWire_C.d881d8e1.png", import.meta.url).toString();
var rO = {};
rO = new URL("Desc_CompactedCoal_C.e2ed4ac2.png", import.meta.url).toString();
var rB = {};
rB = new URL("Desc_LiquidTurboFuel_C.a7b4cd34.png", import.meta.url).toString();
var rx = {};
rx = new URL("Desc_ComputerSuper_C.c896ffad.png", import.meta.url).toString();
var rk = {};
rk = new URL("Desc_GasTank_C.cf4a9f86.png", import.meta.url).toString();
var rE = {};
rE = new URL("Desc_ElectromagneticControlRod_C.cfc5cd55.png", import.meta.url).toString();
var rH = {};
rH = new URL("Desc_PressureConversionCube_C.9d8ebf1a.png", import.meta.url).toString();
var rU = {};
rU = new URL("Desc_MotorLightweight_C.4806a50c.png", import.meta.url).toString();
var rq = {};
rq = new URL("Desc_CopperDust_C.03f2d4f2.png", import.meta.url).toString();
var rM = {};
rM = new URL("Desc_Gunpowder_C.2a112529.png", import.meta.url).toString();
var rL = {};
rL = new URL("Desc_GunpowderMK2_C.564bd06b.png", import.meta.url).toString();
var rT = {};
rT = new URL("Desc_Biofuel_C.e03c2735.png", import.meta.url).toString();
var rz = {};
rz = new URL("Desc_PackagedBiofuel_C.3a463ffa.png", import.meta.url).toString();
var rW = {};
rW = new URL("Desc_GenericBiomass_C.c2f35d90.png", import.meta.url).toString();
var r$ = {};
r$ = new URL("Desc_LiquidBiofuel_C.d38b8f43.png", import.meta.url).toString();
var rj = {};
rj = new URL("Desc_PackagedAlumina_C.fa70382e.png", import.meta.url).toString();
var rG = {};
rG = new URL("Desc_PackagedSulfuricAcid_C.eacc4384.png", import.meta.url).toString();
var rQ = {};
rQ = new URL("Desc_PackagedNitrogenGas_C.b332d70b.png", import.meta.url).toString();
var rZ = {};
rZ = new URL("Desc_PackagedNitricAcid_C.a4b5790f.png", import.meta.url).toString();
var rV = {};
rV = new URL("Desc_Fabric_C.84b55644.png", import.meta.url).toString();
var rY = {};
rY = new URL("Desc_Rebar_Explosive_C.c48ba7c9.png", import.meta.url).toString();
var rX = {};
rX = new URL("Desc_Rebar_Stunshot_C.8b7674c8.png", import.meta.url).toString();
var rJ = {};
rJ = new URL("Desc_SpikedRebar_C.81aa7a62.png", import.meta.url).toString();
var rK = {};
rK = new URL("Desc_CartridgeSmartProjectile_C.5938f2f5.png", import.meta.url).toString();
var r0 = {};
r0 = new URL("Desc_NobeliskCluster_C.2a5a5828.png", import.meta.url).toString();
var r1 = {};
r1 = new URL("Desc_NobeliskExplosive_C.275065ba.png", import.meta.url).toString();
var r2 = {};
r2 = new URL("Desc_NobeliskGas_C.9adc4817.png", import.meta.url).toString();
var r5 = {};
r5 = new URL("Desc_NobeliskNuke_C.4d4db933.png", import.meta.url).toString();
var r3 = {};
r3 = new URL("Desc_NobeliskShockwave_C.c51e297c.png", import.meta.url).toString();
var r4 = {};
r4 = new URL("Desc_CartridgeChaos_C.3e48eb86.png", import.meta.url).toString();
var r6 = {};
r6 = new URL("Desc_CartridgeStandard_C.0b823af0.png", import.meta.url).toString();
var r7 = {};
r7 = new URL("Desc_NuclearFuelRod_C.e1fde064.png", import.meta.url).toString();
var r9 = {};
r9 = new URL("Desc_PlutoniumFuelRod_C.551916f6.png", import.meta.url).toString();
var r8 = {};
r8 = new URL("Desc_Rebar_Spreadshot_C.699cdef9.png", import.meta.url).toString();
var ne = {};
ne = new URL("BP_EquipmentDescriptorBeacon_C.79d5f3fe.png", import.meta.url).toString();
var nt = {};
nt = new URL("BP_ItemDescriptorPortableMiner_C.b35ad6cd.png", import.meta.url).toString();
const nr = [
		{
			ClassName: "Desc_Coal_C",
			DisplayName: "Coal",
			Description: "Mainly used as fuel for vehicles & coal generators and for steel production.",
			IsResource: !0,
			Icon: t(tf),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(3),
			SortOrder: 3,
		},
		{
			ClassName: "Desc_OreCopper_C",
			DisplayName: "Copper Ore",
			Description: "Used for crafting.\nBasic resource mainly used for electricity.",
			IsResource: !0,
			Icon: t(tg),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(3),
			SortOrder: 2,
		},
		{
			ClassName: "Desc_OreGold_C",
			DisplayName: "Caterium Ore",
			Description:
				"Caterium Ore is smelted into Caterium Ingots. Caterium Ingots are mostly used for advanced electronics.",
			IsResource: !0,
			Icon: t(tI),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(7),
			SortOrder: 4,
		},
		{
			ClassName: "Desc_OreIron_C",
			DisplayName: "Iron Ore",
			Description: "Used for crafting.\nThe most essential basic resource.",
			IsResource: !0,
			Icon: t(th),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(1),
			SortOrder: 0,
		},
		{
			ClassName: "Desc_RawQuartz_C",
			DisplayName: "Raw Quartz",
			Description:
				"Raw Quartz can be processed into Quartz Crystals and Silica, which both offer a variety of applications.",
			IsResource: !0,
			Icon: t(tC),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(15),
			SortOrder: 5,
		},
		{
			ClassName: "Desc_Stone_C",
			DisplayName: "Limestone",
			Description: "Used for crafting.\nBasic resource mainly used for stable foundations.",
			IsResource: !0,
			Icon: t(tR),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(2),
			SortOrder: 1,
		},
		{
			ClassName: "Desc_Sulfur_C",
			DisplayName: "Sulfur",
			Description: "Sulfur is primarily used for Black Powder.",
			IsResource: !0,
			Icon: t(t_),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(11),
			SortOrder: 6,
		},
		{
			ClassName: "Desc_LiquidOil_C",
			DisplayName: "Crude Oil",
			Description: "Crude Oil is refined into all kinds of Oil-based resources, like Fuel and Plastic.",
			IsResource: !0,
			Icon: t(ty),
			IsPiped: !0,
			Color: "#190019",
			SinkPoints: td.fromInteger(30),
			SortOrder: 7,
		},
		{
			ClassName: "Desc_NitrogenGas_C",
			DisplayName: "Nitrogen Gas",
			Description:
				"Nitrogen can be used in a variety of ways, such as metallurgy, cooling, and Nitric Acid production. On Massage-2(AB)b, it can be extracted from underground gas wells.",
			IsResource: !0,
			Icon: t(tw),
			IsPiped: !0,
			Color: "#ffffff",
			SinkPoints: td.fromInteger(10),
			SortOrder: 9,
		},
		{
			ClassName: "Desc_Water_C",
			DisplayName: "Water",
			Description: "It's water.",
			IsResource: !0,
			Icon: t(tN),
			IsPiped: !0,
			Color: "#7ab0d4",
			SinkPoints: td.fromInteger(5),
			SortOrder: 11,
		},
		{
			ClassName: "Desc_OreBauxite_C",
			DisplayName: "Bauxite",
			Description:
				"Bauxite is used to produce Alumina, which can be further refined into the Aluminum Scrap required to produce Aluminum Ingots.",
			IsResource: !0,
			Icon: t(tb),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(8),
			SortOrder: 8,
		},
		{
			ClassName: "Desc_OreUranium_C",
			DisplayName: "Uranium",
			Description:
				"Uranium is a radioactive element. \nUsed to produce Encased Uranium Cells for Uranium Fuel Rods.\n\nCaution: Moderately Radioactive.",
			IsResource: !0,
			Icon: t(tP),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(35),
			SortOrder: 10,
		},
		{
			ClassName: "Desc_NuclearWaste_C",
			DisplayName: "Uranium Waste",
			Description:
				"The by-product of consuming Uranium Fuel Rods in the Nuclear Power Plant.\nNon-fissile Uranium can be extracted. Handle with caution.\n\nCaution: HIGHLY Radioactive.",
			IsResource: !1,
			Icon: t(tS),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(0),
			SortOrder: 97,
		},
		{
			ClassName: "Desc_PlutoniumWaste_C",
			DisplayName: "Plutonium Waste",
			Description:
				"The by-product of consuming Plutonium Fuel Rods in the Nuclear Power Plant.\nNeeds to be stored in a safe location. Handle with caution.\n\nCaution: EXTREMELY Radioactive.",
			IsResource: !1,
			Icon: t(tD),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(0),
			SortOrder: 114,
		},
		{
			ClassName: "Desc_Battery_C",
			DisplayName: "Battery",
			Description: "Primarily used as fuel for Drones and Vehicles.",
			IsResource: !1,
			Icon: t(tv),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(465),
			SortOrder: 90,
		},
		{
			ClassName: "Desc_AluminumIngot_C",
			DisplayName: "Aluminum Ingot",
			Description:
				"Aluminum Ingots are made from Aluminum Scrap, which is refined from Alumina Solution.\nUsed to produce specialized aluminum-based parts.",
			IsResource: !1,
			Icon: t(tA),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(131),
			SortOrder: 82,
		},
		{
			ClassName: "Desc_NonFissibleUranium_C",
			DisplayName: "Non-fissile Uranium",
			Description:
				"The isotope Uranium-238 is non-fissile, meaning it cannot be used for nuclear fission. It can, however, be converted into fissile Plutonium in the Particle Accelerator.\n\nCaution: Mildly Radioactive.",
			IsResource: !1,
			Icon: t(tF),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(0),
			SortOrder: 107,
		},
		{
			ClassName: "Desc_PlutoniumPellet_C",
			DisplayName: "Plutonium Pellet",
			Description:
				"Produced in the Particle Accelerator through conversion of Non-fissile Uranium.\nUsed to produce Encased Plutonium Cells for Plutonium Fuel Rods.\n\nPower Usage: 250-750 MW (500 MW average).\nCaution: Moderately Radioactive.",
			IsResource: !1,
			Icon: t(tO),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(0),
			SortOrder: 108,
		},
		{
			ClassName: "Desc_PlutoniumCell_C",
			DisplayName: "Encased Plutonium Cell",
			Description:
				"Plutonium Cells are concrete encased Plutonium Pellets.\nUsed to produce Plutonium Fuel Rods for Nuclear Power production.\n\nCaution: Moderately Radioactive.",
			IsResource: !1,
			Icon: t(tB),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(0),
			SortOrder: 109,
		},
		{
			ClassName: "Desc_IronRod_C",
			DisplayName: "Iron Rod",
			Description: "Used for crafting.\nOne of the most basic parts.",
			IsResource: !1,
			Icon: t(tx),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(4),
			SortOrder: 15,
		},
		{
			ClassName: "Desc_IronScrew_C",
			DisplayName: "Screw",
			Description: "Used for crafting.\nOne of the most basic parts.",
			IsResource: !1,
			Icon: t(tk),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(2),
			SortOrder: 20,
		},
		{
			ClassName: "Desc_Wire_C",
			DisplayName: "Wire",
			Description: "Used for crafting.\nOne of the most basic parts.",
			IsResource: !1,
			Icon: t(tE),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(6),
			SortOrder: 17,
		},
		{
			ClassName: "Desc_Cement_C",
			DisplayName: "Concrete",
			Description: "Used for building.\nGood for stable foundations.",
			IsResource: !1,
			Icon: t(tH),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(12),
			SortOrder: 19,
		},
		{
			ClassName: "Desc_Silica_C",
			DisplayName: "Silica",
			Description:
				"Derived from Raw Quartz. Commonly used to create glass structures, advanced refinement processes, and alternative production of electronics.",
			IsResource: !1,
			Icon: t(tU),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(20),
			SortOrder: 34,
		},
		{
			ClassName: "Desc_IronPlate_C",
			DisplayName: "Iron Plate",
			Description: "Used for crafting.\nOne of the most basic parts.",
			IsResource: !1,
			Icon: t(tq),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(6),
			SortOrder: 14,
		},
		{
			ClassName: "Desc_SteelPlate_C",
			DisplayName: "Steel Beam",
			Description: "Steel Beams are used most often when constructing a little more advanced buildings.",
			IsResource: !1,
			Icon: t(tM),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(64),
			SortOrder: 29,
		},
		{
			ClassName: "Desc_Cable_C",
			DisplayName: "Cable",
			Description: "Used for crafting.\nPrimarily used to build power lines.",
			IsResource: !1,
			Icon: t(tL),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(24),
			SortOrder: 18,
		},
		{
			ClassName: "Desc_ModularFrame_C",
			DisplayName: "Modular Frame",
			Description: "Used for crafting.\nMulti-purpose building block.",
			IsResource: !1,
			Icon: t(tT),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(408),
			SortOrder: 25,
		},
		{
			ClassName: "Desc_Fuel_C",
			DisplayName: "Packaged Fuel",
			Description: "Fuel, packaged for alternative transport. Can be used as fuel for Vehicles and the Jetpack.",
			IsResource: !1,
			Icon: t(tz),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(270),
			SortOrder: 74,
		},
		{
			ClassName: "Desc_TurboFuel_C",
			DisplayName: "Packaged Turbofuel",
			Description:
				"Turbofuel, packaged for alternative transport. Can be used as fuel for Vehicles and the Jetpack.",
			IsResource: !1,
			Icon: t(tW),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(570),
			SortOrder: 71,
		},
		{
			ClassName: "Desc_HazmatFilter_C",
			DisplayName: "Iodine Infused Filter",
			Description: "Used in the Hazmat Suit to absorb radioactive particles.",
			IsResource: !1,
			Icon: t(t$),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(2718),
			SortOrder: 87,
		},
		{
			ClassName: "Desc_Filter_C",
			DisplayName: "Gas Filter",
			Description: "Used in the Gas Mask to filter out toxins and pollutants from the air.",
			IsResource: !1,
			Icon: t(tj),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(830),
			SortOrder: 78,
		},
		{
			ClassName: "Desc_IronPlateReinforced_C",
			DisplayName: "Reinforced Iron Plate",
			Description: "Used for crafting.\nA sturdier and more durable Iron Plate.",
			IsResource: !1,
			Icon: t(tG),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(120),
			SortOrder: 21,
		},
		{
			ClassName: "Desc_CopperIngot_C",
			DisplayName: "Copper Ingot",
			Description: "Used for crafting.\nCrafted into the most basic parts.",
			IsResource: !1,
			Icon: t(tQ),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(6),
			SortOrder: 16,
		},
		{
			ClassName: "Desc_ModularFrameFused_C",
			DisplayName: "Fused Modular Frame",
			Description: "A corrosion resistant, nitride hardened, highly robust, yet lightweight modular frame.",
			IsResource: !1,
			Icon: t(tZ),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(62840),
			SortOrder: 102,
		},
		{
			ClassName: "Desc_CircuitBoard_C",
			DisplayName: "Circuit Board",
			Description: "Circuit Boards are advanced electronics that are used in a plethora of different ways.",
			IsResource: !1,
			Icon: t(tV),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(696),
			SortOrder: 63,
		},
		{
			ClassName: "Desc_CopperSheet_C",
			DisplayName: "Copper Sheet",
			Description: "Used for crafting.\nPrimarily used for pipelines due to its high corrosion resistance.",
			IsResource: !1,
			Icon: t(tY),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(24),
			SortOrder: 23,
		},
		{
			ClassName: "Desc_CrystalOscillator_C",
			DisplayName: "Crystal Oscillator",
			Description:
				"A crystal oscillator is an electronic oscillator circuit that uses the mechanical resonance of a vibrating crystal to create an electrical signal with a precise frequency.",
			IsResource: !1,
			Icon: t(tX),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(3072),
			SortOrder: 35,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_1_C",
			DisplayName: "Smart Plating",
			Description: "Project Part #1. Ship with the Space Elevator to complete phases of Project Assembly.",
			IsResource: !1,
			Icon: t(tJ),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(520),
			SortOrder: 26,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_2_C",
			DisplayName: "Versatile Framework",
			Description: "Project Part #2. Ship with the Space Elevator to complete phases of Project Assembly.",
			IsResource: !1,
			Icon: t(tK),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(1176),
			SortOrder: 31,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_3_C",
			DisplayName: "Automated Wiring",
			Description: "Project Part #3. Ship with the Space Elevator to complete phases of Project Assembly.",
			IsResource: !1,
			Icon: t(t0),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(1440),
			SortOrder: 49,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_4_C",
			DisplayName: "Modular Engine",
			Description: "Project Part #4. Ship with the Space Elevator to complete phases of Project Assembly.",
			IsResource: !1,
			Icon: t(t1),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(9960),
			SortOrder: 68,
		},
		{
			ClassName: "Desc_PackagedWater_C",
			DisplayName: "Packaged Water",
			Description: "Water, packaged for alternative transport.",
			IsResource: !1,
			Icon: t(t2),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(130),
			SortOrder: 72,
		},
		{
			ClassName: "Desc_HighSpeedConnector_C",
			DisplayName: "High-Speed Connector",
			Description:
				"The high-speed connector connects several cables and wires in a very efficient way. Uses a standard pattern so its applications are many and varied.",
			IsResource: !1,
			Icon: t(t5),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(3776),
			SortOrder: 64,
		},
		{
			ClassName: "Desc_Motor_C",
			DisplayName: "Motor",
			Description: "The Motor creates a mechanical force that is used to move things from machines to vehicles.",
			IsResource: !1,
			Icon: t(t3),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(1520),
			SortOrder: 48,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_5_C",
			DisplayName: "Adaptive Control Unit",
			Description: "Project Part #5. Ship with the Space Elevator to complete phases of Project Assembly.",
			IsResource: !1,
			Icon: t(t4),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(86120),
			SortOrder: 69,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_6_C",
			DisplayName: "Magnetic Field Generator",
			Description:
				"Project Part #7. Ship with the Space Elevator to complete phases of Project Assembly.\n\nThese modular generators use superconducting magnets and vast amounts of electricity to produce an easily expandable and powerful magnetic field.",
			IsResource: !1,
			Icon: t(t6),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(15650),
			SortOrder: 96,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_7_C",
			DisplayName: "Assembly Director System",
			Description:
				"Project Part #6. Ship with the Space Elevator to complete phases of Project Assembly.\n\nThis extremely fast and precise computing system is specifically designed to direct the Project Assembly: Assembly Phase.",
			IsResource: !1,
			Icon: t(t7),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(543632),
			SortOrder: 91,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_8_C",
			DisplayName: "Thermal Propulsion Rocket",
			Description:
				"Project Part #8. Ship with the Space Elevator to complete phases of Project Assembly.\n\nUses extreme heat to produce the high-pressure plasma required to get Project Assembly into motion.",
			IsResource: !1,
			Icon: t(t9),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(732956),
			SortOrder: 104,
		},
		{
			ClassName: "Desc_SpaceElevatorPart_9_C",
			DisplayName: "Nuclear Pasta",
			Description:
				"Project Part #9. Ship with the Space Elevator to complete phases of Project Assembly.\nPower Usage: 500-1500 MW (1000 MW average).\n\nNuclear Pasta is extremely dense degenerate matter, formed when extreme pressure forces protons and electrons together into neutrons. It is theorized to exist naturally within the crust of neutron stars.",
			IsResource: !1,
			Icon: t(t8),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(543424),
			SortOrder: 113,
		},
		{
			ClassName: "Desc_IronIngot_C",
			DisplayName: "Iron Ingot",
			Description: "Used for crafting.\nCrafted into the most basic parts.",
			IsResource: !1,
			Icon: t(re),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(2),
			SortOrder: 13,
		},
		{
			ClassName: "Desc_AluminumPlate_C",
			DisplayName: "Alclad Aluminum Sheet",
			Description:
				"Thin, lightweight, and highly durable sheets mainly used for products that require high heat conduction or a high specific strength.",
			IsResource: !1,
			Icon: t(rt),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(266),
			SortOrder: 83,
		},
		{
			ClassName: "Desc_Rotor_C",
			DisplayName: "Rotor",
			Description: "Used for crafting.\nThe moving parts of a motor.",
			IsResource: !1,
			Icon: t(rr),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(140),
			SortOrder: 24,
		},
		{
			ClassName: "Desc_Rubber_C",
			DisplayName: "Rubber",
			Description: "Rubber is a material that is very flexible and has a lot of friction.",
			IsResource: !1,
			Icon: t(rn),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(60),
			SortOrder: 57,
		},
		{
			ClassName: "Desc_Plastic_C",
			DisplayName: "Plastic",
			Description: "A versatile and easy to manufacture material that can be used for a lot of things.",
			IsResource: !1,
			Icon: t(ri),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(75),
			SortOrder: 51,
		},
		{
			ClassName: "Desc_SteelPlateReinforced_C",
			DisplayName: "Encased Industrial Beam",
			Description:
				"Encased Industrial Beams utilizes the compressive strength of concrete and tensile strength of steel simultaneously.\nMostly used as a stable basis for constructing buildings.",
			IsResource: !1,
			Icon: t(ro),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(632),
			SortOrder: 46,
		},
		{
			ClassName: "Desc_SteelPipe_C",
			DisplayName: "Steel Pipe",
			Description: "Steel Pipes are used most often when constructing a little more advanced buildings.",
			IsResource: !1,
			Icon: t(rs),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(24),
			SortOrder: 30,
		},
		{
			ClassName: "Desc_LiquidFuel_C",
			DisplayName: "Fuel",
			Description:
				"Fuel can be used to generate power or packaged to be used as fuel for Vehicles or the Jetpack.",
			IsResource: !1,
			Icon: t(ra),
			IsPiped: !0,
			Color: "#eb7d15",
			SinkPoints: td.fromInteger(75),
			SortOrder: 58,
		},
		{
			ClassName: "Desc_PolymerResin_C",
			DisplayName: "Polymer Resin",
			Description:
				"Used for crafting.\nA by-product of oil refinement into fuel. Commonly used to manufacture plastics.",
			IsResource: !1,
			Icon: t(rl),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(12),
			SortOrder: 59,
		},
		{
			ClassName: "Desc_HeavyOilResidue_C",
			DisplayName: "Heavy Oil Residue",
			Description:
				"A by-product of Plastic and Rubber production. Can be further refined into Fuel and Petroleum Coke.",
			IsResource: !1,
			Icon: t(ru),
			IsPiped: !0,
			Color: "#6d2d78",
			SinkPoints: td.fromInteger(30),
			SortOrder: 52,
		},
		{
			ClassName: "Desc_PetroleumCoke_C",
			DisplayName: "Petroleum Coke",
			Description:
				"Used for crafting.\nA carbon-rich material distilled from Heavy Oil Residue. \nUsed as a less efficient coal replacement.",
			IsResource: !1,
			Icon: t(rc),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(20),
			SortOrder: 62,
		},
		{
			ClassName: "Desc_FluidCanister_C",
			DisplayName: "Empty Canister",
			Description: "Used to package fluids for transportation.",
			IsResource: !1,
			Icon: t(rm),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(60),
			SortOrder: 70,
		},
		{
			ClassName: "Desc_ModularFrameHeavy_C",
			DisplayName: "Heavy Modular Frame",
			Description: "A more robust multi-purpose frame.",
			IsResource: !1,
			Icon: t(rp),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(11520),
			SortOrder: 50,
		},
		{
			ClassName: "Desc_PackagedOil_C",
			DisplayName: "Packaged Oil",
			Description: "Crude Oil, packaged for alternative transport. Can be used as fuel for Vehicles.",
			IsResource: !1,
			Icon: t(rd),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(180),
			SortOrder: 73,
		},
		{
			ClassName: "Desc_PackagedOilResidue_C",
			DisplayName: "Packaged Heavy Oil Residue",
			Description: "Heavy Oil Residue, packaged for alternative transport. Can be used as fuel for Vehicles.",
			IsResource: !1,
			Icon: t(rf),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(180),
			SortOrder: 75,
		},
		{
			ClassName: "Desc_SteelIngot_C",
			DisplayName: "Steel Ingot",
			Description:
				"Steel Ingots are made from Iron Ore that's been smelted with Coal. They are made into several parts used in building construction.",
			IsResource: !1,
			Icon: t(rg),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(8),
			SortOrder: 28,
		},
		{
			ClassName: "Desc_AluminaSolution_C",
			DisplayName: "Alumina Solution",
			Description:
				"Dissolved Alumina, extracted from Bauxite. Can be further refined into Aluminum Scrap for Aluminum Ingot production.",
			IsResource: !1,
			Icon: t(rI),
			IsPiped: !0,
			Color: "#c1c1c1",
			SinkPoints: td.fromInteger(20),
			SortOrder: 79,
		},
		{
			ClassName: "Desc_AluminumScrap_C",
			DisplayName: "Aluminum Scrap",
			Description:
				"Aluminum Scrap is pure aluminum refined from Alumina. Can be smelted down to Aluminum Ingots for industrial usage.",
			IsResource: !1,
			Icon: t(rh),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(27),
			SortOrder: 81,
		},
		{
			ClassName: "Desc_SulfuricAcid_C",
			DisplayName: "Sulfuric Acid",
			Description:
				"A mineral acid produced by combining Sulfur and Water in a complex reaction. Primarily used in refinement processes and Battery production.",
			IsResource: !1,
			Icon: t(rC),
			IsPiped: !0,
			Color: "#ffff00",
			SinkPoints: td.fromInteger(16),
			SortOrder: 88,
		},
		{
			ClassName: "Desc_UraniumCell_C",
			DisplayName: "Encased Uranium Cell",
			Description:
				"Uranium Cells are produced from Uranium Ore. \nUsed to produce Uranium Fuel Rods for Nuclear Power production.\n\nCaution: Mildly Radioactive.",
			IsResource: !1,
			Icon: t(rR),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(147),
			SortOrder: 92,
		},
		{
			ClassName: "Desc_AluminumPlateReinforced_C",
			DisplayName: "Heat Sink",
			Description: "Used to dissipate heat faster.",
			IsResource: !1,
			Icon: t(r_),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(2804),
			SortOrder: 100,
		},
		{
			ClassName: "Desc_CoolingSystem_C",
			DisplayName: "Cooling System",
			Description:
				"Used to keep temperatures of advanced parts and buildings from exceeding to inefficient levels.",
			IsResource: !1,
			Icon: t(ry),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(12006),
			SortOrder: 101,
		},
		{
			ClassName: "Desc_NitricAcid_C",
			DisplayName: "Nitric Acid",
			Description:
				"Produced by reaction of Nitrogen Gas with Water. Its high corrosiveness and oxidizing properties make it an excellent choice for refinement and fuel production processes.",
			IsResource: !1,
			Icon: t(rw),
			IsPiped: !0,
			Color: "#d9d9a2",
			SinkPoints: td.fromInteger(94),
			SortOrder: 105,
		},
		{
			ClassName: "Desc_AluminumCasing_C",
			DisplayName: "Aluminum Casing",
			Description: "A versatile container cast from Aluminum Ingots.",
			IsResource: !1,
			Icon: t(rN),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(393),
			SortOrder: 84,
		},
		{
			ClassName: "Desc_ModularFrameLightweight_C",
			DisplayName: "Radio Control Unit",
			Description: "Enhances and directs radio signals.",
			IsResource: !1,
			Icon: t(rb),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(19600),
			SortOrder: 85,
		},
		{
			ClassName: "Desc_Computer_C",
			DisplayName: "Computer",
			Description: "A Computer is a complex logic machine that is used to control advanced behavior in machines.",
			IsResource: !1,
			Icon: t(rP),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(17260),
			SortOrder: 66,
		},
		{
			ClassName: "Desc_QuartzCrystal_C",
			DisplayName: "Quartz Crystal",
			Description:
				"Derived from Raw Quartz. Used in the production of advanced radar technology and high-quality display screens.",
			IsResource: !1,
			Icon: t(rS),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(50),
			SortOrder: 32,
		},
		{
			ClassName: "Desc_GoldIngot_C",
			DisplayName: "Caterium Ingot",
			Description:
				"Caterium Ingots are smelted from Caterium Ore. Caterium Ingots are mostly used for advanced electronics.",
			IsResource: !1,
			Icon: t(rD),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(42),
			SortOrder: 33,
		},
		{
			ClassName: "Desc_Stator_C",
			DisplayName: "Stator",
			Description: "Used for crafting.\nThe static parts of a motor.",
			IsResource: !1,
			Icon: t(rv),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(240),
			SortOrder: 47,
		},
		{
			ClassName: "Desc_CircuitBoardHighSpeed_C",
			DisplayName: "AI Limiter",
			Description:
				"AI Limiters are super advanced electronics that are used to control AIs and keep them from evolving in malicious ways.",
			IsResource: !1,
			Icon: t(rA),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(920),
			SortOrder: 38,
		},
		{
			ClassName: "Desc_HighSpeedWire_C",
			DisplayName: "Quickwire",
			Description:
				"Caterium's high conductivity and resistance to corrosion makes it ideal for small, advanced electronics.",
			IsResource: !1,
			Icon: t(rF),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(17),
			SortOrder: 37,
		},
		{
			ClassName: "Desc_CompactedCoal_C",
			DisplayName: "Compacted Coal",
			Description: "A much more efficient alternative to Coal. Used as fuel for vehicles and coal generators.",
			IsResource: !1,
			Icon: t(rO),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(28),
			SortOrder: 41,
		},
		{
			ClassName: "Desc_LiquidTurboFuel_C",
			DisplayName: "Turbofuel",
			Description:
				"A more efficient alternative to Fuel. Can be used to generate power or packaged to be used as fuel for Vehicles.",
			IsResource: !1,
			Icon: t(rB),
			IsPiped: !0,
			Color: "#d4292e",
			SinkPoints: td.fromInteger(225),
			SortOrder: 60,
		},
		{
			ClassName: "Desc_ComputerSuper_C",
			DisplayName: "Supercomputer",
			Description: "The supercomputer is the next-gen version of the computer.",
			IsResource: !1,
			Icon: t(rx),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(99576),
			SortOrder: 67,
		},
		{
			ClassName: "Desc_GasTank_C",
			DisplayName: "Empty Fluid Tank",
			Description: "Used to package gases and volatile liquids for transportation.",
			IsResource: !1,
			Icon: t(rk),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(225),
			SortOrder: 98,
		},
		{
			ClassName: "Desc_ElectromagneticControlRod_C",
			DisplayName: "Electromagnetic Control Rod",
			Description: "Control Rods regulate power output via electromagnetism.",
			IsResource: !1,
			Icon: t(rE),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(2560),
			SortOrder: 94,
		},
		{
			ClassName: "Desc_PressureConversionCube_C",
			DisplayName: "Pressure Conversion Cube",
			Description:
				"Converts outgoing force into internal pressure. Required to contain unstable, high-energy matter.",
			IsResource: !1,
			Icon: t(rH),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(257312),
			SortOrder: 112,
		},
		{
			ClassName: "Desc_MotorLightweight_C",
			DisplayName: "Turbo Motor",
			Description: "The Turbo Motor is a more complex and more powerful version of the regular Motor.",
			IsResource: !1,
			Icon: t(rU),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(242720),
			SortOrder: 103,
		},
		{
			ClassName: "Desc_CopperDust_C",
			DisplayName: "Copper Powder",
			Description:
				"Ground down Copper Ingots.\nThe high natural density of Copper, combined with the granularity of the powder, makes this part fit for producing Nuclear Pasta in the Particle Accelerator.",
			IsResource: !1,
			Icon: t(rq),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(72),
			SortOrder: 111,
		},
		{
			ClassName: "Desc_Gunpowder_C",
			DisplayName: "Black Powder",
			Description: "An explosive powder that is commonly used to produce simple explosives.",
			IsResource: !1,
			Icon: t(rM),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(14),
			SortOrder: 42,
		},
		{
			ClassName: "Desc_GunpowderMK2_C",
			DisplayName: "Smokeless Powder",
			Description: "An explosive powder that is commonly used to produce modern firearms.",
			IsResource: !1,
			Icon: t(rL),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(58),
			SortOrder: 53,
		},
		{
			ClassName: "Desc_Biofuel_C",
			DisplayName: "Solid Biofuel",
			Description: "The most energy-efficient form of solid biomass. Can be used as fuel for the Chainsaw.",
			IsResource: !1,
			Icon: t(rT),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(48),
			SortOrder: 27,
		},
		{
			ClassName: "Desc_PackagedBiofuel_C",
			DisplayName: "Packaged Liquid Biofuel",
			Description:
				"Liquid Biofuel, packaged for alternative transport. Can be used as fuel for Vehicles and the Jetpack.",
			IsResource: !1,
			Icon: t(rz),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(370),
			SortOrder: 77,
		},
		{
			ClassName: "Desc_GenericBiomass_C",
			DisplayName: "Biomass",
			Description:
				"Primarily used as fuel.\nBiomass burners and vehicles can use it for power.\nBiomass is much more energy-efficient than raw biological matter.",
			IsResource: !1,
			Icon: t(rW),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(12),
			SortOrder: 12,
		},
		{
			ClassName: "Desc_LiquidBiofuel_C",
			DisplayName: "Liquid Biofuel",
			Description: "Liquid Biofuel can be used to generate power or packaged to be used as fuel for Vehicles.",
			IsResource: !1,
			Icon: t(r$),
			IsPiped: !0,
			Color: "#3b532c",
			SinkPoints: td.fromInteger(261),
			SortOrder: 76,
		},
		{
			ClassName: "Desc_PackagedAlumina_C",
			DisplayName: "Packaged Alumina Solution",
			Description: "Alumina Solution, packaged for alternative transport.",
			IsResource: !1,
			Icon: t(rj),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(160),
			SortOrder: 80,
		},
		{
			ClassName: "Desc_PackagedSulfuricAcid_C",
			DisplayName: "Packaged Sulfuric Acid",
			Description: "Sulfuric Acid, packaged for alternative transport.",
			IsResource: !1,
			Icon: t(rG),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(152),
			SortOrder: 89,
		},
		{
			ClassName: "Desc_PackagedNitrogenGas_C",
			DisplayName: "Packaged Nitrogen Gas",
			Description: "Nitrogen Gas, packaged for alternative transport.",
			IsResource: !1,
			Icon: t(rQ),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(312),
			SortOrder: 99,
		},
		{
			ClassName: "Desc_PackagedNitricAcid_C",
			DisplayName: "Packaged Nitric Acid",
			Description: "Nitric Acid, packaged for alternative transport.",
			IsResource: !1,
			Icon: t(rZ),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(412),
			SortOrder: 106,
		},
		{
			ClassName: "Desc_Fabric_C",
			DisplayName: "Fabric",
			Description: "Used for equipment crafting.\nFlexible but durable fabric.",
			IsResource: !1,
			Icon: t(rV),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(140),
			SortOrder: 61,
		},
		{
			ClassName: "Desc_Rebar_Explosive_C",
			DisplayName: "Explosive Rebar",
			Description: "Explodes on impact, dealing heavy damage.",
			IsResource: !1,
			Icon: t(rY),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(360),
			SortOrder: 55,
		},
		{
			ClassName: "Desc_Rebar_Stunshot_C",
			DisplayName: "Stun Rebar",
			Description: "Electrocutes the target on impact, stunning it for a short time.\n\nStun duration: 5 seconds",
			IsResource: !1,
			Icon: t(rX),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(186),
			SortOrder: 39,
		},
		{
			ClassName: "Desc_SpikedRebar_C",
			DisplayName: "Iron Rebar",
			Description: "A simple iron rebar that can be shot using the Rebar Gun, for self-defense purposes.",
			IsResource: !1,
			Icon: t(rJ),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(8),
			SortOrder: 36,
		},
		{
			ClassName: "Desc_CartridgeSmartProjectile_C",
			DisplayName: "Homing Rifle Ammo",
			Description:
				"The bullet guidance system built into this ammunition allows it to accurately hit any target within the reticle area.\nEspecially useful when dealing with agile threats, or for Pioneers who can't be bothered to aim properly.",
			IsResource: !1,
			Icon: t(rK),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(855),
			SortOrder: 65,
		},
		{
			ClassName: "Desc_NobeliskCluster_C",
			DisplayName: "Cluster Nobelisk",
			Description:
				"A Nobelisk that detonates into multiple smaller explosions. Practical when clearing out large areas of vegetation and other inconveniences.",
			IsResource: !1,
			Icon: t(r0),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(1376),
			SortOrder: 56,
		},
		{
			ClassName: "Desc_NobeliskExplosive_C",
			DisplayName: "Nobelisk",
			Description: "A simple explosive, useful for clearing boulders, vegetation, and other obstacles.",
			IsResource: !1,
			Icon: t(r1),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(152),
			SortOrder: 43,
		},
		{
			ClassName: "Desc_NobeliskGas_C",
			DisplayName: "Gas Nobelisk",
			Description: "Instead of a regular explosion, this Nobelisk creates a deadly gas cloud.",
			IsResource: !1,
			Icon: t(r2),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(544),
			SortOrder: 44,
		},
		{
			ClassName: "Desc_NobeliskNuke_C",
			DisplayName: "Nuke Nobelisk",
			Description:
				"This Nobelisk uses a nuclear fission reaction to generate a massive explosion.\n\nWARNING: Ensure all FICSIT property is clear of the blast zone before detonation.\n",
			IsResource: !1,
			Icon: t(r5),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(19600),
			SortOrder: 93,
		},
		{
			ClassName: "Desc_NobeliskShockwave_C",
			DisplayName: "Pulse Nobelisk",
			Description: "Instead of a regular explosion, this Nobelisk generates a powerful shockwave.",
			IsResource: !1,
			Icon: t(r3),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(1533),
			SortOrder: 45,
		},
		{
			ClassName: "Desc_CartridgeChaos_C",
			DisplayName: "Turbo Rifle Ammo",
			Description:
				"Lightweight, compact, and volatile. These rounds provide extreme capacity and fire rates, at the cost of accuracy.",
			IsResource: !1,
			Icon: t(r4),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(120),
			SortOrder: 86,
		},
		{
			ClassName: "Desc_CartridgeStandard_C",
			DisplayName: "Rifle Ammo",
			Description: "Standard issue Rifle ammunition, useful for establishing dominance.",
			IsResource: !1,
			Icon: t(r6),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(25),
			SortOrder: 54,
		},
		{
			ClassName: "Desc_NuclearFuelRod_C",
			DisplayName: "Uranium Fuel Rod",
			Description:
				"Used as fuel for the Nuclear Power Plant.\n\nCaution: Produces radioactive Uranium Waste when consumed.\nCaution: Moderately Radioactive.",
			IsResource: !1,
			Icon: t(r7),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(44092),
			SortOrder: 95,
		},
		{
			ClassName: "Desc_PlutoniumFuelRod_C",
			DisplayName: "Plutonium Fuel Rod",
			Description:
				"Used as fuel for the Nuclear Power Plant.\n\nCaution: Produces radioactive Plutonium Waste when consumed.\nCaution: HIGHLY Radioactive.",
			IsResource: !1,
			Icon: t(r9),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(153184),
			SortOrder: 110,
		},
		{
			ClassName: "Desc_Rebar_Spreadshot_C",
			DisplayName: "Shatter Rebar",
			Description:
				"This rebar fractures when shot, launching deadly debris in a wide spread but with limited range.",
			IsResource: !1,
			Icon: t(r8),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(332),
			SortOrder: 40,
		},
		{
			ClassName: "BP_EquipmentDescriptorBeacon_C",
			DisplayName: "Beacon",
			Description:
				"PENDING REMOVAL\nThis item will (likely) be removed in a future update.\n\nCurrently only used as an ingredient in an alternative recipe.",
			IsResource: !1,
			Icon: t(ne),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(320),
			SortOrder: 22,
		},
		{
			ClassName: "BP_ItemDescriptorPortableMiner_C",
			DisplayName: "Portable Miner",
			Description:
				"Can be set up on a resource node to automatically extract the resource. Note that it has limited storage space.",
			IsResource: !1,
			Icon: t(nt),
			IsPiped: !1,
			Color: "#fff",
			SinkPoints: td.fromInteger(56),
			SortOrder: 115,
		},
	],
	nn = new Map(nr.map((e) => [e.ClassName, e])),
	ni = [
		{
			ClassName: "Build_ConstructorMk1_C",
			DisplayName: "Constructor",
			Description:
				"Crafts one part into another part.\n\nCan be automated by feeding parts into it with a conveyor belt connected to the input. The produced parts can be automatically extracted by connecting a conveyor belt to the output.",
			PowerConsumption: td.fromInteger(4),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_SmelterMk1_C",
			DisplayName: "Smelter",
			Description:
				"Smelts ore into ingots.\n\nCan be automated by feeding ore into it with a conveyor belt connected to the input. The produced ingots can be automatically extracted by connecting a conveyor belt to the output.",
			PowerConsumption: td.fromInteger(4),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_FoundryMk1_C",
			DisplayName: "Foundry",
			Description:
				"Smelts two resources into alloy ingots.\n\nCan be automated by feeding ore into it with a conveyor belt connected to the inputs. The produced ingots can be automatically extracted by connecting a conveyor belt to the output.",
			PowerConsumption: td.fromInteger(16),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_OilRefinery_C",
			DisplayName: "Refinery",
			Description:
				"Refines fluid and/or solid parts into other parts.\nHead Lift: 10 meters.\n(Allows fluids to be transported 10 meters upwards.)\n\nContains both a Conveyor Belt and Pipe input and output, to allow for the automation of various recipes.",
			PowerConsumption: td.fromInteger(30),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_AssemblerMk1_C",
			DisplayName: "Assembler",
			Description:
				"Crafts two parts into another part.\n\nCan be automated by feeding parts into it with a conveyor belt connected to the input. The produced parts can be automatically extracted by connecting a conveyor belt to the output.",
			PowerConsumption: td.fromInteger(15),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_Packager_C",
			DisplayName: "Packager",
			Description:
				"Used for the packaging and unpacking of fluids.\nHead Lift: 10 meters.\n(Allows fluids to be transported 10 meters upwards.)\n\nContains both a Conveyor Belt and Pipe input and output, to allow for the automation of various recipes.",
			PowerConsumption: td.fromInteger(10),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_Blender_C",
			DisplayName: "Blender",
			Description:
				"The Blender is capable of blending fluids and combining them with solid parts in various processes.\nHead Lift: 10 meters.\n(Allows fluids to be transported 10 meters upwards).\n\nContains both Conveyor Belt and Pipe inputs and outputs.",
			PowerConsumption: td.fromInteger(75),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_ManufacturerMk1_C",
			DisplayName: "Manufacturer",
			Description:
				"Crafts three or four parts into another part.\n\nCan be automated by feeding parts into it with a conveyor belt connected to the input. The produced parts can be automatically extracted by connecting a conveyor belt to the output.",
			PowerConsumption: td.fromInteger(55),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_HadronCollider_C",
			DisplayName: "Particle Accelerator",
			Description:
				"The FICSIT Particle Accelerator uses electromagnetic fields to propel particles to very high speeds and energies. The specific design allows for a variety of processes, such as matter generation and conversion.\n\nWarning: Power usage is extremely high, unstable, and varies per recipe.",
			PowerConsumption: td.fromIntegers(1, 10),
			OverclockPowerFactor: td.fromIntegers(1321929, 1e6),
		},
		{
			ClassName: "Build_GeneratorCoal_C",
			DisplayName: "Coal Generator",
			Description:
				"Burns Coal to boil Water, the produced steam rotates turbines to generate electricity for the power grid.\nHas a Conveyor Belt and Pipe input, so both the Coal and Water supply can be automated.\n\nCaution: Always generates at the set clock speed. Shuts down if fuel requirements are not met.",
			PowerConsumption: td.fromInteger(-75),
			OverclockPowerFactor: td.fromInteger(1),
		},
		{
			ClassName: "Build_GeneratorFuel_C",
			DisplayName: "Fuel Generator",
			Description:
				"Consumes Fuel to generate electricity for the power grid.\nHas a Pipe input so the Fuel supply can be automated.\n\nCaution: Always generates at the set clock speed. Shuts down if fuel requirements are not met.",
			PowerConsumption: td.fromInteger(-150),
			OverclockPowerFactor: td.fromInteger(1),
		},
		{
			ClassName: "Build_GeneratorNuclear_C",
			DisplayName: "Nuclear Power Plant",
			Description:
				"Consumes Nuclear Fuel Rods and Water to produce electricity for the power grid.\n\nProduces Nuclear Waste, which is extracted from the conveyor belt output.\n\nCaution: Always generates at the set clock speed. Shuts down if fuel requirements are not met.",
			PowerConsumption: td.fromInteger(-2500),
			OverclockPowerFactor: td.fromInteger(1),
		},
	],
	no = [
		{
			ClassName: "Recipe_Cable_C",
			DisplayName: "Cable",
			Inputs: [{ Item: nr[21], Rate: td.fromInteger(60) }],
			Outputs: [{ Item: nr[26], Rate: td.fromInteger(30) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Wire_C",
			DisplayName: "Wire",
			Inputs: [{ Item: nr[33], Rate: td.fromInteger(15) }],
			Outputs: [{ Item: nr[21], Rate: td.fromInteger(30) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IngotCopper_C",
			DisplayName: "Copper Ingot",
			Inputs: [{ Item: nr[1], Rate: td.fromInteger(30) }],
			Outputs: [{ Item: nr[33], Rate: td.fromInteger(30) }],
			Building: ni[1],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IronPlateReinforced_C",
			DisplayName: "Reinforced Iron Plate",
			Inputs: [
				{ Item: nr[24], Rate: td.fromInteger(30) },
				{ Item: nr[20], Rate: td.fromInteger(60) },
			],
			Outputs: [{ Item: nr[32], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Concrete_C",
			DisplayName: "Concrete",
			Inputs: [{ Item: nr[5], Rate: td.fromInteger(45) }],
			Outputs: [{ Item: nr[22], Rate: td.fromInteger(15) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Screw_C",
			DisplayName: "Screw",
			Inputs: [{ Item: nr[19], Rate: td.fromInteger(10) }],
			Outputs: [{ Item: nr[20], Rate: td.fromInteger(40) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IronPlate_C",
			DisplayName: "Iron Plate",
			Inputs: [{ Item: nr[50], Rate: td.fromInteger(30) }],
			Outputs: [{ Item: nr[24], Rate: td.fromInteger(20) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IronRod_C",
			DisplayName: "Iron Rod",
			Inputs: [{ Item: nr[50], Rate: td.fromInteger(15) }],
			Outputs: [{ Item: nr[19], Rate: td.fromInteger(15) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IngotIron_C",
			DisplayName: "Iron Ingot",
			Inputs: [{ Item: nr[3], Rate: td.fromInteger(30) }],
			Outputs: [{ Item: nr[50], Rate: td.fromInteger(30) }],
			Building: ni[1],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_AdheredIronPlate_C",
			DisplayName: "Adhered Iron Plate",
			Inputs: [
				{ Item: nr[24], Rate: td.fromIntegers(45, 4) },
				{ Item: nr[53], Rate: td.fromIntegers(15, 4) },
			],
			Outputs: [{ Item: nr[32], Rate: td.fromIntegers(15, 4) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CircuitBoard_C",
			DisplayName: "Circuit Board",
			Inputs: [
				{ Item: nr[36], Rate: td.fromInteger(15) },
				{ Item: nr[54], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[35], Rate: td.fromIntegers(15, 2) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_LiquidFuel_C",
			DisplayName: "Fuel",
			Inputs: [{ Item: nr[7], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[57], Rate: td.fromInteger(40) },
				{ Item: nr[58], Rate: td.fromInteger(30) },
			],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PetroleumCoke_C",
			DisplayName: "Petroleum Coke",
			Inputs: [{ Item: nr[59], Rate: td.fromInteger(40) }],
			Outputs: [{ Item: nr[60], Rate: td.fromInteger(120) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Plastic_C",
			DisplayName: "Plastic",
			Inputs: [{ Item: nr[7], Rate: td.fromInteger(30) }],
			Outputs: [
				{ Item: nr[54], Rate: td.fromInteger(20) },
				{ Item: nr[59], Rate: td.fromInteger(10) },
			],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Rubber_C",
			DisplayName: "Rubber",
			Inputs: [{ Item: nr[7], Rate: td.fromInteger(30) }],
			Outputs: [
				{ Item: nr[53], Rate: td.fromInteger(20) },
				{ Item: nr[59], Rate: td.fromInteger(20) },
			],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ResidualFuel_C",
			DisplayName: "Residual Fuel",
			Inputs: [{ Item: nr[59], Rate: td.fromInteger(60) }],
			Outputs: [{ Item: nr[57], Rate: td.fromInteger(40) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ResidualPlastic_C",
			DisplayName: "Residual Plastic",
			Inputs: [
				{ Item: nr[58], Rate: td.fromInteger(60) },
				{ Item: nr[9], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[54], Rate: td.fromInteger(20) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ResidualRubber_C",
			DisplayName: "Residual Rubber",
			Inputs: [
				{ Item: nr[58], Rate: td.fromInteger(40) },
				{ Item: nr[9], Rate: td.fromInteger(40) },
			],
			Outputs: [{ Item: nr[53], Rate: td.fromInteger(20) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_BoltedFrame_C",
			DisplayName: "Bolted Frame",
			Inputs: [
				{ Item: nr[32], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[20], Rate: td.fromInteger(140) },
			],
			Outputs: [{ Item: nr[27], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ModularFrame_C",
			DisplayName: "Modular Frame",
			Inputs: [
				{ Item: nr[32], Rate: td.fromInteger(3) },
				{ Item: nr[19], Rate: td.fromInteger(12) },
			],
			Outputs: [{ Item: nr[27], Rate: td.fromInteger(2) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Rotor_C",
			DisplayName: "Rotor",
			Inputs: [
				{ Item: nr[19], Rate: td.fromInteger(20) },
				{ Item: nr[20], Rate: td.fromInteger(100) },
			],
			Outputs: [{ Item: nr[52], Rate: td.fromInteger(4) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CopperSheet_C",
			DisplayName: "Copper Sheet",
			Inputs: [{ Item: nr[33], Rate: td.fromInteger(20) }],
			Outputs: [{ Item: nr[36], Rate: td.fromInteger(10) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_1_C",
			DisplayName: "Smart Plating",
			Inputs: [
				{ Item: nr[32], Rate: td.fromInteger(2) },
				{ Item: nr[52], Rate: td.fromInteger(2) },
			],
			Outputs: [{ Item: nr[38], Rate: td.fromInteger(2) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CoatedCable_C",
			DisplayName: "Coated Cable",
			Inputs: [
				{ Item: nr[21], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[59], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[26], Rate: td.fromIntegers(135, 2) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CoatedIronCanister_C",
			DisplayName: "Coated Iron Canister",
			Inputs: [
				{ Item: nr[24], Rate: td.fromInteger(30) },
				{ Item: nr[36], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[61], Rate: td.fromInteger(60) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_FluidCanister_C",
			DisplayName: "Empty Canister",
			Inputs: [{ Item: nr[54], Rate: td.fromInteger(30) }],
			Outputs: [{ Item: nr[61], Rate: td.fromInteger(60) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Fuel_C",
			DisplayName: "Packaged Fuel",
			Inputs: [
				{ Item: nr[57], Rate: td.fromInteger(40) },
				{ Item: nr[61], Rate: td.fromInteger(40) },
			],
			Outputs: [{ Item: nr[28], Rate: td.fromInteger(40) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_LiquidBiofuel_C",
			DisplayName: "Liquid Biofuel",
			Inputs: [
				{ Item: nr[91], Rate: td.fromInteger(90) },
				{ Item: nr[9], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[94], Rate: td.fromInteger(60) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedBiofuel_C",
			DisplayName: "Packaged Liquid Biofuel",
			Inputs: [
				{ Item: nr[94], Rate: td.fromInteger(40) },
				{ Item: nr[61], Rate: td.fromInteger(40) },
			],
			Outputs: [{ Item: nr[92], Rate: td.fromInteger(40) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedCrudeOil_C",
			DisplayName: "Packaged Oil",
			Inputs: [
				{ Item: nr[7], Rate: td.fromInteger(30) },
				{ Item: nr[61], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[63], Rate: td.fromInteger(30) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedOilResidue_C",
			DisplayName: "Packaged Heavy Oil Residue",
			Inputs: [
				{ Item: nr[59], Rate: td.fromInteger(30) },
				{ Item: nr[61], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[64], Rate: td.fromInteger(30) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedWater_C",
			DisplayName: "Packaged Water",
			Inputs: [
				{ Item: nr[9], Rate: td.fromInteger(60) },
				{ Item: nr[61], Rate: td.fromInteger(60) },
			],
			Outputs: [{ Item: nr[42], Rate: td.fromInteger(60) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageBioFuel_C",
			DisplayName: "Unpackage Liquid Biofuel",
			Inputs: [{ Item: nr[92], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[94], Rate: td.fromInteger(60) },
				{ Item: nr[61], Rate: td.fromInteger(60) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageFuel_C",
			DisplayName: "Unpackage Fuel",
			Inputs: [{ Item: nr[28], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[57], Rate: td.fromInteger(60) },
				{ Item: nr[61], Rate: td.fromInteger(60) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageOil_C",
			DisplayName: "Unpackage Oil",
			Inputs: [{ Item: nr[63], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[7], Rate: td.fromInteger(60) },
				{ Item: nr[61], Rate: td.fromInteger(60) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageOilResidue_C",
			DisplayName: "Unpackage Heavy Oil Residue",
			Inputs: [{ Item: nr[64], Rate: td.fromInteger(20) }],
			Outputs: [
				{ Item: nr[59], Rate: td.fromInteger(20) },
				{ Item: nr[61], Rate: td.fromInteger(20) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageWater_C",
			DisplayName: "Unpackage Water",
			Inputs: [{ Item: nr[42], Rate: td.fromInteger(120) }],
			Outputs: [
				{ Item: nr[9], Rate: td.fromInteger(120) },
				{ Item: nr[61], Rate: td.fromInteger(120) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CoatedIronPlate_C",
			DisplayName: "Coated Iron Plate",
			Inputs: [
				{ Item: nr[50], Rate: td.fromInteger(50) },
				{ Item: nr[54], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[24], Rate: td.fromInteger(75) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CokeSteelIngot_C",
			DisplayName: "Coke Steel Ingot",
			Inputs: [
				{ Item: nr[3], Rate: td.fromInteger(75) },
				{ Item: nr[60], Rate: td.fromInteger(75) },
			],
			Outputs: [{ Item: nr[65], Rate: td.fromInteger(100) }],
			Building: ni[2],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CopperAlloyIngot_C",
			DisplayName: "Copper Alloy Ingot",
			Inputs: [
				{ Item: nr[1], Rate: td.fromInteger(50) },
				{ Item: nr[3], Rate: td.fromInteger(25) },
			],
			Outputs: [{ Item: nr[33], Rate: td.fromInteger(100) }],
			Building: ni[2],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CopperRotor_C",
			DisplayName: "Copper Rotor",
			Inputs: [
				{ Item: nr[36], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[20], Rate: td.fromInteger(195) },
			],
			Outputs: [{ Item: nr[52], Rate: td.fromIntegers(45, 4) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_DilutedPackagedFuel_C",
			DisplayName: "Diluted Packaged Fuel",
			Inputs: [
				{ Item: nr[59], Rate: td.fromInteger(30) },
				{ Item: nr[42], Rate: td.fromInteger(60) },
			],
			Outputs: [{ Item: nr[28], Rate: td.fromInteger(60) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ElectroAluminumScrap_C",
			DisplayName: "Electrode Aluminum Scrap",
			Inputs: [
				{ Item: nr[66], Rate: td.fromInteger(180) },
				{ Item: nr[60], Rate: td.fromInteger(60) },
			],
			Outputs: [
				{ Item: nr[67], Rate: td.fromInteger(300) },
				{ Item: nr[9], Rate: td.fromInteger(105) },
			],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UraniumCell_C",
			DisplayName: "Encased Uranium Cell",
			Inputs: [
				{ Item: nr[11], Rate: td.fromInteger(50) },
				{ Item: nr[22], Rate: td.fromInteger(15) },
				{ Item: nr[68], Rate: td.fromInteger(40) },
			],
			Outputs: [
				{ Item: nr[69], Rate: td.fromInteger(25) },
				{ Item: nr[68], Rate: td.fromInteger(10) },
			],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CoolingSystem_C",
			DisplayName: "Cooling System",
			Inputs: [
				{ Item: nr[70], Rate: td.fromInteger(12) },
				{ Item: nr[53], Rate: td.fromInteger(12) },
				{ Item: nr[9], Rate: td.fromInteger(30) },
				{ Item: nr[8], Rate: td.fromInteger(150) },
			],
			Outputs: [{ Item: nr[71], Rate: td.fromInteger(6) }],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NitricAcid_C",
			DisplayName: "Nitric Acid",
			Inputs: [
				{ Item: nr[8], Rate: td.fromInteger(120) },
				{ Item: nr[9], Rate: td.fromInteger(30) },
				{ Item: nr[24], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[72], Rate: td.fromInteger(30) }],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NonFissileUranium_C",
			DisplayName: "Non-fissile Uranium",
			Inputs: [
				{ Item: nr[12], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[23], Rate: td.fromInteger(25) },
				{ Item: nr[72], Rate: td.fromInteger(15) },
				{ Item: nr[68], Rate: td.fromInteger(15) },
			],
			Outputs: [
				{ Item: nr[16], Rate: td.fromInteger(50) },
				{ Item: nr[9], Rate: td.fromInteger(15) },
			],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_AluminumCasing_C",
			DisplayName: "Aluminum Casing",
			Inputs: [{ Item: nr[15], Rate: td.fromInteger(90) }],
			Outputs: [{ Item: nr[73], Rate: td.fromInteger(60) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_AluminumSheet_C",
			DisplayName: "Alclad Aluminum Sheet",
			Inputs: [
				{ Item: nr[15], Rate: td.fromInteger(30) },
				{ Item: nr[33], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[51], Rate: td.fromInteger(30) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_RadioControlUnit_C",
			DisplayName: "Radio Control Unit",
			Inputs: [
				{ Item: nr[73], Rate: td.fromInteger(40) },
				{ Item: nr[37], Rate: td.fromIntegers(5, 4) },
				{ Item: nr[75], Rate: td.fromIntegers(5, 4) },
			],
			Outputs: [{ Item: nr[74], Rate: td.fromIntegers(5, 2) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_AluminaSolution_C",
			DisplayName: "Alumina Solution",
			Inputs: [
				{ Item: nr[10], Rate: td.fromInteger(120) },
				{ Item: nr[9], Rate: td.fromInteger(180) },
			],
			Outputs: [
				{ Item: nr[66], Rate: td.fromInteger(120) },
				{ Item: nr[23], Rate: td.fromInteger(50) },
			],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_AluminumScrap_C",
			DisplayName: "Aluminum Scrap",
			Inputs: [
				{ Item: nr[66], Rate: td.fromInteger(240) },
				{ Item: nr[0], Rate: td.fromInteger(120) },
			],
			Outputs: [
				{ Item: nr[67], Rate: td.fromInteger(360) },
				{ Item: nr[9], Rate: td.fromInteger(120) },
			],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedAlumina_C",
			DisplayName: "Packaged Alumina Solution",
			Inputs: [
				{ Item: nr[66], Rate: td.fromInteger(120) },
				{ Item: nr[61], Rate: td.fromInteger(120) },
			],
			Outputs: [{ Item: nr[95], Rate: td.fromInteger(120) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IngotAluminum_C",
			DisplayName: "Aluminum Ingot",
			Inputs: [
				{ Item: nr[67], Rate: td.fromInteger(90) },
				{ Item: nr[23], Rate: td.fromInteger(75) },
			],
			Outputs: [{ Item: nr[15], Rate: td.fromInteger(60) }],
			Building: ni[2],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_QuartzCrystal_C",
			DisplayName: "Quartz Crystal",
			Inputs: [{ Item: nr[4], Rate: td.fromIntegers(75, 2) }],
			Outputs: [{ Item: nr[76], Rate: td.fromIntegers(45, 2) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Silica_C",
			DisplayName: "Silica",
			Inputs: [{ Item: nr[4], Rate: td.fromIntegers(45, 2) }],
			Outputs: [{ Item: nr[23], Rate: td.fromIntegers(75, 2) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CrystalOscillator_C",
			DisplayName: "Crystal Oscillator",
			Inputs: [
				{ Item: nr[76], Rate: td.fromInteger(18) },
				{ Item: nr[26], Rate: td.fromInteger(14) },
				{ Item: nr[32], Rate: td.fromIntegers(5, 2) },
			],
			Outputs: [{ Item: nr[37], Rate: td.fromInteger(1) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageAlumina_C",
			DisplayName: "Unpackage Alumina Solution",
			Inputs: [{ Item: nr[95], Rate: td.fromInteger(120) }],
			Outputs: [
				{ Item: nr[66], Rate: td.fromInteger(120) },
				{ Item: nr[61], Rate: td.fromInteger(120) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ElectrodeCircuitBoard_C",
			DisplayName: "Electrode Circuit Board",
			Inputs: [
				{ Item: nr[53], Rate: td.fromInteger(30) },
				{ Item: nr[60], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[35], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_FlexibleFramework_C",
			DisplayName: "Flexible Framework",
			Inputs: [
				{ Item: nr[27], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[25], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[53], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[39], Rate: td.fromIntegers(15, 2) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_FusedWire_C",
			DisplayName: "Fused Wire",
			Inputs: [
				{ Item: nr[33], Rate: td.fromInteger(12) },
				{ Item: nr[77], Rate: td.fromInteger(3) },
			],
			Outputs: [{ Item: nr[21], Rate: td.fromInteger(90) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_HeavyFlexibleFrame_C",
			DisplayName: "Heavy Flexible Frame",
			Inputs: [
				{ Item: nr[27], Rate: td.fromIntegers(75, 4) },
				{ Item: nr[55], Rate: td.fromIntegers(45, 4) },
				{ Item: nr[53], Rate: td.fromInteger(75) },
				{ Item: nr[20], Rate: td.fromInteger(390) },
			],
			Outputs: [{ Item: nr[62], Rate: td.fromIntegers(15, 4) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Computer_C",
			DisplayName: "Computer",
			Inputs: [
				{ Item: nr[35], Rate: td.fromInteger(25) },
				{ Item: nr[26], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[54], Rate: td.fromInteger(45) },
				{ Item: nr[20], Rate: td.fromInteger(130) },
			],
			Outputs: [{ Item: nr[75], Rate: td.fromIntegers(5, 2) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_4_C",
			DisplayName: "Modular Engine",
			Inputs: [
				{ Item: nr[44], Rate: td.fromInteger(2) },
				{ Item: nr[53], Rate: td.fromInteger(15) },
				{ Item: nr[38], Rate: td.fromInteger(2) },
			],
			Outputs: [{ Item: nr[41], Rate: td.fromInteger(1) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_5_C",
			DisplayName: "Adaptive Control Unit",
			Inputs: [
				{ Item: nr[40], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[35], Rate: td.fromInteger(5) },
				{ Item: nr[62], Rate: td.fromInteger(1) },
				{ Item: nr[75], Rate: td.fromInteger(1) },
			],
			Outputs: [{ Item: nr[45], Rate: td.fromInteger(1) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_HeavyOilResidue_C",
			DisplayName: "Heavy Oil Residue",
			Inputs: [{ Item: nr[7], Rate: td.fromInteger(30) }],
			Outputs: [
				{ Item: nr[59], Rate: td.fromInteger(40) },
				{ Item: nr[58], Rate: td.fromInteger(20) },
			],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_HighSpeedWiring_C",
			DisplayName: "Automated Speed Wiring",
			Inputs: [
				{ Item: nr[78], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[21], Rate: td.fromInteger(75) },
				{ Item: nr[43], Rate: td.fromIntegers(15, 8) },
			],
			Outputs: [{ Item: nr[40], Rate: td.fromIntegers(15, 2) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_EncasedIndustrialBeam_C",
			DisplayName: "Encased Industrial Beam",
			Inputs: [
				{ Item: nr[25], Rate: td.fromInteger(24) },
				{ Item: nr[22], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[55], Rate: td.fromInteger(6) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Motor_C",
			DisplayName: "Motor",
			Inputs: [
				{ Item: nr[52], Rate: td.fromInteger(10) },
				{ Item: nr[78], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[44], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Stator_C",
			DisplayName: "Stator",
			Inputs: [
				{ Item: nr[56], Rate: td.fromInteger(15) },
				{ Item: nr[21], Rate: td.fromInteger(40) },
			],
			Outputs: [{ Item: nr[78], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ModularFrameHeavy_C",
			DisplayName: "Heavy Modular Frame",
			Inputs: [
				{ Item: nr[27], Rate: td.fromInteger(10) },
				{ Item: nr[56], Rate: td.fromInteger(30) },
				{ Item: nr[55], Rate: td.fromInteger(10) },
				{ Item: nr[20], Rate: td.fromInteger(200) },
			],
			Outputs: [{ Item: nr[62], Rate: td.fromInteger(2) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_3_C",
			DisplayName: "Automated Wiring",
			Inputs: [
				{ Item: nr[78], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[26], Rate: td.fromInteger(50) },
			],
			Outputs: [{ Item: nr[40], Rate: td.fromIntegers(5, 2) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_AILimiter_C",
			DisplayName: "AI Limiter",
			Inputs: [
				{ Item: nr[36], Rate: td.fromInteger(25) },
				{ Item: nr[80], Rate: td.fromInteger(100) },
			],
			Outputs: [{ Item: nr[79], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PlasticSmartPlating_C",
			DisplayName: "Plastic Smart Plating",
			Inputs: [
				{ Item: nr[32], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[52], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[54], Rate: td.fromIntegers(15, 2) },
			],
			Outputs: [{ Item: nr[38], Rate: td.fromInteger(5) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PolymerResin_C",
			DisplayName: "Polymer Resin",
			Inputs: [{ Item: nr[7], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[58], Rate: td.fromInteger(130) },
				{ Item: nr[59], Rate: td.fromInteger(20) },
			],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PureAluminumIngot_C",
			DisplayName: "Pure Aluminum Ingot",
			Inputs: [{ Item: nr[67], Rate: td.fromInteger(60) }],
			Outputs: [{ Item: nr[15], Rate: td.fromInteger(30) }],
			Building: ni[1],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PureCateriumIngot_C",
			DisplayName: "Pure Caterium Ingot",
			Inputs: [
				{ Item: nr[2], Rate: td.fromInteger(24) },
				{ Item: nr[9], Rate: td.fromInteger(24) },
			],
			Outputs: [{ Item: nr[77], Rate: td.fromInteger(12) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PureCopperIngot_C",
			DisplayName: "Pure Copper Ingot",
			Inputs: [
				{ Item: nr[1], Rate: td.fromInteger(15) },
				{ Item: nr[9], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[33], Rate: td.fromIntegers(75, 2) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PureIronIngot_C",
			DisplayName: "Pure Iron Ingot",
			Inputs: [
				{ Item: nr[3], Rate: td.fromInteger(35) },
				{ Item: nr[9], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[50], Rate: td.fromInteger(65) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PureQuartzCrystal_C",
			DisplayName: "Pure Quartz Crystal",
			Inputs: [
				{ Item: nr[4], Rate: td.fromIntegers(135, 2) },
				{ Item: nr[9], Rate: td.fromIntegers(75, 2) },
			],
			Outputs: [{ Item: nr[76], Rate: td.fromIntegers(105, 2) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_RecycledRubber_C",
			DisplayName: "Recycled Rubber",
			Inputs: [
				{ Item: nr[54], Rate: td.fromInteger(30) },
				{ Item: nr[57], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[53], Rate: td.fromInteger(60) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_RubberConcrete_C",
			DisplayName: "Rubber Concrete",
			Inputs: [
				{ Item: nr[5], Rate: td.fromInteger(50) },
				{ Item: nr[53], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[22], Rate: td.fromInteger(45) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_SteamedCopperSheet_C",
			DisplayName: "Steamed Copper Sheet",
			Inputs: [
				{ Item: nr[33], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[9], Rate: td.fromIntegers(45, 2) },
			],
			Outputs: [{ Item: nr[36], Rate: td.fromIntegers(45, 2) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_SteelCanister_C",
			DisplayName: "Steel Canister",
			Inputs: [{ Item: nr[65], Rate: td.fromInteger(60) }],
			Outputs: [{ Item: nr[61], Rate: td.fromInteger(40) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_SteelCoatedPlate_C",
			DisplayName: "Steel Coated Plate",
			Inputs: [
				{ Item: nr[65], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[54], Rate: td.fromInteger(5) },
			],
			Outputs: [{ Item: nr[24], Rate: td.fromInteger(45) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_SteelRod_C",
			DisplayName: "Steel Rod",
			Inputs: [{ Item: nr[65], Rate: td.fromInteger(12) }],
			Outputs: [{ Item: nr[19], Rate: td.fromInteger(48) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SteelBeam_C",
			DisplayName: "Steel Beam",
			Inputs: [{ Item: nr[65], Rate: td.fromInteger(60) }],
			Outputs: [{ Item: nr[25], Rate: td.fromInteger(15) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SteelPipe_C",
			DisplayName: "Steel Pipe",
			Inputs: [{ Item: nr[65], Rate: td.fromInteger(30) }],
			Outputs: [{ Item: nr[56], Rate: td.fromInteger(20) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IngotSteel_C",
			DisplayName: "Steel Ingot",
			Inputs: [
				{ Item: nr[3], Rate: td.fromInteger(45) },
				{ Item: nr[0], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[65], Rate: td.fromInteger(45) }],
			Building: ni[2],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_2_C",
			DisplayName: "Versatile Framework",
			Inputs: [
				{ Item: nr[27], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[25], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[39], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_TurboHeavyFuel_C",
			DisplayName: "Turbo Heavy Fuel",
			Inputs: [
				{ Item: nr[59], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[81], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[82], Rate: td.fromInteger(30) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedTurboFuel_C",
			DisplayName: "Packaged Turbofuel",
			Inputs: [
				{ Item: nr[82], Rate: td.fromInteger(20) },
				{ Item: nr[61], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[29], Rate: td.fromInteger(20) }],
			Building: ni[5],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageTurboFuel_C",
			DisplayName: "Unpackage Turbofuel",
			Inputs: [{ Item: nr[29], Rate: td.fromInteger(20) }],
			Outputs: [
				{ Item: nr[82], Rate: td.fromInteger(20) },
				{ Item: nr[61], Rate: td.fromInteger(20) },
			],
			Building: ni[5],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Coal_2_C",
			DisplayName: "Biocoal",
			Inputs: [{ Item: nr[93], Rate: td.fromIntegers(75, 2) }],
			Outputs: [{ Item: nr[0], Rate: td.fromInteger(45) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_EnrichedCoal_C",
			DisplayName: "Compacted Coal",
			Inputs: [
				{ Item: nr[0], Rate: td.fromInteger(25) },
				{ Item: nr[6], Rate: td.fromInteger(25) },
			],
			Outputs: [{ Item: nr[81], Rate: td.fromInteger(25) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_WetConcrete_C",
			DisplayName: "Wet Concrete",
			Inputs: [
				{ Item: nr[5], Rate: td.fromInteger(120) },
				{ Item: nr[9], Rate: td.fromInteger(100) },
			],
			Outputs: [{ Item: nr[22], Rate: td.fromInteger(80) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_AlcladCasing_C",
			DisplayName: "Alclad Casing",
			Inputs: [
				{ Item: nr[15], Rate: td.fromInteger(150) },
				{ Item: nr[33], Rate: td.fromInteger(75) },
			],
			Outputs: [{ Item: nr[73], Rate: td.fromIntegers(225, 2) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_AutomatedMiner_C",
			DisplayName: "Automated Miner",
			Inputs: [
				{ Item: nr[44], Rate: td.fromInteger(1) },
				{ Item: nr[56], Rate: td.fromInteger(4) },
				{ Item: nr[19], Rate: td.fromInteger(4) },
				{ Item: nr[24], Rate: td.fromInteger(2) },
			],
			Outputs: [{ Item: nr[115], Rate: td.fromInteger(1) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ClassicBattery_C",
			DisplayName: "Classic Battery",
			Inputs: [
				{ Item: nr[6], Rate: td.fromInteger(45) },
				{ Item: nr[51], Rate: td.fromIntegers(105, 2) },
				{ Item: nr[54], Rate: td.fromInteger(60) },
				{ Item: nr[21], Rate: td.fromInteger(90) },
			],
			Outputs: [{ Item: nr[14], Rate: td.fromInteger(30) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Battery_C",
			DisplayName: "Battery",
			Inputs: [
				{ Item: nr[68], Rate: td.fromInteger(50) },
				{ Item: nr[66], Rate: td.fromInteger(40) },
				{ Item: nr[73], Rate: td.fromInteger(20) },
			],
			Outputs: [
				{ Item: nr[14], Rate: td.fromInteger(20) },
				{ Item: nr[9], Rate: td.fromInteger(30) },
			],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ComputerSuper_C",
			DisplayName: "Supercomputer",
			Inputs: [
				{ Item: nr[75], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[79], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[43], Rate: td.fromIntegers(45, 8) },
				{ Item: nr[54], Rate: td.fromIntegers(105, 2) },
			],
			Outputs: [{ Item: nr[83], Rate: td.fromIntegers(15, 8) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SulfuricAcid_C",
			DisplayName: "Sulfuric Acid",
			Inputs: [
				{ Item: nr[6], Rate: td.fromInteger(50) },
				{ Item: nr[9], Rate: td.fromInteger(50) },
			],
			Outputs: [{ Item: nr[68], Rate: td.fromInteger(50) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedSulfuricAcid_C",
			DisplayName: "Packaged Sulfuric Acid",
			Inputs: [
				{ Item: nr[68], Rate: td.fromInteger(40) },
				{ Item: nr[61], Rate: td.fromInteger(40) },
			],
			Outputs: [{ Item: nr[96], Rate: td.fromInteger(40) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_7_C",
			DisplayName: "Assembly Director System",
			Inputs: [
				{ Item: nr[45], Rate: td.fromIntegers(3, 2) },
				{ Item: nr[83], Rate: td.fromIntegers(3, 4) },
			],
			Outputs: [{ Item: nr[47], Rate: td.fromIntegers(3, 4) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_HighSpeedConnector_C",
			DisplayName: "High-Speed Connector",
			Inputs: [
				{ Item: nr[80], Rate: td.fromInteger(210) },
				{ Item: nr[26], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[35], Rate: td.fromIntegers(15, 4) },
			],
			Outputs: [{ Item: nr[43], Rate: td.fromIntegers(15, 4) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageSulfuricAcid_C",
			DisplayName: "Unpackage Sulfuric Acid",
			Inputs: [{ Item: nr[96], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[68], Rate: td.fromInteger(60) },
				{ Item: nr[61], Rate: td.fromInteger(60) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CoolingDevice_C",
			DisplayName: "Cooling Device",
			Inputs: [
				{ Item: nr[70], Rate: td.fromIntegers(75, 8) },
				{ Item: nr[44], Rate: td.fromIntegers(15, 8) },
				{ Item: nr[8], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[71], Rate: td.fromIntegers(15, 4) }],
			Building: ni[6],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_HeatSink_C",
			DisplayName: "Heat Sink",
			Inputs: [
				{ Item: nr[51], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[36], Rate: td.fromIntegers(45, 2) },
			],
			Outputs: [{ Item: nr[70], Rate: td.fromIntegers(15, 2) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_FusedModularFrame_C",
			DisplayName: "Fused Modular Frame",
			Inputs: [
				{ Item: nr[62], Rate: td.fromIntegers(3, 2) },
				{ Item: nr[73], Rate: td.fromInteger(75) },
				{ Item: nr[8], Rate: td.fromIntegers(75, 2) },
			],
			Outputs: [{ Item: nr[34], Rate: td.fromIntegers(3, 2) }],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_GasTank_C",
			DisplayName: "Empty Fluid Tank",
			Inputs: [{ Item: nr[15], Rate: td.fromInteger(60) }],
			Outputs: [{ Item: nr[84], Rate: td.fromInteger(60) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedNitrogen_C",
			DisplayName: "Packaged Nitrogen Gas",
			Inputs: [
				{ Item: nr[8], Rate: td.fromInteger(240) },
				{ Item: nr[84], Rate: td.fromInteger(60) },
			],
			Outputs: [{ Item: nr[97], Rate: td.fromInteger(60) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_UnpackageNitrogen_C",
			DisplayName: "Unpackage Nitrogen Gas",
			Inputs: [{ Item: nr[97], Rate: td.fromInteger(60) }],
			Outputs: [
				{ Item: nr[8], Rate: td.fromInteger(240) },
				{ Item: nr[84], Rate: td.fromInteger(60) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_DilutedFuel_C",
			DisplayName: "Diluted Fuel",
			Inputs: [
				{ Item: nr[59], Rate: td.fromInteger(50) },
				{ Item: nr[9], Rate: td.fromInteger(100) },
			],
			Outputs: [{ Item: nr[57], Rate: td.fromInteger(100) }],
			Building: ni[6],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ElectricMotor_C",
			DisplayName: "Electric Motor",
			Inputs: [
				{ Item: nr[85], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[52], Rate: td.fromIntegers(15, 2) },
			],
			Outputs: [{ Item: nr[44], Rate: td.fromIntegers(15, 2) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_FertileUranium_C",
			DisplayName: "Fertile Uranium",
			Inputs: [
				{ Item: nr[11], Rate: td.fromInteger(25) },
				{ Item: nr[12], Rate: td.fromInteger(25) },
				{ Item: nr[72], Rate: td.fromInteger(15) },
				{ Item: nr[68], Rate: td.fromInteger(25) },
			],
			Outputs: [
				{ Item: nr[16], Rate: td.fromInteger(100) },
				{ Item: nr[9], Rate: td.fromInteger(40) },
			],
			Building: ni[6],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PlutoniumCell_C",
			DisplayName: "Encased Plutonium Cell",
			Inputs: [
				{ Item: nr[17], Rate: td.fromInteger(10) },
				{ Item: nr[22], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[18], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PressureConversionCube_C",
			DisplayName: "Pressure Conversion Cube",
			Inputs: [
				{ Item: nr[34], Rate: td.fromInteger(1) },
				{ Item: nr[74], Rate: td.fromInteger(2) },
			],
			Outputs: [{ Item: nr[86], Rate: td.fromInteger(1) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CopperDust_C",
			DisplayName: "Copper Powder",
			Inputs: [{ Item: nr[33], Rate: td.fromInteger(300) }],
			Outputs: [{ Item: nr[88], Rate: td.fromInteger(50) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Plutonium_C",
			DisplayName: "Plutonium Pellet",
			Inputs: [
				{ Item: nr[16], Rate: td.fromInteger(100) },
				{ Item: nr[12], Rate: td.fromInteger(25) },
			],
			Outputs: [{ Item: nr[17], Rate: td.fromInteger(30) }],
			Building: ni[8],
			Alternate: !1,
			PowerConsumption: td.fromInteger(500),
		},
		{
			ClassName: "Recipe_PlutoniumFuelRod_C",
			DisplayName: "Plutonium Fuel Rod",
			Inputs: [
				{ Item: nr[18], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[25], Rate: td.fromIntegers(9, 2) },
				{ Item: nr[85], Rate: td.fromIntegers(3, 2) },
				{ Item: nr[70], Rate: td.fromIntegers(5, 2) },
			],
			Outputs: [{ Item: nr[112], Rate: td.fromIntegers(1, 4) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_PackagedNitricAcid_C",
			DisplayName: "Packaged Nitric Acid",
			Inputs: [
				{ Item: nr[72], Rate: td.fromInteger(30) },
				{ Item: nr[84], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[98], Rate: td.fromInteger(30) }],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_9_C",
			DisplayName: "Nuclear Pasta",
			Inputs: [
				{ Item: nr[88], Rate: td.fromInteger(100) },
				{ Item: nr[86], Rate: td.fromIntegers(1, 2) },
			],
			Outputs: [{ Item: nr[49], Rate: td.fromIntegers(1, 2) }],
			Building: ni[8],
			Alternate: !1,
			PowerConsumption: td.fromInteger(1e3),
		},
		{
			ClassName: "Recipe_UnpackageNitricAcid_C",
			DisplayName: "Unpackage Nitric Acid",
			Inputs: [{ Item: nr[98], Rate: td.fromInteger(20) }],
			Outputs: [
				{ Item: nr[72], Rate: td.fromInteger(20) },
				{ Item: nr[84], Rate: td.fromInteger(20) },
			],
			Building: ni[5],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_HeatFusedFrame_C",
			DisplayName: "Heat-Fused Frame",
			Inputs: [
				{ Item: nr[62], Rate: td.fromInteger(3) },
				{ Item: nr[15], Rate: td.fromInteger(150) },
				{ Item: nr[72], Rate: td.fromInteger(24) },
				{ Item: nr[57], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[34], Rate: td.fromInteger(3) }],
			Building: ni[6],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_InstantPlutoniumCell_C",
			DisplayName: "Instant Plutonium Cell",
			Inputs: [
				{ Item: nr[16], Rate: td.fromInteger(75) },
				{ Item: nr[73], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[18], Rate: td.fromInteger(10) }],
			Building: ni[8],
			Alternate: !0,
			PowerConsumption: td.fromInteger(500),
		},
		{
			ClassName: "Recipe_Alternate_InstantScrap_C",
			DisplayName: "Instant Scrap",
			Inputs: [
				{ Item: nr[10], Rate: td.fromInteger(150) },
				{ Item: nr[0], Rate: td.fromInteger(100) },
				{ Item: nr[68], Rate: td.fromInteger(50) },
				{ Item: nr[9], Rate: td.fromInteger(60) },
			],
			Outputs: [
				{ Item: nr[67], Rate: td.fromInteger(300) },
				{ Item: nr[9], Rate: td.fromInteger(50) },
			],
			Building: ni[6],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_OCSupercomputer_C",
			DisplayName: "OC Supercomputer",
			Inputs: [
				{ Item: nr[74], Rate: td.fromInteger(9) },
				{ Item: nr[71], Rate: td.fromInteger(9) },
			],
			Outputs: [{ Item: nr[83], Rate: td.fromInteger(3) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PlutoniumFuelUnit_C",
			DisplayName: "Plutonium Fuel Unit",
			Inputs: [
				{ Item: nr[18], Rate: td.fromInteger(10) },
				{ Item: nr[86], Rate: td.fromIntegers(1, 2) },
			],
			Outputs: [{ Item: nr[112], Rate: td.fromIntegers(1, 2) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_RadioControlSystem_C",
			DisplayName: "Radio Control System",
			Inputs: [
				{ Item: nr[37], Rate: td.fromIntegers(3, 2) },
				{ Item: nr[35], Rate: td.fromInteger(15) },
				{ Item: nr[73], Rate: td.fromInteger(90) },
				{ Item: nr[53], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[74], Rate: td.fromIntegers(9, 2) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_SloppyAlumina_C",
			DisplayName: "Sloppy Alumina",
			Inputs: [
				{ Item: nr[10], Rate: td.fromInteger(200) },
				{ Item: nr[9], Rate: td.fromInteger(200) },
			],
			Outputs: [{ Item: nr[66], Rate: td.fromInteger(240) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_SuperStateComputer_C",
			DisplayName: "Super-State Computer",
			Inputs: [
				{ Item: nr[75], Rate: td.fromIntegers(18, 5) },
				{ Item: nr[85], Rate: td.fromIntegers(12, 5) },
				{ Item: nr[14], Rate: td.fromInteger(24) },
				{ Item: nr[21], Rate: td.fromInteger(54) },
			],
			Outputs: [{ Item: nr[83], Rate: td.fromIntegers(12, 5) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_ElectromagneticControlRod_C",
			DisplayName: "Electromagnetic Control Rod",
			Inputs: [
				{ Item: nr[78], Rate: td.fromInteger(6) },
				{ Item: nr[79], Rate: td.fromInteger(4) },
			],
			Outputs: [{ Item: nr[85], Rate: td.fromInteger(4) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NuclearFuelRod_C",
			DisplayName: "Uranium Fuel Rod",
			Inputs: [
				{ Item: nr[69], Rate: td.fromInteger(20) },
				{ Item: nr[55], Rate: td.fromIntegers(6, 5) },
				{ Item: nr[85], Rate: td.fromInteger(2) },
			],
			Outputs: [{ Item: nr[111], Rate: td.fromIntegers(2, 5) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_6_C",
			DisplayName: "Magnetic Field Generator",
			Inputs: [
				{ Item: nr[39], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[85], Rate: td.fromInteger(1) },
				{ Item: nr[14], Rate: td.fromInteger(5) },
			],
			Outputs: [{ Item: nr[46], Rate: td.fromInteger(1) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_TurboBlendFuel_C",
			DisplayName: "Turbo Blend Fuel",
			Inputs: [
				{ Item: nr[57], Rate: td.fromInteger(15) },
				{ Item: nr[59], Rate: td.fromInteger(30) },
				{ Item: nr[6], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[60], Rate: td.fromIntegers(45, 2) },
			],
			Outputs: [{ Item: nr[82], Rate: td.fromInteger(45) }],
			Building: ni[6],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_TurboPressureMotor_C",
			DisplayName: "Turbo Pressure Motor",
			Inputs: [
				{ Item: nr[44], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[86], Rate: td.fromIntegers(15, 8) },
				{ Item: nr[97], Rate: td.fromInteger(45) },
				{ Item: nr[78], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[87], Rate: td.fromIntegers(15, 4) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Beacon_1_C",
			DisplayName: "Crystal Beacon",
			Inputs: [
				{ Item: nr[25], Rate: td.fromInteger(2) },
				{ Item: nr[56], Rate: td.fromInteger(8) },
				{ Item: nr[37], Rate: td.fromIntegers(1, 2) },
			],
			Outputs: [{ Item: nr[114], Rate: td.fromInteger(10) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Cable_1_C",
			DisplayName: "Insulated Cable",
			Inputs: [
				{ Item: nr[21], Rate: td.fromInteger(45) },
				{ Item: nr[53], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[26], Rate: td.fromInteger(100) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Cable_2_C",
			DisplayName: "Quickwire Cable",
			Inputs: [
				{ Item: nr[80], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[53], Rate: td.fromInteger(5) },
			],
			Outputs: [{ Item: nr[26], Rate: td.fromIntegers(55, 2) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_IngotCaterium_C",
			DisplayName: "Caterium Ingot",
			Inputs: [{ Item: nr[2], Rate: td.fromInteger(45) }],
			Outputs: [{ Item: nr[77], Rate: td.fromInteger(15) }],
			Building: ni[1],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CircuitBoard_1_C",
			DisplayName: "Silicon Circuit Board",
			Inputs: [
				{ Item: nr[36], Rate: td.fromIntegers(55, 2) },
				{ Item: nr[23], Rate: td.fromIntegers(55, 2) },
			],
			Outputs: [{ Item: nr[35], Rate: td.fromIntegers(25, 2) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CircuitBoard_2_C",
			DisplayName: "Caterium Circuit Board",
			Inputs: [
				{ Item: nr[54], Rate: td.fromIntegers(25, 2) },
				{ Item: nr[80], Rate: td.fromIntegers(75, 2) },
			],
			Outputs: [{ Item: nr[35], Rate: td.fromIntegers(35, 4) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Computer_1_C",
			DisplayName: "Caterium Computer",
			Inputs: [
				{ Item: nr[35], Rate: td.fromIntegers(105, 4) },
				{ Item: nr[80], Rate: td.fromInteger(105) },
				{ Item: nr[53], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[75], Rate: td.fromIntegers(15, 4) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Computer_2_C",
			DisplayName: "Crystal Computer",
			Inputs: [
				{ Item: nr[35], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[37], Rate: td.fromIntegers(45, 16) },
			],
			Outputs: [{ Item: nr[75], Rate: td.fromIntegers(45, 16) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Concrete_C",
			DisplayName: "Fine Concrete",
			Inputs: [
				{ Item: nr[23], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[5], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[22], Rate: td.fromInteger(25) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_CrystalOscillator_C",
			DisplayName: "Insulated Crystal Oscillator",
			Inputs: [
				{ Item: nr[76], Rate: td.fromIntegers(75, 4) },
				{ Item: nr[53], Rate: td.fromIntegers(105, 8) },
				{ Item: nr[79], Rate: td.fromIntegers(15, 8) },
			],
			Outputs: [{ Item: nr[37], Rate: td.fromIntegers(15, 8) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ElectromagneticControlRod_1_C",
			DisplayName: "Electromagnetic Connection Rod",
			Inputs: [
				{ Item: nr[78], Rate: td.fromInteger(8) },
				{ Item: nr[43], Rate: td.fromInteger(4) },
			],
			Outputs: [{ Item: nr[85], Rate: td.fromInteger(8) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Gunpowder_1_C",
			DisplayName: "Fine Black Powder",
			Inputs: [
				{ Item: nr[6], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[81], Rate: td.fromIntegers(15, 4) },
			],
			Outputs: [{ Item: nr[89], Rate: td.fromInteger(15) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_HeatSink_1_C",
			DisplayName: "Heat Exchanger",
			Inputs: [
				{ Item: nr[73], Rate: td.fromInteger(30) },
				{ Item: nr[53], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[70], Rate: td.fromInteger(10) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ModularFrameHeavy_C",
			DisplayName: "Heavy Encased Frame",
			Inputs: [
				{ Item: nr[27], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[55], Rate: td.fromIntegers(75, 8) },
				{ Item: nr[56], Rate: td.fromIntegers(135, 4) },
				{ Item: nr[22], Rate: td.fromIntegers(165, 8) },
			],
			Outputs: [{ Item: nr[62], Rate: td.fromIntegers(45, 16) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_HighSpeedConnector_C",
			DisplayName: "Silicon High-Speed Connector",
			Inputs: [
				{ Item: nr[80], Rate: td.fromInteger(90) },
				{ Item: nr[23], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[35], Rate: td.fromInteger(3) },
			],
			Outputs: [{ Item: nr[43], Rate: td.fromInteger(3) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_IngotIron_C",
			DisplayName: "Iron Alloy Ingot",
			Inputs: [
				{ Item: nr[3], Rate: td.fromInteger(20) },
				{ Item: nr[1], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[50], Rate: td.fromInteger(50) }],
			Building: ni[2],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_IngotSteel_1_C",
			DisplayName: "Solid Steel Ingot",
			Inputs: [
				{ Item: nr[50], Rate: td.fromInteger(40) },
				{ Item: nr[0], Rate: td.fromInteger(40) },
			],
			Outputs: [{ Item: nr[65], Rate: td.fromInteger(60) }],
			Building: ni[2],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_IngotSteel_2_C",
			DisplayName: "Compacted Steel Ingot",
			Inputs: [
				{ Item: nr[3], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[81], Rate: td.fromIntegers(45, 4) },
			],
			Outputs: [{ Item: nr[65], Rate: td.fromIntegers(75, 2) }],
			Building: ni[2],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ModularFrame_C",
			DisplayName: "Steeled Frame",
			Inputs: [
				{ Item: nr[32], Rate: td.fromInteger(2) },
				{ Item: nr[56], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[27], Rate: td.fromInteger(3) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Motor_1_C",
			DisplayName: "Rigour Motor",
			Inputs: [
				{ Item: nr[52], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[78], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[37], Rate: td.fromIntegers(5, 4) },
			],
			Outputs: [{ Item: nr[44], Rate: td.fromIntegers(15, 2) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_NuclearFuelRod_1_C",
			DisplayName: "Uranium Fuel Unit",
			Inputs: [
				{ Item: nr[69], Rate: td.fromInteger(20) },
				{ Item: nr[85], Rate: td.fromInteger(2) },
				{ Item: nr[37], Rate: td.fromIntegers(3, 5) },
				{ Item: nr[114], Rate: td.fromIntegers(6, 5) },
			],
			Outputs: [{ Item: nr[111], Rate: td.fromIntegers(3, 5) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Plastic_1_C",
			DisplayName: "Recycled Plastic",
			Inputs: [
				{ Item: nr[53], Rate: td.fromInteger(30) },
				{ Item: nr[57], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[54], Rate: td.fromInteger(60) }],
			Building: ni[3],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Quickwire_C",
			DisplayName: "Fused Quickwire",
			Inputs: [
				{ Item: nr[77], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[33], Rate: td.fromIntegers(75, 2) },
			],
			Outputs: [{ Item: nr[80], Rate: td.fromInteger(90) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_RadioControlUnit_1_C",
			DisplayName: "Radio Connection Unit",
			Inputs: [
				{ Item: nr[70], Rate: td.fromInteger(15) },
				{ Item: nr[43], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[76], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[74], Rate: td.fromIntegers(15, 4) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ReinforcedIronPlate_1_C",
			DisplayName: "Bolted Iron Plate",
			Inputs: [
				{ Item: nr[24], Rate: td.fromInteger(90) },
				{ Item: nr[20], Rate: td.fromInteger(250) },
			],
			Outputs: [{ Item: nr[32], Rate: td.fromInteger(15) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_ReinforcedIronPlate_2_C",
			DisplayName: "Stitched Iron Plate",
			Inputs: [
				{ Item: nr[24], Rate: td.fromIntegers(75, 4) },
				{ Item: nr[21], Rate: td.fromIntegers(75, 2) },
			],
			Outputs: [{ Item: nr[32], Rate: td.fromIntegers(45, 8) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_EncasedIndustrialBeam_C",
			DisplayName: "Encased Industrial Pipe",
			Inputs: [
				{ Item: nr[56], Rate: td.fromInteger(28) },
				{ Item: nr[22], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[55], Rate: td.fromInteger(4) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Rotor_C",
			DisplayName: "Steel Rotor",
			Inputs: [
				{ Item: nr[56], Rate: td.fromInteger(10) },
				{ Item: nr[21], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[52], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Screw_C",
			DisplayName: "Cast Screw",
			Inputs: [{ Item: nr[50], Rate: td.fromIntegers(25, 2) }],
			Outputs: [{ Item: nr[20], Rate: td.fromInteger(50) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Screw_2_C",
			DisplayName: "Steel Screw",
			Inputs: [{ Item: nr[25], Rate: td.fromInteger(5) }],
			Outputs: [{ Item: nr[20], Rate: td.fromInteger(260) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Silica_C",
			DisplayName: "Cheap Silica",
			Inputs: [
				{ Item: nr[4], Rate: td.fromIntegers(45, 4) },
				{ Item: nr[5], Rate: td.fromIntegers(75, 4) },
			],
			Outputs: [{ Item: nr[23], Rate: td.fromIntegers(105, 4) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Stator_C",
			DisplayName: "Quickwire Stator",
			Inputs: [
				{ Item: nr[56], Rate: td.fromInteger(16) },
				{ Item: nr[80], Rate: td.fromInteger(60) },
			],
			Outputs: [{ Item: nr[78], Rate: td.fromInteger(8) }],
			Building: ni[4],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Turbofuel_C",
			DisplayName: "Turbofuel",
			Inputs: [
				{ Item: nr[57], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[81], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[82], Rate: td.fromIntegers(75, 4) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_TurboMotor_1_C",
			DisplayName: "Turbo Electric Motor",
			Inputs: [
				{ Item: nr[44], Rate: td.fromIntegers(105, 16) },
				{ Item: nr[74], Rate: td.fromIntegers(135, 16) },
				{ Item: nr[85], Rate: td.fromIntegers(75, 16) },
				{ Item: nr[52], Rate: td.fromIntegers(105, 16) },
			],
			Outputs: [{ Item: nr[87], Rate: td.fromIntegers(45, 16) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_MotorTurbo_C",
			DisplayName: "Turbo Motor",
			Inputs: [
				{ Item: nr[71], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[74], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[44], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[53], Rate: td.fromInteger(45) },
			],
			Outputs: [{ Item: nr[87], Rate: td.fromIntegers(15, 8) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpaceElevatorPart_8_C",
			DisplayName: "Thermal Propulsion Rocket",
			Inputs: [
				{ Item: nr[41], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[87], Rate: td.fromInteger(1) },
				{ Item: nr[71], Rate: td.fromInteger(3) },
				{ Item: nr[34], Rate: td.fromInteger(1) },
			],
			Outputs: [{ Item: nr[48], Rate: td.fromInteger(1) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_UraniumCell_1_C",
			DisplayName: "Infused Uranium Cell",
			Inputs: [
				{ Item: nr[11], Rate: td.fromInteger(25) },
				{ Item: nr[23], Rate: td.fromInteger(15) },
				{ Item: nr[6], Rate: td.fromInteger(25) },
				{ Item: nr[80], Rate: td.fromInteger(75) },
			],
			Outputs: [{ Item: nr[69], Rate: td.fromInteger(20) }],
			Building: ni[7],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Wire_1_C",
			DisplayName: "Iron Wire",
			Inputs: [{ Item: nr[50], Rate: td.fromIntegers(25, 2) }],
			Outputs: [{ Item: nr[21], Rate: td.fromIntegers(45, 2) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_Wire_2_C",
			DisplayName: "Caterium Wire",
			Inputs: [{ Item: nr[77], Rate: td.fromInteger(15) }],
			Outputs: [{ Item: nr[21], Rate: td.fromInteger(120) }],
			Building: ni[0],
			Alternate: !0,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Beacon_C",
			DisplayName: "Beacon",
			Inputs: [
				{ Item: nr[24], Rate: td.fromIntegers(45, 2) },
				{ Item: nr[19], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[21], Rate: td.fromIntegers(225, 2) },
				{ Item: nr[26], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[114], Rate: td.fromIntegers(15, 2) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Biofuel_C",
			DisplayName: "Solid Biofuel",
			Inputs: [{ Item: nr[93], Rate: td.fromInteger(120) }],
			Outputs: [{ Item: nr[91], Rate: td.fromInteger(60) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_FilterGasMask_C",
			DisplayName: "Gas Filter",
			Inputs: [
				{ Item: nr[0], Rate: td.fromIntegers(75, 2) },
				{ Item: nr[53], Rate: td.fromInteger(15) },
				{ Item: nr[99], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[31], Rate: td.fromIntegers(15, 2) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_FilterHazmat_C",
			DisplayName: "Iodine Infused Filter",
			Inputs: [
				{ Item: nr[31], Rate: td.fromIntegers(15, 4) },
				{ Item: nr[80], Rate: td.fromInteger(30) },
				{ Item: nr[73], Rate: td.fromIntegers(15, 4) },
			],
			Outputs: [{ Item: nr[30], Rate: td.fromIntegers(15, 4) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_SpikedRebar_C",
			DisplayName: "Iron Rebar",
			Inputs: [{ Item: nr[19], Rate: td.fromInteger(15) }],
			Outputs: [{ Item: nr[102], Rate: td.fromInteger(15) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Quickwire_C",
			DisplayName: "Quickwire",
			Inputs: [{ Item: nr[77], Rate: td.fromInteger(12) }],
			Outputs: [{ Item: nr[80], Rate: td.fromInteger(60) }],
			Building: ni[0],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Rebar_Stunshot_C",
			DisplayName: "Stun Rebar",
			Inputs: [
				{ Item: nr[102], Rate: td.fromInteger(10) },
				{ Item: nr[80], Rate: td.fromInteger(50) },
			],
			Outputs: [{ Item: nr[101], Rate: td.fromInteger(10) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CartridgeSmart_C",
			DisplayName: "Homing Rifle Ammo",
			Inputs: [
				{ Item: nr[110], Rate: td.fromInteger(50) },
				{ Item: nr[43], Rate: td.fromIntegers(5, 2) },
			],
			Outputs: [{ Item: nr[103], Rate: td.fromInteger(25) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Alternate_PolyesterFabric_C",
			DisplayName: "Polyester Fabric",
			Inputs: [
				{ Item: nr[58], Rate: td.fromInteger(30) },
				{ Item: nr[9], Rate: td.fromInteger(30) },
			],
			Outputs: [{ Item: nr[99], Rate: td.fromInteger(30) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NobeliskGas_C",
			DisplayName: "Gas Nobelisk",
			Inputs: [
				{ Item: nr[105], Rate: td.fromInteger(5) },
				{ Item: nr[93], Rate: td.fromInteger(50) },
			],
			Outputs: [{ Item: nr[106], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Rebar_Spreadshot_C",
			DisplayName: "Shatter Rebar",
			Inputs: [
				{ Item: nr[102], Rate: td.fromInteger(10) },
				{ Item: nr[76], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[113], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NobeliskShockwave_C",
			DisplayName: "Pulse Nobelisk",
			Inputs: [
				{ Item: nr[105], Rate: td.fromInteger(5) },
				{ Item: nr[37], Rate: td.fromInteger(1) },
			],
			Outputs: [{ Item: nr[108], Rate: td.fromInteger(5) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Gunpowder_C",
			DisplayName: "Black Powder",
			Inputs: [
				{ Item: nr[0], Rate: td.fromInteger(15) },
				{ Item: nr[6], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[89], Rate: td.fromInteger(30) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_GunpowderMK2_C",
			DisplayName: "Smokeless Powder",
			Inputs: [
				{ Item: nr[89], Rate: td.fromInteger(20) },
				{ Item: nr[59], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[90], Rate: td.fromInteger(20) }],
			Building: ni[3],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Nobelisk_C",
			DisplayName: "Nobelisk",
			Inputs: [
				{ Item: nr[89], Rate: td.fromInteger(20) },
				{ Item: nr[56], Rate: td.fromInteger(20) },
			],
			Outputs: [{ Item: nr[105], Rate: td.fromInteger(10) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NobeliskCluster_C",
			DisplayName: "Cluster Nobelisk",
			Inputs: [
				{ Item: nr[105], Rate: td.fromIntegers(15, 2) },
				{ Item: nr[90], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[104], Rate: td.fromIntegers(5, 2) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Cartridge_C",
			DisplayName: "Rifle Ammo",
			Inputs: [
				{ Item: nr[36], Rate: td.fromInteger(15) },
				{ Item: nr[90], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[110], Rate: td.fromInteger(75) }],
			Building: ni[4],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_Rebar_Explosive_C",
			DisplayName: "Explosive Rebar",
			Inputs: [
				{ Item: nr[102], Rate: td.fromInteger(10) },
				{ Item: nr[90], Rate: td.fromInteger(10) },
				{ Item: nr[56], Rate: td.fromInteger(10) },
			],
			Outputs: [{ Item: nr[100], Rate: td.fromInteger(5) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_NobeliskNuke_C",
			DisplayName: "Nuke Nobelisk",
			Inputs: [
				{ Item: nr[105], Rate: td.fromIntegers(5, 2) },
				{ Item: nr[69], Rate: td.fromInteger(10) },
				{ Item: nr[90], Rate: td.fromInteger(5) },
				{ Item: nr[79], Rate: td.fromInteger(3) },
			],
			Outputs: [{ Item: nr[107], Rate: td.fromIntegers(1, 2) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CartridgeChaos_C",
			DisplayName: "Turbo Rifle Ammo",
			Inputs: [
				{ Item: nr[110], Rate: td.fromInteger(125) },
				{ Item: nr[73], Rate: td.fromInteger(15) },
				{ Item: nr[82], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[109], Rate: td.fromInteger(250) }],
			Building: ni[6],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "Recipe_CartridgeChaos_Packaged_C",
			DisplayName: "Turbo Rifle Ammo",
			Inputs: [
				{ Item: nr[110], Rate: td.fromInteger(125) },
				{ Item: nr[73], Rate: td.fromInteger(15) },
				{ Item: nr[29], Rate: td.fromInteger(15) },
			],
			Outputs: [{ Item: nr[109], Rate: td.fromInteger(250) }],
			Building: ni[7],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorCoal_C$Desc_Coal_C",
			DisplayName: "Power from Coal",
			Inputs: [
				{ Item: nr[0], Rate: td.fromInteger(15) },
				{ Item: nr[9], Rate: td.fromIntegers(9, 200) },
			],
			Outputs: [],
			Building: ni[9],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorCoal_C$Desc_CompactedCoal_C",
			DisplayName: "Power from Compacted Coal",
			Inputs: [
				{ Item: nr[81], Rate: td.fromIntegers(50, 7) },
				{ Item: nr[9], Rate: td.fromIntegers(9, 200) },
			],
			Outputs: [],
			Building: ni[9],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorCoal_C$Desc_PetroleumCoke_C",
			DisplayName: "Power from Petroleum Coke",
			Inputs: [
				{ Item: nr[60], Rate: td.fromInteger(25) },
				{ Item: nr[9], Rate: td.fromIntegers(9, 200) },
			],
			Outputs: [],
			Building: ni[9],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidFuel_C",
			DisplayName: "Power from Fuel",
			Inputs: [{ Item: nr[57], Rate: td.fromInteger(12) }],
			Outputs: [],
			Building: ni[10],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidTurboFuel_C",
			DisplayName: "Power from Turbofuel",
			Inputs: [{ Item: nr[82], Rate: td.fromIntegers(9, 2) }],
			Outputs: [],
			Building: ni[10],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidBiofuel_C",
			DisplayName: "Power from Liquid Biofuel",
			Inputs: [{ Item: nr[94], Rate: td.fromInteger(12) }],
			Outputs: [],
			Building: ni[10],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorNuclear_C$Desc_NuclearFuelRod_C",
			DisplayName: "Power from Uranium Fuel Rod",
			Inputs: [
				{ Item: nr[111], Rate: td.fromIntegers(1, 5) },
				{ Item: nr[9], Rate: td.fromIntegers(6, 25) },
			],
			Outputs: [{ Item: nr[12], Rate: td.fromInteger(10) }],
			Building: ni[11],
			Alternate: !1,
			PowerConsumption: null,
		},
		{
			ClassName: "$GENERATED_POWER$Build_GeneratorNuclear_C$Desc_PlutoniumFuelRod_C",
			DisplayName: "Power from Plutonium Fuel Rod",
			Inputs: [
				{ Item: nr[112], Rate: td.fromIntegers(1, 10) },
				{ Item: nr[9], Rate: td.fromIntegers(6, 25) },
			],
			Outputs: [{ Item: nr[13], Rate: td.fromInteger(1) }],
			Building: ni[11],
			Alternate: !1,
			PowerConsumption: null,
		},
	],
	ns = new Map(no.map((e) => [e.ClassName, e]));
var na = {};
na =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAAXNCSVQI5gpbmQAAARRQTFRF%2F%2F%2F%2Ff39%2FPz8%2FAAAAPz8%2FAAAAPz8%2FAAAAf39%2FPz8%2Ff39%2FPz8%2FPz8%2FPz8%2FPz8%2FPz8%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2F%2F%2F%2F%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2Ff39%2F%2F%2F%2F%2Ff39%2Fv7%2B%2Fv7%2B%2Fv7%2B%2Fv7%2B%2Ff39%2Ff39%2Fv7%2B%2Ff39%2F%2F%2F%2F%2Fv7%2B%2F%2F%2F%2F%2Fv7%2B%2Ff39%2Fv7%2B%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8J9A0QAAAFt0Uk5TAAAAAAEBAgIDBAYGBwoMDQ8TFBcZICEuNj8%2FRUlLTE5RV1dZW1xfX2BjY2prbHBwfH%2BChYiRl5udn6etrrG0tbe6ws3S1%2BHj5%2Bvs7e%2Fw8fLz9PX2%2BPn6%2B%2Fz9%2FvQbWbkAAAERSURBVHjapc%2FXTgJRAEVR8dhAsWHFgh3Hir2MYi9Y6HXm%2F%2F%2BDN0K4lwlk7%2BeTlZwBs%2BW8b%2Bady54FOPNtpSlwBIFaDAIvgoADgfoMBNLDENgTA8rTEHgUBHYhUJqEwIMgsAWBQhQCriCQgEA2CoF7QSABgb8JCNwJAqsQ%2BA1D4FYQWIFAzUnut0pujIU6CwTMDo11n8AmA7xMhF3wLmXUHzAPgWf1BBx3BdZtQMgocnDaKue39Rm2AQrsux1IiQHVOQi4gkAcAu9DEDgRA4qzELgZhcCSGPAmCDgQ%2BJ%2BCwJUY4C1C4FUQ2IZAZhwCF4LAAgSeBIE1CHyNQCAlBlRiEHAFgTgCfhofgwi4LuwED9QEUwJpF8Bt%2FVAAAAAASUVORK5CYII%3D";
const nl = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100"><rect width="100" height="100" fill="#E69344" rx="10" /><image href="${t(
		na,
	)}" x="5" y="5" width="90" height="90" /></svg>`,
	nu = `data:image/svg+xml,${escape(nl)}`,
	nc = {
		ClassName: "FakePower",
		DisplayName: "Power",
		Description: "",
		Icon: nu,
		IsResource: !1,
		IsPiped: !1,
		Color: "",
		SinkPoints: td.ZERO,
		SortOrder: nn.get("Desc_Water_C").SortOrder + 0.5,
	},
	nm = [...nr, nc],
	np = (e) => `translate(${e.x}px, ${e.y}px)`;
function nd(e, t) {
	return e.x === t.x && e.y === t.y;
}
function nf(e, t) {
	return { x: e.x + t.x, y: e.y + t.y };
}
function ng(e, t) {
	let r = e.x - t.x,
		n = e.y - t.y;
	return Math.sqrt(r * r + n * n);
}
Symbol();
const nI = (() => {
		let e = 1;
		return () => e++;
	})(),
	nh = (e) => Number(e),
	nC = td.fromIntegers(60, 1);
let nR = 0,
	n_ = 0,
	ny = "",
	nw = 0,
	nN = [];
const nb = [
	[1, 0],
	[0, -1],
	[-1, 0],
	[0, 1],
];
function nP() {
	nw = (nw + 1) % 4;
}
function nS(e, ...t) {
	ny += `${e} `;
	for (let r = 0; r < t.length; r += 2) {
		let { x: n, y: i } = (function (e, t) {
			let r = nb[nw],
				n = nb[(nw + 3) % 4];
			return { x: e * r[0] + t * r[1], y: e * n[0] + t * n[1] };
		})(t[r], t[r + 1]);
		(ny += `${n} ${i} `), ("q" !== e || r >= 2) && ((nR += n), (n_ += i));
	}
}
const nD = {
		square(e) {
			nS("l", 0, -e, e, 0), nP();
		},
		angle(e) {
			nS("l", e, -e), nP();
		},
		round(e) {
			nS("q", 0, -e, e, -e), nP();
		},
	},
	nv = {
		straight(e) {
			nS("l", 0, -e);
		},
		curvein(e, t) {
			nS("l", 0, -40),
				nS("q", 0, -t, t, -t),
				nS("l", 0, (40 + t) * 2 - e),
				nS("q", -t, 0, -t, -t),
				nS("l", 0, -40);
		},
		fins(e, t) {
			nS("l", 0, -((e - 60) / 2));
			for (let e = 0; e < 60; e += 5) nS("l", t, 0, 0, -5, -t, 0);
			nS("l", 0, -((e - 60) / 2));
		},
	};
function nA(e, t) {
	nv.straight(36), (e[t] = { x: nR, y: n_ }), nv.straight(36);
}
function nF(e) {
	return (
		(nR = 0),
		(n_ = 0),
		(ny = ""),
		(nw = 0),
		(nN = [
			{ solid: [], liquid: [], either: [] },
			{ solid: [], liquid: [], either: [] },
		]),
		e(),
		{ d: ny, attach: { input: nN[0], output: nN[1] } }
	);
}
const nO = nF(() => {
		nS("M", -92, 36),
			nA(nN[0].solid, 0),
			nD.square(12),
			nv.fins(160, 12),
			nD.square(12),
			nA(nN[1].solid, 0),
			nD.square(12),
			nv.fins(160, 12),
			nD.square(12),
			nS("z");
	}),
	nB = nF(() => {
		nS("M", -92, 72),
			nA(nN[0].solid, 0),
			nA(nN[0].solid, 1),
			nD.square(12),
			nv.fins(160, 12),
			nD.square(12),
			nv.straight(72),
			nA(nN[1].solid, 0),
			nD.square(12),
			nv.fins(160, 12),
			nD.square(12),
			nS("z");
	}),
	nx = nF(() => {
		nS("M", -92, 72),
			nA(nN[0].solid, 0),
			nA(nN[0].liquid, 0),
			nD.round(12),
			nv.curvein(160, 12),
			nD.round(12),
			nA(nN[1].liquid, 0),
			nA(nN[1].solid, 0),
			nD.round(12),
			nv.curvein(160, 12),
			nD.round(12),
			nS("z");
	}),
	nk = nF(() => {
		nS("M", -107, 46),
			nv.straight(10),
			nA(nN[0].solid, 0),
			nv.straight(10),
			nD.angle(12),
			nv.straight(190),
			nD.angle(12),
			nv.straight(10),
			nA(nN[1].solid, 0),
			nv.straight(10),
			nD.angle(12),
			nv.straight(190),
			nD.angle(12),
			nS("z");
	}),
	nE = nF(() => {
		nS("M", -107, 72),
			nA(nN[0].solid, 0),
			nA(nN[0].solid, 1),
			nD.angle(12),
			nv.straight(190),
			nD.angle(12),
			nv.straight(36),
			nA(nN[1].solid, 0),
			nv.straight(36),
			nD.angle(12),
			nv.straight(190),
			nD.angle(12),
			nS("z");
	}),
	nH = nF(() => {
		nS("M", -142, 144),
			nA(nN[0].solid, 0),
			nA(nN[0].solid, 1),
			nA(nN[0].solid, 2),
			nA(nN[0].solid, 3),
			nD.angle(12),
			nv.straight(260),
			nD.angle(12),
			nv.straight(108),
			nA(nN[1].solid, 0),
			nv.straight(108),
			nD.angle(12),
			nv.straight(260),
			nD.angle(12),
			nS("z");
	}),
	nU = nF(() => {
		nS("M", -142, 72),
			nA(nN[0].solid, 0),
			nA(nN[0].liquid, 0),
			nD.round(12),
			nv.straight(260),
			nD.round(12),
			nA(nN[1].liquid, 0),
			nA(nN[1].solid, 0),
			nD.round(12),
			nv.straight(260),
			nD.round(12),
			nS("z");
	}),
	nq = nF(() => {
		nS("M", -142, 144),
			nA(nN[0].liquid, 0),
			nA(nN[0].liquid, 1),
			nA(nN[0].solid, 0),
			nA(nN[0].solid, 1),
			nD.round(12),
			nv.straight(260),
			nD.round(12),
			nv.straight(144),
			nA(nN[1].solid, 0),
			nA(nN[1].liquid, 0),
			nD.round(12),
			nv.straight(260),
			nD.round(12),
			nS("z");
	}),
	nM = nF(() => {
		nS("M", -212, 188),
			nv.straight(160),
			nA(nN[0].liquid, 0),
			nA(nN[0].solid, 0),
			nA(nN[0].solid, 1),
			nD.square(12),
			nv.straight(400),
			nD.square(12),
			nv.straight(36),
			nA(nN[1].solid, 0),
			nv.straight(108),
			nv.straight(160),
			nD.square(12),
			nv.straight(400),
			nD.square(12),
			nS("z");
	}),
	nL = nF(() => {
		nS("M", -190, 72),
			nA(nN[0].solid, 0),
			nA(nN[0].liquid, 0),
			nD.angle(60),
			nv.straight(260),
			nD.angle(60),
			nv.straight(144),
			nD.angle(60),
			nv.straight(260),
			nD.angle(60),
			nS("z");
	}),
	nT = nF(() => {
		nS("M", -155, 95),
			nv.straight(59),
			nA(nN[0].liquid, 0),
			nv.straight(59),
			nD.angle(60),
			nv.straight(190),
			nD.angle(60),
			nv.straight(190),
			nD.angle(60),
			nv.straight(190),
			nD.angle(60),
			nS("z");
	}),
	nz = nF(() => {
		nS("M", -190, 130),
			nv.straight(58),
			nA(nN[0].liquid, 0),
			nA(nN[0].solid, 0),
			nv.straight(58),
			nD.round(60),
			nv.straight(260),
			nD.round(60),
			nv.straight(94),
			nA(nN[1].solid, 0),
			nv.straight(94),
			nD.round(60),
			nv.straight(260),
			nD.round(60),
			nS("z");
	}),
	nW = {
		Build_ConstructorMk1_C: nk,
		Build_SmelterMk1_C: nO,
		Build_FoundryMk1_C: nB,
		Build_OilRefinery_C: nU,
		Build_AssemblerMk1_C: nE,
		Build_Packager_C: nx,
		Build_Blender_C: nq,
		Build_ManufacturerMk1_C: nH,
		Build_HadronCollider_C: nM,
		Build_GeneratorCoal_C: nL,
		Build_GeneratorFuel_C: nT,
		Build_GeneratorNuclear_C: nz,
	},
	n$ = nF(() => {
		nS("M", -82, 36),
			nA(nN[0].either, 0),
			nD.square(12),
			nv.straight(140),
			nD.round(12),
			nv.straight(72),
			nD.round(12),
			nv.straight(140),
			nD.square(12),
			nS("z");
	}),
	nj = nF(() => {
		nS("M", -82, 36),
			nv.straight(72),
			nD.square(12),
			nv.straight(140),
			nD.round(12),
			nA(nN[1].either, 0),
			nD.round(12),
			nv.straight(140),
			nD.square(12),
			nS("z");
	}),
	nG = nF(() => {
		nS("M", -32, 20),
			nv.straight(40),
			nD.round(12),
			nv.straight(40),
			nD.round(12),
			nv.straight(40),
			nD.round(12),
			nv.straight(40),
			nD.round(12),
			nS("z");
	}).d,
	nQ = nF(() => {
		nS("M", -32, 0), nD.round(32), nD.round(32), nD.round(32), nD.round(32), nS("z");
	}).d;
class nZ {
	[c] = !0;
	id = nI();
	x;
	y;
	rate;
	inputs = [];
	outputs = [];
	inputAttachPoints = [];
	outputAttachPoints = [];
	constructor(e, t, r) {
		(this.x = e), (this.y = t), (this.rate = r);
	}
	*inputsAndOutputs() {
		for (let e of this.inputs) yield* e;
		for (let e of this.outputs) yield* e;
	}
}
class nV extends nZ {
	recipe;
	constructor(e, t, r, n) {
		super(e, t, r),
			(this.recipe = n),
			(this.inputs = n.Inputs.map(() => [])),
			(this.outputs = n.Outputs.map(() => []));
		let i = this.getDrawing();
		this.inputAttachPoints = [];
		{
			let e = 0,
				t = 0;
			for (let r of this.recipe.Inputs)
				this.inputAttachPoints.push(r.Item.IsPiped ? i.attach.input.liquid[t++] : i.attach.input.solid[e++]);
		}
		this.outputAttachPoints = [];
		{
			let e = 0,
				t = 0;
			for (let r of this.recipe.Outputs)
				this.outputAttachPoints.push(r.Item.IsPiped ? i.attach.output.liquid[t++] : i.attach.output.solid[e++]);
		}
	}
	toFlow(e) {
		return { rate: e.Rate.mul(this.rate), item: e.Item };
	}
	inputFlows() {
		return this.recipe.Inputs.map((e) => this.toFlow(e));
	}
	outputFlows() {
		return this.recipe.Outputs.map((e) => this.toFlow(e));
	}
	clone() {
		return new nV(this.x, this.y, this.rate, this.recipe);
	}
	getDrawing() {
		return nW[this.recipe.Building.ClassName];
	}
	canCombineWith(e) {
		return e instanceof nV && e.recipe === this.recipe;
	}
}
class nY extends nZ {
	item;
	constructor(e, t, r, n) {
		super(e, t, r),
			(this.item = n),
			(this.inputs = [[]]),
			(this.inputAttachPoints = this.getDrawing().attach.input.either);
	}
	inputFlows() {
		return [{ rate: this.rate, item: this.item }];
	}
	outputFlows() {
		return [];
	}
	clone() {
		return new nY(this.x, this.y, this.rate, this.item);
	}
	getDrawing() {
		return n$;
	}
	canCombineWith(e) {
		return e instanceof nY && e.item === this.item;
	}
}
class nX extends nZ {
	item;
	constructor(e, t, r, n) {
		super(e, t, r),
			(this.item = n),
			(this.outputs = [[]]),
			(this.outputAttachPoints = this.getDrawing().attach.output.either);
	}
	inputFlows() {
		return [];
	}
	outputFlows() {
		return [{ rate: this.rate, item: this.item }];
	}
	clone() {
		return new nX(this.x, this.y, this.rate, this.item);
	}
	getDrawing() {
		return nj;
	}
	canCombineWith(e) {
		return e instanceof nX && e.item === this.item;
	}
}
function nJ(e, t) {
	let r = e,
		n = new Set();
	function i(e) {
		for (let t of ((r = e), n)) t();
	}
	return (
		t &&
			((window[t] = r),
			n.add(() => {
				window[t] = r;
			})),
		{
			useSelector(e, t) {
				let i = "function" == typeof t ? Object.is : t.equal,
					o = "function" == typeof t ? t : t.select,
					s = o(r);
				function a() {
					let t;
					try {
						t = o(r);
					} catch {
						eS(e);
						return;
					}
					i(t, s) || eS(e);
				}
				return n.add(a), eb(e, () => n.delete(a)), () => (s = o(r));
			},
			replace: i,
			update(e) {
				i(Z(r, e));
			},
			getStateRaw: () => r,
			subscribeRaw: (e) => (
				n.add(e),
				() => {
					n.delete(e);
				}
			),
		}
	);
}
function nK(e, t) {
	if (t)
		try {
			let r = e.deserialize(t);
			if (null != r) return r;
		} catch (e) {
			console.error(e);
		}
	return e.makeDefault();
}
const n0 = [];
let n1 = "",
	n2 = -1;
function n5(e) {
	clearTimeout(n2),
		(n0[e].dirty = !0),
		(n2 = setTimeout(() => {
			let e = n1.split(".");
			for (let t = 0; t < n0.length; t++) {
				let r = n0[t];
				r?.dirty && ((e[t] = r.stateDef.serialize(r.getStateRaw())), (r.dirty = !1));
			}
			let t = e.join(".");
			t !== n1 && ((n1 = t), (window.location.hash = t));
		}, 50));
}
function n3(e, t, r) {
	let n = (() => {
			let { hash: r } = window.location;
			"#" === r[0] && (r = r.slice(1));
			let n = r.split(".")[t];
			return nK(e, n);
		})(),
		i = nJ(n, r);
	return (
		(n0[t] = { stateDef: e, dirty: !1, getStateRaw: i.getStateRaw, replaceState: i.replace }),
		i.subscribeRaw(() => {
			n5(t);
		}),
		n5(t),
		i
	);
}
addEventListener("hashchange", () => {
	let { hash: e } = window.location;
	if (("#" === e[0] && (e = e.slice(1)), e === n1)) return;
	console.log("newhash in");
	let t = e.split(".");
	for (let e = 0; e < n0.length; e++) {
		let r = n0[e];
		if (r) {
			let n = t[e],
				i = nK(r.stateDef, n);
			r.replaceState(i), (r.dirty = !1);
		}
	}
	clearTimeout(n2), (n1 = e);
});
const n4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
	n6 = new Map(n4.split("").map((e, t) => [e, t]));
class n7 {
	s;
	index;
	shift;
	current;
	constructor(e) {
		(this.s = e), (this.index = -1), (this.shift = 6), (this.current = 0);
	}
	read(e) {
		let t = 0,
			r = 0;
		for (; r < e; ) {
			6 === this.shift && ((this.shift = 0), this.index++, (this.current = n6.get(this.s[this.index]) ?? 0));
			let n = Math.min(e - r, 6 - this.shift),
				i = ((this.current >> this.shift) << (32 - n)) >>> (32 - n - r);
			(t |= i), (r += n), (this.shift += n);
		}
		return t;
	}
}
class n9 {
	shift = 0;
	current = 0;
	res = [];
	write(e, t) {
		let r = 0;
		for (; r < e; ) {
			6 === this.shift && (this.res.push(n4[this.current]), (this.shift = 0), (this.current = 0));
			let n = Math.min(e - r, 6 - this.shift),
				i = ((t >> r) << (32 - n)) >>> (32 - n - this.shift);
			(this.current |= i), (r += n), (this.shift += n);
		}
	}
	finish() {
		this.shift > 0 && this.res.push(n4[this.current]);
		let e = this.res.join("");
		return (this.shift = 0), (this.current = 0), (this.res.length = 0), e;
	}
}
function n8(e) {
	return 32 - Math.clz32(e);
}
function ie(e, t) {
	for (;;) {
		let r = +(0n !== t);
		if ((e.write(1, r), !r)) return;
		e.write(6, Number(63n & t)), (t >>= 6n);
	}
}
function it(e) {
	let t = 0n,
		r = 0n;
	for (;;) {
		let n = e.read(1);
		if (!n) return t;
		let i = BigInt(e.read(6));
		(t |= i << r), (r += 6n);
	}
}
function ir(e, t) {
	let { p: r, q: n } = t.terms();
	n < 0 && ((n = -n), (r = -r));
	let i = +(r < 0);
	e.write(1, i), i && (r = -r), ie(e, r), ie(e, n);
}
function ii(e) {
	let t = e.read(1),
		r = it(e),
		n = it(e);
	return t && (r = -r), td.fromBigInts(r, n);
}
function io(e) {
	let t = new Map(),
		r = 0;
	for (let n of e) t.set(n, r++);
	let n = r > 0 ? n8(r - 1) : 0;
	function i(e, r) {
		let i = t.get(r);
		if (null == i) throw Error("Internal ID error");
		e.write(n, i);
	}
	return (i.BITS = n), i;
}
function is(e) {
	let t = e.length,
		r = t > 0 ? n8(t - 1) : 0;
	function n(t) {
		let n = t.read(r);
		return n < e.length ? e[n] : null;
	}
	return (n.BITS = r), n;
}
const ia = io(no),
	il = io(nm),
	iu = is(no),
	ic = is(nm),
	im = { x: -8e3, y: -4e3 },
	ip = { x: 8e3, y: 4e3 },
	id = { x: im.x + 500, y: im.y + 500 },
	ig = { x: ip.x - 500, y: ip.y - 500 };
function iI(e, t, r) {
	return e < t ? t : e > r ? r : e;
}
function ih(e, t, r) {
	return { x: iI(e.x, t.x, r.x), y: iI(e.y, t.y, r.y) };
}
const iC = /.?/,
	iR = /(?!)/g;
function i_(e) {
	if (!(e = e.trim())) return { testRegex: iC, highlightRegex: iR };
	let t = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return { testRegex: RegExp(t, "i"), highlightRegex: RegExp(t, "ig") };
}
function iy(e, t) {
	let r = [];
	for (t.lastIndex = 0; ; ) {
		let n = t.lastIndex,
			i = t.exec(e);
		if (!i) {
			r.push(e.slice(n));
			break;
		}
		i.index !== n && r.push(e.slice(n, i.index)), r.push(Y("strong", { children: i[0] }));
	}
	return r;
}
function iw(e, t) {
	let r = 0,
		n = e.length - 1;
	if (n < 0 || t <= e[r].rxIn) return r;
	if (t > e[n].rxIn) return n + 1;
	for (; n - r > 1; ) {
		let i = (r + n) >> 1;
		t > e[i].rxIn ? (r = i) : (n = i);
	}
	return n;
}
class iN {
	[c] = !0;
	id = nI();
	x;
	y;
	width;
	terminals = [];
	constructor(e, t, r) {
		(this.x = e), (this.y = t), (this.width = r);
	}
}
class ib {
	[c] = !0;
	id = nI();
	rate;
	item;
	input;
	output;
	inputIndex;
	outputIndex;
	constructor(e, t, r, n, i, o) {
		(this.rate = e),
			(this.item = t),
			(this.input = r),
			(this.output = n),
			(this.inputIndex = i),
			(this.outputIndex = o);
	}
	flow() {
		return { rate: this.rate, item: this.item };
	}
}
function iP(e, t) {
	let r = new Map();
	for (let e = 0; e < t.length; e++) r.set(t[e], e);
	let n = Array(e.length);
	for (let t = 0; t < e.length; t++) {
		let i = r.get(e[t]);
		if (null == i) return null;
		n[t] = i;
	}
	return n;
}
class iS {
	basic;
	nonBasic;
	isDualObjective;
	coefficients;
	nCols;
	nRows;
	objectiveStartIndex;
	constructor(e, t, r, n) {
		(this.basic = e),
			(this.nonBasic = t),
			(this.isDualObjective = r),
			(this.nCols = this.nonBasic.length + 1),
			(this.nRows = this.basic.length + (r ? 2 : 1)),
			(this.objectiveStartIndex = this.nCols * this.basic.length),
			(this.coefficients = n ?? Array(this.nCols * this.nRows).fill(td.ZERO));
	}
	clone() {
		return new iS(this.basic.slice(), this.nonBasic.slice(), this.isDualObjective, this.coefficients.slice());
	}
	stringify() {
		let e = `${this.basic.join()};${this.nonBasic.join()};`,
			t = !0;
		for (let r = 0; r < this.nRows; r++)
			for (let n = 0; n < this.nCols; n++) {
				let i = (n + this.nCols - 1) % this.nCols;
				t ? (t = !1) : (e += ","), (e += this.coefficients[r * this.nCols + i].toRatioString());
			}
		return e;
	}
	static parse(e) {
		let t = e.split(";");
		if (3 !== t.length) return null;
		function r(e, t, r) {
			let n = e.split(","),
				i = [];
			for (let e of n) {
				if (!e.match(t)) return null;
				i.push(r(e));
			}
			return i;
		}
		let n = r(t[0], /^\d+$/, (e) => parseInt(e, 10)),
			i = r(t[1], /^\d+$/, (e) => parseInt(e, 10)),
			o = r(t[2], /^-?\d+(:-?\d+)?$/, (e) => {
				let t = e.split(":");
				return td.fromBigInts(BigInt(t[0]), BigInt(t[1] ?? "1"));
			});
		if (!n || !i || !o) return null;
		let s = n.length + 1,
			a = i.length + 1,
			l = !1;
		if (s * a !== o.length && ((l = !0), (s += 1) * a !== o.length)) return null;
		for (let e = 0; e < s; e++) {
			let [t] = o.splice(e * a, 1);
			o.splice((e + 1) * a - 1, 0, t);
		}
		return new iS(n, i, l, o);
	}
	static equal(e, t) {
		if (!e || !t) return e == t;
		if (
			e.basic.length !== t.basic.length ||
			e.nonBasic.length !== t.nonBasic.length ||
			e.isDualObjective !== t.isDualObjective ||
			e.coefficients.length !== t.coefficients.length
		)
			return !1;
		let r = iP(e.basic, t.basic);
		if (!r) return !1;
		let n = iP(e.nonBasic, t.nonBasic);
		if (!n) return !1;
		let i = e.nCols,
			o = e.nRows;
		for (let s = 0; s < o; s++)
			for (let o = 0; o < i; o++) {
				let a = o === i - 1 ? o : n[o],
					l = s >= e.basic.length ? s : r[s],
					u = e.coefficients[s * i + o],
					c = t.coefficients[l * i + a];
				if (u.neq(c)) return !1;
			}
		return !0;
	}
	needsTwoPhase() {
		let e = this.nCols;
		this.basic.length;
		let { objectiveStartIndex: t, coefficients: r } = this;
		for (let n = e - 1; n < t; n += e) if (0 > r[n].sign()) return !0;
		return !1;
	}
	makeSpecial() {
		let e = this.nCols,
			t = this.nRows,
			r = t - (this.isDualObjective ? 1 : 0),
			{ basic: n, nonBasic: i, coefficients: o } = this,
			s = n.slice(),
			a = i.slice();
		a.push(0);
		let l = Array((e + 1) * r),
			u = 0,
			c = 0;
		for (let t = 0; t < r - 1; t++) for (let t = 0; t < e; t++) (l[c++] = o[u++]), t === e - 2 && (l[c++] = td.ONE);
		for (let t = 0; t < e; t++) (l[c++] = td.ZERO), t === e - 2 && (l[c++] = td.MINUS_ONE);
		return new iS(s, a, !1, l);
	}
	makeRegular(e) {
		let t = this.nCols;
		this.nRows;
		let r = e.nRows,
			{ basic: n, nonBasic: i, coefficients: o } = this,
			s = t - 1,
			a = r * s,
			l = n.slice(),
			u = i.slice(),
			c = u.indexOf(0);
		if (c < 0) throw Error("Internal error: makeRegular");
		u.splice(c, 1);
		let m = Array(a),
			p = 0;
		{
			let r = s * e.basic.length;
			for (let e = 0, n = 0; p < r; e++, n++) n === t && (n = 0), n !== c && (m[p++] = o[e]);
		}
		let d = e.coefficients;
		for (let e = p; e < a; e += s) {
			let t = e + s;
			for (let r = e; r < t; r++) m[r] = td.ZERO;
			for (let r = e, n = 1; r < t; r++, n++) {
				let t = n < s ? u.indexOf(n) : n - 1,
					i = d[r];
				if (t >= 0) {
					let r = e + t;
					m[r] = m[r].add(i);
					continue;
				}
				let o = l.indexOf(n) * s,
					a = o + s;
				for (let t = o, r = e; t < a; t++, r++) m[r] = m[r].add(i.mul(m[t]));
			}
		}
		return new iS(l, u, e.isDualObjective, m);
	}
	pivotMutate(e) {
		let t = this.nCols,
			r = this.nRows,
			n = (e, r) => e + r * t,
			i = t * r,
			{ basic: o, nonBasic: s, isDualObjective: a, objectiveStartIndex: l, coefficients: u } = this,
			c = -1,
			m = -1;
		if (e) (c = t - 2), (m = 0);
		else if (a) {
			let e, r;
			for (let n = l, o = l + t, a = 0; o < i - 1; n++, o++, a++) {
				let t = u[n],
					i = u[o],
					l = t.sign(),
					p = i.sign();
				if (l < 0 || (0 === l && p <= 0)) continue;
				let d = s[a],
					f = e && td.compare(e, t),
					g = r && td.compare(r, i);
				(null == f || null == g || -1 === f || (0 === f && -1 === g) || (0 === f && 0 === g && d > m)) &&
					((c = a), (m = d), (e = t), (r = i));
			}
			if (!e) return !1;
		} else {
			let e;
			for (let t = l, r = 0; t < i - 1; t++, r++) {
				let n = u[t];
				if (0 >= n.sign()) continue;
				let i = s[r],
					o = e && td.compare(e, n);
				(null == o || -1 === o || (0 === o && i > m)) && ((c = r), (m = i), (e = n));
			}
			if (!e) return !1;
		}
		let p = -1,
			d = -1;
		if (e) {
			let e;
			for (let r = t - 1, n = 0; r < l; r += t, n++) {
				let t = u[r],
					i = o[n];
				if (t.sign() > 0) continue;
				let s = e && td.compare(e, t);
				(null == s || 1 === s || (0 === s && i < d)) && ((p = n), (d = i), (e = t));
			}
			if (!e) return !1;
		} else {
			let e;
			for (let r = n(c, 0), i = t - 1, s = 0; r < l; r += t, i += t, s++) {
				let t = u[r];
				if (t.sign() >= 0) continue;
				let n = u[i].div(t).neg();
				if (0 > n.sign()) throw Error("Internal error: exit pivot");
				let a = o[s],
					l = e && td.compare(e, n);
				(null == l || 1 === l || (0 === l && a < d)) && ((p = s), (d = a), (e = n));
			}
			if (!e) return !1;
		}
		(this.basic[p] = m), (this.nonBasic[c] = d);
		let f = p * t,
			g = f + t;
		{
			let e = f + c,
				t = td.MINUS_ONE.div(u[e]);
			u[e] = td.MINUS_ONE;
			for (let e = f; e < g; e++) u[e] = u[e].mul(t);
		}
		for (let e = 0, r = t; e < i; e += t, r += t) {
			let t;
			if (e !== f) {
				{
					let r = e + c;
					(t = u[r]), (u[r] = td.ZERO);
				}
				for (let n = e, i = f; n < r; n++, i++) u[n] = u[n].fma(t, u[i]);
			}
		}
		return !0;
	}
}
function* iD(e) {
	if (e.needsTwoPhase()) {
		let t = e.makeSpecial();
		if ((yield, !t.pivotMutate(!0))) return null;
		yield;
		for (let e = 0; ; e++) {
			if (200 === e) return console.error("Possible cycle detected"), null;
			if (!t.pivotMutate(!1)) break;
			yield;
		}
		if (0 > t.coefficients[t.coefficients.length - 1].sign()) return null;
		(e = t.makeRegular(e)), yield;
	}
	for (let t = 0; ; t++) {
		if (200 === t) return console.error("Possible cycle detected"), null;
		if (!e.pivotMutate(!1)) break;
		yield;
	}
	return e;
}
function iv(e, t) {
	let r = new Set(t),
		n = new Map(),
		i = new Map(),
		o = [],
		s = [],
		a = 1;
	for (let t of r) {
		let s = e.connectors.get(t);
		n.set(t, a), o.push(a++);
		let l = e.producers.get(s.input),
			u = e.producers.get(s.output),
			c = `i-${s.input}-${s.inputIndex}`,
			m = `o-${s.output}-${s.outputIndex}`;
		if (!i.has(c)) {
			let e = l.outputs[s.inputIndex];
			for (let t of (i.set(c, { rate: l.outputFlows()[s.inputIndex].rate, connectors: e }), e)) r.add(t);
		}
		if (!i.has(m)) {
			let e = u.inputs[s.outputIndex];
			for (let t of (i.set(m, { rate: u.inputFlows()[s.outputIndex].rate, connectors: e }), e)) r.add(t);
		}
	}
	let l = r.size + 1,
		u = i.size + 1,
		c = Array(l * u).fill(td.ZERO);
	{
		let e = 0;
		for (let { rate: t, connectors: r } of i.values()) {
			for (let t of (s.push(a++), r)) {
				let r = n.get(t) - 1;
				c[e * l + r] = td.MINUS_ONE;
			}
			(c[(e + 1) * l - 1] = t), (e += 1);
		}
		for (let t = 0; t < l - 1; t++) c[e * l + t] = td.ONE;
	}
	let m = (function (e) {
		let t = iD(e);
		for (;;) {
			let { done: e, value: r } = t.next();
			if (e) return r;
		}
	})(new iS(s, o, !1, c));
	for (let [t, r] of n) {
		let n = e.connectors.get(t),
			i = m.basic.indexOf(r);
		if (-1 !== i) {
			let e = m.coefficients[(i + 1) * l - 1];
			n.rate = e;
		} else n.rate = td.ZERO;
	}
	return r;
}
const {
		saveX: iA,
		saveY: iF,
		loadX: iO,
		loadY: iB,
	} = (() => {
		let e = im.x,
			t = im.y,
			r = n8(ip.x - e),
			n = n8(ip.y - t);
		return {
			saveX(t, n) {
				t.write(r, (n - e) >>> 0);
			},
			saveY(e, r) {
				e.write(n, (r - t) >>> 0);
			},
			loadX: (t) => t.read(r) + e,
			loadY: (e) => e.read(n) + t,
		};
	})(),
	ix = { type: "none" },
	ik = () => ({
		viewport: { center: { x: 0, y: 0 }, zoom: 1 },
		mouseOver: ix,
		wip: { type: "none" },
		producers: new Map(),
		connectors: new Map(),
		buses: new Map(),
	}),
	{
		useSelector: iE,
		update: iH,
		getStateRaw: iU,
	} = n3(
		{
			serialize: function (e) {
				let t = new n9();
				t.write(6, 0);
				let r = io(e.producers.keys());
				ie(t, BigInt(r.BITS));
				let n = io(e.connectors.keys());
				for (let i of (ie(t, BigInt(n.BITS)), ie(t, BigInt(e.connectors.size)), e.connectors.values()))
					r(t, i.input), r(t, i.output), t.write(2, i.inputIndex), t.write(2, i.outputIndex);
				for (let r of e.producers.values()) {
					if (r instanceof nV) t.write(2, 0), ia(t, r.recipe);
					else if (r instanceof nY) t.write(2, 1), il(t, r.item);
					else if (r instanceof nX) t.write(2, 2), il(t, r.item);
					else throw Error("Internal ptype error");
					iA(t, r.x), iF(t, r.y), ir(t, r.rate);
				}
				for (let r of (t.write(2, 3), ie(t, BigInt(e.buses.size)), e.buses.values())) {
					iA(t, r.x), iF(t, r.y);
					let { terminals: e } = r;
					ie(t, BigInt(e.length));
					let i = 0;
					for (let r = 0; r < e.length; r++) {
						let o = e[r].rxIn - i;
						if (o < 0) throw Error("WOW");
						let s = e[r].rxOut - i - o;
						ie(t, BigInt(o >>> 0)), ie(t, BigInt(s >>> 0)), n(t, e[r].id), (i += o);
					}
					ie(t, BigInt((r.width - i) >>> 0));
				}
				return t.finish();
			},
			deserialize: function (e) {
				let t = new n7(e),
					r = t.read(6);
				if (0 !== r) return console.warn(`Decode: version mismatch ${r} !== 0`), null;
				let n = ik(),
					i = Number(it(t)),
					o = Number(it(t)),
					s = [],
					a = [],
					l = Number(it(t));
				for (let e = 0; e < l; e++) {
					let e = t.read(i),
						r = t.read(i),
						n = t.read(2),
						o = t.read(2);
					a.push({ inId: e, outId: r, inputIndex: n, outputIndex: o });
				}
				for (;;) {
					let e;
					let r = t.read(2),
						n = null,
						i = null;
					if (3 === r) break;
					0 === r ? (n = iu(t)) : (i = ic(t));
					let o = iO(t),
						a = iB(t),
						l = ii(t);
					if (l.lte(td.ZERO)) return console.warn("Decode: negative or zero rate"), null;
					if (0 === r) {
						if (!n) return console.warn("Decode: missing recipe"), null;
						e = new nV(o, a, l, n);
					} else if (1 === r) {
						if (!i) return console.warn("Decode: missing item"), null;
						e = new nY(o, a, l, i);
					} else {
						if (2 !== r) return console.warn("Decode: internal error"), null;
						if (!i) return console.warn("Decode: missing item"), null;
						e = new nX(o, a, l, i);
					}
					s.push(e);
				}
				let u = [];
				for (let e of a) {
					let t = s[e.inId],
						r = s[e.outId];
					if (!t || !r) return console.warn("Decode: bad producer ref"), null;
					let n = t.outputFlows()[e.inputIndex].item,
						i = r.inputFlows()[e.outputIndex].item;
					if (n !== i)
						return console.warn(`Decode: Connection item mismatch ${n.ClassName} !== ${i.ClassName}`), null;
					let o = new ib(td.ZERO, n, t.id, r.id, e.inputIndex, e.outputIndex);
					u.push(o), t.outputs[o.inputIndex].push(o.id), r.inputs[o.outputIndex].push(o.id);
				}
				let c = [],
					m = Number(it(t));
				for (let e = 0; e < m; e++) {
					let e = iO(t),
						r = iB(t),
						n = Number(it(t)),
						i = 0,
						s = [];
					for (let e = 0; e < n; e++) {
						let e = Number(it(t)),
							r = Number(it(t)),
							n = t.read(o);
						s.push({ rxIn: i + e, rxOut: i + e + r, id: u[n].id }), (i += e);
					}
					let a = i + Number(it(t)),
						l = new iN(e, r, a);
					(l.terminals = s), c.push(l);
				}
				return (
					(n.connectors = new Map(u.map((e) => [e.id, e]))),
					(n.producers = new Map(s.map((e) => [e.id, e]))),
					(n.buses = new Map(c.map((e) => [e.id, e]))),
					iv(n, n.connectors.keys()),
					n
				);
			},
			makeDefault: ik,
		},
		2,
		"_EditorStore",
	);
function iq(e, t) {
	if (e.length !== t.length) return !1;
	for (let r = 0; r < e.length; r++) if (e[r] !== t[r]) return !1;
	return !0;
}
document.documentElement.addEventListener(
	"mouseleave",
	() => {
		iH((e) => {
			e.mouseOver = ix;
		});
	},
	{ passive: !0 },
);
const iM = { select: (e) => [...e.producers.keys()], equal: iq },
	iL = { select: (e) => [...e.connectors.keys()], equal: iq },
	iT = { select: (e) => [...e.buses.keys()], equal: iq },
	iz = (e) => ({
		select: (t) => {
			let r = t.connectors.get(e),
				n = t.producers.get(r.input);
			return nf(n, n.outputAttachPoints[r.inputIndex]);
		},
		equal: nd,
	}),
	iW = (e) => ({
		select: (t) => {
			let r = t.connectors.get(e),
				n = t.producers.get(r.output);
			return nf(n, n.inputAttachPoints[r.outputIndex]);
		},
		equal: nd,
	});
function i$(e, t) {
	return e ? !!t && nd(e.in, t.in) && nd(e.out, t.out) : !t;
}
const ij = (e) => ({
	select: (t) => {
		for (let r of t.buses.values()) {
			let t = r.terminals.find((t) => t.id === e);
			if (t) {
				let e = 0.5 * r.width;
				return { in: { x: r.x + t.rxIn - e, y: r.y }, out: { x: r.x + t.rxOut - e, y: r.y } };
			}
		}
		return null;
	},
	equal: i$,
});
function iG(e) {
	let { mouseOver: t } = e,
		{ type: r } = t;
	switch (r) {
		case "none":
		case "viewport":
			return { type: r };
		case "producer": {
			let n = e.producers.get(t.producerId);
			if (!n) return { type: "none" };
			return { type: r, producer: n };
		}
		case "producer:connection:input": {
			let n = e.producers.get(t.producerId);
			if (!n) return { type: "none" };
			return {
				type: r,
				producer: n,
				index: t.index,
				connectors: n.inputs[t.index].map((t) => e.connectors.get(t)),
				flow: n.inputFlows()[t.index],
			};
		}
		case "producer:connection:output": {
			let n = e.producers.get(t.producerId);
			if (!n) return { type: "none" };
			return {
				type: r,
				producer: n,
				index: t.index,
				connectors: n.outputs[t.index].map((t) => e.connectors.get(t)),
				flow: n.outputFlows()[t.index],
			};
		}
		case "connector": {
			let n;
			let i = e.connectors.get(t.connectorId);
			if (!i) return { type: "none" };
			for (let t of e.buses.values()) {
				let e = t.terminals.find((e) => e.id === i.id);
				if (e) {
					n = t;
					break;
				}
			}
			return { type: r, connector: i, bus: n };
		}
		case "bus": {
			let n = e.buses.get(t.busId);
			if (!n) return { type: "none" };
			return { type: r, bus: n };
		}
	}
}
const iQ = ({ id: e }, t) => {
		let r = iE(t, (t) => t.producers.get(e));
		return (t) => {
			({ id: e } = t);
			let n = r();
			if (!n) return null;
			if (n instanceof nV) {
				let { recipe: e } = n;
				return Y("div", {
					class: "producer-tooltip",
					children: [
						Y("em", { class: "name", children: e.Building.DisplayName }),
						Y("div", { class: "recipe-name", children: e.DisplayName }),
					],
				});
			}
			if (n instanceof nX || n instanceof nY) {
				let { item: e } = n;
				return Y("div", {
					class: "producer-tooltip",
					children: [
						Y("em", { class: "name", children: n instanceof nX ? "Resource Source" : "Resource Sink" }),
						Y("div", { class: "recipe-name", children: e.DisplayName }),
					],
				});
			}
			return null;
		};
	},
	iZ = document.createElement("div");
(iZ.className = "tooltip"), (iZ.style.display = "none");
let iV = null;
function iY({ recipe: e }) {
	return Y("div", {
		class: "recipe-tooltip",
		children: [
			Y("em", { class: "building-name", children: e.Building.DisplayName }),
			Y("div", {
				class: "io",
				children: [
					e.Inputs.map(({ Item: e }) => Y("img", { src: e.Icon })),
					Y("div", { class: "arrow", children: "▶︎" }),
					e.Outputs.map(({ Item: e }) => Y("img", { src: e.Icon })),
					0 > e.Building.PowerConsumption.sign() && Y("img", { src: nc.Icon }),
				],
			}),
		],
	});
}
function iX({ value: e }) {
	let t;
	let r = ns.get(e);
	return r ? Y(iY, { recipe: r }) : (t = e.match(/^\$producer:(\d+)$/)) ? Y(iQ, { id: nh(t[1]) }) : e;
}
async function iJ() {
	if (iV) {
		var e, t;
		let r = await ta(iV, iZ, {
			middleware: [
				(void 0 === e && (e = {}),
				{
					name: "flip",
					options: e,
					async fn(t) {
						var r, n, i, o, s;
						let {
								placement: a,
								middlewareData: l,
								rects: u,
								initialPlacement: c,
								platform: m,
								elements: p,
							} = t,
							{
								mainAxis: d = !0,
								crossAxis: f = !0,
								fallbackPlacements: g,
								fallbackStrategy: I = "bestFit",
								fallbackAxisSideDirection: h = "none",
								flipAlignment: C = !0,
								...R
							} = ex(e, t);
						if (null != (r = l.arrow) && r.alignmentOffset) return {};
						let _ = ek(a),
							y = ek(c) === c,
							w = await (null == m.isRTL ? void 0 : m.isRTL(p.floating)),
							N =
								g ||
								(y || !C
									? [eL(c)]
									: (function (e) {
											let t = eL(e);
											return [eM(e), t, eM(t)];
									  })(c));
						g ||
							"none" === h ||
							N.push(
								...(function (e, t, r, n) {
									let i = eE(e),
										o = (function (e, t, r) {
											let n = ["left", "right"],
												i = ["right", "left"];
											switch (e) {
												case "top":
												case "bottom":
													if (r) return t ? i : n;
													return t ? n : i;
												case "left":
												case "right":
													return t ? ["top", "bottom"] : ["bottom", "top"];
												default:
													return [];
											}
										})(ek(e), "start" === r, n);
									return i && ((o = o.map((e) => e + "-" + i)), t && (o = o.concat(o.map(eM)))), o;
								})(c, C, h, w),
							);
						let b = [c, ...N],
							P = await e$(t, R),
							S = [],
							D = (null == (n = l.flip) ? void 0 : n.overflows) || [];
						if ((d && S.push(P[_]), f)) {
							let e = (function (e, t, r) {
								void 0 === r && (r = !1);
								let n = eE(e),
									i = eH(eq(e)),
									o = eU(i),
									s =
										"x" === i
											? n === (r ? "end" : "start")
												? "right"
												: "left"
											: "start" === n
											? "bottom"
											: "top";
								return t.reference[o] > t.floating[o] && (s = eL(s)), [s, eL(s)];
							})(a, u, w);
							S.push(P[e[0]], P[e[1]]);
						}
						if (((D = [...D, { placement: a, overflows: S }]), !S.every((e) => e <= 0))) {
							let e = ((null == (i = l.flip) ? void 0 : i.index) || 0) + 1,
								t = b[e];
							if (t) return { data: { index: e, overflows: D }, reset: { placement: t } };
							let r =
								null ==
								(o = D.filter((e) => e.overflows[0] <= 0).sort(
									(e, t) => e.overflows[1] - t.overflows[1],
								)[0])
									? void 0
									: o.placement;
							if (!r)
								switch (I) {
									case "bestFit": {
										let e =
											null ==
											(s = D.map((e) => [
												e.placement,
												e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0),
											]).sort((e, t) => e[1] - t[1])[0])
												? void 0
												: s[0];
										e && (r = e);
										break;
									}
									case "initialPlacement":
										r = c;
								}
							if (a !== r) return { reset: { placement: r } };
						}
						return {};
					},
				}),
				(void 0 === t && (t = {}),
				{
					name: "shift",
					options: t,
					async fn(e) {
						let { x: r, y: n, placement: i } = e,
							{
								mainAxis: o = !0,
								crossAxis: s = !1,
								limiter: a = {
									fn: (e) => {
										let { x: t, y: r } = e;
										return { x: t, y: r };
									},
								},
								...l
							} = ex(t, e),
							u = { x: r, y: n },
							c = await e$(e, l),
							m = eq(ek(i)),
							p = eH(m),
							d = u[p],
							f = u[m];
						if (o) {
							let e = d + c["y" === p ? "top" : "left"],
								t = d - c["y" === p ? "bottom" : "right"];
							d = ev(e, eD(d, t));
						}
						if (s) {
							let e = "y" === m ? "top" : "left",
								t = "y" === m ? "bottom" : "right",
								r = f + c[e],
								n = f - c[t];
							f = ev(r, eD(f, n));
						}
						let g = a.fn({ ...e, [p]: d, [m]: f });
						return { ...g, data: { x: g.x - r, y: g.y - n } };
					},
				}),
			],
			strategy: "fixed",
		});
		iZ.style.transform = `translate(${Math.round(r.x)}px,${Math.round(r.y)}px)`;
	}
}
function iK(e, t) {
	e.stopPropagation(), e.preventDefault();
	let r = { x: e.clientX, y: e.clientY };
	function n(e) {
		let n = { x: e.clientX, y: e.clientY },
			o = n.x - r.x,
			s = n.y - r.y;
		t({ x: o, y: s }) || i(), (r = n), iJ();
	}
	function i() {
		document.documentElement.removeEventListener("mouseleave", i),
			document.removeEventListener("mouseup", i, { capture: !0 }),
			document.removeEventListener("mousemove", n, { capture: !0 });
	}
	document.documentElement.addEventListener("mouseleave", i, { passive: !0 }),
		document.addEventListener("mouseup", i, { capture: !0, passive: !0 }),
		document.addEventListener("mousemove", n, { capture: !0, passive: !0 });
}
const i0 = ({ id: e }, t) => {
	let r = iE(t, (t) => t.connectors.get(e)),
		n = iE(t, ij(e)),
		i = iE(t, iz(e)),
		o = iE(t, iW(e));
	return () => {
		let t = r(),
			s = n(),
			a = i(),
			l = o();
		if (s) {
			function u(e, r, n, i) {
				let o = 0.125 * e.x + 0.375 * (e.x + r.x) + 0.375 * (n.x + i.x) + 0.125 * n.x,
					s = 0.125 * e.y + 0.375 * (e.y + r.y) + 0.375 * (n.y + i.y) + 0.125 * n.y;
				return Y(V, {
					children: [
						Y("path", {
							class: "connector",
							d: `M ${e.x} ${e.y} C ${e.x + r.x} ${e.y + r.y} ${n.x + i.x} ${n.y + i.y} ${n.x} ${n.y}`,
						}),
						Y("text", {
							class: "connector-text",
							x: o,
							y: s,
							children: [t.rate.toStringAdaptive(), "/min"],
						}),
					],
				});
			}
			let r = s.in,
				n = s.out;
			return Y("g", {
				onMouseEnter: () =>
					iH((t) => {
						t.mouseOver = { type: "connector", connectorId: e };
					}),
				children: [
					u(a, { x: 200, y: 0 }, r, { x: 0, y: 200 * Math.sign(a.y - r.y) }),
					u(l, { x: -200, y: 0 }, n, { x: 0, y: 200 * Math.sign(l.y - n.y) }),
				],
			});
		}
		{
			let r = l.x - a.x,
				n = l.y - a.y,
				i = 400;
			r > 0 && (i = Math.min(i, 0.5 * i * Math.abs(n / r)));
			let o = Math.max(0.8 * r, i);
			return Y(V, {
				children: [
					Y("path", {
						class: "connector",
						d: `M ${a.x} ${a.y} c ${o} 0 ${r - o} ${n} ${r} ${n}`,
						onMouseEnter: () =>
							iH((t) => {
								t.mouseOver = { type: "connector", connectorId: e };
							}),
					}),
					Y("text", {
						class: "connector-text",
						x: (l.x + a.x) / 2,
						y: (l.y + a.y) / 2,
						children: [t.rate.toStringAdaptive(), "/min"],
					}),
				],
			});
		}
	};
};
function i1(e, ...t) {
	let r, n;
	return () => {
		let i = t.map((e) => e());
		return (
			(r &&
				(function (e, t) {
					for (let r = 0; r < e.length; r++) if (e[r] !== t[r]) return !1;
					return !0;
				})(r, i)) ||
				((r = i), (n = e(...i))),
			n
		);
	};
}
function i2(e, t) {
	let r = e.indexOf(t);
	r >= 0 && e.splice(r, 1);
}
const i5 = (e, t) => t.reduce((t, r) => t.add(e.connectors.get(r).rate), td.ZERO),
	i3 = (e, t, r) => i5(e, t.inputs[r]).sub(t.inputFlows()[r].rate),
	i4 = (e, t, r) => t.outputFlows()[r].rate.sub(i5(e, t.outputs[r])),
	i6 = (e) => (t) => {
		t.producers.set(e.id, e);
	},
	i7 = (e) => (t) => {
		let r = t.producers.get(e);
		for (let e of r.inputs) for (let r of e.slice()) i8(r)(t);
		for (let e of r.outputs) for (let r of e.slice()) i8(r)(t);
		t.producers.delete(e);
	},
	i9 = (e, t) => (r) => {
		let n = r.producers.get(e.producerId),
			i = r.producers.get(t.producerId),
			o = n.outputs[e.outputIndex].some((e) => {
				let n = r.connectors.get(e);
				return n.output === t.producerId && n.outputIndex === t.inputIndex;
			});
		if (o) return;
		let s = new ib(td.ZERO, n.outputFlows()[e.outputIndex].item, n.id, i.id, e.outputIndex, t.inputIndex);
		r.connectors.set(s.id, s),
			n.outputs[e.outputIndex].push(s.id),
			i.inputs[t.inputIndex].push(s.id),
			iv(r, [s.id]);
	},
	i8 = (e) => (t) => {
		let r = t.connectors.get(e),
			n = t.producers.get(r.input).outputs[r.inputIndex],
			i = t.producers.get(r.output).inputs[r.outputIndex];
		i2(n, e), i2(i, e), t.connectors.delete(e), iv(t, [...n, ...i]);
	},
	oe = (e) => (t) => {
		t.buses.set(e.id, e);
	},
	ot = (e) => (t) => {
		t.buses.delete(e);
	},
	or = (e, t) => (r) => {
		let n = r.producers.get(e),
			i = n.outputFlows()[t],
			o = i4(r, n, t);
		if (o.lte(td.ZERO)) return;
		let s = nf(n, n.outputAttachPoints[t]),
			a = new nY(s.x + 200, s.y, o, i.item);
		r.producers.set(a.id, a);
		let l = new ib(o, i.item, e, a.id, t, 0);
		r.connectors.set(l.id, l), n.outputs[t].push(l.id), (a.inputs[0] = [l.id]);
	},
	on = (e, t, r) => (n) => {
		let i = n.producers.get(e),
			o = i.outputFlows()[t],
			s = i4(n, i, t);
		if (s.lte(td.ZERO)) return;
		let a = r.Inputs.findIndex((e) => e.Item.ClassName === o.item.ClassName),
			l = r.Inputs[a].Rate,
			u = s.div(l),
			c = nf(i, i.outputAttachPoints[t]),
			m = new nV(c.x + 300, c.y, u, r);
		n.producers.set(m.id, m);
		let p = new ib(s, o.item, e, m.id, t, a);
		n.connectors.set(p.id, p), i.outputs[t].push(p.id), (m.inputs[a] = [p.id]);
	},
	oi = (e, t) => (r) => {
		let n = r.producers.get(e),
			i = n.inputFlows()[t],
			o = i3(r, n, t).neg();
		if (o.lte(td.ZERO)) return;
		let s = nf(n, n.inputAttachPoints[t]),
			a = new nX(s.x - 200, s.y, o, i.item);
		r.producers.set(a.id, a);
		let l = new ib(o, i.item, a.id, e, 0, t);
		r.connectors.set(l.id, l), (a.outputs[0] = [l.id]), n.inputs[t].push(l.id);
	},
	oo = (e, t, r) => (n) => {
		let i = n.producers.get(e),
			o = i.inputFlows()[t],
			s = i3(n, i, t).neg();
		if (s.lte(td.ZERO)) return;
		let a = r.Outputs.findIndex((e) => e.Item.ClassName === o.item.ClassName),
			l = r.Outputs[a].Rate,
			u = s.div(l),
			c = nf(i, i.inputAttachPoints[t]),
			m = new nV(c.x - 300, c.y, u, r);
		n.producers.set(m.id, m);
		let p = new ib(s, o.item, m.id, e, a, t);
		n.connectors.set(p.id, p), (m.outputs[a] = [p.id]), i.inputs[t].push(p.id);
	},
	os = (e, t) => (r) => {
		let n = r.producers.get(e),
			{ rate: i } = n.inputFlows()[t],
			o = i5(r, n.inputs[t]);
		if (i.gt(o)) {
			let e = n.rate.div(i).mul(o);
			(n.rate = e), iv(r, n.inputsAndOutputs());
			return;
		}
		let s = n.inputs[t].reduce((e, t) => {
			let n = r.connectors.get(t),
				i = r.producers.get(n.input),
				o = i.outputFlows()[n.inputIndex].rate,
				s = i5(r, i.outputs[n.inputIndex]);
			return e.add(o).sub(s);
		}, td.ZERO);
		if (s.sign() > 0) {
			let e = i.add(s),
				t = n.rate.div(i).mul(e);
			(n.rate = t), iv(r, n.inputsAndOutputs());
			return;
		}
	},
	oa = (e, t) => (r) => {
		let n = r.producers.get(e),
			{ rate: i } = n.outputFlows()[t],
			o = i5(r, n.outputs[t]);
		if (i.gt(o)) {
			let e = n.rate.div(i).mul(o);
			(n.rate = e), iv(r, n.inputsAndOutputs());
			return;
		}
		let s = n.outputs[t].reduce((e, t) => {
			let n = r.connectors.get(t),
				i = r.producers.get(n.output),
				o = i.inputFlows()[n.outputIndex].rate,
				s = i5(r, i.inputs[n.outputIndex]);
			return e.add(o).sub(s);
		}, td.ZERO);
		if (s.sign() > 0) {
			let e = i.add(s),
				t = n.rate.div(i).mul(e);
			(n.rate = t), iv(r, n.inputsAndOutputs());
			return;
		}
	},
	ol = (e, t) => (r) => {
		let n = r.connectors.get(e),
			i = r.producers.get(n.input),
			o = r.producers.get(n.output),
			s = i.outputAttachPoints[n.inputIndex],
			a = o.inputAttachPoints[n.outputIndex],
			l = nf(i, s),
			u = nf(o, a),
			c = ng(t, l),
			m = ng(t, u);
		c < m ? oa(i.id, n.inputIndex)(r) : os(o.id, n.outputIndex)(r);
	},
	ou = (e, t) => (r) => {
		let n = r.connectors.get(e),
			i = r.producers.get(n.input),
			o = i.outputs[n.inputIndex];
		if (o.length < 2) return;
		let s = i5(r, o),
			a = n.rate.div(s),
			l = i.clone();
		(l.x = t.x),
			(l.y = t.y),
			(l.rate = l.rate.mul(a)),
			(i.rate = i.rate.sub(l.rate)),
			r.producers.set(l.id, l),
			o.splice(o.indexOf(e), 1),
			(n.input = l.id),
			l.outputs[n.inputIndex].push(e);
	},
	oc = (e, t) => (r) => {
		let n = r.connectors.get(e),
			i = r.producers.get(n.output),
			o = i.inputs[n.outputIndex];
		if (o.length < 2) return;
		let s = i5(r, o),
			a = n.rate.div(s),
			l = i.clone();
		(l.x = t.x),
			(l.y = t.y),
			(l.rate = l.rate.mul(a)),
			(i.rate = i.rate.sub(l.rate)),
			o.splice(o.indexOf(e), 1),
			(n.output = l.id),
			l.inputs[n.outputIndex].push(e);
	},
	om = (e, t) => (r) => {
		let n = r.connectors.get(e),
			i = r.producers.get(n.input),
			o = r.producers.get(n.output),
			s = i.outputAttachPoints[n.inputIndex],
			a = o.inputAttachPoints[n.outputIndex],
			l = nf(i, s),
			u = nf(o, a),
			c = ng(t, l),
			m = ng(t, u);
		c < m ? ou(e, t)(r) : oc(e, t)(r);
	},
	op = (e, t) => (r) => {
		let n = r.producers.get(e),
			i = r.producers.get(t);
		n.rate = n.rate.add(i.rate);
		for (let t = 0; t < n.inputs.length; t++)
			for (let o of i.inputs[t]) {
				let i = r.connectors.get(o),
					s = n.inputs[t].map((e) => r.connectors.get(e)).find((e) => e.input === i.input);
				s
					? ((s.rate = s.rate.add(i.rate)),
					  r.connectors.delete(o),
					  i2(r.producers.get(i.input).outputs[i.inputIndex], o))
					: (n.inputs[t].push(o), (r.connectors.get(o).output = e));
			}
		for (let t = 0; t < n.outputs.length; t++)
			for (let o of i.outputs[t]) {
				let i = r.connectors.get(o),
					s = n.outputs[t].map((e) => r.connectors.get(e)).find((e) => e.output === i.output);
				s
					? ((s.rate = s.rate.add(i.rate)),
					  r.connectors.delete(o),
					  i2(r.producers.get(i.output).inputs[i.outputIndex], o))
					: (n.outputs[t].push(o), (r.connectors.get(o).input = e));
			}
		r.producers.delete(t), iv(r, n.inputsAndOutputs());
	},
	od = (e, t) => (r) => {
		let n = r.buses.get(t),
			i = iz(e).select(r).x,
			o = iW(e).select(r).x,
			{ x: s, width: a } = n,
			l = iI(o - i - 50, 50, a - 100),
			u = (a - 50 - l) / 2,
			c = iI((i + o) / 2, s - u, s + u),
			m = s - a / 2,
			p = c - l / 2 - m;
		n.terminals.splice(iw(n.terminals, p), 0, { rxIn: p, rxOut: c + l / 2 - m, id: e }), (r.wip = { type: "none" });
	},
	of = (e) => "object" == typeof e && null != e && 1 === e.nodeType,
	og = (e, t) => (!t || "hidden" !== e) && "visible" !== e && "clip" !== e,
	oI = (e, t) => {
		if (e.clientHeight < e.scrollHeight || e.clientWidth < e.scrollWidth) {
			let r = getComputedStyle(e, null);
			return (
				og(r.overflowY, t) ||
				og(r.overflowX, t) ||
				((e) => {
					let t = ((e) => {
						if (!e.ownerDocument || !e.ownerDocument.defaultView) return null;
						try {
							return e.ownerDocument.defaultView.frameElement;
						} catch (e) {
							return null;
						}
					})(e);
					return !!t && (t.clientHeight < e.scrollHeight || t.clientWidth < e.scrollWidth);
				})(e)
			);
		}
		return !1;
	},
	oh = (e, t, r, n, i, o, s, a) =>
		(o < e && s > t) || (o > e && s < t)
			? 0
			: (o <= e && a <= r) || (s >= t && a >= r)
			? o - e - n
			: (s > t && a < r) || (o < e && a > r)
			? s - t + i
			: 0,
	oC = (e) => {
		let t = e.parentElement;
		return null == t ? e.getRootNode().host || null : t;
	},
	oR = (e, t) => {
		var r, n, i, o;
		if ("undefined" == typeof document) return [];
		let { scrollMode: s, block: a, inline: l, boundary: u, skipOverflowHiddenElements: c } = t,
			m = "function" == typeof u ? u : (e) => e !== u;
		if (!of(e)) throw TypeError("Invalid target");
		let p = document.scrollingElement || document.documentElement,
			d = [],
			f = e;
		for (; of(f) && m(f); ) {
			if ((f = oC(f)) === p) {
				d.push(f);
				break;
			}
			(null != f && f === document.body && oI(f) && !oI(document.documentElement)) ||
				(null != f && oI(f, c) && d.push(f));
		}
		let g = null != (n = null == (r = window.visualViewport) ? void 0 : r.width) ? n : innerWidth,
			I = null != (o = null == (i = window.visualViewport) ? void 0 : i.height) ? o : innerHeight,
			{ scrollX: h, scrollY: C } = window,
			{ height: R, width: _, top: y, right: w, bottom: N, left: b } = e.getBoundingClientRect(),
			P = "start" === a || "nearest" === a ? y : "end" === a ? N : y + R / 2,
			S = "center" === l ? b + _ / 2 : "end" === l ? w : b,
			D = [];
		for (let e = 0; e < d.length; e++) {
			let t = d[e],
				{ height: r, width: n, top: i, right: o, bottom: u, left: c } = t.getBoundingClientRect();
			if ("if-needed" === s && y >= 0 && b >= 0 && N <= I && w <= g && y >= i && N <= u && b >= c && w <= o)
				break;
			let m = getComputedStyle(t),
				f = parseInt(m.borderLeftWidth, 10),
				v = parseInt(m.borderTopWidth, 10),
				A = parseInt(m.borderRightWidth, 10),
				F = parseInt(m.borderBottomWidth, 10),
				O = 0,
				B = 0,
				x = "offsetWidth" in t ? t.offsetWidth - t.clientWidth - f - A : 0,
				k = "offsetHeight" in t ? t.offsetHeight - t.clientHeight - v - F : 0,
				E = "offsetWidth" in t ? (0 === t.offsetWidth ? 0 : n / t.offsetWidth) : 0,
				H = "offsetHeight" in t ? (0 === t.offsetHeight ? 0 : r / t.offsetHeight) : 0;
			if (p === t)
				(O =
					"start" === a
						? P
						: "end" === a
						? P - I
						: "nearest" === a
						? oh(C, C + I, I, v, F, C + P, C + P + R, R)
						: P - I / 2),
					(B =
						"start" === l
							? S
							: "center" === l
							? S - g / 2
							: "end" === l
							? S - g
							: oh(h, h + g, g, f, A, h + S, h + S + _, _)),
					(O = Math.max(0, O + C)),
					(B = Math.max(0, B + h));
			else {
				(O =
					"start" === a
						? P - i - v
						: "end" === a
						? P - u + F + k
						: "nearest" === a
						? oh(i, u, r, v, F + k, P, P + R, R)
						: P - (i + r / 2) + k / 2),
					(B =
						"start" === l
							? S - c - f
							: "center" === l
							? S - (c + n / 2) + x / 2
							: "end" === l
							? S - o + A + x
							: oh(c, o, n, f, A + x, S, S + _, _));
				let { scrollLeft: e, scrollTop: s } = t;
				(O = Math.max(0, Math.min(s + O / H, t.scrollHeight - r / H + k))),
					(B = Math.max(0, Math.min(e + B / E, t.scrollWidth - n / E + x))),
					(P += s - O),
					(S += e - B);
			}
			D.push({ el: t, top: O, left: B });
		}
		return D;
	},
	o_ = (e) =>
		!1 === e
			? { block: "end", inline: "nearest" }
			: e === Object(e) && 0 !== Object.keys(e).length
			? e
			: { block: "start", inline: "nearest" };
function oy(e) {
	e?.focus();
}
function ow(e, t) {
	let r = "",
		n = null,
		i = null,
		o = (e) => (s = e),
		s = null;
	return ({ items: e, value: a, changeValue: l, onTentative: u }) => {
		let { testRegex: c, highlightRegex: m } = i_(r),
			p = e.filter((e) => c.test(e.name)),
			d = p.find((e) => e.name.length === r.length);
		return (
			eP(t, () => {
				if (n && n !== i) {
					let e = s?.querySelector(".tentative");
					e &&
						(function (e, t) {
							if (
								!e.isConnected ||
								!((e) => {
									let t = e;
									for (; t && t.parentNode; ) {
										if (t.parentNode === document) return !0;
										t = t.parentNode instanceof ShadowRoot ? t.parentNode.host : t.parentNode;
									}
									return !1;
								})(e)
							)
								return;
							if ("object" == typeof t && "function" == typeof t.behavior) return t.behavior(oR(e, t));
							let r = "boolean" == typeof t || null == t ? void 0 : t.behavior;
							for (let { el: n, top: i, left: o } of oR(e, o_(t)))
								n.scroll({ top: i, left: o, behavior: r });
						})(e, { scrollMode: "if-needed" });
				}
				i = n;
			}),
			Y("div", {
				class: "chooser",
				children: [
					Y("form", {
						onSubmit: (e) => {
							e.preventDefault(), n ? l(n) : 1 === p.length ? l(p[0]) : d && l(d);
						},
						children: Y("input", {
							type: "text",
							ref: oy,
							value: r,
							onInput: (e) => {
								(r = e.currentTarget.value), eS(t);
								let { testRegex: i } = i_(r);
								n && !i.test(r) && ((n = null), u?.(null));
							},
							onKeyDown: (e) => {
								if (
									("ArrowUp" === e.key || "ArrowDown" === e.key) &&
									(e.preventDefault(), p.length > 0)
								) {
									let r = p.indexOf(n);
									(r += "ArrowDown" === e.key ? 1 : r < 0 ? p.length : p.length - 1),
										(r %= p.length),
										(n = p[r]),
										eS(t),
										u?.(p[r]);
								}
							},
						}),
					}),
					Y("div", {
						class: "scroll",
						ref: o,
						tabIndex: -1,
						children: p.map(function (e) {
							let { adornment: t, name: r } = e,
								i = e === a ? "item selected" : e === n ? "item tentative" : "item";
							return Y("div", {
								class: i,
								onClick: () => l(e),
								children: [
									Y("div", { class: "adornment", children: t }),
									Y("div", { class: "text", children: iy(r, m) }),
								],
							});
						}),
					}),
				],
			})
		);
	};
}
const { useSelector: oN, update: ob, getStateRaw: oP } = nJ([]),
	oS = (e, t) => {
		let r = oN(t, (e) => e[0]);
		return () => {
			let e = r();
			if (!e) return null;
			function t(e) {
				ob((t) => {
					t.shift()?.resolve(e);
				});
			}
			return Y("div", {
				class: "prompt-backdrop",
				onClick: (e) => {
					e.target === e.currentTarget && t(null);
				},
				children: Y("div", {
					class: "prompt",
					children: [
						Y("div", { class: "title", children: e.item.title }),
						Y("div", { class: "form", children: e.item.render(t) }),
					],
				}),
			});
		};
	},
	oD = (e) =>
		new Promise((t) =>
			ob((r) => {
				r.push({ item: e, resolve: t });
			}),
		);
document.addEventListener(
	"keydown",
	(e) => {
		"Escape" === e.key &&
			ob((e) => {
				e.shift()?.resolve(null);
			});
	},
	{ capture: !0, passive: !0 },
);
const ov = () => !!oP()[0];
function oA(e, t, r) {
	let n = e.get(t);
	n || e.set(t, (n = [])), n.push(r);
}
const oF = new Map(),
	oO = new Map();
for (const e of no) {
	for (let t of e.Inputs) oA(oO, t.Item, e);
	for (let t of e.Outputs) oA(oF, t.Item, e);
}
const oB = (e) => Y("img", { class: "item-chooser-image", src: e.Icon }),
	ox = (e) => ({
		adornment: Y("div", {
			class: "recipe-chooser-image",
			children: [
				e.Inputs.map((e) => oB(e.Item)),
				Y("span", { class: "arrow", children: "▶︎" }),
				e.Outputs.map((e) => oB(e.Item)),
			],
		}),
		name: e.DisplayName,
		recipe: e,
	}),
	ok = nm.map((e) => ({
		adornment: oB(e),
		name: e.DisplayName,
		item: e,
		consumingRecipes: oO.get(e)?.map(ox),
		producingRecipes: (e === nc ? no.filter((e) => 0 > e.Building.PowerConsumption.sign()) : oF.get(e))?.map(ox),
	})),
	oE = {
		adornment: oB(nc),
		name: nc.DisplayName,
		item: nc,
		consumingRecipes: [],
		producingRecipes: no.filter((e) => 0 > e.Building.PowerConsumption.sign()).map(ox),
	};
ok.push(oE);
const oH = ({ type: e, onConfirm: t }, r) => {
		let n = null,
			i = null;
		return () => {
			let o = ok.filter((t) => ("input" === e ? t.consumingRecipes : t.producingRecipes)),
				s = n?.["input" === e ? "consumingRecipes" : "producingRecipes"];
			return Y(V, {
				children: [
					Y(ow, {
						items: o,
						value: n,
						changeValue: function (i) {
							let o = i?.["input" === e ? "consumingRecipes" : "producingRecipes"];
							o?.length === 1 ? t(o[0].recipe) : ((n = i), eS(r));
						},
					}),
					s &&
						Y(V, {
							children: [
								Y("div", { class: "recipe-chooser-divider" }),
								Y(ow, {
									items: s,
									value: null,
									changeValue: (e) => t(e?.recipe ?? null),
									onTentative: (e) => {
										(i = e?.recipe ?? null), eS(r);
									},
								}),
							],
						}),
					Y("div", {
						class: "dialog-buttons",
						children: [
							Y("button", { onClick: () => t(null), children: "Cancel" }),
							Y("button", { disabled: !s || !i, onClick: () => t(i), children: "Ok" }),
						],
					}),
				],
			});
		};
	},
	oU = async (e, t) => {
		let r = (t ?? nr).map((e) => ({ adornment: oB(e), name: e.DisplayName, item: e }));
		return oD({
			title: e,
			render: (e) => Y(ow, { items: r, value: null, changeValue: (t) => e(t?.item ?? null) }),
		});
	},
	oq = () => oD({ title: "Choose output item and recipe:", render: (e) => Y(oH, { type: "output", onConfirm: e }) }),
	oM = async (e) => {
		if (!e) return null;
		if (1 === e.length) return e[0];
		let t = e.map(ox);
		return oD({
			title: "Choose recipe:",
			render: (e) => Y(ow, { items: t, value: null, changeValue: (t) => e(t?.recipe ?? null) }),
		});
	},
	oL = (e) => !!oF.get(e),
	oT = async (e) => {
		let t = oF.get(e);
		return oM(t);
	},
	oz = (e) => !!oO.get(e),
	oW = async (e) => {
		let t = oO.get(e);
		return oM(t);
	},
	o$ = (e, t) => {
		let r = (t) => {
			e.disabled || ov() || t.key !== e.keyName || e.onAct(!1);
		};
		return (
			document.addEventListener("keypress", r, { passive: !0 }),
			eb(t, () => document.removeEventListener("keypress", r)),
			(t) =>
				Y("button", {
					disabled: (e = t).disabled,
					onClick: () => !ov() && e.onAct(!0),
					children: [e.keyName, ": ", e.children],
				})
		);
	};
function oj(e, t, r, n) {
	var i = Error.call(this, e);
	return (
		Object.setPrototypeOf && Object.setPrototypeOf(i, oj.prototype),
		(i.expected = t),
		(i.found = r),
		(i.location = n),
		(i.name = "SyntaxError"),
		i
	);
}
function oG(e, t, r) {
	return ((r = r || " "), e.length > t) ? e : ((t -= e.length), e + (r += r.repeat(t)).slice(0, t));
}
!(function (e, t) {
	function r() {
		this.constructor = e;
	}
	(r.prototype = t.prototype), (e.prototype = new r());
})(oj, Error),
	(oj.prototype.format = function (e) {
		var t = "Error: " + this.message;
		if (this.location) {
			var r,
				n = null;
			for (r = 0; r < e.length; r++)
				if (e[r].source === this.location.source) {
					n = e[r].text.split(/\r\n|\n|\r/g);
					break;
				}
			var i = this.location.start,
				o =
					this.location.source && "function" == typeof this.location.source.offset
						? this.location.source.offset(i)
						: i,
				s = this.location.source + ":" + o.line + ":" + o.column;
			if (n) {
				var a = this.location.end,
					l = oG("", o.line.toString().length, " "),
					u = n[i.line - 1],
					c = (i.line === a.line ? a.column : u.length + 1) - i.column || 1;
				t +=
					"\n --> " +
					s +
					"\n" +
					l +
					" |\n" +
					o.line +
					" | " +
					u +
					"\n" +
					l +
					" | " +
					oG("", i.column - 1, " ") +
					oG("", c, "^");
			} else t += "\n at " + s;
		}
		return t;
	}),
	(oj.buildMessage = function (e, t) {
		var r = {
			literal: function (e) {
				return '"' + i(e.text) + '"';
			},
			class: function (e) {
				var t = e.parts.map(function (e) {
					return Array.isArray(e) ? o(e[0]) + "-" + o(e[1]) : o(e);
				});
				return "[" + (e.inverted ? "^" : "") + t.join("") + "]";
			},
			any: function () {
				return "any character";
			},
			end: function () {
				return "end of input";
			},
			other: function (e) {
				return e.description;
			},
		};
		function n(e) {
			return e.charCodeAt(0).toString(16).toUpperCase();
		}
		function i(e) {
			return e
				.replace(/\\/g, "\\\\")
				.replace(/"/g, '\\"')
				.replace(/\0/g, "\\0")
				.replace(/\t/g, "\\t")
				.replace(/\n/g, "\\n")
				.replace(/\r/g, "\\r")
				.replace(/[\x00-\x0F]/g, function (e) {
					return "\\x0" + n(e);
				})
				.replace(/[\x10-\x1F\x7F-\x9F]/g, function (e) {
					return "\\x" + n(e);
				});
		}
		function o(e) {
			return e
				.replace(/\\/g, "\\\\")
				.replace(/\]/g, "\\]")
				.replace(/\^/g, "\\^")
				.replace(/-/g, "\\-")
				.replace(/\0/g, "\\0")
				.replace(/\t/g, "\\t")
				.replace(/\n/g, "\\n")
				.replace(/\r/g, "\\r")
				.replace(/[\x00-\x0F]/g, function (e) {
					return "\\x0" + n(e);
				})
				.replace(/[\x10-\x1F\x7F-\x9F]/g, function (e) {
					return "\\x" + n(e);
				});
		}
		function s(e) {
			return r[e.type](e);
		}
		return (
			"Expected " +
			(function (e) {
				var t,
					r,
					n = e.map(s);
				if ((n.sort(), n.length > 0)) {
					for (t = 1, r = 1; t < n.length; t++) n[t - 1] !== n[t] && ((n[r] = n[t]), r++);
					n.length = r;
				}
				switch (n.length) {
					case 1:
						return n[0];
					case 2:
						return n[0] + " or " + n[1];
					default:
						return n.slice(0, -1).join(", ") + ", or " + n[n.length - 1];
				}
			})(e) +
			" but " +
			(t ? '"' + i(t) + '"' : "end of input") +
			" found."
		);
	});
class oQ extends Error {
	location;
	constructor(e) {
		super(), (this.location = e);
	}
}
function oZ(e) {
	if (!e) return { value: null, error: !1, message: "Enter a number or expression.", offset: null };
	let t = (function (e) {
		try {
			let t = (function (e, t) {
					var r,
						n,
						i,
						o,
						s,
						a,
						l,
						u,
						c = {},
						m = (t = void 0 !== t ? t : {}).grammarSource,
						p = { Root: T },
						d = T,
						f = /^[0-9]/,
						g = /^[eE]/,
						I = /^[+\-]/,
						h = /^[*\/]/,
						C = /^[ ]/,
						R = q([["0", "9"]], !1, !1),
						_ = U(".", !1),
						y = q(["e", "E"], !1, !1),
						w = q(["+", "-"], !1, !1),
						N = U("(", !1),
						b = U(")", !1),
						P = q(["*", "/"], !1, !1),
						S = q([" "], !1, !1),
						D = function (e) {
							return Z(H());
						},
						v = function (e, t, r) {
							return { d: t, v: r };
						},
						A = function (e) {
							return Z(H());
						},
						F = function (e, t, r) {
							return { d: t, v: r };
						},
						O = 0,
						B = 0,
						x = [{ line: 1, column: 1 }],
						k = 0,
						E = [];
					if ("startRule" in t) {
						if (!(t.startRule in p)) throw Error("Can't start parsing from rule \"" + t.startRule + '".');
						d = p[t.startRule];
					}
					function H() {
						return e.substring(B, O);
					}
					function U(e, t) {
						return { type: "literal", text: e, ignoreCase: t };
					}
					function q(e, t, r) {
						return { type: "class", parts: e, inverted: t, ignoreCase: r };
					}
					function M(t) {
						var r,
							n = x[t];
						if (n) return n;
						for (r = t - 1; !x[r]; ) r--;
						for (n = { line: (n = x[r]).line, column: n.column }; r < t; )
							10 === e.charCodeAt(r) ? (n.line++, (n.column = 1)) : n.column++, r++;
						return (x[t] = n), n;
					}
					function L(e) {
						O < k || (O > k && ((k = O), (E = [])), E.push(e));
					}
					function T() {
						var e, t;
						return ((e = O), Q(), (t = G()) !== c) ? (Q(), (B = e), (e = t)) : ((O = e), (e = c)), e;
					}
					function z() {
						var t, r, n, i, o, s, a;
						for (
							t = O,
								r = O,
								n = O,
								i = [],
								f.test(e.charAt(O)) ? ((o = e.charAt(O)), O++) : ((o = c), L(R));
							o !== c;

						)
							i.push(o), f.test(e.charAt(O)) ? ((o = e.charAt(O)), O++) : ((o = c), L(R));
						if ((46 === e.charCodeAt(O) ? ((o = "."), O++) : ((o = c), L(_)), o !== c)) {
							for (s = [], f.test(e.charAt(O)) ? ((a = e.charAt(O)), O++) : ((a = c), L(R)); a !== c; )
								s.push(a), f.test(e.charAt(O)) ? ((a = e.charAt(O)), O++) : ((a = c), L(R));
							n = i = [i, o, s];
						} else (O = n), (n = c);
						if (n === c) {
							if (((n = []), f.test(e.charAt(O)) ? ((i = e.charAt(O)), O++) : ((i = c), L(R)), i !== c))
								for (; i !== c; )
									n.push(i), f.test(e.charAt(O)) ? ((i = e.charAt(O)), O++) : ((i = c), L(R));
							else n = c;
						}
						return (
							(r = n !== c ? e.substring(r, O) : n) !== c && ((B = t), (r = Z("const", { value: r }))), r
						);
					}
					function W() {
						var t, r, n, i, o;
						return (
							(t = (function () {
								var t, r, n, i, o, s, a, l;
								if (((t = O), (r = z()) !== c)) {
									if ((g.test(e.charAt(O)) ? ((n = e.charAt(O)), O++) : ((n = c), L(y)), n !== c)) {
										if (
											((i = O),
											(o = O),
											I.test(e.charAt(O)) ? ((s = e.charAt(O)), O++) : ((s = c), L(w)),
											s === c && (s = null),
											(a = []),
											f.test(e.charAt(O)) ? ((l = e.charAt(O)), O++) : ((l = c), L(R)),
											l !== c)
										)
											for (; l !== c; )
												a.push(l),
													f.test(e.charAt(O)) ? ((l = e.charAt(O)), O++) : ((l = c), L(R));
										else a = c;
										(a !== c ? (o = s = [s, a]) : ((O = o), (o = c)),
										(i = o !== c ? e.substring(i, O) : o) !== c)
											? ((B = t), (t = Z("exp", { value: i, child: r })))
											: ((O = t), (t = c));
									} else (O = t), (t = c);
								} else (O = t), (t = c);
								return t;
							})()) === c &&
								(t = z()) === c &&
								(((r = O),
								40 === e.charCodeAt(O) ? ((n = "("), O++) : ((n = c), L(N)),
								n !== c &&
									(Q(),
									(i = G()) !== c &&
										(Q(), 41 === e.charCodeAt(O) ? ((o = ")"), O++) : ((o = c), L(b)), o !== c)))
									? ((B = r), (r = i))
									: ((O = r), (r = c)),
								(t = r)),
							t
						);
					}
					function $() {
						var t, r, n, i, o;
						return (
							(t = W()) === c &&
								(((r = O),
								I.test(e.charAt(O)) ? ((n = e.charAt(O)), O++) : ((n = c), L(w)),
								n !== c && (Q(), (i = W()) !== c))
									? ((B = r), (o = n), (r = Z("uop", { child: i, op: o })))
									: ((O = r), (r = c)),
								(t = r)),
							t
						);
					}
					function j() {
						var t;
						return (
							(t = (function () {
								var t, r, n, i, o, s, a, l;
								if (((t = O), (r = $()) !== c)) {
									if (
										((n = []),
										(i = O),
										Q(),
										(o = O),
										h.test(e.charAt(O)) ? ((s = e.charAt(O)), O++) : ((s = c), L(P)),
										s !== c && ((B = o), (s = D(r))),
										(o = s) !== c
											? ((s = Q()),
											  (a = $()) !== c ? ((B = i), (i = v(r, o, a))) : ((O = i), (i = c)))
											: ((O = i), (i = c)),
										i !== c)
									)
										for (; i !== c; )
											n.push(i),
												(i = O),
												Q(),
												(o = O),
												h.test(e.charAt(O)) ? ((s = e.charAt(O)), O++) : ((s = c), L(P)),
												s !== c && ((B = o), (s = D(r))),
												(o = s) !== c
													? ((s = Q()),
													  (a = $()) !== c
															? ((B = i), (i = v(r, o, a)))
															: ((O = i), (i = c)))
													: ((O = i), (i = c));
									else n = c;
									n !== c
										? ((B = t),
										  (t = Z("binop", {
												children: [r, ...(l = n).map((e) => e.v)],
												ops: l.map((e) => e.d),
										  })))
										: ((O = t), (t = c));
								} else (O = t), (t = c);
								return t;
							})()) === c && (t = $()),
							t
						);
					}
					function G() {
						var t;
						return (
							(t = (function () {
								var t, r, n, i, o, s, a, l;
								if (((t = O), (r = j()) !== c)) {
									if (
										((n = []),
										(i = O),
										Q(),
										(o = O),
										I.test(e.charAt(O)) ? ((s = e.charAt(O)), O++) : ((s = c), L(w)),
										s !== c && ((B = o), (s = A(r))),
										(o = s) !== c
											? ((s = Q()),
											  (a = j()) !== c ? ((B = i), (i = F(r, o, a))) : ((O = i), (i = c)))
											: ((O = i), (i = c)),
										i !== c)
									)
										for (; i !== c; )
											n.push(i),
												(i = O),
												Q(),
												(o = O),
												I.test(e.charAt(O)) ? ((s = e.charAt(O)), O++) : ((s = c), L(w)),
												s !== c && ((B = o), (s = A(r))),
												(o = s) !== c
													? ((s = Q()),
													  (a = j()) !== c
															? ((B = i), (i = F(r, o, a)))
															: ((O = i), (i = c)))
													: ((O = i), (i = c));
									else n = c;
									n !== c
										? ((B = t),
										  (t = Z("binop", {
												children: [r, ...(l = n).map((e) => e.v)],
												ops: l.map((e) => e.d),
										  })))
										: ((O = t), (t = c));
								} else (O = t), (t = c);
								return t;
							})()) === c && (t = j()),
							t
						);
					}
					function Q() {
						var t, r;
						for (t = [], C.test(e.charAt(O)) ? ((r = e.charAt(O)), O++) : ((r = c), L(S)); r !== c; )
							t.push(r), C.test(e.charAt(O)) ? ((r = e.charAt(O)), O++) : ((r = c), L(S));
						return t;
					}
					let Z = (e, t) => ({ type: e, offset: B, ...t });
					if ((u = d()) !== c && O === e.length) return u;
					throw (
						(u !== c && O < e.length && L({ type: "end" }),
						(a = E),
						(l = k < e.length ? e.charAt(k) : null),
						(r = k),
						(n = k < e.length ? k + 1 : k),
						(i = M(r)),
						(o = M(n)),
						(s = {
							source: m,
							start: { offset: r, line: i.line, column: i.column },
							end: { offset: n, line: o.line, column: o.column },
						}),
						new oj(oj.buildMessage(a, l), a, l, s))
					);
				})(e),
				r = (function e(t) {
					switch (t.type) {
						case "const": {
							let { value: e } = t;
							return (
								e.startsWith(".") && (e = "0" + e), e.endsWith(".") && (e = e.slice(0, -1)), td.parse(e)
							);
						}
						case "exp": {
							let r = Number(t.value),
								n = td.ONE;
							return (
								r > 0
									? (n = td.fromBigInts(BigInt("1".padEnd(r + 1, "0")), 1n))
									: r < 0 && (n = td.fromBigInts(1n, BigInt("1".padEnd(-r + 1, "0")))),
								e(t.child).mul(n)
							);
						}
						case "uop": {
							let r = e(t.child);
							return "-" === t.op && (r = r.neg()), r;
						}
						case "binop": {
							let r = e(t.children[0]);
							for (let n = 0; n < t.ops.length; n++) {
								let i = t.ops[n].type,
									o = e(t.children[n + 1]);
								switch (i) {
									case "*":
										r = r.mul(o);
										break;
									case "/":
										if (o.eq(td.ZERO)) throw new oQ(t.ops[n].offset);
										r = r.div(o);
										break;
									case "+":
										r = r.add(o);
										break;
									case "-":
										r = r.sub(o);
								}
							}
							return r;
						}
					}
				})(t);
			return { ok: !0, value: r };
		} catch (e) {
			if (e instanceof oj) return { ok: !1, message: "Parse error", offset: e.location.start.offset };
			if (e instanceof oQ) return { ok: !1, message: "Division by zero", offset: e.location };
			throw e;
		}
	})(e);
	return t.ok
		? t.value.lte(td.ZERO)
			? { value: null, error: !0, message: `${t.value.toFixed(1)} is not positive.`, offset: null }
			: { value: t.value, error: !1, message: null, offset: null }
		: { value: null, error: !0, message: t.message, offset: t.offset };
}
const oV = (e, t) => {
		let r = "",
			n = oZ("");
		return ({ onChange: e }) => {
			let i =
					null != n.offset &&
					Y("span", {
						class: "underlay",
						children: [" ".repeat(n.offset), Y("span", { class: "error", children: " " })],
					}),
				o = Y("span", {
					class: "lower-text",
					children: Y("span", { class: n.error ? "error" : void 0, children: n.message || "\xa0" }),
				});
			return Y("div", {
				class: "expression-input",
				children: [
					i,
					Y("input", {
						type: "text",
						ref: oy,
						value: r,
						onInput: (i) => {
							(n = oZ((r = i.currentTarget.value))), eS(t), n.value && e(n.value);
						},
					}),
					o,
				],
			});
		};
	},
	oY = ({ producer: e, onConfirm: t }, r) => {
		let n = e.rate;
		function i(e) {
			(n = e), eS(r);
		}
		return (r) => {
			({ producer: e, onConfirm: t } = r);
			let o = Z(e, (e) => {
					e.rate = n;
				}),
				s = (e) =>
					Y("div", {
						class: "flow",
						children: [
							Y("img", { src: e.item.Icon }),
							Y("span", { children: [e.rate.toFixed(2), "/min"] }),
						],
					});
			return Y("div", {
				class: "building-rate-chooser",
				children: [
					Y("form", {
						onSubmit: (e) => {
							e.preventDefault(), t(n);
						},
						children: Y(oV, { onChange: i }),
					}),
					Y("div", {
						class: "display",
						children: [
							Y("div", { class: "flows", children: o.inputFlows().map(s) }),
							Y("div", {
								class: "rate",
								children: [
									Y("span", { class: "num", children: [n.toFixed(2), "x"] }),
									Y("span", { class: "ratio", children: n.toRatioString() }),
								],
							}),
							Y("div", { class: "flows", children: o.outputFlows().map(s) }),
						],
					}),
					Y("div", {
						class: "dialog-buttons",
						children: [
							Y("button", { onClick: () => t(null), children: "Cancel" }),
							Y("button", { onClick: () => t(n), children: "Ok" }),
						],
					}),
				],
			});
		};
	},
	oX = ({ producer: e, onConfirm: t }, r) => {
		let n = e.rate;
		function i(e) {
			(n = e), eS(r);
		}
		return (r) => {
			({ producer: e, onConfirm: t } = r);
			let o = Z(e, (e) => {
					e.rate = n;
				}),
				s = (e) => e.length > 0 && Y("img", { src: e[0].item.Icon });
			return Y("div", {
				class: "source-sink-rate-chooser",
				children: [
					Y("form", {
						onSubmit: (e) => {
							e.preventDefault(), t(n);
						},
						children: Y(oV, { onChange: i }),
					}),
					Y("div", {
						class: "display",
						children: [
							s(o.inputFlows()),
							Y("div", {
								class: "rate",
								children: [
									Y("div", { class: "num", children: [n.toFixed(2), "/min"] }),
									Y("div", { class: "ratio", children: n.toRatioString() }),
								],
							}),
							s(o.outputFlows()),
						],
					}),
					Y("div", {
						class: "dialog-buttons",
						children: [
							Y("button", { onClick: () => t(null), children: "Cancel" }),
							Y("button", { onClick: () => t(n), children: "Ok" }),
						],
					}),
				],
			});
		};
	},
	oJ = (e) => oD({ title: "Choose new rate.", render: (t) => Y(oY, { producer: e, onConfirm: t }) }),
	oK = (e) => oD({ title: "Choose new rate.", render: (t) => Y(oX, { producer: e, onConfirm: t }) }),
	o0 = ({ rate: e, item: t, onConfirm: r, isOutput: n }, i) => {
		let o = e;
		function s(e) {
			(o = e), eS(i);
		}
		return (i) => (
			({ rate: e, item: t, onConfirm: r, isOutput: n } = i),
			Y("div", {
				class: "source-sink-rate-chooser",
				children: [
					Y("form", {
						onSubmit: (e) => {
							e.preventDefault(), r(o);
						},
						children: Y(oV, { onChange: s }),
					}),
					Y("div", {
						class: "display",
						children: [
							!n && Y("img", { src: t.Icon }),
							Y("div", {
								class: "rate",
								children: [
									Y("div", {
										class: "num",
										children: (function () {
											if ("unlimited" === o) return n ? "Maximize" : "Unlimited";
											let e = t === nc ? " MW" : "/min";
											return o.toFixed(2) + e;
										})(),
									}),
									Y("div", { class: "ratio", children: "unlimited" === o ? "" : o.toRatioString() }),
								],
							}),
							n && Y("img", { src: t.Icon }),
						],
					}),
					Y("div", {
						class: "dialog-buttons",
						children: [
							Y("button", { onClick: () => r("unlimited"), children: n ? "Maximize" : "Unlimited" }),
							Y("button", { onClick: () => r(null), children: "Cancel" }),
							Y("button", { onClick: () => r(o), children: "Ok" }),
						],
					}),
				],
			})
		);
	},
	o1 = (e, t, r) =>
		oD({ title: "Choose new rate.", render: (n) => Y(o0, { rate: e, item: t, onConfirm: n, isOutput: r }) }),
	o2 = (e, t) => {
		let r = null,
			n = iE(t, iG),
			i = iE(t, (e) => e.wip),
			o = iE(t, (e) => "connector:bus" === e.wip.type && e.connectors.get(e.wip.connectorId).item.IsPiped);
		function s(e) {
			let t = r;
			if (e || !t) return iU().viewport.center;
			let { zoom: n, center: i } = iU().viewport,
				o = window.innerWidth / 2,
				s = window.innerHeight / 2,
				a = t.x - o,
				l = t.y - s;
			return { x: a / n - i.x, y: l / n - i.y };
		}
		eP(t, () => {
			function e(e) {
				"Escape" === e.key &&
					iH((e) => {
						e.wip = { type: "none" };
					});
			}
			document.addEventListener("keydown", e, { passive: !0, capture: !0 }),
				eb(t, () => {
					document.removeEventListener("keydown", e, { capture: !0 });
				});
		}),
			eP(t, () => {
				function e() {
					r = null;
				}
				document.documentElement.addEventListener("mouseleave", e, { passive: !0 }),
					document.addEventListener(
						"mousemove",
						function (e) {
							r = { x: e.clientX, y: e.clientY };
						},
						{ capture: !0, passive: !0 },
					),
					eb(t, () => {
						window.removeEventListener("blur", e, { capture: !0 }),
							document.documentElement.removeEventListener("mouseleave", e);
					});
			});
		let a = {
			none: () => null,
			viewport: (e, t) =>
				"none" !== t.type
					? null
					: Y(V, {
							children: [
								Y(o$, {
									keyName: "b",
									onAct: async (e) => {
										let t = ih(s(e), id, ig),
											r = await oq();
										r && iH(i6(new nV(t.x, t.y, td.ONE, r)));
									},
									children: "Add builder",
								}),
								Y(o$, {
									keyName: "u",
									onAct: async (e) => {
										let t = ih(s(e), id, ig),
											r = await oU("Choose item for source:");
										r && iH(i6(new nX(t.x, t.y, nC, r)));
									},
									children: "Add source",
								}),
								Y(o$, {
									keyName: "k",
									onAct: async (e) => {
										let t = ih(s(e), id, ig),
											r = await oU("Choose item for sink:");
										r && iH(i6(new nY(t.x, t.y, nC, r)));
									},
									children: "Add Sink",
								}),
								Y(o$, {
									keyName: "s",
									onAct: (e) => {
										let t = ih(s(e), id, ig),
											r = new iN(t.x, t.y, 300);
										iH(oe(r));
									},
									children: "Add Bus",
								}),
							],
					  }),
			producer: (e, t) =>
				"none" !== t.type
					? "producer:merge" === t.type
						? Y(o$, {
								keyName: "m",
								onAct: () => {
									e.producer.canCombineWith(iU().producers.get(t.producerId)) &&
										iH((r) => {
											op(e.producer.id, t.producerId)(r), (r.wip = { type: "none" });
										});
								},
								children: "Finish Merge",
						  })
						: null
					: Y(V, {
							children: [
								Y(o$, {
									keyName: "x",
									onAct: () => {
										let { producer: t } = e;
										iH(i7(t.id));
									},
									children: "Remove Building",
								}),
								Y(o$, {
									keyName: "r",
									onAct: async () => {
										let { producer: t } = e;
										if (t instanceof nV) {
											let e = await oJ(t);
											e &&
												iH((r) => {
													(r.producers.get(t.id).rate = e), iv(r, t.inputsAndOutputs());
												});
										} else if (t instanceof nX || t instanceof nY) {
											let e = await oK(t);
											e &&
												iH((r) => {
													(r.producers.get(t.id).rate = e), iv(r, t.inputsAndOutputs());
												});
										}
									},
									children: "Change rate",
								}),
								Y(o$, {
									keyName: "m",
									onAct: () => {
										iH((t) => {
											t.wip = { type: "producer:merge", producerId: e.producer.id };
										});
									},
									children: "Merge",
								}),
							],
					  }),
			"producer:connection:input": (e, t) => {
				if ("none" !== t.type)
					return "connector:input" === t.type && t.item === e.flow.item
						? Y(o$, {
								keyName: "c",
								onAct: () => {
									iH((r) => {
										i9(
											{ producerId: t.producerId, outputIndex: t.index },
											{ producerId: e.producer.id, inputIndex: e.index },
										)(r),
											(r.wip = { type: "none" });
									});
								},
								children: "Finish Add Connector",
						  })
						: null;
				let r = e.connectors.reduce((e, t) => e.add(t.rate), td.ZERO),
					n = r.lt(e.flow.rate);
				return Y(V, {
					children: [
						Y(o$, {
							keyName: "f",
							onAct: () => {
								iH(os(e.producer.id, e.index));
							},
							children: "Match rate of input connections",
						}),
						Y(o$, {
							keyName: "b",
							disabled: !n || !oL(e.flow.item),
							onAct: async () => {
								let t = await oT(e.flow.item);
								t && iH(oo(e.producer.id, e.index, t));
							},
							children: "Balance rates with new building",
						}),
						Y(o$, {
							keyName: "u",
							disabled: !n,
							onAct: () => {
								iH(oi(e.producer.id, e.index));
							},
							children: "Balance rates with new source",
						}),
						Y(o$, {
							keyName: "c",
							onAct: () => {
								iH((t) => {
									t.wip = {
										type: "connector:output",
										producerId: e.producer.id,
										index: e.index,
										item: e.flow.item,
									};
								});
							},
							children: "Add Connector",
						}),
					],
				});
			},
			"producer:connection:output": (e, t) => {
				if ("none" !== t.type)
					return "connector:output" === t.type && t.item === e.flow.item
						? Y(o$, {
								keyName: "c",
								onAct: () => {
									iH((r) => {
										i9(
											{ producerId: e.producer.id, outputIndex: e.index },
											{ producerId: t.producerId, inputIndex: t.index },
										)(r),
											(r.wip = { type: "none" });
									});
								},
								children: "Finish Add Connector",
						  })
						: null;
				let r = e.connectors.reduce((e, t) => e.add(t.rate), td.ZERO),
					n = r.lt(e.flow.rate);
				return Y(V, {
					children: [
						Y(o$, {
							keyName: "f",
							onAct: () => {
								iH(oa(e.producer.id, e.index));
							},
							children: "Match rate of output connections",
						}),
						Y(o$, {
							keyName: "b",
							disabled: !n || !oz(e.flow.item),
							onAct: async () => {
								let t = await oW(e.flow.item);
								t && iH(on(e.producer.id, e.index, t));
							},
							children: "Balance rates with new building",
						}),
						Y(o$, {
							keyName: "k",
							disabled: !n,
							onAct: () => {
								iH(or(e.producer.id, e.index));
							},
							children: "Balance rates with new sink",
						}),
						Y(o$, {
							keyName: "c",
							onAct: () => {
								iH((t) => {
									t.wip = {
										type: "connector:input",
										producerId: e.producer.id,
										index: e.index,
										item: e.flow.item,
									};
								});
							},
							children: "Add Connector",
						}),
					],
				});
			},
			connector: (e, t) =>
				"none" !== t.type
					? "bus:connector" === t.type
						? Y(o$, {
								keyName: "n",
								disabled: !!e.bus,
								onAct: () => iH(od(e.connector.id, t.busId)),
								children: "Finish Connect to Bus",
						  })
						: null
					: Y(V, {
							children: [
								Y(o$, {
									keyName: "x",
									onAct: () => {
										let { connector: t } = e;
										iH(i8(t.id));
									},
									children: "Remove Connection",
								}),
								Y(o$, {
									keyName: "f",
									onAct: (t) => {
										let { connector: r } = e,
											n = s(t);
										iH(ol(r.id, n));
									},
									children: "Match rate of closest connection",
								}),
								Y(o$, {
									keyName: "s",
									onAct: (t) => {
										let { connector: r } = e,
											n = s(t);
										iH(om(r.id, n));
									},
									children: "Split connector off closest building",
								}),
								Y(o$, {
									keyName: "n",
									disabled: e.connector.item.IsPiped,
									onAct: () => {
										let { connector: t } = e;
										iH((r) => {
											if (e.bus) {
												let { terminals: n } = r.buses.get(e.bus.id);
												n.splice(
													n.findIndex((e) => e.id === t.id),
													1,
												);
											} else r.wip = { type: "connector:bus", connectorId: t.id };
										});
									},
									children: e.bus ? "Disconnect from bus" : "Connect to Bus",
								}),
							],
					  }),
			bus: (e, t, r) =>
				"none" !== t.type
					? "connector:bus" === t.type
						? Y(o$, {
								keyName: "n",
								disabled: r,
								onAct: () => iH(od(t.connectorId, e.bus.id)),
								children: "Finish Connect to Connector",
						  })
						: null
					: Y(V, {
							children: [
								Y(o$, {
									keyName: "x",
									onAct: () => {
										let { bus: t } = e;
										iH(ot(t.id));
									},
									children: "Remove Bus",
								}),
								Y(o$, {
									keyName: "n",
									onAct: () => {
										let { bus: t } = e;
										iH((e) => {
											e.wip = { type: "bus:connector", busId: t.id };
										});
									},
									children: "Connect to Connector",
								}),
							],
					  }),
		};
		return () => {
			let e = n(),
				t = i(),
				r = o();
			return Y("div", { class: "hotkey-actions key-actions", children: a[e.type](e, t, r) });
		};
	},
	o5 = ({ producerId: e, isOutput: t, index: r }, n) => {
		let i = iE(n, (t) => t.producers.get(e)),
			o = i(),
			{ rate: s, item: a } = (t ? o.outputFlows() : o.inputFlows())[r],
			l = (t ? o.outputs : o.inputs)[r],
			u = iE(n, (e) => l.reduce((t, r) => t.add(e.connectors.get(r).rate), td.ZERO)),
			c = iE(n, (n) =>
				"connector:input" === n.wip.type
					? t && n.wip.producerId === e && n.wip.index === r
						? "self"
						: !t && a === n.wip.item
					: "connector:output" === n.wip.type
					? t || n.wip.producerId !== e || n.wip.index !== r
						? t && a === n.wip.item
						: "self"
					: null,
			);
		return () => {
			o = i();
			let n = u(),
				l = c(),
				m = s.sub(n);
			t || (m = m.neg());
			let p = m.sign(),
				d = (t ? o.outputAttachPoints : o.inputAttachPoints)[r],
				f = a.IsPiped ? nQ : nG;
			return Y("g", {
				class: `connection-terminal ${p > 0 ? "surplus" : p < 0 ? "shortfall" : "exact"}`,
				style: `transform: ${np(d)}`,
				onMouseEnter: () =>
					iH((n) => {
						n.mouseOver = {
							type: t ? "producer:connection:output" : "producer:connection:input",
							producerId: e,
							index: r,
						};
					}),
				children: [
					Y("path", {
						class:
							!0 === l
								? "outline connecting-yes"
								: !1 === l
								? "outline connecting-no"
								: "self" === l
								? "outline connecting-self"
								: "outline",
						d: f,
					}),
					Y("image", { href: a.Icon }),
					0 !== p && Y("text", { children: [p > 0 && "+", m.toFixed(0), "/min"] }),
				],
			});
		};
	},
	o3 = ({ id: e }, t) => {
		let r = iE(t, (t) => t.producers.get(e)),
			n = r(),
			i = iE(t, (e) => {
				if ("producer:merge" !== e.wip.type) return null;
				let t = e.producers.get(e.wip.producerId);
				return t === n ? "self" : t.canCombineWith(n);
			});
		return () => {
			n = r();
			let t = i(),
				o = n.getDrawing(),
				s =
					n instanceof nV
						? Y("text", { class: "multiplier", children: [n.rate.toFixed(2), "x"] })
						: Y("text", { class: "rate", children: [n.rate.toFixed(2), "/min"] });
			return Y("g", {
				class: "producer",
				style: `transform: ${np(n)}`,
				"data-tooltip": `$producer:${e}`,
				children: [
					Y("path", {
						class:
							!0 === t
								? "outline merging-yes"
								: !1 === t
								? "outline merging-no"
								: "self" === t
								? "outline merging-self"
								: "outline",
						d: o.d,
						onMouseDown: (t) =>
							iK(
								t,
								({ x: t, y: r }) => (
									iH((n) => {
										let { zoom: i } = n.viewport,
											o = n.producers.get(e),
											{ x: s, y: a } = o,
											l = iI(s + t / i, id.x, ig.x),
											u = iI(a + r / i, id.y, ig.y);
										(o.x = l), (o.y = u);
									}),
									!0
								),
							),
						onMouseEnter: () =>
							iH((t) => {
								t.mouseOver = { type: "producer", producerId: e };
							}),
					}),
					s,
					n.inputs.map((t, r) => Y(o5, { producerId: e, isOutput: !1, index: r }, r)),
					n.outputs.map((t, r) => Y(o5, { producerId: e, isOutput: !0, index: r }, r)),
				],
			});
		};
	},
	o4 = Y("rect", { x: -10, y: -30, width: 20, height: 60 }),
	o6 = td.fromInteger(780);
function o7(e, t) {
	return e.x - t.x;
}
const o9 = (e) => ({
		select(t) {
			let r = t.buses.get(e),
				n = [];
			for (let { rxIn: e, rxOut: i, id: o } of r.terminals) {
				let r = t.connectors.get(o).rate;
				n.push({ x: e, rate: r }), n.push({ x: i, rate: r.neg() });
			}
			return n.sort(o7), n;
		},
		equal(e, t) {
			let { length: r } = e;
			if (r !== t.length) return !1;
			for (let n = 0; n < r; n++) {
				let r = e[n],
					i = t[n];
				if (r.x !== i.x || !r.rate.eq(i.rate)) return !1;
			}
			return !0;
		},
	}),
	o8 = ({ id: e }, t) => {
		let r = iE(t, (t) => t.buses.get(e)),
			n = iE(t, o9(e));
		return () => {
			let t = r(),
				i = n(),
				{ x: o, y: s, width: a } = t,
				l = td.ZERO;
			return Y("g", {
				class: "bus",
				style: `transform: translate(${o - t.width / 2}px, ${s}px)`,
				onMouseEnter: () =>
					iH((t) => {
						t.mouseOver = { type: "bus", busId: e };
					}),
				children: [
					Y("path", { class: "mainline", d: `M 0 -20 l 0 40 m 0 -20 l ${a} 0 m 0 -20 l 0 40` }),
					i.map(({ x: e, rate: t }, r) => {
						let n = i[r + 1]?.x;
						if (null != n) {
							let r = (l = l.add(t));
							return Y(V, {
								children: [
									r.gt(o6) && Y("path", { class: "rate-over", d: `M ${e} 0 L ${n} 0` }),
									Y("text", {
										x: (e + n) / 2,
										class: "rate-text",
										children: [r.toStringAdaptive(), "/min"],
									}),
								],
							});
						}
					}),
					Y("g", {
						class: "dragger",
						children: Y("rect", {
							x: 0,
							y: -10,
							width: a,
							height: 20,
							onMouseDown: (t) =>
								iK(
									t,
									({ x: t, y: r }) => (
										iH((n) => {
											let { zoom: i } = n.viewport,
												o = n.buses.get(e),
												{ x: s, y: a } = o,
												l = iI(s + t / i, id.x, ig.x),
												u = iI(a + r / i, id.y, ig.y);
											(o.x = l), (o.y = u);
										}),
										!0
									),
								),
						}),
					}),
					Y("g", {
						class: "resizer",
						onMouseDown: (t) =>
							iK(
								t,
								({ x: t }) => (
									iH((r) => {
										let { zoom: n } = r.viewport,
											i = r.buses.get(e),
											{ x: o, width: s } = i,
											a = i.terminals.reduce((e, { rxIn: t }) => Math.min(e, t), 9999999),
											l = iI(s - t / n, Math.max(200, s - a), 8e3),
											u = s - l;
										for (let e of ((i.x = o + u / 2), (i.width = l), i.terminals))
											(e.rxIn -= u), (e.rxOut -= u);
									}),
									!0
								),
							),
						children: o4,
					}),
					Y("g", {
						class: "resizer",
						style: `transform: translate(${a}px)`,
						onMouseDown: (t) =>
							iK(
								t,
								({ x: t }) => (
									iH((r) => {
										let { zoom: n } = r.viewport,
											i = r.buses.get(e),
											{ x: o, width: s } = i,
											a = i.terminals.reduce((e, { rxOut: t }) => Math.max(e, t), 200),
											l = iI(s + t / n, a, 8e3);
										(i.x = o + (l - s) / 2), (i.width = l);
									}),
									!0
								),
							),
						children: o4,
					}),
					t.terminals.map((t, r) =>
						Y("g", {
							class: "resizer",
							style: `transform: translate(${t.rxIn}px)`,
							onMouseDown: (t) =>
								iK(
									t,
									({ x: t }) => (
										iH((n) => {
											let { zoom: i } = n.viewport,
												o = n.buses.get(e),
												{ terminals: s } = o,
												a = s[r],
												l = iI(a.rxIn + t / i, 0, a.rxOut),
												u = iw(s, l);
											if ((u > r && u--, u < r)) {
												for (let e = r; e > u; ) s[e] = s[--e];
												s[u] = a;
											} else if (u > r) {
												for (let e = r; e < u; ) s[e] = s[++e];
												s[u] = a;
											}
											(a.rxIn = l), (r = u);
										}),
										!0
									),
								),
							children: o4,
						}),
					),
					t.terminals.map((t, r) =>
						Y("g", {
							class: "resizer",
							style: `transform: translate(${t.rxOut}px)`,
							onMouseDown: (t) =>
								iK(
									t,
									({ x: t }) => (
										iH((n) => {
											let { zoom: i } = n.viewport,
												o = n.buses.get(e),
												s = o.terminals[r],
												a = iI(s.rxOut + t / i, s.rxIn, o.width);
											s.rxOut = a;
										}),
										!0
									),
								),
							children: o4,
						}),
					),
				],
			});
		};
	},
	se = `${im.x} ${im.y} ${ip.x - im.x} ${ip.y - im.y}`,
	st = (() => {
		let e = [],
			t = (e) => (e < 0 ? 100 * Math.floor(e / 100) : 100 * Math.ceil(e / 100)),
			r = t(im.x),
			n = t(ip.x),
			i = t(im.y),
			o = t(ip.y);
		for (let t = r; t <= n; t += 100) e.push(`M ${t} ${i} l 0 ${o - i}`);
		for (let t = r; t <= o; t += 100) e.push(`M ${r} ${t} l ${n - r} 0`);
		return Y(V, {
			children: [Y("rect", { x: im.x, y: im.y, width: 16e3, height: 8e3 }), Y("path", { d: e.join(" ") })],
		});
	})();
function sr({ x: e, y: t }) {
	return (
		iH((r) => {
			let { center: n, zoom: i } = r.viewport,
				o = iI(n.x + e / i, im.x, ip.x),
				s = iI(n.y + t / i, im.y, ip.y);
			(n.x = o), (n.y = s);
		}),
		!0
	);
}
const sn = (e, t) => {
	let r = iE(t, iM),
		n = iE(t, iL),
		i = iE(t, iT),
		o = iE(t, (e) => e.viewport),
		s = r(),
		a = n(),
		l = i(),
		u = o(),
		c = i1(
			(e) => e.map((e) => Y(o3, { id: e }, e)),
			() => s,
		),
		m = i1(
			(e) => e.map((e) => Y(i0, { id: e }, e)),
			() => a,
		),
		p = i1(
			(e) => e.map((e) => Y(o8, { id: e }, e)),
			() => l,
		);
	function d(e) {
		e.preventDefault(),
			iH((t) => {
				let { zoom: r } = t.viewport;
				(r *= 1.0011 ** -e.deltaY) < 0.1 && (r = 0.1),
					r > 5 && (r = 5),
					r > 0.94 && r < 1.06 && (r = 1),
					(t.viewport.zoom = r);
			});
	}
	return () => {
		(s = r()), (a = n()), (l = i()), (u = o());
		let e = `transform: translate(-50%, -50%) scale(${u.zoom}) ${np(u.center)}`;
		return Y("div", {
			class: "viewport",
			tabIndex: -1,
			onWheelCapture: d,
			children: [
				Y("svg", {
					viewBox: se,
					style: e,
					children: [
						Y("g", {
							class: "backgrid",
							onMouseDown: (e) => iK(e, sr),
							onMouseEnter: () =>
								iH((e) => {
									e.mouseOver = { type: "viewport" };
								}),
							children: st,
						}),
						m(),
						p(),
						c(),
					],
				}),
				Y(o2, {}),
			],
		});
	};
};
function si() {
	return Y(V, { children: Y(sn, {}) });
}
function so({ inPlanner: e, changeInPlanner: t }) {
	return Y("div", {
		class: "app-actions key-actions",
		children: [
			Y(o$, { keyName: "q", disabled: e, onAct: () => t(!0), children: "Planner" }),
			Y(o$, { keyName: "w", disabled: !e, onAct: () => t(!1), children: "Editor" }),
		],
	});
}
const ss = no.filter((e) => !e.Alternate),
	sa = no.filter((e) => e.Alternate);
nr.filter((e) => e.IsResource);
const sl = new Map(
		[
			{ className: "Desc_OreIron_C", rate: 70380 },
			{ className: "Desc_OreCopper_C", rate: 28860 },
			{ className: "Desc_Stone_C", rate: 52860 },
			{ className: "Desc_Coal_C", rate: 30900 },
			{ className: "Desc_OreGold_C", rate: 11040 },
			{ className: "Desc_LiquidOil_C", rate: 11700 },
			{ className: "Desc_RawQuartz_C", rate: 10500 },
			{ className: "Desc_Sulfur_C", rate: 6840 },
			{ className: "Desc_OreBauxite_C", rate: 9780 },
			{ className: "Desc_OreUranium_C", rate: 2100 },
			{ className: "Desc_NitrogenGas_C", rate: 12e3 },
		].map(({ className: e, rate: t }) => [nr.find((t) => t.ClassName === e), td.fromInteger(t)]),
	),
	su = nr.find((e) => "Desc_Water_C" === e.ClassName);
function sc(e) {
	e.sort((e, t) => e.item.SortOrder - t.item.SortOrder);
}
const sm = () => ({ basicRecipes: ss.map(() => !0), alternateRecipes: sa.map(() => !1), products: [], inputs: [] });
function sp() {
	let e = Array(sl.size + 1),
		t = 0;
	for (let [r, n] of sl.entries()) e[t++] = { rate: n, item: r };
	return (e[t++] = { rate: null, item: su }), (e[t++] = { rate: null, item: nc }), sc(e), e;
}
const {
		useSelector: sd,
		update: sf,
		getStateRaw: sg,
	} = n3(
		{
			serialize: function (e) {
				let t = new n9();
				for (let r of (t.write(6, 0), e.basicRecipes)) t.write(1, +r);
				for (let r of e.alternateRecipes) t.write(1, +r);
				function r(e) {
					for (let r of (ie(t, BigInt(e.length)), e)) ir(t, r.rate ?? td.ZERO), il(t, r.item);
				}
				return r(e.products), r(e.inputs), t.finish();
			},
			deserialize: function (e) {
				let t = new n7(e),
					r = t.read(6);
				if (0 !== r) return console.warn(`Decode: version mismatch ${r} !== 0`), null;
				let n = sm();
				for (let e = 0; e < n.basicRecipes.length; e++) n.basicRecipes[e] = !!t.read(1);
				for (let e = 0; e < n.alternateRecipes.length; e++) n.alternateRecipes[e] = !!t.read(1);
				function i() {
					let e = Number(it(t)),
						r = Array(e);
					for (let n = 0; n < e; n++) {
						let e = ii(t),
							i = ic(t);
						if (!i) return console.warn("Decode: Missing item"), null;
						r[n] = { rate: 0 >= e.sign() ? null : e, item: i };
					}
					return r;
				}
				let o = i();
				if (!o) return null;
				sc(o), (n.products = o);
				let s = i();
				return s ? (sc(s), (n.inputs = s), n) : null;
			},
			makeDefault() {
				let e = sm();
				return (e.inputs = sp()), e;
			},
		},
		1,
		"_PlannerStore",
	),
	sI = (e, t, r, n, i, o) =>
		function (s, a) {
			let l = e(a);
			return () => {
				let e = l();
				return Y("div", {
					class: "rate-list",
					children: Y("table", {
						children: [
							e.map((e, i) =>
								Y("tr", {
									children: [
										Y("td", { children: Y("img", { class: "icon", src: e.item.Icon }) }),
										Y("td", {
											children: Y("a", {
												onClick: async () => {
													let { products: r, inputs: n } = sg(),
														o = nm.filter(
															(t) =>
																t === e.item ||
																(!r.find((e) => e.item === t) &&
																	!n.find((e) => e.item === t)),
														),
														s = await oU("Select new item:", o);
													s &&
														t((e) => {
															e[i].item = s;
														});
												},
												children: e.item.DisplayName,
											}),
										}),
										Y("th", {
											children: Y("a", {
												onClick: async () => {
													let n = await r(e.rate ?? "unlimited", e.item);
													n &&
														t((e) => {
															e[i].rate = "unlimited" === n ? null : n;
														});
												},
												children: e.rate
													? e.rate.toFixed(2).toString() + (e.item === nc ? " MW" : "/min")
													: n,
											}),
										}),
										Y("td", {
											children: Y("button", {
												onClick: () =>
													t((e) => {
														e.splice(i, 1);
													}),
												children: "✖︎",
											}),
										}),
									],
								}),
							),
							Y("tr", {
								children: [
									Y("td", { children: Y("div", { class: "icon" }) }),
									Y("td", {
										colSpan: 3,
										children: Y("a", {
											onClick: async () => {
												let { products: e, inputs: r } = sg(),
													n = nm.filter(
														(t) =>
															!e.find((e) => e.item === t) &&
															!r.find((e) => e.item === t),
													),
													i = await oU("Select new item:", n);
												i &&
													t((e) => {
														e.push({ rate: td.fromIntegers(60, 1), item: i });
													});
											},
											children: "Add new item...",
										}),
									}),
								],
							}),
							Y("tr", {
								children: [
									Y("td", { children: Y("div", { class: "icon" }) }),
									Y("td", { colSpan: 3, children: Y("a", { onClick: o, children: i }) }),
								],
							}),
						],
					}),
				});
			};
		},
	sh = sI(
		(e) => sd(e, (e) => e.products),
		(e) =>
			sf((t) => {
				e(t.products), sc(t.products);
			}),
		(e, t) => o1(e, t, !0),
		"maximize",
		"Clear outputs",
		() =>
			sf((e) => {
				e.products = [];
			}),
	),
	sC = sI(
		(e) => sd(e, (e) => e.inputs),
		(e) =>
			sf((t) => {
				e(t.inputs), sc(t.inputs);
			}),
		(e, t) => o1(e, t, !1),
		"unlimited",
		"Set inputs to default",
		() =>
			sf((e) => {
				let t = sp();
				(e.inputs = t),
					(e.products = e.products.filter((e) => !t.find((t) => t.item.ClassName === e.item.ClassName)));
			}),
	),
	sR = (e, t, r, n, i) =>
		function (o, s) {
			let a = e(s),
				l = "";
			return () => {
				let e = a(),
					{ testRegex: o, highlightRegex: u } = i_(l),
					c = e.some((e) => e),
					m = e.some((e) => !e);
				return Y("div", {
					class: "recipe-filter",
					children: [
						Y("h2", { class: "title", children: i }),
						Y("input", {
							type: "text",
							value: l,
							placeholder: "Filter recipes",
							onInput: (e) => {
								(l = e.currentTarget.value), eS(s);
							},
						}),
						Y("div", {
							class: "entry",
							children: Y("label", {
								"data-has-checkbox": !0,
								children: [
									Y("input", {
										type: "checkbox",
										checked: c,
										indeterminate: c && m,
										onClick: () => {
											let e = m && !c;
											n(e);
										},
									}),
									Y("div", { class: "icon" }),
									Y("span", { children: "Select all" }),
								],
							}),
						}),
						Y("div", {
							class: "scrollable",
							children: t.map(
								(t, n) =>
									o.test(t.DisplayName) &&
									Y("div", {
										class: "entry",
										children: Y("label", {
											"data-has-checkbox": !0,
											"data-tooltip": t.ClassName,
											children: [
												Y("input", { type: "checkbox", checked: e[n], onChange: () => r(n) }),
												Y("img", {
													class: "icon",
													src:
														0 > t.Building.PowerConsumption.sign()
															? nc.Icon
															: t.Outputs[0].Item.Icon,
												}),
												Y("span", { children: iy(t.DisplayName, u) }),
											],
										}),
									}),
							),
						}),
					],
				});
			};
		},
	s_ = sR(
		(e) => sd(e, (e) => e.basicRecipes),
		ss,
		(e) =>
			sf((t) => {
				t.basicRecipes[e] = !t.basicRecipes[e];
			}),
		(e) =>
			sf((t) => {
				t.basicRecipes.fill(e);
			}),
		"Basic Recipes",
	),
	sy = sR(
		(e) => sd(e, (e) => e.alternateRecipes),
		sa,
		(e) =>
			sf((t) => {
				t.alternateRecipes[e] = !t.alternateRecipes[e];
			}),
		(e) =>
			sf((t) => {
				t.alternateRecipes.fill(e);
			}),
		"Alternate Recipes",
	);
function sw(e, t) {
	let r = e.OverclockPowerFactor.toNumberApprox() - 1,
		n = t.toNumberApprox();
	return td.parse(Math.pow(n, r).toFixed(2));
}
const sN = new Map(
		[
			{ className: "Desc_OreIron_C", wp: "0.14" },
			{ className: "Desc_OreCopper_C", wp: "0.35" },
			{ className: "Desc_Stone_C", wp: "0.19" },
			{ className: "Desc_Coal_C", wp: "0.32" },
			{ className: "Desc_OreGold_C", wp: "0.91" },
			{ className: "Desc_LiquidOil_C", wp: "0.85" },
			{ className: "Desc_RawQuartz_C", wp: "0.95" },
			{ className: "Desc_Sulfur_C", wp: "1.46" },
			{ className: "Desc_OreBauxite_C", wp: "1.02" },
			{ className: "Desc_OreUranium_C", wp: "4.76" },
			{ className: "Desc_NitrogenGas_C", wp: "0.83" },
		].map(({ className: e, wp: t }) => [nr.find((t) => t.ClassName === e), td.parse(t).neg()]),
	),
	sb = td.parse("-0.03");
function sP(e, t) {
	let r = Array(e);
	for (let n = 0; n < e; n++, t++) r[n] = t;
	return r;
}
const sS = Y("div", { class: "spinner", children: [Y("div", {}), Y("div", {}), Y("div", {})] });
function sD() {
	return sS;
}
function sv({ message: e, onConfirm: t }) {
	return Y("div", {
		children: [
			Y("div", { children: e }),
			Y("div", {
				class: "dialog-buttons",
				children: [
					Y("button", { onClick: () => t(!1), children: "Cancel" }),
					Y("button", { ref: oy, onClick: () => t(!0), children: "Ok" }),
				],
			}),
		],
	});
}
const sA = async ({ title: e, message: t }) =>
		!!(await oD({ title: e, render: (e) => Y(sv, { message: t, onConfirm: e }) })),
	sF = { inPlanner: !0 },
	sO = n3(
		{
			serialize: function (e) {
				return e.inPlanner ? "p" : "e";
			},
			deserialize: function (e) {
				return { inPlanner: "p" === e[0] };
			},
			makeDefault: () => sF,
		},
		0,
		"_AppStore",
	),
	{ useSelector: sB, update: sx } = sO;
function sk(e) {
	sx((t) => {
		t.inPlanner = e;
	});
}
const sE = (e) =>
		(function (e, t) {
			let r = !1;
			return {
				promise: (async function () {
					for (let t = performance.now(); ; ) {
						let { done: n, value: i } = e.next();
						if (n) return i;
						if (performance.now() - t >= 100) {
							if ((await new Promise((e) => window.requestIdleCallback(e)), r))
								throw Error("Operation aborted");
							t = performance.now();
						}
					}
				})(),
				abort: function () {
					r = !0;
				},
			};
		})(
			(function* (e) {
				let t = (function (e) {
					let t = { constraints: new Map(), power: null, clockFactor: td.ONE, availableRecipes: new Set() };
					for (let r = 0; r < ss.length; r++) e.basicRecipes[r] && t.availableRecipes.add(ss[r]);
					for (let r = 0; r < sa.length; r++) e.alternateRecipes[r] && t.availableRecipes.add(sa[r]);
					for (let { rate: r, item: n } of e.inputs)
						n !== nc
							? t.constraints.set(n, { constraint: "available", rate: r })
							: (t.power = { constraint: "available", rate: r });
					for (let { rate: r, item: n } of e.products)
						n !== nc
							? t.constraints.set(n, { constraint: "produced", rate: r })
							: (t.power = { constraint: "produced", rate: r });
					return t;
				})(e);
				yield;
				let r = yield* (function* (e) {
					if (0 === e.availableRecipes.size) return null;
					let t = (function ({ constraints: e, power: t, clockFactor: r, availableRecipes: n }) {
						let i, o, s, a, l;
						let u = new Map(),
							c = new Set(),
							m = new Set(),
							p = new Set(),
							d = -1,
							f = n.size + 1,
							g = !1;
						{
							let r = 0;
							for (let [t, { constraint: n, rate: i }] of e.entries())
								null != i
									? u.set(t, r++)
									: (p.add(t), "produced" === n ? (m.add(t), (g = !0)) : c.add(t));
							for (let { Inputs: e, Outputs: t } of n) {
								for (let { Item: t } of e) u.has(t) || p.has(t) || u.set(t, r++);
								for (let { Item: e } of t) u.has(e) || p.has(e) || u.set(e, r++);
							}
							null == t || null != t.rate
								? (d = r++)
								: "produced" === t.constraint && null == t.rate && (g = !0),
								(i = (o = r) + (g ? 2 : 1)),
								(s = r * f);
						}
						let I = Array(i * f).fill(td.ZERO);
						{
							let t = f - 1;
							for (let { constraint: r, rate: n } of e.values())
								if (null != n) {
									let e = n;
									"produced" === r && (e = e.neg()), (I[t] = e), (t += f);
								}
						}
						if (t?.rate != null) {
							let { constraint: e, rate: r } = t;
							"produced" === e && (r = r.neg()), (I[d * f + f - 1] = r);
						}
						let h = new Map(),
							C = new Map();
						if (g) {
							for (let [t, { constraint: r, rate: n }] of e.entries())
								"produced" === r && null == n && h.set(t, td.MINUS_ONE);
							t?.constraint === "produced" && null == t.rate && (a = td.MINUS_ONE);
						}
						{
							let r = g ? C : h;
							for (let [t, { constraint: n, rate: i }] of e.entries())
								if ("available" === n && null != i) {
									let e = sN.get(t);
									e && r.set(t, e);
								}
							t?.constraint === "available" && null != t.rate && (g ? (l = sb) : (a = sb));
						}
						{
							let e = 0;
							for (let t of n) {
								let n = td.ZERO,
									i = td.ZERO;
								for (let { Item: r, Rate: o } of t.Inputs) {
									let t = u.get(r);
									if (null != t) {
										let r = t * f + e;
										I[r] = I[r].sub(o);
									}
									let s = h.get(r);
									null != s && (n = n.add(s.mul(o)));
									let a = C.get(r);
									null != a && (i = i.add(a.mul(o)));
								}
								for (let { Item: r, Rate: o } of t.Outputs) {
									let t = u.get(r);
									if (null != t) {
										let r = t * f + e;
										I[r] = I[r].add(o);
									}
									let s = h.get(r);
									null != s && (n = n.sub(s.mul(o)));
									let a = C.get(r);
									null != a && (i = i.sub(a.mul(o)));
								}
								{
									let o = t.PowerConsumption ?? t.Building.PowerConsumption,
										s = sw(t.Building, r),
										u = o.mul(s),
										c = d;
									if (c >= 0) {
										let t = c * f + e;
										I[t] = u.neg();
									}
									null != a && (n = n.add(a.mul(u))), null != l && (i = i.add(l.mul(u)));
								}
								(I[s + e] = n), g && (I[s + f + e] = i), e++;
							}
						}
						let R = sP(n.size, 1),
							_ = sP(o, f);
						return new iS(_, R, g, I);
					})(e);
					yield;
					let r = yield* iD(t);
					return r
						? (function (e, t) {
								let r;
								let n = e.availableRecipes.size,
									i = n + 1,
									o = Array(n).fill(td.ZERO);
								{
									let e = i - 1;
									for (let r of t.basic) {
										if (r < i) {
											let n = t.coefficients[e];
											o[r - 1] = n;
										}
										e += i;
									}
									r = t.coefficients[e + (t.isDualObjective ? i : 0)].neg();
								}
								return { recipes: o, wp: r };
						  })(e, r)
						: null;
				})(t);
				if (!r)
					return Y("div", {
						class: "pane",
						children: [
							Y("h2", { class: "title", children: "Solution" }),
							Y("div", { children: "No solution found. Check your inputs and recipes." }),
						],
					});
				yield;
				let n = (function (e, t) {
					let r = 0,
						n = new Map(),
						i = td.ZERO;
					for (let o of e.availableRecipes) {
						let s = t.recipes[r++];
						if (0 === s.sign()) continue;
						for (let { Item: e, Rate: t } of o.Inputs) {
							let r = t.mul(s),
								i = n.get(e) ?? td.ZERO;
							(i = i.sub(r)), n.set(e, i);
						}
						for (let { Item: e, Rate: t } of o.Outputs) {
							let r = t.mul(s),
								i = n.get(e) ?? td.ZERO;
							(i = i.add(r)), n.set(e, i);
						}
						let a = sw(o.Building, e.clockFactor)
							.mul(o.PowerConsumption ?? o.Building.PowerConsumption)
							.mul(s);
						i = i.sub(a);
					}
					return { items: n, power: i };
				})(t, r);
				return (
					yield,
					Y(V, {
						children: [
							Y("div", {
								class: "pane",
								children: [
									Y("h2", { class: "title", children: "Solution" }),
									Y("h3", { class: "title", children: "Overview" }),
									Y("div", {
										class: "result-summary-area",
										children: [
											Y("div", {
												children: [
													Y("div", {
														children: [
															"WP: ",
															Y("strong", {
																"data-tooltip": r.wp.toRatioString(),
																children: r.wp.toFixed(2),
															}),
														],
													}),
													(function () {
														let e = n.power.sign(),
															t = e < 0 ? n.power.neg() : n.power;
														return Y("div", {
															children: [
																"Power: ",
																Y("strong", {
																	"data-tooltip": t.toRatioString() + " MW",
																	children: [t.toFixed(2), " MW"],
																}),
																" ",
																e < 0 ? "consumed" : "produced",
															],
														});
													})(),
												],
											}),
											Y("div", {
												children: Y("button", {
													onClick: async () => {
														(await sA({
															title: "Confirm Copy to Editor",
															message:
																"This will clear any existing contents of the editor.",
														})) &&
															(iH((e) => {
																Object.assign(
																	e,
																	(function (e, t) {
																		let r = new Map(),
																			n = new Map(),
																			i = new Map(),
																			o = (e) => {
																				let t = i.get(e);
																				return (
																					t ||
																						((t = {
																							sources: [],
																							sinks: [],
																						}),
																						i.set(e, t)),
																					t
																				);
																			};
																		{
																			let n = 0;
																			for (let i of e.availableRecipes) {
																				let e = t.recipes[n++];
																				if (0 === e.sign()) continue;
																				let s = new nV(0, 0, e, i);
																				r.set(s.id, s);
																				let a = 0;
																				for (let {
																					rate: e,
																					item: t,
																				} of s.inputFlows()) {
																					let { sinks: r } = o(t);
																					r.push({
																						rate: e,
																						producer: s,
																						index: a++,
																					});
																				}
																				for (let {
																					rate: e,
																					item: t,
																				} of ((a = 0), s.outputFlows())) {
																					let { sources: r } = o(t);
																					r.push({
																						rate: e,
																						producer: s,
																						index: a++,
																					});
																				}
																			}
																		}
																		for (let [
																			e,
																			{ sources: t, sinks: o },
																		] of i.entries()) {
																			let i = t.reduce(
																					(e, t) => e.add(t.rate),
																					td.ZERO,
																				),
																				s = o.reduce(
																					(e, t) => e.add(t.rate),
																					td.ZERO,
																				),
																				a = i.sub(s);
																			switch (a.sign()) {
																				case -1:
																					let l = a.neg(),
																						u = new nX(0, 0, l, e);
																					r.set(u.id, u),
																						t.push({
																							rate: l,
																							producer: u,
																							index: 0,
																						});
																					break;
																				case 1:
																					let c = new nY(0, 0, a, e);
																					r.set(c.id, c),
																						o.push({
																							rate: a,
																							producer: c,
																							index: 0,
																						});
																			}
																			for (
																				let r = 0,
																					i = 0,
																					s = t[0]?.rate ?? td.ZERO,
																					a = o[0]?.rate ?? td.ZERO;
																				r < t.length && i < o.length;

																			) {
																				let l = t[r],
																					u = o[i],
																					c = s.lt(a) ? s : a,
																					m = new ib(
																						c,
																						e,
																						l.producer.id,
																						u.producer.id,
																						l.index,
																						u.index,
																					);
																				l.producer.outputs[l.index].push(m.id),
																					u.producer.inputs[u.index].push(
																						m.id,
																					),
																					n.set(m.id, m),
																					(s = s.sub(c)),
																					(a = a.sub(c)),
																					0 === s.sign() &&
																						(r++,
																						(s = t[r]?.rate ?? td.ZERO)),
																					0 === a.sign() &&
																						(i++,
																						(a = o[i]?.rate ?? td.ZERO));
																			}
																		}
																		return (
																			(function (e, t) {
																				let r = new Map(),
																					n = [],
																					i = [];
																				for (let t of e.values())
																					if (0 === t.outputs.length) {
																						let e = {
																							value: t,
																							children: [],
																							displayDepth: 0,
																						};
																						n.push(e),
																							i.push(e),
																							r.set(t, e);
																					}
																				for (let n = 0; n < i.length; n++) {
																					let o = i[n],
																						s = o.value;
																					for (let n of s.inputs)
																						for (let s of n) {
																							let n = e.get(
																									t.get(s).input,
																								),
																								a = r.get(n);
																							if (!a) {
																								let e = {
																									value: n,
																									children: [],
																									displayDepth: 0,
																								};
																								o.children.push(e),
																									i.push(e),
																									r.set(n, e);
																							}
																						}
																				}
																				let o = 0,
																					s = new Set(),
																					a = new Set(),
																					l = new Set();
																				for (let i of n)
																					!(function n(i, u, c) {
																						if (!a.has(i) && s.has(i)) {
																							c && l.add(c);
																							return;
																						}
																						let m = i.value;
																						for (let a of ((i.displayDepth =
																							Math.max(
																								i.displayDepth,
																								u,
																							)),
																						(o = Math.max(o, u)),
																						s.add(i),
																						m.inputs))
																							for (let i of a) {
																								let o = t.get(i);
																								if (!l.has(o)) {
																									let t = e.get(
																											o.input,
																										),
																										i = r.get(t);
																									n(i, u + 1, o);
																								}
																							}
																						a.add(i);
																					})(i, 0);
																				let u = -1;
																				!(function e(t) {
																					for (let r of t)
																						e(r.children),
																							0 === r.children.length &&
																								u++;
																				})(n);
																				let c = (e) => 800 * (o / 2 - e),
																					m = (e) => 300 * (u / 2 - e),
																					p = 0;
																				!(function e(t) {
																					for (let r of t)
																						e(r.children),
																							(r.value.x = c(
																								r.displayDepth,
																							)),
																							(r.value.y =
																								0 === r.children.length
																									? m(p++)
																									: (r.children[0]
																											.value.y +
																											r.children[
																												r
																													.children
																													.length -
																													1
																											].value.y) /
																									  2);
																				})(n);
																			})(r, n),
																			{
																				viewport: {
																					center: { x: 0, y: 0 },
																					zoom: 1,
																				},
																				mouseOver: { type: "none" },
																				wip: { type: "none" },
																				producers: r,
																				connectors: n,
																				buses: new Map(),
																			}
																		);
																	})(t, r),
																);
															}),
															sk(!1));
													},
													children: "Copy Solution to Editor",
												}),
											}),
										],
									}),
								],
							}),
							Y("div", {
								class: "scrollable",
								children: [
									(function () {
										let e = [],
											t = [];
										for (let [r, i] of n.items) {
											let n = i.sign();
											if (0 === n) continue;
											let o = n > 0 ? t : e;
											n < 0 && (i = i.neg()),
												o.push(
													Y("tr", {
														children: [
															Y("th", {
																"data-tooltip": i.toRatioString() + "/min",
																children: [i.toFixed(2), "/min"],
															}),
															Y("td", {
																children: Y("img", { class: "icon", src: r.Icon }),
															}),
															Y("td", { children: r.DisplayName }),
														],
													}),
												);
										}
										return Y(V, {
											children: [
												Y("div", {
													class: "pane",
													children: [
														Y("h3", { class: "title", children: "Items produced" }),
														Y("table", { children: t }),
													],
												}),
												Y("div", {
													class: "pane",
													children: [
														Y("h3", { class: "title", children: "Items used" }),
														Y("table", { children: e }),
													],
												}),
											],
										});
									})(),
									(function () {
										let e = [],
											n = 0;
										for (let i of t.availableRecipes) {
											let t = r.recipes[n++];
											t.sign() > 0 &&
												e.push(
													Y("tr", {
														children: [
															Y("th", {
																"data-tooltip": t.toRatioString() + "/min",
																children: [t.toFixed(2), "x"],
															}),
															Y("td", {
																children: Y("img", {
																	class: "icon",
																	src:
																		0 > i.Building.PowerConsumption.sign()
																			? nc.Icon
																			: i.Outputs[0].Item.Icon,
																}),
															}),
															Y("td", {
																"data-tooltip": i.ClassName,
																children: i.DisplayName,
															}),
														],
													}),
												);
										}
										return Y("div", {
											class: "pane",
											children: [
												Y("h3", { class: "title", children: "Recipes used" }),
												Y("table", { children: e }),
											],
										});
									})(),
								],
							}),
						],
					})
				);
			})(e),
			0,
		),
	sH = [
		{
			type: "constraints",
			name: "Resource Limits",
			content: Y(function () {
				return Y("div", {
					class: "rate-setter",
					children: [
						Y("div", { class: "pane", children: Y("h2", { class: "title", children: "Settings" }) }),
						Y("div", {
							class: "scrollable",
							children: [
								Y("div", {
									class: "pane",
									children: [Y("h3", { class: "title", children: "Outputs" }), Y(sh, {})],
								}),
								Y("div", {
									class: "pane",
									children: [Y("h3", { class: "title", children: "Inputs" }), Y(sC, {})],
								}),
							],
						}),
					],
				});
			}, {}),
		},
		{ type: "basicRecipes", name: "Basic Recipes", content: Y(s_, {}) },
		{ type: "alternateRecipes", name: "Alternate Recipes", content: Y(sy, {}) },
	],
	sU = Y("div", {
		class: "results-area",
		children: Y((e, t) => {
			let r = sd(t, (e) => e),
				n = (function (e, t) {
					let r, n, i, o;
					return (
						eb(e, () => {
							o?.catch(() => {}), i?.abort();
						}),
						(s) => {
							if (
								!r ||
								!(function (e, t) {
									if (e.length !== t.length) return !1;
									for (let r = 0; r < e.length; r++) if (e[r] !== t[r]) return !1;
									return !0;
								})(r, s)
							) {
								o?.catch(() => {}), i?.abort();
								let a = t(...s);
								(r = s),
									(i = a),
									(o = a.promise.then((t) => {
										i === a && ((n = t), (i = void 0), (o = void 0), eS(e));
									}));
							}
							return { value: n, stale: !!i };
						}
					);
				})(t, sE);
			return () => {
				let { value: e, stale: t } = n([r()]);
				return Y("div", {
					class: "results",
					children: Y("div", {
						class: "inner",
						children: [
							t && Y("div", { class: "loader", children: Y(sD, {}) }),
							Y("div", { class: "contents", children: e }),
						],
					}),
				});
			};
		}, {}),
	}),
	sq = (e, t) => {
		let r = "constraints";
		return () =>
			Y("div", {
				class: "factory-planner",
				children: [
					Y("div", {
						class: "tabs-holder",
						children: [
							Y("div", {
								class: "tabs",
								children: sH.map(({ type: e, name: n }) =>
									Y("button", {
										class: "tab",
										role: "tab",
										"aria-selected": e === r,
										onClick: () => {
											(r = e), eS(t);
										},
										children: n,
									}),
								),
							}),
							Y("div", {
								class: "tab-content",
								role: "tabpanel",
								children: sH.find((e) => e.type === r).content,
							}),
						],
					}),
					sU,
				],
			});
	};
function sM() {
	return Y(V, { children: Y(sq, {}) });
}
!(function () {
	document.body.appendChild(iZ);
	let e = ey(iZ, null);
	document.addEventListener("mouseover", (t) => {
		let r = t.target,
			n = null;
		for (; r && null == (n = r.getAttribute("data-tooltip")); ) r = r.parentElement;
		iV !== r &&
			((iV = r),
			n ? (e.render(Y(iX, { value: n })), (iZ.style.display = ""), iJ()) : (iZ.style.display = "none"));
	}),
		document.addEventListener("scroll", iJ, { passive: !0, capture: !0 });
})(),
	ey(
		document.body,
		Y((e, t) => {
			let r = sB(t, (e) => e.inPlanner);
			return () => {
				let e = r();
				return Y(V, {
					children: [e ? Y(sM, {}) : Y(si, {}), Y(so, { inPlanner: e, changeInPlanner: sk }), Y(oS, {})],
				});
			};
		}, {}),
	),
	Array.prototype.at ||
		Object.defineProperty(Array.prototype, "at", {
			configurable: !0,
			enumerable: !1,
			value: function (e) {
				let { length: t } = this;
				if ((e < 0 && (e += t), e >= 0 && e < t)) return this[e];
			},
		}),
	window.requestIdleCallback ||
		((window.requestIdleCallback = function (e, t) {
			return window.setTimeout(e, t?.timeout ?? 50);
		}),
		(window.cancelIdleCallback = function (e) {
			window.clearTimeout(e);
		}));
//# sourceMappingURL=index.9b70f218.js.map
