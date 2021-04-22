
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    function loader (urls, test, callback) {
      let remaining = urls.length;

      function maybeCallback () {
        remaining = --remaining;
        if (remaining < 1) {
          callback();
        }
      }

      if (!test()) {
        urls.forEach(({ type, url, options = { async: true, defer: true }}) => {
          const isScript = type === 'script';
          const tag = document.createElement(isScript ? 'script': 'link');
          if (isScript) {
            tag.src = url;
            tag.async = options.async;
            tag.defer = options.defer;
          } else {
            tag.rel = 'stylesheet';
    		    tag.href = url;
          }
          tag.onload = maybeCallback;
          document.body.appendChild(tag);
        });
      } else {
        callback();
      }
    }

    const subscriber_queue = [];
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

    const gaStore = writable([]);

    /* node_modules\@beyonk\svelte-google-analytics\src\GoogleAnalytics.svelte generated by Svelte v3.37.0 */

    function create_fragment$a(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function test() {
    	return Boolean(window.dataLayer).valueOf() && Array.isArray(window.dataLayer);
    }

    function gtag() {
    	window.dataLayer.push(arguments);
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GoogleAnalytics", slots, []);
    	let { properties } = $$props;
    	let { configurations = {} } = $$props;
    	let { enabled = true } = $$props;

    	onMount(() => {
    		if (!enabled) {
    			return;
    		}

    		init();
    	});

    	function init() {
    		const mainProperty = properties[0];

    		loader(
    			[
    				{
    					type: "script",
    					url: `//www.googletagmanager.com/gtag/js?id=${mainProperty}`
    				}
    			],
    			test,
    			callback
    		);
    	}

    	function callback() {
    		window.dataLayer = window.dataLayer || [];
    		gtag("js", new Date());

    		properties.forEach(p => {
    			gtag("config", p, configurations[p] || {});
    		});

    		return gaStore.subscribe(queue => {
    			let next = queue.length && queue.shift();

    			while (next) {
    				const { event, data } = next;
    				gtag("event", event, data);
    				next = queue.shift();
    			}
    		});
    	}

    	const writable_props = ["properties", "configurations", "enabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GoogleAnalytics> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("properties" in $$props) $$invalidate(0, properties = $$props.properties);
    		if ("configurations" in $$props) $$invalidate(1, configurations = $$props.configurations);
    		if ("enabled" in $$props) $$invalidate(2, enabled = $$props.enabled);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		loader,
    		gaStore,
    		properties,
    		configurations,
    		enabled,
    		init,
    		test,
    		gtag,
    		callback
    	});

    	$$self.$inject_state = $$props => {
    		if ("properties" in $$props) $$invalidate(0, properties = $$props.properties);
    		if ("configurations" in $$props) $$invalidate(1, configurations = $$props.configurations);
    		if ("enabled" in $$props) $$invalidate(2, enabled = $$props.enabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [properties, configurations, enabled, init];
    }

    class GoogleAnalytics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			properties: 0,
    			configurations: 1,
    			enabled: 2,
    			init: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoogleAnalytics",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*properties*/ ctx[0] === undefined && !("properties" in props)) {
    			console.warn("<GoogleAnalytics> was created without expected prop 'properties'");
    		}
    	}

    	get properties() {
    		throw new Error("<GoogleAnalytics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set properties(value) {
    		throw new Error("<GoogleAnalytics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get configurations() {
    		throw new Error("<GoogleAnalytics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set configurations(value) {
    		throw new Error("<GoogleAnalytics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get enabled() {
    		throw new Error("<GoogleAnalytics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enabled(value) {
    		throw new Error("<GoogleAnalytics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get init() {
    		return this.$$.ctx[3];
    	}

    	set init(value) {
    		throw new Error("<GoogleAnalytics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function addEvent (event, data) {
        if (!data.send_to) { delete data.send_to; }
        gaStore.update(exisiting => [ ...exisiting, { event, data } ]);
      }

          /**
           * all events
           * https://support.google.com/analytics/answer/9267735
           * **/
          const all = { /**
              * when a user has earned virtual currency
              **/
              earnVirtualCurrency: function eventName (virtual_currency_name, value, send_to) {
                addEvent('earn_virtual_currency', { virtual_currency_name, value, send_to });
              },/**
              * when a user joins a group
              **/
              joinGroup: function eventName (group_id, send_to) {
                addEvent('join_group', { group_id, send_to });
              },/**
              * when a user logs in.
              **/
              login: function eventName (method, send_to) {
                addEvent('login', { method, send_to });
              },/**
              * when a user completes a purchase
              **/
              purchase: function eventName (transaction_id, value, currency, tax, shipping, items, coupon, send_to) {
                addEvent('purchase', { transaction_id, value, currency, tax, shipping, items, coupon, send_to });
              },/**
              * when a user receives a refund
              **/
              refund: function eventName (transaction_id, value, currency, tax, shipping, items, send_to) {
                addEvent('refund', { transaction_id, value, currency, tax, shipping, items, send_to });
              },/**
              * when a user searches your content
              **/
              search: function eventName (search_term, send_to) {
                addEvent('search', { search_term, send_to });
              },/**
              * when a user has selected content
              **/
              selectContent: function eventName (content_type, item_id, send_to) {
                addEvent('select_content', { content_type, item_id, send_to });
              },/**
              * when a user has shared content
              **/
              share: function eventName (content_type, item_id, send_to) {
                addEvent('share', { content_type, item_id, send_to });
              },/**
              * 
              **/
              signUp: function eventName (method, send_to) {
                addEvent('sign_up', { method, send_to });
              },/**
              * when a user has spent virtual currency (coins, gems, tokens, etc.)
              **/
              spendVirtualCurrency: function eventName (item_name, virtual_currency_name, value, send_to) {
                addEvent('spend_virtual_currency', { item_name, virtual_currency_name, value, send_to });
              },/**
              * when a user begins a tutorial
              **/
              tutorialBegin: function eventName () {
                addEvent('tutorial_begin', {  });
              },/**
              * When a user completes a tutorial
              **/
              tutorialComplete: function eventName () {
                addEvent('tutorial_complete', {  });
              } };
        

          /**
           * ecommerce events
           * https://support.google.com/analytics/answer/9268036
           * **/
          const ecommerce = { /**
              * when a user submits their payment information
              **/
              addPaymentInfo: function eventName (coupon, currency, items, payment_type, value, send_to) {
                addEvent('add_payment_info', { coupon, currency, items, payment_type, value, send_to });
              },/**
              * when a user submits their shipping information
              **/
              addShippingInfo: function eventName (coupon, currency, items, shipping_tier, value, send_to) {
                addEvent('add_shipping_info', { coupon, currency, items, shipping_tier, value, send_to });
              },/**
              * when a user adds items to cart
              **/
              addToCart: function eventName (currency, items, value, send_to) {
                addEvent('add_to_cart', { currency, items, value, send_to });
              },/**
              * when a user adds items to a wishlist
              **/
              addToWishlist: function eventName (currency, items, value, send_to) {
                addEvent('add_to_wishlist', { currency, items, value, send_to });
              },/**
              * when a user begins checkout
              **/
              beginCheckout: function eventName (coupon, currency, items, value, send_to) {
                addEvent('begin_checkout', { coupon, currency, items, value, send_to });
              },/**
              * when a user submits a form or request for information
              **/
              generateLead: function eventName (value, currency, send_to) {
                addEvent('generate_lead', { value, currency, send_to });
              },/**
              * when a user completes a purchase
              **/
              purchase: function eventName (affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to) {
                addEvent('purchase', { affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to });
              },/**
              * when a refund is issued
              **/
              refund: function eventName (affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to) {
                addEvent('refund', { affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to });
              },/**
              * when a user removes items from a cart
              **/
              removeFromCart: function eventName (currency, items, value, send_to) {
                addEvent('remove_from_cart', { currency, items, value, send_to });
              },/**
              * when an item is selected from a list
              **/
              selectItem: function eventName (items, item_list_name, item_list_id, send_to) {
                addEvent('select_item', { items, item_list_name, item_list_id, send_to });
              },/**
              * when a user selects a promotion
              **/
              selectPromotion: function eventName (items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to) {
                addEvent('select_promotion', { items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to });
              },/**
              * when a user views their cart
              **/
              viewCart: function eventName (currency, items, value, send_to) {
                addEvent('view_cart', { currency, items, value, send_to });
              },/**
              * when a user views an item
              **/
              viewItem: function eventName (currency, items, value, send_to) {
                addEvent('view_item', { currency, items, value, send_to });
              },/**
              * when a user sees a list of items/offerings
              **/
              viewItemList: function eventName (items, item_list_name, item_list_id, send_to) {
                addEvent('view_item_list', { items, item_list_name, item_list_id, send_to });
              },/**
              * when a promotion is shown to a user
              **/
              viewPromotion: function eventName (items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to) {
                addEvent('view_promotion', { items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to });
              } };
        

          /**
           * retail events
           * https://support.google.com/analytics/answer/9268037
           * **/
          const retail = { /**
              * when a user submits their payment information
              **/
              addPaymentInfo: function eventName (coupon, currency, items, payment_type, value, send_to) {
                addEvent('add_payment_info', { coupon, currency, items, payment_type, value, send_to });
              },/**
              * when a user submits their shipping information
              **/
              addShippingInfo: function eventName (coupon, currency, items, shipping_tier, value, send_to) {
                addEvent('add_shipping_info', { coupon, currency, items, shipping_tier, value, send_to });
              },/**
              * when a user adds items to cart
              **/
              addToCart: function eventName (currency, items, value, send_to) {
                addEvent('add_to_cart', { currency, items, value, send_to });
              },/**
              * when a user adds items to a wishlist
              **/
              addToWishlist: function eventName (currency, items, value, send_to) {
                addEvent('add_to_wishlist', { currency, items, value, send_to });
              },/**
              * when a user begins checkout
              **/
              beginCheckout: function eventName (coupon, currency, items, value, send_to) {
                addEvent('begin_checkout', { coupon, currency, items, value, send_to });
              },/**
              * when items are purchased by a user
              **/
              purchase: function eventName (affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to) {
                addEvent('purchase', { affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to });
              },/**
              * when a refund is issued
              **/
              refund: function eventName (affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to) {
                addEvent('refund', { affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to });
              },/**
              * when a user removes items from a cart
              **/
              removeFromCart: function eventName (currency, items, value, send_to) {
                addEvent('remove_from_cart', { currency, items, value, send_to });
              },/**
              * when an item is selected from a list
              **/
              selectItem: function eventName (items, item_list_name, item_list_id, send_to) {
                addEvent('select_item', { items, item_list_name, item_list_id, send_to });
              },/**
              * when a user selects a promotion
              **/
              selectPromotion: function eventName (items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to) {
                addEvent('select_promotion', { items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to });
              },/**
              * when a user views their cart
              **/
              viewCart: function eventName (currency, items, value, send_to) {
                addEvent('view_cart', { currency, items, value, send_to });
              },/**
              * when a user views an item
              **/
              viewItem: function eventName (currency, items, value, send_to) {
                addEvent('view_item', { currency, items, value, send_to });
              },/**
              * when a user sees a list of items/offerings
              **/
              viewItemList: function eventName (items, item_list_name, item_list_id, send_to) {
                addEvent('view_item_list', { items, item_list_name, item_list_id, send_to });
              },/**
              * when a promotion is shown to a user
              **/
              viewPromotion: function eventName (items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to) {
                addEvent('view_promotion', { items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to });
              } };
        

          /**
           * travel events
           * https://support.google.com/analytics/answer/9267738
           * **/
          const travel = { /**
              * when a user submits their payment information
              **/
              addPaymentInfo: function eventName (coupon, currency, items, payment_type, value, send_to) {
                addEvent('add_payment_info', { coupon, currency, items, payment_type, value, send_to });
              },/**
              * when a user submits their shipping information
              **/
              addShippingInfo: function eventName (coupon, currency, items, shipping_tier, value, send_to) {
                addEvent('add_shipping_info', { coupon, currency, items, shipping_tier, value, send_to });
              },/**
              * when a user adds items to cart
              **/
              addToCart: function eventName (currency, items, value, send_to) {
                addEvent('add_to_cart', { currency, items, value, send_to });
              },/**
              * when a user adds items to a wishlist
              **/
              addToWishlist: function eventName (currency, items, value, send_to) {
                addEvent('add_to_wishlist', { currency, items, value, send_to });
              },/**
              * when a user begins checkout
              **/
              beginCheckout: function eventName (coupon, currency, items, value, send_to) {
                addEvent('begin_checkout', { coupon, currency, items, value, send_to });
              },/**
              * when a user submits a form or request for information
              **/
              generateLead: function eventName (value, currency, send_to) {
                addEvent('generate_lead', { value, currency, send_to });
              },/**
              * when items are purchased by a user
              **/
              purchase: function eventName (affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to) {
                addEvent('purchase', { affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to });
              },/**
              * when a refund is issued
              **/
              refund: function eventName (affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to) {
                addEvent('refund', { affiliation, coupon, currency, items, transaction_id, shipping, tax, value, send_to });
              },/**
              * when a user removes items from a cart
              **/
              removeFromCart: function eventName (currency, items, value, send_to) {
                addEvent('remove_from_cart', { currency, items, value, send_to });
              },/**
              * when an item is selected from a list
              **/
              selectItem: function eventName (items, item_list_name, item_list_id, send_to) {
                addEvent('select_item', { items, item_list_name, item_list_id, send_to });
              },/**
              * when a user selects a promotion
              **/
              selectPromotion: function eventName (items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to) {
                addEvent('select_promotion', { items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to });
              },/**
              * when a user views their cart
              **/
              viewCart: function eventName (currency, items, value, send_to) {
                addEvent('view_cart', { currency, items, value, send_to });
              },/**
              * when a user views an item
              **/
              viewItem: function eventName (currency, items, value, send_to) {
                addEvent('view_item', { currency, items, value, send_to });
              },/**
              * when a user sees a list of items/offerings
              **/
              viewItemList: function eventName (items, item_list_name, item_list_id, send_to) {
                addEvent('view_item_list', { items, item_list_name, item_list_id, send_to });
              },/**
              * when a promotion is shown to a user
              **/
              viewPromotion: function eventName (items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to) {
                addEvent('view_promotion', { items, promotion_id, promotion_name, creative_name, creative_slot, location_id, send_to });
              } };
        

          /**
           * games events
           * https://support.google.com/analytics/answer/9267565
           * **/
          const games = { /**
              * when a user has earned virtual currency (coins, gems, tokens, etc.)
              **/
              earnVirtualCurrency: function eventName (virtual_currency_name, value, send_to) {
                addEvent('earn_virtual_currency', { virtual_currency_name, value, send_to });
              },/**
              * when a user joins a group. Allows you to track the popularity of various clans or user groups
              **/
              joinGroup: function eventName (group_id, send_to) {
                addEvent('join_group', { group_id, send_to });
              },/**
              * when a user completes a level in the game
              **/
              levelEnd: function eventName (level_name, success, send_to) {
                addEvent('level_end', { level_name, success, send_to });
              },/**
              * when a user starts a new level in the game
              **/
              levelStart: function eventName (level_name, send_to) {
                addEvent('level_start', { level_name, send_to });
              },/**
              * when a player levels-up in the game
              **/
              levelUp: function eventName (character, level, send_to) {
                addEvent('level_up', { character, level, send_to });
              },/**
              * when a player posts his or her score
              **/
              postScore: function eventName (level, character, score, send_to) {
                addEvent('post_score', { level, character, score, send_to });
              },/**
              * when a user has selected content
              **/
              selectContent: function eventName (content_type, item_id, send_to) {
                addEvent('select_content', { content_type, item_id, send_to });
              },/**
              * when a user has spent virtual currency (coins, gems, tokens, etc.)
              **/
              spendVirtualCurrency: function eventName (item_name, virtual_currency_name, value, send_to) {
                addEvent('spend_virtual_currency', { item_name, virtual_currency_name, value, send_to });
              },/**
              * when a user begins a tutorial
              **/
              tutorialBegin: function eventName () {
                addEvent('tutorial_begin', {  });
              },/**
              * when a user completes a tutorial
              **/
              tutorialComplete: function eventName () {
                addEvent('tutorial_complete', {  });
              },/**
              * when a player unlocks an achievement
              **/
              unlockAchievement: function eventName (achievement_id, send_to) {
                addEvent('unlock_achievement', { achievement_id, send_to });
              } };

    var ga = /*#__PURE__*/Object.freeze({
        __proto__: null,
        addEvent: addEvent,
        all: all,
        ecommerce: ecommerce,
        retail: retail,
        travel: travel,
        games: games
    });

    /* src\components\specific\LeetHackExample.svelte generated by Svelte v3.37.0 */
    const file$9 = "src\\components\\specific\\LeetHackExample.svelte";

    // (37:4) {#if showHint}
    function create_if_block_4(ctx) {
    	let span;
    	let em;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			em = element("em");
    			em.textContent = "1a2b3c";
    			t1 = text(" would in this example equal 6...");
    			add_location(em, file$9, 37, 12, 1436);
    			add_location(span, file$9, 37, 6, 1430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, em);
    			append_dev(span, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(37:4) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {:else}
    function create_else_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = " ";
    			add_location(p, file$9, 69, 6, 2385);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(69:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:4) {#if answer !== undefined}
    function create_if_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*correctAnswer*/ ctx[1] === true) return 0;
    		if (/*correctAnswer*/ ctx[1] === false) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(52:4) {#if answer !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = " ";
    			add_location(p, file$9, 66, 8, 2338);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(66:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:40) 
    function create_if_block_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	const if_block_creators = [create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*almostCorrect*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
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
    			transition_in(if_block);
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(57:40) ",
    		ctx
    	});

    	return block;
    }

    // (53:6) {#if correctAnswer === true}
    function create_if_block_1(ctx) {
    	let p;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "🎉 You are definitely ready for LeetHack, congratulations!";
    			add_location(p, file$9, 53, 8, 1859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!p_transition) p_transition = create_bidirectional_transition(p, slide, {}, true);
    					p_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, slide, {}, false);
    				p_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(53:6) {#if correctAnswer === true}",
    		ctx
    	});

    	return block;
    }

    // (60:8) {:else}
    function create_else_block(ctx) {
    	let p;
    	let p_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Unfortunately, that was not quite the answer we were looking for.\r\n            But please give it another go!";
    			add_location(p, file$9, 60, 10, 2133);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!p_transition) p_transition = create_bidirectional_transition(p, slide, {}, true);
    					p_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, slide, {}, false);
    				p_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(60:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (58:8) {#if almostCorrect}
    function create_if_block_3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "It is so close, but not quite close enough :)";
    			add_location(p, file$9, 58, 10, 2052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(58:8) {#if almostCorrect}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div1;
    	let p0;
    	let code;
    	let t1;
    	let p1;
    	let strong;
    	let t3;
    	let t4;
    	let br;
    	let t5;
    	let p2;
    	let input;
    	let t6;
    	let button;
    	let t8;
    	let div0;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showHint*/ ctx[3] && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*answer*/ ctx[0] !== undefined) return create_if_block$2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p0 = element("p");
    			code = element("code");
    			code.textContent = `${data}`;
    			t1 = space();
    			p1 = element("p");
    			strong = element("strong");
    			strong.textContent = "Hint?";
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			p2 = element("p");
    			input = element("input");
    			t6 = space();
    			button = element("button");
    			button.textContent = "Send in answer";
    			t8 = space();
    			div0 = element("div");
    			if_block1.c();
    			add_location(code, file$9, 33, 18, 1280);
    			attr_dev(p0, "class", "data svelte-5kn8tm");
    			add_location(p0, file$9, 33, 2, 1264);
    			attr_dev(strong, "title", "click me for a hint!");
    			add_location(strong, file$9, 35, 4, 1329);
    			attr_dev(p1, "class", "hint svelte-5kn8tm");
    			add_location(p1, file$9, 34, 2, 1307);
    			add_location(br, file$9, 40, 2, 1514);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "Enter you answer...");
    			attr_dev(input, "class", "svelte-5kn8tm");
    			add_location(input, file$9, 42, 4, 1554);
    			attr_dev(button, "class", "svelte-5kn8tm");
    			add_location(button, file$9, 48, 4, 1698);
    			attr_dev(p2, "class", "input-fields svelte-5kn8tm");
    			add_location(p2, file$9, 41, 2, 1524);
    			attr_dev(div0, "class", "answer svelte-5kn8tm");
    			add_location(div0, file$9, 50, 2, 1761);
    			attr_dev(div1, "class", "leethack-example svelte-5kn8tm");
    			add_location(div1, file$9, 32, 0, 1230);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, code);
    			append_dev(div1, t1);
    			append_dev(div1, p1);
    			append_dev(p1, strong);
    			append_dev(p1, t3);
    			if (if_block0) if_block0.m(p1, null);
    			append_dev(div1, t4);
    			append_dev(div1, br);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			append_dev(p2, input);
    			set_input_value(input, /*answer*/ ctx[0]);
    			append_dev(p2, t6);
    			append_dev(p2, button);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			if_block1.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(strong, "click", /*onShowHint*/ ctx[6], false, false, false),
    					listen_dev(input, "keydown", /*onAnswerChange*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(button, "click", /*onSubmit*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showHint*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(p1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*answer*/ 1 && to_number(input.value) !== /*answer*/ ctx[0]) {
    				set_input_value(input, /*answer*/ ctx[0]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const data = "1239841I239684126351|123968142asdf9184236123615213asd98§1243162351962834asdf98124391823E49123489asdf8s8213kj123312098sadleethackfasdf023409312cv23453456hgg43561337asdf999lorem1448brooklyn990987654321foey35446849984asdf984qwe98e49qw65168q4we98qw4e9849as8d49as849q8w98946632165688qw65198lol19423a3se1235www1337H4CkP4r7Ycom88866674599872221135168498765164953e849486351p65498498r7782o6984c61321k6584s!11123456789";

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LeetHackExample", slots, []);
    	let answer;
    	let correctAnswer;
    	let almostCorrect;
    	let showHint = false;

    	const onAnswerChange = () => {
    		$$invalidate(1, correctAnswer = undefined);
    		$$invalidate(2, almostCorrect = undefined);
    	};

    	const onSubmit = () => {
    		const realAnswer = data.replace(/\D/g, "").split("").map(digit => Number(digit)).reduce((acc, val) => acc + val, 0);
    		$$invalidate(1, correctAnswer = answer === realAnswer);

    		if (!correctAnswer) {
    			if (Math.abs(realAnswer - answer) < 10) {
    				$$invalidate(2, almostCorrect = true);
    			}
    		}

    		addEvent("run_example", { success: correctAnswer });
    	};

    	const onShowHint = () => {
    		$$invalidate(3, showHint = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LeetHackExample> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		answer = to_number(this.value);
    		$$invalidate(0, answer);
    	}

    	$$self.$capture_state = () => ({
    		slide,
    		ga,
    		answer,
    		correctAnswer,
    		almostCorrect,
    		showHint,
    		data,
    		onAnswerChange,
    		onSubmit,
    		onShowHint
    	});

    	$$self.$inject_state = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("correctAnswer" in $$props) $$invalidate(1, correctAnswer = $$props.correctAnswer);
    		if ("almostCorrect" in $$props) $$invalidate(2, almostCorrect = $$props.almostCorrect);
    		if ("showHint" in $$props) $$invalidate(3, showHint = $$props.showHint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		answer,
    		correctAnswer,
    		almostCorrect,
    		showHint,
    		onAnswerChange,
    		onSubmit,
    		onShowHint,
    		input_input_handler
    	];
    }

    class LeetHackExample extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeetHackExample",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\components\pages\What.svelte generated by Svelte v3.37.0 */
    const file$8 = "src\\components\\pages\\What.svelte";

    function create_fragment$8(ctx) {
    	let div2;
    	let div0;
    	let section0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let section1;
    	let h21;
    	let t7;
    	let p2;
    	let t8;
    	let s;
    	let t10;
    	let t11;
    	let div1;
    	let section2;
    	let h22;
    	let t13;
    	let p3;
    	let t15;
    	let leethackexample;
    	let current;
    	leethackexample = new LeetHackExample({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "What is LeetHack?";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "LeetHack is a programming puzzle game, by developers, for developers!\r\n        Instead of finding keys behind plants and locating clues inside of old\r\n        television sets, you find keys in data, locate clues inside of source\r\n        code and API's.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Most of us developers don't get to use our programming skills\r\n        offensively, or at least competitively, during a normal workday.\r\n        LeetHack helps to alleviate some of the worst pains of holding your\r\n        skills back!";
    			t5 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "What are you talking about?";
    			t7 = space();
    			p2 = element("p");
    			t8 = text("If you know how to create a loop, how to split a string, how to make an\r\n        if-statement you know more than enough to handle yourself in the world\r\n        of LeetHack. The game is also designed to often allow different kinds of\r\n        solutions, brute force as well as clever little algorithms. Not all\r\n        developers work in the same way and even if you are a\r\n        ");
    			s = element("s");
    			s.textContent = "scriptkiddie";
    			t10 = text(" different kind of developer, your skills may yet prove\r\n        indispensible in our little game.");
    			t11 = space();
    			div1 = element("div");
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Is there a way for me to see if I can do this?";
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "Sure, how about a little example? If you can sum up all the digits in\r\n        the following data-dump and enter the number below, you qualify to\r\n        participate in LeetHack:";
    			t15 = space();
    			create_component(leethackexample.$$.fragment);
    			attr_dev(h20, "class", "svelte-1rqbdzh");
    			add_location(h20, file$8, 6, 6, 174);
    			attr_dev(p0, "class", "svelte-1rqbdzh");
    			add_location(p0, file$8, 7, 6, 208);
    			attr_dev(p1, "class", "svelte-1rqbdzh");
    			add_location(p1, file$8, 13, 6, 494);
    			add_location(section0, file$8, 5, 4, 157);
    			attr_dev(h21, "class", "svelte-1rqbdzh");
    			add_location(h21, file$8, 21, 6, 792);
    			add_location(s, file$8, 28, 8, 1232);
    			attr_dev(p2, "class", "svelte-1rqbdzh");
    			add_location(p2, file$8, 22, 6, 836);
    			add_location(section1, file$8, 20, 4, 775);
    			attr_dev(div0, "class", "card svelte-1rqbdzh");
    			add_location(div0, file$8, 4, 2, 133);
    			attr_dev(h22, "class", "svelte-1rqbdzh");
    			add_location(h22, file$8, 35, 6, 1432);
    			attr_dev(p3, "class", "svelte-1rqbdzh");
    			add_location(p3, file$8, 36, 6, 1495);
    			add_location(section2, file$8, 34, 4, 1415);
    			attr_dev(div1, "class", "card svelte-1rqbdzh");
    			add_location(div1, file$8, 33, 2, 1391);
    			attr_dev(div2, "class", "wrapper svelte-1rqbdzh");
    			attr_dev(div2, "id", "what");
    			add_location(div2, file$8, 3, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, section0);
    			append_dev(section0, h20);
    			append_dev(section0, t1);
    			append_dev(section0, p0);
    			append_dev(section0, t3);
    			append_dev(section0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, section1);
    			append_dev(section1, h21);
    			append_dev(section1, t7);
    			append_dev(section1, p2);
    			append_dev(p2, t8);
    			append_dev(p2, s);
    			append_dev(p2, t10);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div1, section2);
    			append_dev(section2, h22);
    			append_dev(section2, t13);
    			append_dev(section2, p3);
    			append_dev(section2, t15);
    			mount_component(leethackexample, section2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leethackexample.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leethackexample.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(leethackexample);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("What", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<What> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LeetHackExample });
    	return [];
    }

    class What extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "What",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\common\Splash.svelte generated by Svelte v3.37.0 */

    const file$7 = "src\\components\\common\\Splash.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "splash svelte-17by2tg");
    			set_style(div, "background-color", /*backgroundColor*/ ctx[0]);
    			attr_dev(div, "id", /*anchor*/ ctx[1]);
    			add_location(div, file$7, 4, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*backgroundColor*/ 1) {
    				set_style(div, "background-color", /*backgroundColor*/ ctx[0]);
    			}

    			if (!current || dirty & /*anchor*/ 2) {
    				attr_dev(div, "id", /*anchor*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Splash", slots, ['default']);
    	let { backgroundColor = "" } = $$props;
    	let { anchor = "" } = $$props;
    	const writable_props = ["backgroundColor", "anchor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Splash> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("backgroundColor" in $$props) $$invalidate(0, backgroundColor = $$props.backgroundColor);
    		if ("anchor" in $$props) $$invalidate(1, anchor = $$props.anchor);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ backgroundColor, anchor });

    	$$self.$inject_state = $$props => {
    		if ("backgroundColor" in $$props) $$invalidate(0, backgroundColor = $$props.backgroundColor);
    		if ("anchor" in $$props) $$invalidate(1, anchor = $$props.anchor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [backgroundColor, anchor, $$scope, slots];
    }

    class Splash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { backgroundColor: 0, anchor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splash",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get backgroundColor() {
    		throw new Error("<Splash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Splash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchor() {
    		throw new Error("<Splash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchor(value) {
    		throw new Error("<Splash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\pages\Home.svelte generated by Svelte v3.37.0 */
    const file$6 = "src\\components\\pages\\Home.svelte";

    // (26:4) {#if show}
    function create_if_block$1(ctx) {
    	let h1;
    	let h1_transition;
    	let t1;
    	let div;
    	let t2;
    	let p0;
    	let p0_transition;
    	let t4;
    	let p1;
    	let strong;
    	let t6;
    	let t7_value = /*getEventText*/ ctx[1]() + "";
    	let t7;
    	let p1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "LeetHack";
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Challenge yourself, polyglotical mayhem!";
    			t4 = space();
    			p1 = element("p");
    			strong = element("strong");
    			strong.textContent = "Next event:";
    			t6 = space();
    			t7 = text(t7_value);
    			attr_dev(h1, "class", "svelte-1d5i5zn");
    			add_location(h1, file$6, 26, 6, 755);
    			attr_dev(div, "class", "overlay background-image svelte-1d5i5zn");
    			add_location(div, file$6, 27, 6, 817);
    			attr_dev(p0, "class", "tagline svelte-1d5i5zn");
    			add_location(p0, file$6, 28, 6, 865);
    			add_location(strong, file$6, 32, 8, 1081);
    			attr_dev(p1, "class", "promo svelte-1d5i5zn");
    			add_location(p1, file$6, 31, 6, 1004);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, strong);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fade, { duration: 2000 }, true);
    				h1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!p0_transition) p0_transition = create_bidirectional_transition(p0, fade, { duration: 1000, delay: 2000 }, true);
    				p0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!p1_transition) p1_transition = create_bidirectional_transition(p1, fade, { duration: 1000, delay: 1000 }, true);
    				p1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fade, { duration: 2000 }, false);
    			h1_transition.run(0);
    			if (!p0_transition) p0_transition = create_bidirectional_transition(p0, fade, { duration: 1000, delay: 2000 }, false);
    			p0_transition.run(0);
    			if (!p1_transition) p1_transition = create_bidirectional_transition(p1, fade, { duration: 1000, delay: 1000 }, false);
    			p1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_transition) h1_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p0);
    			if (detaching && p0_transition) p0_transition.end();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			if (detaching && p1_transition) p1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(26:4) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Splash backgroundColor="#eaeaea">
    function create_default_slot$1(ctx) {
    	let div;
    	let current;
    	let if_block = /*show*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "background background-image svelte-1d5i5zn");
    			add_location(div, file$6, 24, 2, 690);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(24:0) <Splash backgroundColor=\\\"#eaeaea\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let splash;
    	let current;

    	splash = new Splash({
    			props: {
    				backgroundColor: "#eaeaea",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(splash.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(splash, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const splash_changes = {};

    			if (dirty & /*$$scope, show*/ 9) {
    				splash_changes.$$scope = { dirty, ctx };
    			}

    			splash.$set(splash_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splash.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splash.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(splash, detaching);
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
    	validate_slots("Home", slots, []);
    	let show = false;

    	let nextEvent = {
    		date: new Date(2021, 4, 15),
    		text: "Global Development Event!"
    	};

    	const getEventText = () => {
    		const now = new Date();
    		const { date, text } = nextEvent;
    		now.getTime() - date.getTime();
    		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDay() + 1).toString().padStart(2, "0")} ${text}`;
    	};

    	onMount(() => {
    		$$invalidate(0, show = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Splash,
    		fade,
    		onMount,
    		show,
    		nextEvent,
    		getEventText
    	});

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("nextEvent" in $$props) nextEvent = $$props.nextEvent;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, getEventText];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\common\PortraitImage.svelte generated by Svelte v3.37.0 */

    const file$5 = "src\\components\\common\\PortraitImage.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let span;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			img = element("img");
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			attr_dev(img, "class", "svelte-u29cw");
    			add_location(img, file$5, 6, 4, 134);
    			attr_dev(span, "class", "portrait-image svelte-u29cw");
    			add_location(span, file$5, 5, 2, 99);
    			attr_dev(div, "class", "portrait-wrapper svelte-u29cw");
    			add_location(div, file$5, 4, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 1 && img.src !== (img_src_value = /*src*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PortraitImage", slots, []);
    	let { src } = $$props;
    	let { alt } = $$props;
    	const writable_props = ["src", "alt"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PortraitImage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    	};

    	$$self.$capture_state = () => ({ src, alt });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, alt];
    }

    class PortraitImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { src: 0, alt: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PortraitImage",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<PortraitImage> was created without expected prop 'src'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !("alt" in props)) {
    			console.warn("<PortraitImage> was created without expected prop 'alt'");
    		}
    	}

    	get src() {
    		throw new Error("<PortraitImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<PortraitImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<PortraitImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<PortraitImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\common\Crew.svelte generated by Svelte v3.37.0 */
    const file$4 = "src\\components\\common\\Crew.svelte";

    function create_fragment$4(ctx) {
    	let article;
    	let portraitimage;
    	let t0;
    	let section;
    	let h2;
    	let t1;
    	let t2;
    	let span;
    	let current;

    	portraitimage = new PortraitImage({
    			props: {
    				src: /*image*/ ctx[0],
    				alt: /*title*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			article = element("article");
    			create_component(portraitimage.$$.fragment);
    			t0 = space();
    			section = element("section");
    			h2 = element("h2");
    			t1 = text(/*title*/ ctx[1]);
    			t2 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(h2, "class", "svelte-rxaugy");
    			add_location(h2, file$4, 8, 4, 195);
    			attr_dev(span, "class", "svelte-rxaugy");
    			add_location(span, file$4, 9, 4, 217);
    			attr_dev(section, "class", "svelte-rxaugy");
    			add_location(section, file$4, 7, 2, 180);
    			attr_dev(article, "class", "svelte-rxaugy");
    			add_location(article, file$4, 5, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			mount_component(portraitimage, article, null);
    			append_dev(article, t0);
    			append_dev(article, section);
    			append_dev(section, h2);
    			append_dev(h2, t1);
    			append_dev(section, t2);
    			append_dev(section, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const portraitimage_changes = {};
    			if (dirty & /*image*/ 1) portraitimage_changes.src = /*image*/ ctx[0];
    			if (dirty & /*title*/ 2) portraitimage_changes.alt = /*title*/ ctx[1];
    			portraitimage.$set(portraitimage_changes);
    			if (!current || dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(portraitimage.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(portraitimage.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_component(portraitimage);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots("Crew", slots, ['default']);
    	let { image } = $$props;
    	let { title } = $$props;
    	const writable_props = ["image", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Crew> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ PortraitImage, image, title });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, title, $$scope, slots];
    }

    class Crew extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { image: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crew",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[0] === undefined && !("image" in props)) {
    			console.warn("<Crew> was created without expected prop 'image'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Crew> was created without expected prop 'title'");
    		}
    	}

    	get image() {
    		throw new Error("<Crew>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Crew>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Crew>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Crew>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\pages\Who.svelte generated by Svelte v3.37.0 */
    const file$3 = "src\\components\\pages\\Who.svelte";

    // (14:4) <Crew image="/images/otto.png" title="Otto Remse">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("The LeetHack Azure/Backend guru. A dot net architect who has been with the\r\n      project since day one. Enjoys growing chilis and FPS.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(14:4) <Crew image=\\\"/images/otto.png\\\" title=\\\"Otto Remse\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:4) <Crew image="/images/brassman.png" title="Mikael Brassman">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("The resident designer and frontend developer. Map maker, special effects\r\n      master and part of the crew since early days. Also a game developer and\r\n      Switch lord.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(18:4) <Crew image=\\\"/images/brassman.png\\\" title=\\\"Mikael Brassman\\\">",
    		ctx
    	});

    	return block;
    }

    // (23:4) <Crew image="/images/ferm.png" title="Magnus Ferm">
    function create_default_slot(ctx) {
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("Frontend developer and general pellejöns. Responsible for a large portion\r\n      of rooms and has been with the project from the start. The teams biggest\r\n      ");
    			a = element("a");
    			a.textContent = "Malmö FF";
    			t2 = text(" supporter!");
    			attr_dev(a, "href", "http://www.mff.se");
    			attr_dev(a, "title", "Oh we love Malmö FF, oh we love our team. Beneath heavenly blue skies, we become stronger and better for every day that passes...");
    			attr_dev(a, "class", "svelte-c5wrmz");
    			add_location(a, file$3, 25, 6, 998);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(23:4) <Crew image=\\\"/images/ferm.png\\\" title=\\\"Magnus Ferm\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h2;
    	let t2;
    	let crew0;
    	let t3;
    	let crew1;
    	let t4;
    	let crew2;
    	let current;

    	crew0 = new Crew({
    			props: {
    				image: "/images/otto.png",
    				title: "Otto Remse",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	crew1 = new Crew({
    			props: {
    				image: "/images/brassman.png",
    				title: "Mikael Brassman",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	crew2 = new Crew({
    			props: {
    				image: "/images/ferm.png",
    				title: "Magnus Ferm",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "The LeetHack Crew";
    			t2 = space();
    			create_component(crew0.$$.fragment);
    			t3 = space();
    			create_component(crew1.$$.fragment);
    			t4 = space();
    			create_component(crew2.$$.fragment);
    			if (img.src !== (img_src_value = "/images/crew_portrait_artsy.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "us svelte-c5wrmz");
    			attr_dev(img, "alt", "The LeetHack Crew");
    			add_location(img, file$3, 5, 4, 132);
    			attr_dev(div0, "class", "left svelte-c5wrmz");
    			add_location(div0, file$3, 4, 2, 108);
    			attr_dev(h2, "class", "svelte-c5wrmz");
    			add_location(h2, file$3, 12, 4, 277);
    			attr_dev(div1, "class", "right svelte-c5wrmz");
    			add_location(div1, file$3, 11, 2, 252);
    			attr_dev(div2, "class", "wrapper svelte-c5wrmz");
    			attr_dev(div2, "id", "who");
    			add_location(div2, file$3, 3, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			mount_component(crew0, div1, null);
    			append_dev(div1, t3);
    			mount_component(crew1, div1, null);
    			append_dev(div1, t4);
    			mount_component(crew2, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const crew0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				crew0_changes.$$scope = { dirty, ctx };
    			}

    			crew0.$set(crew0_changes);
    			const crew1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				crew1_changes.$$scope = { dirty, ctx };
    			}

    			crew1.$set(crew1_changes);
    			const crew2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				crew2_changes.$$scope = { dirty, ctx };
    			}

    			crew2.$set(crew2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crew0.$$.fragment, local);
    			transition_in(crew1.$$.fragment, local);
    			transition_in(crew2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crew0.$$.fragment, local);
    			transition_out(crew1.$$.fragment, local);
    			transition_out(crew2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(crew0);
    			destroy_component(crew1);
    			destroy_component(crew2);
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
    	validate_slots("Who", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Who> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Crew });
    	return [];
    }

    class Who extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Who",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\common\Footer.svelte generated by Svelte v3.37.0 */

    const file$2 = "src\\components\\common\\Footer.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let h2;
    	let t1;
    	let p;
    	let t2;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let br;
    	let t7;
    	let a2;
    	let t9;
    	let a3;
    	let t11;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			h2 = element("h2");
    			h2.textContent = "Le Grande Footer Extréme";
    			t1 = space();
    			p = element("p");
    			t2 = text("You want to get in contact with us? You can either tweet our account (");
    			a0 = element("a");
    			a0.textContent = "LeetHackParty";
    			t4 = text(") or just use the\r\n    ");
    			a1 = element("a");
    			a1.textContent = "#leethack";
    			t6 = text(" hashtag!\r\n    ");
    			br = element("br");
    			t7 = text("\r\n    If you are interested in using LeetHack as a bizarr team building excercise at\r\n    work, don't hesitate to contact us either via\r\n    ");
    			a2 = element("a");
    			a2.textContent = "Twitter";
    			t9 = text("\r\n    or ");
    			a3 = element("a");
    			a3.textContent = "email";
    			t11 = text(".");
    			attr_dev(h2, "class", "svelte-1lgwm3s");
    			add_location(h2, file$2, 3, 2, 43);
    			attr_dev(a0, "href", "https://twitter.com/leethackparty");
    			attr_dev(a0, "class", "svelte-1lgwm3s");
    			add_location(a0, file$2, 5, 74, 159);
    			attr_dev(a1, "href", "https://twitter.com/search?q=%23leethack");
    			attr_dev(a1, "class", "svelte-1lgwm3s");
    			add_location(a1, file$2, 8, 4, 256);
    			add_location(br, file$2, 9, 4, 335);
    			attr_dev(a2, "href", "https://twitter.com/leethackparty");
    			attr_dev(a2, "class", "svelte-1lgwm3s");
    			add_location(a2, file$2, 12, 4, 482);
    			attr_dev(a3, "href", "mailto:leethack@tretton37.com");
    			attr_dev(a3, "class", "svelte-1lgwm3s");
    			add_location(a3, file$2, 13, 7, 546);
    			attr_dev(p, "class", "svelte-1lgwm3s");
    			add_location(p, file$2, 4, 2, 80);
    			attr_dev(footer, "class", "svelte-1lgwm3s");
    			add_location(footer, file$2, 2, 0, 31);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h2);
    			append_dev(footer, t1);
    			append_dev(footer, p);
    			append_dev(p, t2);
    			append_dev(p, a0);
    			append_dev(p, t4);
    			append_dev(p, a1);
    			append_dev(p, t6);
    			append_dev(p, br);
    			append_dev(p, t7);
    			append_dev(p, a2);
    			append_dev(p, t9);
    			append_dev(p, a3);
    			append_dev(p, t11);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\common\NextButton.svelte generated by Svelte v3.37.0 */

    const { window: window_1 } = globals;
    const file$1 = "src\\components\\common\\NextButton.svelte";

    // (34:0) {#if mounted}
    function create_if_block(ctx) {
    	let p;
    	let span;
    	let strong;
    	let p_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span = element("span");
    			strong = element("strong");
    			strong.textContent = ">";
    			add_location(strong, file$1, 39, 35, 1055);
    			add_location(span, file$1, 39, 4, 1024);
    			attr_dev(p, "class", "next-button svelte-19nihcj");
    			toggle_class(p, "pointUp", /*pointUp*/ ctx[1]);
    			add_location(p, file$1, 34, 2, 912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span);
    			append_dev(span, strong);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*handleOnClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pointUp*/ 2) {
    				toggle_class(p, "pointUp", /*pointUp*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, fade, { duration: 2000, delay: 1000 }, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, fade, { duration: 2000, delay: 1000 }, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:0) {#if mounted}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*mounted*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "scroll", /*onScroll*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*mounted*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*mounted*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	validate_slots("NextButton", slots, []);
    	let anchors = ["what", "who"];
    	let mounted = false;
    	let pointUp = false;
    	let lastElement;

    	const handleOnClick = () => {
    		for (let anchor of anchors) {
    			const element = document.getElementById(anchor);
    			const elementTop = element.offsetTop;

    			if (elementTop > window.scrollY) {
    				location.href = `#${anchor}`;
    				return;
    			}
    		}

    		location.href = "#";
    	};

    	onMount(() => {
    		$$invalidate(0, mounted = true);
    		lastElement = document.getElementById(anchors[anchors.length - 1]);
    		onScroll();
    	});

    	const onScroll = () => {
    		const lastTop = lastElement.getBoundingClientRect().top + window.pageYOffset;

    		if (window.pageYOffset >= lastTop) {
    			$$invalidate(1, pointUp = true);
    		} else {
    			$$invalidate(1, pointUp = false);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NextButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		anchors,
    		mounted,
    		pointUp,
    		lastElement,
    		handleOnClick,
    		onScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("anchors" in $$props) anchors = $$props.anchors;
    		if ("mounted" in $$props) $$invalidate(0, mounted = $$props.mounted);
    		if ("pointUp" in $$props) $$invalidate(1, pointUp = $$props.pointUp);
    		if ("lastElement" in $$props) lastElement = $$props.lastElement;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mounted, pointUp, handleOnClick, onScroll];
    }

    class NextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextButton",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let googleanalytics;
    	let t0;
    	let main;
    	let home;
    	let t1;
    	let what;
    	let t2;
    	let who;
    	let t3;
    	let footer;
    	let t4;
    	let nextbutton;
    	let current;

    	googleanalytics = new GoogleAnalytics({
    			props: { properties: ["G-W14NYZZ98Z"] },
    			$$inline: true
    		});

    	home = new Home({ $$inline: true });
    	what = new What({ $$inline: true });
    	who = new Who({ $$inline: true });
    	footer = new Footer({ $$inline: true });
    	nextbutton = new NextButton({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(googleanalytics.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(home.$$.fragment);
    			t1 = space();
    			create_component(what.$$.fragment);
    			t2 = space();
    			create_component(who.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			t4 = space();
    			create_component(nextbutton.$$.fragment);
    			attr_dev(main, "class", "svelte-n4n0e4");
    			add_location(main, file, 9, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(googleanalytics, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(home, main, null);
    			append_dev(main, t1);
    			mount_component(what, main, null);
    			append_dev(main, t2);
    			mount_component(who, main, null);
    			append_dev(main, t3);
    			mount_component(footer, main, null);
    			append_dev(main, t4);
    			mount_component(nextbutton, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(googleanalytics.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			transition_in(what.$$.fragment, local);
    			transition_in(who.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			transition_in(nextbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(googleanalytics.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			transition_out(what.$$.fragment, local);
    			transition_out(who.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			transition_out(nextbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(googleanalytics, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(home);
    			destroy_component(what);
    			destroy_component(who);
    			destroy_component(footer);
    			destroy_component(nextbutton);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		What,
    		Home,
    		Who,
    		Footer,
    		NextButton,
    		GoogleAnalytics
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
