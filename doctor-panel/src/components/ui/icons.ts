import { defineComponent, h } from 'vue'

const base = {
  props: {
    size:   { type: Number,  default: 20 },
    color:  { type: String,  default: 'currentColor' },
    stroke: { type: Number,  default: 1.7 },
  },
}

function svg(props: any, children: any[]) {
  return h('svg', {
    width: props.size, height: props.size,
    viewBox: '0 0 24 24', fill: 'none',
    stroke: props.color,
    'stroke-width': props.stroke,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    style: { flexShrink: 0 },
  }, children)
}

export const IDash = defineComponent({ ...base, render() { return svg(this, [h('rect',{x:'3',y:'3',width:'8',height:'10',rx:'2'}),h('rect',{x:'13',y:'3',width:'8',height:'6',rx:'2'}),h('rect',{x:'13',y:'11',width:'8',height:'10',rx:'2'}),h('rect',{x:'3',y:'15',width:'8',height:'6',rx:'2'})]) } })
export const ICal  = defineComponent({ ...base, render() { return svg(this, [h('rect',{x:'3',y:'5',width:'18',height:'16',rx:'3'}),h('path',{d:'M3 10h18M8 3v4M16 3v4'})]) } })
export const IUsers= defineComponent({ ...base, render() { return svg(this, [h('circle',{cx:'9',cy:'8',r:'3.5'}),h('path',{d:'M3 20c0-3 2.5-5 6-5s6 2 6 5'}),h('circle',{cx:'17',cy:'8',r:'2.5'}),h('path',{d:'M21 18c0-2-1.5-3.5-4-3.5'})]) } })
export const IDoc  = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'}),h('path',{d:'M14 3v4h4M8 13h8M8 17h5'})]) } })
export const ICash = defineComponent({ ...base, render() { return svg(this, [h('rect',{x:'3',y:'7',width:'18',height:'10',rx:'2'}),h('circle',{cx:'12',cy:'12',r:'2'})]) } })
export const ISet  = defineComponent({ ...base, render() { return svg(this, [h('circle',{cx:'12',cy:'12',r:'3'}),h('path',{d:'M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9c.6.5 1.3.9 2 1.2L10 21h4l.5-2.5c.7-.3 1.4-.7 2-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z'})]) } })
export const ISearch=defineComponent({ ...base, render() { return svg(this, [h('circle',{cx:'11',cy:'11',r:'7'}),h('path',{d:'M21 21l-4.5-4.5'})]) } })
export const IBell = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z'}),h('path',{d:'M10 20a2 2 0 0 0 4 0'})]) } })
export const IPlus = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M12 5v14M5 12h14'})]) } })
export const IList = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M4 6h16M4 12h16M4 18h16'})]) } })
export const IGrid = defineComponent({ ...base, render() { return svg(this, [h('rect',{x:'3',y:'3',width:'7',height:'7',rx:'1.5'}),h('rect',{x:'14',y:'3',width:'7',height:'7',rx:'1.5'}),h('rect',{x:'3',y:'14',width:'7',height:'7',rx:'1.5'}),h('rect',{x:'14',y:'14',width:'7',height:'7',rx:'1.5'})]) } })
export const IChevR= defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M9 5l7 7-7 7'})]) } })
export const IChevL= defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M15 5l-7 7 7 7'})]) } })
export const IClock= defineComponent({ ...base, render() { return svg(this, [h('circle',{cx:'12',cy:'12',r:'9'}),h('path',{d:'M12 7v5l3 2'})]) } })
export const IPhone= defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'})]) } })
export const ICheck= defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M4 12l5 5L20 6'})]) } })
export const IX    = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M6 6l12 12M18 6L6 18'})]) } })
export const IEdit = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M4 20h4l10-10-4-4L4 16z'})]) } })
export const IUp   = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M7 17l10-10M7 7h10v10'})]) } })
export const IDown = defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M7 7l10 10M17 7v10H7'})]) } })
export const IGraph= defineComponent({ ...base, render() { return svg(this, [h('path',{d:'M3 17l6-6 4 4 8-8M17 7h4v4'})]) } })
export const IAlert= defineComponent({ ...base, render() { return svg(this, [h('circle',{cx:'12',cy:'12',r:'10'}),h('path',{d:'M12 8v4M12 16h.01'})]) } })
