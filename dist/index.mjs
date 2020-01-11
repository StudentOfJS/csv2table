function noop() { }
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

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
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
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}

let current_component;
function set_current_component(component) {
    current_component = component;
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
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
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
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
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
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
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
    $set() {
        // overridden by instance, if it has props
    }
}

/* src/BasicTable.svelte generated by Svelte v3.16.7 */

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	child_ctx[16] = i;
	return child_ctx;
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	child_ctx[13] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	child_ctx[18] = i;
	return child_ctx;
}

// (21:2) {#if header}
function create_if_block_1(ctx) {
	let thead;
	let tr;
	let each_value_2 = /*header*/ ctx[3];
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			thead = element("thead");
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, thead, anchor);
			append(thead, tr);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*header*/ 8) {
				each_value_2 = /*header*/ ctx[3];
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}
		},
		d(detaching) {
			if (detaching) detach(thead);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (24:8) {#each header as column, i}
function create_each_block_2(ctx) {
	let th;
	let t_value = /*column*/ ctx[14] + "";
	let t;
	let th_key_value;

	return {
		c() {
			th = element("th");
			t = text(t_value);
			attr(th, "key", th_key_value = `table-col-${/*i*/ ctx[18]}`);
		},
		m(target, anchor) {
			insert(target, th, anchor);
			append(th, t);
		},
		p(ctx, dirty) {
			if (dirty & /*header*/ 8 && t_value !== (t_value = /*column*/ ctx[14] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(th);
		}
	};
}

// (30:2) {#if body}
function create_if_block(ctx) {
	let tbody;
	let each_value = /*body*/ ctx[4];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},
		m(target, anchor) {
			insert(target, tbody, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*tableRowClass, body, tableColumnClass*/ 22) {
				each_value = /*body*/ ctx[4];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) detach(tbody);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (34:10) {#each row as column, colI}
function create_each_block_1(ctx) {
	let td;
	let t_value = /*column*/ ctx[14] + "";
	let t;
	let td_key_value;

	return {
		c() {
			td = element("td");
			t = text(t_value);
			attr(td, "class", /*tableColumnClass*/ ctx[2]);
			attr(td, "key", td_key_value = `${/*column*/ ctx[14]}-${/*colI*/ ctx[16]}-'${/*rowI*/ ctx[13]}`);
		},
		m(target, anchor) {
			insert(target, td, anchor);
			append(td, t);
		},
		p(ctx, dirty) {
			if (dirty & /*body*/ 16 && t_value !== (t_value = /*column*/ ctx[14] + "")) set_data(t, t_value);

			if (dirty & /*tableColumnClass*/ 4) {
				attr(td, "class", /*tableColumnClass*/ ctx[2]);
			}

			if (dirty & /*body*/ 16 && td_key_value !== (td_key_value = `${/*column*/ ctx[14]}-${/*colI*/ ctx[16]}-'${/*rowI*/ ctx[13]}`)) {
				attr(td, "key", td_key_value);
			}
		},
		d(detaching) {
			if (detaching) detach(td);
		}
	};
}

// (32:6) {#each body as row, rowI}
function create_each_block(ctx) {
	let tr;
	let t;
	let tr_key_value;
	let each_value_1 = /*row*/ ctx[11];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			tr = element("tr");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			attr(tr, "class", /*tableRowClass*/ ctx[1]);
			attr(tr, "key", tr_key_value = `${/*row*/ ctx[11] ? /*row*/ ctx[11] : "row"}-${/*rowI*/ ctx[13]}`);
		},
		m(target, anchor) {
			insert(target, tr, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			append(tr, t);
		},
		p(ctx, dirty) {
			if (dirty & /*tableColumnClass, body*/ 20) {
				each_value_1 = /*row*/ ctx[11];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty & /*tableRowClass*/ 2) {
				attr(tr, "class", /*tableRowClass*/ ctx[1]);
			}

			if (dirty & /*body*/ 16 && tr_key_value !== (tr_key_value = `${/*row*/ ctx[11] ? /*row*/ ctx[11] : "row"}-${/*rowI*/ ctx[13]}`)) {
				attr(tr, "key", tr_key_value);
			}
		},
		d(detaching) {
			if (detaching) detach(tr);
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment(ctx) {
	let table_1;
	let t;
	let if_block0 = /*header*/ ctx[3] && create_if_block_1(ctx);
	let if_block1 = /*body*/ ctx[4] && create_if_block(ctx);

	return {
		c() {
			table_1 = element("table");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(table_1, "class", /*tableClass*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, table_1, anchor);
			if (if_block0) if_block0.m(table_1, null);
			append(table_1, t);
			if (if_block1) if_block1.m(table_1, null);
		},
		p(ctx, [dirty]) {
			if (/*header*/ ctx[3]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1(ctx);
					if_block0.c();
					if_block0.m(table_1, t);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*body*/ ctx[4]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block(ctx);
					if_block1.c();
					if_block1.m(table_1, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*tableClass*/ 1) {
				attr(table_1, "class", /*tableClass*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(table_1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { csv } = $$props;
	let { csvRowDelimiter = "\n" } = $$props;
	let { csvColumnDelimiter = "\t" } = $$props;
	let { hasHeader = true } = $$props;
	let { tableClass = "" } = $$props;
	let { tableRowClass = "" } = $$props;
	let { tableColumnClass = "" } = $$props;

	$$self.$set = $$props => {
		if ("csv" in $$props) $$invalidate(5, csv = $$props.csv);
		if ("csvRowDelimiter" in $$props) $$invalidate(6, csvRowDelimiter = $$props.csvRowDelimiter);
		if ("csvColumnDelimiter" in $$props) $$invalidate(7, csvColumnDelimiter = $$props.csvColumnDelimiter);
		if ("hasHeader" in $$props) $$invalidate(8, hasHeader = $$props.hasHeader);
		if ("tableClass" in $$props) $$invalidate(0, tableClass = $$props.tableClass);
		if ("tableRowClass" in $$props) $$invalidate(1, tableRowClass = $$props.tableRowClass);
		if ("tableColumnClass" in $$props) $$invalidate(2, tableColumnClass = $$props.tableColumnClass);
	};

	let rows;
	let table;
	let header;
	let body;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*csv, csvRowDelimiter*/ 96) {
			 $$invalidate(9, rows = csv ? csv.split(csvRowDelimiter) : null);
		}

		if ($$self.$$.dirty & /*rows, csvColumnDelimiter*/ 640) {
			 $$invalidate(10, table = rows
			? rows.map((row, i) => row.split(csvColumnDelimiter))
			: []);
		}

		if ($$self.$$.dirty & /*hasHeader, table*/ 1280) {
			 $$invalidate(3, header = hasHeader && table && table.length ? table[0] : null);
		}

		if ($$self.$$.dirty & /*table, hasHeader*/ 1280) {
			 $$invalidate(4, body = table && table.length
			? hasHeader ? table.slice(1, table.length) : table
			: null);
		}
	};

	return [
		tableClass,
		tableRowClass,
		tableColumnClass,
		header,
		body,
		csv,
		csvRowDelimiter,
		csvColumnDelimiter,
		hasHeader
	];
}

class BasicTable extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			csv: 5,
			csvRowDelimiter: 6,
			csvColumnDelimiter: 7,
			hasHeader: 8,
			tableClass: 0,
			tableRowClass: 1,
			tableColumnClass: 2
		});
	}
}

export { BasicTable };
