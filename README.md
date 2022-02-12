# pomodoro-timer
Timer to stay focused on studying and maximize productivity

This project makes use of Parcel and Netlify's Continuous Deployment
Maybe this is like using a rocket launcher to kill flies considering it's a very simple project but it's a start.

The architectural pattern I used for this project is called **spaguetti** 😔👌

Anyways, that's not the point, I was just trying to use CI with Netlify and Bundling with Parcel so I started coding right away without much planning.

## What did I learn from this project?
### `z-index` and `opacity`
I ran into a situation where changing the opacity of an element with a `z-index` applied to any value other than 0 resulted in something very confusing.
The element just disappeared with any value other than 0 for `opacity` when `z-index` was set.
It turns out the `z-index` has priority over `opacity`.
The actual reason is a bit more complex than that, it has to do with stacking contexts:
> If an element with opacity less than 1 is not positioned, implementations must paint the layer it creates, within its parent stacking context, at the same stacking order that would be used if it were a positioned element with ‘z-index: 0’ and ‘opacity: 1’.

Anyways, long story short, the solution was to position the parent element `position: relative;` 


`z-index` behaves counter-intuitively when there's no proper understanding of stacking contexts.

Some situations trigger the creation of a new stacking context, such as:
- Any element that has a position other than static and a z-index
other than auto
- Any element with an opacity less than 1
- Any element that is a child of a flex or grid container and a z-index
other than auto

### DOM reflow
I learned to reset animations forcing a synchronous layout computing.

This is useful when you need to reset animations.

There's a couple of things that force a reflow, such as: https://gist.github.com/paulirish/5d52fb081b3570c81e3a

Animation reset example:
```js
const element = document.getElementById("element");
element.classList.remove("animate");
void element.offsetWidth; // trigger a DOM reflow
element.classList.add("animate");
```
This instructs the browser to recalculate an element’s width, thus causing a reflow in the DOM. The reflow event triggers the animation to run from the start.

This may have performance implications, so the basic advice is to try to use this "trick" as infrequently as possible.
