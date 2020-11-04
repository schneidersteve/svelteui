
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/AppMenu.svelte generated by Svelte v3.29.4 */

    const file = "src/AppMenu.svelte";

    function create_fragment(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let t1;
    	let div1;
    	let a0;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let a1;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			div0.textContent = "Button";
    			t1 = space();
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Button";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Form";
    			t5 = space();
    			div3 = element("div");
    			a1 = element("a");
    			a1.textContent = "Checkbox";
    			attr_dev(div0, "class", "menu-category");
    			add_location(div0, file, 2, 8, 67);
    			attr_dev(a0, "href", "#/button");
    			add_location(a0, file, 4, 12, 152);
    			attr_dev(div1, "class", "menu-items");
    			add_location(div1, file, 3, 8, 115);
    			attr_dev(div2, "class", "menu-category");
    			add_location(div2, file, 7, 8, 206);
    			attr_dev(a1, "href", "#/checkbox");
    			add_location(a1, file, 9, 12, 289);
    			attr_dev(div3, "class", "menu-items");
    			add_location(div3, file, 8, 8, 252);
    			attr_dev(div4, "class", "layout-menu");
    			add_location(div4, file, 1, 4, 33);
    			attr_dev(div5, "class", "layout-sidebar");
    			add_location(div5, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, a0);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AppMenu", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AppMenu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class AppMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppMenu",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/button/Button.svelte generated by Svelte v3.29.4 */

    const file$1 = "src/components/button/Button.svelte";

    // (18:4) {#if icon}
    function create_if_block_2(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(/*icon*/ ctx[3]) + " svelte-dqrry2"));
    			toggle_class(span, "p-button-icon", true);
    			toggle_class(span, "p-button-icon-left", /*iconPos*/ ctx[4] === "left" && /*label*/ ctx[2]);
    			toggle_class(span, "p-button-icon-right", /*iconPos*/ ctx[4] === "right" && /*label*/ ctx[2]);
    			toggle_class(span, "p-button-icon-top", /*iconPos*/ ctx[4] === "top" && /*label*/ ctx[2]);
    			toggle_class(span, "p-button-icon-bottom", /*iconPos*/ ctx[4] === "bottom" && /*label*/ ctx[2]);
    			add_location(span, file$1, 18, 8, 486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 8 && span_class_value !== (span_class_value = "" + (null_to_empty(/*icon*/ ctx[3]) + " svelte-dqrry2"))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*icon*/ 8) {
    				toggle_class(span, "p-button-icon", true);
    			}

    			if (dirty & /*icon, iconPos, label*/ 28) {
    				toggle_class(span, "p-button-icon-left", /*iconPos*/ ctx[4] === "left" && /*label*/ ctx[2]);
    			}

    			if (dirty & /*icon, iconPos, label*/ 28) {
    				toggle_class(span, "p-button-icon-right", /*iconPos*/ ctx[4] === "right" && /*label*/ ctx[2]);
    			}

    			if (dirty & /*icon, iconPos, label*/ 28) {
    				toggle_class(span, "p-button-icon-top", /*iconPos*/ ctx[4] === "top" && /*label*/ ctx[2]);
    			}

    			if (dirty & /*icon, iconPos, label*/ 28) {
    				toggle_class(span, "p-button-icon-bottom", /*iconPos*/ ctx[4] === "bottom" && /*label*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(18:4) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {:else}
    function create_else_block(ctx) {
    	let span;
    	let raw_value = "&nbsp;" + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "p-button-label svelte-dqrry2");
    			add_location(span, file$1, 30, 8, 937);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(30:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if label}
    function create_if_block_1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*label*/ ctx[2]);
    			attr_dev(span, "class", "p-button-label svelte-dqrry2");
    			add_location(span, file$1, 28, 8, 873);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 4) set_data_dev(t, /*label*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(28:4) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if badge}
    function create_if_block(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*badge*/ ctx[5]);
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(/*badgeClass*/ ctx[6] ? /*badgeClass*/ ctx[6] : "") + " svelte-dqrry2"));
    			toggle_class(span, "p-badge", true);
    			add_location(span, file$1, 33, 8, 1024);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*badge*/ 32) set_data_dev(t, /*badge*/ ctx[5]);

    			if (dirty & /*badgeClass*/ 64 && span_class_value !== (span_class_value = "" + (null_to_empty(/*badgeClass*/ ctx[6] ? /*badgeClass*/ ctx[6] : "") + " svelte-dqrry2"))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*badgeClass*/ 64) {
    				toggle_class(span, "p-badge", true);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:4) {#if badge}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[3] && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*label*/ ctx[2]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*badge*/ ctx[5] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			button.disabled = /*disabled*/ ctx[1];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*className*/ ctx[0] ? /*className*/ ctx[0] : "") + " svelte-dqrry2"));
    			toggle_class(button, "p-button", true);
    			toggle_class(button, "p-component", true);
    			toggle_class(button, "p-button-icon-only", /*icon*/ ctx[3] && !/*label*/ ctx[2]);
    			toggle_class(button, "p-button-vertical", (/*iconPos*/ ctx[4] === "top" || /*iconPos*/ ctx[4] === "bottom") && /*label*/ ctx[2]);
    			toggle_class(button, "p-disabled", /*disabled*/ ctx[1]);
    			add_location(button, file$1, 9, 0, 177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			if_block1.m(button, null);
    			append_dev(button, t1);
    			if (if_block2) if_block2.m(button, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button, t1);
    				}
    			}

    			if (/*badge*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(button, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*disabled*/ 2) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*className*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*className*/ ctx[0] ? /*className*/ ctx[0] : "") + " svelte-dqrry2"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*className*/ 1) {
    				toggle_class(button, "p-button", true);
    			}

    			if (dirty & /*className*/ 1) {
    				toggle_class(button, "p-component", true);
    			}

    			if (dirty & /*className, icon, label*/ 13) {
    				toggle_class(button, "p-button-icon-only", /*icon*/ ctx[3] && !/*label*/ ctx[2]);
    			}

    			if (dirty & /*className, iconPos, label*/ 21) {
    				toggle_class(button, "p-button-vertical", (/*iconPos*/ ctx[4] === "top" || /*iconPos*/ ctx[4] === "bottom") && /*label*/ ctx[2]);
    			}

    			if (dirty & /*className, disabled*/ 3) {
    				toggle_class(button, "p-disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, []);
    	let { className } = $$props;
    	let { disabled } = $$props;
    	let { label } = $$props;
    	let { icon } = $$props;
    	let { iconPos = "left" } = $$props;
    	let { badge } = $$props;
    	let { badgeClass } = $$props;
    	const writable_props = ["className", "disabled", "label", "icon", "iconPos", "badge", "badgeClass"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("icon" in $$props) $$invalidate(3, icon = $$props.icon);
    		if ("iconPos" in $$props) $$invalidate(4, iconPos = $$props.iconPos);
    		if ("badge" in $$props) $$invalidate(5, badge = $$props.badge);
    		if ("badgeClass" in $$props) $$invalidate(6, badgeClass = $$props.badgeClass);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		disabled,
    		label,
    		icon,
    		iconPos,
    		badge,
    		badgeClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(0, className = $$props.className);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("icon" in $$props) $$invalidate(3, icon = $$props.icon);
    		if ("iconPos" in $$props) $$invalidate(4, iconPos = $$props.iconPos);
    		if ("badge" in $$props) $$invalidate(5, badge = $$props.badge);
    		if ("badgeClass" in $$props) $$invalidate(6, badgeClass = $$props.badgeClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [className, disabled, label, icon, iconPos, badge, badgeClass, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			className: 0,
    			disabled: 1,
    			label: 2,
    			icon: 3,
    			iconPos: 4,
    			badge: 5,
    			badgeClass: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*className*/ ctx[0] === undefined && !("className" in props)) {
    			console.warn("<Button> was created without expected prop 'className'");
    		}

    		if (/*disabled*/ ctx[1] === undefined && !("disabled" in props)) {
    			console.warn("<Button> was created without expected prop 'disabled'");
    		}

    		if (/*label*/ ctx[2] === undefined && !("label" in props)) {
    			console.warn("<Button> was created without expected prop 'label'");
    		}

    		if (/*icon*/ ctx[3] === undefined && !("icon" in props)) {
    			console.warn("<Button> was created without expected prop 'icon'");
    		}

    		if (/*badge*/ ctx[5] === undefined && !("badge" in props)) {
    			console.warn("<Button> was created without expected prop 'badge'");
    		}

    		if (/*badgeClass*/ ctx[6] === undefined && !("badgeClass" in props)) {
    			console.warn("<Button> was created without expected prop 'badgeClass'");
    		}
    	}

    	get className() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPos() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPos(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get badge() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set badge(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get badgeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set badgeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/showcase/button/ButtonDemo.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/showcase/button/ButtonDemo.svelte";

    function create_fragment$2(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div4;
    	let div3;
    	let h50;
    	let t5;
    	let button0;
    	let t6;
    	let button1;
    	let t7;
    	let button2;
    	let t8;
    	let h51;
    	let t10;
    	let button3;
    	let t11;
    	let button4;
    	let t12;
    	let button5;
    	let t13;
    	let h52;
    	let t15;
    	let button6;
    	let t16;
    	let button7;
    	let t17;
    	let button8;
    	let t18;
    	let button9;
    	let t19;
    	let button10;
    	let t20;
    	let button11;
    	let t21;
    	let button12;
    	let t22;
    	let h53;
    	let t24;
    	let button13;
    	let t25;
    	let button14;
    	let t26;
    	let button15;
    	let t27;
    	let button16;
    	let t28;
    	let button17;
    	let t29;
    	let button18;
    	let t30;
    	let button19;
    	let t31;
    	let h54;
    	let t33;
    	let button20;
    	let t34;
    	let button21;
    	let t35;
    	let button22;
    	let t36;
    	let button23;
    	let t37;
    	let button24;
    	let t38;
    	let button25;
    	let t39;
    	let button26;
    	let t40;
    	let h55;
    	let t42;
    	let button27;
    	let t43;
    	let button28;
    	let t44;
    	let button29;
    	let t45;
    	let button30;
    	let t46;
    	let button31;
    	let t47;
    	let button32;
    	let t48;
    	let button33;
    	let t49;
    	let button34;
    	let t50;
    	let h56;
    	let t52;
    	let button35;
    	let t53;
    	let button36;
    	let t54;
    	let button37;
    	let t55;
    	let button38;
    	let t56;
    	let button39;
    	let t57;
    	let button40;
    	let t58;
    	let button41;
    	let t59;
    	let button42;
    	let t60;
    	let h57;
    	let t62;
    	let button43;
    	let t63;
    	let button44;
    	let t64;
    	let button45;
    	let t65;
    	let button46;
    	let t66;
    	let button47;
    	let t67;
    	let button48;
    	let t68;
    	let button49;
    	let t69;
    	let h58;
    	let t71;
    	let button50;
    	let t72;
    	let button51;
    	let t73;
    	let button52;
    	let t74;
    	let button53;
    	let t75;
    	let button54;
    	let t76;
    	let button55;
    	let t77;
    	let button56;
    	let t78;
    	let h59;
    	let t80;
    	let button57;
    	let t81;
    	let button58;
    	let t82;
    	let button59;
    	let t83;
    	let button60;
    	let t84;
    	let button61;
    	let t85;
    	let button62;
    	let t86;
    	let button63;
    	let t87;
    	let button64;
    	let t88;
    	let h510;
    	let t90;
    	let button65;
    	let t91;
    	let button66;
    	let t92;
    	let button67;
    	let t93;
    	let button68;
    	let t94;
    	let button69;
    	let t95;
    	let button70;
    	let t96;
    	let button71;
    	let t97;
    	let h511;
    	let t99;
    	let button72;
    	let t100;
    	let button73;
    	let t101;
    	let h512;
    	let t103;
    	let span;
    	let button74;
    	let t104;
    	let button75;
    	let t105;
    	let button76;
    	let t106;
    	let h513;
    	let t108;
    	let div2;
    	let button77;
    	let t109;
    	let button78;
    	let t110;
    	let button79;
    	let current;

    	button0 = new Button({
    			props: { label: "Submit" },
    			$$inline: true
    		});

    	button1 = new Button({
    			props: { label: "Disabled", disabled: true },
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				label: "Link",
    				className: "p-button-link"
    			},
    			$$inline: true
    		});

    	button3 = new Button({
    			props: { icon: "pi pi-check" },
    			$$inline: true
    		});

    	button4 = new Button({
    			props: { label: "Submit", icon: "pi pi-check" },
    			$$inline: true
    		});

    	button5 = new Button({
    			props: {
    				label: "Submit",
    				icon: "pi pi-check",
    				iconPos: "right"
    			},
    			$$inline: true
    		});

    	button6 = new Button({
    			props: { label: "Primary" },
    			$$inline: true
    		});

    	button7 = new Button({
    			props: {
    				label: "Secondary",
    				className: "p-button-secondary"
    			},
    			$$inline: true
    		});

    	button8 = new Button({
    			props: {
    				label: "Success",
    				className: "p-button-success"
    			},
    			$$inline: true
    		});

    	button9 = new Button({
    			props: {
    				label: "Info",
    				className: "p-button-info"
    			},
    			$$inline: true
    		});

    	button10 = new Button({
    			props: {
    				label: "Warning",
    				className: "p-button-warning"
    			},
    			$$inline: true
    		});

    	button11 = new Button({
    			props: {
    				label: "Help",
    				className: "p-button-help"
    			},
    			$$inline: true
    		});

    	button12 = new Button({
    			props: {
    				label: "Danger",
    				className: "p-button-danger"
    			},
    			$$inline: true
    		});

    	button13 = new Button({
    			props: {
    				label: "Primary",
    				className: "p-button-raised"
    			},
    			$$inline: true
    		});

    	button14 = new Button({
    			props: {
    				label: "Secondary",
    				className: "p-button-raised p-button-secondary"
    			},
    			$$inline: true
    		});

    	button15 = new Button({
    			props: {
    				label: "Success",
    				className: "p-button-raised p-button-success"
    			},
    			$$inline: true
    		});

    	button16 = new Button({
    			props: {
    				label: "Info",
    				className: "p-button-raised p-button-info"
    			},
    			$$inline: true
    		});

    	button17 = new Button({
    			props: {
    				label: "Warning",
    				className: "p-button-raised p-button-warning"
    			},
    			$$inline: true
    		});

    	button18 = new Button({
    			props: {
    				label: "Help",
    				className: "p-button-raised p-button-help"
    			},
    			$$inline: true
    		});

    	button19 = new Button({
    			props: {
    				label: "Danger",
    				className: "p-button-raised p-button-danger"
    			},
    			$$inline: true
    		});

    	button20 = new Button({
    			props: {
    				label: "Primary",
    				className: "p-button-rounded"
    			},
    			$$inline: true
    		});

    	button21 = new Button({
    			props: {
    				label: "Secondary",
    				className: "p-button-rounded p-button-secondary"
    			},
    			$$inline: true
    		});

    	button22 = new Button({
    			props: {
    				label: "Success",
    				className: "p-button-rounded p-button-success"
    			},
    			$$inline: true
    		});

    	button23 = new Button({
    			props: {
    				label: "Info",
    				className: "p-button-rounded p-button-info"
    			},
    			$$inline: true
    		});

    	button24 = new Button({
    			props: {
    				label: "Warning",
    				className: "p-button-rounded p-button-warning"
    			},
    			$$inline: true
    		});

    	button25 = new Button({
    			props: {
    				label: "Help",
    				className: "p-button-rounded p-button-help"
    			},
    			$$inline: true
    		});

    	button26 = new Button({
    			props: {
    				label: "Danger",
    				className: "p-button-rounded p-button-danger"
    			},
    			$$inline: true
    		});

    	button27 = new Button({
    			props: {
    				label: "Primary",
    				className: "p-button-text"
    			},
    			$$inline: true
    		});

    	button28 = new Button({
    			props: {
    				label: "Secondary",
    				className: "p-button-secondary p-button-text"
    			},
    			$$inline: true
    		});

    	button29 = new Button({
    			props: {
    				label: "Success",
    				className: "p-button-success p-button-text"
    			},
    			$$inline: true
    		});

    	button30 = new Button({
    			props: {
    				label: "Info",
    				className: "p-button-info p-button-text"
    			},
    			$$inline: true
    		});

    	button31 = new Button({
    			props: {
    				label: "Warning",
    				className: "p-button-warning p-button-text"
    			},
    			$$inline: true
    		});

    	button32 = new Button({
    			props: {
    				label: "Help",
    				className: "p-button-help p-button-text"
    			},
    			$$inline: true
    		});

    	button33 = new Button({
    			props: {
    				label: "Danger",
    				className: "p-button-danger p-button-text"
    			},
    			$$inline: true
    		});

    	button34 = new Button({
    			props: {
    				label: "Plain",
    				className: "p-button-text p-button-plain"
    			},
    			$$inline: true
    		});

    	button35 = new Button({
    			props: {
    				label: "Primary",
    				className: "p-button-raised p-button-text"
    			},
    			$$inline: true
    		});

    	button36 = new Button({
    			props: {
    				label: "Secondary",
    				className: "p-button-raised p-button-secondary p-button-text"
    			},
    			$$inline: true
    		});

    	button37 = new Button({
    			props: {
    				label: "Success",
    				className: "p-button-raised p-button-success p-button-text"
    			},
    			$$inline: true
    		});

    	button38 = new Button({
    			props: {
    				label: "Info",
    				className: "p-button-raised p-button-info p-button-text"
    			},
    			$$inline: true
    		});

    	button39 = new Button({
    			props: {
    				label: "Warning",
    				className: "p-button-raised p-button-warning p-button-text"
    			},
    			$$inline: true
    		});

    	button40 = new Button({
    			props: {
    				label: "Help",
    				className: "p-button-raised p-button-help p-button-text"
    			},
    			$$inline: true
    		});

    	button41 = new Button({
    			props: {
    				label: "Danger",
    				className: "p-button-raised p-button-danger p-button-text"
    			},
    			$$inline: true
    		});

    	button42 = new Button({
    			props: {
    				label: "Plain",
    				className: "p-button-raised p-button-text p-button-plain"
    			},
    			$$inline: true
    		});

    	button43 = new Button({
    			props: {
    				label: "Primary",
    				className: "p-button-outlined"
    			},
    			$$inline: true
    		});

    	button44 = new Button({
    			props: {
    				label: "Secondary",
    				className: "p-button-outlined p-button-secondary"
    			},
    			$$inline: true
    		});

    	button45 = new Button({
    			props: {
    				label: "Success",
    				className: "p-button-outlined p-button-success"
    			},
    			$$inline: true
    		});

    	button46 = new Button({
    			props: {
    				label: "Info",
    				className: "p-button-outlined p-button-info"
    			},
    			$$inline: true
    		});

    	button47 = new Button({
    			props: {
    				label: "Warning",
    				className: "p-button-outlined p-button-warning"
    			},
    			$$inline: true
    		});

    	button48 = new Button({
    			props: {
    				label: "Help",
    				className: "p-button-outlined p-button-help"
    			},
    			$$inline: true
    		});

    	button49 = new Button({
    			props: {
    				label: "Danger",
    				className: "p-button-outlined p-button-danger"
    			},
    			$$inline: true
    		});

    	button50 = new Button({
    			props: {
    				icon: "pi pi-bookmark",
    				className: "p-button-rounded p-button-secondary"
    			},
    			$$inline: true
    		});

    	button51 = new Button({
    			props: {
    				icon: "pi pi-search",
    				className: "p-button-rounded p-button-success"
    			},
    			$$inline: true
    		});

    	button52 = new Button({
    			props: {
    				icon: "pi pi-user",
    				className: "p-button-rounded p-button-info"
    			},
    			$$inline: true
    		});

    	button53 = new Button({
    			props: {
    				icon: "pi pi-bell",
    				className: "p-button-rounded p-button-warning"
    			},
    			$$inline: true
    		});

    	button54 = new Button({
    			props: {
    				icon: "pi pi-heart",
    				className: "p-button-rounded p-button-help"
    			},
    			$$inline: true
    		});

    	button55 = new Button({
    			props: {
    				icon: "pi pi-times",
    				className: "p-button-rounded p-button-danger"
    			},
    			$$inline: true
    		});

    	button56 = new Button({
    			props: {
    				icon: "pi pi-check",
    				className: "p-button-rounded"
    			},
    			$$inline: true
    		});

    	button57 = new Button({
    			props: {
    				icon: "pi pi-check",
    				className: "p-button-rounded p-button-text"
    			},
    			$$inline: true
    		});

    	button58 = new Button({
    			props: {
    				icon: "pi pi-bookmark",
    				className: "p-button-rounded p-button-secondary p-button-text"
    			},
    			$$inline: true
    		});

    	button59 = new Button({
    			props: {
    				icon: "pi pi-search",
    				className: "p-button-rounded p-button-success p-button-text"
    			},
    			$$inline: true
    		});

    	button60 = new Button({
    			props: {
    				icon: "pi pi-user",
    				className: "p-button-rounded p-button-info p-button-text"
    			},
    			$$inline: true
    		});

    	button61 = new Button({
    			props: {
    				icon: "pi pi-bell",
    				className: "p-button-rounded p-button-warning p-button-text"
    			},
    			$$inline: true
    		});

    	button62 = new Button({
    			props: {
    				icon: "pi pi-heart",
    				className: "p-button-rounded p-button-help p-button-text"
    			},
    			$$inline: true
    		});

    	button63 = new Button({
    			props: {
    				icon: "pi pi-times",
    				className: "p-button-rounded p-button-danger p-button-text"
    			},
    			$$inline: true
    		});

    	button64 = new Button({
    			props: {
    				icon: "pi pi-filter",
    				className: "p-button-rounded p-button-text p-button-plain"
    			},
    			$$inline: true
    		});

    	button65 = new Button({
    			props: {
    				icon: "pi pi-check",
    				className: "p-button-rounded p-button-outlined"
    			},
    			$$inline: true
    		});

    	button66 = new Button({
    			props: {
    				icon: "pi pi-bookmark",
    				className: "p-button-rounded p-button-secondary p-button-outlined"
    			},
    			$$inline: true
    		});

    	button67 = new Button({
    			props: {
    				icon: "pi pi-search",
    				className: "p-button-rounded p-button-success p-button-outlined"
    			},
    			$$inline: true
    		});

    	button68 = new Button({
    			props: {
    				icon: "pi pi-user",
    				className: "p-button-rounded p-button-info p-button-outlined"
    			},
    			$$inline: true
    		});

    	button69 = new Button({
    			props: {
    				icon: "pi pi-bell",
    				className: "p-button-rounded p-button-warning p-button-outlined"
    			},
    			$$inline: true
    		});

    	button70 = new Button({
    			props: {
    				icon: "pi pi-heart",
    				className: "p-button-rounded p-button-help p-button-outlined"
    			},
    			$$inline: true
    		});

    	button71 = new Button({
    			props: {
    				icon: "pi pi-times",
    				className: "p-button-rounded p-button-danger p-button-outlined"
    			},
    			$$inline: true
    		});

    	button72 = new Button({
    			props: {
    				type: "button",
    				label: "Emails",
    				badge: "8"
    			},
    			$$inline: true
    		});

    	button73 = new Button({
    			props: {
    				type: "button",
    				label: "Messages",
    				icon: "pi pi-users",
    				className: "p-button-warning",
    				badge: "8",
    				badgeClass: "p-badge-danger"
    			},
    			$$inline: true
    		});

    	button74 = new Button({
    			props: { label: "Save", icon: "pi pi-check" },
    			$$inline: true
    		});

    	button75 = new Button({
    			props: { label: "Delete", icon: "pi pi-trash" },
    			$$inline: true
    		});

    	button76 = new Button({
    			props: { label: "Cancel", icon: "pi pi-times" },
    			$$inline: true
    		});

    	button77 = new Button({
    			props: {
    				label: "Small",
    				icon: "pi pi-check",
    				class: "p-button-sm"
    			},
    			$$inline: true
    		});

    	button78 = new Button({
    			props: {
    				label: "Normal",
    				icon: "pi pi-check",
    				class: "p-button"
    			},
    			$$inline: true
    		});

    	button79 = new Button({
    			props: {
    				label: "Large",
    				icon: "pi pi-check",
    				class: "p-button-lg"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Button";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Button is an extension to standard button element with icons and theming.";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Basic";
    			t5 = space();
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			create_component(button2.$$.fragment);
    			t8 = space();
    			h51 = element("h5");
    			h51.textContent = "Icons";
    			t10 = space();
    			create_component(button3.$$.fragment);
    			t11 = space();
    			create_component(button4.$$.fragment);
    			t12 = space();
    			create_component(button5.$$.fragment);
    			t13 = space();
    			h52 = element("h5");
    			h52.textContent = "Severities";
    			t15 = space();
    			create_component(button6.$$.fragment);
    			t16 = space();
    			create_component(button7.$$.fragment);
    			t17 = space();
    			create_component(button8.$$.fragment);
    			t18 = space();
    			create_component(button9.$$.fragment);
    			t19 = space();
    			create_component(button10.$$.fragment);
    			t20 = space();
    			create_component(button11.$$.fragment);
    			t21 = space();
    			create_component(button12.$$.fragment);
    			t22 = space();
    			h53 = element("h5");
    			h53.textContent = "Raised Buttons";
    			t24 = space();
    			create_component(button13.$$.fragment);
    			t25 = space();
    			create_component(button14.$$.fragment);
    			t26 = space();
    			create_component(button15.$$.fragment);
    			t27 = space();
    			create_component(button16.$$.fragment);
    			t28 = space();
    			create_component(button17.$$.fragment);
    			t29 = space();
    			create_component(button18.$$.fragment);
    			t30 = space();
    			create_component(button19.$$.fragment);
    			t31 = space();
    			h54 = element("h5");
    			h54.textContent = "Rounded Buttons";
    			t33 = space();
    			create_component(button20.$$.fragment);
    			t34 = space();
    			create_component(button21.$$.fragment);
    			t35 = space();
    			create_component(button22.$$.fragment);
    			t36 = space();
    			create_component(button23.$$.fragment);
    			t37 = space();
    			create_component(button24.$$.fragment);
    			t38 = space();
    			create_component(button25.$$.fragment);
    			t39 = space();
    			create_component(button26.$$.fragment);
    			t40 = space();
    			h55 = element("h5");
    			h55.textContent = "Text Buttons";
    			t42 = space();
    			create_component(button27.$$.fragment);
    			t43 = space();
    			create_component(button28.$$.fragment);
    			t44 = space();
    			create_component(button29.$$.fragment);
    			t45 = space();
    			create_component(button30.$$.fragment);
    			t46 = space();
    			create_component(button31.$$.fragment);
    			t47 = space();
    			create_component(button32.$$.fragment);
    			t48 = space();
    			create_component(button33.$$.fragment);
    			t49 = space();
    			create_component(button34.$$.fragment);
    			t50 = space();
    			h56 = element("h5");
    			h56.textContent = "Raised Text Buttons";
    			t52 = space();
    			create_component(button35.$$.fragment);
    			t53 = space();
    			create_component(button36.$$.fragment);
    			t54 = space();
    			create_component(button37.$$.fragment);
    			t55 = space();
    			create_component(button38.$$.fragment);
    			t56 = space();
    			create_component(button39.$$.fragment);
    			t57 = space();
    			create_component(button40.$$.fragment);
    			t58 = space();
    			create_component(button41.$$.fragment);
    			t59 = space();
    			create_component(button42.$$.fragment);
    			t60 = space();
    			h57 = element("h5");
    			h57.textContent = "Outlined Buttons";
    			t62 = space();
    			create_component(button43.$$.fragment);
    			t63 = space();
    			create_component(button44.$$.fragment);
    			t64 = space();
    			create_component(button45.$$.fragment);
    			t65 = space();
    			create_component(button46.$$.fragment);
    			t66 = space();
    			create_component(button47.$$.fragment);
    			t67 = space();
    			create_component(button48.$$.fragment);
    			t68 = space();
    			create_component(button49.$$.fragment);
    			t69 = space();
    			h58 = element("h5");
    			h58.textContent = "Rounded Icon Buttons";
    			t71 = space();
    			create_component(button50.$$.fragment);
    			t72 = space();
    			create_component(button51.$$.fragment);
    			t73 = space();
    			create_component(button52.$$.fragment);
    			t74 = space();
    			create_component(button53.$$.fragment);
    			t75 = space();
    			create_component(button54.$$.fragment);
    			t76 = space();
    			create_component(button55.$$.fragment);
    			t77 = space();
    			create_component(button56.$$.fragment);
    			t78 = space();
    			h59 = element("h5");
    			h59.textContent = "Rounded Text Icon Buttons";
    			t80 = space();
    			create_component(button57.$$.fragment);
    			t81 = space();
    			create_component(button58.$$.fragment);
    			t82 = space();
    			create_component(button59.$$.fragment);
    			t83 = space();
    			create_component(button60.$$.fragment);
    			t84 = space();
    			create_component(button61.$$.fragment);
    			t85 = space();
    			create_component(button62.$$.fragment);
    			t86 = space();
    			create_component(button63.$$.fragment);
    			t87 = space();
    			create_component(button64.$$.fragment);
    			t88 = space();
    			h510 = element("h5");
    			h510.textContent = "Rounded and Outlined Icon Buttons";
    			t90 = space();
    			create_component(button65.$$.fragment);
    			t91 = space();
    			create_component(button66.$$.fragment);
    			t92 = space();
    			create_component(button67.$$.fragment);
    			t93 = space();
    			create_component(button68.$$.fragment);
    			t94 = space();
    			create_component(button69.$$.fragment);
    			t95 = space();
    			create_component(button70.$$.fragment);
    			t96 = space();
    			create_component(button71.$$.fragment);
    			t97 = space();
    			h511 = element("h5");
    			h511.textContent = "Badges";
    			t99 = space();
    			create_component(button72.$$.fragment);
    			t100 = space();
    			create_component(button73.$$.fragment);
    			t101 = space();
    			h512 = element("h5");
    			h512.textContent = "Button Set";
    			t103 = space();
    			span = element("span");
    			create_component(button74.$$.fragment);
    			t104 = space();
    			create_component(button75.$$.fragment);
    			t105 = space();
    			create_component(button76.$$.fragment);
    			t106 = space();
    			h513 = element("h5");
    			h513.textContent = "Sizes";
    			t108 = space();
    			div2 = element("div");
    			create_component(button77.$$.fragment);
    			t109 = space();
    			create_component(button78.$$.fragment);
    			t110 = space();
    			create_component(button79.$$.fragment);
    			add_location(h1, file$2, 6, 12, 190);
    			add_location(p, file$2, 7, 12, 218);
    			attr_dev(div0, "class", "feature-intro");
    			add_location(div0, file$2, 5, 8, 150);
    			attr_dev(div1, "class", "content-section introduction");
    			add_location(div1, file$2, 4, 4, 99);
    			add_location(h50, file$2, 13, 12, 414);
    			add_location(h51, file$2, 19, 12, 662);
    			add_location(h52, file$2, 24, 12, 862);
    			add_location(h53, file$2, 33, 12, 1332);
    			add_location(h54, file$2, 42, 12, 1930);
    			add_location(h55, file$2, 51, 12, 2536);
    			add_location(h56, file$2, 61, 12, 3196);
    			add_location(h57, file$2, 71, 12, 3991);
    			add_location(h58, file$2, 80, 12, 4605);
    			add_location(h59, file$2, 89, 12, 5244);
    			add_location(h510, file$2, 99, 12, 6087);
    			add_location(h511, file$2, 108, 12, 6865);
    			add_location(h512, file$2, 112, 12, 7096);
    			attr_dev(span, "class", "p-buttonset");
    			add_location(span, file$2, 113, 12, 7128);
    			add_location(h513, file$2, 119, 12, 7369);
    			attr_dev(div2, "class", "sizes");
    			add_location(div2, file$2, 120, 12, 7396);
    			attr_dev(div3, "class", "card");
    			add_location(div3, file$2, 12, 8, 383);
    			attr_dev(div4, "class", "content-section implementation");
    			add_location(div4, file$2, 11, 4, 330);
    			add_location(div5, file$2, 3, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h50);
    			append_dev(div3, t5);
    			mount_component(button0, div3, null);
    			append_dev(div3, t6);
    			mount_component(button1, div3, null);
    			append_dev(div3, t7);
    			mount_component(button2, div3, null);
    			append_dev(div3, t8);
    			append_dev(div3, h51);
    			append_dev(div3, t10);
    			mount_component(button3, div3, null);
    			append_dev(div3, t11);
    			mount_component(button4, div3, null);
    			append_dev(div3, t12);
    			mount_component(button5, div3, null);
    			append_dev(div3, t13);
    			append_dev(div3, h52);
    			append_dev(div3, t15);
    			mount_component(button6, div3, null);
    			append_dev(div3, t16);
    			mount_component(button7, div3, null);
    			append_dev(div3, t17);
    			mount_component(button8, div3, null);
    			append_dev(div3, t18);
    			mount_component(button9, div3, null);
    			append_dev(div3, t19);
    			mount_component(button10, div3, null);
    			append_dev(div3, t20);
    			mount_component(button11, div3, null);
    			append_dev(div3, t21);
    			mount_component(button12, div3, null);
    			append_dev(div3, t22);
    			append_dev(div3, h53);
    			append_dev(div3, t24);
    			mount_component(button13, div3, null);
    			append_dev(div3, t25);
    			mount_component(button14, div3, null);
    			append_dev(div3, t26);
    			mount_component(button15, div3, null);
    			append_dev(div3, t27);
    			mount_component(button16, div3, null);
    			append_dev(div3, t28);
    			mount_component(button17, div3, null);
    			append_dev(div3, t29);
    			mount_component(button18, div3, null);
    			append_dev(div3, t30);
    			mount_component(button19, div3, null);
    			append_dev(div3, t31);
    			append_dev(div3, h54);
    			append_dev(div3, t33);
    			mount_component(button20, div3, null);
    			append_dev(div3, t34);
    			mount_component(button21, div3, null);
    			append_dev(div3, t35);
    			mount_component(button22, div3, null);
    			append_dev(div3, t36);
    			mount_component(button23, div3, null);
    			append_dev(div3, t37);
    			mount_component(button24, div3, null);
    			append_dev(div3, t38);
    			mount_component(button25, div3, null);
    			append_dev(div3, t39);
    			mount_component(button26, div3, null);
    			append_dev(div3, t40);
    			append_dev(div3, h55);
    			append_dev(div3, t42);
    			mount_component(button27, div3, null);
    			append_dev(div3, t43);
    			mount_component(button28, div3, null);
    			append_dev(div3, t44);
    			mount_component(button29, div3, null);
    			append_dev(div3, t45);
    			mount_component(button30, div3, null);
    			append_dev(div3, t46);
    			mount_component(button31, div3, null);
    			append_dev(div3, t47);
    			mount_component(button32, div3, null);
    			append_dev(div3, t48);
    			mount_component(button33, div3, null);
    			append_dev(div3, t49);
    			mount_component(button34, div3, null);
    			append_dev(div3, t50);
    			append_dev(div3, h56);
    			append_dev(div3, t52);
    			mount_component(button35, div3, null);
    			append_dev(div3, t53);
    			mount_component(button36, div3, null);
    			append_dev(div3, t54);
    			mount_component(button37, div3, null);
    			append_dev(div3, t55);
    			mount_component(button38, div3, null);
    			append_dev(div3, t56);
    			mount_component(button39, div3, null);
    			append_dev(div3, t57);
    			mount_component(button40, div3, null);
    			append_dev(div3, t58);
    			mount_component(button41, div3, null);
    			append_dev(div3, t59);
    			mount_component(button42, div3, null);
    			append_dev(div3, t60);
    			append_dev(div3, h57);
    			append_dev(div3, t62);
    			mount_component(button43, div3, null);
    			append_dev(div3, t63);
    			mount_component(button44, div3, null);
    			append_dev(div3, t64);
    			mount_component(button45, div3, null);
    			append_dev(div3, t65);
    			mount_component(button46, div3, null);
    			append_dev(div3, t66);
    			mount_component(button47, div3, null);
    			append_dev(div3, t67);
    			mount_component(button48, div3, null);
    			append_dev(div3, t68);
    			mount_component(button49, div3, null);
    			append_dev(div3, t69);
    			append_dev(div3, h58);
    			append_dev(div3, t71);
    			mount_component(button50, div3, null);
    			append_dev(div3, t72);
    			mount_component(button51, div3, null);
    			append_dev(div3, t73);
    			mount_component(button52, div3, null);
    			append_dev(div3, t74);
    			mount_component(button53, div3, null);
    			append_dev(div3, t75);
    			mount_component(button54, div3, null);
    			append_dev(div3, t76);
    			mount_component(button55, div3, null);
    			append_dev(div3, t77);
    			mount_component(button56, div3, null);
    			append_dev(div3, t78);
    			append_dev(div3, h59);
    			append_dev(div3, t80);
    			mount_component(button57, div3, null);
    			append_dev(div3, t81);
    			mount_component(button58, div3, null);
    			append_dev(div3, t82);
    			mount_component(button59, div3, null);
    			append_dev(div3, t83);
    			mount_component(button60, div3, null);
    			append_dev(div3, t84);
    			mount_component(button61, div3, null);
    			append_dev(div3, t85);
    			mount_component(button62, div3, null);
    			append_dev(div3, t86);
    			mount_component(button63, div3, null);
    			append_dev(div3, t87);
    			mount_component(button64, div3, null);
    			append_dev(div3, t88);
    			append_dev(div3, h510);
    			append_dev(div3, t90);
    			mount_component(button65, div3, null);
    			append_dev(div3, t91);
    			mount_component(button66, div3, null);
    			append_dev(div3, t92);
    			mount_component(button67, div3, null);
    			append_dev(div3, t93);
    			mount_component(button68, div3, null);
    			append_dev(div3, t94);
    			mount_component(button69, div3, null);
    			append_dev(div3, t95);
    			mount_component(button70, div3, null);
    			append_dev(div3, t96);
    			mount_component(button71, div3, null);
    			append_dev(div3, t97);
    			append_dev(div3, h511);
    			append_dev(div3, t99);
    			mount_component(button72, div3, null);
    			append_dev(div3, t100);
    			mount_component(button73, div3, null);
    			append_dev(div3, t101);
    			append_dev(div3, h512);
    			append_dev(div3, t103);
    			append_dev(div3, span);
    			mount_component(button74, span, null);
    			append_dev(span, t104);
    			mount_component(button75, span, null);
    			append_dev(span, t105);
    			mount_component(button76, span, null);
    			append_dev(div3, t106);
    			append_dev(div3, h513);
    			append_dev(div3, t108);
    			append_dev(div3, div2);
    			mount_component(button77, div2, null);
    			append_dev(div2, t109);
    			mount_component(button78, div2, null);
    			append_dev(div2, t110);
    			mount_component(button79, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(button4.$$.fragment, local);
    			transition_in(button5.$$.fragment, local);
    			transition_in(button6.$$.fragment, local);
    			transition_in(button7.$$.fragment, local);
    			transition_in(button8.$$.fragment, local);
    			transition_in(button9.$$.fragment, local);
    			transition_in(button10.$$.fragment, local);
    			transition_in(button11.$$.fragment, local);
    			transition_in(button12.$$.fragment, local);
    			transition_in(button13.$$.fragment, local);
    			transition_in(button14.$$.fragment, local);
    			transition_in(button15.$$.fragment, local);
    			transition_in(button16.$$.fragment, local);
    			transition_in(button17.$$.fragment, local);
    			transition_in(button18.$$.fragment, local);
    			transition_in(button19.$$.fragment, local);
    			transition_in(button20.$$.fragment, local);
    			transition_in(button21.$$.fragment, local);
    			transition_in(button22.$$.fragment, local);
    			transition_in(button23.$$.fragment, local);
    			transition_in(button24.$$.fragment, local);
    			transition_in(button25.$$.fragment, local);
    			transition_in(button26.$$.fragment, local);
    			transition_in(button27.$$.fragment, local);
    			transition_in(button28.$$.fragment, local);
    			transition_in(button29.$$.fragment, local);
    			transition_in(button30.$$.fragment, local);
    			transition_in(button31.$$.fragment, local);
    			transition_in(button32.$$.fragment, local);
    			transition_in(button33.$$.fragment, local);
    			transition_in(button34.$$.fragment, local);
    			transition_in(button35.$$.fragment, local);
    			transition_in(button36.$$.fragment, local);
    			transition_in(button37.$$.fragment, local);
    			transition_in(button38.$$.fragment, local);
    			transition_in(button39.$$.fragment, local);
    			transition_in(button40.$$.fragment, local);
    			transition_in(button41.$$.fragment, local);
    			transition_in(button42.$$.fragment, local);
    			transition_in(button43.$$.fragment, local);
    			transition_in(button44.$$.fragment, local);
    			transition_in(button45.$$.fragment, local);
    			transition_in(button46.$$.fragment, local);
    			transition_in(button47.$$.fragment, local);
    			transition_in(button48.$$.fragment, local);
    			transition_in(button49.$$.fragment, local);
    			transition_in(button50.$$.fragment, local);
    			transition_in(button51.$$.fragment, local);
    			transition_in(button52.$$.fragment, local);
    			transition_in(button53.$$.fragment, local);
    			transition_in(button54.$$.fragment, local);
    			transition_in(button55.$$.fragment, local);
    			transition_in(button56.$$.fragment, local);
    			transition_in(button57.$$.fragment, local);
    			transition_in(button58.$$.fragment, local);
    			transition_in(button59.$$.fragment, local);
    			transition_in(button60.$$.fragment, local);
    			transition_in(button61.$$.fragment, local);
    			transition_in(button62.$$.fragment, local);
    			transition_in(button63.$$.fragment, local);
    			transition_in(button64.$$.fragment, local);
    			transition_in(button65.$$.fragment, local);
    			transition_in(button66.$$.fragment, local);
    			transition_in(button67.$$.fragment, local);
    			transition_in(button68.$$.fragment, local);
    			transition_in(button69.$$.fragment, local);
    			transition_in(button70.$$.fragment, local);
    			transition_in(button71.$$.fragment, local);
    			transition_in(button72.$$.fragment, local);
    			transition_in(button73.$$.fragment, local);
    			transition_in(button74.$$.fragment, local);
    			transition_in(button75.$$.fragment, local);
    			transition_in(button76.$$.fragment, local);
    			transition_in(button77.$$.fragment, local);
    			transition_in(button78.$$.fragment, local);
    			transition_in(button79.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(button4.$$.fragment, local);
    			transition_out(button5.$$.fragment, local);
    			transition_out(button6.$$.fragment, local);
    			transition_out(button7.$$.fragment, local);
    			transition_out(button8.$$.fragment, local);
    			transition_out(button9.$$.fragment, local);
    			transition_out(button10.$$.fragment, local);
    			transition_out(button11.$$.fragment, local);
    			transition_out(button12.$$.fragment, local);
    			transition_out(button13.$$.fragment, local);
    			transition_out(button14.$$.fragment, local);
    			transition_out(button15.$$.fragment, local);
    			transition_out(button16.$$.fragment, local);
    			transition_out(button17.$$.fragment, local);
    			transition_out(button18.$$.fragment, local);
    			transition_out(button19.$$.fragment, local);
    			transition_out(button20.$$.fragment, local);
    			transition_out(button21.$$.fragment, local);
    			transition_out(button22.$$.fragment, local);
    			transition_out(button23.$$.fragment, local);
    			transition_out(button24.$$.fragment, local);
    			transition_out(button25.$$.fragment, local);
    			transition_out(button26.$$.fragment, local);
    			transition_out(button27.$$.fragment, local);
    			transition_out(button28.$$.fragment, local);
    			transition_out(button29.$$.fragment, local);
    			transition_out(button30.$$.fragment, local);
    			transition_out(button31.$$.fragment, local);
    			transition_out(button32.$$.fragment, local);
    			transition_out(button33.$$.fragment, local);
    			transition_out(button34.$$.fragment, local);
    			transition_out(button35.$$.fragment, local);
    			transition_out(button36.$$.fragment, local);
    			transition_out(button37.$$.fragment, local);
    			transition_out(button38.$$.fragment, local);
    			transition_out(button39.$$.fragment, local);
    			transition_out(button40.$$.fragment, local);
    			transition_out(button41.$$.fragment, local);
    			transition_out(button42.$$.fragment, local);
    			transition_out(button43.$$.fragment, local);
    			transition_out(button44.$$.fragment, local);
    			transition_out(button45.$$.fragment, local);
    			transition_out(button46.$$.fragment, local);
    			transition_out(button47.$$.fragment, local);
    			transition_out(button48.$$.fragment, local);
    			transition_out(button49.$$.fragment, local);
    			transition_out(button50.$$.fragment, local);
    			transition_out(button51.$$.fragment, local);
    			transition_out(button52.$$.fragment, local);
    			transition_out(button53.$$.fragment, local);
    			transition_out(button54.$$.fragment, local);
    			transition_out(button55.$$.fragment, local);
    			transition_out(button56.$$.fragment, local);
    			transition_out(button57.$$.fragment, local);
    			transition_out(button58.$$.fragment, local);
    			transition_out(button59.$$.fragment, local);
    			transition_out(button60.$$.fragment, local);
    			transition_out(button61.$$.fragment, local);
    			transition_out(button62.$$.fragment, local);
    			transition_out(button63.$$.fragment, local);
    			transition_out(button64.$$.fragment, local);
    			transition_out(button65.$$.fragment, local);
    			transition_out(button66.$$.fragment, local);
    			transition_out(button67.$$.fragment, local);
    			transition_out(button68.$$.fragment, local);
    			transition_out(button69.$$.fragment, local);
    			transition_out(button70.$$.fragment, local);
    			transition_out(button71.$$.fragment, local);
    			transition_out(button72.$$.fragment, local);
    			transition_out(button73.$$.fragment, local);
    			transition_out(button74.$$.fragment, local);
    			transition_out(button75.$$.fragment, local);
    			transition_out(button76.$$.fragment, local);
    			transition_out(button77.$$.fragment, local);
    			transition_out(button78.$$.fragment, local);
    			transition_out(button79.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    			destroy_component(button3);
    			destroy_component(button4);
    			destroy_component(button5);
    			destroy_component(button6);
    			destroy_component(button7);
    			destroy_component(button8);
    			destroy_component(button9);
    			destroy_component(button10);
    			destroy_component(button11);
    			destroy_component(button12);
    			destroy_component(button13);
    			destroy_component(button14);
    			destroy_component(button15);
    			destroy_component(button16);
    			destroy_component(button17);
    			destroy_component(button18);
    			destroy_component(button19);
    			destroy_component(button20);
    			destroy_component(button21);
    			destroy_component(button22);
    			destroy_component(button23);
    			destroy_component(button24);
    			destroy_component(button25);
    			destroy_component(button26);
    			destroy_component(button27);
    			destroy_component(button28);
    			destroy_component(button29);
    			destroy_component(button30);
    			destroy_component(button31);
    			destroy_component(button32);
    			destroy_component(button33);
    			destroy_component(button34);
    			destroy_component(button35);
    			destroy_component(button36);
    			destroy_component(button37);
    			destroy_component(button38);
    			destroy_component(button39);
    			destroy_component(button40);
    			destroy_component(button41);
    			destroy_component(button42);
    			destroy_component(button43);
    			destroy_component(button44);
    			destroy_component(button45);
    			destroy_component(button46);
    			destroy_component(button47);
    			destroy_component(button48);
    			destroy_component(button49);
    			destroy_component(button50);
    			destroy_component(button51);
    			destroy_component(button52);
    			destroy_component(button53);
    			destroy_component(button54);
    			destroy_component(button55);
    			destroy_component(button56);
    			destroy_component(button57);
    			destroy_component(button58);
    			destroy_component(button59);
    			destroy_component(button60);
    			destroy_component(button61);
    			destroy_component(button62);
    			destroy_component(button63);
    			destroy_component(button64);
    			destroy_component(button65);
    			destroy_component(button66);
    			destroy_component(button67);
    			destroy_component(button68);
    			destroy_component(button69);
    			destroy_component(button70);
    			destroy_component(button71);
    			destroy_component(button72);
    			destroy_component(button73);
    			destroy_component(button74);
    			destroy_component(button75);
    			destroy_component(button76);
    			destroy_component(button77);
    			destroy_component(button78);
    			destroy_component(button79);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonDemo", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonDemo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Button });
    	return [];
    }

    class ButtonDemo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonDemo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/checkbox/Checkbox.svelte generated by Svelte v3.29.4 */

    const file$3 = "src/components/checkbox/Checkbox.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let input;
    	let t;
    	let div1;
    	let span;
    	let div2_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t = space();
    			div1 = element("div");
    			span = element("span");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			add_location(input, file$3, 13, 8, 304);
    			attr_dev(div0, "class", "p-hidden-accessible");
    			add_location(div0, file$3, 12, 4, 262);
    			toggle_class(span, "p-checkbox-icon", true);
    			toggle_class(span, "pi", /*checked*/ ctx[0]);
    			toggle_class(span, "pi-check", /*checked*/ ctx[0]);
    			add_location(span, file$3, 20, 9, 488);
    			attr_dev(div1, "role", "checkbox");
    			attr_dev(div1, "class", "svelte-1pabray");
    			toggle_class(div1, "p-checkbox-box", true);
    			toggle_class(div1, "p-highlight", /*checked*/ ctx[0]);
    			add_location(div1, file$3, 15, 4, 372);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*className*/ ctx[1] ? /*className*/ ctx[1] : "") + " svelte-1pabray"));
    			toggle_class(div2, "p-checkbox", true);
    			toggle_class(div2, "p-component", true);
    			toggle_class(div2, "p-checkbox-checked", /*checked*/ ctx[0]);
    			add_location(div2, file$3, 6, 0, 115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, span);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*checked*/ 1) {
    				toggle_class(span, "pi", /*checked*/ ctx[0]);
    			}

    			if (dirty & /*checked*/ 1) {
    				toggle_class(span, "pi-check", /*checked*/ ctx[0]);
    			}

    			if (dirty & /*checked*/ 1) {
    				toggle_class(div1, "p-highlight", /*checked*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*className*/ ctx[1] ? /*className*/ ctx[1] : "") + " svelte-1pabray"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*className*/ 2) {
    				toggle_class(div2, "p-checkbox", true);
    			}

    			if (dirty & /*className*/ 2) {
    				toggle_class(div2, "p-component", true);
    			}

    			if (dirty & /*className, checked*/ 3) {
    				toggle_class(div2, "p-checkbox-checked", /*checked*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", slots, []);
    	let { className } = $$props;
    	let { id } = $$props;
    	let { disabled } = $$props;
    	let { checked = false } = $$props;
    	const writable_props = ["className", "id", "disabled", "checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("className" in $$props) $$invalidate(1, className = $$props.className);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ className, id, disabled, checked });

    	$$self.$inject_state = $$props => {
    		if ("className" in $$props) $$invalidate(1, className = $$props.className);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, className, id, disabled, input_change_handler];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			className: 1,
    			id: 2,
    			disabled: 3,
    			checked: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*className*/ ctx[1] === undefined && !("className" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'className'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'id'");
    		}

    		if (/*disabled*/ ctx[3] === undefined && !("disabled" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'disabled'");
    		}
    	}

    	get className() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/showcase/checkbox/CheckboxDemo.svelte generated by Svelte v3.29.4 */
    const file$4 = "src/showcase/checkbox/CheckboxDemo.svelte";

    function create_fragment$4(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div4;
    	let div3;
    	let h50;
    	let t5;
    	let div2;
    	let checkbox;
    	let updating_checked;
    	let t6;
    	let label;
    	let t7;
    	let t8;
    	let h51;
    	let t10;
    	let h52;
    	let t12;
    	let current;

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[1].call(null, value);
    	}

    	let checkbox_props = { id: "binary" };

    	if (/*checked*/ ctx[0] !== void 0) {
    		checkbox_props.checked = /*checked*/ ctx[0];
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, "checked", checkbox_checked_binding));

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Checkbox";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Checkbox is an extension to standard checkbox element with theming.";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Basic";
    			t5 = space();
    			div2 = element("div");
    			create_component(checkbox.$$.fragment);
    			t6 = space();
    			label = element("label");
    			t7 = text(/*checked*/ ctx[0]);
    			t8 = space();
    			h51 = element("h5");
    			h51.textContent = "Multiple";
    			t10 = text("\n            TBD\n\n            ");
    			h52 = element("h5");
    			h52.textContent = "Dynamic Values, Preselection, Value Binding and Disabled Option";
    			t12 = text("\n            TBD");
    			add_location(h1, file$4, 7, 12, 217);
    			add_location(p, file$4, 8, 12, 247);
    			attr_dev(div0, "class", "feature-intro");
    			add_location(div0, file$4, 6, 8, 177);
    			attr_dev(div1, "class", "content-section introduction");
    			add_location(div1, file$4, 5, 4, 126);
    			add_location(h50, file$4, 14, 12, 437);
    			attr_dev(label, "for", "binary");
    			add_location(label, file$4, 17, 16, 576);
    			attr_dev(div2, "class", "p-field-checkbox");
    			add_location(div2, file$4, 15, 12, 464);
    			add_location(h51, file$4, 20, 12, 646);
    			add_location(h52, file$4, 23, 12, 693);
    			attr_dev(div3, "class", "card");
    			add_location(div3, file$4, 13, 8, 406);
    			attr_dev(div4, "class", "content-section implementation");
    			add_location(div4, file$4, 12, 4, 353);
    			add_location(div5, file$4, 4, 0, 116);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h50);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			mount_component(checkbox, div2, null);
    			append_dev(div2, t6);
    			append_dev(div2, label);
    			append_dev(label, t7);
    			append_dev(div3, t8);
    			append_dev(div3, h51);
    			append_dev(div3, t10);
    			append_dev(div3, h52);
    			append_dev(div3, t12);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const checkbox_changes = {};

    			if (!updating_checked && dirty & /*checked*/ 1) {
    				updating_checked = true;
    				checkbox_changes.checked = /*checked*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);
    			if (!current || dirty & /*checked*/ 1) set_data_dev(t7, /*checked*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(checkbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckboxDemo", slots, []);
    	let checked = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckboxDemo> was created with unknown prop '${key}'`);
    	});

    	function checkbox_checked_binding(value) {
    		checked = value;
    		$$invalidate(0, checked);
    	}

    	$$self.$capture_state = () => ({ Checkbox, checked });

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, checkbox_checked_binding];
    }

    class CheckboxDemo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckboxDemo",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix) {
    				if (typeof prefix == "string" && path.startsWith(prefix)) {
    					path = path.substr(prefix.length) || "/";
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */
    const file$5 = "src/App.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let appmenu;
    	let t;
    	let div0;
    	let router;
    	let current;
    	appmenu = new AppMenu({ $$inline: true });

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(appmenu.$$.fragment);
    			t = space();
    			div0 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "layout-content");
    			add_location(div0, file$5, 13, 1, 379);
    			attr_dev(div1, "class", "layout-wrapper");
    			add_location(div1, file$5, 11, 0, 337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(appmenu, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(router, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appmenu.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appmenu.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(appmenu);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const routes = {
    		"/": ButtonDemo,
    		"/button": ButtonDemo,
    		"/checkbox": CheckboxDemo
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		AppMenu,
    		ButtonDemo,
    		CheckboxDemo,
    		Router,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
