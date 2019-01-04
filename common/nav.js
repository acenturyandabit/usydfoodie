//v1.2

navstack = {
    stack: [".title"],
    events: {},
    on: function (e, f) {
        if (!navstack.events[e]) navstack.events[e] = [];
        navstack.events[e].push(f);
    },
    fire: function (e, args) {
        if (navstack.events[e]) navstack.events[e].forEach(element => {
            element(args);
        });
    }
};
$(() => {
    window.history.pushState({}, '');
})

function transitionTo(next) {
    let args = {
        prev: navstack.stack[navstack.stack.length - 1],
        dest: next,
        cancel: () => {
            args._cancel = true;
        },
        _cancel: false
    };
    if (!next) {
        args.dest = navstack.stack[navstack.stack.length - 1];
    } else {
        args.dest = next;
    }
    navstack.fire('transition', args);
    if (!args._cancel) {
        if (!next) {
            window.history.pushState({}, '');
            $(navstack.stack[navstack.stack.length - 1]).addClass('hidden');
            navstack.stack.pop();
            $(navstack.stack[navstack.stack.length - 1]).removeClass('hidden');
            $(navstack.stack[navstack.stack.length - 1]).show();
        } else {
            $(navstack.stack[navstack.stack.length - 1]).addClass('hidden');
            navstack.stack.push(next);
            $(navstack.stack[navstack.stack.length - 1]).removeClass('hidden');
            $(navstack.stack[navstack.stack.length - 1]).show();
        }
    }
}
window.addEventListener('popstate', function () {
    transitionTo();
})

/*changelog:
1.2 Now with cancelable navigation.
*/